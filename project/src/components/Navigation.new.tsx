import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../lib/darkModeContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/volunteering', label: 'Opportunities' },
    { path: '/submit-hours', label: 'Submit Hours', isPrimary: true },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b-4 border-red-600 shadow-xl transition-colors duration-200 ${
      darkMode ? 'bg-gray-900/95' : 'bg-white/95'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                    alt="Juanita High School"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-red-600 bg-clip-text text-transparent">
                    Juanita NHS
                  </h1>
                  <p className={`text-xs leading-none transition-colors duration-200 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>National Honor Society</p>
                </div>
              </div>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-blue-900 text-white shadow-lg'
                    : item.isPrimary
                    ? 'bg-gradient-to-r from-blue-900 to-red-600 text-white hover:shadow-xl transform hover:-translate-y-1 shadow-lg rounded-xl'
                    : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl'
                    : 'text-gray-700 hover:text-blue-900 hover:bg-blue-50 rounded-xl'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-blue-900 hover:bg-blue-50'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t-4 border-red-600 transition-colors duration-200 ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-900 text-white'
                      : item.isPrimary
                      ? 'bg-gradient-to-r from-blue-900 to-red-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
