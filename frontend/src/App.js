/**
 * Main Application Component
 * 
 * Handles routing, authentication, and global state management
 * for the EduGrowHub Learning Management System.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthService } from './services/authService';

// Import Pages
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentRegistration from './pages/StudentRegistration';
import TakeTest from './pages/TakeTest';
import TestResults from './pages/TestResults';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';

// Import Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

/**
 * Authentication Context
 */
export const AuthContext = React.createContext();

/**
 * Main App Component
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await AuthService.validateToken();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = (userData) => {
    setUser(userData);
  };

  /**
   * Logout function
   */
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/student/login" 
              element={
                user ? (
                  <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/teacher/dashboard'} replace />
                ) : (
                  <StudentLogin />
                )
              } 
            />
            <Route 
              path="/teacher/login" 
              element={
                user ? (
                  <Navigate to={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'} replace />
                ) : (
                  <TeacherLogin />
                )
              } 
            />
            <Route 
              path="/student/register" 
              element={
                user ? (
                  <Navigate to={user.role === 'STUDENT' ? '/student/dashboard' : '/teacher/dashboard'} replace />
                ) : (
                  <StudentRegistration />
                )
              } 
            />

            {/* Protected Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="STUDENT">
                  <Layout>
                    <StudentDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/test/:testId" 
              element={
                <ProtectedRoute role="STUDENT">
                  <Layout>
                    <TakeTest />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/results" 
              element={
                <ProtectedRoute role="STUDENT">
                  <Layout>
                    <TestResults />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <ProtectedRoute role="STUDENT">
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Protected Teacher Routes */}
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute role="TEACHER">
                  <Layout>
                    <TeacherDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/reports" 
              element={
                <ProtectedRoute role="TEACHER">
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/profile" 
              element={
                <ProtectedRoute role="TEACHER">
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
