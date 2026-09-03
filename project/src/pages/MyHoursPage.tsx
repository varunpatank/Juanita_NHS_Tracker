import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Award, Star, Users, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../lib/darkModeContext';
import { fetchMembers, type MemberHours } from '../lib/googleSheets';
import { PageHero } from '../components/PageHero';

export function MyHoursPage() {
  const { darkMode } = useDarkMode();
  const [nameQuery, setNameQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [result, setResult] = useState<MemberHours | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    const trimmed = nameQuery.trim();
    if (trimmed.length < 2) return;
    setIsLoading(true);
    setHasSearched(false);
    setResult(null);
    setNotFound(false);

    try {
      const members = await fetchMembers();
      const match = members.find(m =>
        m.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        setResult(match);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const totalGoal = 30;
  const semester1Goal = 10;
  const progress = result ? Math.min((result.totalHours / totalGoal) * 100, 100) : 0;
  const semester1Done = result ? result.totalHours >= semester1Goal : false;
  const yearDone = result ? result.totalHours >= totalGoal : false;

  const getHoursColor = (hrs: number) => {
    if (hrs >= 30) return 'text-emerald-500';
    if (hrs >= 20) return darkMode ? 'text-gold-300' : 'text-blue-600';
    if (hrs >= 10) return darkMode ? 'text-amber-400' : 'text-amber-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  return (
    <div className={`min-h-screen ${
      darkMode
        ? 'bg-gradient-to-br from-navy-950 via-navy-950 to-navy-950'
        : 'bg-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHero
          title="My Hours"
          subtitle="Look up your personal service hour progress and check your NHS standing."
          className="mb-8"
        />
      </motion.div>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`p-6 rounded-2xl border mb-6 ${
            darkMode
              ? 'bg-navy-900/60 border-white/10/60'
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <label className={`block text-sm font-bold mb-3 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
            Enter Your Full Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={nameQuery}
              onChange={e => setNameQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="e.g. Jane Smith"
              className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                darkMode
                  ? 'bg-navy-950 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
              }`}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || nameQuery.trim().length < 2}
              className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                nameQuery.trim().length >= 2 && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : darkMode
                  ? 'bg-navy-800 text-navy-200/60 cursor-not-allowed'
                  : 'bg-gray-200 text-navy-200/75 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Look Up
            </button>
          </div>
          <p className={`text-xs mt-2 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
            Enter your name exactly as it appears in the system (case-insensitive)
          </p>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {hasSearched && notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-6 rounded-2xl border text-center ${
                darkMode
                  ? 'bg-navy-900/60 border-white/10/60'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <AlertCircle className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Name Not Found
              </h3>
              <p className={`text-sm ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>
                No record found for <strong>"{nameQuery}"</strong>. Make sure you type your name exactly as you registered. If you've never submitted hours, use the Submit Hours page to create your profile.
              </p>
            </motion.div>
          )}

          {hasSearched && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Name & Status Card */}
              <div className={`p-5 rounded-2xl border ${
                darkMode
                  ? 'bg-navy-900/60 border-white/10/60'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {result.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}>
                      {result.grade}
                    </p>
                  </div>
                  {result.inducted ? (
                    <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                      ✓ Inducted
                    </span>
                  ) : (
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                      darkMode ? 'bg-navy-800 text-navy-200/75 border-white/10' : 'bg-gray-100 text-navy-200/60 border-gray-200'
                    }`}>
                      Pending Induction
                    </span>
                  )}
                </div>
              </div>

              {/* Total Hours + Progress */}
              <div className={`p-5 rounded-2xl border ${
                darkMode
                  ? 'bg-navy-900/60 border-white/10/60'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                  Total Hours
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className={`text-5xl font-bold ${getHoursColor(result.totalHours)}`}>
                    {result.totalHours.toFixed(1)}
                  </span>
                  <span className={`text-xl font-normal mb-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                    / {totalGoal}
                  </span>
                </div>

                {/* Progress bar */}
                <div className={`h-4 rounded-full overflow-hidden mb-3 ${darkMode ? 'bg-navy-800' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      yearDone
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : semester1Done
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500'
                    }`}
                  />
                </div>

                {/* Milestone badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl text-center ${
                    semester1Done
                      ? (darkMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                      : (darkMode ? 'bg-navy-800/50 border border-white/10' : 'bg-gray-100 border border-gray-200')
                  }`}>
                    {semester1Done ? (
                      <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <Clock className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`} />
                    )}
                    <p className={`text-xs font-semibold ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      1st Semester
                    </p>
                    <p className={`text-sm font-bold ${
                      semester1Done
                        ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                        : (darkMode ? 'text-white' : 'text-gray-900')
                    }`}>
                      {semester1Done ? '✓ Done' : `${Math.max(0, semester1Goal - result.totalHours).toFixed(1)} more needed`}
                    </p>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>10 hrs due 1st sem</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${
                    yearDone
                      ? (darkMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                      : (darkMode ? 'bg-navy-800/50 border border-white/10' : 'bg-gray-100 border border-gray-200')
                  }`}>
                    {yearDone ? (
                      <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <Award className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`} />
                    )}
                    <p className={`text-xs font-semibold ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      Full Year
                    </p>
                    <p className={`text-sm font-bold ${
                      yearDone
                        ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                        : (darkMode ? 'text-white' : 'text-gray-900')
                    }`}>
                      {yearDone ? '✓ Done' : `${Math.max(0, totalGoal - result.totalHours).toFixed(1)} more needed`}
                    </p>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>30 hrs due end of year</p>
                  </div>
                </div>
              </div>

              {/* Hours Breakdown */}
              <div className={`p-5 rounded-2xl border ${
                darkMode
                  ? 'bg-navy-900/60 border-white/10/60'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                  Hours Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                    <Clock className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-gold-300' : 'text-blue-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>
                      {result.summerHours}
                    </p>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Summer</p>
                    <p className={`text-xs ${darkMode ? 'text-gold-300/60' : 'text-blue-500/70'}`}>max 8</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                    <Users className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-gold-300' : 'text-blue-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>
                      {result.chapterHours}
                    </p>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Chapter</p>
                    <p className={`text-xs ${darkMode ? 'text-gold-300/60' : 'text-blue-500/70'}`}>min 6 req.</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                    <Star className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {result.otherHours}
                    </p>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Other</p>
                    <p className={`text-xs ${darkMode ? 'text-emerald-400/60' : 'text-emerald-500/70'}`}>non-chapter</p>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className={`p-4 rounded-xl text-sm ${
                darkMode ? 'bg-navy-900/20 border border-gold-400/20 text-gold-200' : 'bg-blue-50 border border-blue-100 text-blue-700'
              }`}>
                <p>Hours shown reflect all approved submissions. If you recently submitted hours that aren't showing, they may still be pending review by an NHS officer.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
