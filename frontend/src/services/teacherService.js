/**
 * Teacher API Services
 * 
 * This module handles all teacher-related API calls including
 * dashboard data, student management, and test result submission.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import { api } from './api';

/**
 * Teacher service class
 */
export class TeacherService {
  
  /**
   * Get teacher dashboard data
   * @returns {Promise<Object>} Dashboard data including statistics
   */
  static async getDashboard() {
    try {
      const response = await api.get('/teacher/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }
  }

  /**
   * Get teacher dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const response = await api.get('/teacher/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get list of enrolled students
   * @returns {Promise<Array>} List of students
   */
  static async getStudents() {
    try {
      const response = await api.get('/teacher/students');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch students');
    }
  }

  /**
   * Get student details by ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Student details
   */
  static async getStudent(studentId) {
    try {
      const response = await api.get(`/teacher/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch student details');
    }
  }

  /**
   * Submit test marks for a student
   * @param {number} studentId - Student ID
   * @param {Object} testData - Test result data
   * @param {string} testData.subject - Subject name
   * @param {number} testData.marks - Marks obtained
   * @param {number} testData.maxMarks - Maximum marks
   * @param {string} testData.testDate - Test date (YYYY-MM-DD)
   * @param {string} testData.comments - Additional comments
   * @returns {Promise<Object>} Submission response with WhatsApp status
   */
  static async submitTestMarks(studentId, testData) {
    try {
      const response = await api.post(`/teacher/students/${studentId}/marks`, testData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit test marks');
    }
  }

  /**
   * Get test results for all students
   * @returns {Promise<Array>} List of all test results
   */
  static async getAllTestResults() {
    try {
      const response = await api.get('/teacher/test-results');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch test results');
    }
  }

  /**
   * Get test results for a specific student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} List of student's test results
   */
  static async getStudentTestResults(studentId) {
    try {
      const response = await api.get(`/teacher/students/${studentId}/test-results`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch student test results');
    }
  }

  /**
   * Get reports data with filters
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} Reports data
   */
  static async getReports(filters) {
    try {
      const response = await api.get('/teacher/reports', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch reports');
    }
  }

  /**
   * Export reports in specified format
   * @param {Object} filters - Report filters
   * @param {string} format - Export format (pdf, excel)
   * @returns {Promise<Blob>} Report file
   */
  static async exportReports(filters, format) {
    try {
      const response = await api.get(`/teacher/reports/export/${format}`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to export reports');
    }
  }

  /**
   * Enroll a new student
   * @param {Object} studentData - Student enrollment data
   * @param {string} studentData.name - Student name
   * @param {string} studentData.email - Student email
   * @param {string} studentData.phoneNumber - Student phone number
   * @param {string} studentData.password - Initial password
   * @returns {Promise<Object>} Enrollment response
   */
  static async enrollStudent(studentData) {
    try {
      const response = await api.post('/teacher/students', studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to enroll student');
    }
  }

  /**
   * Update student information
   * @param {number} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Update response
   */
  static async updateStudent(studentId, studentData) {
    try {
      const response = await api.put(`/teacher/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update student');
    }
  }

  /**
   * Delete a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Deletion response
   */
  static async deleteStudent(studentId) {
    try {
      const response = await api.delete(`/teacher/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete student');
    }
  }
}

export default TeacherService;
