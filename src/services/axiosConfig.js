import axios from 'axios';

// Base URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    console.log('Request:', config.method?.toUpperCase(), config.url, 'UserId:', userId);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);

    // Handle 401 Unauthorized - redirect to signin
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);

export default api;