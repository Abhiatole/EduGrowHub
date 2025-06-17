/**
 * Students Management Page
 * 
 * Teacher interface for viewing enrolled students, adding new students,
 * and managing student information.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TeacherService } from '../services/teacherService';
import toast from 'react-hot-toast';

/**
 * Students Component
 */
const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Fetch all students for this teacher
   */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getStudents();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter students based on search term
   */
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handle new student form input
   */
  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Validate new student form
   */
  const validateNewStudent = () => {
    if (!newStudent.name.trim()) {
      toast.error('Student name is required');
      return false;
    }
    if (!newStudent.email.trim()) {
      toast.error('Student email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  /**
   * Add new student
   */
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!validateNewStudent()) {
      return;
    }

    setAddingStudent(true);
    
    try {
      await TeacherService.addStudent({
        name: newStudent.name.trim(),
        email: newStudent.email.trim().toLowerCase()
      });
      
      toast.success('Student enrolled successfully!');
      
      // Reset form and refresh students list
      setNewStudent({ name: '', email: '' });
      setShowAddForm(false);
      await fetchStudents();

    } catch (error) {
      console.error('Failed to add student:', error);
      toast.error(error.message || 'Failed to enroll student');
    } finally {
      setAddingStudent(false);
    }
  };

  /**
   * Cancel add student form
   */
  const cancelAddStudent = () => {
    setNewStudent({ name: '', email: '' });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Student Management</h1>
              <p className="text-blue-100">
                Manage your enrolled students and track their progress
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              icon={UserPlus}
              iconPosition="left"
              className="bg-white text-blue-700 hover:bg-gray-50"
            >
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Enroll New Student</h2>
          </div>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Student Name *"
                name="name"
                type="text"
                placeholder="Enter student's full name"
                value={newStudent.name}
                onChange={handleNewStudentChange}
                required
              />
              <Input
                label="Email Address *"
                name="email"
                type="email"
                placeholder="Enter student's email"
                value={newStudent.email}
                onChange={handleNewStudentChange}
                icon={Mail}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={cancelAddStudent}
                disabled={addingStudent}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={addingStudent}
                disabled={addingStudent}
                icon={UserPlus}
                iconPosition="left"
              >
                {addingStudent ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
              Your Students ({filteredStudents.length})
            </h2>
            
            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              {students.length === 0 ? (
                <>
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start by enrolling your first student to begin tracking their progress
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    icon={UserPlus}
                    iconPosition="left"
                  >
                    Add Your First Student
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms to find the student you're looking for
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {student.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Mail className="h-4 w-4 mr-1" />
                        {student.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button className="p-1 rounded-md text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={BarChart3}
                      iconPosition="left"
                      onClick={() => {
                        // Navigate to student report
                        window.location.href = `/teacher/reports?student=${student.id}`;
                      }}
                    >
                      View Reports
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Edit3}
                      iconPosition="left"
                      onClick={() => {
                        // Navigate to enter marks
                        window.location.href = `/teacher/marks?student=${student.id}`;
                      }}
                    >
                      Add Marks
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">This Month</p>
                  <p className="text-2xl font-bold text-green-900">
                    {students.filter(s => 
                      new Date(s.enrolledDate).getMonth() === new Date().getMonth() &&
                      new Date(s.enrolledDate).getFullYear() === new Date().getFullYear()
                    ).length}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Active Today</p>
                  <p className="text-2xl font-bold text-yellow-900">{students.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              fullWidth
              icon={MessageSquare}
              iconPosition="left"
              onClick={() => {
                toast.info('Bulk messaging feature coming soon!');
              }}
            >
              Message All Students
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Students;
