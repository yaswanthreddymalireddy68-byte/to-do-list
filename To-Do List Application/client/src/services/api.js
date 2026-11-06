
import axios from 'axios';

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('daymark-token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors
export function getErrorMessage(error) {
  if (error.response) {
    return (
      error.response.data?.message ||
      `Server error: ${error.response.status}`
    );
  }

  if (error.request) {
    return 'Network Error: Unable to connect to the backend server. Check whether your backend is running.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

export default api;
