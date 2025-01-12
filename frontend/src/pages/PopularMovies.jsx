import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { getFavorites } from '../services/favoriteService';
import { isAuthenticated } from '../services/authService';

const PopularMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState([]);

    const fetchFavorites = async () => {
        if (isAuthenticated()) {
            try {
                const favoriteMovies = await getFavorites();
                setFavorites(favoriteMovies);
            } catch (error) {
                console.error('Erreur lors de la récupération des favoris:', error);
            }
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=${page}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.status_message || 'Erreur lors de la récupération des films');
                }

                const data = await response.json();
                
                if (page === 1) {
                    setMovies(data.results);
                } else {
                    setMovies(prevMovies => [...prevMovies, ...data.results]);
                }
            } catch (error) {
                console.error('Erreur détaillée:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [page]);

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleFavoriteChange = (movieId, isFavorite) => {
        if (isFavorite) {
            setFavorites(prev => [...prev, movieId]);
        } else {
            setFavorites(prev => prev.filter(id => id !== movieId));
        }
    };

    if (loading && page === 1) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement des films...</p>
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
                        setPage(1);
                        setLoading(true);
                    }}
                    className="retry-button"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="popular-movies">
            <h1>Films Populaires</h1>
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard 
                        key={movie.id} 
                        movie={movie}
                        isFavorite={favorites.includes(movie.id)}
                        onFavoriteChange={handleFavoriteChange}
                    />
                ))}
            </div>
            <div className="load-more">
                <button 
                    onClick={handleLoadMore} 
                    className="load-more-button"
                    disabled={loading}
                >
                    {loading ? 'Chargement...' : 'Charger plus de films'}
                </button>
            </div>
        </div>
    );
};

export default PopularMovies; 