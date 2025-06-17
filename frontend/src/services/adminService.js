/**
 * Admin Service
 * 
 * Handles all admin/superadmin-related API calls including system management,
 * user oversight, and platform analytics.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import { api } from './api';

/**
 * Admin service class
 */
export class AdminService {
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard data
   */
  static async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard data');
    }
  }

  /**
   * Get all teachers in the system
   * @returns {Promise<Object>} Teachers data
   */
  static async getTeachers() {
    try {
      const response = await api.get('/admin/teachers');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch teachers');
    }
  }

  /**
   * Add a new teacher
   * @param {Object} teacherData - Teacher information
   * @returns {Promise<Object>} Created teacher data
   */
  static async addTeacher(teacherData) {
    try {
      const response = await api.post('/admin/teachers', teacherData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to add teacher');
    }
  }

  /**
   * Update teacher information
   * @param {number} teacherId - Teacher ID
   * @param {Object} teacherData - Updated teacher information
   * @returns {Promise<Object>} Updated teacher data
   */
  static async updateTeacher(teacherId, teacherData) {
    try {
      const response = await api.put(`/admin/teachers/${teacherId}`, teacherData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update teacher');
    }
  }

  /**
   * Delete a teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object>} Response data
   */
  static async deleteTeacher(teacherId) {
    try {
      const response = await api.delete(`/admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete teacher');
    }
  }

  /**
   * Get all students in the system
   * @returns {Promise<Object>} Students data
   */
  static async getAllStudents() {
    try {
      const response = await api.get('/admin/students');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch students');
    }
  }

  /**
   * Get system-wide reports
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} Reports data
   */
  static async getSystemReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch reports');
    }
  }

  /**
   * Get system health status
   * @returns {Promise<Object>} System health data
   */
  static async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch system health');
    }
  }

  /**
   * Get system settings
   * @returns {Promise<Object>} System settings
   */
  static async getSystemSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch system settings');
    }
  }

  /**
   * Update system settings
   * @param {Object} settings - Updated settings
   * @returns {Promise<Object>} Response data
   */
  static async updateSystemSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update system settings');
    }
  }

  /**
   * Get audit logs
   * @param {Object} filters - Log filters
   * @returns {Promise<Object>} Audit logs data
   */
  static async getAuditLogs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/audit-logs?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch audit logs');
    }
  }

  /**
   * Send system-wide notification
   * @param {Object} notificationData - Notification details
   * @returns {Promise<Object>} Response data
   */
  static async sendSystemNotification(notificationData) {
    try {
      const response = await api.post('/admin/notifications/system', notificationData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to send system notification');
    }
  }

  /**
   * Backup system data
   * @returns {Promise<Object>} Backup response
   */
  static async backupSystemData() {
    try {
      const response = await api.post('/admin/backup');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to backup system data');
    }
  }

  /**
   * Get system analytics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} Analytics data
   */
  static async getSystemAnalytics(period = 'month') {
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch analytics');
    }
  }
}

export default AdminService;
