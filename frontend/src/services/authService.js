/**
 * Authentication API Services
 * 
 * This module handles all authentication-related API calls including
 * login, logout, and token validation for all user types.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import { api } from './api';

/**
 * Authentication service class
 */
export class AuthService {
  
  /**
   * Student login
   * @param {Object} credentials - Email and password
   * @param {string} credentials.email - Student email
   * @param {string} credentials.password - Student password
   * @returns {Promise<Object>} Login response with token and user data
   */
  static async loginStudent(credentials) {
    try {
      const response = await api.post('/student/login', credentials);
      
      if (response.data.token) {
        api.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Student login failed');
    }
  }

  /**
   * Teacher login
   * @param {Object} credentials - Email and password
   * @param {string} credentials.email - Teacher email
   * @param {string} credentials.password - Teacher password
   * @returns {Promise<Object>} Login response with token and user data
   */
  static async loginTeacher(credentials) {
    try {
      const response = await api.post('/teacher/login', credentials);
      
      if (response.data.success && response.data.token) {
        api.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Teacher login failed');
    }
  }

  /**
   * SuperAdmin login
   * @param {Object} credentials - Email and password
   * @param {string} credentials.email - SuperAdmin email
   * @param {string} credentials.password - SuperAdmin password
   * @returns {Promise<Object>} Login response with token and user data
   */
  static async loginSuperAdmin(credentials) {
    try {
      const response = await api.post('/superadmin/login', credentials);
      
      if (response.data.success && response.data.token) {
        api.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'SuperAdmin login failed');
    }
  }

  /**
   * Student registration
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  static async register(userData) {
    try {
      const response = await api.post('/student/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate current token
   * @returns {Promise<Object>} User data if token is valid
   */
  static async validateToken() {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user data
   */
  static async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Success response
   */
  static async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update notification settings
   * @param {Object} settings - Notification preferences
   * @returns {Promise<Object>} Success response
   */
  static async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/auth/notification-settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload profile picture
   * @param {FormData} formData - Form data with profile picture
   * @returns {Promise<Object>} Updated user data
   */
  static async uploadProfilePicture(formData) {
    try {
      const response = await api.post('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user (clear token)
   */
  static logout() {
    api.removeToken();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    return api.isAuthenticated();
  }

  /**
   * Get current JWT token
   * @returns {string|null} Current token or null
   */
  static getToken() {
    return api.getToken();
  }
}

export default AuthService;
