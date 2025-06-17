/**
 * Enter Marks Page
 * 
 * Teacher interface for entering student marks with validation,
 * automatic grade calculation, and WhatsApp notifications.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Calculator, Send, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TeacherService } from '../services/teacherService';
import toast from 'react-hot-toast';

/**
 * EnterMarks Component
 */
const EnterMarks = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    score: '',
    maxScore: '',
    testDate: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Fetch students enrolled under this teacher
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
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Calculate percentage and grade
   */
  const calculateGrade = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { grade: 'A+', percentage };
    if (percentage >= 80) return { grade: 'A', percentage };
    if (percentage >= 70) return { grade: 'B+', percentage };
    if (percentage >= 60) return { grade: 'B', percentage };
    if (percentage >= 50) return { grade: 'C', percentage };
    if (percentage >= 35) return { grade: 'D', percentage };
    return { grade: 'F', percentage };
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter subject');
      return false;
    }
    if (!formData.score || formData.score < 0) {
      toast.error('Please enter a valid score');
      return false;
    }
    if (!formData.maxScore || formData.maxScore <= 0) {
      toast.error('Please enter a valid maximum score');
      return false;
    }
    if (parseFloat(formData.score) > parseFloat(formData.maxScore)) {
      toast.error('Score cannot be greater than maximum score');
      return false;
    }
    if (!formData.testDate) {
      toast.error('Please enter test date');
      return false;
    }
    return true;
  };

  /**
   * Submit marks for selected student
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        subject: formData.subject.trim(),
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        testDate: formData.testDate
      };

      await TeacherService.addMarks(selectedStudent, payload);
      
      const { grade, percentage } = calculateGrade(payload.score, payload.maxScore);
      
      toast.success(`Marks submitted successfully! Grade: ${grade} (${percentage.toFixed(1)}%)`);
      
      // Reset form
      setFormData({
        subject: '',
        score: '',
        maxScore: '',
        testDate: new Date().toISOString().split('T')[0]
      });
      setSelectedStudent('');

    } catch (error) {
      console.error('Failed to submit marks:', error);
      toast.error(error.message || 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  // Show preview of grade calculation
  const previewGrade = () => {
    if (formData.score && formData.maxScore) {
      const score = parseFloat(formData.score);
      const maxScore = parseFloat(formData.maxScore);
      if (score >= 0 && maxScore > 0 && score <= maxScore) {
        return calculateGrade(score, maxScore);
      }
    }
    return null;
  };

  const preview = previewGrade();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Enter Student Marks</h1>
            <p className="text-green-100">
              Record test results and automatically notify students via WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Test Details</h2>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student *
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <Input
              label="Subject *"
              name="subject"
              type="text"
              placeholder="e.g., Mathematics, Science, English"
              value={formData.subject}
              onChange={handleChange}
              icon={BookOpen}
              required
            />

            {/* Score and Max Score */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Score Obtained *"
                name="score"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 85"
                value={formData.score}
                onChange={handleChange}
                required
              />
              <Input
                label="Maximum Score *"
                name="maxScore"
                type="number"
                min="1"
                step="0.1"
                placeholder="e.g., 100"
                value={formData.maxScore}
                onChange={handleChange}
                required
              />
            </div>

            {/* Test Date */}
            <Input
              label="Test Date *"
              name="testDate"
              type="date"
              value={formData.testDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />

            {/* Grade Preview */}
            {preview && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Grade Preview:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-900">{preview.grade}</span>
                    <span className="text-sm text-blue-700 block">
                      {preview.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              icon={Save}
              iconPosition="left"
              className="w-full"
            >
              {submitting ? 'Submitting Marks...' : 'Submit Marks & Notify Student'}
            </Button>
          </form>
        </Card>

        {/* Students Summary */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Your Students</h3>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No students enrolled yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Enroll students to start recording their marks
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Total Students: {students.length}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedStudent === student.id.toString()
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Send className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  WhatsApp Notification
                </h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Students will automatically receive their results via WhatsApp after submission.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnterMarks;
