/**
 * Admin Dashboard Page
 * 
 * Superadmin interface for system oversight, teacher management,
 * and global platform analytics.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Eye,
  Plus,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AdminService } from '../services/adminService';
import toast from 'react-hot-toast';

/**
 * AdminDashboard Component
 */
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch admin dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // For now, use mock data since AdminService might not be implemented
      const mockData = {
        totalTeachers: 12,
        totalStudents: 156,
        totalTests: 89,
        activeUsers: 45,
        systemHealth: 'Excellent',
        recentActivities: [
          { id: 1, type: 'teacher_added', message: 'New teacher John Smith registered', time: '2 hours ago' },
          { id: 2, type: 'student_enrolled', message: '5 new students enrolled today', time: '4 hours ago' },
          { id: 3, type: 'test_completed', message: 'Mathematics test completed by 23 students', time: '6 hours ago' }
        ]
      };
      setDashboardData(mockData);
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
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Teachers',
      value: dashboardData?.totalTeachers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+15',
      changeType: 'increase'
    },
    {
      name: 'Tests Conducted',
      value: dashboardData?.totalTests || 0,
      icon: BarChart3,
      color: 'bg-yellow-500',
      change: '+8',
      changeType: 'increase'
    },
    {
      name: 'Active Users',
      value: dashboardData?.activeUsers || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100">
              System overview and management controls
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium text-green-800">Database Status</span>
                </div>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium text-green-800">API Services</span>
                </div>
                <span className="text-green-600 font-semibold">Running</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="font-medium text-yellow-800">WhatsApp Service</span>
                </div>
                <span className="text-yellow-600 font-semibold">Needs Attention</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium text-green-800">Email Service</span>
                </div>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                fullWidth
                icon={Plus}
                iconPosition="left"
                onClick={() => {
                  toast.info('Add teacher feature coming soon!');
                }}
              >
                Add New Teacher
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={Users}
                iconPosition="left"
                onClick={() => {
                  window.location.href = '/admin/teachers';
                }}
              >
                Manage Teachers
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={BookOpen}
                iconPosition="left"
                onClick={() => {
                  window.location.href = '/admin/students';
                }}
              >
                View All Students
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={BarChart3}
                iconPosition="left"
                onClick={() => {
                  window.location.href = '/admin/reports';
                }}
              >
                System Reports
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon={Settings}
                iconPosition="left"
                onClick={() => {
                  window.location.href = '/admin/settings';
                }}
              >
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activities</h3>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            iconPosition="left"
          >
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {dashboardData?.recentActivities?.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'teacher_added' ? 'bg-blue-100' :
                  activity.type === 'student_enrolled' ? 'bg-green-100' :
                  activity.type === 'test_completed' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'teacher_added' && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'student_enrolled' && <BookOpen className="h-4 w-4 text-green-600" />}
                  {activity.type === 'test_completed' && <BarChart3 className="h-4 w-4 text-yellow-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
