import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getFavorites } from '../services/favoriteService';
import { isAuthenticated } from '../services/authService';
import { fetchMovieDetails } from '../services/tmdbApi';

const Favorites = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavoriteMovies = async () => {
        try {
            setLoading(true);
            const favoriteIds = await getFavorites();
            console.log('Favorite IDs:', favoriteIds);

            const movieDetails = await Promise.all(
                favoriteIds.map(async (movieId) => {
                    try {
                        return await fetchMovieDetails(movieId);
                    } catch (error) {
                        console.error(`Error fetching movie ${movieId}:`, error);
                        return null;
                    }
                })
            );

            const validMovies = movieDetails.filter(movie => movie !== null);
            console.log('Valid movies:', validMovies);
            setMovies(validMovies);
            setError(null);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Erreur lors de la récupération des favoris');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/connexion');
            return;
        }

        fetchFavoriteMovies();
    }, [navigate]);

    const handleFavoriteChange = async (movieId, isFavorite) => {
        if (!isFavorite) {
            setMovies(prevMovies => prevMovies.filter(movie => movie.id !== parseInt(movieId)));
        } else {
            try {
                const newMovie = await fetchMovieDetails(movieId);
                if (newMovie) {
                    setMovies(prevMovies => [...prevMovies, newMovie]);
                }
            } catch (error) {
                console.error('Error fetching new favorite movie:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement de vos favoris...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Une erreur est survenue</h2>
                <p>{error}</p>
                <button 
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                    }}
                    className="retry-button"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="favorites-page">
                <h1>Mes Favoris</h1>
                <div className="empty-favorites">
                    <p>Vous n'avez pas encore de films favoris.</p>
                    <p>Ajoutez des films à vos favoris en cliquant sur l'étoile ☆</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <h1>Mes Favoris</h1>
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        isFavorite={true}
                        onFavoriteChange={handleFavoriteChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default Favorites; 