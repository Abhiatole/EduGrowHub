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
 * @param {string} props.role - Required role for access (STUDENT, TEACHER, or SUPERADMIN)
 */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  // Redirect to login if not authenticated
  if (!user) {
    const loginPath = role === 'TEACHER' ? '/teacher/login' : 
                     role === 'SUPERADMIN' ? '/admin/login' : 
                     '/student/login';
    return <Navigate to={loginPath} replace />;
  }

  // Redirect to appropriate dashboard if user has wrong role
  if (role && user.role !== role) {
    const redirectPath = user.role === 'TEACHER' ? '/teacher/dashboard' : 
                        user.role === 'SUPERADMIN' ? '/admin/dashboard' : 
                        '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
