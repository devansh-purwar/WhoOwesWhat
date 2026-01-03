import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add JWT token if available
        const token = localStorage.getItem('splitwise_auth_token');
        console.log('[ApiClient] Interceptor - Token from storage:', token ? 'Found (starts with ' + token.substring(0, 10) + '...)' : 'Not Found');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('[ApiClient] Added Authorization header');
        } else {
            console.warn('[ApiClient] No token found, sending request without Authorization header');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            // Handle unauthorized for other requests
            localStorage.removeItem('userId');
            localStorage.removeItem('splitwise_user');
            localStorage.removeItem('splitwise_auth_token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
