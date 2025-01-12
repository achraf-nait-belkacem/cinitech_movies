import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails } from '../services/tmdbApi';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';
import { isAuthenticated } from '../services/authService';
import MovieReviews from '../components/MovieReviews';

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inWatchlist, setInWatchlist] = useState(false);

    useEffect(() => {
        const loadMovie = async () => {
            try {
                const data = await fetchMovieDetails(id);
                setMovie(data);
                if (isAuthenticated()) {
                    const watchlistStatus = await isInWatchlist(id);
                    setInWatchlist(watchlistStatus);
                }
                setLoading(false);
            } catch (error) {
                setError('Erreur lors du chargement des détails du film');
                setLoading(false);
            }
        };

        loadMovie();
    }, [id]);

    const handleWatchlistClick = async () => {
        if (!isAuthenticated()) {
            alert('Veuillez vous connecter pour ajouter des films à votre liste');
            return;
        }

        try {
            if (inWatchlist) {
                await removeFromWatchlist(id);
                setInWatchlist(false);
            } else {
                await addToWatchlist(id);
                setInWatchlist(true);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de la watchlist:', error);
            alert(error.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatRuntime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement du film...</p>
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

    if (!movie) return null;

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
                        <button 
                            onClick={handleWatchlistClick}
                            className={`watchlist-button ${inWatchlist ? 'in-watchlist' : ''}`}
                            title={inWatchlist ? 'Retirer de la liste' : 'Ajouter à la liste'}
                        >
                            {inWatchlist ? '✓ Dans ma liste' : '+ À regarder plus tard'}
                        </button>
                    </div>
                    <div className="movie-info-hero">
                        <h1>{movie.title}</h1>
                        <div className="movie-meta">
                            <span className="release-date">{formatDate(movie.release_date)}</span>
                            <span className="runtime">{formatRuntime(movie.runtime)}</span>
                            <span className="rating">★ {movie.vote_average.toFixed(1)}/10</span>
                        </div>
                        <div className="genres">
                            {movie.genres.map(genre => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                        {movie.tagline && <p className="tagline">{movie.tagline}</p>}
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

                <MovieReviews movieId={id} />
            </div>
        </div>
    );
};

export default MovieDetails; 