import React, { useState, useEffect } from 'react';
import { fetchUpcomingMovies } from '../services/tmdbApi';
import MovieCard from '../components/MovieCard';

const UpcomingMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await fetchUpcomingMovies(page);
                // Trier les films par date de sortie
                const sortedMovies = data.results.sort((a, b) => 
                    new Date(a.release_date) - new Date(b.release_date)
                );
                setMovies(prevMovies => 
                    page === 1 ? sortedMovies : [...prevMovies, ...sortedMovies]
                );
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

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const getDaysUntilRelease = (releaseDate) => {
        const today = new Date();
        const release = new Date(releaseDate);
        const diffTime = release - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading && page === 1) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="upcoming-movies">
            <h1>Films à Venir</h1>
            <div className="movies-grid">
                {movies.map(movie => (
                    <div key={movie.id} className="upcoming-movie-card">
                        <MovieCard movie={movie} />
                        <div className="release-info">
                            <p className="release-date">
                                Date de sortie : {formatDate(movie.release_date)}
                            </p>
                            {getDaysUntilRelease(movie.release_date) > 0 && (
                                <p className="days-until">
                                    Dans {getDaysUntilRelease(movie.release_date)} jours
                                </p>
                            )}
                        </div>
                    </div>
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

export default UpcomingMovies; 