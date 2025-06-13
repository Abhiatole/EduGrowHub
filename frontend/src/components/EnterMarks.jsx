import React, { useState, useEffect } from 'react';

const EnterMarks = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    score: '',
    maxScore: '',
    testDate: new Date().toISOString().split('T')[0] // Today's date as default
  });
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (!formData.studentId || !formData.subject.trim() || !formData.score || !formData.maxScore || !formData.testDate) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate scores
    const score = parseFloat(formData.score);
    const maxScore = parseFloat(formData.maxScore);

    if (isNaN(score) || isNaN(maxScore)) {
      setError('Please enter valid numbers for scores');
      setLoading(false);
      return;
    }

    if (score < 0) {
      setError('Score cannot be negative');
      setLoading(false);
      return;
    }

    if (maxScore <= 0) {
      setError('Max score must be greater than 0');
      setLoading(false);
      return;
    }

    if (score > maxScore) {
      setError('Score cannot be greater than max score');
      setLoading(false);
      return;
    }

    // Validate test date
    const testDate = new Date(formData.testDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (testDate > today) {
      setError('Test date cannot be in the future');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/teacher/students/${formData.studentId}/marks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${teacherToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          score: score,
          maxScore: maxScore,
          testDate: formData.testDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        const selectedStudent = students.find(s => s.id.toString() === formData.studentId);
        setSuccess(
          `✅ Test result added successfully for ${selectedStudent?.name || 'student'}!\n` +
          `📚 Subject: ${data.subject}\n` +
          `📊 Score: ${data.score}/${data.maxScore} (${data.percentage.toFixed(1)}%)\n` +
          `🏆 Grade: ${data.grade} - ${data.passed ? 'PASSED' : 'FAILED'}`
        );
        
        // Reset form but keep student and date selection
        setFormData({
          ...formData,
          subject: '',
          score: '',
          maxScore: ''
        });
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

  // Get selected student info
  const selectedStudent = students.find(s => s.id.toString() === formData.studentId);

  // Check authentication
  if (!teacherToken || userRole !== 'TEACHER') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in as a teacher to enter student marks.</p>
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
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">📝 Enter Test Marks</h1>
          <p className="text-purple-100">
            👨‍🏫 {teacherInfo.name} | 📧 {teacherInfo.email} | 👥 {teacherInfo.totalStudents} Students
          </p>
        </div>
      )}

      {/* Enter Marks Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📊 Add Test Result
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
              <div className="whitespace-pre-line">
                <span className="font-medium">Success! </span>
                {success}
              </div>
            </div>
          </div>
        )}

        {studentsLoading ? (
          <div className="text-center py-8">
            <div className="text-blue-500 text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">👥</div>
            <p className="text-gray-600 mb-4">No students enrolled yet.</p>
            <p className="text-sm text-gray-500">Please enroll students first before adding marks.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                👤 Select Student
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="font-medium text-gray-800 mb-2">Selected Student:</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {selectedStudent.name}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Enrolled:</strong> {new Date(selectedStudent.enrolledDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  📚 Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Mathematics, English, Science"
                />
              </div>

              {/* Test Date */}
              <div>
                <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Test Date
                </label>
                <input
                  type="date"
                  id="testDate"
                  name="testDate"
                  value={formData.testDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Score */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Score Obtained
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., 85"
                />
              </div>

              {/* Max Score */}
              <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Maximum Score
                </label>
                <input
                  type="number"
                  id="maxScore"
                  name="maxScore"
                  value={formData.maxScore}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            {/* Score Preview */}
            {formData.score && formData.maxScore && !isNaN(parseFloat(formData.score)) && !isNaN(parseFloat(formData.maxScore)) && parseFloat(formData.maxScore) > 0 && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">📊 Score Preview:</h3>
                <div className="text-sm text-blue-700">
                  <p><strong>Percentage:</strong> {((parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100).toFixed(1)}%</p>
                  <p><strong>Grade:</strong> {
                    (() => {
                      const percentage = (parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100;
                      if (percentage >= 90) return 'A';
                      else if (percentage >= 80) return 'B';
                      else if (percentage >= 70) return 'C';
                      else if (percentage >= 60) return 'D';
                      else return 'F';
                    })()
                  }</p>
                  <p><strong>Status:</strong> {
                    ((parseFloat(formData.score) / parseFloat(formData.maxScore)) * 100) >= 60 
                      ? <span className="text-green-600 font-medium">✅ PASSED</span>
                      : <span className="text-red-600 font-medium">❌ FAILED</span>
                  }</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || studentsLoading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  loading || studentsLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                } transition duration-200`}
              >
                {loading ? '📝 Adding Test Result...' : '✅ Add Test Result'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={fetchStudents}
            disabled={studentsLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center justify-center"
          >
            {studentsLoading ? '🔄 Loading...' : '🔄 Refresh Students'}
          </button>
          <button
            onClick={() => {
              setFormData({
                studentId: '',
                subject: '',
                score: '',
                maxScore: '',
                testDate: new Date().toISOString().split('T')[0]
              });
              setError('');
              setSuccess('');
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            🗑️ Clear Form
          </button>
          <button
            onClick={() => {
              if (formData.studentId && formData.subject) {
                setFormData({
                  ...formData,
                  subject: '',
                  score: '',
                  maxScore: ''
                });
                setError('');
                setSuccess('');
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            ➕ Add Another Mark
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterMarks;
