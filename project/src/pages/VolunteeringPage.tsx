import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock,
  Users, 
  School,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase, VolunteerOpportunity } from '../lib/supabase';
import { AddOpportunityModal } from '../components/AddOpportunityModal';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function VolunteeringPage() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [filterChapterSponsored, setFilterChapterSponsored] = useState<boolean | null>(null);
  const [filterImpact, setFilterImpact] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .eq('is_approved', true)
        .order('date', { ascending: true });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filterChapterSponsored !== null && opp.is_chapter_sponsored !== filterChapterSponsored) {
      return false;
    }
    if (filterImpact && opp.impact_level !== filterImpact) {
      return false;
    }
    return true;
  });

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-50 text-green-800 border-green-700';
      case 'Medium': return 'bg-yellow-50 text-yellow-800 border-yellow-600';
      case 'Low': return 'bg-blue-50 text-blue-800 border-blue-900';
      default: return 'bg-gray-50 text-gray-800 border-gray-300';
    }
  };

  const createCustomIcon = (isChapterSponsored: boolean, impactLevel: string) => {
    const color = isChapterSponsored ? '#1e3a8a' : '#dc2626';
    const symbol = impactLevel === 'High' ? '★' : impactLevel === 'Medium' ? '●' : '○';
    
    return new L.DivIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, ${color}, ${color}dd);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          ">
            ${symbol}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: 'custom-marker'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-red-600 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl backdrop-blur-sm">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                alt="Juanita High School"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Service Opportunities
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Discover meaningful ways to serve your community and make a lasting impact. 
              Every act of service strengthens the bonds that unite us all.
            </p>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <Plus className="w-6 h-6" />
              <span>Share New Opportunity</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-sm border-b-4 border-blue-900 py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-blue-900" />
            <span className="font-bold text-gray-700">Filter Opportunities:</span>
          </div>
          
          <button
            onClick={() => setFilterChapterSponsored(filterChapterSponsored === true ? null : true)}
            className={`px-6 py-3 border-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              filterChapterSponsored === true
                ? 'bg-blue-50 border-blue-900 text-blue-900 shadow-lg'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-900'
            }`}
          >
            <School className="w-4 h-4 inline mr-2" />
            Chapter Sponsored
          </button>
          
          <button
            onClick={() => setFilterChapterSponsored(filterChapterSponsored === false ? null : false)}
            className={`px-6 py-3 border-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
              filterChapterSponsored === false
                ? 'bg-red-50 border-red-600 text-red-600 shadow-lg'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-600'
            }`}
          >
            External Partners
          </button>
          
          {['High', 'Medium', 'Low'].map((impact) => (
            <button
              key={impact}
              onClick={() => setFilterImpact(filterImpact === impact ? null : impact)}
              className={`px-6 py-3 border-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filterImpact === impact
                  ? getImpactColor(impact) + ' shadow-lg'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {impact} Impact
            </button>
          ))}
          
          {(filterChapterSponsored !== null || filterImpact) && (
            <button
              onClick={() => {
                setFilterChapterSponsored(null);
                setFilterImpact(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-screen w-full relative">
        {loading ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading opportunities...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[47.7211, -122.2054]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredOpportunities.map((opportunity) => (
              <Marker
                key={opportunity.id}
                position={[opportunity.latitude, opportunity.longitude]}
                icon={createCustomIcon(opportunity.is_chapter_sponsored, opportunity.impact_level)}
                eventHandlers={{
                  click: () => setSelectedOpportunity(opportunity)
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[320px]">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">{opportunity.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-blue-900" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-900" />
                        {new Date(opportunity.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-900" />
                        {opportunity.time}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-lg border-4 ${getImpactColor(opportunity.impact_level)}`}>
                          {opportunity.impact_level} Impact
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-lg border-4 ${
                          opportunity.is_chapter_sponsored 
                            ? 'bg-blue-50 text-blue-900 border-blue-900' 
                            : 'bg-red-50 text-red-600 border-red-600'
                        }`}>
                          {opportunity.is_chapter_sponsored ? 'Chapter' : 'External'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Opportunity Details Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-4 border-blue-900 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedOpportunity.title}</h2>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-blue-900" />
                  <span>{selectedOpportunity.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-blue-900" />
                  <span>{new Date(selectedOpportunity.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-blue-900" />
                  <span>{selectedOpportunity.time} ({selectedOpportunity.hours_estimate})</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-blue-900" />
                  <span>{selectedOpportunity.organizer}</span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <span className={`px-4 py-2 text-sm font-semibold rounded-xl border-4 ${getImpactColor(selectedOpportunity.impact_level)}`}>
                  {selectedOpportunity.impact_level} Impact
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-xl border-4 ${
                  selectedOpportunity.is_chapter_sponsored 
                    ? 'bg-blue-50 text-blue-900 border-blue-900' 
                    : 'bg-red-50 text-red-600 border-red-600'
                }`}>
                  {selectedOpportunity.is_chapter_sponsored ? 'Chapter Sponsored' : 'External Partner'}
                </span>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">About This Opportunity</h3>
                <p className="text-gray-600 leading-relaxed">{selectedOpportunity.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:${selectedOpportunity.contact_email}?subject=Interest in ${selectedOpportunity.title}`}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Contact Organizer
                </a>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="flex-1 border-4 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Opportunity Modal */}
      <AddOpportunityModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={fetchOpportunities}
      />
    </div>
  );
}