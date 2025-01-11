import React from 'react';

const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <h1>🎬 CiniTech</h1>
                </div>
                <nav className="nav-menu">
                    <ul>
                        <li><a href="#" className="active">Films Populaires</a></li>
                        <li><a href="#">Nouveautés</a></li>
                        <li><a href="#">Top Rated</a></li>
                        <li><a href="#">À venir</a></li>
                    </ul>
                </nav>
                <div className="search-box">
                    <input type="text" placeholder="Rechercher un film..." />
                    <button>🔍</button>
                </div>
            </div>
        </header>
    );
};

export default Header; 