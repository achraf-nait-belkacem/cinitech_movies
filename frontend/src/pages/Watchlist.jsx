import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getWatchlist } from '../services/watchlistService';
import { isAuthenticated } from '../services/authService';
import { fetchMovieDetails } from '../services/tmdbApi';

const Watchlist = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/connexion');
            return;
        }

        const fetchWatchlist = async () => {
            try {
                const movieIds = await getWatchlist();
                const movieDetails = await Promise.all(
                    movieIds.map(id => fetchMovieDetails(id))
                );
                setMovies(movieDetails);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération de la watchlist:', error);
                setError('Erreur lors de la récupération de votre liste');
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [navigate]);

    const handleWatchlistChange = (movieId, isAdded) => {
        if (!isAdded) {
            setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement de votre liste...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Une erreur est survenue</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="watchlist-page">
            <h1>Ma Liste à Regarder</h1>
            {movies.length === 0 ? (
                <div className="empty-watchlist">
                    <p>Votre liste est vide</p>
                    <p>Ajoutez des films à votre liste pour les regarder plus tard</p>
                </div>
            ) : (
                <div className="movies-grid">
                    {movies.map(movie => (
                        <MovieCard 
                            key={movie.id} 
                            movie={movie}
                            onWatchlistChange={handleWatchlistChange}
                            isInWatchlist={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist; 