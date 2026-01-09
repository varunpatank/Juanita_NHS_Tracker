import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Trophy, ArrowRight, Clock, Users, Award, BookOpen, UserPlus, ChevronDown, Upload, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../lib/darkModeContext';
import { submitHours, isWriteEnabled, fetchMembers, type HoursSubmission, type MemberHours } from '../lib/googleSheets';
import { verifyImage, validateImageFile, type ImageVerificationResult } from '../lib/imageVerification';

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
  
  // Image verification states
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activityDescription, setActivityDescription] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ImageVerificationResult | null>(null);
  const [isVerified, setIsVerified] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid image file');
      setSubmitStatus('error');
      return;
    }

    // Set image and create preview
    setProofImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset verification when new image is uploaded
    setIsVerified(false);
    setVerificationResult(null);
    setSubmitStatus('idle');
  };

  const handleVerifyImage = async () => {
    // Check for admin bypass code
    if (adminCode === '1060801') {
      setIsVerified(true);
      setSubmitStatus('success');
      setErrorMessage('');
      setVerificationResult({ isValid: true });
      return;
    }

    if (!proofImage) {
      setErrorMessage('Please upload an image first');
      setSubmitStatus('error');
      return;
    }

    if (!activityDescription.trim()) {
      setErrorMessage('Please describe your volunteer activity and how this image supports it');
      setSubmitStatus('error');
      return;
    }

    if (activityDescription.trim().length < 30) {
      setErrorMessage('Please provide a more detailed activity description (at least 30 characters)');
      setSubmitStatus('error');
      return;
    }

    setIsVerifying(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const result = await verifyImage(proofImage, activityDescription);
      setVerificationResult(result);

      if (!result.isValid) {
        setErrorMessage(result.error || 'Image verification failed');
        setSubmitStatus('error');
        setIsVerified(false);
      } else {
        setIsVerified(true);
        setSubmitStatus('success');
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage('Failed to verify image. Please try again.');
      setSubmitStatus('error');
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      setErrorMessage('Please verify your proof of volunteering image before submitting');
      setSubmitStatus('error');
      return;
    }
    
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
      // Reset image verification
      setProofImage(null);
      setImagePreview(null);
      setActivityDescription('');
      setAdminCode('');
      setIsVerified(false);
      setVerificationResult(null);
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
      title: '30 Total Hours Required',
      description: 'Complete 30 volunteer hours throughout the year. 10 of these must be completed by the end of 1st semester.',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: '6 Chapter-Sponsored Hours',
      description: '6 of the 30 hours must be chapter sponsored (supporting students and/or staff of Lake Washington School District), completed any time throughout the year.',
      color: 'text-purple-500'
    },
    {
      icon: BookOpen,
      title: 'Summer Hours Limit',
      description: 'Only 8 of the 30 hours may be completed during the summer previous to the start of the school year (not required).',
      color: 'text-amber-500'
    },
    {
      icon: Award,
      title: '3.5 GPA & Meetings',
      description: 'Achieve and maintain a GPA of 3.5 or higher. Attend two mandatory meetings (one in fall, one in spring).',
      color: 'text-emerald-500'
    },
    {
      icon: UserPlus,
      title: 'Induction Eligibility',
      description: 'Sophomores, Juniors, and Seniors who meet all requirements can apply for induction. Freshmen are not eligible for induction until they have an official high school GPA.',
      color: 'text-rose-500'
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
                        totalHours >= 30 ? 'text-emerald-500' : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {totalHours.toFixed(1)}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full transition-all ${totalHours >= 30 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((totalHours / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalHours >= 30 ? '✓ Goal reached!' : `${(30 - totalHours).toFixed(1)} more hours needed`}
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

                {/* Image Proof Upload */}
                <div className={`p-6 rounded-xl border-2 border-dashed ${
                  darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Proof of Volunteering <span className="text-red-500">*</span>
                  </label>
                  
                  {/* File Upload */}
                  {!imagePreview ? (
                    <label className={`flex flex-col items-center justify-center cursor-pointer py-8 px-4 rounded-lg transition-all ${
                      darkMode 
                        ? 'hover:bg-gray-700/50 border border-gray-700' 
                        : 'hover:bg-gray-100 border border-gray-200'
                    }`}>
                      <Upload className={`w-12 h-12 mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Upload an image as proof
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        JPG, PNG, or WebP (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Proof of volunteering"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProofImage(null);
                            setImagePreview(null);
                            setIsVerified(false);
                            setVerificationResult(null);
                            setActivityDescription('');
                            setAdminCode('');
                          }}
                          className={`absolute top-2 right-2 p-2 rounded-lg ${
                            darkMode ? 'bg-gray-900/80 text-white hover:bg-gray-900' : 'bg-white/80 text-gray-900 hover:bg-white'
                          }`}
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Verification Result Display (after verification is attempted) */}
                      {verificationResult && !isVerified && verificationResult.geminiReasoning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl flex items-start gap-3 ${
                            darkMode 
                              ? 'bg-red-900/30 border border-red-500/30' 
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                              Verification Failed
                            </p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                              {verificationResult.geminiReasoning}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {isVerified && verificationResult?.isValid && verificationResult.geminiReasoning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl flex items-start gap-3 ${
                            darkMode 
                              ? 'bg-blue-900/30 border border-blue-500/30' 
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                              AI Analysis
                            </p>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                              {verificationResult.geminiReasoning}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Activity Description */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Activity & How Image Supports It <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={activityDescription}
                          onChange={(e) => setActivityDescription(e.target.value)}
                          placeholder="Example: I volunteered at the Kirkland Food Bank on October 15th sorting donations. This photo shows me wearing the volunteer badge with the food bank logo visible in the background."
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Minimum 30 characters. Describe your activity and how this image proves it (e.g., shows you at location, has signatures, organization branding, etc.).
                        </p>
                      </div>

                      {/* Admin Code (Optional) */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Admin Override Code (Optional)
                        </label>
                        <input
                          type="password"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          placeholder="Enter admin code to bypass verification"
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          NHS officers only. Leave blank if you're a regular member.
                        </p>
                      </div>

                      {/* Verify Button */}
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyImage}
                          disabled={isVerifying}
                          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            isVerifying
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : darkMode
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          {isVerifying ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verifying Image...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5" />
                              Verify Proof
                            </>
                          )}
                        </button>
                      )}

                      {/* Verification Success Banner */}
                      {isVerified && verificationResult?.isValid && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-xl flex items-center justify-center gap-3 ${
                            darkMode 
                              ? 'bg-emerald-900/30 border border-emerald-500/30' 
                              : 'bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <p className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                            ✓ Verified - Ready for Submission
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Warning Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl flex items-start gap-3 ${
                    darkMode 
                      ? 'bg-amber-900/30 border border-amber-500/30' 
                      : 'bg-amber-50 border border-amber-200'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                      Important Notice
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      Do not lie about your activities or attempt to misrepresent your hours. All submissions are carefully reviewed and verified by our team. Dishonest submissions will result in consequences.
                    </p>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !writeEnabled || !isVerified}
                  className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    isSubmitting || !writeEnabled || !isVerified
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : !isVerified ? (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify Proof First
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
                  <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>8</p>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Max Summer Hours</p>
                </div>
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>6</p>
                  <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Chapter Hours</p>
                </div>
              </div>
              <div className={`mt-4 p-4 rounded-xl text-center ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                <p className={`text-4xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>30</p>
                <p className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Total Required</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
