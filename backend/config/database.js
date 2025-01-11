const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../mydb.db');

// Création de la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
        createTables();
    }
});

// Création des tables
const createTables = () => {
    // Table users
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table users:', err);
        } else {
            console.log('Table users créée avec succès');
            createDefaultAdmin();
        }
    });

    // Table favorites (films favoris des utilisateurs)
    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table favorites:', err);
        } else {
            console.log('Table favorites créée avec succès');
        }
    });

    // Table reviews (avis des utilisateurs sur les films)
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table reviews:', err);
        } else {
            console.log('Table reviews créée avec succès');
        }
    });

    // Table watchlist (liste des films à voir)
    db.run(`
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, movie_id)
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table watchlist:', err);
        } else {
            console.log('Table watchlist créée avec succès');
        }
    });

    // Table user_preferences (préférences utilisateur)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            preferred_genres TEXT,
            preferred_language TEXT DEFAULT 'fr',
            email_notifications BOOLEAN DEFAULT 1,
            theme TEXT DEFAULT 'dark',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id)
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table user_preferences:', err);
        } else {
            console.log('Table user_preferences créée avec succès');
        }
    });
};

// Création de l'administrateur par défaut
const createDefaultAdmin = () => {
    const defaultAdmin = {
        username: 'admin',
        email: 'admin@cinitech.com',
        password: 'admin123',
        role: 'admin'
    };

    db.get('SELECT * FROM users WHERE role = ?', ['admin'], async (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'admin:', err);
        } else if (!row) {
            const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [defaultAdmin.username, defaultAdmin.email, hashedPassword, defaultAdmin.role],
                (err) => {
                    if (err) {
                        console.error('Erreur lors de la création de l\'admin par défaut:', err);
                    } else {
                        console.log('Admin par défaut créé avec succès');
                    }
                }
            );
        }
    });
};

module.exports = db;