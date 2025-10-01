import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { SubmitHoursPage } from './pages/SubmitHoursPage';
import { VolunteeringPage } from './pages/VolunteeringPage';
import { Footer } from './components/Footer';
import { DarkModeProvider } from './lib/darkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-200 dark:bg-gray-900 bg-gradient-to-br from-white via-blue-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div style={{ transform: 'scale(1.1)', transformOrigin: 'top center' }}>
            <Navigation />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/submit-hours" element={<SubmitHoursPage />} />
                <Route path="/volunteering" element={<VolunteeringPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </Router>
    </DarkModeProvider>
  );
}

export default App;