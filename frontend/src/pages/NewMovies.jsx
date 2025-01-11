import React, { useState, useEffect } from 'react';
import { fetchNewMovies } from '../services/tmdbApi';
import MovieCard from '../components/MovieCard';

const NewMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await fetchNewMovies(page);
                setMovies(prevMovies => page === 1 ? data.results : [...prevMovies, ...data.results]);
                setTotalPages(data.total_pages);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des films');
                setLoading(false);
            }
        };

        loadMovies();
    }, [page]);

    const loadMore = () => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    if (loading && page === 1) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="new-movies">
            <h1>Nouveaux Films</h1>
            <div className="movies-grid">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
            {page < totalPages && (
                <div className="load-more">
                    <button onClick={loadMore} className="load-more-button">
                        Charger plus de films
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewMovies; 