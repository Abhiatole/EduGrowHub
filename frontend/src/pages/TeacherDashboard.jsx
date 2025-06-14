/**
 * Teacher Dashboard Page
 * 
 * Main dashboard for teachers with overview stats, recent activities,
 * and quick actions for managing students and tests.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  FileText,
  Plus,
  Eye,
  Download,
  Bell,
  Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TeacherService } from '../services/teacherService';
import { AuthContext } from '../App';
import toast from 'react-hot-toast';

/**
 * TeacherDashboard Component
 */
const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Active Tests',
      value: dashboardData?.activeTests || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Avg. Score',
      value: `${dashboardData?.averageScore || 0}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+2.5%',
      changeType: 'increase'
    },
    {
      name: 'Reports Generated',
      value: dashboardData?.reportsGenerated || 0,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'test_completed',
      student: 'John Doe',
      action: 'completed Math Test #3',
      time: '2 hours ago',
      score: '85%'
    },
    {
      id: 2,
      type: 'new_student',
      student: 'Jane Smith',
      action: 'joined your class',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'test_created',
      action: 'created Science Quiz #2',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'report_generated',
      action: 'generated monthly progress report',
      time: '2 days ago'
    }
  ];

  const upcomingTests = [
    {
      id: 1,
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      date: '2024-01-15',
      students: 25,
      duration: '2 hours'
    },
    {
      id: 2,
      title: 'Science Quiz #3',
      subject: 'Science',
      date: '2024-01-18',
      students: 22,
      duration: '45 minutes'
    },
    {
      id: 3,
      title: 'English Literature Test',
      subject: 'English',
      date: '2024-01-20',
      students: 28,
      duration: '1.5 hours'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your classroom today
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-center mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    stat.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'test_completed' ? 'bg-green-100' :
                    activity.type === 'new_student' ? 'bg-blue-100' :
                    activity.type === 'test_created' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'test_completed' && <Award className="h-4 w-4 text-green-600" />}
                    {activity.type === 'new_student' && <Users className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'test_created' && <BookOpen className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'report_generated' && <FileText className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.student && (
                        <span className="text-blue-600">{activity.student} </span>
                      )}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                {activity.score && (
                  <span className="text-sm font-medium text-green-600">{activity.score}</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-3" />
              Create New Test
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-3" />
              Manage Students
            </Button>
            <Link to="/teacher/reports">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                View Reports
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-3" />
              Schedule Test
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-3" />
              Send Notification
            </Button>
          </div>
        </Card>
      </div>

      {/* Upcoming Tests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Tests</h3>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule New
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{test.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {test.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(test.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {test.students} students
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {test.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
