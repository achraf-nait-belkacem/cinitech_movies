const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connexion à la base de données SQLite réussie');
    }
});

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API Cinitech Movies est en ligne!' });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
}); 