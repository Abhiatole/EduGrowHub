/**
 * Reports Page
 * 
 * Comprehensive reporting dashboard for teachers with data visualization,
 * filtering, and export capabilities.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  Users,
  BookOpen,
  Award,
  FileText,
  Search,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TeacherService } from '../services/teacherService';
import toast from 'react-hot-toast';

/**
 * Reports Component
 */
const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateRange: '30days',
    subject: 'all',
    testType: 'all',
    studentGroup: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  /**
   * Fetch report data
   */
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getReports(filters);
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Export reports
   */
  const handleExport = async (format) => {
    try {
      await TeacherService.exportReports(filters, format);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'tests', name: 'Tests', icon: BookOpen }
  ];

  const performanceMetrics = [
    {
      title: 'Class Average',
      value: '82.5%',
      change: '+5.2%',
      changeType: 'increase',
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: '94.8%',
      change: '+2.1%',
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Tests Conducted',
      value: '24',
      change: '+8',
      changeType: 'increase',
      icon: BookOpen,
      color: 'text-purple-600'
    },
    {
      title: 'Improvement Rate',
      value: '76.3%',
      change: '+3.4%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  const topPerformers = [
    { name: 'Alice Johnson', score: 95.2, improvement: '+8.5%', tests: 12 },
    { name: 'Michael Chen', score: 92.8, improvement: '+6.2%', tests: 11 },
    { name: 'Sarah Williams', score: 91.5, improvement: '+7.1%', tests: 12 },
    { name: 'David Brown', score: 89.3, improvement: '+5.8%', tests: 10 },
    { name: 'Emma Davis', score: 87.9, improvement: '+9.2%', tests: 11 }
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', average: 85.2, tests: 8, students: 28 },
    { subject: 'Science', average: 82.7, tests: 6, students: 25 },
    { subject: 'English', average: 88.1, tests: 7, students: 30 },
    { subject: 'History', average: 79.5, tests: 5, students: 22 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into student performance and progress
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => fetchReportData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
            <option value="1year">Last year</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="history">History</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.testType}
            onChange={(e) => handleFilterChange('testType', e.target.value)}
          >
            <option value="all">All Tests</option>
            <option value="quiz">Quizzes</option>
            <option value="exam">Exams</option>
            <option value="assignment">Assignments</option>
          </select>

          <div className="flex-1 max-w-xs">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <p className={`text-sm mt-1 ${metric.color}`}>
                      {metric.change} from last period
                    </p>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-xs text-gray-400 mt-1">Integration with chart library needed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Distribution</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Pie chart visualization would go here</p>
                  <p className="text-xs text-gray-400 mt-1">Integration with chart library needed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Improvement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformers.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.score}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.improvement}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.tests}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Subject Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                    <span className="text-lg font-bold text-blue-600">{subject.average}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{subject.tests} tests</span>
                    <span>{subject.students} students</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${subject.average}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'students' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Details</h3>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Detailed student performance data would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">This section would include individual student reports, progress tracking, and detailed analytics</p>
          </div>
        </Card>
      )}

      {activeTab === 'tests' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Analysis</h3>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Test analysis and statistics would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">This section would include test difficulty analysis, question performance, and completion rates</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
