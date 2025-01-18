import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>À propos</h3>
                    <p>CiniTech est votre source d'information sur les films, utilisant les données de TMDB.</p>
                </div>
                <div className="footer-section">
                    <h3>Liens Rapides</h3>
                    <ul>
                        <li><a href="#">Films Populaires</a></li>
                        <li><a href="#">Nouveautés</a></li>
                        <li><a href="#">Top Rated</a></li>
                        <li><a href="#">À venir</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Contact</h3>
                    <ul>
                        <li>Email: contact@cinitech.com</li>
                        <li>Téléphone: +33 1 23 45 67 89</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 CiniTech. Tous droits réservés.</p>
                <p>Propulsé par <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a></p>
            </div>
        </footer>
    );
};

export default Footer; 