import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkContentAppropriate } from '../lib/gemini';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddOpportunityModal({ isOpen, onClose, onSuccess }: AddOpportunityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    latitude: '',
    longitude: '',
    date: '',
    time: '',
    description: '',
    isChapterSponsored: false,
    impactLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    hoursEstimate: '',
    organizer: '',
    contactEmail: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!supabase) {
        setError('Database not configured. Cannot add opportunities.');
        setIsSubmitting(false);
        return;
      }

      // Check for inappropriate content
      const contentToCheck = `${formData.title} ${formData.description} ${formData.organizer}`;
      const isAppropriate = await checkContentAppropriate(contentToCheck);
      
      if (!isAppropriate) {
        setError('Content appears inappropriate. Please review your submission.');
        setIsSubmitting(false);
        return;
      }

      // Check for duplicates
      const { data: existingOpportunities } = await supabase
        .from('volunteer_opportunities')
        .select('title, location, date')
        .eq('title', formData.title)
        .eq('location', formData.location)
        .eq('date', formData.date);

      if (existingOpportunities && existingOpportunities.length > 0) {
        setError('A similar opportunity already exists for this date and location.');
        setIsSubmitting(false);
        return;
      }

      // Insert new opportunity
      const { error: insertError } = await supabase
        .from('volunteer_opportunities')
        .insert({
          title: formData.title,
          location: formData.location,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          date: formData.date,
          time: formData.time,
          description: formData.description,
          is_chapter_sponsored: formData.isChapterSponsored,
          impact_level: formData.impactLevel,
          hours_estimate: formData.hoursEstimate,
          organizer: formData.organizer,
          contact_email: formData.contactEmail
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setFormData({
          title: '',
          location: '',
          latitude: '',
          longitude: '',
          date: '',
          time: '',
          description: '',
          isChapterSponsored: false,
          impactLevel: 'Medium',
          hoursEstimate: '',
          organizer: '',
          contactEmail: ''
        });
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!formData.location) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-900 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Opportunity</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border-4 border-green-700 rounded-xl flex items-center text-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Opportunity added successfully!</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border-4 border-red-600 rounded-xl flex items-center text-red-700"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="e.g., Food Bank Distribution"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organizer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizer}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="e.g., Kirkland Food Bank"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1 p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="e.g., Kirkland Community Center"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="px-4 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Auto-filled from location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="Auto-filled from location"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="e.g., 9:00 AM - 1:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
                  placeholder="Describe the volunteer opportunity and what participants will do..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Level *
                  </label>
                  <select
                    required
                    value={formData.impactLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, impactLevel: e.target.value as 'Low' | 'Medium' | 'High' }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    <option value="Low">Low Impact</option>
                    <option value="Medium">Medium Impact</option>
                    <option value="High">High Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours Estimate *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hoursEstimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoursEstimate: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="e.g., 4 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border-4 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="contact@organization.org"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="chapterSponsored"
                  checked={formData.isChapterSponsored}
                  onChange={(e) => setFormData(prev => ({ ...prev, isChapterSponsored: e.target.checked }))}
                  className="w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label htmlFor="chapterSponsored" className="ml-2 text-sm text-gray-700">
                  This is a chapter-sponsored opportunity (hosted at school or within district)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Adding Opportunity...' : 'Add Opportunity'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-4 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}