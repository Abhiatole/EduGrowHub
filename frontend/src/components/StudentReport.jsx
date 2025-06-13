import React, { useState, useEffect } from 'react';

const StudentReport = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentMarks, setStudentMarks] = useState([]);
  const [studentReport, setStudentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [marksLoading, setMarksLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [teacherInfo, setTeacherInfo] = useState(null);

  // Check if teacher is logged in
  const teacherToken = localStorage.getItem('teacherToken');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (teacherToken && userRole === 'TEACHER') {
      fetchStudents();
    }
  }, [teacherToken, userRole]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData();
    } else {
      setStudentMarks([]);
      setStudentReport(null);
    }
  }, [selectedStudentId]);

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

  const fetchStudentData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch both marks and report data simultaneously
      const [marksResponse, reportResponse] = await Promise.all([
        fetch(`/api/teacher/students/${selectedStudentId}/marks`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          }
        }),
        fetch(`/api/teacher/students/${selectedStudentId}/report`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${teacherToken}`,
            'Content-Type': 'application/json',
          }
        })
      ]);

      if (marksResponse.ok && reportResponse.ok) {
        const marksData = await marksResponse.json();
        const reportData = await reportResponse.json();
        
        setStudentMarks(marksData.marks || []);
        setStudentReport(reportData);
      } else {
        if (!marksResponse.ok) {
          const errorData = await marksResponse.text();
          setError(`Failed to load student marks: ${errorData}`);
        }
        if (!reportResponse.ok) {
          const errorData = await reportResponse.text();
          setError(`Failed to load student report: ${errorData}`);
        }
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
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (passed) => {
    return passed 
      ? 'text-green-600 bg-green-100 border-green-200' 
      : 'text-red-600 bg-red-100 border-red-200';
  };

  // Get selected student info
  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);

  // Check authentication
  if (!teacherToken || userRole !== 'TEACHER') {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in as a teacher to view student reports.</p>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Teacher Info Header */}
      {teacherInfo && (
        <div className="bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">📊 Student Performance Reports</h1>
          <p className="text-blue-100">
            👨‍🏫 {teacherInfo.name} | 📧 {teacherInfo.email} | 👥 {teacherInfo.totalStudents} Students
          </p>
        </div>
      )}

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          👤 Select Student for Report
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

        {studentsLoading ? (
          <div className="text-center py-8">
            <div className="text-blue-500 text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">👥</div>
            <p className="text-gray-600 mb-4">No students enrolled yet.</p>
            <p className="text-sm text-gray-500">Please enroll students first to view their reports.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select a student to view their performance report:
              </label>
              <select
                id="studentSelect"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={fetchStudents}
                disabled={studentsLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
              >
                {studentsLoading ? '🔄 Loading...' : '🔄 Refresh Students'}
              </button>
              {selectedStudentId && (
                <button
                  onClick={fetchStudentData}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
                >
                  {loading ? '📊 Loading...' : '📊 Refresh Report'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-blue-500 text-4xl mb-2">📊</div>
            <p className="text-gray-600">Loading student report...</p>
          </div>
        </div>
      )}

      {/* Selected Student Info & Report Summary */}
      {selectedStudent && studentReport && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                📋 Report for {selectedStudent.name}
              </h2>
              <p className="text-gray-600">
                📧 {selectedStudent.email} | 📅 Enrolled: {formatDate(selectedStudent.enrolledDate)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                studentReport.overallGrade === 'A' || studentReport.overallGrade === 'B' 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : studentReport.overallGrade === 'C' || studentReport.overallGrade === 'D'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                Overall Grade: {studentReport.overallGrade}
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-2xl font-bold">{studentReport.totalTests}</div>
              <div className="text-blue-800 text-sm font-medium">Total Tests</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 text-2xl font-bold">{studentReport.averagePercentage?.toFixed(1)}%</div>
              <div className="text-green-800 text-sm font-medium">Average Score</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-purple-600 text-2xl font-bold">{studentReport.passedTests}</div>
              <div className="text-purple-800 text-sm font-medium">Tests Passed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-red-600 text-2xl font-bold">{studentReport.failedSubjects}</div>
              <div className="text-red-800 text-sm font-medium">Failed Subjects</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">📈 Performance Range</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Highest:</span> {studentReport.highestScore} | 
                <span className="font-medium"> Lowest:</span> {studentReport.lowestScore}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">📊 Pass Rate</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{studentReport.passRate}%</span> ({studentReport.passedTests}/{studentReport.totalTests} tests)
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">🎯 Overall Status</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                studentReport.passRate >= 60 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {studentReport.passRate >= 60 ? '✅ GOOD PERFORMANCE' : '⚠️ NEEDS IMPROVEMENT'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Table */}
      {selectedStudent && studentMarks.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📝 Detailed Test Results ({studentMarks.length} tests)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentMarks.map((mark, index) => (
                  <tr key={mark.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mark.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{mark.score}</span>
                        <span className="text-gray-500">/{mark.maxScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mark.percentage?.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getStatusColor(mark.passed)}`}>
                        {mark.passed ? '✅ PASS' : '❌ FAIL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(mark.testDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject-wise Performance */}
      {selectedStudent && studentReport && studentReport.subjectWisePerformance && studentReport.subjectWisePerformance.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📚 Subject-wise Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentReport.subjectWisePerformance.map((subject, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">{subject.subject}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tests:</span>
                    <span className="font-medium">{subject.testsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{subject.averageScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg %:</span>
                    <span className="font-medium">{subject.averagePercentage?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Grade:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best and Worst Performance */}
      {selectedStudent && studentReport && (studentReport.bestPerformance || studentReport.worstPerformance) && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🏆 Performance Highlights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Performance */}
            {studentReport.bestPerformance && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  🏆 Best Performance
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Subject:</strong> {studentReport.bestPerformance.subject}</div>
                  <div><strong>Score:</strong> {studentReport.bestPerformance.score}/{studentReport.bestPerformance.maxScore}</div>
                  <div><strong>Percentage:</strong> {studentReport.bestPerformance.percentage?.toFixed(1)}%</div>
                  <div><strong>Grade:</strong> {studentReport.bestPerformance.grade}</div>
                  <div><strong>Date:</strong> {formatDate(studentReport.bestPerformance.testDate)}</div>
                </div>
              </div>
            )}

            {/* Worst Performance */}
            {studentReport.worstPerformance && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2 flex items-center">
                  📉 Needs Improvement
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Subject:</strong> {studentReport.worstPerformance.subject}</div>
                  <div><strong>Score:</strong> {studentReport.worstPerformance.score}/{studentReport.worstPerformance.maxScore}</div>
                  <div><strong>Percentage:</strong> {studentReport.worstPerformance.percentage?.toFixed(1)}%</div>
                  <div><strong>Grade:</strong> {studentReport.worstPerformance.grade}</div>
                  <div><strong>Date:</strong> {formatDate(studentReport.worstPerformance.testDate)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {selectedStudent && studentMarks.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Test Results Found</h3>
            <p className="text-gray-600 mb-4">
              {selectedStudent.name} doesn't have any test results yet.
            </p>
            <p className="text-sm text-gray-500">
              Add some test marks first to generate a performance report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
