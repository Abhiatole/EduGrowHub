import React from 'react';
import SuperadminLogin from './components/SuperadminLogin';

function App() {
  return (
    <div className="App">
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">EduGrowHub</h1>
            <p className="text-gray-600">Educational Institute Management System</p>
          </div>
          <SuperadminLogin />
        </div>
      </div>
    </div>
  );
}

export default App;
