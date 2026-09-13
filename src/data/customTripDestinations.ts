import { CountryDestinationInfo, DestinationPhoto } from '../types';

export type { CountryDestinationInfo, DestinationPhoto };

export const WORLD_DESTINATIONS: CountryDestinationInfo[] = [
  // Americas & Caribbean
  {
    id: 'panama',
    name: 'Panama',
    country: 'Panama',
    region: 'Americas',
    flag: '🇵🇦',
    capitalOrMainCity: 'Panama City',
    tagline: 'Where Modern Skyline Meets Caribbean Islands & Rainforests',
    popularCities: ['Panama City', 'Casco Viejo', 'San Blas Islands', 'Bocas del Toro', 'Gamboa'],
    bestMonths: ['January', 'February', 'March', 'April', 'July', 'August', 'December'],
    recommendedDuration: '5 - 7 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Iconic Panama City Skyline & Coastal Cinta Costera',
        landmark: 'Panama City Skyline',
      },
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Historic Colonial Casco Viejo with Vibrant Nightlife & Rooftops',
        landmark: 'Casco Antiguo Rooftops',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pristine San Blas Indigenous Archipelago & Turquoise Waters',
        landmark: 'San Blas Islands',
      },
      {
        url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
        caption: 'Panama Canal Miraflores Locks Engineering Wonder',
        landmark: 'Panama Canal',
      },
    ],
    highlights: ['Duty-Free Shopping at Multiplaza', 'Casco Viejo Rooftop Dining', 'Embera Indigenous Village Tour', 'Bocas del Toro Water Villas', 'Panama Canal Transit'],
    vibes: ['City & Nightlife', 'Island Hopping', 'Culture & History', 'Shopping'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'colombia',
    name: 'Colombia',
    country: 'Colombia',
    region: 'Americas',
    flag: '🇨🇴',
    capitalOrMainCity: 'Medellin & Cartagena',
    tagline: 'The Land of Eternal Spring, Caribbean Rhythms & Coffee',
    popularCities: ['Medellin', 'Cartagena', 'Guatape', 'Bogota', 'Santa Marta'],
    bestMonths: ['January', 'February', 'May', 'June', 'July', 'August', 'December'],
    recommendedDuration: '6 - 9 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Medellin Valley of Eternal Spring from Cable Metro',
        landmark: 'Medellin Cableway & Comuna 13',
      },
      {
        url: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Gigantic Piedra del Penol & Emerald Lakes in Guatape',
        landmark: 'Guatape Rock & Colorful Pueblo',
      },
      {
        url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Colonial Cartagena Walled City & Vibrant Bougainvillea',
        landmark: 'Cartagena Historic Walled City',
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Coffee Triangle Hacienda & Lush Mountain Views',
        landmark: 'Eje Cafetero Coffee Plantation',
      },
    ],
    highlights: ['Comuna 13 Graffiti Tour', 'Guatape Rock Climb & Boat Cruise', 'Rosario Islands Beach Club', 'Salsa Clubs in El Poblado', 'Coffee Hacienda Tasting'],
    vibes: ['Vibrant Culture', 'Nightlife & Salsa', 'Scenic Mountains', 'Foodie & Coffee'],
    typicalBudgetTier: 'Affordable',
  },
  {
    id: 'costa-rica',
    name: 'Costa Rica',
    country: 'Costa Rica',
    region: 'Americas',
    flag: '🇨🇷',
    capitalOrMainCity: 'San Jose & Arenal',
    tagline: 'Pura Vida Eco-Paradise, Thermal Springs & Canopy Adventures',
    popularCities: ['La Fortuna (Arenal)', 'Manuel Antonio', 'Tamarindo', 'Monteverde'],
    bestMonths: ['January', 'February', 'March', 'April', 'July', 'November', 'December'],
    recommendedDuration: '6 - 8 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
        caption: 'Majestic Arenal Volcano & Rainforest Canopy',
        landmark: 'Arenal Volcano & Hanging Bridges',
      },
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        caption: 'Manuel Antonio National Park Where Jungle Meets Ocean',
        landmark: 'Manuel Antonio Beach',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Natural Thermal Hot Springs Resort Relaxing in Nature',
        landmark: 'Tabacon Hot Springs',
      },
    ],
    highlights: ['Volcanic Hot Springs', 'Ziplining over Cloud Forests', 'Sloth & Toucan Safari', 'Pacific Sunset Catamaran', 'White Water Rafting'],
    vibes: ['Nature & Wildlife', 'Adventure', 'Wellness & Spa', 'Eco-Luxury'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'mexico',
    name: 'Mexico',
    country: 'Mexico',
    region: 'Americas',
    flag: '🇲🇽',
    capitalOrMainCity: 'Cancun & Riviera Maya',
    tagline: 'Ancient Mayan Wonders, Turquoise Cenotes & All-Inclusive Luxury',
    popularCities: ['Cancun', 'Playa del Carmen', 'Tulum', 'Mexico City', 'Cabo San Lucas'],
    bestMonths: ['All Year', 'November', 'December', 'January', 'February', 'March', 'April'],
    recommendedDuration: '5 - 8 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tulum Ancient Mayan Ruins Overlooking Turquoise Caribbean Sea',
        landmark: 'Tulum Cliffside Ruins',
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sacred Cenote Ik Kil Natural Freshwater Cavern Swimming',
        landmark: 'Cenote Ik Kil & Chichen Itza',
      },
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cancun Hotel Zone Pristine White Sand & Luxury Resorts',
        landmark: 'Cancun Resort Strip',
      },
    ],
    highlights: ['Chichen Itza Wonder of the World', 'Swimming in Sacred Cenotes', 'Coco Bongo Nightclub Show', 'Xcaret Eco-Archaeological Park', 'Tulum Beach Clubs'],
    vibes: ['All-Inclusive Resorts', 'Beaches & Cenotes', 'World Wonders', 'Nightlife'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'dominican-republic',
    name: 'Dominican Republic',
    country: 'Dominican Republic',
    region: 'Caribbean',
    flag: '🇩🇴',
    capitalOrMainCity: 'Punta Cana & Santo Domingo',
    tagline: 'Coconut Palms, Endless Beaches & Caribbean Hospitality',
    popularCities: ['Punta Cana', 'Santo Domingo', 'La Romana', 'Samana'],
    bestMonths: ['December', 'January', 'February', 'March', 'April', 'July', 'August'],
    recommendedDuration: '4 - 7 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bavaro Beach Punta Cana Palm Trees & Azure Waters',
        landmark: 'Punta Cana Bavaro Coast',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Isla Saona Tropical Sandbar & Starfish Sanctuary',
        landmark: 'Saona Island Catamaran',
      },
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Zona Colonial Historical Architecture & Bachata Cafes',
        landmark: 'Santo Domingo Colonial Zone',
      },
    ],
    highlights: ['All-Inclusive 5-Star Resorts', 'Saona Island Speedboat & Catamaran', 'ATV Dune Buggy Adventure', 'Scape Park Cenote Hoyo Azul', 'Rum & Cigar Factory Tour'],
    vibes: ['Relaxation', 'All-Inclusive', 'Watersports', 'Family & Friends'],
    typicalBudgetTier: 'Affordable',
  },
  {
    id: 'jamaica',
    name: 'Jamaica',
    country: 'Jamaica',
    region: 'Caribbean',
    flag: '🇯🇲',
    capitalOrMainCity: 'Kingston, Montego Bay & Negril',
    tagline: 'The Home of Reggae, Blue Mountain Coffee & World-Class Coastlines',
    popularCities: ['Montego Bay', 'Negril', 'Ocho Rios', 'Port Antonio', 'Kingston'],
    bestMonths: ['All Year Round'],
    recommendedDuration: '4 - 7 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Negril Seven Mile Beach Crystal Waters & Golden Sunset',
        landmark: 'Seven Mile Beach & Ricks Cafe',
      },
      {
        url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
        caption: 'Dunns River Falls Terraced Cascades in Ocho Rios',
        landmark: "Dunn's River Falls",
      },
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Misty Blue Mountains Coffee Country & Kingston Vibe',
        landmark: 'Blue Mountains & Bob Marley Museum',
      },
    ],
    highlights: ["Ricks Cafe Cliff Diving", "Dunn's River Falls Climbing", "Bamboo Rafting Martha Brae", "Blue Lagoon & Frenchmans Cove", "Scotchies Jerk Experience"],
    vibes: ['Reggae & Culture', 'Tropical Beaches', 'Food & Jerk', 'Staycation Luxury'],
    typicalBudgetTier: 'Affordable',
  },
  {
    id: 'barbados',
    name: 'Barbados',
    country: 'Barbados',
    region: 'Caribbean',
    flag: '🇧🇧',
    capitalOrMainCity: 'Bridgetown & St. James',
    tagline: 'Platinum Coast Elegance, Flying Fish & Sea Turtle Snorkeling',
    popularCities: ['Bridgetown', 'Holetown', 'Oistins', 'St. Lawrence Gap'],
    bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
    recommendedDuration: '5 - 7 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Carlisle Bay Calm Marine Waters & Historic Shipwrecks',
        landmark: 'Carlisle Bay & Turtle Haven',
      },
      {
        url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bathsheba Rugged Atlantic Coast & Soup Bowl Surfing',
        landmark: 'Bathsheba Coastline',
      },
    ],
    highlights: ['Swimming with Wild Sea Turtles', 'Oistins Friday Night Fish Fry', 'Mount Gay Rum Heritage Tour', 'Harrison Cave Tram Safari', 'Catamaran Sunset Cruise'],
    vibes: ['Luxury Beach', 'Culinary & Rum', 'Snorkeling', 'Island Vibes'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'saint-lucia',
    name: 'Saint Lucia',
    country: 'Saint Lucia',
    region: 'Caribbean',
    flag: '🇱🇨',
    capitalOrMainCity: 'Castries & Soufriere',
    tagline: 'Iconic Twin Pitons, Sulphur Springs Mud Baths & Romance',
    popularCities: ['Soufriere', 'Rodney Bay', 'Marigot Bay', 'Cap Estate'],
    bestMonths: ['December', 'January', 'February', 'March', 'April', 'May'],
    recommendedDuration: '5 - 7 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Gros Piton & Petit Piton Rising Dramatically from the Sea',
        landmark: 'Twin Pitons World Heritage Site',
      },
      {
        url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
        caption: 'Soufriere Drive-In Volcano & Volcanic Mud Baths',
        landmark: 'Sulphur Springs Mud Baths',
      },
    ],
    highlights: ['Drive-in Volcano & Mud Baths', 'Catamaran Sail past the Pitons', 'Diamond Botanical Gardens & Waterfall', 'Sugar Beach Snorkeling', 'Chocolatier Tree-to-Bar Tour'],
    vibes: ['Romantic Honeymoon', 'Lush Nature', 'Luxury Resorts', 'Volcanic Wonders'],
    typicalBudgetTier: 'Luxury',
  },

  // Europe
  {
    id: 'france',
    name: 'France',
    country: 'France',
    region: 'Europe',
    flag: '🇫🇷',
    capitalOrMainCity: 'Paris & French Riviera',
    tagline: 'City of Light, Haute Couture, Michelin Gastronomy & Côte d’Azur',
    popularCities: ['Paris', 'Nice', 'Cannes', 'Monaco', 'Lyon', 'Bordeaux'],
    bestMonths: ['April', 'May', 'June', 'September', 'October', 'December'],
    recommendedDuration: '7 - 12 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        caption: 'Eiffel Tower Illuminated over the River Seine in Paris',
        landmark: 'Eiffel Tower & Trocadero',
      },
      {
        url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Louvre Museum Glass Pyramid by Twilight',
        landmark: 'Louvre Museum & Tuileries',
      },
      {
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        caption: 'Promenade des Anglais & Azure Mediterranean Sea in Nice',
        landmark: 'French Riviera & Nice',
      },
    ],
    highlights: ['Seine River Champagne Cruise', 'Palace of Versailles Private Tour', 'Boutique Shopping on Champs-Élysées', 'French Riviera Yacht Day', 'Wine & Cheese Tasting in Montmartre'],
    vibes: ['Romance & Art', 'High Fashion & Luxury', 'World-Class Cuisine', 'Historic Architecture'],
    typicalBudgetTier: 'Luxury',
  },
  {
    id: 'italy',
    name: 'Italy',
    country: 'Italy',
    region: 'Europe',
    flag: '🇮🇹',
    capitalOrMainCity: 'Rome, Venice & Amalfi Coast',
    tagline: 'La Dolce Vita, Renaissance Marvels, Cliffside Towns & Tuscan Wine',
    popularCities: ['Rome', 'Florence', 'Venice', 'Amalfi Coast (Positano)', 'Milan'],
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    recommendedDuration: '8 - 14 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ancient Roman Colosseum Glowing under Golden Sunset',
        landmark: 'Colosseum & Roman Forum',
      },
      {
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cliffside Pastel Villas in Positano on the Amalfi Coast',
        landmark: 'Amalfi Coast (Positano)',
      },
      {
        url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
        caption: 'Venetian Gondolas Cruising through Historic Canals',
        landmark: 'Venice Grand Canal & Gondolas',
      },
    ],
    highlights: ['Vatican Museums & Sistine Chapel', 'Venetian Gondola Serenade', 'Positano Private Speedboat Cruise', 'Tuscan Vineyard & Pasta Class', 'Trevi Fountain by Moonlight'],
    vibes: ['La Dolce Vita', 'Ancient History', 'Romantic Coastal Views', 'Gourmet Pasta & Wine'],
    typicalBudgetTier: 'Luxury',
  },
  {
    id: 'spain',
    name: 'Spain',
    country: 'Spain',
    region: 'Europe',
    flag: '🇪🇸',
    capitalOrMainCity: 'Barcelona & Madrid',
    tagline: 'Gaudi Architecture, Tapas Culture, Flamenco & Mediterranean Sun',
    popularCities: ['Barcelona', 'Madrid', 'Ibiza', 'Seville', 'Valencia'],
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
        caption: 'La Sagrada Familia Iconic Basílica in Barcelona',
        landmark: 'Sagrada Família',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ibiza Crystal Mediterranean Beaches & Sunset Lounges',
        landmark: 'Ibiza Coastal Vibe',
      },
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Plaza de Espana Renaissance Splendor in Seville',
        landmark: 'Plaza de España Seville',
      },
    ],
    highlights: ['Park Güell & Sagrada Familia Tour', 'Authentic Flamenco Show in Seville', 'Tapas Crawl in Madrid Historic Quarter', 'Ibiza Beach Club Day & Sunset', 'Camp Nou Stadium Visit'],
    vibes: ['Art & Gaudi', 'Vibrant Nightlife', 'Tapas & Sangria', 'Sun & Beaches'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'greece',
    name: 'Greece',
    country: 'Greece',
    region: 'Europe',
    flag: '🇬🇷',
    capitalOrMainCity: 'Athens & Santorini',
    tagline: 'Whitewashed Aegean Clifftops, Cobalt Domes & Mythological Roots',
    popularCities: ['Santorini', 'Mykonos', 'Athens', 'Crete', 'Rhodes'],
    bestMonths: ['May', 'June', 'July', 'August', 'September', 'October'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
        caption: 'Oia Blue Domes Overlooking Santorini Volcanic Caldera',
        landmark: 'Santorini Blue Domes & Oia',
      },
      {
        url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Acropolis and Parthenon Standing Proud in Athens',
        landmark: 'Acropolis of Athens',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Mykonos Windmills & Little Venice Seaside Waterfront',
        landmark: 'Mykonos Windmills & Little Venice',
      },
    ],
    highlights: ['Oia Sunset Catamaran Cruise with BBQ', 'Acropolis & Ancient Agora Tour', 'Mykonos Beach Clubs (Scorpios / Nammos)', 'Greek Wine & Olive Oil Tasting', 'Red Beach & Perissa Black Sand Beach'],
    vibes: ['Caldera Sunsets', 'Ancient Mythology', 'Beach Clubs & VIP', 'Aegean Seafood'],
    typicalBudgetTier: 'Luxury',
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    capitalOrMainCity: 'London & Edinburgh',
    tagline: 'Royal Palaces, West End Shows, Historic Pubs & Highlands',
    popularCities: ['London', 'Edinburgh', 'Manchester', 'Bath', 'Oxford'],
    bestMonths: ['May', 'June', 'July', 'August', 'September', 'December (Holiday Lights)'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
        caption: 'Big Ben & Houses of Parliament beside the Thames',
        landmark: 'Big Ben & London Eye',
      },
      {
        url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tower Bridge Illuminated over the River Thames',
        landmark: 'Tower Bridge',
      },
    ],
    highlights: ['Buckingham Palace & Changing of the Guard', 'West End Musical Theatre', 'High Tea at The Ritz / Harrods Shopping', 'Day Trip to Stonehenge & Windsor Castle', 'Edinburgh Castle Tour'],
    vibes: ['Royal Heritage', 'Cosmopolitan City', 'Theatre & Culture', 'Shopping & Dining'],
    typicalBudgetTier: 'Moderate',
  },

  // Asia & Middle East
  {
    id: 'japan',
    name: 'Japan',
    country: 'Japan',
    region: 'Asia & Middle East',
    flag: '🇯🇵',
    capitalOrMainCity: 'Tokyo, Kyoto & Osaka',
    tagline: 'Futuristic Metropolises, Shinto Shrines, Cherry Blossoms & Sushi',
    popularCities: ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji', 'Nara', 'Hiroshima'],
    bestMonths: ['March', 'April (Cherry Blossoms)', 'May', 'October', 'November (Autumn Colors)'],
    recommendedDuration: '9 - 14 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        caption: 'Mount Fuji Framed by Chureito Pagoda and Spring Blossoms',
        landmark: 'Mount Fuji & Chureito Pagoda',
      },
      {
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
        caption: 'Neon-lit Shibuya Crossing Buzzing in Central Tokyo',
        landmark: 'Shibuya Crossing Tokyo',
      },
      {
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Thousands of Vermilion Torii Gates at Fushimi Inari in Kyoto',
        landmark: 'Fushimi Inari Taisha Kyoto',
      },
    ],
    highlights: ['Bullet Train (Shinkansen) Experience', 'Fushimi Inari 10,000 Torii Gates Walk', 'Tsukiji Outer Market Sushi Tour', 'TeamLab Borderless Digital Art Museum', 'Day Trip to Mount Fuji & Onsen Hot Springs'],
    vibes: ['Futuristic & Neon', 'Ancient Temples', 'Foodie & Ramen', 'Ultra Clean & Safe'],
    typicalBudgetTier: 'Luxury',
  },
  {
    id: 'united-arab-emirates',
    name: 'Dubai & UAE',
    country: 'United Arab Emirates',
    region: 'Asia & Middle East',
    flag: '🇦🇪',
    capitalOrMainCity: 'Dubai & Abu Dhabi',
    tagline: 'Record-Breaking Architecture, Desert Safaris & Unmatched Luxury',
    popularCities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
    recommendedDuration: '6 - 9 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Burj Khalifa World Tallest Tower & Downtown Dubai Fountains',
        landmark: 'Burj Khalifa & Dubai Mall',
      },
      {
        url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
        caption: 'Luxury 4x4 Dune Bashing & Sunset in the Arabian Desert',
        landmark: 'Arabian Desert Safari',
      },
      {
        url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sheikh Zayed Grand Mosque Architectural Masterpiece in Abu Dhabi',
        landmark: 'Sheikh Zayed Grand Mosque',
      },
    ],
    highlights: ['Burj Khalifa At The Top Observation Deck', 'Desert Safari with BBQ & Camel Ride', 'Dubai Marina Luxury Yacht Cruise', 'Abu Dhabi Grand Mosque & Louvre Day Trip', 'Gold & Spice Souk Shopping Experience'],
    vibes: ['Ultra-Luxury & Glamour', 'Desert Adventures', 'Supercars & Yachts', 'World Records'],
    typicalBudgetTier: 'Luxury',
  },
  {
    id: 'indonesia',
    name: 'Bali (Indonesia)',
    country: 'Indonesia',
    region: 'Asia & Middle East',
    flag: '🇮🇩',
    capitalOrMainCity: 'Bali (Denpasar, Ubud, Seminyak)',
    tagline: 'Island of the Gods, Emerald Rice Terraces & Sunset Beach Clubs',
    popularCities: ['Ubud', 'Seminyak', 'Canggu', 'Uluwatu', 'Nusa Penida'],
    bestMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
    recommendedDuration: '8 - 14 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tegalalang Rice Terraces & Jungle Swings in Ubud',
        landmark: 'Tegalalang Rice Terrace',
      },
      {
        url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
        caption: 'Uluwatu Clifftop Temple Facing Crashing Indian Ocean Waves',
        landmark: 'Uluwatu Sea Temple',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kelingking T-Rex Beach Lookout on Nusa Penida Island',
        landmark: 'Nusa Penida Kelingking Beach',
      },
    ],
    highlights: ['Private Pool Jungle Villa Experience', 'Uluwatu Cliff Sunset & Kecak Fire Dance', 'Nusa Penida Day Trip & Snorkeling with Manta Rays', 'Floating Breakfast & Traditional Balinese Spa', 'Finns & Potato Head Beach Clubs'],
    vibes: ['Tropical Spiritual Retreat', 'Private Luxury Villas', 'Beach Clubs & Nightlife', 'Surfing & Nature'],
    typicalBudgetTier: 'Affordable',
  },
  {
    id: 'thailand',
    name: 'Thailand',
    country: 'Thailand',
    region: 'Asia & Middle East',
    flag: '🇹🇭',
    capitalOrMainCity: 'Bangkok, Phuket & Chiang Mai',
    tagline: 'Land of Smiles, Gilded Temples, Floating Markets & Andaman Islands',
    popularCities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Phi Phi Islands', 'Koh Samui'],
    bestMonths: ['November', 'December', 'January', 'February', 'March', 'April'],
    recommendedDuration: '8 - 14 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
        caption: 'Wat Arun Temple of Dawn Rising over Chao Phraya River',
        landmark: 'Wat Arun Bangkok',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Maya Bay Limestone Cliffs & Emerald Waters in Phi Phi',
        landmark: 'Phi Phi Islands & Maya Bay',
      },
    ],
    highlights: ['Speedboat Island Hopping to Phi Phi & James Bond Island', 'Ethical Elephant Sanctuary in Chiang Mai', 'Bangkok Floating & Railway Markets', 'Thai Cooking Class & Night Food Bazaars', 'Rooftop Cocktail Bars overlooking Bangkok'],
    vibes: ['Islands & Boats', 'Temples & Culture', 'Street Food & Night Markets', 'Affordable Luxury'],
    typicalBudgetTier: 'Affordable',
  },

  // Africa
  {
    id: 'south-africa',
    name: 'South Africa',
    country: 'South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    capitalOrMainCity: 'Cape Town & Johannesburg',
    tagline: 'Table Mountain, Big Five Safaris, Winelands & Coastal Penguins',
    popularCities: ['Cape Town', 'Kruger National Park', 'Johannesburg', 'Stellenbosch'],
    bestMonths: ['November', 'December', 'January', 'February', 'March', 'April'],
    recommendedDuration: '8 - 14 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Table Mountain Standing Over Cape Town Waterfront',
        landmark: 'Table Mountain & Waterfront',
      },
      {
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
        caption: 'Big Five Lion on Open Game Drive in Kruger Safari',
        landmark: 'Kruger National Park Big 5',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Boulders Beach African Penguin Colony on White Sands',
        landmark: 'Boulders Beach Penguin Colony',
      },
    ],
    highlights: ['Cable Car to the Summit of Table Mountain', 'Big Five Safari Lodge Game Drives', 'Boulders Beach Penguins & Cape Point', 'Franschhoek Wine Tram Tour', 'Robben Island & Nelson Mandela History'],
    vibes: ['Wildlife Safari', 'Scenic Landscapes', 'Vineyards & Dining', 'Adventure'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'egypt',
    name: 'Egypt',
    country: 'Egypt',
    region: 'Africa',
    flag: '🇪🇬',
    capitalOrMainCity: 'Cairo, Luxor & Aswan',
    tagline: 'Timeless Pyramids, Golden Pharaohs & Cruising the Sacred Nile',
    popularCities: ['Cairo', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh'],
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March', 'April'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
        caption: 'The Great Pyramids of Giza & Sphinx under Golden Skies',
        landmark: 'Great Pyramids & Sphinx',
      },
      {
        url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
        caption: 'Valley of the Kings & Karnak Temple Columns in Luxor',
        landmark: 'Karnak & Luxor Temples',
      },
    ],
    highlights: ['Private Guided Tour of Great Pyramids & Camel Ride', 'Grand Egyptian Museum Artifacts', '5-Star Luxury Nile River Cruise', 'Valley of the Kings Royal Tombs', 'Sunrise Hot Air Balloon over Luxor'],
    vibes: ['Ancient Civilization', 'Nile Cruise', 'Archaeology', 'Exotic Desert'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'morocco',
    name: 'Morocco',
    country: 'Morocco',
    region: 'Africa',
    flag: '🇲🇦',
    capitalOrMainCity: 'Marrakech & Casablanca',
    tagline: 'Vibrant Souks, Sahara Glamping, Intricate Riads & Atlas Mountains',
    popularCities: ['Marrakech', 'Casablanca', 'Chefchaouen (Blue City)', 'Fes', 'Merzouga (Sahara)'],
    bestMonths: ['March', 'April', 'May', 'September', 'October', 'November'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        caption: 'Jemaa el-Fnaa Vibrant Square & Koutoubia Mosque in Marrakech',
        landmark: 'Marrakech Medina & Souks',
      },
      {
        url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sahara Desert Golden Sand Dunes & Luxury Berber Camps',
        landmark: 'Sahara Desert Dunes',
      },
    ],
    highlights: ['Private Riad Stay with Plunge Pool', 'Sahara Luxury Desert Glamping & Stargazing', 'Marrakech Souk Spice & Leather Shopping', 'Jardin Majorelle & Yves Saint Laurent Museum', 'Day Trip to Atlas Mountains & Berber Villages'],
    vibes: ['Exotic Souks & Riads', 'Desert Glamping', 'Vibrant Color & Tilework', 'Culinary & Tea'],
    typicalBudgetTier: 'Moderate',
  },
  {
    id: 'ghana',
    name: 'Ghana',
    country: 'Ghana',
    region: 'Africa',
    flag: '🇬🇭',
    capitalOrMainCity: 'Accra & Cape Coast',
    tagline: 'Year of Return, Afrochella Vibe, Historic Castles & Warm Hospitality',
    popularCities: ['Accra', 'Cape Coast', 'Elmina', 'Kumasi', 'Ada Foah'],
    bestMonths: ['August', 'October', 'November', 'December (Festive Season)', 'January'],
    recommendedDuration: '7 - 10 Days',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        caption: 'Black Star Square & Independence Monument in Accra',
        landmark: 'Black Star Square Accra',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cape Coast Historic Fort & Oceanfront Palm Groves',
        landmark: 'Cape Coast & Elmina Castle',
      },
    ],
    highlights: ['December in Ghana Festive Events & Afrochella', 'Cape Coast Castle Door of No Return Pilgrimage', 'Kakum National Park Canopy Walkway', 'Labadi & Bojo Beach Lounge & Fresh Seafood', 'Makola Market Vibrant Kente & Fabric Tour'],
    vibes: ['Cultural Homecoming', 'December Festive Energy', 'Music & Afrobeat', 'Rich African History'],
    typicalBudgetTier: 'Moderate',
  },
];

// Fallback curated photo bank for ANY searched country in the world
const COUNTRY_PHOTO_MAP: Record<string, { url: string; caption: string; landmark: string }[]> = {
  brazil: [
    {
      url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
      caption: 'Christ the Redeemer Watching Over Rio de Janeiro and Sugarloaf',
      landmark: 'Christ the Redeemer & Rio Harbor',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      caption: 'Copacabana Beach Golden Sands and Atlantic Waves',
      landmark: 'Copacabana Beach',
    },
  ],
  peru: [
    {
      url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
      caption: 'Machu Picchu Incan Citadel High in the Andes Mountains',
      landmark: 'Machu Picchu Sacred Valley',
    },
  ],
  switzerland: [
    {
      url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      caption: 'Snowcapped Swiss Alps and Crystal Alpine Lakes',
      landmark: 'Swiss Alps & Matterhorn',
    },
  ],
  portugal: [
    {
      url: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=1200&q=80',
      caption: 'Historic Yellow Tram Climbing the Hills of Lisbon',
      landmark: 'Lisbon Tram & Miradouro',
    },
  ],
  netherlands: [
    {
      url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80',
      caption: 'Amsterdam Bridges & Historic Canal Houses at Twilight',
      landmark: 'Amsterdam Canals',
    },
  ],
  turkey: [
    {
      url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      caption: 'Hot Air Balloons Floating over Cappadocia Fairy Chimneys',
      landmark: 'Cappadocia Fairy Chimneys',
    },
  ],
  maldives: [
    {
      url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
      caption: 'Overwater Luxury Bungalow Over Sparkling Turquoise Lagoon',
      landmark: 'Maldives Overwater Villas',
    },
  ],
  iceland: [
    {
      url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
      caption: 'Aurora Borealis Northern Lights & Glacial Waterfalls',
      landmark: 'Seljalandsfoss & Northern Lights',
    },
  ],
  'south korea': [
    {
      url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
      caption: 'Gyeongbokgung Palace in Seoul with Modern Skyline Behind',
      landmark: 'Gyeongbokgung Palace Seoul',
    },
  ],
};

/**
 * Returns dynamic, high quality photos for ANY country selected by the user
 */
export function getCountryPhotos(countryQuery: string): { url: string; caption: string; landmark: string }[] {
  if (!countryQuery || !countryQuery.trim()) {
    return WORLD_DESTINATIONS[0].photos;
  }

  const query = countryQuery.trim().toLowerCase();

  // 1. Direct match in WORLD_DESTINATIONS
  const foundInCatalog = WORLD_DESTINATIONS.find(
    (d) =>
      d.id === query ||
      d.country.toLowerCase() === query ||
      d.name.toLowerCase().includes(query) ||
      d.popularCities.some((c) => c.toLowerCase().includes(query))
  );
  if (foundInCatalog && foundInCatalog.photos.length > 0) {
    return foundInCatalog.photos;
  }

  // 2. Direct match in country photo map
  for (const [key, photos] of Object.entries(COUNTRY_PHOTO_MAP)) {
    if (query.includes(key) || key.includes(query)) {
      return photos;
    }
  }

  // 3. Fallback to rich universal wanderlust pictures with specific country caption
  const capitalizedCountry = countryQuery
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return [
    {
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      caption: `Scenic Landscapes and Unique Cultural Sights in ${capitalizedCountry}`,
      landmark: `${capitalizedCountry} Panorama`,
    },
    {
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      caption: `Unforgettable Travel Highlights & Local Experiences in ${capitalizedCountry}`,
      landmark: `${capitalizedCountry} Highlights`,
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      caption: `Relaxation, Architecture & Memorable Moments across ${capitalizedCountry}`,
      landmark: `${capitalizedCountry} Journey`,
    },
  ];
}
