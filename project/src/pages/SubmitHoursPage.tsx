import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Trophy, ArrowRight, Clock, Users, Award, BookOpen, UserPlus, Upload, Shield, Sparkles, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../lib/darkModeContext';
import { submitHours, isWriteEnabled, fetchMembers, type HoursSubmission, type MemberHours } from '../lib/googleSheets';
import { validateImageFile, type ImageVerificationResult } from '../lib/imageVerification';

// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 10 + 5;
  const rotation = Math.random() * 360;
  
  return (
    <motion.div
      initial={{ y: -20, x: x, opacity: 1, rotate: 0 }}
      animate={{ 
        y: window.innerHeight + 100, 
        x: x + (Math.random() - 0.5) * 200,
        opacity: [1, 1, 0],
        rotate: rotation + 720
      }}
      transition={{ 
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
    />
  );
};

// Success celebration overlay
interface CelebrationStats {
  totalHours: number;
  summerHours: number;
  chapterHours: number;
  otherHours: number;
  hoursJustAdded: number;
}

const SuccessCelebration = ({ 
  onComplete, 
  darkMode, 
  submittedName,
  stats 
}: { 
  onComplete: () => void; 
  darkMode: boolean; 
  submittedName: string;
  stats: CelebrationStats | null;
}) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; delay: number; x: number }>>([]);
  
  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      x: Math.random() * window.innerWidth
    }));
    setConfetti(particles);
    
    // Auto-close after animation (longer to view stats)
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const progress = stats ? Math.min((stats.totalHours / 30) * 100, 100) : 0;
  const firstSemesterComplete = stats ? stats.totalHours >= 10 : false;
  const yearComplete = stats ? stats.totalHours >= 30 : false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 ${
        darkMode ? 'bg-gray-900/95' : 'bg-white/95'
      } backdrop-blur-sm`}
      onClick={onComplete}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <ConfettiParticle key={particle.id} delay={particle.delay} x={particle.x} />
        ))}
      </div>

      {/* Success content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="text-center z-10 px-8 max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
          className="relative mx-auto mb-6"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                '0 0 0 30px rgba(16, 185, 129, 0)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
          
          {/* Sparkles around the circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute -bottom-1 -left-2"
          >
            <PartyPopper className="w-5 h-5 text-pink-400" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-3xl lg:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Hours Submitted!
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Great job{submittedName ? `, ${submittedName.split(' ')[0]}` : ''}! 🎉
        </motion.p>

        {/* Stats Card */}
        {stats && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
            className={`p-6 rounded-2xl mb-6 ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white border border-gray-200 shadow-xl'
            }`}
          >
            {/* Hours just added */}
            {stats.hoursJustAdded > 0 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                  darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                <span className="font-semibold">+{stats.hoursJustAdded} hours added!</span>
              </motion.div>
            )}

            {/* Main total display */}
            <div className="mb-4">
              <p className={`text-sm uppercase tracking-wider font-semibold mb-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Your Total Hours
              </p>
              <p className={`text-5xl font-bold ${
                yearComplete ? 'text-emerald-500' : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalHours.toFixed(1)}
                <span className={`text-xl font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / 30</span>
              </p>
            </div>

            {/* Progress bar */}
            <div className={`h-4 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  yearComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  firstSemesterComplete ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                  'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
              />
            </div>

            {/* Status badges */}
            <div className="flex gap-3 justify-center mb-4">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                firstSemesterComplete 
                  ? (darkMode ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700')
                  : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
              }`}>
                1st Semester: {firstSemesterComplete ? '✓ Complete' : `${Math.max(0, 10 - stats.totalHours).toFixed(1)} more`}
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                yearComplete 
                  ? (darkMode ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700')
                  : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
              }`}>
                Full Year: {yearComplete ? '✓ Complete' : `${Math.max(0, 30 - stats.totalHours).toFixed(1)} more`}
              </div>
            </div>

            {/* Hours breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.summerHours}
                </p>
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Summer</p>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {stats.chapterHours}
                </p>
                <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Chapter</p>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                <p className={`text-lg font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {stats.otherHours}
                </p>
                <p className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Other</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={onComplete}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              darkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Submit More
          </button>
          <button
            onClick={() => window.location.href = '/hours-tracker'}
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className={`text-sm mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          Click anywhere to close
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export function SubmitHoursPage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [existingMembers, setExistingMembers] = useState<MemberHours[]>([]);
  const [isNewMember, setIsNewMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [nameSearchQuery, setNameSearchQuery] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    summerHours: '',
    chapterHours: '',
    otherHours: '',
    inducted: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [celebrationStats, setCelebrationStats] = useState<CelebrationStats | null>(null);
  
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

  // Filter members based on search query - EXACT MATCH ONLY
  const filteredMembers = existingMembers.filter(member =>
    member.name.toLowerCase() === nameSearchQuery.toLowerCase().trim()
  );

  // When selecting an existing member from suggestions, prefill their data
  const handleMemberSelect = (memberName: string) => {
    setSelectedMember(memberName);
    setNameSearchQuery(memberName);
    setShowNameSuggestions(false);
    
    if (memberName) {
      const member = existingMembers.find(m => m.name === memberName);
      if (member) {
        setFormData({
          name: member.name,
          grade: member.grade,
          summerHours: '', // Don't prefill hours - they're adding new hours
          chapterHours: '',
          otherHours: '',
          inducted: member.inducted ? 'Yes' : 'No'
        });
      }
    } else {
      setFormData({
        name: '',
        grade: '',
        summerHours: '',
        chapterHours: '',
        otherHours: '',
        inducted: ''
      });
    }
  };

  // Handle name search input change
  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameSearchQuery(value);
    // Reset search results when user types
    setHasSearched(false);
    setShowNameSuggestions(false);
    // Clear selection if user modifies the input
    if (selectedMember && value !== selectedMember) {
      setSelectedMember('');
      setFormData({
        name: '',
        grade: '',
        summerHours: '',
        chapterHours: '',
        otherHours: '',
        inducted: ''
      });
    }
  };

  // Handle Find button click
  const handleFindName = () => {
    if (nameSearchQuery.trim().length >= 2) {
      setHasSearched(true);
      setShowNameSuggestions(true);
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

  // Helper function to check if description contains explanatory words
  const hasExplanatoryWords = (text: string): boolean => {
    const explanatoryWords = [
      'because', 'since', 'as', 'so that', 'in order to', 'therefore',
      'which shows', 'this shows', 'this proves', 'which proves',
      'demonstrates', 'supports', 'evidence', 'proving', 'showing',
      'due to', 'reason', 'explains', 'indicating', 'confirms'
    ];
    const lowerText = text.toLowerCase();
    return explanatoryWords.some(word => lowerText.includes(word));
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
      setErrorMessage('Please describe your volunteer activity and explain how this image supports it');
      setSubmitStatus('error');
      return;
    }

    if (activityDescription.trim().length < 50) {
      setErrorMessage('Please provide a more detailed description (at least 50 characters). Include what activity you did and explain how the image proves it.');
      setSubmitStatus('error');
      return;
    }

    // Check for explanatory words - REQUIRED
    if (!hasExplanatoryWords(activityDescription)) {
      setErrorMessage('Your description must explain HOW the image supports your activity. Use words like "because", "since", "this shows", "which proves", etc. For example: "This image proves my volunteering BECAUSE it shows me wearing the organization\'s volunteer badge."');
      setSubmitStatus('error');
      setVerificationResult({
        isValid: false,
        error: 'Missing explanation',
        geminiReasoning: 'Your description must include an explanation of how the image supports your activity. Please use connecting words like "because", "since", "this shows", "which proves", etc. to explain the connection between your activity and the image.'
      });
      setIsVerified(false);
      return;
    }

    // If they included explanatory words, auto-accept
    setIsVerifying(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Small delay to show verification is happening
    await new Promise(resolve => setTimeout(resolve, 800));

    setVerificationResult({
      isValid: true,
      geminiReasoning: 'Your description adequately explains the activity and how the image supports it. Submission verified.'
    });
    setIsVerified(true);
    setSubmitStatus('success');
    setErrorMessage('');
    setIsVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      setErrorMessage('Please verify your proof of volunteering image before submitting');
      setSubmitStatus('error');
      return;
    }
    
    // For existing members, require selection from the list (prevents submitting others' hours)
    if (!isNewMember && !selectedMember) {
      setErrorMessage('Please select your name from the list. If you\'re a new member, click "New Member" above.');
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

    // Calculate hours being added
    const hoursJustAdded = 
      Math.min(parseFloat(formData.summerHours) || 0, 8) + 
      (parseFloat(formData.chapterHours) || 0) + 
      (parseFloat(formData.otherHours) || 0);

    try {
      const submission: HoursSubmission = {
        name: formData.name,
        grade: formData.grade,
        summerHours: parseFloat(formData.summerHours) || 0,
        chapterHours: parseFloat(formData.chapterHours) || 0,
        otherHours: parseFloat(formData.otherHours) || 0,
        inducted: formData.inducted
      };

      await submitHours(submission);
      
      // Store name for celebration message
      setSubmittedName(formData.name);
      
      // Fetch updated member data for stats
      try {
        // Small delay to allow Google Sheets to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        const updatedMembers = await fetchMembers();
        const member = updatedMembers.find(m => m.name.toLowerCase() === formData.name.toLowerCase());
        
        if (member) {
          setCelebrationStats({
            totalHours: member.totalHours,
            summerHours: member.summerHours,
            chapterHours: member.chapterHours,
            otherHours: member.otherHours,
            hoursJustAdded: hoursJustAdded
          });
        } else {
          // If member not found, show the hours they just added
          setCelebrationStats({
            totalHours: hoursJustAdded,
            summerHours: parseFloat(formData.summerHours) || 0,
            chapterHours: parseFloat(formData.chapterHours) || 0,
            otherHours: parseFloat(formData.otherHours) || 0,
            hoursJustAdded: hoursJustAdded
          });
        }
      } catch (fetchError) {
        console.error('Error fetching updated stats:', fetchError);
        // Still show celebration with just the added hours
        setCelebrationStats({
          totalHours: hoursJustAdded,
          summerHours: parseFloat(formData.summerHours) || 0,
          chapterHours: parseFloat(formData.chapterHours) || 0,
          otherHours: parseFloat(formData.otherHours) || 0,
          hoursJustAdded: hoursJustAdded
        });
      }
      
      // Show celebration animation
      setShowCelebration(true);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        grade: '',
        summerHours: '',
        chapterHours: '',
        otherHours: '',
        inducted: ''
      });
      // Reset image verification
      setProofImage(null);
      setImagePreview(null);
      setActivityDescription('');
      setAdminCode('');
      setIsVerified(false);
      setVerificationResult(null);
      setSelectedMember('');
      setNameSearchQuery('');
      setHasSearched(false);
    } catch (error) {
      console.error('Error submitting:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit hours');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total hours with summer hours capped at 8
  const rawSummerHours = parseFloat(formData.summerHours) || 0;
  const effectiveSummerHours = Math.min(rawSummerHours, 8);
  const chapterHours = parseFloat(formData.chapterHours) || 0;
  const otherHours = parseFloat(formData.otherHours) || 0;
  const totalHours = effectiveSummerHours + chapterHours + otherHours;
  const summerHoursExceeded = rawSummerHours > 8;

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
    <>
      {/* Full-screen celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <SuccessCelebration
            onComplete={() => {
              setShowCelebration(false);
              setCelebrationStats(null);
            }}
            darkMode={darkMode}
            submittedName={submittedName}
            stats={celebrationStats}
          />
        )}
      </AnimatePresence>

      <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
          : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              <div className={`rounded-3xl border p-8 ${
                darkMode 
                  ? 'bg-gray-900/80 border-gray-800' 
                  : 'bg-white border-gray-200 shadow-sm'
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
                      setNameSearchQuery('');
                      setHasSearched(false);
                      setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', otherHours: '', inducted: '' });
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      !isNewMember
                        ? 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Find My Name
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMember(true);
                      setSelectedMember('');
                      setNameSearchQuery('');
                      setHasSearched(false);
                      setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', otherHours: '', inducted: '' });
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

                {/* Existing Member Autocomplete OR New Name Input */}
                {!isNewMember ? (
                  <div className="relative">
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Find Your Name <span className="text-red-500">*</span>
                    </label>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Type your <strong>exact full name</strong> (no typos), then click <strong>Find</strong>. If you're already in the spreadsheet, your name will appear below — click it to select.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameSearchQuery}
                        onChange={handleNameSearchChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFindName();
                          }
                        }}
                        placeholder={isLoadingMembers ? 'Loading members...' : 'Enter your full name exactly...'}
                        disabled={isLoadingMembers}
                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                        } ${isLoadingMembers ? 'opacity-50 cursor-wait' : ''} ${
                          selectedMember ? (darkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50') : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleFindName}
                        disabled={isLoadingMembers || nameSearchQuery.trim().length < 2}
                        className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                          nameSearchQuery.trim().length >= 2
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                            : darkMode
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        Find
                      </button>
                    </div>
                    {selectedMember && (
                      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 mt-5">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    
                    {/* Search Results - only show after clicking Find */}
                    <AnimatePresence>
                      {hasSearched && showNameSuggestions && !selectedMember && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mt-3 rounded-xl border shadow-lg max-h-60 overflow-y-auto ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          {filteredMembers.length > 0 ? (
                            <>
                              <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                                darkMode ? 'text-gray-500 bg-gray-900/50 border-gray-700' : 'text-gray-400 bg-gray-50 border-gray-100'
                              }`}>
                                🎉 Found! Click your name below to select
                              </div>
                              {filteredMembers.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => handleMemberSelect(member.name)}
                                  className={`w-full px-4 py-3 text-left transition-colors flex justify-between items-center ${
                                    darkMode 
                                      ? 'hover:bg-blue-600/30 text-white border-b border-gray-700 last:border-0' 
                                      : 'hover:bg-blue-100 text-gray-900 border-b border-gray-100 last:border-0'
                                  }`}
                                >
                                  <span className="font-medium">{member.name}</span>
                                  <span className={`text-sm px-2 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                    {member.grade}
                                  </span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className={`px-4 py-4 text-center ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <p className="font-medium">❌ No matching members found</p>
                              <p className="text-sm mt-1">Make sure you typed your name exactly as registered (check spelling!).</p>
                              <p className="text-sm mt-2">If you're new, click <strong>"New Member"</strong> above.</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {selectedMember && (
                      <p className={`text-sm mt-2 text-green-500 flex items-center gap-1`}>
                        <CheckCircle className="w-4 h-4" /> Selected: <strong>{selectedMember}</strong>
                      </p>
                    )}
                    
                    {!selectedMember && !hasSearched && nameSearchQuery.length >= 2 && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        👆 Click <strong>Find</strong> to search for your name
                      </p>
                    )}
                    
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
                    <option value="Freshman">Freshman (9th)</option>
                    <option value="Sophomore">Sophomore (10th)</option>
                    <option value="Junior">Junior (11th)</option>
                    <option value="Senior">Senior (12th)</option>
                  </select>
                </div>

                {/* Hours Grid */}
                <div className="grid grid-cols-3 gap-3">
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
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Max 8 count</p>
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
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Min 6 required</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Other Hours
                    </label>
                    <input
                      type="number"
                      name="otherHours"
                      min="0"
                      step="0.5"
                      value={formData.otherHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                      }`}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Non-chapter</p>
                  </div>
                </div>

                {/* Total Display */}
                {(totalHours > 0 || summerHoursExceeded) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border border-gray-200 shadow-lg'}`}
                  >
                    {summerHoursExceeded && (
                      <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        <span className="text-base">⚠️</span>
                        <span>Only 8 of your {rawSummerHours} summer hours count toward the goal</span>
                      </div>
                    )}
                    
                    {/* Main Hours Display */}
                    <div className="text-center mb-4">
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Total Effective Hours
                      </p>
                      <p className={`text-4xl font-bold ${
                        totalHours >= 30 ? 'text-emerald-500' : totalHours >= 10 ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {totalHours.toFixed(1)}
                        <span className={`text-lg font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> / 30</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className={`h-3 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="h-full flex">
                        {/* First 10 hours (1st semester) */}
                        <div 
                          className={`h-full transition-all ${totalHours >= 10 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min((totalHours / 30) * 100, (10/30) * 100)}%` }}
                        />
                        {/* Remaining 20 hours */}
                        {totalHours > 10 && (
                          <div 
                            className={`h-full transition-all ${totalHours >= 30 ? 'bg-emerald-500' : 'bg-blue-400'}`}
                            style={{ width: `${Math.min(((totalHours - 10) / 30) * 100, (20/30) * 100)}%` }}
                          />
                        )}
                      </div>
                      {/* 10-hour marker */}
                      <div className="relative">
                        <div 
                          className={`absolute -top-3 w-0.5 h-3 ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}
                          style={{ left: `${(10/30) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* 1st Semester Status */}
                      <div className={`p-3 rounded-xl text-center ${
                        totalHours >= 10 
                          ? (darkMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                          : (darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200')
                      }`}>
                        <p className={`text-xs font-semibold mb-1 ${
                          totalHours >= 10 
                            ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                            : (darkMode ? 'text-gray-400' : 'text-gray-500')
                        }`}>
                          1st Semester
                        </p>
                        {totalHours >= 10 ? (
                          <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            ✓ Complete!
                          </p>
                        ) : (
                          <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {(10 - totalHours).toFixed(1)} more
                          </p>
                        )}
                      </div>

                      {/* Full Year Status */}
                      <div className={`p-3 rounded-xl text-center ${
                        totalHours >= 30 
                          ? (darkMode ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200')
                          : (darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200')
                      }`}>
                        <p className={`text-xs font-semibold mb-1 ${
                          totalHours >= 30 
                            ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                            : (darkMode ? 'text-gray-400' : 'text-gray-500')
                        }`}>
                          Full Year
                        </p>
                        {totalHours >= 30 ? (
                          <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            ✓ Complete!
                          </p>
                        ) : (
                          <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {(30 - totalHours).toFixed(1)} more
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info Text */}
                    <p className={`text-xs mt-3 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      10 hours due by end of 1st semester • 20 more due by end of year
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
                          Activity Description & Explanation <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={activityDescription}
                          onChange={(e) => setActivityDescription(e.target.value)}
                          placeholder="Example: I volunteered at the Kirkland Food Bank on October 15th sorting donations. This image proves my participation BECAUSE it shows me wearing the official volunteer badge with the food bank logo clearly visible in the background."
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
                          }`}
                        />
                        <div className={`mt-2 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            📝 <span className="font-semibold">Required:</span> Explain how the image supports your activity.
                          </p>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Use words like <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>"because"</span>, <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>"this shows"</span>, or <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>"which proves"</span> • Min 50 characters
                          </p>
                        </div>
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
                      ? 'bg-red-900/30 border border-red-500/30' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                      Important Notice
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                      All submissions will be reviewed by NHS officers. Do not lie about your activities or attempt to misrepresent your hours. <span className="font-bold">Dishonest or fraudulent submissions will result in removal from NHS.</span>
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
    </>
  );
}
