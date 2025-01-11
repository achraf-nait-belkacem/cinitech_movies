import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/tmdbApi';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true);
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }

            searchTimeout.current = setTimeout(async () => {
                try {
                    const searchResults = await searchMovies(query);
                    setResults(searchResults.slice(0, 5));
                    setShowResults(true);
                } catch (error) {
                    console.error('Erreur de recherche:', error);
                } finally {
                    setLoading(false);
                }
            }, 300);
        } else {
            setResults([]);
            setShowResults(false);
        }

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [query]);

    const handleSearch = (e) => {
        setQuery(e.target.value);
    };

    const handleResultClick = (movieId) => {
        navigate(`/film/${movieId}`);
        setShowResults(false);
        setQuery('');
    };

    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Rechercher un film..."
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                <button>🔍</button>
            </div>
            {showResults && (
                <div className="search-results">
                    {loading ? (
                        <div className="search-loading">Recherche en cours...</div>
                    ) : results.length > 0 ? (
                        results.map(movie => (
                            <div
                                key={movie.id}
                                className="search-result-item"
                                onClick={() => handleResultClick(movie.id)}
                            >
                                <img
                                    src={movie.poster_path
                                        ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                        : 'https://via.placeholder.com/92x138'
                                    }
                                    alt={movie.title}
                                    className="search-result-poster"
                                />
                                <div className="search-result-info">
                                    <h4>{movie.title}</h4>
                                    <p>{new Date(movie.release_date).getFullYear()}</p>
                                    <span className="search-result-rating">
                                        ⭐ {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="no-results">Aucun film trouvé</div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchBar; 