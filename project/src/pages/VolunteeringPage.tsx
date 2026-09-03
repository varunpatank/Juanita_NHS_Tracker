import { useState, useEffect, type SyntheticEvent } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Clock,
  Users, 
  ExternalLink,
  Filter,
  X,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDarkMode } from '../lib/darkModeContext';
import { PageHero } from '../components/PageHero';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock volunteer opportunities in Washington
interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  hours_estimate: string;
  organizer: string;
  contact_email: string;
  is_chapter_sponsored: boolean;
  impact_level: 'High' | 'Medium' | 'Low';
  image: string;
  category: string;
}

// No opportunities are posted right now - new ones are coming soon.
// To add some back, fill this array with VolunteerOpportunity objects.
const mockOpportunities: VolunteerOpportunity[] = [];

// Component to handle map zoom
function MapController({ selectedOpportunity }: { selectedOpportunity: VolunteerOpportunity | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedOpportunity) {
      map.flyTo(
        [selectedOpportunity.latitude, selectedOpportunity.longitude],
        15,
        { duration: 1.5 }
      );
    }
  }, [selectedOpportunity, map]);
  
  return null;
}

export function VolunteeringPage() {
  const { darkMode } = useDarkMode();
  const [opportunities] = useState<VolunteerOpportunity[]>(mockOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterSponsored, setFilterSponsored] = useState<boolean | null>(null);
  const [sortByDate, setSortByDate] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [loading] = useState(false);

  const fallbackOpportunityImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop';

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.dataset.fallbackApplied === 'true') return;
    target.dataset.fallbackApplied = 'true';
    target.src = fallbackOpportunityImage;
  };

  const categories = [
    { id: 'food', label: 'Food' },
    { id: 'environment', label: 'Environment' },
    { id: 'education', label: 'Education' },
    { id: 'health', label: 'Health' },
    { id: 'animals', label: 'Animals' },
    { id: 'housing', label: 'Housing' },
    { id: 'community', label: 'Community' },
    { id: 'arts', label: 'Arts' },
  ];

  const filteredOpportunities = opportunities
    .filter(opp => {
      const categoryMatch = !filterCategory || opp.category === filterCategory;
      const sponsoredMatch = filterSponsored === null || opp.is_chapter_sponsored === filterSponsored;
      return categoryMatch && sponsoredMatch;
    })
    .sort((a, b) => {
      if (sortByDate) return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: '#16a34a',
      environment: '#15803d',
      education: '#1d4ed8',
      health: '#0369a1',
      animals: '#d97706',
      housing: '#7c3aed',
      community: '#0891b2',
      arts: '#475569',
    };
    return colors[category] || '#4b5563';
  };

  const createCustomIcon = (category: string) => {
    const color = getCategoryColor(category);
    
    return new L.DivIcon({
      html: `
        <div style="
          background: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: 'custom-marker'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <PageHero
          title="Opportunities"
          subtitle="Discover meaningful ways to serve your community and make a lasting impact across Juanita and beyond."
          className="min-h-[360px] sm:min-h-[430px] flex items-center"
          contentClassName="-translate-y-3"
        />
      </motion.div>

      {/* Filters */}
      <div className={`backdrop-blur-sm border-b py-3 px-4 sm:px-6 lg:px-8 ${
        darkMode 
          ? 'bg-navy-950/95 border-white/10' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-gold-300' : 'text-blue-900'}`} />
              <span className={`font-semibold text-sm ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>Filters:</span>
            </div>
            
            {categories.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterCategory(filterCategory === id ? null : id)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                  filterCategory === id
                    ? 'border-blue-500 text-white'
                    : darkMode
                      ? 'bg-navy-900 border-white/10 text-navy-100 hover:bg-navy-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                style={filterCategory === id ? { backgroundColor: getCategoryColor(id), borderColor: getCategoryColor(id) } : {}}
              >
                {label}
              </button>
            ))}

            {filterCategory && (
              <button
                onClick={() => setFilterCategory(null)}
                className={`text-xs flex items-center px-2 py-1.5 rounded-lg transition-colors shrink-0 ${
                  darkMode 
                    ? 'text-navy-200/75 hover:text-gray-200 hover:bg-navy-800' 
                    : 'text-navy-200/60 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </button>
            )}

            {/* Chapter sponsored filter */}
            <button
              onClick={() => setFilterSponsored(filterSponsored === true ? null : true)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterSponsored === true
                  ? 'bg-blue-900 border-blue-900 text-white'
                  : darkMode
                  ? 'bg-navy-900 border-white/10 text-navy-100 hover:bg-navy-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ★ Chapter Sponsored
            </button>
            <button
              onClick={() => setFilterSponsored(filterSponsored === false ? null : false)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterSponsored === false
                  ? 'bg-navy-800 border-gray-500 text-white'
                  : darkMode
                  ? 'bg-navy-900 border-white/10 text-navy-100 hover:bg-navy-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Other Hours
            </button>

            {/* Sort by date */}
            <button
              onClick={() => setSortByDate(!sortByDate)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all flex items-center gap-1 shrink-0 ${
                sortByDate
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : darkMode
                  ? 'bg-navy-900 border-white/10 text-navy-100 hover:bg-navy-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Sort by Date
            </button>

          </div>
        </div>
      </div>

      {/* Split View: Half Map + Half List */}
      <div className={`px-4 sm:px-6 lg:px-8 py-6 ${darkMode ? 'bg-navy-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-sm mb-4 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
            {filteredOpportunities.length === 0
              ? 'No opportunities posted yet - coming soon!'
              : `${filteredOpportunities.length} opportunities ${sortByDate ? '(sorted by date)' : ''}`}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Map */}
            <div className={`relative rounded-2xl overflow-hidden border ${
              darkMode ? 'border-white/10 bg-navy-950' : 'border-gray-200 bg-white'
            } h-[55vw] min-h-[280px] sm:h-[480px] lg:h-[calc(100vh-220px)]`}>
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
                  zoom={11}
                  className="h-full w-full"
                  scrollWheelZoom={mapInteractive}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController selectedOpportunity={selectedOpportunity} />

                  {filteredOpportunities.map((opportunity) => (
                    <Marker
                      key={opportunity.id}
                      position={[opportunity.latitude, opportunity.longitude]}
                      icon={createCustomIcon(opportunity.category)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[280px]">
                          <img
                            src={opportunity.image}
                            onError={handleImageError}
                            alt={opportunity.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-bold text-gray-800 mb-2 text-base">{opportunity.title}</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-3 h-3 mr-2 text-blue-900 flex-shrink-0" />
                              <span className="text-xs">{opportunity.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-3 h-3 mr-2 text-blue-900" />
                              {new Date(opportunity.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-3 h-3 mr-2 text-blue-900" />
                              {opportunity.time}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedOpportunity(opportunity)}
                            className="w-full mt-3 py-2 bg-gradient-to-r from-navy-800 to-gold-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}

              {!mapInteractive && !loading && (
                <div
                  className="absolute inset-0 z-[400] flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                  onClick={() => setMapInteractive(true)}
                >
                  <div className={`px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm pointer-events-none ${
                    darkMode ? 'bg-navy-950/90 text-white border border-white/10' : 'bg-white/90 text-gray-800 border border-gray-200'
                  }`}>
                    Click to interact with map
                  </div>
                </div>
              )}

              <div className={`absolute bottom-4 left-4 p-3 rounded-xl shadow-lg z-[500] ${
                darkMode ? 'bg-navy-950/95 border border-white/10' : 'bg-white/95 border border-gray-200'
              } backdrop-blur-sm`}>
                <h4 className={`font-bold text-xs mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Categories</h4>
                <div className="space-y-1.5 text-xs">
                  {categories.map(({ id, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(id) }} />
                      <span className={darkMode ? 'text-navy-100' : 'text-gray-600'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: List */}
            <div className={`h-[55vw] min-h-[280px] sm:h-[480px] lg:h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-4`}>
              {filteredOpportunities.length === 0 && (
                <div className={`rounded-2xl border p-8 text-center ${
                  darkMode ? 'bg-navy-900/60 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <Calendar className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-navy-100'}`} />
                  <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No opportunities right now
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}>
                    Coming soon - check back later!
                  </p>
                </div>
              )}
              {filteredOpportunities.map(opp => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    darkMode ? 'bg-navy-900/60 border-white/10 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <div className="h-36 overflow-hidden relative">
                    <img
                      src={opp.image}
                      onError={handleImageError}
                      alt={opp.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-bold text-sm mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {opp.title}
                    </h3>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {new Date(opp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {opp.time}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}>
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {opp.hours_estimate}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-navy-200/75' : 'text-navy-200/60'}`}>
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{opp.location.split(',').slice(-2).join(',').trim()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Details Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[1000] backdrop-blur-sm"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl ${
                darkMode ? 'bg-navy-950 border border-white/10' : 'bg-white border border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero Image */}
              <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedOpportunity.image} 
                  onError={handleImageError}
                  alt={selectedOpportunity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 mb-2">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm text-white"
                      style={{ backgroundColor: getCategoryColor(selectedOpportunity.category) + 'cc' }}
                    >
                      {categories.find(c => c.id === selectedOpportunity.category)?.label ?? selectedOpportunity.category}
                    </span>
                    {selectedOpportunity.is_chapter_sponsored && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm bg-navy-900/80 text-white">
                        ★ Chapter Sponsored
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{selectedOpportunity.title}</h2>
                </div>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-navy-900' : 'bg-blue-50'}`}>
                    <MapPin className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-gold-300' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>{selectedOpportunity.location}</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-navy-900' : 'bg-blue-50'}`}>
                    <Calendar className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-gold-300' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>
                      {new Date(selectedOpportunity.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-navy-900' : 'bg-blue-50'}`}>
                    <Clock className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-gold-300' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>{selectedOpportunity.time} ({selectedOpportunity.hours_estimate})</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-navy-900' : 'bg-blue-50'}`}>
                    <Users className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-gold-300' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-navy-100' : 'text-gray-700'}`}>{selectedOpportunity.organizer}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className={`font-bold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>About This Opportunity</h3>
                  <p className={`leading-relaxed ${darkMode ? 'text-navy-200/75' : 'text-gray-600'}`}>{selectedOpportunity.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`mailto:${selectedOpportunity.contact_email}?subject=Interest in ${selectedOpportunity.title}`}
                    className="flex-1 bg-gradient-to-r from-navy-800 to-gold-500 text-white py-4 px-6 rounded-xl font-bold text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Contact Organizer
                  </a>
                  <button
                    onClick={() => setSelectedOpportunity(null)}
                    className={`flex-1 border-2 py-4 px-6 rounded-xl font-bold transition-colors ${
                      darkMode 
                        ? 'border-white/10 text-navy-100 hover:bg-navy-900' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}