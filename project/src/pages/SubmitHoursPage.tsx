import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, X, ArrowRight, Shield } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { verifyVolunteerActivity } from '../lib/gemini';
import { useDarkMode } from '../lib/darkModeContext';

type GradeLevel = 'freshman' | 'sophomore' | 'junior' | 'senior' | null;

export function SubmitHoursPage() {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(null);
  const [fullDescription, setFullDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { darkMode } = useDarkMode();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const gradeOptions = [
    { 
      id: 'freshman', 
      label: 'Freshman (9th Grade)', 
      color: 'from-green-700 to-green-600',
      accent: 'border-green-700 bg-green-50'
    },
    { 
      id: 'sophomore', 
      label: 'Sophomore (10th Grade)', 
      color: 'from-blue-900 to-blue-700',
      accent: 'border-blue-900 bg-blue-50'
    },
    { 
      id: 'junior', 
      label: 'Junior (11th Grade)', 
      color: 'from-yellow-600 to-yellow-500',
      accent: 'border-yellow-600 bg-yellow-50'
    },
    { 
      id: 'senior', 
      label: 'Senior (12th Grade)', 
      color: 'from-red-600 to-red-500',
      accent: 'border-red-600 bg-red-50'
    }
  ];

  const formUrls = {
    freshman: 'https://forms.office.com/Pages/ResponsePage.aspx?Host=Teams&lang=%7Blocale%7D&groupId=%7BgroupId%7D&tid=%7Btid%7D&teamsTheme=%7Btheme%7D&upn=%7Bupn%7D&id=P2fUH5bfIUaGOKHYjEyF14sTooyFFCFPiNJ3GunxR8pUOExHMVJaQkpWVjdOUVZaNFhLWUFCQkdEVC4u',
    sophomore: 'https://forms.office.com/Pages/ResponsePage.aspx?Host=Teams&lang={locale}&groupId={groupId}&tid={tid}&teamsTheme={theme}&upn={upn}&id=P2fUH5bfIUaGOKHYjEyF14sTooyFFCFPiNJ3GunxR8pURTZZODdaQkRYQkdHTUxENFJXM0U4SDhZVC4u',
    junior: 'https://forms.office.com/Pages/ResponsePage.aspx?Host=Teams&lang={locale}&groupId={groupId}&tid={tid}&teamsTheme={theme}&upn={upn}&id=P2fUH5bfIUaGOKHYjEyF14sTooyFFCFPiNJ3GunxR8pUOEU5S04yUEVRT1MzRDEzSkpDQjlKQjdHRC4u',
    senior: 'https://forms.office.com/Pages/ResponsePage.aspx?Host=Teams&lang={locale}&groupId={groupId}&tid={tid}&teamsTheme={theme}&upn={upn}&id=P2fUH5bfIUaGOKHYjEyF14sTooyFFCFPiNJ3GunxR8pUOEtNN0dITE5JUlU1Q1dBRFIyUENRNUtZNi4u'
  };

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    
    // Create preview for the first image
    if (acceptedFiles.length > 0 && acceptedFiles[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleVerification = async () => {
    if (!fullDescription.trim() || uploadedFiles.length === 0) return;

    setIsVerifying(true);
    setVerificationResult('pending');

    try {
      const result = await verifyVolunteerActivity(fullDescription, uploadedFiles[0]);
      setVerificationResult(result.isValid ? 'success' : 'failed');
      setVerificationMessage(result.reason || '');
    } catch (error) {
      setVerificationResult('failed');
      setVerificationMessage('Unable to verify your submission. Please ensure your image clearly shows the service activity you describe and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setPreviewImage(null);
      // Set preview for next image if available
      if (uploadedFiles.length > 1 && uploadedFiles[1].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(uploadedFiles[1]);
      }
    }
  };

  const showImagePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecureFormAccess = (url: string) => {
    // Create a data URL with the redirect page
    const redirectPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NHS Service Hours Submission</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #1e3a8a, #dc2626);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          .logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h1 { 
            margin: 0 0 10px; 
            font-size: 28px; 
            font-weight: 700;
          }
          p { 
            margin: 10px 0; 
            opacity: 0.9; 
            line-height: 1.5;
          }
          .security-note {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.8;
          }
          .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            margin: 20px 0;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: white;
            border-radius: 2px;
            animation: progress 3s ease-in-out;
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🏫</div>
          <h1>NHS Service Hours</h1>
          <p>Connecting to secure submission portal...</p>
          <div class="spinner"></div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <p style="font-size: 16px; font-weight: 600;">Redirecting to Microsoft Forms</p>
          <div class="security-note">
            <p style="margin: 0; font-size: 13px;">
              🔒 This is a secure connection to your official NHS service hours submission form.
            </p>
          </div>
        </div>
        <script>
          // Redirect after 3 seconds
          setTimeout(() => {
            window.location.replace('${url}');
          }, 3000);
          
          // Fallback redirect on click
          document.addEventListener('click', () => {
            window.location.replace('${url}');
          });
        </script>
      </body>
      </html>
    `;

    // Create blob URL for the redirect page
    const blob = new Blob([redirectPage], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Open the redirect page
    const newWindow = window.open(
      blobUrl,
      '_blank',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no,directories=no'
    );
    
    if (!newWindow) {
      // Fallback if popup blocked - direct redirect
      window.open(url, '_blank');
    } else {
      // Clean up blob URL after window opens
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-red-50'
      }`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
              alt="Juanita High School"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Submit Your Service Hours
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-200 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Document your community impact and contribute to our collective mission. 
            Your service matters and every hour counts towards positive change.
          </p>
        </motion.div>

        {/* Grade Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border-4 border-blue-900 transition-colors duration-200 ${
            darkMode ? 'bg-gray-800/90' : 'bg-white/90'
          }`}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-10 h-10 bg-gradient-to-br from-blue-900 to-red-600 rounded-xl flex items-center justify-center mr-3 text-white font-bold text-sm shadow-lg">1</span>
            Choose Your Academic Year
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {gradeOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setSelectedGrade(option.id as GradeLevel)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 border-4 rounded-2xl transition-all duration-300 text-left ${
                  selectedGrade === option.id
                    ? `${option.accent} border-current shadow-xl transform -translate-y-1`
                    : 'border-gray-200 hover:border-blue-900 hover:bg-blue-50/50 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-white font-bold text-xl">
                    {option.id === 'freshman' ? '9' : option.id === 'sophomore' ? '10' : option.id === 'junior' ? '11' : '12'}
                  </span>
                </div>
                <h3 className={`font-bold text-lg transition-colors duration-200 ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>{option.label}</h3>
                <p className={`text-sm mt-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Access your grade-specific submission portal
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Service Documentation */}
        <AnimatePresence>
          {selectedGrade && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border-4 border-blue-900 transition-colors duration-200 ${
                darkMode ? 'bg-gray-800/90' : 'bg-white/90'
              }`}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-br from-blue-900 to-red-600 rounded-xl flex items-center justify-center mr-3 text-white font-bold text-sm shadow-lg">2</span>
                Document Your Service
              </h2>

              {/* File Upload */}
              <div className="mb-8">
                <label className={`block text-sm font-medium mb-4 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload Evidence (Photos, Ensure it Matches Activity)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-4 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-blue-900 bg-blue-50 dark:bg-blue-900/20'
                      : darkMode 
                        ? 'border-gray-600 hover:border-blue-900 hover:bg-blue-900/20' 
                        : 'border-gray-300 hover:border-blue-900 hover:bg-blue-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  {isDragActive ? (
                    <p className={`font-medium text-lg transition-colors duration-200 ${
                      darkMode ? 'text-blue-400' : 'text-blue-900'
                    }`}>Drop your files here...</p>
                  ) : (
                    <div>
                      <p className={`font-medium mb-2 text-lg transition-colors duration-200 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Drag & drop files here, or click to browse
                      </p>
                      <p className={`text-sm transition-colors duration-200 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Supports: JPG, PNG, PDF (Max 10MB each)
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-200 ${
                          darkMode 
                            ? 'bg-blue-900/20 border-blue-700' 
                            : 'bg-blue-50 border-blue-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <FileText className="w-6 h-6 text-blue-900 mr-3" />
                          <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.type.startsWith('image/') && (
                            <button
                              onClick={() => showImagePreview(file)}
                              className="text-blue-900 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Image Preview */}
                {previewImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 border-4 rounded-2xl p-6 transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-bold transition-colors duration-200 ${
                        darkMode ? 'text-gray-100' : 'text-gray-800'
                      }`}>Image Preview</h3>
                      <button
                        onClick={() => setPreviewImage(null)}
                        className={`p-2 rounded-xl transition-colors ${
                          darkMode
                            ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={previewImage}
                        alt="Evidence preview"
                        className="max-w-full max-h-96 object-contain rounded-xl shadow-lg border-4 border-white"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Combined Description */}
              <div className="mb-8">
                <label className={`block text-sm font-medium mb-4 transition-colors duration-200 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Describe your service activity and how your image evidence supports it
                </label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={8}
                  className={`w-full p-4 border-4 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  placeholder="Example: I volunteered at the Kirkland Food Bank on Saturday morning, helping to sort and package food donations for families in need. In my photo, you can see me wearing the volunteer apron while organizing canned goods on the sorting tables in the food bank warehouse. The image shows the food bank's organized donation area and demonstrates my hands-on involvement in the food distribution process."
                />
              </div>

              {/* Verification Button */}
              <button
                onClick={handleVerification}
                disabled={!fullDescription.trim() || uploadedFiles.length === 0 || isVerifying}
                className="w-full bg-gradient-to-r from-blue-900 to-red-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-xl text-lg"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </button>

              {/* Verification Status */}
              <AnimatePresence>
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-6 p-6 rounded-xl border-4 ${
                      verificationResult === 'success'
                        ? 'bg-green-50 text-green-700 border-green-700'
                        : verificationResult === 'failed'
                        ? 'bg-red-50 text-red-700 border-red-600'
                        : 'bg-blue-50 text-blue-700 border-blue-900'
                    }`}
                  >
                    <div className="flex items-start">
                      {verificationResult === 'success' ? (
                        <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                      ) : verificationResult === 'failed' ? (
                        <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold block mb-2 text-lg">
                          {verificationResult === 'success'
                            ? 'Verification Successful!'
                            : verificationResult === 'failed'
                            ? 'Verification Failed'
                            : 'Verifying your activity...'}
                        </span>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {verificationMessage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secure Form Access */}
        <AnimatePresence>
          {selectedGrade && verificationResult === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-green-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                  </span>
                  Complete Your Submission
                </h2>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-8 h-8 text-white mr-3" />
                    <h3 className="font-bold text-white text-lg">Activity Successfully Verified!</h3>
                  </div>
                  <p className="text-green-100">
                    Your volunteer activity has been authenticated. Click below to access the secure submission form.
                  </p>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {gradeOptions.find(g => g.id === selectedGrade)?.label} Submission Form
                </h3>
                <p className="text-green-100 mb-6">
                  Access your grade-specific Microsoft Teams form to officially record your service hours.
                </p>
              </div>

              {/* Secure Form Access */}
              <div className="p-8 bg-white">
                <div className="bg-gradient-to-br from-blue-50 to-green-50 border-4 border-green-700 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Ready to Submit Your Hours
                  </h3>
                  
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your verification is complete! Click the button below to open your secure submission form.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleSecureFormAccess(formUrls[selectedGrade])}
                      className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-lg"
                    >
                      <Shield className="w-6 h-6 mr-3" />
                      Open Secure Submission Form
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </button>
                    
                    <div className="bg-blue-50 border-4 border-blue-900 rounded-xl p-4">
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-900 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Secure Access:</p>
                          <p>The form will open through a secure loading page that protects your privacy. Please allow popups if prompted.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}