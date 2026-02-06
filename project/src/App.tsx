import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navigation } from './components/Navigation.new';
import { HomePage } from './pages/HomePage';
import { SubmitHoursPage } from './pages/SubmitHoursPage';
import { VolunteeringPage } from './pages/VolunteeringPage';
import { HoursTrackerPage } from './pages/HoursTrackerPage';
import { Footer } from './components/Footer';
import { DarkModeProvider, useDarkMode } from './lib/darkModeContext';
import { Component, ErrorInfo, ReactNode } from 'react';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 404 Not Found Page
function NotFoundPage() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="text-center max-w-md">
        <h1 className={`text-8xl font-bold mb-4 ${
          darkMode ? 'text-gray-700' : 'text-gray-300'
        }`}>404</h1>
        <h2 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>Page Not Found</h2>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function AppContent() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit-hours" element={<SubmitHoursPage />} />
          <Route path="/hours-tracker" element={<HoursTrackerPage />} />
          <Route path="/volunteering" element={<VolunteeringPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <Router>
          <AppContent />
        </Router>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;