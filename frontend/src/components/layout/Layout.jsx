/**
 * Main Layout Component
 * 
 * This component provides the main layout structure for the EduGrowHub application
 * including navigation, sidebar, and content areas with responsive design.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Bell
} from 'lucide-react';
import Button from '../ui/Button';
import { AuthService } from '../../services/authService';
import { AuthContext } from '../../App';

/**
 * Navigation items configuration based on user role
 */
const navigationConfig = {
  student: [
    { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    { name: 'Test Results', href: '/student/results', icon: BarChart3 },
    { name: 'Profile', href: '/student/profile', icon: User },
  ],
  teacher: [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: Home },
    { name: 'Students', href: '/teacher/students', icon: Users },
    { name: 'Enter Marks', href: '/teacher/marks', icon: BookOpen },
    { name: 'Reports', href: '/teacher/reports', icon: BarChart3 },
  ],
  superadmin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Teachers', href: '/admin/teachers', icon: Users },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]
};

/**
 * Layout Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @returns {React.Component} Layout component
 */
const Layout = ({ 
  children, 
  title = 'EduGrowHub' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Get user role and data from context
  const userRole = user?.role?.toLowerCase() || 'student';
  const userData = user || {};
  
  const navigation = navigationConfig[userRole] || navigationConfig.student;

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Check if navigation item is active
   */
  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">
              {process.env.REACT_APP_NAME || 'EduGrowHub'}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {userData.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleLogout}
            icon={LogOut}
            iconPosition="left"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userData.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData.email || ''}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
