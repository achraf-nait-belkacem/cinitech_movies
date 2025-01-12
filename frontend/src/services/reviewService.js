import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api';

export const addReview = async (movieId, rating, comment) => {
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                movie_id: movieId,
                rating,
                comment
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const getMovieReviews = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/reviews/movie/${movieId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const getUserReview = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/reviews/user/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const updateReview = async (movieId, rating, comment) => {
    try {
        const response = await fetch(`${API_URL}/reviews/${movieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                rating,
                comment
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteReview = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/reviews/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error;
    }
}; 