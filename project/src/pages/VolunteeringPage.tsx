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
  /** upcoming = single dated event, ongoing = recurring through endDate */
  status: 'upcoming' | 'ongoing';
  /** Named contact for sign-ups, when the listing gives one */
  contact_name?: string;
  /** Last day an ongoing opportunity runs (YYYY-MM-DD) */
  endDate?: string;
}

// Chapter volunteer opportunities, taken from the NHS Canvas assignments.
// Addresses and coordinates were confirmed against LWSD and venue listings.
// Anything whose date has passed is filtered out automatically below.
const mockOpportunities: VolunteerOpportunity[] = [
  {
    id: 'keller-pta-oct1',
    title: 'Helen Keller Elementary PTA Meeting Childcare',
    description:
      'Helen Keller Elementary wants to offer childcare during its general PTA meetings this year, starting with this one. They have not been able to run it consistently before, so turnout from NHS matters - if it works, it continues for every future general meeting.',
    location: 'Helen Keller Elementary, 13820 108th Ave NE, Kirkland, WA 98034',
    latitude: 47.72472,
    longitude: -122.19570,
    date: '2026-10-01',
    time: 'Thursday, 6:00 PM',
    hours_estimate: '~2 hours',
    organizer: 'Helen Keller Elementary PTA',
    contact_name: 'Caitlin Emmons',
    contact_email: 'president@helenkellerpta.org',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1587616211892-f743fcca64f9?w=800',
    category: 'education',
    status: 'upcoming',
  },
  {
    id: 'thoreau-parent-oct2',
    title: 'Thoreau Elementary Parent Meeting Childcare',
    description:
      'Thoreau needs two students to watch about three to six children from 3:45 to 4:45 PM while their parents attend a meeting at the school. A short, well-defined shift straight after the school day.',
    location: 'Henry David Thoreau Elementary, 8224 NE 138th St, Kirkland, WA 98034',
    latitude: 47.72507,
    longitude: -122.23016,
    date: '2026-10-02',
    time: 'Friday, 3:45-4:45 PM',
    hours_estimate: '1 hour',
    organizer: 'Thoreau Elementary',
    contact_name: 'Heidi Gilmore',
    contact_email: 'hgilmore@lwsd.org',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    category: 'education',
    status: 'upcoming',
  },
  {
    id: 'bell-curriculum-oct8',
    title: 'Bell Elementary Curriculum Night Childcare',
    description:
      'Bell hosts its annual Curriculum Night and wants NHS volunteers to run activities for children whose families need childcare to attend the classroom sessions. Four arts-and-crafts stations plus a movie option. The evening runs 5:00 to 7:30 PM.',
    location: 'Alexander Graham Bell Elementary, 11212 NE 112th St, Kirkland, WA 98033',
    latitude: 47.70132,
    longitude: -122.19219,
    date: '2026-10-08',
    time: 'Thursday, 5:00-7:30 PM',
    hours_estimate: '~2.5 hours',
    organizer: 'Bell Elementary',
    contact_name: 'Brian Story',
    contact_email: 'bstory@lwsd.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
    category: 'education',
    status: 'upcoming',
  },
  {
    id: 'kubana-refugee-tutoring',
    title: 'Tutoring Program Serving Refugee Students',
    description:
      'Kubana runs a local tutoring program for Ugandan and Rwandan refugee students in grades 5-12, most at Cedar Park Christian and some at LWSD schools. All are English speakers. Tutors mainly help with math and social studies, plus some science and English. They want regular tutors for the whole school year and will put on a training session first.',
    location: 'Our Redeemer Lutheran Church, 11611 NE 140th St, Kirkland, WA 98034',
    latitude: 47.72524,
    longitude: -122.18613,
    date: '2026-10-01',
    endDate: '2027-06-19',
    time: 'Thursdays & Saturdays, 5:00-7:00 PM',
    hours_estimate: '2 hours per session',
    organizer: 'Kubana',
    contact_name: 'Terri Dayton',
    contact_email: 'tedayton@lwsd.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    category: 'education',
    status: 'ongoing',
  },
];

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

  // An opportunity drops off the board once it is over: dated events the day
  // after they run, ongoing ones after their end date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrent = (opp: VolunteerOpportunity) => {
    const last = new Date((opp.endDate ?? opp.date) + 'T23:59:59');
    return last.getTime() >= today.getTime();
  };
  const liveOpportunities = opportunities.filter(isCurrent);

  const filteredOpportunities = liveOpportunities
    .filter(opp => {
      const categoryMatch = !filterCategory || opp.category === filterCategory;
      const sponsoredMatch = filterSponsored === null || opp.is_chapter_sponsored === filterSponsored;
      return categoryMatch && sponsoredMatch;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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


          </div>
        </div>
      </div>

      {/* Split View: Half Map + Half List */}
      <div className={`px-4 sm:px-6 lg:px-8 py-6 ${darkMode ? 'bg-navy-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-sm mb-4 ${darkMode ? 'text-navy-200/60' : 'text-navy-200/75'}`}>
            {filteredOpportunities.length === 0
              ? 'Nothing matches these filters right now.'
              : `${filteredOpportunities.length} open ${filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}`}
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
                        <div className="p-2 w-[min(280px,70vw)]">
                          <img
                            src={opportunity.image}
                            onError={handleImageError}
                            alt={opportunity.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                              opportunity.status === 'ongoing'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-amber-400 text-gray-900'
                            }`}>
                              {opportunity.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2 text-base">{opportunity.title}</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-3 h-3 mr-2 text-blue-900 flex-shrink-0" />
                              <span className="text-xs">{opportunity.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-3 h-3 mr-2 text-blue-900" />
                              {new Date(opportunity.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
            <div className="space-y-4 overflow-visible sm:h-[480px] sm:overflow-y-auto sm:pr-1 lg:h-[calc(100vh-220px)]">
              {filteredOpportunities.length === 0 && (
                <div className={`rounded-2xl border p-8 text-center ${
                  darkMode ? 'bg-navy-900/60 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <Calendar className={`w-10 h-10 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-navy-100'}`} />
                  <h3 className="mb-1 font-display text-base font-semibold text-white">
                    Nothing here yet
                  </h3>
                  <p className="text-sm text-navy-200/70">
                    Clear the filters, or turn on past events to see what the
                    chapter has already done.
                  </p>
                </div>
              )}
              {filteredOpportunities.map(opp => {
                const isOngoing = opp.status === 'ongoing';
                return (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-navy-900/60 overflow-hidden cursor-pointer transition-all hover:border-gold-400/50 hover:shadow-lg"
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <div className="p-4">
                    {/* Status + date line */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-eyebrow ${
                          isOngoing ? 'bg-gold-400/20 text-gold-200' : 'bg-gold-400 text-navy-950'
                        }`}
                      >
                        {isOngoing ? 'Ongoing' : 'Upcoming'}
                      </span>
                      <span className="text-xs font-medium text-navy-100">
                        {new Date(opp.date + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold leading-snug text-white">
                      {opp.title}
                    </h3>

                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-start gap-1.5 text-xs text-navy-200/75">
                        <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>{opp.time} &middot; {opp.hours_estimate}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-navy-200/75">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>{opp.location.split(',')[0]}</span>
                      </div>
                    </div>

                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-navy-200/60">
                      {opp.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
                        View details &rarr;
                      </span>
                      {opp.is_chapter_sponsored && (
                        <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-navy-200/60">
                          Chapter sponsored
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
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

                <div className="mb-6 rounded-xl border border-gold-400/30 bg-gold-400/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-gold-300">To sign up</p>
                  <p className="mt-1.5 text-sm text-navy-100">
                    Email{' '}
                    {selectedOpportunity.contact_name && (
                      <span className="font-semibold">{selectedOpportunity.contact_name}</span>
                    )}{' '}
                    <a
                      href={`mailto:${selectedOpportunity.contact_email}`}
                      className="font-semibold text-gold-200 underline decoration-gold-400/50 underline-offset-2"
                    >
                      {selectedOpportunity.contact_email}
                    </a>
                  </p>
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
                    {selectedOpportunity.contact_name
                      ? `Email ${selectedOpportunity.contact_name} to sign up`
                      : 'Contact organizer to sign up'}
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