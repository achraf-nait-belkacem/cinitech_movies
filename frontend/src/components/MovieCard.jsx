import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addToFavorites, removeFromFavorites } from '../services/favoriteService';
import { isAuthenticated } from '../services/authService';

const MovieCard = ({ movie, onFavoriteChange, isFavorite: initialIsFavorite = false }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleFavoriteClick = async (e) => {
        e.preventDefault(); // Empêche la navigation vers la page du film

        if (!isAuthenticated()) {
            alert('Veuillez vous connecter pour ajouter des favoris');
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(movie.id);
            } else {
                await addToFavorites(movie.id);
            }
            setIsFavorite(!isFavorite);
            if (onFavoriteChange) {
                onFavoriteChange(movie.id, !isFavorite);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des favoris:', error);
            alert(error.message);
        }
    };

    return (
        <Link to={`/film/${movie.id}`} className="movie-card">
            <div className="movie-poster-container">
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                />
                <button 
                    className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                    onClick={handleFavoriteClick}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    {isFavorite ? '★' : '☆'}
                </button>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-rating">★ {movie.vote_average.toFixed(1)}</p>
                <p className="movie-release-date">
                    {new Date(movie.release_date).toLocaleDateString()}
                </p>
            </div>
        </Link>
    );
};

export default MovieCard; 