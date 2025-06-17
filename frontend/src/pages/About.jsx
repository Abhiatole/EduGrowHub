/**
 * About Page Component
 * 
 * Information about EduGrowHub platform, mission, and team.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  Heart, 
  Users, 
  TrendingUp, 
  Award,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

/**
 * About Page Component
 */
const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Excellence in Education',
      description: 'We strive to provide the highest quality educational tools and resources to help students achieve their academic goals.'
    },
    {
      icon: Heart,
      title: 'Student-Centered Approach',
      description: 'Every feature and decision is made with the student experience in mind, ensuring learning is engaging and effective.'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'We believe in fostering strong connections between students, teachers, and educational institutions.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Innovation',
      description: 'We constantly evolve our platform to incorporate the latest educational technologies and methodologies.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Teachers' },
    { number: '100+', label: 'Schools' },
    { number: '99%', label: 'Satisfaction Rate' }
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
              <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link to="/about" className="text-blue-600 font-medium">
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
            About
            <span className="text-blue-600 block">EduGrowHub</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're on a mission to transform education through innovative technology, 
            making learning more accessible, engaging, and effective for everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                EduGrowHub was founded with a simple yet powerful vision: to create a 
                comprehensive learning management system that bridges the gap between 
                traditional education and modern technology.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that every student deserves access to quality education, 
                regardless of their location, background, or circumstances. Our platform 
                is designed to empower educators and inspire learners through innovative 
                tools and personalized experiences.
              </p>
              <div className="flex items-center space-x-4">
                <Award className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Recognized as a leader in educational technology
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Our Impact</h4>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-200 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-blue-100">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h3>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {value.title}
                    </h4>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h3>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                EduGrowHub was born from the recognition that traditional educational 
                systems needed to evolve to meet the demands of the digital age. Founded 
                by a team of educators, technologists, and visionaries, we set out to 
                create a platform that would revolutionize how students learn and teachers teach.
              </p>
              <p className="text-xl leading-relaxed mb-6">
                Starting as a small project to help local schools manage their assessments 
                and track student progress, EduGrowHub has grown into a comprehensive 
                learning management system trusted by educational institutions worldwide.
              </p>
              <p className="text-xl leading-relaxed">
                Today, we continue to innovate and expand our offerings, always with the 
                goal of making education more accessible, engaging, and effective for 
                learners of all ages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Join Our Educational Revolution
          </h3>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Be part of a community that's transforming education through technology. 
            Start your journey with EduGrowHub today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
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

export default About;
