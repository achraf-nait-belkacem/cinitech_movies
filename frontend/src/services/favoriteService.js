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
        console.log('Add to favorites response:', data);

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error('Error in addToFavorites:', error);
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
        console.log('Remove from favorites response:', data);

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error('Error in removeFromFavorites:', error);
        throw error;
    }
};

export const getFavorites = async () => {
    try {
        console.log('Getting favorites with token:', getToken());
        const response = await fetch(`${API_URL}/favorites`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        console.log('Get favorites response:', data);

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error('Error in getFavorites:', error);
        throw error;
    }
};

export const isInFavorites = async (movieId) => {
    try {
        const favorites = await getFavorites();
        return favorites.some(id => id === parseInt(movieId));
    } catch (error) {
        console.error('Error in isInFavorites:', error);
        return false;
    }
}; 