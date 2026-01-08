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
  Trophy
} from 'lucide-react';
import { useDarkMode } from '../lib/darkModeContext';

export function HomePage() {
  const { darkMode } = useDarkMode();

  const pillars = [
    {
      icon: BookOpen,
      title: 'Scholarship',
      description: 'Excellence in academic achievement and lifelong learning',
      color: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/25'
    },
    {
      icon: Heart,
      title: 'Service',
      description: 'Dedication to helping others and improving our community',
      color: 'from-red-500 to-red-600',
      glow: 'shadow-red-500/25'
    },
    {
      icon: Star,
      title: 'Leadership',
      description: 'Developing skills to guide and inspire positive change',
      color: 'from-amber-500 to-amber-600',
      glow: 'shadow-amber-500/25'
    },
    {
      icon: Award,
      title: 'Character',
      description: 'Upholding integrity, honesty, and moral excellence',
      color: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-500/25'
    }
  ];

  const stats = [
    { number: '150+', label: 'Active Members', icon: Users, darkColor: 'text-blue-400', lightColor: 'text-blue-600' },
    { number: '2,500+', label: 'Service Hours', icon: Clock, darkColor: 'text-emerald-400', lightColor: 'text-emerald-600' },
    { number: '25+', label: 'Projects', icon: Award, darkColor: 'text-amber-400', lightColor: 'text-amber-600' },
    { number: '95%', label: 'College Bound', icon: BookOpen, darkColor: 'text-purple-400', lightColor: 'text-purple-600' }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      darkMode 
        ? 'bg-gray-950' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'
    }`}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]' 
            : 'bg-[radial-gradient(circle_at_30%_20%,rgba(30,58,138,0.25),transparent_50%)]'
        }`} />
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.15),transparent_50%)]' 
            : 'bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.25),transparent_50%)]'
        }`} />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logos */}
            <div className="flex justify-center items-center space-x-6 mb-8">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src="https://resources.finalsite.net/images/f_auto,q_auto/v1605026389/lwsdorg/azffuqvgwggxboecskaw/nhs_logo_smaller.jpg"
                  alt="NHS Logo"
                  className="w-24 h-24 object-contain rounded-2xl shadow-2xl shadow-blue-500/25"
                />
              </motion.div>
              <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${
                darkMode ? 'from-blue-500 to-red-500' : 'from-blue-900 to-red-600'
              }`} />
              <motion.div 
                className="relative"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                    alt="Juanita High School"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </motion.div>
            </div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                Juanita High School
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
                National Honor Society
              </span>
            </motion.h1>
            
            <motion.p 
              className={`text-xl mb-10 max-w-3xl mx-auto leading-relaxed ${
                darkMode ? 'text-gray-400' : 'text-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Where academic excellence meets community service. Join our distinguished chapter 
              of scholars, leaders, and changemakers dedicated to making a lasting impact.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/submit-hours"
                className="group bg-gradient-to-r from-blue-600 to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Submit Service Hours</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/hours-tracker"
                className={`group px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 flex items-center space-x-2 ${
                  darkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>View Leaderboard</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 border-y ${
        darkMode 
          ? 'bg-gray-900/50 border-gray-800' 
          : 'bg-white shadow-sm border-gray-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <stat.icon className={`w-7 h-7 ${darkMode ? stat.darkColor : stat.lightColor}`} />
                </div>
                <div className={`text-3xl lg:text-4xl font-bold mb-1 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.number}
                </div>
                <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              The Four Pillars of Excellence
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Our foundation rests upon four sacred principles that guide every member 
              towards greatness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                    : 'bg-white border-gray-300 hover:border-blue-400 shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg ${pillar.glow}`}>
                  <pillar.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{pillar.title}</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-red-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Make Your Mark?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join the ranks of distinguished scholars and community leaders. Your journey towards excellence starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/submit-hours"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>Log Service Hours</span>
              </Link>
              
              <Link
                to="/volunteering"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2"
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
