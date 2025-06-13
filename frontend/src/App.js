import React, { useState, useEffect } from 'react';
import SuperadminLogin from './components/SuperadminLogin';
import TeacherLogin from './components/TeacherLogin';
import StudentEnrollmentForm from './components/StudentEnrollmentForm';

function App() {
  const [loginType, setLoginType] = useState('superadmin'); // 'superadmin' or 'teacher'
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'dashboard'
  const [userRole, setUserRole] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const teacherToken = localStorage.getItem('teacherToken');
    const superadminToken = localStorage.getItem('superadminToken');
    const storedRole = localStorage.getItem('userRole');

    if (teacherToken && storedRole === 'TEACHER') {
      setUserRole('TEACHER');
      setCurrentView('dashboard');
      setLoginType('teacher');
    } else if (superadminToken && storedRole === 'SUPERADMIN') {
      setUserRole('SUPERADMIN');
      setCurrentView('dashboard');
      setLoginType('superadmin');
    }
  }, []);

  const handleLoginSuccess = (token) => {
    // Handle successful login
    console.log('Login successful, token:', token);
    const storedRole = localStorage.getItem('userRole');
    setUserRole(storedRole);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    // Clear all tokens and user data
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('superadminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    // Reset state
    setUserRole(null);
    setCurrentView('login');
    setLoginType('superadmin');
  };

  const switchToTeacher = () => {
    setLoginType('teacher');
  };

  const switchToSuperadmin = () => {
    setLoginType('superadmin');
  };
  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">EduGrowHub</h1>
            <p className="text-gray-600">Educational Institute Management System</p>
            
            {/* User Info and Logout */}
            {currentView === 'dashboard' && userRole && (
              <div className="mt-4 flex justify-center items-center space-x-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {userRole === 'TEACHER' ? '👨‍🏫 Teacher Dashboard' : '🔐 Superadmin Dashboard'}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                >
                  🚪 Logout
                </button>
              </div>
            )}
            
            {/* Login Type Indicator */}
            {currentView === 'login' && (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {loginType === 'superadmin' ? '🔐 Superadmin Portal' : '👨‍🏫 Teacher Portal'}
              </div>
            )}
          </div>
          
          {/* Main Content */}
          {currentView === 'login' ? (
            // Login Components
            loginType === 'superadmin' ? (
              <SuperadminLogin 
                onLoginSuccess={handleLoginSuccess}
                onSwitchToTeacher={switchToTeacher}
              />
            ) : (
              <TeacherLogin 
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSuperadmin={switchToSuperadmin}
              />
            )
          ) : (
            // Dashboard Components
            userRole === 'TEACHER' ? (
              <StudentEnrollmentForm />
            ) : userRole === 'SUPERADMIN' ? (
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-blue-500 text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Superadmin Dashboard</h2>
                <p className="text-gray-600 mb-4">Welcome to the administrative panel.</p>
                <p className="text-gray-500 text-sm">Superadmin features coming soon...</p>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
