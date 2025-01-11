const API_KEY = '20083d85f865b0cadec66b1a442b6e53';
const BASE_URL = 'https://api.themoviedb.org/3';

export const searchMovies = async (query) => {
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
        );
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Erreur lors de la recherche des films:', error);
        throw error;
    }
};

export const fetchPopularMovies = async (page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des films populaires:', error);
        throw error;
    }
};

export const fetchNewMovies = async (page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=fr-FR&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des nouveaux films:', error);
        throw error;
    }
};

export const fetchTopRatedMovies = async (page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=fr-FR&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des films les mieux notés:', error);
        throw error;
    }
};

export const fetchUpcomingMovies = async (page = 1) => {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=fr-FR&page=${page}&region=FR`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des films à venir:', error);
        throw error;
    }
};

export const fetchMovieDetails = async (movieId) => {
    try {
        const [movieDetails, credits, videos] = await Promise.all([
            // Détails du film
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json()),
            // Casting et équipe
            fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json()),
            // Bandes-annonces et vidéos
            fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=fr-FR`)
                .then(res => res.json())
        ]);

        return {
            ...movieDetails,
            credits,
            videos: videos.results
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du film:', error);
        throw error;
    }
}; 