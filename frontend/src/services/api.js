/**
 * API Configuration and Axios Instance
 * 
 * This module sets up the base Axios configuration for the EduGrowHub application
 * with proper error handling, request/response interceptors, and token management.
 * 
 * Features:
 * - Automatic JWT token attachment
 * - Request/Response logging in development
 * - Error handling and token refresh
 * - Timeout configuration
 * - Base URL management via environment variables
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import axios from 'axios';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_API_URL || 'http://localhost:8080/api')
    : '/api', // Use proxy in development
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

/**
 * Create Axios instance with base configuration
 */
const apiClient = axios.create(API_CONFIG);

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
const getToken = () => {
  const tokenKey = process.env.REACT_APP_JWT_STORAGE_KEY || 'edugrowhub_token';
  return localStorage.getItem(tokenKey);
};

/**
 * Set JWT token in localStorage
 * @param {string} token - JWT token to store
 */
const setToken = (token) => {
  const tokenKey = process.env.REACT_APP_JWT_STORAGE_KEY || 'edugrowhub_token';
  if (token) {
    localStorage.setItem(tokenKey, token);
  } else {
    localStorage.removeItem(tokenKey);
  }
};

/**
 * Remove JWT token from localStorage
 */
const removeToken = () => {
  const tokenKey = process.env.REACT_APP_JWT_STORAGE_KEY || 'edugrowhub_token';
  localStorage.removeItem(tokenKey);
};

/**
 * Request Interceptor
 * Automatically attach JWT token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        console.warn('Authentication failed - removing token');
        removeToken();
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Handle authorization errors
      if (status === 403) {
        console.warn('Access forbidden');
      }
      
      // Log error details in development
      if (process.env.REACT_APP_ENVIRONMENT === 'development') {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          message: data?.message || error.message,
          data
        });
      }
      
      // Return a normalized error object
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        data: data || null
      });
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null
      });
    } else {
      // Other errors
      console.error('Request Setup Error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message || 'An unexpected error occurred',
        data: null
      });
    }
  }
);

/**
 * API utility functions
 */
export const api = {
  // Auth methods
  setToken,
  getToken,
  removeToken,
  
  // HTTP methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // Utility methods
  isAuthenticated: () => !!getToken(),
  getBaseURL: () => API_CONFIG.baseURL
};

export default apiClient;
