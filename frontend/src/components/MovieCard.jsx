import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750';

    return (
        <div className="movie-card">
            <img src={imageUrl} alt={movie.title} className="movie-poster" />
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p className="movie-rating">⭐ {movie.vote_average.toFixed(1)}/10</p>
                <p className="movie-release-date">
                    {new Date(movie.release_date).toLocaleDateString('fr-FR')}
                </p>
                <Link to={`/film/${movie.id}`} className="details-button">
                    Plus de détails
                </Link>
            </div>
        </div>
    );
};

export default MovieCard; 