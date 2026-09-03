import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Trophy, ArrowRight, Clock, Users, Award, BookOpen, UserPlus, Upload, Sparkles, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../lib/darkModeContext';
import { submitHours, isWriteEnabled, fetchMembers, type HoursSubmission, type MemberHours } from '../lib/googleSheets';
import { validateImageFile, type ImageVerificationResult, verifyImage } from '../lib/imageVerification';
import { PageHero } from '../components/PageHero';

// Kept in project/.env so it is not committed to the repo.
const ADMIN_OVERRIDE_CODE = import.meta.env.VITE_ADMIN_OVERRIDE_CODE;


// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => {
  const colors = ['#1e3a8a', '#2563eb', '#60a5fa', '#f59e0b', '#fbbf24', '#fcd34d', '#ffffff'];
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
    
    // Auto-close after animation
    const timer = setTimeout(onComplete, 4000);
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
      className={`fixed inset-0 z-50 overflow-y-auto ${
        darkMode ? 'bg-navy-950/95' : 'bg-white/95'
      } backdrop-blur-sm`}
      onClick={onComplete}
    >
      <div className="flex min-h-full items-center justify-center py-8 px-4">
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
        className="text-center z-10 px-8 max-w-lg w-full mx-auto"
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
            <PartyPopper className="w-5 h-5 text-amber-300" />
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
          className={`text-lg mb-6 ${darkMode ? 'text-navy-100' : 'text-gray-600'}`}
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
                ? 'bg-navy-900/80 border border-white/10' 
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
                darkMode ? 'text-navy-200/60' : 'text-navy-200/75'
              }`}>
                Your Total Hours
              </p>
              <p className={`text-5xl font-bold ${
                yearComplete ? 'text-emerald-500' : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalHours.toFixed(1)}
                <span className={`text-xl font-normal ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}> / 30</span>
              </p>
            </div>

            {/* Progress bar */}
            <div className={`h-4 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-navy-800' : 'bg-gray-200'}`}>
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
                  : (darkMode ? 'bg-navy-800 text-navy-200/75' : 'bg-gray-100 text-navy-200/60')
              }`}>
                1st Semester: {firstSemesterComplete ? '✓ Complete' : `${Math.max(0, 10 - stats.totalHours).toFixed(1)} more`}
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                yearComplete 
                  ? (darkMode ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700')
                  : (darkMode ? 'bg-navy-800 text-navy-200/75' : 'bg-gray-100 text-navy-200/60')
              }`}>
                Full Year: {yearComplete ? '✓ Complete' : `${Math.max(0, 30 - stats.totalHours).toFixed(1)} more`}
              </div>
            </div>

            {/* Hours breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                <p className={`text-lg font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>
                  {stats.summerHours}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Summer</p>
              </div>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                <p className={`text-lg font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>
                  {stats.chapterHours}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Chapter</p>
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
                ? 'bg-navy-900 text-white hover:bg-navy-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Submit More
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl font-semibold bg-gold-400 text-navy-950 hover:bg-gold-300 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className={`text-sm mt-4 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}
        >
          Click anywhere to close
        </motion.p>
      </motion.div>
      </div>
    </motion.div>
  );
};

export function SubmitHoursPage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [existingMembers, setExistingMembers] = useState<MemberHours[]>([]);
  const [hasMadeChoice, setHasMadeChoice] = useState(false);
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
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [_verificationResult, setVerificationResult] = useState<ImageVerificationResult | null>(null);
  const [showVerifiedPopup, setShowVerifiedPopup] = useState(false);
  const [showFailedPopup, setShowFailedPopup] = useState(false);
  const [verifyPopupReasoning, setVerifyPopupReasoning] = useState('');
  const [verifyConfetti] = useState<Array<{ id: number; delay: number; x: number }>>([]);

  // Sentence frame fields for structured description
  const [sfOrganization, setSfOrganization] = useState('');
  const [sfActivity, setSfActivity] = useState('');
  const [sfDate, setSfDate] = useState('');
  const [sfPhotoShows, setSfPhotoShows] = useState('');
  const [sfSupervisor, setSfSupervisor] = useState('');
  const [sfSupervisorContact, setSfSupervisorContact] = useState('');

  // Current hours for selected existing member
  const [selectedMemberCurrentHours, setSelectedMemberCurrentHours] = useState<MemberHours | null>(null);

  // Build the full activity description from the sentence frame
  const activityDescription = [
    sfOrganization && `I volunteered with ${sfOrganization}`,
    sfActivity && `where I ${sfActivity}`,
    sfDate && `on ${sfDate}`,
    sfPhotoShows && `My photo shows ${sfPhotoShows}`,
    sfSupervisor && `Supervisor: ${sfSupervisor}`,
    sfSupervisorContact && `Supervisor contact: ${sfSupervisorContact}`,
  ].filter(Boolean).join(', ') + '.';

  // Every detail field is required - they all get written to the spreadsheet.
  const sentenceFrameFilled =
    sfOrganization.trim().length > 0 &&
    sfActivity.trim().length > 0 &&
    sfDate.trim().length > 0 &&
    sfPhotoShows.trim().length > 0 &&
    sfSupervisor.trim().length > 0 &&
    sfSupervisorContact.trim().length > 0;

  const resetSentenceFrame = () => {
    setSfOrganization('');
    setSfActivity('');
    setSfDate('');
    setSfPhotoShows('');
    setSfSupervisor('');
    setSfSupervisorContact('');
  };

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
        setSelectedMemberCurrentHours(member);
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
      setSelectedMemberCurrentHours(null);
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

  const processImageFile = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid image file');
      setSubmitStatus('error');
      return;
    }
    setProofImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setIsVerified(false);
    setVerificationResult(null);
    setSubmitStatus('idle');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };



  const handleVerifyImage = async () => {
    // Check for admin bypass code
    if (ADMIN_OVERRIDE_CODE && adminCode === ADMIN_OVERRIDE_CODE) {
      // Bypass skips the AI check, not the required details
      if (!sentenceFrameFilled) {
        setErrorMessage('Please fill in all of the activity detail fields before submitting.');
        setSubmitStatus('error');
        return;
      }
      setIsVerified(true);
      setVerificationResult({ isValid: true });
      await doSubmitForm(true);
      return;
    }

    // Require sentence frame fields filled
    if (!sentenceFrameFilled) {
      setErrorMessage('Please fill in all of the activity detail fields - organization, activity, date, photo description, supervisor, and supervisor contact.');
      setSubmitStatus('error');
      return;
    }

    if (!proofImage) {
      setErrorMessage('Please upload an image first');
      setSubmitStatus('error');
      return;
    }

    setIsVerifying(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Single Gemini call: send image + description together
    const verification = await verifyImage(proofImage, activityDescription);

    if (!verification.isValid) {
      const reason = verification.geminiReasoning || verification.error || 'Your image and description do not match. Please try again.';
      setVerificationResult({
        isValid: false,
        geminiReasoning: reason,
        suggestions: verification.suggestions
      });
      setIsVerified(false);
      setIsVerifying(false);
      // Show failure popup
      setVerifyPopupReasoning(reason);
      setShowFailedPopup(true);
      return;
    }

    const reason = verification.geminiReasoning || 'Your proof looks good!';
    setVerificationResult({
      isValid: true,
      geminiReasoning: reason
    });
    setIsVerified(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setIsVerifying(false);

    // Auto-submit immediately after verification passes
    await doSubmitForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmitForm();
  };

  const handleSubmitFromPopup = async () => {
    setShowVerifiedPopup(false);
    await doSubmitForm();
  };

  const doSubmitForm = async (alreadyVerified = false) => {
    if (!writeEnabled) {
      setErrorMessage('Submissions are currently disabled.');
      setSubmitStatus('error');
      return;
    }
    if (!alreadyVerified && !isVerified) {
      setErrorMessage('Please verify your proof of volunteering image before submitting');
      setSubmitStatus('error');
      return;
    }

    // For existing members, require selection from the list
    if (!isNewMember && !selectedMember) {
      setErrorMessage('Please select your name from the list. If you\'re a new member, click "New Member" above.');
      setSubmitStatus('error');
      return;
    }

    // For new members, check if name already exists (prevent duplicates)
    if (isNewMember && formData.name) {
      const nameExists = existingMembers.some(
        member => member.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (nameExists) {
        setErrorMessage('This name already exists in the system. Please click "Existing Member" and search for your name instead.');
        setSubmitStatus('error');
        return;
      }
    }
    
    if (!formData.name || !formData.grade || !formData.inducted) {
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }

    // Max 500 hours per submission
    const submissionTotal = (parseFloat(formData.summerHours) || 0) + (parseFloat(formData.chapterHours) || 0) + (parseFloat(formData.otherHours) || 0);
    if (submissionTotal > 500) {
      setErrorMessage('You cannot submit more than 500 hours at once. Please reduce your hours.');
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
        inducted: formData.inducted,
        organization: sfOrganization,
        activity: sfActivity,
        serviceDate: sfDate,
        photoShows: sfPhotoShows,
        supervisor: sfSupervisor,
        supervisorContact: sfSupervisorContact
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
      resetSentenceFrame();
      setAdminCode('');
      setIsVerified(false);
      setVerificationResult(null);
      setSelectedMember('');
      setNameSearchQuery('');
      setHasSearched(false);
      setHasMadeChoice(false);
      setSelectedMemberCurrentHours(null);
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

  // What a returning member's record will read once this submission lands.
  const cur = selectedMemberCurrentHours;
  const projected = cur
    ? (() => {
        const summerRaw = cur.summerHours + rawSummerHours;
        const summer = Math.min(summerRaw, 8);
        const chapter = cur.chapterHours + chapterHours;
        const other = cur.otherHours + otherHours;
        return { summer, summerRaw, chapter, other, total: summer + chapter + other };
      })()
    : null;
  const adding = totalHours > 0;

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
      color: 'text-blue-500'
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
      color: 'text-amber-500'
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
              navigate('/hours-tracker');
            }}
            darkMode={darkMode}
            submittedName={submittedName}
            stats={celebrationStats}
          />
        )}
      </AnimatePresence>

      {/* Verification Success Popup with Confetti */}
      <AnimatePresence>
        {showVerifiedPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowVerifiedPopup(false)}
          >
            <div className={`absolute inset-0 ${darkMode ? 'bg-navy-950/80' : 'bg-black/40'} backdrop-blur-sm`} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {verifyConfetti.map((particle) => (
                <ConfettiParticle key={particle.id} delay={particle.delay} x={particle.x} />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative z-10 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 ${
                darkMode 
                  ? 'bg-gradient-to-b from-navy-900 to-navy-950 border border-emerald-500/30' 
                  : 'bg-white border border-emerald-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}
              >
                <CheckCircle className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold mb-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}
              >
                Verified!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-sm mb-6 break-words ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}
              >
                {verifyPopupReasoning}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={handleSubmitFromPopup}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-semibold bg-gold-400 text-navy-950 hover:bg-gold-300 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Hours
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowVerifiedPopup(false)}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                    darkMode
                      ? 'text-navy-200/75 hover:text-gray-200 hover:bg-navy-800/50'
                      : 'text-navy-200/60 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Failed Popup */}
      <AnimatePresence>
        {showFailedPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={() => setShowFailedPopup(false)}
          >
            <div className={`fixed inset-0 ${darkMode ? 'bg-navy-950/80' : 'bg-black/40'} backdrop-blur-sm`} />
            <div className="flex min-h-full items-center justify-center py-8 px-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative z-10 p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm ${
                darkMode 
                  ? 'bg-gradient-to-b from-navy-900 to-navy-950 border border-red-500/30' 
                  : 'bg-white border border-red-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}
              >
                <AlertCircle className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-2xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}
              >
                Not Verified
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-sm break-words ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}
              >
                {verifyPopupReasoning}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className={`mt-3 p-3 rounded-xl text-xs ${
                  darkMode ? 'bg-amber-900/20 border border-amber-500/20 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                <strong>No photo or still not approved?</strong> Email{' '}
                <a href="mailto:1060801@lwsd.org" className="font-bold underline">1060801@lwsd.org</a>{' '}
                and you will receive an override code you can enter instead.
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowFailedPopup(false)}
                className={`mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Try Again
              </motion.button>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen ${
        darkMode 
          ? 'bg-gradient-to-br from-navy-950 via-navy-950 to-navy-950' 
          : 'bg-gray-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <PageHero
            title="Submit Hours"
            subtitle="Log your volunteer hours and track your progress toward NHS requirements."
            className="mb-8"
          />
        </motion.div>

        <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Main Content - Two Column Layout */}
          <div className="grid items-stretch lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="flex h-full flex-col gap-4"
            >
              <div className={`flex-1 rounded-3xl border p-5 lg:p-6 ${
                darkMode 
                  ? 'bg-navy-950/80 border-white/10' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Initial Question - Have you submitted before? */}
                {!hasMadeChoice ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6"
                  >
                    {/* Centered Title */}
                    <div className="text-center mb-8">
                      <h2 className={`text-2xl lg:text-3xl font-bold mb-3 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Have You Submitted Hours On This Website Before?
                      </h2>
                      <p className={`text-base ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>
                        If this is your first time using this site, select <span className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>"New to This Site"</span> below
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Yes - Returning Member (Blue) */}
                      <button
                        type="button"
                        onClick={() => {
                          setHasMadeChoice(true);
                          setIsNewMember(false);
                          setSelectedMember('');
                          setNameSearchQuery('');
                          setHasSearched(false);
                          setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', otherHours: '', inducted: '' });
                        }}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-[1.01] ${
                          darkMode 
                            ? 'bg-blue-950/50 border-gold-400/40 hover:border-blue-400 hover:bg-navy-900/50' 
                            : 'bg-blue-50/80 border-blue-300 hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40">
                            <CheckCircle className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              I've Submitted On This Site Before
                            </h4>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gold-200' : 'text-blue-600'}`}>
                              Find my existing record on this website
                            </p>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:translate-x-1 ${
                            darkMode ? 'bg-gold-400/30' : 'bg-blue-200'
                          }`}>
                            <ArrowRight className={`w-5 h-5 ${darkMode ? 'text-gold-200' : 'text-blue-600'}`} />
                          </div>
                        </div>
                      </button>
                      
                      {/* No - New Member (Red) */}
                      <button
                        type="button"
                        onClick={() => {
                          setHasMadeChoice(true);
                          setIsNewMember(true);
                          setSelectedMember('');
                          setNameSearchQuery('');
                          setHasSearched(false);
                          setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', otherHours: '', inducted: '' });
                        }}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:scale-[1.01] ${
                          darkMode 
                            ? 'bg-blue-950/50 border-gold-400/40 hover:border-blue-400 hover:bg-navy-900/50' 
                            : 'bg-blue-50/80 border-blue-300 hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40">
                            <UserPlus className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              New to This Site
                            </h4>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gold-200' : 'text-blue-600'}`}>
                              I've never submitted hours on this website before
                            </p>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:translate-x-1 ${
                            darkMode ? 'bg-gold-400/30' : 'bg-blue-200'
                          }`}>
                            <ArrowRight className={`w-5 h-5 ${darkMode ? 'text-gold-200' : 'text-blue-600'}`} />
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Back button to change choice */}
                    <button
                      type="button"
                      onClick={() => {
                        setHasMadeChoice(false);
                        setSelectedMember('');
                        setNameSearchQuery('');
                        setHasSearched(false);
                        setFormData({ name: '', grade: '', summerHours: '', chapterHours: '', otherHours: '', inducted: '' });
                        setIsVerified(false);
                        setVerificationResult(null);
                        setProofImage(null);
                        setImagePreview(null);
                        resetSentenceFrame();
                        setSelectedMemberCurrentHours(null);
                      }}
                      className={`mb-4 text-sm flex items-center gap-1 transition-colors ${
                        darkMode ? 'text-navy-200/75 hover:text-white' : 'text-navy-200/60 hover:text-gray-800'
                      }`}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      {isNewMember ? 'Actually, I\'ve Submitted Before' : 'Actually, I\'m New Here'}
                    </button>
                    
                    {/* Header showing current mode */}
                    <div className={`p-3 rounded-xl mb-2 flex items-center gap-3 ${
                      isNewMember 
                        ? darkMode ? 'bg-navy-900/30 border border-gold-400/30' : 'bg-blue-50 border border-blue-200'
                        : darkMode ? 'bg-navy-900/30 border border-gold-400/30' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      {isNewMember ? (
                        <UserPlus className={`w-5 h-5 ${darkMode ? 'text-gold-300' : 'text-blue-600'}`} />
                      ) : (
                        <Users className={`w-5 h-5 ${darkMode ? 'text-gold-300' : 'text-blue-600'}`} />
                      )}
                      <span className={`text-sm font-semibold ${
                        isNewMember 
                          ? darkMode ? 'text-gold-300' : 'text-blue-700'
                          : darkMode ? 'text-gold-300' : 'text-blue-700'
                      }`}>
                        {isNewMember ? 'Creating New Member Profile' : 'Finding Your Existing Record'}
                      </span>
                    </div>

                {/* Existing Member Autocomplete OR New Name Input */}
                {!isNewMember ? (
                  <div className="relative">
                    <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      Find Your Name <span className="text-red-500">*</span>
                    </label>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
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
                            ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
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
                            ? 'bg-navy-800 text-navy-200/60 cursor-not-allowed'
                            : 'bg-gray-200 text-navy-200/75 cursor-not-allowed'
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
                              ? 'bg-navy-900 border-white/10' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          {filteredMembers.length > 0 ? (
                            <>
                              <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                                darkMode ? 'text-navy-200/60 bg-navy-950/50 border-white/10' : 'text-navy-200/75 bg-gray-50 border-gray-100'
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
                                      ? 'hover:bg-blue-600/30 text-white border-b border-white/10 last:border-0' 
                                      : 'hover:bg-blue-100 text-gray-900 border-b border-gray-100 last:border-0'
                                  }`}
                                >
                                  <span className="font-medium">{member.name}</span>
                                  <span className={`text-sm px-2 py-0.5 rounded ${darkMode ? 'bg-navy-800 text-navy-100' : 'bg-gray-100 text-gray-600'}`}>
                                    {member.grade}
                                  </span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className={`px-4 py-4 text-center ${
                              darkMode ? 'text-navy-200/75' : 'text-navy-200/60'
                            }`}>
                              <p className="font-medium">❌ No matching members found</p>
                              <p className="text-sm mt-1">Make sure you typed your name exactly as registered (check spelling!).</p>
                              <p className="text-sm mt-2">If this is your first time, go back and select <strong>"No, this is my first time"</strong>.</p>
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

                    {/* Record on file, updating live as hours are typed */}
                    {cur && projected && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 rounded-2xl border p-5 ${
                          darkMode
                            ? 'bg-navy-900/40 border-white/10'
                            : 'bg-white border-navy-900/12 shadow-sm'
                        }`}
                      >
                        <div className="flex items-baseline justify-between">
                          <p className={`text-[11px] font-semibold uppercase tracking-eyebrow ${
                            darkMode ? 'text-gold-300' : 'text-gold-600'
                          }`}>
                            {adding ? 'After this submission' : 'Your record'}
                          </p>
                          {adding && (
                            <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                              darkMode ? 'text-gold-300' : 'text-gold-600'
                            }`}>
                              +{totalHours.toFixed(1)} hrs
                            </p>
                          )}
                        </div>

                        {/* Headline total */}
                        <div className="mt-3 flex items-baseline gap-3">
                          <span className={`font-display text-5xl font-semibold leading-none tabular-nums ${
                            darkMode ? 'text-white' : 'text-navy-900'
                          }`}>
                            {projected.total.toFixed(1)}
                          </span>
                          <span className={`text-sm ${darkMode ? 'text-navy-200/70' : 'text-navy-800/60'}`}>
                            of 30 hrs
                          </span>
                          {adding && (
                            <span className={`ml-auto text-sm tabular-nums line-through ${
                              darkMode ? 'text-navy-200/40' : 'text-navy-800/35'
                            }`}>
                              {cur.totalHours.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Progress: what is banked, then what this adds */}
                        <div className={`mt-4 flex h-2 overflow-hidden rounded-full ${
                          darkMode ? 'bg-white/10' : 'bg-navy-900/10'
                        }`}>
                          <div
                            className={`h-full transition-all duration-500 ${
                              darkMode ? 'bg-navy-300' : 'bg-navy-600'
                            }`}
                            style={{ width: `${Math.min((cur.totalHours / 30) * 100, 100)}%` }}
                          />
                          <div
                            className="h-full bg-gold-400 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min((projected.total / 30) * 100, 100) -
                                  Math.min((cur.totalHours / 30) * 100, 100)
                              )}%`,
                            }}
                          />
                        </div>

                        <p className={`mt-2.5 text-[13px] ${darkMode ? 'text-navy-200/75' : 'text-navy-800/70'}`}>
                          {projected.total >= 30
                            ? 'Year goal complete.'
                            : projected.total >= 10
                            ? `${(30 - projected.total).toFixed(1)} hrs to the year goal. Semester goal met.`
                            : `${(10 - projected.total).toFixed(1)} hrs to the semester goal, ${(30 - projected.total).toFixed(1)} to the year.`}
                        </p>

                        {/* Category breakdown */}
                        <dl className={`mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl ${
                          darkMode ? 'bg-white/10' : 'bg-navy-900/10'
                        }`}>
                          {[
                            { label: 'Summer', now: projected.summer, add: Math.min(rawSummerHours, Math.max(0, 8 - cur.summerHours)) },
                            { label: 'Chapter', now: projected.chapter, add: chapterHours },
                            { label: 'Other', now: projected.other, add: otherHours },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className={`px-3 py-3 text-center ${darkMode ? 'bg-navy-900' : 'bg-white'}`}
                            >
                              <p className={`font-display text-xl font-semibold tabular-nums ${
                                darkMode ? 'text-white' : 'text-navy-900'
                              }`}>
                                {row.now.toFixed(1)}
                              </p>
                              <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                darkMode ? 'text-navy-200/60' : 'text-navy-800/55'
                              }`}>
                                {row.label}
                              </p>
                              {row.add > 0 && (
                                <p className={`mt-1 text-[11px] font-semibold tabular-nums ${
                                  darkMode ? 'text-gold-300' : 'text-gold-600'
                                }`}>
                                  +{row.add.toFixed(1)}
                                </p>
                              )}
                            </div>
                          ))}
                        </dl>

                        {!adding && (
                          <p className={`mt-3 text-[13px] ${darkMode ? 'text-navy-200/60' : 'text-navy-800/55'}`}>
                            Enter the hours you&rsquo;re adding below and this will update.
                          </p>
                        )}
                        {projected.summerRaw > 8 && (
                          <p className={`mt-3 text-[13px] ${darkMode ? 'text-gold-300' : 'text-gold-700'}`}>
                            Summer hours count toward the total up to 8, so{' '}
                            {(projected.summerRaw - 8).toFixed(1)} of them won&rsquo;t count.
                          </p>
                        )}
                      </motion.div>
                    )}

                    {!selectedMember && !hasSearched && nameSearchQuery.length >= 2 && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>
                        👆 Click <strong>Find</strong> to search for your name
                      </p>
                    )}
                    
                    {existingMembers.length === 0 && !isLoadingMembers && (
                      <p className={`text-sm mt-2 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                        No members found. Go back and select "No, this is my first time" to create your profile.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
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
                          ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                      }`}
                    />
                  </div>
                )}

                {/* Grade */}
                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                    Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-navy-900 border-white/10 text-white focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
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
                    <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      Summer Hours
                    </label>
                    <input
                      type="number"
                      name="summerHours"
                      min="0"
                      max="500"
                      step="0.5"
                      value={formData.summerHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                      }`}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>Max 8 count</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      Chapter Hours
                    </label>
                    <input
                      type="number"
                      name="chapterHours"
                      min="0"
                      max="500"
                      step="0.5"
                      value={formData.chapterHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                      }`}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>Min 6 required</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      Other Hours
                    </label>
                    <input
                      type="number"
                      name="otherHours"
                      min="0"
                      max="500"
                      step="0.5"
                      value={formData.otherHours}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        darkMode 
                          ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                      }`}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>Non-chapter</p>
                  </div>
                </div>

                {/* Total Display - returning members see this in their record panel above */}
                {(totalHours > 0 || summerHoursExceeded) && !cur && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-navy-900 to-navy-900/50 border border-white/10' : 'bg-gradient-to-br from-white to-blue-50 border border-gray-200 shadow-lg'}`}
                  >
                    {summerHoursExceeded && (
                      <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${darkMode ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        <span className="text-base">⚠️</span>
                        <span>Only 8 of your {rawSummerHours} summer hours count toward the goal</span>
                      </div>
                    )}
                    
                    {/* Main Hours Display */}
                    <div className="text-center mb-4">
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                        Total Effective Hours
                      </p>
                      <p className={`text-4xl font-bold ${
                        totalHours >= 30 ? 'text-emerald-500' : totalHours >= 10 ? (darkMode ? 'text-gold-300' : 'text-blue-600') : (darkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {totalHours.toFixed(1)}
                        <span className={`text-lg font-normal ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}> / 30</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className={`h-3 rounded-full overflow-hidden mb-4 ${darkMode ? 'bg-navy-800' : 'bg-gray-200'}`}>
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
                          : (darkMode ? 'bg-navy-800/50 border border-white/10' : 'bg-gray-100 border border-gray-200')
                      }`}>
                        <p className={`text-xs font-semibold mb-1 ${
                          totalHours >= 10 
                            ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                            : (darkMode ? 'text-navy-200/75' : 'text-navy-200/60')
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
                          : (darkMode ? 'bg-navy-800/50 border border-white/10' : 'bg-gray-100 border border-gray-200')
                      }`}>
                        <p className={`text-xs font-semibold mb-1 ${
                          totalHours >= 30 
                            ? (darkMode ? 'text-emerald-400' : 'text-emerald-700')
                            : (darkMode ? 'text-navy-200/75' : 'text-navy-200/60')
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
                    <p className={`text-xs mt-3 text-center ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                      10 hours due by end of 1st semester • 20 more due by end of year
                    </p>
                  </motion.div>
                )}

                {/* Inducted Status */}
                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                    Induction Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="inducted"
                    required
                    value={formData.inducted}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      darkMode 
                        ? 'bg-navy-900 border-white/10 text-white focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                    }`}
                  >
                    <option value="">Select status</option>
                    <option value="Yes">Yes - Inducted member</option>
                    <option value="No">No - Pending induction</option>
                  </select>
                </div>

                {/* Image Proof Upload */}
                <div className={`p-6 rounded-xl border-2 border-dashed ${
                  darkMode ? 'border-white/10 bg-navy-900/50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <label className={`block text-sm font-bold mb-1 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                    Proof Of Volunteering <span className="text-red-500">*</span>
                  </label>
                  <p className={`text-xs mb-3 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                    Upload a photo from your event, or a screenshot of an email with an organizer/advisor confirming your participation. If you have trouble getting your image accepted or forgot to take proof, email{' '}
                    <a href="mailto:1060801@lwsd.org" className={`font-semibold underline ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>1060801@lwsd.org</a>{' '}
                    and you will receive an override code.
                  </p>
                  
                  {/* File Upload */}
                  {!imagePreview ? (
                    <label
                      className={`flex flex-col items-center justify-center cursor-pointer py-8 px-4 rounded-lg transition-all border-2 border-dashed ${
                        isDragging
                          ? darkMode
                            ? 'bg-navy-900/30 border-blue-500'
                            : 'bg-blue-50 border-blue-400'
                          : darkMode
                          ? 'hover:bg-navy-800/50 border-white/10'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleImageDrop}
                    >
                      <Upload className={`w-12 h-12 mb-3 ${isDragging ? 'text-gold-300' : darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`} />
                      <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                        {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
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
                            resetSentenceFrame();
                            setAdminCode('');
                          }}
                          className={`absolute top-2 right-2 p-2 rounded-lg ${
                            darkMode ? 'bg-navy-950/80 text-white hover:bg-navy-950' : 'bg-white/80 text-gray-900 hover:bg-white'
                          }`}
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Sentence Frame - Structured Activity Description */}
                      <div className="space-y-3">
                        <label className={`block text-sm font-bold mb-1 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                          Describe Your Activity <span className="text-red-500">*</span>
                        </label>
                        <p className={`text-xs mb-3 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                          Fill in every field below - all of them are required.
                        </p>

                        {/* Organization */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>I volunteered with</span>
                          <input
                            type="text"
                            value={sfOrganization}
                            onChange={(e) => { setSfOrganization(e.target.value); setIsVerified(false); setVerificationResult(null); }}
                            placeholder="e.g. Kirkland Food Bank"
                            className={`flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Activity */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>where I</span>
                          <input
                            type="text"
                            value={sfActivity}
                            onChange={(e) => { setSfActivity(e.target.value); setIsVerified(false); setVerificationResult(null); }}
                            placeholder="e.g. sorted food donations and stocked shelves"
                            className={`flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>on</span>
                          <input
                            type="text"
                            value={sfDate}
                            onChange={(e) => { setSfDate(e.target.value); setIsVerified(false); setVerificationResult(null); }}
                            placeholder="e.g. March 15, 2026"
                            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Photo description */}
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap mt-2 ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>My photo/email shows</span>
                          <input
                            type="text"
                            value={sfPhotoShows}
                            onChange={(e) => { setSfPhotoShows(e.target.value); setIsVerified(false); setVerificationResult(null); }}
                            placeholder="e.g. me at the food bank, or an email from an organizer confirming my volunteer shift"
                            className={`flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>
                        <p className={`text-xs -mt-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                          A photo at the event is ideal, but a screenshot of an email with an organizer/advisor confirming your participation is also accepted.
                        </p>

                        {/* Supervisor Name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>Supervisor name</span>
                          <input
                            type="text"
                            value={sfSupervisor}
                            onChange={(e) => setSfSupervisor(e.target.value)}
                            placeholder="e.g. John Doe"
                            className={`flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Supervisor Contact */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium whitespace-nowrap ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>Supervisor contact</span>
                          <input
                            type="text"
                            value={sfSupervisorContact}
                            onChange={(e) => setSfSupervisorContact(e.target.value)}
                            placeholder="e.g. jdoe@email.com or (425) 555-1234"
                            className={`flex-1 min-w-[180px] px-3 py-2 rounded-lg border text-sm transition-all ${
                              darkMode
                                ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                            }`}
                          />
                        </div>

                        {/* Preview of generated description */}
                        {sentenceFrameFilled && (
                          <div className={`mt-2 p-3 rounded-lg text-xs italic ${
                            darkMode ? 'bg-navy-900/50 text-navy-200/75 border border-white/10/50' : 'bg-gray-100 text-navy-200/60 border border-gray-200'
                          }`}>
                            {activityDescription}
                          </div>
                        )}
                      </div>

                      {/* Admin Code (Optional) */}
                      <div>
                        <label className={`block text-sm font-bold mb-2 uppercase tracking-wide ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                          Admin Override Code (Optional)
                        </label>
                        <input
                          type="password"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          placeholder="Enter admin code to bypass verification"
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            darkMode 
                              ? 'bg-navy-900 border-white/10 text-white placeholder-navy-200/45 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20' 
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20 focus:bg-white'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
                          NHS officers only. Leave blank if you're a regular member.
                        </p>
                      </div>

                      {/* Verify & Submit Button */}
                      <button
                        type="button"
                        onClick={handleVerifyImage}
                        disabled={isVerifying || isSubmitting || !sentenceFrameFilled}
                        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          isVerifying || isSubmitting || !sentenceFrameFilled
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : darkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : isSubmitting ? (
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

                {/* Error Message - at bottom where user sees it */}
                <AnimatePresence>
                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`p-4 rounded-xl flex items-start gap-3 ${
                        darkMode 
                          ? 'bg-red-900/30 border border-red-500/30' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                        {errorMessage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                  </>
                )}
              </form>

              {/* View Leaderboard + My Hours Links */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-wrap justify-center gap-5">
                <button
                  onClick={() => navigate('/hours-tracker')}
                  className={`inline-flex items-center gap-2 font-medium transition-colors ${
                    darkMode 
                      ? 'text-navy-200/75 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </button>
                <button
                  onClick={() => navigate('/my-hours')}
                  className={`inline-flex items-center gap-2 font-medium transition-colors ${
                    darkMode 
                      ? 'text-gold-300 hover:text-gold-200' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Check My Hours
                </button>
              </div>
            </div>

              {/* Hours Requirements */}
              <div className={`rounded-3xl border p-5 ${
                darkMode 
                  ? 'bg-navy-950/80 border-white/10' 
                  : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hours Requirements
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className={`p-3 rounded-xl text-center min-h-[88px] flex flex-col justify-between ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>8</p>
                    <p className={`text-xs ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Max Summer</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center min-h-[88px] flex flex-col justify-between ${darkMode ? 'bg-navy-900/30' : 'bg-blue-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-gold-300' : 'text-blue-600'}`}>6</p>
                    <p className={`text-xs ${darkMode ? 'text-gold-200' : 'text-blue-700'}`}>Chapter Min</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center min-h-[88px] flex flex-col justify-between col-span-2 sm:col-span-1 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>30</p>
                    <p className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Total Required</p>
                  </div>
                </div>
              </div>
          </motion.div>

          {/* Right Side - Rules */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="h-full"
          >
            <div className={`h-full rounded-3xl border p-5 lg:p-6 ${
              darkMode 
                ? 'bg-gradient-to-br from-navy-950 to-navy-900 border-white/10' 
                : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 shadow-xl'
            }`}>
              <h2 className={`text-2xl font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Submission Guidelines
              </h2>
              
              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <motion.div
                    key={rule.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-3.5 rounded-xl ${darkMode ? 'bg-navy-900/50' : 'bg-white shadow-sm border border-gray-100'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-navy-800' : 'bg-gray-100'}`}>
                        <rule.icon className={`w-5 h-5 ${rule.color}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {rule.title}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
    </>
  );
}
