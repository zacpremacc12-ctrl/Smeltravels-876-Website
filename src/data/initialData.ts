import {
  TripPackage,
  Destination,
  BlogPost,
  OfferItem,
  TestimonialItem,
  FAQItem,
  SiteSettings,
  MediaItem,
  CustomerRecord,
  BookingSubmission,
  AdminInboxItem
} from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'SMELTRAVELS876',
  tagline: 'Travel More. Worry Less.',
  primaryPhone: '(876) 834-1537',
  primaryEmail: 'smeltravels876@gmail.com',
  ambassadorName: 'Zachary Buchanan',
  ambassadorTitle: 'Travel Ambassador',
  ambassadorPhone: '(876) 848-9772',
  ambassadorEmail: 'zbuchanan.smeltravels@gmail.com',
  ambassadors: [
    {
      id: 'amb-1',
      name: 'Zachary Buchanan',
      title: 'Travel Ambassador',
      phone: '(876) 848-9772',
      email: 'zbuchanan.smeltravels@gmail.com',
      code: 'ZAC876',
      isActive: true,
      parishOrRegion: 'Kingston & St. Andrew',
    },
    {
      id: 'amb-2',
      name: 'Jada Virgo',
      title: 'Travel Ambassador',
      phone: '(876) 566-6923',
      email: 'jvirgo.smeltravels@gmail.com',
      code: 'JADA876',
      isActive: true,
      parishOrRegion: 'Montego Bay & Western Jamaica',
    },
    {
      id: 'amb-3',
      name: 'Shenoya Davis',
      title: 'Travel Ambassador',
      phone: '(876) 276-1310',
      email: 'sdavis.smeltravels@gmail.com',
      code: 'SHENOYA876',
      isActive: true,
      parishOrRegion: 'St. Catherine & Portmore',
    },
    {
      id: 'amb-4',
      name: 'Elvoy Bennett',
      title: 'CEO',
      phone: '(876) 834-1537',
      email: 'smeltravels876@gmail.com',
      code: 'ELVOY876',
      isActive: true,
      parishOrRegion: 'Executive Operations & Corporate Travel',
    },
  ],
  requireAmbassadorSelection: true,
  ambassadorDiscountPercentage: 10,
  whatsappNumber: '18768341537',
  whatsappMessageTemplate: 'Hi SMELTRAVELS876! I am interested in exploring upcoming group trips and travel packages.',
  addressSummary: 'Kingston, Jamaica • Serving Caribbean & International Travelers',
  operatingBase: 'Kingston, Jamaica',
  businessHours: 'Monday - Saturday: 8:30 AM - 6:30 PM EST',
  companyBanking: {
    bankName: 'National Commercial Bank (NCB) Jamaica',
    accountName: 'SMELTRAVELS876 LIMITED',
    accountNumber: '354-928-1029',
    accountType: 'Chequing Account',
    branch: 'Half-Way-Tree Branch, Kingston',
    swiftOrRoutingCode: 'JNCBJMKX',
    lynkHandle: '@smeltravels876',
    lynkPhone: '(876) 848-9772',
    officeDepositAddress: '12 Trafalgar Road, Suite 4B, Kingston 10, Jamaica',
    cardGatewayProvider: 'WiPay Caribbean / NCB eCommerce',
    cardGatewayMerchantId: 'MERCHANT-876-SMEL',
    paymentInstructions: 'Deposits directly credit the official SMELTRAVELS876 corporate operational account. Upload your transfer receipt or WhatsApp confirmation for real-time verification.',
  },
  brandColors: {
    primaryPurple: '#3B185F', // Deep royal purple
    accentGold: '#FFC72C',   // Radiant golden yellow
    darkCharcoal: '#1A1824',
  },
  announcementBanner: {
    enabled: true,
    text: '✈️ 2026 & 2027 Group Trips Now Open for Deposits! Secure your spot today.',
    link: '#trips',
  },
  socialLinks: {
    instagram: 'https://instagram.com/smeltravels876',
    facebook: 'https://facebook.com/smeltravels876',
    tiktok: 'https://tiktok.com/@smeltravels876',
    whatsapp: 'https://wa.me/18768341537',
  },
  homepageSections: {
    hero: true,
    featuredUpcoming: true,
    featured2026: true,
    groupTrips2027: true,
    whyChoose: true,
    popularDestinations: true,
    howItWorks: true,
    offers: true,
    travelGuides: true,
    testimonials: true,
    faq: true,
    bookingCta: true,
    newsletter: true,
  },
  seo: {
    defaultTitle: 'SMELTRAVELS876 | Travel More. Worry Less. | Jamaican Group Travel Agency',
    defaultDescription: 'Discover unforgettable group travel experiences with SMELTRAVELS876. Curated international group trips from Jamaica to Panama, Antigua, Germany, Italy, Punta Cana, and Medellín.',
    canonicalDomain: 'https://smeltravels876.com',
    googleAnalyticsId: 'G-SMEL876TRV',
    metaPixelId: '',
  },
};

export const INITIAL_TRIPS: TripPackage[] = [
  {
    id: 'panama-2026',
    slug: 'panama-2026-part-2',
    name: 'Panama 2026 — Part 2',
    destination: 'Panama City & Canal',
    country: 'Panama',
    countryFlag: '🇵🇦',
    countryAcronym: 'PAN',
    year: 2026,
    dates: 'October 13–18, 2026',
    hotel: 'Premium Hotel in Panama City (Centrally Located)',
    price: 152303,
    currency: 'JMD',
    deposit: 83353,
    shortDescription: 'Experience the energy of Panama City, historic Casco Viejo, the Panama Canal marvel, and vibrant shopping culture on our flagship 2026 group trip.',
    fullDescription: 'Join SMELTRAVELS876 for our 2026 featured group journey to Panama! From the modern skyline to centuries-old Spanish colonial architecture, lush rainforest edges, world-class duty-free shopping, and the iconic Panama Canal, this trip combines group camaraderie with stress-free logistics.',
    packageInclusions: [
      'Flight from Kingston (KIN)',
      'Carry-on luggage',
      'Personal item',
      'Hotel accommodation',
      'Bed and breakfast daily',
      'Roundtrip airport transfers',
      'Two paid excursions',
      'Exclusive trip memorabilia',
      'Preparation of travel documents'
    ],
    exclusions: [
      'Checked baggage (unless requested as add-on)',
      'Meals not specified under Bed & Breakfast',
      'Personal expenses & shopping',
      'Travel insurance (highly recommended)'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Welcome in Panama',
        description: 'Itinerary Coming Soon. Complete detailed daily itinerary will be published prior to departure.',
      },
      {
        day: 2,
        title: 'Excursion 1 & Historic Discovery',
        description: 'Itinerary Coming Soon. Includes scheduled group paid excursion.',
      },
      {
        day: 3,
        title: 'Excursion 2 & Group Sightseeing',
        description: 'Itinerary Coming Soon. Includes scheduled group paid excursion.',
      },
      {
        day: 4,
        title: 'Shopping & Leisure Exploration',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 5,
        title: 'Farewell Gathering & Dinner Night',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 6,
        title: 'Airport Transfer & Departure to Kingston',
        description: 'Itinerary Coming Soon.',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity beyond travel dates)',
      'Completed Panama immigration/health declaration if required at travel time',
      'Yellow fever vaccination certificate if applicable by port health authority'
    ],
    visaRequirements: 'No tourist visa required for Jamaican passport holders for short tourist stays (subject to immigration clearance at port of entry). Travel document preparation included by SMELTRAVELS876.',
    requiresSchengenVisa: false,
    excursions: [
      'Two paid excursions included in package rate',
      'Detailed excursion lineup announced to confirmed group travelers'
    ],
    baggageInfo: 'Includes Carry-on + Personal item. Checked bag add-on available upon request.',
    paymentPlanInfo: 'Flexible payment plans available after your deposit of $83,353 JMD is made. Pay in convenient installments leading up to departure.',
    featuredImage: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: true,
    is2027Collection: false,
    isAdultsOnly: false,
    childPrice: 106612,
    childDeposit: 58347,
    occupancyNote: 'Per person rate based on double occupancy. Single supplement available upon inquiry.',
    orderIndex: 1,
    seoTitle: 'Panama 2026 Part 2 Group Trip from Kingston | SMELTRAVELS876',
    metaDescription: 'Book Panama 2026 Part 2 with SMELTRAVELS876! Flights from KIN, hotel, bed & breakfast, 2 paid excursions, airport transfers, and document prep included.'
  },
  {
    id: 'mexico-2026',
    slug: 'mexico-cancun-riviera-maya-2026',
    name: 'Mexico Cultural & Beach Escape 2026',
    destination: 'Cancún & Riviera Maya',
    country: 'Mexico',
    countryFlag: '🇲🇽',
    countryAcronym: 'MEX',
    year: 2026,
    dates: 'November 18–23, 2026',
    hotel: 'All-Inclusive Beachfront Resort in Riviera Maya',
    price: 189500,
    currency: 'JMD',
    deposit: 85000,
    shortDescription: 'Experience the magic of Mexico: Caribbean turquoise waters, ancient Mayan pyramids of Chichen Itza, cenote dips, and authentic Mexican cuisine.',
    fullDescription: 'Join SMELTRAVELS876 for an unforgettable journey to Mexico! From the vibrant beaches of the Riviera Maya to the awe-inspiring archaeological wonder of Chichen Itza and crystal-clear freshwater cenotes, this package takes care of every flight, luxury resort stay, excursion, and transfer from Kingston.',
    packageInclusions: [
      'Flight from Kingston (KIN)',
      'Carry-on luggage & personal item',
      'All-inclusive beachfront hotel accommodation',
      'All meals, snacks, and unlimited drinks',
      'Roundtrip airport transfers',
      'Two paid excursions (Chichen Itza & Cenote Tour)',
      'Exclusive trip memorabilia',
      'Preparation of travel documents'
    ],
    exclusions: [
      'Checked baggage (available as add-on)',
      'Optional premium excursions and spa services',
      'Personal purchases & souvenirs',
      'Travel insurance (highly recommended)'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Cancún & Resort Check-in',
        description: 'Depart from Kingston (KIN), arrive at Cancún International Airport (CUN), group transfer to our all-inclusive beachfront resort in Riviera Maya, and evening welcome cocktails.',
      },
      {
        day: 2,
        title: 'Mayan Wonder: Chichen Itza & Sacred Cenote Excursion',
        description: 'Full-day guided excursion to the world-famous Mayan ruins of Chichen Itza followed by a refreshing swim in a mystical freshwater underground cenote with authentic Yucatecan lunch.',
      },
      {
        day: 3,
        title: 'Catamaran Sailing & Snorkel Adventure',
        description: 'Included catamaran ocean excursion with snorkeling along the vibrant Mesoamerican Barrier Reef, music, open bar on board, and beach club access.',
      },
      {
        day: 4,
        title: 'Resort Beach Day & Mexican Fiesta Night',
        description: 'Relax poolside or on the white-sand beach, enjoy all-inclusive dining, and experience live Mexican cultural entertainment and culinary tastings.',
      },
      {
        day: 5,
        title: 'Playa del Carmen 5th Avenue Shopping & Farewell Dinner',
        description: 'Afternoon transfer for duty-free shopping, artisan crafts, and cafe culture along Playa del Carmen\'s bustling Quinta Avenida, followed by a festive group farewell celebration.',
      },
      {
        day: 6,
        title: 'Airport Transfer & Return Flight to Kingston',
        description: 'Breakfast at the resort, private group transfer to Cancún International Airport, and flight back to Kingston (KIN).',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity beyond travel dates)',
      'Mexican Tourist Card (FMM) immigration form (facilitated by SMELTRAVELS876)',
      'Valid US Visa, Canadian Visa, UK Visa, or Schengen Visa facilitates entry for Jamaican passport holders'
    ],
    visaRequirements: 'Jamaican passport holders with a valid US, Canadian, UK, or Schengen tourist visa enjoy visa-free entry into Mexico. Full travel document guidance provided by SMELTRAVELS876.',
    requiresSchengenVisa: false,
    excursions: [
      'Guided Chichen Itza Archaeological Site Excursion',
      'Sacred Underground Cenote Swim & Lunch',
      'Catamaran Ocean & Snorkel Experience'
    ],
    baggageInfo: 'Includes Carry-on + Personal item. Checked bag add-on available upon request.',
    paymentPlanInfo: 'Flexible payment plans available after your deposit of $85,000 JMD is placed. Pay convenient installments up to departure.',
    featuredImage: 'https://images.unsplash.com/photo-1512815777174-88db0fb1bd74?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512815777174-88db0fb1bd74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: true,
    is2027Collection: false,
    isAdultsOnly: false,
    childPrice: 132650,
    childDeposit: 59500,
    occupancyNote: 'Per person rate based on double occupancy. Single supplement available upon inquiry.',
    orderIndex: 0,
    seoTitle: 'Mexico 2026 Group Trip from Kingston | SMELTRAVELS876',
    metaDescription: 'Book Mexico 2026 with SMELTRAVELS876! Flights from KIN, all-inclusive resort, Chichen Itza excursion, cenote swim, airport transfers, and document prep included.'
  },
  {
    id: 'antigua-2027',
    slug: 'antigua-group-trip-2027',
    name: 'Antigua All-Inclusive Escape 2027',
    destination: 'Antigua',
    country: 'Antigua and Barbuda',
    countryFlag: '🇦🇬',
    countryAcronym: 'ATG',
    year: 2027,
    dates: 'January 24–28, 2027',
    hotel: 'Jolly Beach All Inclusive',
    price: 228070,
    currency: 'JMD',
    deposit: 95000,
    shortDescription: 'Kick off 2027 in Caribbean bliss with pristine turquoise waters, all-inclusive dining & drinks at Jolly Beach, and curated island adventures.',
    fullDescription: 'Start 2027 surrounded by turquoise seas, powder-white sand, and pure relaxation. With Jolly Beach All Inclusive resort accommodation, your meals, drinks, water sports, and entertainment are seamlessly covered. Every 2027 package includes roundtrip airport transfers, trip memorabilia, document preparation, and 2 paid excursions!',
    packageInclusions: [
      'Roundtrip flights from Kingston',
      'Hotel accommodation at Jolly Beach All Inclusive',
      'All meals, snacks, and unlimited resort beverages',
      'Roundtrip airport transfers',
      'Two paid excursions',
      'Trip memorabilia',
      'Preparation of travel documents'
    ],
    exclusions: [
      'Premium top-shelf liquor not covered by all-inclusive plan',
      'Spa treatments and motorized water sports',
      'Personal purchases & travel insurance'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Welcome to Antigua & Resort Check-in',
        description: 'Itinerary Coming Soon. Relax and unwind on the beach.',
      },
      {
        day: 2,
        title: 'Paid Excursion 1 & Beach Day',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 3,
        title: 'Paid Excursion 2 & Island Sunset',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 4,
        title: 'All-Inclusive Leisure & Group Dinner',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 5,
        title: 'Departure & Journey Back Home',
        description: 'Itinerary Coming Soon.',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity)',
      'CARICOM national travel clearance as applicable'
    ],
    visaRequirements: 'No visa required for Jamaican passport holders visiting Antigua & Barbuda for tourism. Travel document prep handled by SMELTRAVELS876.',
    requiresSchengenVisa: false,
    excursions: [
      'Two paid excursions included in package rate',
      'Details coming soon from trip organizers'
    ],
    baggageInfo: 'Flight baggage allowance included per airline ticket terms.',
    paymentPlanInfo: 'Payment plans available after your deposit of $95,000 JMD is made.',
    featuredImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: false,
    is2027Collection: true,
    isAdultsOnly: false,
    childPrice: 159650,
    childDeposit: 66500,
    occupancyNote: 'Per person rate. Double occupancy.',
    orderIndex: 2,
    seoTitle: 'Antigua All Inclusive 2027 Group Trip | Jolly Beach | SMELTRAVELS876',
    metaDescription: 'Join SMELTRAVELS876 in Antigua January 24–28, 2027. Jolly Beach All Inclusive, flights, transfers, 2 excursions, and payment plans available.'
  },
  {
    id: 'germany-italy-2027',
    slug: 'germany-italy-grand-tour-2027',
    name: 'Germany + Italy Dual European Tour 2027',
    destination: 'Frankfurt & Milan',
    country: 'Germany + Italy',
    countryFlag: '🇩🇪🇮🇹',
    countryAcronym: 'GER/ITA',
    year: 2027,
    dates: 'February 3–10, 2027',
    hotel: 'Frankfurt City Hotel (Room Only) + Milan Design Hotel (Bed & Breakfast)',
    price: 358285,
    currency: 'JMD',
    deposit: 198310,
    shortDescription: 'Explore the gothic towers, Rhine culture, and cosmopolitan fashion capitals of Frankfurt, Germany & Milan, Italy on an unforgettable multi-country European journey.',
    fullDescription: 'Two iconic European countries, one bucket-list group trip! Experience the vibrant riverfronts, timbered architecture, and museums of Frankfurt, Germany, followed by the high fashion, historic Duomo cathedral, and delicious cuisine of Milan, Italy. Clients will need a Schengen Visa; SMELTRAVELS876 provides dedicated travel document and Schengen Visa assistance.',
    packageInclusions: [
      'All international and inter-city flights',
      'Checked bag included',
      'Carry-on luggage',
      'Personal item',
      'Hotel accommodation in Frankfurt (room only, no meals included)',
      'Hotel accommodation in Milan (with bed and breakfast)',
      'All airport transfers',
      'Preparation of travel documents & Schengen Visa assistance'
    ],
    exclusions: [
      'Schengen Visa appointment and consular processing fees payable directly to consulate/VFS',
      'Meals in Frankfurt',
      'Lunches & dinners in Milan',
      'City tourist taxes payable at hotel check-in',
      'Personal shopping & travel insurance'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Departure & Flight to Europe',
        description: 'Itinerary Coming Soon. Group departure from Kingston with connections to Frankfurt.',
      },
      {
        day: 2,
        title: 'Arrival in Frankfurt, Germany & Hotel Check-in',
        description: 'Itinerary Coming Soon. Airport transfer and orientation stroll along the Main River.',
      },
      {
        day: 3,
        title: 'Frankfurt Discovery & Römerberg Square',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 4,
        title: 'Transfer Flight to Milan, Italy',
        description: 'Itinerary Coming Soon. Flight to Milan, transfer to hotel, and evening welcome.',
      },
      {
        day: 5,
        title: 'Milan Duomo, Galleria & Fashion Quarter',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 6,
        title: 'Milan Exploration & Scenic Excursion Option',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 7,
        title: 'Leisure & Italian Culinary Experience',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 8,
        title: 'Airport Transfer & Return Flight to Jamaica',
        description: 'Itinerary Coming Soon.',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity from departure)',
      'Schengen Visa required (SMELTRAVELS876 provides preparation and document guidance)',
      'International travel medical insurance policy complying with Schengen requirements'
    ],
    visaRequirements: 'Important: Clients will need a Schengen Visa. SMELTRAVELS876 provides full Schengen Visa assistance, checklist preparation, hotel and flight reservation proof, and application guidance.',
    requiresSchengenVisa: true,
    excursions: [
      'Two paid excursions included across the tour',
      'Details coming soon from agency trip directors'
    ],
    baggageInfo: 'Includes 1 Checked bag + Carry-on + Personal item for all flight sectors.',
    paymentPlanInfo: 'Structured payment plans available after your deposit of $198,310 JMD is completed.',
    featuredImage: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: false,
    is2027Collection: true,
    isAdultsOnly: true,
    occupancyNote: 'Price based on double occupancy ($358,285 per person).',
    orderIndex: 3,
    seoTitle: 'Germany & Italy 2027 Group Tour | Frankfurt + Milan | SMELTRAVELS876',
    metaDescription: 'Travel to Frankfurt and Milan Feb 3–10, 2027 with SMELTRAVELS876! Flights, hotels, transfers, and full Schengen Visa assistance provided.'
  },
  {
    id: 'punta-cana-2027',
    slug: 'punta-cana-all-inclusive-2027',
    name: 'Punta Cana Tropical All-Inclusive 2027',
    destination: 'Punta Cana',
    country: 'Dominican Republic',
    countryFlag: '🇩🇴',
    countryAcronym: 'DOM',
    year: 2027,
    dates: 'March 23–27, 2027',
    hotel: 'Riu Bambu All Inclusive',
    price: 197860,
    currency: 'JMD',
    deposit: 78645,
    shortDescription: 'Indulge in non-stop Caribbean fun, sprawling palm-fringed beaches, gourmet dining, and lively pools at the beachfront Riu Bambu All Inclusive resort.',
    fullDescription: 'Escape to Punta Cana with SMELTRAVELS876! Stay at the vibrant Riu Bambu beachfront resort with unlimited meals, tropical drinks, swimming pools, and beach entertainment. Includes your flights from Jamaica, checked bag, roundtrip airport transfers, trip memorabilia, document preparation, and 2 paid excursions.',
    packageInclusions: [
      'Roundtrip flights from Kingston',
      'Checked bag included',
      'Hotel accommodation at Riu Bambu All Inclusive',
      'Unlimited meals, snacks, and beverages (alcoholic & non-alcoholic)',
      'Roundtrip airport transfers in Punta Cana',
      'Two paid excursions',
      'Trip memorabilia',
      'Preparation of travel documents'
    ],
    exclusions: [
      'Spa treatments & motorized watersports',
      'Premium wine by the bottle',
      'Personal spending & shopping'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Punta Cana & Resort Check-in',
        description: 'Itinerary Coming Soon. Check in to Riu Bambu and join the welcome beach toast.',
      },
      {
        day: 2,
        title: 'Paid Excursion 1 & Pool Vibes',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 3,
        title: 'Paid Excursion 2 & Group Celebration',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 4,
        title: 'Beach Day & Catamaran Sunset Optional',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 5,
        title: 'Farewell & Transfer to Airport',
        description: 'Itinerary Coming Soon.',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity)',
      'Dominican Republic electronic ticket (E-Ticket) QR code entry/exit pass (prepared by SMELTRAVELS876)'
    ],
    visaRequirements: 'No visa required for tourist stays when travelling under standard tourism protocols for Dominican Republic. Travel document prep handled by SMELTRAVELS876.',
    requiresSchengenVisa: false,
    excursions: [
      'Two paid excursions included in package rate',
      'Details coming soon from trip organizers'
    ],
    baggageInfo: 'Checked bag included in your package fare.',
    paymentPlanInfo: 'Payment plans available after your deposit of $78,645 JMD is made.',
    featuredImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: false,
    is2027Collection: true,
    isAdultsOnly: false,
    childPrice: 138500,
    childDeposit: 55050,
    occupancyNote: 'Per person rate based on double occupancy.',
    orderIndex: 4,
    seoTitle: 'Punta Cana 2027 All Inclusive Group Trip | Riu Bambu | SMELTRAVELS876',
    metaDescription: 'Punta Cana Group Trip March 23–27, 2027 with SMELTRAVELS876. Riu Bambu All Inclusive, checked bag, flights, transfers, and 2 excursions included.'
  },
  {
    id: 'medellin-2027',
    slug: 'medellin-city-of-eternal-spring-2027',
    name: 'Medellín Cultural & Mountain Discovery 2027',
    destination: 'Medellín',
    country: 'Colombia',
    countryFlag: '🇨🇴',
    countryAcronym: 'COL',
    year: 2027,
    dates: 'May 20–25, 2027',
    hotel: 'NH Collection Medellin Royal',
    price: 145500,
    currency: 'JMD',
    deposit: 52000,
    shortDescription: 'Discover the "City of Eternal Spring" nestled in the emerald Andes: world-class gastronomy, vibrant Comuna 13 street art, cable cars, and boutique luxury at NH Collection.',
    fullDescription: 'Immerse yourself in one of South America\'s most progressive, lush, and artistic cities! Stay at the upscale NH Collection Medellin Royal in the prestigious El Poblado neighborhood. Enjoy mountain views, cable car rides, vibrant nightlife, and warm Colombian hospitality. Every package includes flights, hotel, transfers, memorabilia, document prep + 2 paid excursions!',
    packageInclusions: [
      'Roundtrip flights from Kingston',
      'Hotel accommodation at NH Collection Medellin Royal',
      'Daily breakfast buffet',
      'Roundtrip airport transfers in Medellín',
      'Two paid excursions',
      'Trip memorabilia',
      'Preparation of travel documents'
    ],
    exclusions: [
      'Checked bag add-on (if applicable based on final flight choice)',
      'Lunches and dinners not listed in schedule',
      'Personal expenses, tips, and optional activities'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Medellín & Check-in at El Poblado',
        description: 'Itinerary Coming Soon. Airport transfer from Jose Maria Cordova (MDE) to NH Collection.',
      },
      {
        day: 2,
        title: 'Paid Excursion 1 & Comuna 13 Art Tour',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 3,
        title: 'Paid Excursion 2 & Guatapé Rock Option',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 4,
        title: 'Cable Cars, Botanical Gardens & Shopping',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 5,
        title: 'Poblado Nightlife & Group Farewell Dinner',
        description: 'Itinerary Coming Soon.',
      },
      {
        day: 6,
        title: 'Airport Transfer & Flight Home to Kingston',
        description: 'Itinerary Coming Soon.',
      },
    ],
    travelRequirements: [
      'Valid Jamaican passport (with at least 6 months validity)',
      'Check-MIG Colombia digital immigration pre-registration (prepared by SMELTRAVELS876)'
    ],
    visaRequirements: 'No visa required for Jamaican citizens for short tourism stays in Colombia. Travel document prep is handled by SMELTRAVELS876.',
    requiresSchengenVisa: false,
    excursions: [
      'Two paid excursions included in package rate',
      'Details coming soon from trip organizers'
    ],
    baggageInfo: 'Personal item + Carry-on standard; checked bag options available.',
    paymentPlanInfo: 'Payment plans available after your deposit of $52,000 JMD is made.',
    featuredImage: 'https://images.unsplash.com/photo-1599827552599-eadf5e0a0d93?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599827552599-eadf5e0a0d93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Available',
    isFeatured: true,
    is2026Featured: false,
    is2027Collection: true,
    isAdultsOnly: false,
    childPrice: 101850,
    childDeposit: 36400,
    occupancyNote: 'Per person rate. Double occupancy basis.',
    orderIndex: 5,
    seoTitle: 'Medellin Colombia 2027 Group Trip | NH Collection | SMELTRAVELS876',
    metaDescription: 'Medellin Group Trip May 20–25, 2027 with SMELTRAVELS876. NH Collection Medellin Royal, flights, transfers, and 2 paid excursions included.'
  },
];

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'mexico',
    slug: 'mexico',
    name: 'Mexico',
    country: 'Mexico',
    countryFlag: '🇲🇽',
    countryCode: 'MX',
    tagline: 'Ancient Mayan Wonders, Turquoise Waters & Vibrant Culture',
    description: 'Mexico is a captivating world of stunning Caribbean beaches, crystal-clear mystical cenotes, ancient Mayan temples, mouthwatering culinary traditions, and warm hospitality.',
    image: 'https://images.unsplash.com/photo-1512815777174-88db0fb1bd74?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1512815777174-88db0fb1bd74?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Chichen Itza UNESCO World Wonder Guided Tour',
      'Swimming in Freshwater Limestone Cenotes',
      'Cancún & Riviera Maya Beachfront Relaxation',
      'Catamaran Ocean & Mesoamerican Coral Reef Snorkeling'
    ],
    bestTimeToVisit: 'November to April for sunny Caribbean days and ideal exploring temperatures',
    visaOverview: 'Jamaican passport holders with a valid US, Canadian, UK, or Schengen visa enjoy visa-free entry. Mexican Tourist Card (FMM) facilitated by SMELTRAVELS876.',
    currencyInfo: 'Mexican Peso (MXN) and US Dollar (USD)',
    featured: true
  },
  {
    id: 'panama',
    slug: 'panama',
    name: 'Panama',
    country: 'Panama',
    countryCode: 'PA',
    tagline: 'Where Modern Skylines Meet Colonial Charm & The Eighth Wonder',
    description: 'Panama is a dynamic crossroad of the Americas featuring glittering oceanfront skyscrapers, the historic cobblestones of Casco Viejo, lush rainforest national parks, and the engineering feat of the Panama Canal.',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Panama Canal Miraflores Locks Observation',
      'Casco Antiguo Colonial Walking Tour & Rooftop Cafes',
      'Duty-Free Shopping at Albrook & Multiplaza Malls',
      'Gamboa Rainforest & Monkey Island Boat Cruise'
    ],
    bestTimeToVisit: 'December to April (Dry Season) and October group departures',
    visaOverview: 'Visa-free tourist entry for Jamaican passport holders with onward travel confirmation.',
    currencyInfo: 'US Dollar (USD) & Panamanian Balboa (PAB pegged 1:1)',
    featured: true
  },
  {
    id: 'antigua',
    slug: 'antigua',
    name: 'Antigua',
    country: 'Antigua and Barbuda',
    countryFlag: '🇦🇬',
    countryCode: 'AG',
    tagline: '365 Beaches — One for Every Day of the Year',
    description: 'Renowned for having a beach for every day of the year, Antigua boasts serene turquoise bays, historical Nelson\'s Dockyard, Caribbean cricket fervor, and high-energy sailing culture.',
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Jolly Beach Turquoise Waters & Watersports',
      'Historic Nelson\'s Dockyard UNESCO Heritage Site',
      'Shirley Heights Lookout Sunset & Steelpan Party',
      'Stingray City Swimming Experience'
    ],
    bestTimeToVisit: 'December through May for idyllic Caribbean sunshine',
    visaOverview: 'CARICOM member state — visa-free entry for Jamaican nationals.',
    currencyInfo: 'Eastern Caribbean Dollar (XCD) and US Dollar (USD)',
    featured: true
  },
  {
    id: 'frankfurt',
    slug: 'frankfurt',
    name: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    tagline: 'Gothic Charm Meets European Innovation & Rhine Culture',
    description: 'Frankfurt seamlessly weaves medieval Römer squares and apple cider taverns in Sachsenhausen with futuristic glass architecture and legendary European transit networks.',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Römerberg Historic Medieval Square',
      'Iron Footbridge (Eiserner Steg) Over the Main River',
      'Städel Art Museum & Museum Embankment',
      'Traditional Cider Taverns of Alt-Sachsenhausen'
    ],
    bestTimeToVisit: 'Year-round; February winter charm and crisp European city atmosphere',
    visaOverview: 'Schengen Visa required for Jamaican passport holders. SMELTRAVELS876 assists with document preparation.',
    currencyInfo: 'Euro (€ / EUR)',
    featured: true
  },
  {
    id: 'milan',
    slug: 'milan',
    name: 'Milan',
    country: 'Italy',
    countryCode: 'IT',
    tagline: 'The World Capital of Fashion, Design & Italian Architecture',
    description: 'Milan is the beating heart of Italian style, home to the breathtaking Gothic Duomo, the iconic Galleria Vittorio Emanuele II, world-class trattorias, and contemporary art.',
    image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Duomo di Milano Cathedral & Rooftop Terraces',
      'Galleria Vittorio Emanuele II Luxury Arcade',
      'Navigli Canal District Aperitivo Scene',
      'Brera Bohemian Art District & Pinacoteca'
    ],
    bestTimeToVisit: 'Spring, Autumn, and February during seasonal fashion showcases',
    visaOverview: 'Schengen Visa required. Dedicated application and document guidance provided by SMELTRAVELS876.',
    currencyInfo: 'Euro (€ / EUR)',
    featured: true
  },
  {
    id: 'punta-cana',
    slug: 'punta-cana',
    name: 'Punta Cana',
    country: 'Dominican Republic',
    countryCode: 'DO',
    tagline: 'Coconut Coast Luxury, Crystal Lagoons & Caribbean Rhythm',
    description: 'Punta Cana is the undisputed capital of Caribbean all-inclusive luxury, boasting 32 kilometers of uninterrupted white sand, warm aquamarine surf, and vibrant nightlife.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Bávaro Beachfront Lounging & Catamaran Cruises',
      'Indigenous Eyes Ecological Reserve & Lagoons',
      'Coco Bongo Nightclub Spectacle',
      'Saona Island Day Sailing Excursion'
    ],
    bestTimeToVisit: 'December to April for sunny beach weather',
    visaOverview: 'Electronic E-Ticket registration required (prepared by SMELTRAVELS876); visa-free for tourist stays.',
    currencyInfo: 'Dominican Peso (DOP) and US Dollar (USD)',
    featured: true
  },
  {
    id: 'medellin',
    slug: 'medellin',
    name: 'Medellín',
    country: 'Colombia',
    countryFlag: '🇨🇴',
    countryCode: 'CO',
    tagline: 'The City of Eternal Spring, Innovation & Mountain Culture',
    description: 'Surrounded by the dramatic Aburrá Valley mountains, Medellín combines perpetual pleasant spring temperatures with groundbreaking urban architecture, rich coffee heritage, and warm paisa culture.',
    image: 'https://images.unsplash.com/photo-1599827552599-eadf5e0a0d93?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1599827552599-eadf5e0a0d93?auto=format&fit=crop&w=1600&q=80',
    popularExperiences: [
      'Comuna 13 Outdoor Escalators & Street Art Tour',
      'El Peñol Rock & Guatapé Lakeside Village',
      'Metrocable Cable Car Views Across the Valley',
      'El Poblado Gastronomy, Specialty Coffee & Boutiques'
    ],
    bestTimeToVisit: 'Year-round pleasant spring climate; May group departure is ideal',
    visaOverview: 'Check-MIG digital pre-registration required; visa-free for Jamaican tourists.',
    currencyInfo: 'Colombian Peso (COP)',
    featured: true
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Booking',
    question: 'How do I secure my spot on a SMELTRAVELS876 group trip?',
    answer: 'Securing your spot is easy! Select your desired trip on our website, submit the booking/inquiry form, and our travel team will verify availability. Once confirmed, you pay the designated package deposit (e.g., $83,353 JMD for Panama 2026). Once your deposit is received, your spot is guaranteed!',
    orderIndex: 1,
  },
  {
    id: 'faq-2',
    category: 'Payments',
    question: 'Are payment plans available for upcoming trips?',
    answer: 'Yes! Payment plans are available after your initial deposit is made. You can pay your remaining balance in comfortable monthly or scheduled installments leading up to the final trip deadline.',
    orderIndex: 2,
  },
  {
    id: 'faq-3',
    category: 'Travel Documents',
    question: 'Do you help with visas, like the Schengen Visa for Europe?',
    answer: 'Absolutely. For international trips requiring visas—such as our Germany + Italy 2027 tour—SMELTRAVELS876 provides travel document preparation and guidance, including hotel confirmation vouchers, official flight reservation itineraries, and checklist support for your visa application.',
    orderIndex: 3,
  },
  {
    id: 'faq-4',
    category: 'Group Trips',
    question: 'Can I travel alone or do I need a travel partner?',
    answer: 'Solo travelers are always welcome on SMELTRAVELS876 group trips! Many of our travelers join alone and leave with lifelong friends. We can pair you with a same-sex roommate upon request or provide a single supplement rate if you prefer your own private room.',
    orderIndex: 4,
  },
  {
    id: 'faq-5',
    category: 'Flights',
    question: 'Where do flights depart from?',
    answer: 'Our standard group departures depart from Norman Manley International Airport in Kingston (KIN). If you require departure from Sangster International Airport in Montego Bay (MBJ) or an overseas hub, please let our team know when submitting your inquiry.',
    orderIndex: 5,
  },
  {
    id: 'faq-6',
    category: 'Airport Transfers',
    question: 'Are roundtrip airport transfers included?',
    answer: 'Yes! In line with our "Travel More. Worry Less." motto, all our packages include pre-arranged roundtrip airport transfers in the destination country, so you never have to worry about finding transport upon landing.',
    orderIndex: 6,
  },
  {
    id: 'faq-7',
    category: 'Excursions',
    question: 'What is included in the "2 Paid Excursions"?',
    answer: 'Standard packages include 2 curated group excursions designed to showcase the destination\'s highlights (such as historic tours, boat cruises, or cultural landmarks). Exact details and options are communicated to confirmed group travelers.',
    orderIndex: 7,
  },
  {
    id: 'faq-8',
    category: 'Cancellations',
    question: 'What is the cancellation and refund policy?',
    answer: 'Trip deposits are generally non-refundable due to airline and hotel commitment policies. However, depending on the trip date and supplier terms, name changes or credit towards future trips may be possible under specific conditions. Please review our full Booking Terms or speak with our team for exact policies.',
    orderIndex: 8,
  },
  {
    id: 'faq-9',
    category: 'General Questions',
    question: 'Who can I contact if I have questions before booking?',
    answer: 'You can reach SMELTRAVELS876 directly by phone at (876) 834-1537, email at smeltravels876@gmail.com, or reach our Ambassador Zachary Buchanan at (876) 848-9772 / zbuchanan.smeltravels@gmail.com. You can also click our WhatsApp button to chat instantly!',
    orderIndex: 9,
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'panama-travel-guide-jamaican-travelers',
    title: 'Why Panama Is the Ultimate Group Getaway for Jamaican Travelers',
    excerpt: 'From duty-free shopping to Spanish colonial gems and the world-famous canal, discover why Panama continues to be one of our most requested destinations.',
    content: `## Why Panama Remains a Caribbean Favorite

Panama offers a blend of ultra-modern city energy and rich historical culture that resonates deeply with Caribbean travelers. Located just a short direct or connection flight from Kingston (KIN), Panama City delivers an international vacation without days of exhausting transit.

### 1. The Wonder of the Panama Canal
No visit to Panama is complete without standing at the Miraflores Locks. Watching massive Panamax cargo ships elevate through the locks with millimeter precision is an unforgettable experience.

### 2. Casco Viejo: History, Flavors, and Rooftops
Casco Antiguo (Old Quarter) is Panama City’s historic heart. Cobblestone streets, colorful Spanish colonial mansions, artisan markets, and breathtaking rooftop lounges facing the illuminated skyline make for magical evenings.

### 3. World-Class Shopping at Unbeatable Value
Whether you are exploring Albrook Mall—one of the largest retail complexes in the Americas—or the high-end boutiques of Multiplaza Pacific, Panama is a shopper’s paradise for clothing, electronics, perfumes, and Caribbean fashion.

> **Travel Tip:** SMELTRAVELS876's Panama 2026 Part 2 group trip includes flights from Kingston, carry-on, hotel, bed and breakfast, roundtrip airport transfers, two paid excursions, trip memorabilia, and complete travel document prep!

*Disclaimer: This is an editable sample travel guide provided as part of the SMELTRAVELS876 content management system. Administrators can edit or replace this text.*`,
    category: 'Destination Guides',
    tags: ['Panama', 'Group Travel', 'Shopping', 'Central America'],
    author: 'SMELTRAVELS876 Editorial Team',
    date: 'August 24, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    relatedDestination: 'panama',
    relatedTripId: 'panama-2026',
    isPublished: true,
    isSampleContent: true,
    seoTitle: 'Panama Travel Guide for Jamaican Travelers | SMELTRAVELS876',
    metaDescription: 'Discover why Panama is the ultimate group getaway for Jamaican travelers. Tips on shopping, Casco Viejo, the Panama Canal, and our 2026 group package.'
  },
  {
    id: 'blog-2',
    slug: 'schengen-visa-guide-germany-italy-2027',
    title: 'Navigating Your Schengen Visa: Everything You Need to Know for Germany + Italy 2027',
    excerpt: 'Planning to join our dual-country European trip in 2027? Here is our comprehensive breakdown on Schengen requirements and how SMELTRAVELS876 assists you.',
    content: `## Demystifying the Schengen Visa for Jamaican Passport Holders

Visiting Europe is a milestone dream for many travelers. For our upcoming **Germany + Italy Dual European Tour (February 3–10, 2027)**, travelers holding a Jamaican passport will need an approved Schengen Visa. 

While the process requires attention to detail, SMELTRAVELS876 is committed to making it smooth and transparent.

### Which Embassy Issues the Visa?
Under Schengen regulations, you apply to the country that serves as your main destination or first port of entry. For our tour starting in Frankfurt, Germany, application documents will be processed through the German Embassy / authorized visa service center.

### Documents Required
- Valid passport with at least 6 months remaining validity
- Confirmed roundtrip flight reservations (provided by SMELTRAVELS876)
- Hotel reservation vouchers for Frankfurt and Milan (provided by SMELTRAVELS876)
- Travel medical insurance covering minimum €30,000 in emergency medical coverage
- Proof of financial sufficiency (recent bank statements)
- Employment verification letter or business registration documents

### How SMELTRAVELS876 Helps
Every booked traveler receives personalized travel document preparation support, verified booking itineraries tailored for embassy appointments, and guidance through every step of the submission.

*Disclaimer: Visa issuance is at the sole discretion of the respective embassy or consulate. SMELTRAVELS876 provides preparation and document assistance, but cannot guarantee visa approval.*`,
    category: 'Visa & Documents',
    tags: ['Europe', 'Schengen Visa', 'Germany', 'Italy', 'Travel Tips'],
    author: 'SMELTRAVELS876 Visa Support',
    date: 'August 15, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
    relatedDestination: 'milan',
    relatedTripId: 'germany-italy-2027',
    isPublished: true,
    isSampleContent: true,
    seoTitle: 'Schengen Visa Guide for Germany & Italy 2027 | SMELTRAVELS876',
    metaDescription: 'Step-by-step guide to applying for your Schengen Visa for the SMELTRAVELS876 Germany + Italy 2027 group tour. Document preparation support available.'
  },
  {
    id: 'blog-3',
    slug: 'benefits-of-organized-group-travel',
    title: 'Travel More. Worry Less: The 5 Big Benefits of Organized Group Travel',
    excerpt: 'Why coordinating flights, transfers, hotel vouchers, and excursions with a specialized agency beats doing it all alone.',
    content: `## Why More Travelers Are Choosing Organized Group Adventures

Travel should be exhilarating, inspiring, and restorative—not filled with stress over missing transfers, language barriers, or booking complications.

### 1. Zero Logistics Headache
With SMELTRAVELS876, your flights, hotels, airport transfers, and excursions are mapped out before you leave the tarmac. 

### 2. Group Buying Power & Better Rates
Organized travel unlocks group rates that individual travelers rarely receive on their own.

### 3. Built-In Travel Community
Whether you join with friends or travel solo, group trips bring together like-minded adventurers who quickly become friends.

### 4. Safety & Ground Support
Navigating a new country is far easier when you have an experienced team coordinating transport, hotel desks, and local contacts.

### 5. Flexible Payment Schedules
Instead of paying lump sums upfront, our travelers can make an initial deposit and spread remaining payments in manageable installments.

*Editable sample post. Replace with agency updates anytime via the Admin CMS.*`,
    category: 'Group Travel Advice',
    tags: ['Travel Advice', 'Group Trips', 'Vacation Planning'],
    author: 'Zachary Buchanan',
    date: 'July 28, 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    isSampleContent: true,
    seoTitle: 'Benefits of Organized Group Travel | SMELTRAVELS876',
    metaDescription: 'Learn why organized group travel with SMELTRAVELS876 helps you Travel More and Worry Less. Zero logistics headaches and flexible payment plans.'
  }
];

export const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'offer-early-bird-2027',
    title: 'Early Bird Group Booking Deposit Special',
    description: 'Book your 2027 group trip spot early and lock in current package rates before airline seasonal surcharges take effect.',
    badgeText: '2027 Special',
    promoCode: 'EARLYBIRD876',
    discountSummary: 'Complimentary excursion upgrade or trip merchandise pack',
    validUntil: 'December 31, 2026',
    terms: 'Applicable to new bookings on Antigua, Punta Cana, or Medellín 2027 group trips with deposit paid by deadline.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    ctaText: 'View 2027 Trips',
    ctaLink: '#trips-2027',
  },
  {
    id: 'offer-referral-bonus',
    title: 'Travel Tribe Referral Credit',
    description: 'Travel is always sweeter with family & friends! Refer 2 or more travelers who book a package, and receive a $5,000 JMD excursion voucher credit.',
    badgeText: 'Referral Club',
    promoCode: 'TRIBE876',
    discountSummary: '$5,000 JMD trip credit per confirmed referral',
    validUntil: 'Ongoing Promotion',
    terms: 'Referred friends must complete deposit on an active SMELTRAVELS876 package. Credit applied to remaining balance.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    ctaText: 'Inquire with Team',
    ctaLink: '#contact',
  }
];

// Verified Traveler Reviews & Testimonials
export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    customerName: 'Aaliyah Campbell',
    location: 'Kingston, Jamaica',
    rating: 5,
    reviewText: 'Booking with SMELTRAVELS876 was so seamless! Having flights, transfers, and accommodations completely coordinated made all the difference on our Panama trip. Zachary kept our group informed throughout.',
    tripName: 'Panama Experience 2026',
    date: 'August 18, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isPublished: true,
    isSamplePlaceholder: false,
  },
  {
    id: 'test-2',
    customerName: 'Marcus Sterling',
    location: 'Portmore, St. Catherine',
    rating: 5,
    reviewText: 'The group atmosphere was electric! As a first-time international traveler, the document preparation guidance gave me complete confidence. The payment schedule was flexible and transparent.',
    tripName: 'Cartagena Sun & Salsa 2026',
    date: 'August 28, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isPublished: true,
    isSamplePlaceholder: false,
  },
  {
    id: 'test-3',
    customerName: 'Tamika Rowe-Bennett',
    location: 'Montego Bay, St. James',
    rating: 5,
    reviewText: 'Our Dubai getaway exceeded expectations! 5-star hotels, incredible desert safari excursions, and seamless airport pickups. Best Jamaican travel agency for organized group departures.',
    tripName: 'Dubai Luxury Experience 2026',
    date: 'September 2, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isPublished: true,
    isSamplePlaceholder: false,
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    name: 'Panama City Skyline & Waterfront',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Panama City high-rise skyline against the Pacific Ocean',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'med-2',
    name: 'Antigua Jolly Beach Tropical Shoreline',
    url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Turquoise ocean water and sandy beach in Antigua',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'med-3',
    name: 'Milan Duomo di Milano Italy',
    url: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Duomo di Milano cathedral facade in Milan Italy',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'med-4',
    name: 'Frankfurt Historic Römer Square',
    url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Historic timber houses in Römerberg square, Frankfurt',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'med-5',
    name: 'Punta Cana Resort Palms and Ocean',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Tropical beach resort pool and palms in Dominican Republic',
    uploadedAt: '2026-08-01'
  },
  {
    id: 'med-6',
    name: 'Medellin Mountain Valley Landscape',
    url: 'https://images.unsplash.com/photo-1599827552599-eadf5e0a0d93?auto=format&fit=crop&w=1200&q=80',
    category: 'Destinations',
    altText: 'Panoramic view of Medellin in the Aburrá Valley Colombia',
    uploadedAt: '2026-08-01'
  }
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Kadeen Campbell',
    email: 'kadeen.campbell@example.com',
    phone: '(876) 555-0192',
    countryOrParish: 'St. Andrew, Jamaica',
    tripsOfInterest: ['Panama 2026 — Part 2'],
    bookingCount: 1,
    inquiryCount: 2,
    totalSpent: 83353,
    notes: ['Deposit received for Panama 2026 Part 2. Interested in Schengen visa guidance for 2027 Europe.'],
    status: 'Active Traveler',
    communicationPreference: 'whatsapp',
    createdAt: '2026-08-10'
  },
  {
    id: 'cust-2',
    name: 'Tamara Edwards',
    email: 'tamara.edwards@example.com',
    phone: '(876) 555-4819',
    countryOrParish: 'Kingston, Jamaica',
    tripsOfInterest: ['Germany + Italy Dual European Tour 2027'],
    bookingCount: 0,
    inquiryCount: 1,
    totalSpent: 0,
    notes: ['Requested Schengen visa document checklist. Inquired about double occupancy.'],
    status: 'Lead',
    communicationPreference: 'email',
    createdAt: '2026-08-18'
  }
];

export const INITIAL_BOOKINGS: BookingSubmission[] = [
  {
    id: 'book-1',
    referenceNumber: 'ST-2026-8812',
    tripId: 'panama-2026',
    tripName: 'Panama 2026 — Part 2',
    customerName: 'Kadeen Campbell',
    email: 'kadeen.campbell@example.com',
    phone: '(876) 555-0192',
    countryOrParish: 'St. Andrew, Jamaica',
    adultsCount: 2,
    childrenCount: 0,
    preferredTravelDate: 'October 13–18, 2026',
    travelInterestType: 'ready_to_book',
    specialRequests: 'Celebrating anniversary. Would like adjacent rooms or double bed.',
    preferredContactMethod: 'whatsapp',
    status: 'Deposit Received',
    depositPaid: 83353,
    totalPrice: 152303,
    currency: 'JMD',
    internalNotes: ['Deposit confirmed via bank transfer. Sent welcome packet.'],
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-08-11T09:15:00Z'
  },
  {
    id: 'book-2',
    referenceNumber: 'ST-2027-4109',
    tripId: 'germany-italy-2027',
    tripName: 'Germany + Italy Dual European Tour 2027',
    customerName: 'Tamara Edwards',
    email: 'tamara.edwards@example.com',
    phone: '(876) 555-4819',
    countryOrParish: 'Kingston, Jamaica',
    adultsCount: 1,
    childrenCount: 0,
    preferredTravelDate: 'February 3–10, 2027',
    travelInterestType: 'more_info',
    specialRequests: 'Need information on Schengen visa appointment dates and flight baggage allowance.',
    preferredContactMethod: 'email',
    status: 'Contacted',
    depositPaid: 0,
    totalPrice: 358285,
    currency: 'JMD',
    internalNotes: ['Emailed visa checklist and payment plan timeline on Aug 19.'],
    createdAt: '2026-08-18T11:20:00Z',
    updatedAt: '2026-08-19T16:00:00Z'
  }
];

export const INITIAL_ADMIN_INBOX: AdminInboxItem[] = [
  {
    id: 'inbox-1',
    type: 'deposit',
    title: 'Deposit Received: Panama 2026 Experience',
    senderName: 'Zachary Buchanan',
    senderEmail: 'zacpremacc12@gmail.com',
    senderPhone: '(876) 848-9772',
    summary: 'Traveler deposited $83,353 JMD lock-in payment for Panama 2026 Experience.',
    details: 'Initial required deposit successfully processed. Booking reference: ST-2026-8842. Verified via Lynk Jamaica / NCB transfer receipt.',
    amount: 83353,
    currency: 'JMD',
    tripId: 'panama-2026',
    tripName: 'Panama 2026 Experience',
    referenceNumber: 'ST-2026-8842',
    timestamp: '2026-09-06T04:45:00Z',
    isRead: false
  },
  {
    id: 'inbox-2',
    type: 'inquiry',
    title: 'New Booking Inquiry: Dubai Luxury Expedition 2026',
    senderName: 'Kadeen Brown',
    senderEmail: 'kadeen.brown@example.com',
    senderPhone: '(876) 555-8910',
    summary: 'Inquiry submitted for 2 adults. Interest: Ready to Book & Secure Spot.',
    details: 'Customer is ready to place initial deposit. Preferred contact method: WhatsApp. Requested single room supplement quote.',
    tripId: 'dubai-2026',
    tripName: 'Dubai Luxury Expedition 2026',
    referenceNumber: 'ST-2026-7731',
    timestamp: '2026-09-06T03:30:00Z',
    isRead: false
  },
  {
    id: 'inbox-3',
    type: 'review',
    title: 'New Review Submitted: 5 Stars for Dubai Expedition',
    senderName: 'Shanice McFarlane',
    senderEmail: 'smcfarlane.travel@gmail.com',
    senderPhone: '(876) 555-2241',
    summary: '5-star review: "SMELTRAVELS876 made our international trip effortless! Every transfer, tour, and hotel was flawless."',
    details: 'Traveler Shanice McFarlane submitted a glowing review from Kingston, Jamaica. Waiting for admin approval / published status.',
    rating: 5,
    tripName: 'Dubai Luxury Expedition 2026',
    timestamp: '2026-09-05T20:15:00Z',
    isRead: false
  },
  {
    id: 'inbox-4',
    type: 'message',
    title: 'New Contact Message: Schengen Visa Requirements',
    senderName: 'Damion Clarke',
    senderEmail: 'd.clarke876@outlook.com',
    senderPhone: '(876) 555-6677',
    summary: 'Subject: Schengen Visa Appointment assistance for Germany + Italy 2027.',
    details: 'Message: "Hello Zachary, my wife and I are interested in the Germany + Italy 2027 tour. Does SMELTRAVELS876 provide the embassy appointment booking support and document review?"',
    referenceNumber: 'INQ-94218',
    timestamp: '2026-09-05T18:00:00Z',
    isRead: true
  }
];

