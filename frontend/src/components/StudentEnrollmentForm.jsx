import React, { useState, useEffect } from 'react';

const StudentEnrollmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);

  // Check if teacher is logged in
  const teacherToken = localStorage.getItem('teacherToken');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (teacherToken && userRole === 'TEACHER') {
      fetchStudents();
    }
  }, [teacherToken, userRole]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await fetch('/api/teacher/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setTeacherInfo({
          name: data.teacherName,
          email: data.teacherEmail,
          totalStudents: data.totalStudents
        });
      } else {
        const errorData = await response.text();
        setError(`Failed to load students: ${errorData}`);
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate input
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Student "${data.name}" enrolled successfully!`);
        setFormData({ name: '', email: '' });
        
        // Refresh the students list
        fetchStudents();
      } else {
        const errorData = await response.text();
        setError(errorData);
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check authentication
  if (!teacherToken || userRole !== 'TEACHER') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in as a teacher to access student enrollment.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Teacher Info Header */}
      {teacherInfo && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {teacherInfo.name}!</h1>
          <p className="text-green-100">
            📧 {teacherInfo.email} | 👥 {teacherInfo.totalStudents} Students Enrolled
          </p>
        </div>
      )}

      {/* Student Enrollment Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📝 Enroll New Student
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-300 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Success! </span>
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Student Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter student's full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Student Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter student's email address"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              } transition duration-200`}
            >
              {loading ? 'Enrolling Student...' : '✅ Enroll Student'}
            </button>
          </div>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            👥 Your Students
          </h2>
          <button
            onClick={fetchStudents}
            disabled={studentsLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
          >
            {studentsLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {studentsLoading ? (
          <div className="text-center py-8">
            <div className="text-blue-500 text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📚</div>
            <p className="text-gray-600">No students enrolled yet.</p>
            <p className="text-gray-500 text-sm">Start by enrolling your first student above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-medium text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      📧 {student.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      📅 {formatDate(student.enrolledDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentForm;
