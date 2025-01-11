import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header = () => {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <Link to="/">
                        <h1>🎬 CiniTech</h1>
                    </Link>
                </div>
                <nav className="nav-menu">
                    <ul>
                        <li>
                            <Link 
                                to="/" 
                                className={location.pathname === '/' ? 'active' : ''}
                            >
                                Films Populaires
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/nouveautes" 
                                className={location.pathname === '/nouveautes' ? 'active' : ''}
                            >
                                Nouveautés
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/top-rated" 
                                className={location.pathname === '/top-rated' ? 'active' : ''}
                            >
                                Top Rated
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/a-venir" 
                                className={location.pathname === '/a-venir' ? 'active' : ''}
                            >
                                À venir
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="header-right">
                    <SearchBar />
                    <div className="auth-buttons">
                        <Link to="/connexion" className="auth-btn login-btn">
                            Connexion
                        </Link>
                        <Link to="/inscription" className="auth-btn register-btn">
                            Inscription
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 