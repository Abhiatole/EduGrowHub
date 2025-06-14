/**
 * Student API Services
 * 
 * This module handles all student-related API calls including
 * profile management, test results, and password changes.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import { api } from './api';

/**
 * Student service class
 */
export class StudentService {
  
  /**
   * Get student profile
   * @returns {Promise<Object>} Student profile data
   */
  static async getProfile() {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch student profile');
    }
  }

  /**
   * Get student test results
   * @returns {Promise<Array>} List of test results
   */
  static async getTestResults() {
    try {
      const response = await api.get('/student/test-results');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch test results');
    }
  }

  /**
   * Change student password
   * @param {Object} passwordData - Current and new passwords
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Confirm new password
   * @returns {Promise<Object>} Success response
   */
  static async changePassword(passwordData) {
    try {
      const response = await api.put('/student/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Get dashboard data for student
   * @returns {Promise<Object>} Dashboard statistics and data
   */
  static async getDashboardData() {
    try {
      const response = await api.get('/student/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }
  }

  /**
   * Get available tests for student
   * @returns {Promise<Array>} List of available tests
   */
  static async getAvailableTests() {
    try {
      const response = await api.get('/student/tests/available');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch available tests');
    }
  }

  /**
   * Get specific test by ID
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Test data with questions
   */
  static async getTest(testId) {
    try {
      const response = await api.get(`/student/tests/${testId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch test');
    }
  }

  /**
   * Get saved answers for a test
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Saved answers
   */
  static async getSavedAnswers(testId) {
    try {
      const response = await api.get(`/student/tests/${testId}/answers`);
      return response.data;
    } catch (error) {
      // Return empty object if no saved answers found
      return {};
    }
  }

  /**
   * Save test progress
   * @param {string} testId - Test ID
   * @param {Object} answers - Student answers
   * @returns {Promise<Object>} Success response
   */
  static async saveTestProgress(testId, answers) {
    try {
      const response = await api.post(`/student/tests/${testId}/save`, { answers });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to save test progress');
    }
  }

  /**
   * Submit test
   * @param {string} testId - Test ID
   * @param {Object} answers - Student answers
   * @returns {Promise<Object>} Submission response
   */
  static async submitTest(testId, answers) {
    try {
      const response = await api.post(`/student/tests/${testId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit test');
    }
  }

  /**
   * Get test results by test ID
   * @param {string} testId - Test ID
   * @returns {Promise<Object>} Test results
   */
  static async getTestResults(testId) {
    try {
      const response = await api.get(`/student/results/${testId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch test results');
    }
  }

  /**
   * Get latest test results
   * @returns {Promise<Object>} Latest test results
   */
  static async getLatestResults() {
    try {
      const response = await api.get('/student/results/latest');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch latest results');
    }
  }

  /**
   * Download test results as PDF
   * @param {string} resultId - Result ID
   * @returns {Promise<Blob>} PDF file
   */
  static async downloadResults(resultId) {
    try {
      const response = await api.get(`/student/results/${resultId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_results_${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to download results');
    }
  }
}

export default StudentService;
