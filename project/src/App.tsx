import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation.new';
import { HomePage } from './pages/HomePage';
import { SubmitHoursPage } from './pages/SubmitHoursPage';
import { VolunteeringPage } from './pages/VolunteeringPage';
import { HoursTrackerPage } from './pages/HoursTrackerPage';
import { Footer } from './components/Footer';
import { DarkModeProvider, useDarkMode } from './lib/darkModeContext';

function AppContent() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-black' : 'bg-white'}`}>
      <Navigation />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit-hours" element={<SubmitHoursPage />} />
          <Route path="/hours-tracker" element={<HoursTrackerPage />} />
          <Route path="/volunteering" element={<VolunteeringPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <AppContent />
      </Router>
    </DarkModeProvider>
  );
}

export default App;