import React, { useState, useEffect } from 'react';
import { fetchPopularMovies } from '../services/tmdbApi';
import MovieCard from '../components/MovieCard';

const PopularMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await fetchPopularMovies();
                setMovies(data.results);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des films');
                setLoading(false);
            }
        };

        loadMovies();
    }, []);

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="popular-movies">
            <h1>Films Populaires</h1>
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};

export default PopularMovies; 