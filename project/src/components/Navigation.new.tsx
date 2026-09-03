import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../lib/darkModeContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { darkMode } = useDarkMode();

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
    { path: '/submit-hours', label: 'Submit Hours' },
    { path: '/my-hours', label: 'My Hours' },
    { path: '/hours-tracker', label: 'Leaderboard' },
    { path: '/volunteering', label: 'Opportunities' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out`}
    style={{
      background: darkMode 
        ? `rgba(7, 15, 34, 0.82)`
        : `rgba(255, 255, 255, 0.88)`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: darkMode
        ? '1px solid rgba(230, 174, 34, 0.22)'
        : '1px solid rgba(20, 38, 80, 0.12)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {/* Wordmark - typographic, no logo */}
            <Link to="/" className="group flex items-center gap-3">
              <span
                className="relative block h-9 w-9 shrink-0"
                role="img"
                aria-label="Juanita High School raven crest"
              >
                <span
                  className="absolute inset-0 block"
                  style={{
                    WebkitMaskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                    maskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    background:
                      'linear-gradient(160deg, #f7e6a6 0%, #e6ae22 44%, #93640a 100%)',
                  }}
                />
                <img
                  src="/Raven_Head_-_Blue_Outline.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{
                    filter: 'grayscale(1) contrast(1.35)',
                    mixBlendMode: 'multiply',
                    opacity: 0.85,
                  }}
                />
              </span>
              <span className={`font-display text-[19px] font-semibold tracking-tight ${
                darkMode ? 'text-white' : 'text-navy-900'
              }`}>
                Juanita
              </span>
              <span className="h-4 w-px bg-gold-400/70" aria-hidden="true" />
              <span className={`text-[11px] font-semibold uppercase tracking-eyebrow ${
                darkMode ? 'text-gold-300' : 'text-gold-600'
              }`}>
                NHS
              </span>
            </Link>

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
            className={`md:hidden border-t-4 border-amber-500 transition-colors duration-200 ${
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
