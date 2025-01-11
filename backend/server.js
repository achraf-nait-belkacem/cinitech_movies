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

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
}); 