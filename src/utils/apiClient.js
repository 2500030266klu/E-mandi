import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Base URL for the Express backend
const BASE_URL = `${API_BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., clear local storage and redirect to login)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
