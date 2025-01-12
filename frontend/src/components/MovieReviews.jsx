import React, { useState, useEffect } from 'react';
import { isAuthenticated } from '../services/authService';
import { addReview, getMovieReviews, getUserReview, updateReview, deleteReview } from '../services/reviewService';

const MovieReviews = ({ movieId }) => {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const reviewsData = await getMovieReviews(movieId);
            setReviews(reviewsData);
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
            setError(error.message);
        }
    };

    const fetchUserReview = async () => {
        if (isAuthenticated()) {
            try {
                const review = await getUserReview(movieId);
                if (review) {
                    setUserReview(review);
                    setRating(review.rating);
                    setComment(review.comment || '');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'avis de l\'utilisateur:', error);
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchReviews(), fetchUserReview()]);
            setLoading(false);
        };
        loadData();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            alert('Veuillez vous connecter pour donner votre avis');
            return;
        }

        if (rating === 0) {
            alert('Veuillez donner une note avant de soumettre votre avis');
            return;
        }

        try {
            if (userReview) {
                await updateReview(movieId, rating, comment);
            } else {
                await addReview(movieId, rating, comment);
            }
            await fetchReviews();
            await fetchUserReview();
            setIsEditing(false);
            setHoveredRating(0);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
            try {
                await deleteReview(movieId);
                setUserReview(null);
                setRating(0);
                setComment('');
                await fetchReviews();
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const renderStars = (value, isInteractive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <span
                    key={index}
                    className={`star ${
                        isInteractive
                            ? (hoveredRating || value) >= starValue
                                ? 'filled'
                                : ''
                            : value >= starValue
                            ? 'filled'
                            : ''
                    }`}
                    onClick={() => {
                        if (isInteractive) {
                            setRating(starValue);
                        }
                    }}
                    onMouseEnter={() => {
                        if (isInteractive) {
                            setHoveredRating(starValue);
                        }
                    }}
                    onMouseLeave={() => {
                        if (isInteractive) {
                            setHoveredRating(0);
                        }
                    }}
                    style={{ cursor: isInteractive ? 'pointer' : 'default' }}
                >
                    ★
                </span>
            );
        });
    };

    if (loading) {
        return <div className="loading">Chargement des avis...</div>;
    }

    return (
        <div className="reviews-section">
            <h2>Avis des spectateurs</h2>
            
            {error && <div className="error-message">{error}</div>}

            {isAuthenticated() && (
                <div className="review-form">
                    {!isEditing && userReview ? (
                        <div className="user-review">
                            <h3>Votre avis</h3>
                            <div className="rating">{renderStars(userReview.rating)}</div>
                            <p>{userReview.comment}</p>
                            <div className="review-actions">
                                <button onClick={() => setIsEditing(true)} className="edit-button">
                                    Modifier
                                </button>
                                <button onClick={handleDelete} className="delete-button">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3>{userReview ? 'Modifier votre avis' : 'Donner votre avis'}</h3>
                            <div className="rating-input">
                                {renderStars(rating, true)}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Partagez votre avis sur le film..."
                                required
                            />
                            <div className="form-actions">
                                <button type="submit" className="submit-button">
                                    {userReview ? 'Mettre à jour' : 'Publier'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setRating(userReview.rating);
                                            setComment(userReview.comment || '');
                                            setHoveredRating(0);
                                        }}
                                        className="cancel-button"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            )}

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <span className="username">{review.username}</span>
                                <div className="rating">{renderStars(review.rating)}</div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <span className="review-date">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="no-reviews">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                )}
            </div>
        </div>
    );
};

export default MovieReviews; 