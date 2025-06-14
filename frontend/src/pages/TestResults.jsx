/**
 * Test Results Page
 * 
 * Displays test results with detailed analysis, performance metrics,
 * and improvement suggestions.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  BarChart3,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { StudentService } from '../services/studentService';
import toast from 'react-hot-toast';

/**
 * TestResults Component
 */
const TestResults = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (testId) {
      fetchResults();
    } else {
      fetchLatestResults();
    }
  }, [testId]);

  /**
   * Fetch specific test results
   */
  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getTestResults(testId);
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch latest test results
   */
  const fetchLatestResults = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getLatestResults();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download results as PDF
   */
  const handleDownload = async () => {
    try {
      await StudentService.downloadResults(results.id);
      toast.success('Results downloaded successfully');
    } catch (error) {
      console.error('Failed to download results:', error);
      toast.error('Failed to download results');
    }
  };

  /**
   * Share results
   */
  const handleShare = async () => {
    try {
      const shareData = {
        title: `Test Results - ${results.testTitle}`,
        text: `I scored ${results.score}% on ${results.testTitle}!`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success('Results copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share results:', error);
      toast.error('Failed to share results');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading results..." />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
        <p className="text-gray-600 mb-4">You haven't completed any tests yet.</p>
        <Link to="/student/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'questions', name: 'Question Review', icon: BookOpen },
    { id: 'analysis', name: 'Performance Analysis', icon: TrendingUp },
    { id: 'suggestions', name: 'Improvement Tips', icon: Lightbulb }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{results.testTitle}</h1>
            <p className="text-gray-600 mt-1">
              {results.subject} • {new Date(results.completedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`p-6 ${getScoreBg(results.score)}`}>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(results.score)} mb-2`}>
              {results.score}%
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(results.score)} mb-2`}>
              Grade {getGrade(results.score)}
            </div>
            <p className="text-gray-600">Overall Score</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {results.correctAnswers}/{results.totalQuestions}
              </p>
              <p className="text-gray-600">Correct Answers</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
              </p>
              <p className="text-gray-600">Time Spent</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {results.rank}/{results.totalStudents}
              </p>
              <p className="text-gray-600">Class Rank</p>
            </div>
          </div>
        </Card>
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
            <div className="space-y-4">
              {results.topicPerformance?.map((topic, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                    <span className={`text-sm font-medium ${getScoreColor(topic.score)}`}>
                      {topic.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        topic.score >= 80 ? 'bg-green-500' : 
                        topic.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Comparison with Class */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Comparison</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Score</span>
                <span className={`font-semibold ${getScoreColor(results.score)}`}>
                  {results.score}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Class Average</span>
                <span className="font-semibold text-gray-900">
                  {results.classAverage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Score</span>
                <span className="font-semibold text-green-600">
                  {results.highestScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Rank</span>
                <span className="font-semibold text-blue-600">
                  {results.rank} of {results.totalStudents}
                </span>
              </div>
              <div className="pt-2 border-t">
                {results.score >= results.classAverage ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Above class average by {(results.score - results.classAverage).toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Below class average by {(results.classAverage - results.score).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'questions' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Question Review</h3>
          <div className="space-y-6">
            {results.questionResults?.map((question, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-6">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h4>
                  {question.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-gray-700 mb-3">{question.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Your Answer: </span>
                    <span className={question.correct ? 'text-green-600' : 'text-red-600'}>
                      {question.userAnswer || 'Not answered'}
                    </span>
                  </div>
                  {!question.correct && (
                    <div>
                      <span className="font-medium text-gray-600">Correct Answer: </span>
                      <span className="text-green-600">{question.correctAnswer}</span>
                    </div>
                  )}
                </div>
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {results.strengths?.map((strength, index) => (
                <li key={index} className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {strength}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {results.improvements?.map((improvement, index) => (
                <li key={index} className="flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {improvement}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personalized Study Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.suggestions?.map((suggestion, index) => (
              <div key={index} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">{suggestion.title}</h4>
                    <p className="text-blue-800 text-sm">{suggestion.description}</p>
                    {suggestion.resources && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-700 font-medium">Recommended Resources:</p>
                        <ul className="text-xs text-blue-600 mt-1">
                          {suggestion.resources.map((resource, idx) => (
                            <li key={idx}>• {resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/student/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              Return to Dashboard
            </Button>
          </Link>
          <Button className="w-full sm:w-auto">
            Practice More Questions
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Schedule Retake
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestResults;
