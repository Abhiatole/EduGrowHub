/**
 * Features Page Component
 * 
 * Detailed overview of EduGrowHub platform features and capabilities.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  MessageCircle, 
  Shield, 
  Clock, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

/**
 * Features Page Component
 */
const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Engage with dynamic content, real-time assessments, and multimedia resources designed to enhance your learning experience.',
      benefits: [
        'Interactive quizzes and tests',
        'Multimedia content support',
        'Real-time feedback',
        'Adaptive learning paths'
      ]
    },
    {
      icon: Users,
      title: 'Collaborative Environment',
      description: 'Connect with peers and teachers in a supportive community that fosters collaborative learning and knowledge sharing.',
      benefits: [
        'Teacher-student communication',
        'Class discussions and forums',
        'Group study sessions',
        'Peer-to-peer learning'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics, performance insights, and comprehensive progress reports.',
      benefits: [
        'Detailed performance analytics',
        'Progress visualization',
        'Goal setting and tracking',
        'Historical data analysis'
      ]
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges, certificates, and recognition as you master new skills and reach important learning milestones.',
      benefits: [
        'Digital certificates',
        'Achievement badges',
        'Skill verification',
        'Progress recognition'
      ]
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integration',
      description: 'Stay connected with instant notifications, reminders, and updates delivered directly to your WhatsApp.',
      benefits: [
        'Instant test notifications',
        'Deadline reminders',
        'Grade updates',
        'Important announcements'
      ]
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security, ensuring privacy and confidentiality at all times.',
      benefits: [
        'Data encryption',
        'Secure authentication',
        'Privacy protection',
        'Regular security updates'
      ]
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access your learning materials, tests, and resources anytime, anywhere with our always-available platform.',
      benefits: [
        'Round-the-clock access',
        'No downtime learning',
        'Flexible scheduling',
        'Global accessibility'
      ]
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Seamlessly switch between devices with our fully responsive design optimized for desktop, tablet, and mobile.',
      benefits: [
        'Mobile-first design',
        'Cross-device synchronization',
        'Touch-friendly interface',
        'Offline capabilities'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">EduGrowHub</h1>
            </Link>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-blue-600 font-medium">
                Features
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-blue-600 block">Modern Learning</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the comprehensive suite of tools and features that make EduGrowHub 
            the perfect platform for students, teachers, and educational institutions.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students and teachers who are already benefiting from 
            our comprehensive learning management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/student/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
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
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="text-lg font-semibold mb-4">Get Started</h6>
              <ul className="space-y-2">
                <li><Link to="/student/login" className="text-gray-400 hover:text-white">Student Login</Link></li>
                <li><Link to="/teacher/login" className="text-gray-400 hover:text-white">Teacher Login</Link></li>
                <li><Link to="/student/register" className="text-gray-400 hover:text-white">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 EduGrowHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
