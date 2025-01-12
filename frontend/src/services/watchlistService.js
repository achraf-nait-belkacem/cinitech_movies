import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api';

export const addToWatchlist = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ movie_id: movieId })
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

export const removeFromWatchlist = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/watchlist/${movieId}`, {
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

export const getWatchlist = async () => {
    try {
        const response = await fetch(`${API_URL}/watchlist`, {
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

export const isInWatchlist = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/watchlist/${movieId}/check`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data.isInWatchlist;
    } catch (error) {
        throw error;
    }
}; 