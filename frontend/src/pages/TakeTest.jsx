/**
 * Take Test Page
 * 
 * Interactive test-taking interface with timer, question navigation,
 * and auto-save functionality.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send,
  AlertCircle,
  CheckCircle,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { StudentService } from '../services/studentService';
import { AuthContext } from '../App';
import toast from 'react-hot-toast';

/**
 * TakeTest Component
 */
const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showNavigator, setShowNavigator] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        handleSave(true);
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [answers]);

  /**
   * Fetch test data
   */
  const fetchTest = async () => {
    try {
      setLoading(true);
      const testData = await StudentService.getTest(testId);
      setTest(testData);
      setTimeRemaining(testData.duration * 60); // Convert minutes to seconds
      
      // Load saved answers if any
      const savedAnswers = await StudentService.getSavedAnswers(testId);
      if (savedAnswers) {
        setAnswers(savedAnswers);
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
      toast.error('Failed to load test');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle answer selection
   */
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  /**
   * Save progress
   */
  const handleSave = async (isAutoSave = false) => {
    try {
      setSaving(true);
      await StudentService.saveTestProgress(testId, answers);
      if (!isAutoSave) {
        toast.success('Progress saved successfully');
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      if (!isAutoSave) {
        toast.error('Failed to save progress');
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Submit test
   */
  const handleSubmit = async (isAutoSubmit = false) => {
    const confirmed = isAutoSubmit || window.confirm(
      'Are you sure you want to submit your test? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await StudentService.submitTest(testId, answers);
      toast.success('Test submitted successfully!');
      navigate('/student/results');
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Navigate to next question
   */
  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  /**
   * Navigate to previous question
   */
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  /**
   * Toggle question flag
   */
  const toggleFlag = (questionIndex) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  /**
   * Format time display
   */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading test..." />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Not Found</h2>
        <p className="text-gray-600 mb-4">The requested test could not be found.</p>
        <Button onClick={() => navigate('/student/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / test.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-gray-600 mt-1">{test.subject} • {test.totalQuestions} Questions</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className={`flex items-center px-3 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowNavigator(!showNavigator)}
              className="flex items-center"
            >
              {showNavigator ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Navigator
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {answeredCount} of {test.questions.length} answered</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigator */}
        {showNavigator && (
          <Card className="lg:col-span-1 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[test.questions[index].id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {flaggedQuestions.has(index) && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                Current
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center">
                <Flag className="h-3 w-3 text-red-500 mr-2" />
                Flagged
              </div>
            </div>
          </Card>
        )}

        {/* Question Content */}
        <Card className={`${showNavigator ? 'lg:col-span-3' : 'lg:col-span-4'} p-6`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Question {currentQuestion + 1} of {test.questions.length}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFlag(currentQuestion)}
              className={flaggedQuestions.has(currentQuestion) ? 'text-red-600' : ''}
            >
              <Flag className="h-4 w-4 mr-1" />
              {flaggedQuestions.has(currentQuestion) ? 'Unflag' : 'Flag'}
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-gray-900 text-lg leading-relaxed">{currentQ.question}</p>
            {currentQ.image && (
              <img 
                src={currentQ.image} 
                alt="Question" 
                className="mt-4 max-w-full h-auto rounded-lg"
              />
            )}
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQ.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  className="mt-1 mr-3 text-blue-600"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => handleSave()}
                disabled={saving}
                loading={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              
              {currentQuestion === test.questions.length - 1 ? (
                <Button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  loading={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Test
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Warning for low time */}
      {timeRemaining < 300 && timeRemaining > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">
              Warning: Less than 5 minutes remaining! Your test will be automatically submitted when time expires.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TakeTest;
