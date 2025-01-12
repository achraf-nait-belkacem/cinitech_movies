import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api';

export const addToFavorites = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
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

export const removeFromFavorites = async (movieId) => {
    try {
        const response = await fetch(`${API_URL}/favorites/${movieId}`, {
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

export const getFavorites = async () => {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
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