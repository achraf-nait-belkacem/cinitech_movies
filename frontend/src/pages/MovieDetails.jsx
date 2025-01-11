import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails } from '../services/tmdbApi';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMovieDetails = async () => {
            try {
                const data = await fetchMovieDetails(id);
                setMovie(data);
                setLoading(false);
            } catch (err) {
                setError('Erreur lors du chargement des détails du film');
                setLoading(false);
            }
        };

        loadMovieDetails();
    }, [id]);

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!movie) return <div className="error">Film non trouvé</div>;

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    return (
        <div className="movie-details">
            <div className="movie-hero" style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
            }}>
                <div className="movie-hero-content">
                    <div className="movie-poster">
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                        />
                    </div>
                    <div className="movie-info-hero">
                        <h1>{movie.title}</h1>
                        <div className="movie-meta">
                            <span className="release-date">{formatDate(movie.release_date)}</span>
                            <span className="runtime">{formatRuntime(movie.runtime)}</span>
                            <span className="rating">⭐ {movie.vote_average.toFixed(1)}/10</span>
                        </div>
                        <div className="genres">
                            {movie.genres.map(genre => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                        <p className="tagline">{movie.tagline}</p>
                        <div className="overview">
                            <h2>Synopsis</h2>
                            <p>{movie.overview}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="movie-content">
                <div className="cast-section">
                    <h2>Casting Principal</h2>
                    <div className="cast-grid">
                        {movie.credits.cast.slice(0, 6).map(actor => (
                            <div key={actor.id} className="cast-card">
                                <img 
                                    src={actor.profile_path 
                                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                        : 'https://via.placeholder.com/185x278'
                                    }
                                    alt={actor.name}
                                />
                                <div className="cast-info">
                                    <h3>{actor.name}</h3>
                                    <p>{actor.character}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {movie.videos.length > 0 && (
                    <div className="videos-section">
                        <h2>Bandes-annonces et Vidéos</h2>
                        <div className="videos-grid">
                            {movie.videos.slice(0, 2).map(video => (
                                <div key={video.id} className="video-card">
                                    <iframe
                                        width="100%"
                                        height="315"
                                        src={`https://www.youtube.com/embed/${video.key}`}
                                        title={video.name}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="additional-info">
                    <h2>Informations Complémentaires</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <h3>Budget</h3>
                            <p>{movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : 'Non communiqué'}</p>
                        </div>
                        <div className="info-item">
                            <h3>Recettes</h3>
                            <p>{movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : 'Non communiqué'}</p>
                        </div>
                        <div className="info-item">
                            <h3>Statut</h3>
                            <p>{movie.status}</p>
                        </div>
                        <div className="info-item">
                            <h3>Langue Originale</h3>
                            <p>{movie.original_language.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails; 