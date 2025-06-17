/**
 * Home Page Component
 * 
 * Landing page for EduGrowHub with navigation to login pages
 * and platform overview.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Award, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

/**
 * HomePage Component
 */
const HomePage = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Engage with dynamic content and real-time assessments'
    },
    {
      icon: Users,
      title: 'Collaborative Environment',
      description: 'Connect with peers and teachers in a supportive community'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges and certificates as you master new skills'
    }
  ];

  const benefits = [
    'Personalized learning paths',
    'Real-time feedback and assessment',
    'Mobile-friendly platform',
    'Comprehensive progress reports',
    'WhatsApp integration for notifications',
    'Secure and reliable platform'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">EduGrowHub</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link to="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="text-blue-600 block">EduGrowHub</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive Learning Management System designed to empower students and educators 
              with innovative tools for modern education.
            </p>
            {process.env.REACT_APP_ENVIRONMENT === 'development' && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-yellow-800 mb-2">Demo Credentials:</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>Student: student@demo.com / demo123</p>
                  <p>Teacher: teacher@demo.com / demo123</p>
                  <p>Admin: admin@demo.com / admin123</p>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Student Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/teacher/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Teacher Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <Link 
                to="/student/register" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                New student? Register here
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600">
              Everything you need for effective online learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose EduGrowHub?
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Our platform combines cutting-edge technology with proven educational methodologies 
                to create an unparalleled learning experience.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Ready to Get Started?</h4>
              <p className="text-blue-100 mb-6">
                Join thousands of students and teachers who are already transforming 
                their educational journey with EduGrowHub.
              </p>
              <div className="space-y-3">
                <Link to="/student/register">
                  <Button variant="outline" className="w-full bg-white text-blue-600 border-white hover:bg-gray-50">
                    Start Learning Today
                  </Button>
                </Link>
                <Link to="/teacher/login">
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-blue-600">
                    Teacher Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
                <h5 className="text-xl font-bold">EduGrowHub</h5>
              </div>
              <p className="text-gray-400">
                Empowering education through innovative technology and personalized learning experiences.
              </p>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2">
                <li><Link to="/student/login" className="text-gray-400 hover:text-white">Student Login</Link></li>
                <li><Link to="/teacher/login" className="text-gray-400 hover:text-white">Teacher Login</Link></li>
                <li><Link to="/student/register" className="text-gray-400 hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-4">Contact Info</h6>
              <p className="text-gray-400">
                Email: support@edugrowhub.com<br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 EduGrowHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
