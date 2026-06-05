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

const mockOpportunities: VolunteerOpportunity[] = [
  {
    id: '1',
    title: 'Kirkland Food Bank Distribution',
    description: 'Help distribute food to families in need at the Kirkland Food Bank. Volunteers will help sort donations, pack food boxes, and assist families with loading groceries.',
    location: 'Kirkland Food Bank, 125 5th Ave, Kirkland, WA',
    latitude: 47.6769,
    longitude: -122.2060,
    date: '2026-06-15',
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
    date: '2026-06-22',
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
    date: '2026-06-18',
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
    description: 'Help build affordable homes for families in need! No construction experience necessary — all skill levels welcome. Lunch provided.',
    location: 'Habitat Build Site, 15600 NE 8th St, Bellevue, WA',
    latitude: 47.6181,
    longitude: -122.1310,
    date: '2026-07-01',
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
    date: '2026-06-20',
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
    description: 'Prepare and serve meals at the Redmond Homeless Shelter. Help provide warm, nutritious meals to those experiencing homelessness in our community.',
    location: 'Redmond Homeless Shelter, 16255 NE 87th St, Redmond, WA',
    latitude: 47.6840,
    longitude: -122.1138,
    date: '2026-06-25',
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
    date: '2026-06-16',
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
    date: '2026-06-19',
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
    date: '2026-07-08',
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
    date: '2026-06-28',
    time: '10:00 AM - 4:00 PM',
    hours_estimate: '2-6 hours (flexible)',
    organizer: 'Bloodworks Northwest',
    contact_email: 'volunteer@bloodworksnw.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
    category: 'health'
  },
  {
    id: '11',
    title: 'Kirkland Arts Center Gallery Help',
    description: 'Assist at the Kirkland Arts Center during their summer exhibition. Help with visitor orientation, artwork labeling, and front desk reception. A great way to support local artists!',
    location: 'Kirkland Arts Center, 620 Market St, Kirkland, WA',
    latitude: 47.6818,
    longitude: -122.2073,
    date: '2026-07-10',
    time: '11:00 AM - 3:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Kirkland Arts Center',
    contact_email: 'info@kirklandartscenter.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800',
    category: 'arts'
  },
  {
    id: '12',
    title: 'Eastside Animal Rescue Cat Socializing',
    description: 'Spend time socializing cats at Eastside Humane Society. Help shy or anxious cats become more comfortable with humans so they\'re more likely to be adopted into loving homes.',
    location: 'Eastside Humane Society, 13122 NE 177th Pl, Woodinville, WA',
    latitude: 47.7543,
    longitude: -122.1472,
    date: '2026-06-21',
    time: '1:00 PM - 3:00 PM',
    hours_estimate: '2 hours',
    organizer: 'Eastside Humane Society',
    contact_email: 'volunteer@eastsidehumanesociety.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800',
    category: 'animals'
  },
  {
    id: '13',
    title: 'Lake Washington STEM Mentorship',
    description: 'Mentor middle schoolers in STEM subjects as part of the Lake Washington School District partnership. Lead hands-on experiments, coding activities, and robotics challenges.',
    location: 'Finn Hill Middle School, 8040 NE 132nd St, Kirkland, WA',
    latitude: 47.7196,
    longitude: -122.1920,
    date: '2026-07-15',
    time: '3:00 PM - 5:00 PM',
    hours_estimate: '2 hours',
    organizer: 'Juanita NHS Chapter / LWSD',
    contact_email: 'nhs@lwsd.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    category: 'education'
  },
  {
    id: '14',
    title: 'Yarrow Bay Wetlands Restoration',
    description: 'Help restore the Yarrow Bay wetlands by removing invasive blackberry and planting native species. Protect critical habitat for migratory birds and local wildlife.',
    location: 'Yarrow Bay Wetlands, 6321 Lake Washington Blvd NE, Kirkland, WA',
    latitude: 47.6556,
    longitude: -122.2079,
    date: '2026-07-12',
    time: '9:00 AM - 11:30 AM',
    hours_estimate: '2.5 hours',
    organizer: 'Washington Native Plant Society',
    contact_email: 'volunteer@wnps.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
    category: 'environment'
  },
  {
    id: '15',
    title: 'Bellevue Community Food Drive',
    description: 'Help organize and run a community food drive at Bellevue Square. Collect non-perishable food items from shoppers and sort donations for local food pantries.',
    location: 'Bellevue Square, 575 Bellevue Way NE, Bellevue, WA',
    latitude: 47.6160,
    longitude: -122.2008,
    date: '2026-07-05',
    time: '12:00 PM - 4:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Bellevue Food Bank Coalition',
    contact_email: 'volunteer@bellevuefoodbank.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    category: 'food'
  },
  {
    id: '16',
    title: 'Redmond Library Reading Buddy',
    description: 'Help elementary-age children improve their reading skills at the Redmond Regional Library. Pair up with a child for 30-minute guided reading sessions. Training provided.',
    location: 'Redmond Regional Library, 15990 NE 85th St, Redmond, WA',
    latitude: 47.6801,
    longitude: -122.1231,
    date: '2026-07-07',
    time: '3:30 PM - 5:30 PM',
    hours_estimate: '2 hours',
    organizer: 'King County Library System',
    contact_email: 'volunteer@kcls.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    category: 'education'
  },
  {
    id: '17',
    title: 'Sammamish River Cleanup',
    description: 'Join a team of volunteers to clean up trash along the Sammamish River Trail. Help preserve one of Redmond\'s most beloved natural corridors for cyclists, walkers, and wildlife.',
    location: 'Sammamish River Trail Trailhead, Redmond, WA',
    latitude: 47.6744,
    longitude: -122.1098,
    date: '2026-07-18',
    time: '8:00 AM - 11:00 AM',
    hours_estimate: '3 hours',
    organizer: 'Forterra / Redmond Parks',
    contact_email: 'volunteer@forterra.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1542601906897-ecd6e29cb498?w=800',
    category: 'environment'
  },
  {
    id: '18',
    title: 'Eastside Meals on Wheels',
    description: 'Deliver hot meals to homebound seniors across Kirkland and Bellevue. Make a meaningful connection while ensuring elderly residents receive proper nutrition and a friendly face.',
    location: 'Meals on Wheels HQ, 5130 Lakemont Blvd SE, Bellevue, WA',
    latitude: 47.5738,
    longitude: -122.1561,
    date: '2026-07-02',
    time: '10:30 AM - 1:00 PM',
    hours_estimate: '2.5 hours',
    organizer: 'Eastside Meals on Wheels',
    contact_email: 'volunteer@eastsidemeals.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    category: 'community'
  },
  {
    id: '19',
    title: 'Kirkland Public Art Mural Project',
    description: 'Help paint a community mural in downtown Kirkland celebrating the city\'s history and diversity. Work alongside local artists to create a lasting public artwork.',
    location: 'Downtown Kirkland, Kirkland Ave, Kirkland, WA',
    latitude: 47.6820,
    longitude: -122.2081,
    date: '2026-07-20',
    time: '10:00 AM - 2:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Kirkland Arts Commission',
    contact_email: 'arts@kirklandwa.gov',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800',
    category: 'arts'
  },
  {
    id: '20',
    title: 'Overlake Medical Center Patient Support',
    description: 'Provide comfort to patients at Overlake Medical Center by delivering newspapers, helping with wayfinding, and assisting in the hospital gift shop. No medical experience required.',
    location: 'Overlake Medical Center, 1035 116th Ave NE, Bellevue, WA',
    latitude: 47.6258,
    longitude: -122.1933,
    date: '2026-07-09',
    time: '9:00 AM - 12:00 PM',
    hours_estimate: '3 hours',
    organizer: 'Overlake Hospital Volunteer Services',
    contact_email: 'volunteer@overlakehospital.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    category: 'health'
  },
  {
    id: '21',
    title: 'Kirkland Neighborhood Cleanup',
    description: 'Join fellow community members to clean up Kirkland\'s neighborhoods before summer. Pick up litter, clear sidewalks, and help beautify our shared spaces.',
    location: 'Kirkland City Hall, 123 5th Ave, Kirkland, WA',
    latitude: 47.6808,
    longitude: -122.2064,
    date: '2026-06-27',
    time: '9:00 AM - 12:00 PM',
    hours_estimate: '3 hours',
    organizer: 'City of Kirkland Community Services',
    contact_email: 'community@kirklandwa.gov',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'community'
  },
  {
    id: '22',
    title: 'Bellevue Boys & Girls Club After-School Help',
    description: 'Mentor and assist youth at the Boys & Girls Club of Bellevue during after-school hours. Help with homework, lead games, and be a positive role model for kids ages 6–18.',
    location: 'Boys & Girls Club, 14512 Main St, Bellevue, WA',
    latitude: 47.5999,
    longitude: -122.1603,
    date: '2026-07-14',
    time: '3:00 PM - 6:00 PM',
    hours_estimate: '3 hours',
    organizer: 'Boys & Girls Club of Bellevue',
    contact_email: 'volunteer@bgcbellevue.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1603714228681-b399854b8f80?w=800',
    category: 'community'
  },
  {
    id: '23',
    title: 'King County Animal Shelter Dog Training',
    description: 'Help train dogs at the King County Animal Shelter using positive reinforcement techniques. Teach basic commands like sit, stay, and leash manners to improve adoptability.',
    location: 'King County Animal Shelter, 21615 64th Ave S, Kent, WA',
    latitude: 47.4098,
    longitude: -122.2135,
    date: '2026-07-11',
    time: '10:00 AM - 12:00 PM',
    hours_estimate: '2 hours',
    organizer: 'King County Animal Control',
    contact_email: 'animals@kingcounty.gov',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    category: 'animals'
  },
  {
    id: '24',
    title: 'Greater Seattle Food Rescue',
    description: 'Bike or drive to pick up surplus food from local restaurants, grocery stores, and bakeries and deliver it to shelters and community organizations before it goes to waste.',
    location: 'Operation Sack Lunch, 2112 3rd Ave, Seattle, WA',
    latitude: 47.6161,
    longitude: -122.3438,
    date: '2026-07-03',
    time: '7:00 AM - 9:00 AM',
    hours_estimate: '2 hours',
    organizer: 'Operation Sack Lunch',
    contact_email: 'volunteer@oslserves.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
    category: 'food'
  },
  {
    id: '25',
    title: 'Woodinville Arts in the Park',
    description: 'Volunteer at the Woodinville Arts in the Park summer festival. Help set up booths, assist vendors, guide visitors, and support local artists showcasing their work.',
    location: 'DeYoung Park, 13209 NE 175th St, Woodinville, WA',
    latitude: 47.7541,
    longitude: -122.1490,
    date: '2026-07-25',
    time: '9:00 AM - 5:00 PM',
    hours_estimate: '4-8 hours (flexible)',
    organizer: 'Woodinville Arts Alliance',
    contact_email: 'volunteer@woodinvillearts.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=800',
    category: 'arts'
  },
  {
    id: '26',
    title: 'Shoreline Health Clinic Interpreter',
    description: 'Assist non-English-speaking patients at the Shoreline Community Health Clinic. Bilingual volunteers can help with patient check-in, form completion, and communicating with staff.',
    location: 'Shoreline Community Health Center, 15540 15th Ave NE, Shoreline, WA',
    latitude: 47.7468,
    longitude: -122.3216,
    date: '2026-07-08',
    time: '8:30 AM - 11:30 AM',
    hours_estimate: '3 hours',
    organizer: 'Neighborcare Health',
    contact_email: 'volunteer@neighborcare.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    category: 'health'
  },
  {
    id: '27',
    title: 'Eastside Warming Shelter Night Shift',
    description: 'Support overnight guests at the Eastside winter warming shelter. Volunteers help with check-in, distribute blankets and supplies, and provide a welcoming, safe environment.',
    location: 'Eastside Interfaith Social Concerns, 625 5th Ave, Kirkland, WA',
    latitude: 47.6823,
    longitude: -122.2089,
    date: '2026-07-17',
    time: '6:00 PM - 9:00 PM',
    hours_estimate: '3 hours',
    organizer: 'Eastside Interfaith Social Concerns',
    contact_email: 'volunteer@eisc.net',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800',
    category: 'community'
  },
  {
    id: '28',
    title: 'Redmond Wetland Bird Count',
    description: 'Assist ornithologists and park rangers with the annual Redmond wetland bird survey. Learn to identify local species, record sightings, and contribute to long-term wildlife data.',
    location: 'Redmond Watershed Preserve, 15810 NE Novelty Hill Rd, Redmond, WA',
    latitude: 47.7038,
    longitude: -122.0617,
    date: '2026-07-22',
    time: '7:00 AM - 10:00 AM',
    hours_estimate: '3 hours',
    organizer: 'Washington Ornithological Society',
    contact_email: 'volunteer@wos.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
    category: 'environment'
  },
  {
    id: '29',
    title: 'Kirkland Cat Café Adoption Event',
    description: 'Help run a community cat adoption event. Assist potential adopters, manage cat interactions, handle paperwork, and promote the event on social media. All cats come from local rescues.',
    location: 'Kirkland Town Square, 505 Market St, Kirkland, WA',
    latitude: 47.6816,
    longitude: -122.2068,
    date: '2026-07-26',
    time: '11:00 AM - 3:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Eastside Cat Rescue',
    contact_email: 'volunteer@eastsidecatrescue.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
    category: 'animals'
  },
  {
    id: '30',
    title: 'Bellevue Youth Theatre Backstage Crew',
    description: 'Volunteer backstage at Bellevue Youth Theatre\'s summer production. Help with set design, costumes, props, and stage management. A great experience for aspiring theatre enthusiasts!',
    location: 'Bellevue Youth Theatre, 15645 SE 130th St, Renton, WA',
    latitude: 47.5105,
    longitude: -122.1560,
    date: '2026-07-30',
    time: '4:00 PM - 8:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Bellevue Youth Theatre',
    contact_email: 'volunteer@bellevueyouththeatre.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    category: 'arts'
  },
  {
    id: '31',
    title: 'Juanita NHS Spring Induction Ceremony Help',
    description: 'Help set up, coordinate, and run the NHS spring induction ceremony. Volunteer roles include decorating, greeting families, managing programs, and photography.',
    location: 'Juanita High School Auditorium, 10601 NE 132nd St, Kirkland, WA',
    latitude: 47.7213,
    longitude: -122.2058,
    date: '2026-05-15',
    time: '4:00 PM - 8:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Juanita NHS Chapter',
    contact_email: 'nhs@lwsd.org',
    is_chapter_sponsored: true,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    category: 'community'
  },
  {
    id: '32',
    title: 'Downtown Bellevue Mural Restoration',
    description: 'Help restore a historic public mural in downtown Bellevue. Learn from professional muralists as you clean, repaint, and preserve this beloved community artwork.',
    location: 'Bellevue Arts District, 410 NE 1st St, Bellevue, WA',
    latitude: 47.6128,
    longitude: -122.2003,
    date: '2026-08-02',
    time: '10:00 AM - 2:00 PM',
    hours_estimate: '4 hours',
    organizer: 'Bellevue Arts Museum Community Program',
    contact_email: 'volunteer@bellevuearts.org',
    is_chapter_sponsored: false,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1591462684468-7736e8b2491e?w=800',
    category: 'arts'
  },
  {
    id: '33',
    title: 'North Kirkland Community Center Youth Sports',
    description: 'Coach or assist youth sports programs (basketball, soccer, volleyball) at the North Kirkland Community Center. Help kids ages 7–14 build skills, teamwork, and confidence.',
    location: 'North Kirkland Community Center, 12421 103rd Ave NE, Kirkland, WA',
    latitude: 47.7104,
    longitude: -122.1917,
    date: '2026-06-30',
    time: '10:00 AM - 12:30 PM',
    hours_estimate: '2.5 hours',
    organizer: 'City of Kirkland Recreation',
    contact_email: 'recreation@kirklandwa.gov',
    is_chapter_sponsored: true,
    impact_level: 'Medium',
    image: 'https://images.unsplash.com/photo-1546519638405-a2d62c9e8571?w=800',
    category: 'community'
  },
  {
    id: '34',
    title: 'Redmond Senior Center Wellness Check',
    description: 'Make friendly phone calls and brief home visits to elderly residents in Redmond who may be isolated. Provide companionship, check on their wellbeing, and connect them with resources.',
    location: 'Redmond Senior Center, 8703 160th Ave NE, Redmond, WA',
    latitude: 47.6738,
    longitude: -122.1150,
    date: '2026-07-16',
    time: '10:00 AM - 1:00 PM',
    hours_estimate: '3 hours',
    organizer: 'Redmond Senior Center',
    contact_email: 'senior@redmondwa.gov',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1454923634634-bd1614719a7b?w=800',
    category: 'community'
  },
  {
    id: '35',
    title: 'UW Medical Center Health Fair',
    description: 'Assist at the University of Washington Medical Center community health fair. Help set up booths, direct participants, distribute health materials, and assist with screenings.',
    location: 'UW Medical Center, 1959 NE Pacific St, Seattle, WA',
    latitude: 47.6494,
    longitude: -122.3066,
    date: '2026-07-24',
    time: '8:00 AM - 1:00 PM',
    hours_estimate: '5 hours',
    organizer: 'UW Medicine Community Outreach',
    contact_email: 'volunteer@uwmedicine.org',
    is_chapter_sponsored: false,
    impact_level: 'High',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
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
      health: '#dc2626',
      animals: '#d97706',
      housing: '#7c3aed',
      community: '#0891b2',
      arts: '#db2777',
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
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`} />
              <span className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filters:</span>
            </div>
            
            {categories.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterCategory(filterCategory === id ? null : id)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                  filterCategory === id
                    ? 'border-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
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
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
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
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ★ Chapter Sponsored
            </button>
            <button
              onClick={() => setFilterSponsored(filterSponsored === false ? null : false)}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterSponsored === false
                  ? 'bg-gray-700 border-gray-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
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
                  ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
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
      <div className={`px-4 sm:px-6 lg:px-8 py-6 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {filteredOpportunities.length} opportunities {sortByDate ? '(sorted by date)' : ''}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Map */}
            <div className={`relative rounded-2xl overflow-hidden border ${
              darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
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

              {!mapInteractive && !loading && (
                <div
                  className="absolute inset-0 z-[400] flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                  onClick={() => setMapInteractive(true)}
                >
                  <div className={`px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-sm pointer-events-none ${
                    darkMode ? 'bg-gray-900/90 text-white border border-gray-700' : 'bg-white/90 text-gray-800 border border-gray-200'
                  }`}>
                    Click to interact with map
                  </div>
                </div>
              )}

              <div className={`absolute bottom-4 left-4 p-3 rounded-xl shadow-lg z-[500] ${
                darkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
              } backdrop-blur-sm`}>
                <h4 className={`font-bold text-xs mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Categories</h4>
                <div className="space-y-1.5 text-xs">
                  {categories.map(({ id, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(id) }} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: List */}
            <div className={`h-[55vw] min-h-[280px] sm:h-[480px] lg:h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-4`}>
              {filteredOpportunities.map(opp => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    darkMode ? 'bg-gray-800/60 border-gray-700 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'
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
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {new Date(opp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {opp.time}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {opp.hours_estimate}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
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
                      <span className="px-3 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm bg-blue-900/80 text-white">
                        ★ Chapter Sponsored
                      </span>
                    )}
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