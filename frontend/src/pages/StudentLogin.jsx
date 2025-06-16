/**
 * Student Login Page
 * 
 * Professional login interface for students with form validation,
 * error handling, and responsive design using Tailwind CSS.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { AuthService } from '../services/authService';
import { AuthContext } from '../App';
import toast from 'react-hot-toast';

/**
 * Student Login Component
 */
const StudentLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.loginStudent(formData);
      
      if (response.token) {
        // Set user in context with student data
        const userData = {
          ...response.student,
          role: 'STUDENT',
          token: response.token
        };
        login(userData);
        toast.success('Login successful!');
        navigate('/student/dashboard');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, Student!
          </h1>
          <p className="text-gray-600">
            Sign in to access your learning dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card padding="lg" shadow={true}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              required
            />

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to EduGrowHub?
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Contact your teacher to get enrolled
              </p>
            </div>
          </div>
        </Card>

        {/* Other Login Options */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">Are you a teacher or admin?</p>
          <div className="space-x-4">
            <Link 
              to="/teacher/login" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Teacher Login
            </Link>
            <Link 
              to="/admin/login" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 EduGrowHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
