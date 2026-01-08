import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Trophy, ArrowRight, Clock, Users, Award, BookOpen, UserPlus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../lib/darkModeContext';
import { submitHours, isWriteEnabled, fetchMembers, type HoursSubmission, type MemberHours } from '../lib/googleSheets';

export function SubmitHoursPage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [existingMembers, setExistingMembers] = useState<MemberHours[]>([]);
  const [isNewMember, setIsNewMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    summerHours: '',
    chapterHours: '',
    inducted: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const writeEnabled = isWriteEnabled();

  // Load existing members on mount
  useEffect(() => {
    loadExistingMembers();
  }, []);

  const loadExistingMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const members = await fetchMembers();
      setExistingMembers(members);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // When selecting an existing member, prefill their data
  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberName = e.target.value;
    setSelectedMember(memberName);
    
    if (memberName) {
      const member = existingMembers.find(m => m.name === memberName);
      if (member) {
        setFormData({
          name: member.name,
          grade: member.grade,
          summerHours: '', // Don't prefill hours - they're adding new hours
          chapterHours: '',
          inducted: member.inducted ? 'Yes' : 'No'
        });
      }
    } else {
      setFormData({
        name: '',
        grade: '',
        summerHours: '',
        chapterHours: '',
        inducted: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.inducted) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const submission: HoursSubmission = {
        name: formData.name,
        grade: formData.grade,
        summerHours: parseFloat(formData.summerHours) || 0,
        chapterHours: parseFloat(formData.chapterHours) || 0,
        inducted: formData.inducted
      };

      await submitHours(submission);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        grade: '',
        summerHours: '',
        chapterHours: '',
        inducted: ''
      });
    } catch (error) {
      console.error('Error submitting:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit hours');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHours = (parseFloat(formData.summerHours) || 0) + (parseFloat(formData.chapterHours) || 0);

  const rules = [
    {
      icon: Clock,
      title: '20 Hours Required',
      description: 'Complete 20 total service hours per school year to maintain membership.',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: '10 Summer + 10 Chapter',
      description: 'Split between 10 summer hours and 10 chapter hours during the school year.',
      color: 'text-purple-500'
    },
    {
      icon: Award,
      title: 'Verification Required',
      description: 'All hours must be verified by an NHS officer before appearing on the leaderboard.',
      color: 'text-amber-500'
    },
    {
      icon: BookOpen,
      title: 'Approved Activities',
      description: 'Hours must be from NHS-approved volunteer activities at school or in the community.',
      color: 'text-emerald-500'
    }
  ];

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl lg:text-5xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Submit Service Hours
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Log your volunteer hours and track your progress toward NHS requirements
          </p>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className={`rounded-3xl border p-8 ${
              darkMode 
                ? 'bg-gray-900/80 border-gray-800' 
                : 'bg-white border-gray-200 shadow-xl'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Hours Submission Form
              </h2>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                    darkMode 
                      ? 'bg-emerald-900/30 border border-emerald-500/30' 
                      : 'bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                      Hours Submitted Successfully!
                    </p>
                    <button
                      onClick={() => navigate('/hours-tracker')}
                      className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${
                        darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                      }`}
                    >
                      View Leaderboard <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                    darkMode 
                      ? 'bg-red-900/30 border border-red-500/30' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                    {errorMessage}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Member Selection Toggle */}
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMember(false);
                      setSelectedMember('');
                      setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', inducted: '' });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      !isNewMember
                        ? 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMember(true);
                      setSelectedMember('');
                      setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', inducted: '' });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      isNewMember
                        ? 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    New Member
                  </button>
                </div>

                {/* Existing Member Dropdown OR New Name Input */}
                {!isNewMember ? (
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select Your Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedMember}
                      onChange={handleMemberSelect}
                      required
                      disabled={isLoadingMembers}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                      } ${isLoadingMembers ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <option value="">{isLoadingMembers ? 'Loading members...' : 'Select your name'}</option>
                      {existingMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.grade})
                        </option>
                      ))}
                    </select>
                    {existingMembers.length === 0 && !isLoadingMembers && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No members yet. Click "New Member" to add yourself.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                      }`}
                    />
                  </div>
                )}

                {/* Grade */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                    }`}
                  >
                    <option value="">Select your grade</option>
                    <option value="Sophomore">Sophomore (10th)</option>
                    <option value="Junior">Junior (11th)</option>
                    <option value="Senior">Senior (12th)</option>
                  </select>
                </div>

                {/* Hours Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Summer Hours
                    </label>
                    <input
                      type="number"
                      name="summerHours"
                      min="0"
                      step="0.5"
                      value={formData.summerHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Chapter Hours
                    </label>
                    <input
                      type="number"
                      name="chapterHours"
                      min="0"
                      step="0.5"
                      value={formData.chapterHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Total Display */}
                {totalHours > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Hours
                      </span>
                      <span className={`text-2xl font-bold ${
                        totalHours >= 20 ? 'text-emerald-500' : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {totalHours.toFixed(1)}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full transition-all ${totalHours >= 20 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((totalHours / 20) * 100, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalHours >= 20 ? '✓ Goal reached!' : `${(20 - totalHours).toFixed(1)} more hours needed`}
                    </p>
                  </motion.div>
                )}

                {/* Inducted Status */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Induction Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="inducted"
                    required
                    value={formData.inducted}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                    }`}
                  >
                    <option value="">Select status</option>
                    <option value="Yes">Yes - Inducted member</option>
                    <option value="No">No - Pending induction</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !writeEnabled}
                  className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    isSubmitting || !writeEnabled
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Hours
                    </>
                  )}
                </button>
              </form>

              {/* View Leaderboard Link */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => navigate('/hours-tracker')}
                  className={`inline-flex items-center gap-2 font-medium transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                  View Leaderboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Rules */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <div className={`rounded-3xl border p-8 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' 
                : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 shadow-xl'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Submission Guidelines
              </h2>
              
              <div className="space-y-5">
                {rules.map((rule, index) => (
                  <motion.div
                    key={rule.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow-sm border border-gray-100'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {rule.title}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`rounded-3xl border p-6 ${
              darkMode 
                ? 'bg-gray-900/80 border-gray-800' 
                : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Hours Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>10</p>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Summer Hours</p>
                </div>
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>10</p>
                  <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Chapter Hours</p>
                </div>
              </div>
              <div className={`mt-4 p-4 rounded-xl text-center ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                <p className={`text-4xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>20</p>
                <p className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Total Required</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
