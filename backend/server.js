const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Middleware de vérification du rôle admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
};

// Route d'inscription
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ 
                            message: 'Nom d\'utilisateur ou email déjà utilisé' 
                        });
                    }
                    return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
                }

                const token = jwt.sign(
                    { id: this.lastID, username, role: 'user' },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    message: 'Inscription réussie',
                    token,
                    user: { id: this.lastID, username, role: 'user' }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

// Route protégée exemple
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Route admin exemple
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
        }
        res.json(users);
    });
});

// Route admin pour supprimer un utilisateur
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur est un admin
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la vérification du rôle' });
        }
        if (user && user.role === 'admin') {
            return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
        }

        // Supprimer l'utilisateur
        db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
            }
            res.json({ message: 'Utilisateur supprimé avec succès' });
        });
    });
});

// Route admin pour mettre à jour le rôle d'un utilisateur
app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
            }
            res.json({ message: 'Rôle mis à jour avec succès' });
        }
    );
});

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API Cinitech Movies est en ligne!' });
});

// Route pour ajouter un film aux favoris
app.post('/api/favorites', authenticateToken, (req, res) => {
    const { movie_id } = req.body;
    const user_id = req.user.id;

    if (!movie_id) {
        return res.status(400).json({ message: 'L\'ID du film est requis' });
    }

    db.run(
        'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
        [user_id, movie_id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Ce film est déjà dans vos favoris' });
                }
                return res.status(500).json({ message: 'Erreur lors de l\'ajout aux favoris' });
            }
            res.status(201).json({ message: 'Film ajouté aux favoris' });
        }
    );
});

app.delete('/api/favorites/:movieId', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;

    db.run(
        'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la suppression des favoris' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Film non trouvé dans les favoris' });
            }
            res.json({ message: 'Film retiré des favoris' });
        }
    );
});

app.get('/api/favorites', authenticateToken, (req, res) => {
    const user_id = req.user.id;

    db.all(
        'SELECT movie_id FROM favorites WHERE user_id = ?',
        [user_id],
        (err, favorites) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la récupération des favoris' });
            }
            res.json(favorites.map(fav => fav.movie_id));
        }
    );
});

// Routes pour les reviews
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { movie_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
    }

    db.run(
        'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, movie_id, rating, comment],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Vous avez déjà donné votre avis sur ce film' });
                }
                return res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'avis' });
            }
            res.status(201).json({ message: 'Avis ajouté avec succès' });
        }
    );
});

app.get('/api/reviews/movie/:movieId', (req, res) => {
    const movie_id = req.params.movieId;

    db.all(
        `SELECT reviews.*, users.username 
         FROM reviews 
         JOIN users ON reviews.user_id = users.id 
         WHERE movie_id = ? 
         ORDER BY reviews.created_at DESC`,
        [movie_id],
        (err, reviews) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la récupération des avis' });
            }
            res.json(reviews);
        }
    );
});

app.get('/api/reviews/user/:movieId', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;

    db.get(
        'SELECT * FROM reviews WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id],
        (err, review) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la récupération de l\'avis' });
            }
            res.json(review || null);
        }
    );
});

app.put('/api/reviews/:movieId', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
    }

    db.run(
        `UPDATE reviews 
         SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND movie_id = ?`,
        [rating, comment, user_id, movie_id],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'avis' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Avis non trouvé' });
            }
            res.json({ message: 'Avis mis à jour avec succès' });
        }
    );
});

app.delete('/api/reviews/:movieId', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;

    db.run(
        'DELETE FROM reviews WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la suppression de l\'avis' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Avis non trouvé' });
            }
            res.json({ message: 'Avis supprimé avec succès' });
        }
    );
});

// Routes pour la watchlist
app.post('/api/watchlist', authenticateToken, (req, res) => {
    const { movie_id } = req.body;
    const user_id = req.user.id;

    db.run(
        'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
        [user_id, movie_id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Film déjà dans la liste à regarder' });
                }
                return res.status(500).json({ message: 'Erreur lors de l\'ajout à la liste' });
            }
            res.status(201).json({ message: 'Film ajouté à la liste à regarder' });
        }
    );
});

app.delete('/api/watchlist/:movieId', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;

    db.run(
        'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la suppression de la liste' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Film non trouvé dans la liste' });
            }
            res.json({ message: 'Film retiré de la liste à regarder' });
        }
    );
});

app.get('/api/watchlist', authenticateToken, (req, res) => {
    const user_id = req.user.id;

    db.all(
        'SELECT movie_id FROM watchlist WHERE user_id = ? ORDER BY created_at DESC',
        [user_id],
        (err, movies) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la récupération de la liste' });
            }
            res.json(movies.map(movie => movie.movie_id));
        }
    );
});

app.get('/api/watchlist/:movieId/check', authenticateToken, (req, res) => {
    const movie_id = req.params.movieId;
    const user_id = req.user.id;

    db.get(
        'SELECT 1 FROM watchlist WHERE user_id = ? AND movie_id = ?',
        [user_id, movie_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la vérification' });
            }
            res.json({ isInWatchlist: !!result });
        }
    );
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
}); 