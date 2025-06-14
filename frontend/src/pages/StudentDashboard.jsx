/**
 * Student Dashboard Page
 * 
 * Main dashboard for students showing test results, progress,
 * and quick access to important features.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Calendar, MessageSquare } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { StudentService } from '../services/studentService';
import toast from 'react-hot-toast';

/**
 * Student Dashboard Component
 */
const StudentDashboard = () => {
  const [userData, setUserData] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    highestScore: 0,
    recentTests: 0
  });
  const [loading, setLoading] = useState(true);

  /**
   * Load dashboard data
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const profileData = await StudentService.getProfile();
      setUserData(profileData.student || {});

      // Load test results
      const resultsData = await StudentService.getTestResults();
      const results = resultsData.testResults || [];
      setTestResults(results);

      // Calculate statistics
      calculateStats(results);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate student statistics
   */
  const calculateStats = (results) => {
    if (results.length === 0) {
      setStats({
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        recentTests: 0
      });
      return;
    }

    const totalTests = results.length;
    const scores = results.map(result => (result.marks / result.maxMarks) * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    
    // Recent tests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTests = results.filter(result => 
      new Date(result.testDate) > thirtyDaysAgo
    ).length;

    setStats({
      totalTests,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      recentTests
    });
  };

  /**
   * Get grade based on percentage
   */
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout userRole="student" userData={userData} title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="student" userData={userData} title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {userData.name || 'Student'}!
          </h2>
          <p className="text-blue-100">
            Ready to check your latest test results and track your progress?
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highestScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Tests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentTests}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No test results yet</p>
                  <p className="text-sm text-gray-400">
                    Your test results will appear here once your teacher enters them
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.slice(0, 5).map((result, index) => {
                    const percentage = (result.marks / result.maxMarks) * 100;
                    const gradeInfo = getGrade(percentage);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{result.subject}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(result.testDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {result.marks}/{result.maxMarks}
                          </p>
                          <p className={`text-sm font-medium ${gradeInfo.color}`}>
                            {gradeInfo.grade} ({percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {testResults.length > 5 && (
                    <Button variant="outline" fullWidth>
                      View All Results
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  icon={BarChart3}
                  iconPosition="left"
                >
                  View All Test Results
                </Button>
                
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={TrendingUp}
                  iconPosition="left"
                >
                  Performance Analytics
                </Button>
                
                <Button 
                  variant="outline" 
                  fullWidth 
                  icon={MessageSquare}
                  iconPosition="left"
                >
                  Contact Teacher
                </Button>
              </div>

              {/* Performance Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Performance Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tests Completed:</span>
                    <span className="font-medium text-blue-900">{stats.totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Average:</span>
                    <span className="font-medium text-blue-900">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Best Performance:</span>
                    <span className="font-medium text-blue-900">{stats.highestScore}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
