import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../lib/darkModeContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/volunteering', label: 'Opportunities' },
    { path: '/hours-tracker', label: 'Leaderboard' },
    { path: '/submit-hours', label: 'Submit Hours', isPrimary: true },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
      isScrolled
        ? darkMode
          ? 'bg-transparent backdrop-blur-sm border-transparent'
          : 'bg-transparent backdrop-blur-sm border-transparent'
        : darkMode 
          ? 'bg-gradient-to-r from-blue-950/80 via-gray-950/90 to-red-950/80 backdrop-blur-xl border-gray-700/30' 
          : 'bg-white/80 backdrop-blur-xl border-gray-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                    alt="Juanita High School"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Juanita NHS
                  </h1>
                  <p className={`text-xs leading-none ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>National Honor Society</p>
                </div>
              </div>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800 text-amber-400 hover:bg-gray-700 hover:text-amber-300' 
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
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? darkMode 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-blue-900 text-white shadow-lg'
                    : item.isPrimary
                    ? 'bg-gradient-to-r from-blue-600 to-red-500 text-white hover:shadow-lg hover:scale-105 shadow-md'
                    : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-blue-900 hover:bg-blue-50'
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
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
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
