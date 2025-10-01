import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  Heart, 
  BookOpen, 
  MapPin, 
  Clock, 
  ArrowRight,
  Star,
  Feather
} from 'lucide-react';
import { FloatingLogos } from '../components/FloatingLogos';

export function HomePage() {
  const pillars = [
    {
      icon: BookOpen,
      title: 'Scholarship',
      description: 'Excellence in academic achievement and lifelong learning',
      color: 'from-blue-900 to-blue-700',
      accent: 'border-blue-900 bg-blue-50'
    },
    {
      icon: Heart,
      title: 'Service',
      description: 'Dedication to helping others and improving our community',
      color: 'from-red-600 to-red-500',
      accent: 'border-red-600 bg-red-50'
    },
    {
      icon: Star,
      title: 'Leadership',
      description: 'Developing skills to guide and inspire positive change',
      color: 'from-yellow-600 to-yellow-500',
      accent: 'border-yellow-600 bg-yellow-50'
    },
    {
      icon: Award,
      title: 'Character',
      description: 'Upholding integrity, honesty, and moral excellence',
      color: 'from-green-700 to-green-600',
      accent: 'border-green-700 bg-green-50'
    }
  ];

  const stats = [
    { number: '150+', label: 'Active Members', icon: Users },
    { number: '2,500+', label: 'Service Hours', icon: Clock },
    { number: '25+', label: 'Projects Completed', icon: Award },
    { number: '95%', label: 'College Bound', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-red-50">
      <FloatingLogos />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-red-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(30,58,138,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.3),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center items-center space-x-6 mb-8">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src="https://resources.finalsite.net/images/f_auto,q_auto/v1605026389/lwsdorg/azffuqvgwggxboecskaw/nhs_logo_smaller.jpg"
                  alt="NHS Logo"
                  className="w-28 h-28 object-contain drop-shadow-2xl rounded-2xl"
                />
              </motion.div>
              <motion.div 
                className="w-2 h-16 bg-gradient-to-b from-blue-900 to-red-600 rounded-full"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="relative"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-blue-900 to-red-600 rounded-2xl flex items-center justify-center drop-shadow-2xl">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                    alt="Juanita High School"
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </motion.div>
            </div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-900 to-red-600 bg-clip-text text-transparent">
                Juanita High School
              </span>
              <br />
              <span className="text-gray-800 relative">
                National Honor Society
                <motion.div 
                  className="absolute -top-2 -right-8"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Feather className="w-8 h-8 text-yellow-600" />
                </motion.div>
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Where academic excellence meets community service. Join our distinguished chapter 
              of scholars, leaders, and changemakers dedicated to making a lasting impact.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/submit-hours"
                className="group bg-gradient-to-r from-blue-900 to-red-600 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Submit Service Hours</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/volunteering"
                className="group border-4 border-blue-900 text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-blue-900 hover:text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Discover Opportunities</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-y-4 border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-900 to-red-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              The Four Pillars of Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our foundation rests upon four sacred principles that guide every member 
              towards greatness and meaningful contribution to society.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border-4 ${pillar.accent}`}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg mx-auto`}>
                  <pillar.icon className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-red-600 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Make Your Mark?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the ranks of distinguished scholars and community leaders. Your journey towards excellence starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/submit-hours"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>Log Service Hours</span>
              </Link>
              
              <Link
                to="/volunteering"
                className="group border-4 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-900 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Explore Opportunities</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}