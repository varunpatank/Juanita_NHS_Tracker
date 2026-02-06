import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
import { useDarkMode } from '../lib/darkModeContext';

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

const mockOpportunities: VolunteerOpportunity[] = [
  {
    id: '1',
    title: 'Kirkland Food Bank Distribution',
    description: 'Help distribute food to families in need at the Kirkland Food Bank. Volunteers will help sort donations, pack food boxes, and assist families with loading groceries. This is a great opportunity to directly impact food insecurity in our community.',
    location: 'Kirkland Food Bank, 125 5th Ave, Kirkland, WA',
    latitude: 47.6769,
    longitude: -122.2060,
    date: '2026-02-15',
    time: '9:00 AM - 1:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Kirkland Food Bank',
    contact_email: 'volunteer@kirklandfoodbank.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    category: 'food'
  },
  {
    id: '2',
    title: 'Juanita Beach Park Cleanup',
    description: 'Join us for a community beach cleanup at beautiful Juanita Beach Park. We will be removing litter, invasive plants, and helping maintain the natural beauty of our local shoreline. Gloves and bags provided.',
    location: 'Juanita Beach Park, 9703 NE Juanita Dr, Kirkland, WA',
    latitude: 47.7028,
    longitude: -122.2102,
    date: '2026-02-22',
    time: '10:00 AM - 12:00 PM',
    hours_estimate: '2 hours',
    organizer: 'City of Kirkland Parks',
    contact_email: 'parks@kirklandwa.gov',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1617953141905-b27fb1f17d88?w=800',
    category: 'environment'
  },
  {
    id: '3',
    title: 'Seattle Children\'s Hospital Reading Program',
    description: 'Read books to children at Seattle Children\'s Hospital. Bring joy and comfort to young patients through the magic of storytelling. Training provided. Must pass background check.',
    location: 'Seattle Children\'s Hospital, 4800 Sand Point Way NE, Seattle, WA',
    latitude: 47.6623,
    longitude: -122.2856,
    date: '2026-02-18',
    time: '2:00 PM - 4:00 PM',
    hours_estimate: '2 hours',
    organizer: 'Seattle Children\'s Hospital Volunteer Services',
    contact_email: 'volunteer@seattlechildrens.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    category: 'education'
  },
  {
    id: '4',
    title: 'Habitat for Humanity Build Day',
    description: 'Help build affordable homes for families in need! No construction experience necessary - all skill levels welcome. Learn new skills while making a tangible difference in someone\'s life. Lunch provided.',
    location: 'Habitat Build Site, 15600 NE 8th St, Bellevue, WA',
    latitude: 47.6181,
    longitude: -122.1310,
    date: '2026-03-01',
    time: '8:00 AM - 3:00 PM',
    hours_estimate: '7 hours',
    organizer: 'Habitat for Humanity Seattle-King County',
    contact_email: 'volunteer@habitatskc.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    category: 'housing'
  },
  {
    id: '5',
    title: 'Senior Center Technology Help',
    description: 'Assist seniors at the Kirkland Senior Center with technology questions. Help with smartphones, tablets, video calling, and basic computer skills. Patience and friendliness required!',
    location: 'Kirkland Senior Center, 406 Kirkland Ave, Kirkland, WA',
    latitude: 47.6815,
    longitude: -122.2087,
    date: '2026-02-20',
    time: '1:00 PM - 3:00 PM',
    hours_estimate: '2 hours',
    organizer: 'Kirkland Senior Center',
    contact_email: 'seniorcenter@kirklandwa.gov',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
    category: 'education'
  },
  {
    id: '6',
    title: 'Redmond Homeless Shelter Meal Service',
    description: 'Prepare and serve meals at the Redmond Homeless Shelter. Help provide warm, nutritious meals to those experiencing homelessness in our community. A great way to give back.',
    location: 'Redmond Homeless Shelter, 16255 NE 87th St, Redmond, WA',
    latitude: 47.6840,
    longitude: -122.1138,
    date: '2026-02-25',
    time: '5:00 PM - 8:00 PM',
    hours_estimate: '3 hours',
    organizer: 'Friends of Youth',
    contact_email: 'volunteer@friendsofyouth.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    category: 'food'
  },
  {
    id: '7',
    title: 'Bothell Pet Shelter Dog Walking',
    description: 'Walk and socialize dogs at the Bothell Pet Shelter. Help our furry friends get exercise and human interaction while they wait for their forever homes. Training provided.',
    location: 'Bothell Pet Shelter, 19851 25th Ave NE, Shoreline, WA',
    latitude: 47.7574,
    longitude: -122.3124,
    date: '2026-02-16',
    time: '11:00 AM - 1:00 PM',
    hours_estimate: '2 hours',
    organizer: 'King County Animal Services',
    contact_email: 'volunteer@kingcounty.gov',
    is_chapter_sponsored: false,
    impact_level: 'Low',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    category: 'animals'
  },
  {
    id: '8',
    title: 'Juanita High School Tutoring',
    description: 'Tutor middle school students in math, science, and English at Juanita High School. Help younger students build confidence and achieve academic success. Great for NHS members!',
    location: 'Juanita High School, 10601 NE 132nd St, Kirkland, WA',
    latitude: 47.7211,
    longitude: -122.2054,
    date: '2026-02-19',
    time: '3:30 PM - 5:00 PM',
    hours_estimate: '1.5 hours',
    organizer: 'Juanita NHS Chapter',
    contact_email: 'nhs@lwsd.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    category: 'education'
  },
  {
    id: '9',
    title: 'Marymoor Park Trail Restoration',
    description: 'Help restore and maintain trails at Marymoor Park. Activities include clearing brush, spreading gravel, and building water bars. Great outdoor volunteer experience!',
    location: 'Marymoor Park, 6046 W Lake Sammamish Pkwy NE, Redmond, WA',
    latitude: 47.6632,
    longitude: -122.1185,
    date: '2026-03-08',
    time: '9:00 AM - 12:00 PM',
    hours_estimate: '3 hours',
    organizer: 'King County Parks',
    contact_email: 'volunteer@kingcounty.gov',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    category: 'environment'
  },
  {
    id: '10',
    title: 'Blood Drive at Crossroads Mall',
    description: 'Volunteer at the Bloodworks Northwest blood drive. Help check in donors, provide refreshments, and support the donation process. Every pint of blood can save up to 3 lives!',
    location: 'Crossroads Mall, 15600 NE 8th St, Bellevue, WA',
    latitude: 47.6175,
    longitude: -122.1320,
    date: '2026-02-28',
    time: '10:00 AM - 4:00 PM',
    hours_estimate: '2-6 hours (flexible)',
    organizer: 'Bloodworks Northwest',
    contact_email: 'volunteer@bloodworksnw.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
    category: 'health'
  }
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
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(mockOpportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [filterChapterSponsored, setFilterChapterSponsored] = useState<boolean | null>(null);
  const [filterImpact, setFilterImpact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Discover meaningful ways to serve your community and make a lasting impact. 
              Every act of service strengthens the bonds that unite us all.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className={`backdrop-blur-sm border-b py-6 px-4 sm:px-6 lg:px-8 ${
        darkMode 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <Filter className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
            <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Opportunities:</span>
          </div>
          
          <button
            onClick={() => setFilterChapterSponsored(filterChapterSponsored === true ? null : true)}
            className={`px-6 py-3 border rounded-xl text-sm font-semibold transition-all duration-300 ${
              filterChapterSponsored === true
                ? darkMode 
                  ? 'bg-blue-900/50 border-blue-500 text-blue-400'
                  : 'bg-blue-50 border-blue-400 text-blue-900'
                : darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-blue-900/30 hover:border-blue-500'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-400'
            }`}
          >
            <School className="w-4 h-4 inline mr-2" />
            Chapter Sponsored
          </button>
          
          <button
            onClick={() => setFilterChapterSponsored(filterChapterSponsored === false ? null : false)}
            className={`px-6 py-3 border rounded-xl text-sm font-semibold transition-all duration-300 ${
              filterChapterSponsored === false
                ? darkMode
                  ? 'bg-red-900/50 border-red-500 text-red-400'
                  : 'bg-red-50 border-red-400 text-red-600'
                : darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-red-900/30 hover:border-red-500'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-400'
            }`}
          >
            External Partners
          </button>
          
          {['High', 'Medium', 'Low'].map((impact) => (
            <button
              key={impact}
              onClick={() => setFilterImpact(filterImpact === impact ? null : impact)}
              className={`px-6 py-3 border rounded-xl text-sm font-semibold transition-all duration-300 ${
                filterImpact === impact
                  ? getImpactColor(impact)
                  : darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
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
              className={`text-sm flex items-center px-4 py-2 rounded-xl transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
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
            zoom={11}
            className="h-full w-full"
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
                icon={createCustomIcon(opportunity.is_chapter_sponsored, opportunity.impact_level)}
              >
                <Popup>
                  <div className="p-2 min-w-[280px]">
                    <img 
                      src={opportunity.image} 
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
                      className="w-full mt-3 py-2 bg-gradient-to-r from-blue-900 to-red-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        
        {/* Floating Legend */}
        <div className={`absolute bottom-6 left-6 p-4 rounded-xl shadow-lg z-[500] ${
          darkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
        } backdrop-blur-sm`}>
          <h4 className={`font-bold text-sm mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-900"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Chapter Sponsored</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>External Partner</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
              <span className="font-bold">★</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">●</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Medium Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">○</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low Impact</span>
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
                darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero Image */}
              <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedOpportunity.image} 
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
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                      selectedOpportunity.is_chapter_sponsored 
                        ? 'bg-blue-900/80 text-white' 
                        : 'bg-red-600/80 text-white'
                    }`}>
                      {selectedOpportunity.is_chapter_sponsored ? '★ Chapter Sponsored' : 'External Partner'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                      selectedOpportunity.impact_level === 'High' ? 'bg-green-600/80 text-white' :
                      selectedOpportunity.impact_level === 'Medium' ? 'bg-yellow-600/80 text-white' :
                      'bg-gray-600/80 text-white'
                    }`}>
                      {selectedOpportunity.impact_level} Impact
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{selectedOpportunity.title}</h2>
                </div>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <MapPin className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedOpportunity.location}</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <Calendar className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(selectedOpportunity.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <Clock className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedOpportunity.time} ({selectedOpportunity.hours_estimate})</span>
                  </div>
                  <div className={`flex items-center p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <Users className={`w-5 h-5 mr-3 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedOpportunity.organizer}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className={`font-bold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>About This Opportunity</h3>
                  <p className={`leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedOpportunity.description}</p>
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
                    className={`flex-1 border-2 py-4 px-6 rounded-xl font-bold transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
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