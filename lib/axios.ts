import axios from 'axios';

// Create axios instance with base URL from environment variables
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add Authorization header when token exists
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Add refresh token logic here if needed
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 