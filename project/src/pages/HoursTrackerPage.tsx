import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, Star, Award, Users, Search } from 'lucide-react';
import { useDarkMode } from '../lib/darkModeContext';
import { fetchMembers, type MemberHours } from '../lib/googleSheets';

export function HoursTrackerPage() {
  const [members, setMembers] = useState<MemberHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('');
  const [filterInducted, setFilterInducted] = useState<string>('');
  const { darkMode } = useDarkMode();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !filterGrade || member.grade.toLowerCase() === filterGrade.toLowerCase();
    const matchesInducted = !filterInducted || 
      (filterInducted === 'yes' ? member.inducted : !member.inducted);
    return matchesSearch && matchesGrade && matchesInducted;
  });

  // Sort by total hours (highest first)
  const sortedMembers = [...filteredMembers].sort((a, b) => b.totalHours - a.totalHours);

  // Get stats
  const totalMembers = members.length;
  const inductedCount = members.filter(m => m.inducted).length;
  const totalHours = members.reduce((sum, m) => sum + m.totalHours, 0);
  const avgHours = totalMembers > 0 ? (totalHours / totalMembers).toFixed(1) : '0';

  // Get rank color and icon
  const getRankStyle = (index: number, totalHours: number) => {
    if (index === 0 && totalHours > 0) return { bg: 'from-yellow-400 to-amber-500', icon: Trophy, label: '1st' };
    if (index === 1 && totalHours > 0) return { bg: 'from-gray-300 to-gray-400', icon: Award, label: '2nd' };
    if (index === 2 && totalHours > 0) return { bg: 'from-amber-600 to-amber-700', icon: Star, label: '3rd' };
    return null;
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'freshman': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'sophomore': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'junior': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'senior': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Get hours color based on progress (30 hours goal)
  const getHoursColor = (totalHours: number) => {
    if (totalHours >= 30) return 'text-emerald-400';
    if (totalHours >= 20) return 'text-blue-400';
    if (totalHours >= 10) return 'text-amber-400';
    if (totalHours >= 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHoursProgress = (totalHours: number) => {
    return Math.min((totalHours / 30) * 100, 100);
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Hours Leaderboard
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track member progress and celebrate service achievements
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <Users className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalMembers}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Members</p>
          </div>
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <Award className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{inductedCount}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inducted</p>
          </div>
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <Star className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalHours}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
          </div>
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <Trophy className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{avgHours}</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Hours</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`p-4 rounded-2xl mb-6 border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>

            {/* Grade Filter */}
            <div className="relative">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className={`pl-4 pr-12 py-3 rounded-xl border-2 transition-all appearance-none cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-blue-200 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
                }`}
              >
                <option value="">All Grades</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
              </select>
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Inducted Filter */}
            <div className="relative">
              <select
                value={filterInducted}
                onChange={(e) => setFilterInducted(e.target.value)}
                className={`pl-4 pr-12 py-3 rounded-xl border-2 transition-all appearance-none cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-blue-200 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
                }`}
              >
                <option value="">All Status</option>
                <option value="yes">Inducted</option>
                <option value="no">Not Inducted</option>
              </select>
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={loadMembers}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${isLoading ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`rounded-2xl border overflow-hidden ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' 
              : 'bg-white border-blue-100 shadow-xl shadow-blue-500/10'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {members.length === 0 
                ? 'No members yet. Configure Google Sheets to get started.'
                : 'No members match your filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rank</th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Grade</th>
                    <th className={`text-center p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Summer</th>
                    <th className={`text-center p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chapter</th>
                    <th className={`text-center p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Other</th>
                    <th className={`text-center p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => {
                    const rankStyle = getRankStyle(index, member.totalHours);
                    return (
                      <tr 
                        key={member.id} 
                        className={`border-b transition-colors ${
                          darkMode 
                            ? 'border-gray-700/50 hover:bg-gray-700/30' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="p-4">
                          {rankStyle ? (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rankStyle.bg} flex items-center justify-center shadow-lg`}>
                              <rankStyle.icon className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                              darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                          )}
                        </td>

                        {/* Name */}
                        <td className={`p-4 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {member.name}
                        </td>

                        {/* Grade */}
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getGradeColor(member.grade)}`}>
                            {member.grade || 'N/A'}
                          </span>
                        </td>

                        {/* Summer Hours */}
                        <td className="p-4 text-center">
                          <span className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {member.summerHours}
                          </span>
                        </td>

                        {/* Chapter Hours */}
                        <td className="p-4 text-center">
                          <span className={`text-lg font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            {member.chapterHours}
                          </span>
                        </td>

                        {/* Other Hours */}
                        <td className="p-4 text-center">
                          <span className={`text-lg font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {member.otherHours}
                          </span>
                        </td>

                        {/* Total Hours */}
                        <td className="p-4 text-center">
                          <span className={`text-2xl font-bold ${getHoursColor(member.totalHours)}`}>
                            {member.totalHours}
                          </span>
                        </td>

                        {/* Progress Bar */}
                        <td className="p-4">
                          <div className="w-32">
                            <div className={`h-2 rounded-full overflow-hidden ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  member.totalHours >= 30 ? 'bg-emerald-500' :
                                  member.totalHours >= 20 ? 'bg-blue-500' :
                                  member.totalHours >= 10 ? 'bg-amber-500' :
                                  member.totalHours >= 5 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${getHoursProgress(member.totalHours)}%` }}
                              />
                            </div>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {member.totalHours}/30 goal
                            </p>
                          </div>
                        </td>

                        {/* Inducted Status */}
                        <td className="p-4">
                          {member.inducted ? (
                            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
                              ✓ Inducted
                            </span>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                              darkMode 
                                ? 'bg-gray-700/50 text-gray-400 border-gray-600' 
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          Goal: 30 hours total (10 by 1st semester, 20 more by end of year) • Data synced with Google Sheets
        </motion.div>
      </div>
    </div>
  );
}
