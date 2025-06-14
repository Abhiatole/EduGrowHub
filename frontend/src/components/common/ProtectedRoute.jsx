/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes based on user authentication
 * and role-based access control.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../App';

/**
 * ProtectedRoute Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.role - Required role for access (STUDENT or TEACHER)
 */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={role === 'TEACHER' ? '/teacher/login' : '/student/login'} replace />;
  }

  // Redirect to appropriate dashboard if user has wrong role
  if (role && user.role !== role) {
    const redirectPath = user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
