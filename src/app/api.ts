import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api`
        : "http://localhost:3000/api"
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // Define endpoints that don't require authentication
    const publicEndpoints = [
        '/auth/login',
        '/auth/session-login',
        '/auth/register',
        '/auth/register/google',
        '/auth/register-with-google',
        '/auth/verify-email',
        '/auth/reset-password',
        '/auth/forgot-password'
    ];
    
    // Check if the current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
    );
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicEndpoint) {
        // Cancel the request if no token is available and it's not a public endpoint
        return Promise.reject(new Error('No authentication token available'));
    }
    
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            // Redirect to login page
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);