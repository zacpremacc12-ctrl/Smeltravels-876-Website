export type TripStatus = 'Available' | 'Limited Availability' | 'Coming Soon' | 'Sold Out' | 'Closed';

export interface DayItineraryItem {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  mealsIncluded?: string;
  hotelNight?: string;
}

export interface TripPackage {
  id: string;
  slug: string;
  name: string;
  destination: string;
  country: string;
  countryFlag: string;
  countryAcronym?: string;
  year: number;
  dates: string;
  hotel: string;
  price: number; // in JMD or USD
  currency: string;
  deposit: number;
  shortDescription: string;
  fullDescription: string;
  packageInclusions: string[];
  exclusions: string[];
  itinerary: DayItineraryItem[];
  travelRequirements: string[];
  visaRequirements: string;
  requiresSchengenVisa?: boolean;
  excursions: string[];
  baggageInfo: string;
  paymentPlanInfo: string;
  tripLogo?: string;
  featuredImage: string;
  gallery: string[];
  status: TripStatus;
  availabilityNote?: string;
  isFeatured?: boolean;
  is2026Featured?: boolean;
  is2027Collection?: boolean;
  isAdultsOnly?: boolean; // When true, trip is strictly 18+ and children cannot be added
  childPrice?: number; // Custom trip package price for children (JMD)
  childDeposit?: number; // Custom trip deposit for children (JMD)
  occupancyNote?: string;
  orderIndex: number;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag?: string;
  tagline: string;
  description: string;
  image: string;
  heroImage: string;
  popularExperiences: string[];
  bestTimeToVisit: string;
  visaOverview: string;
  currencyInfo: string;
  featured: boolean;
}

export type TravelInterestType = 'ready_to_book' | 'more_info' | 'need_help';

export type BookingStatus =
  | 'New'
  | 'Contacted'
  | 'Pending'
  | 'Deposit Requested'
  | 'Deposit Received'
  | 'Deposit Paid'
  | 'Confirmed'
  | 'Documents Pending'
  | 'Completed'
  | 'Cancelled';

export interface BookingSubmission {
  id: string;
  referenceNumber: string;
  tripId: string;
  tripName: string;
  customerName: string;
  email: string;
  phone: string;
  countryOrParish: string;
  adultsCount: number;
  childrenCount: number;
  preferredTravelDate: string;
  travelInterestType: TravelInterestType;
  specialRequests: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  status: BookingStatus;
  depositPaid: number;
  totalPrice: number;
  currency: string;
  budget?: string;
  numericalBudget?: number;
  originLocation?: string;
  flightPricingStatus?: 'Estimated' | 'Manual Flight Pricing Required';
  ambassadorId?: string;
  ambassadorName?: string;
  ambassadorPhone?: string;
  ambassadorCode?: string;
  discountPercentage?: number;
  discountAmount?: number;
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export type BookingInquiry = BookingSubmission;

export interface ContactSubmission {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  countryOrParish?: string;
  subject: string;
  message: string;
  interestedTrip?: string;
  tripId?: string;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  status: 'New' | 'Replied' | 'Archived';
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryOrParish: string;
  tripsOfInterest: string[];
  bookingCount: number;
  inquiryCount: number;
  totalSpent: number;
  notes: string[];
  status: 'Lead' | 'Active Traveler' | 'VIP Traveler' | 'Past Traveler';
  communicationPreference: 'phone' | 'email' | 'whatsapp';
  createdAt: string;
}

export interface TravelerDepositRecord {
  id: string;
  tripId: string;
  tripName: string;
  amount: number;
  currency: string;
  date: string;
  bookingRef: string;
  paymentMethod: string;
  transactionId: string;
  status: 'Confirmed' | 'Pending Review';
}

export interface TravelerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  homeParishOrCountry?: string;
  memberSince?: string;
  firstDeposit?: TravelerDepositRecord;
  deposits?: TravelerDepositRecord[];
  isAdmin?: boolean;
  adminRole?: AdminRole;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Travel Guides' | 'Destination Guides' | 'Travel Tips' | 'Visa & Documents' | 'Packing Guides' | 'Group Travel Advice' | 'Trip Updates';
  tags: string[];
  author: string;
  date: string;
  readTime: string;
  image: string;
  relatedDestination?: string;
  relatedTripId?: string;
  isPublished: boolean;
  isSampleContent: boolean;
  seoTitle?: string;
  metaDescription?: string;
}

export interface OfferItem {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  promoCode?: string;
  discountSummary: string;
  validUntil: string;
  terms: string;
  image: string;
  isActive: boolean;
  ctaText: string;
  ctaLink: string;
}

export type PromotionalOffer = OfferItem;

export interface TestimonialItem {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  reviewText: string;
  tripName: string;
  date: string;
  avatarUrl: string;
  isPublished: boolean;
  isSamplePlaceholder: boolean;
  email?: string;
}

export type FAQCategory =
  | 'Booking'
  | 'Payments'
  | 'Travel Documents'
  | 'Group Trips'
  | 'Flights'
  | 'Hotels'
  | 'Airport Transfers'
  | 'Excursions'
  | 'Cancellations'
  | 'General Questions';

export interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  orderIndex: number;
  order?: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: string;
  altText: string;
  uploadedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  firstName: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  source: string;
}

export interface CompanyBankingSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branch: string;
  swiftOrRoutingCode?: string;
  lynkHandle: string;
  lynkPhone: string;
  officeDepositAddress: string;
  cardGatewayProvider?: string;
  cardGatewayMerchantId?: string;
  paymentInstructions?: string;
}

export interface Ambassador {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  code?: string;
  isActive: boolean;
  avatar?: string;
  parishOrRegion?: string;
}

export interface DestinationPhoto {
  url: string;
  caption: string;
  landmark: string;
}

export interface CountryDestinationInfo {
  id: string;
  name: string;
  country: string;
  region: 'Caribbean' | 'Americas' | 'Europe' | 'Asia & Middle East' | 'Africa' | 'Global & Islands';
  flag: string;
  capitalOrMainCity: string;
  tagline: string;
  popularCities: string[];
  bestMonths: string[];
  recommendedDuration: string;
  photos: DestinationPhoto[];
  highlights: string[];
  vibes: string[];
  typicalBudgetTier: 'Affordable' | 'Moderate' | 'Luxury';
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryPhone: string;
  primaryEmail: string;
  ambassadorName: string;
  ambassadorTitle: string;
  ambassadorPhone: string;
  ambassadorEmail: string;
  ambassadors: Ambassador[];
  requireAmbassadorSelection: boolean;
  ambassadorDiscountPercentage?: number;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  addressSummary: string;
  operatingBase?: string;
  businessHours?: string;
  companyBanking?: CompanyBankingSettings;
  brandColors: {
    primaryPurple: string;
    accentGold: string;
    darkCharcoal: string;
  };
  announcementBanner: {
    enabled: boolean;
    text: string;
    link: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    whatsapp: string;
  };
  homepageSections: {
    hero: boolean;
    featuredUpcoming: boolean;
    featured2026: boolean;
    groupTrips2027: boolean;
    whyChoose: boolean;
    popularDestinations: boolean;
    howItWorks: boolean;
    offers: boolean;
    travelGuides: boolean;
    testimonials: boolean;
    faq: boolean;
    bookingCta: boolean;
    newsletter: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    canonicalDomain: string;
    googleAnalyticsId: string;
    metaPixelId: string;
  };
  customTripDestinations?: CountryDestinationInfo[];
}

export type AdminRole = 'Super Admin' | 'Content Manager' | 'Booking Manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export type AdminInboxCategory = 'inquiry' | 'deposit' | 'review' | 'message' | 'custom_trip';

export interface CustomTripRequest {
  id: string;
  referenceNumber: string;
  // Origin / Departure Location
  originCountry?: string;
  originCity?: string;
  originAirportCode?: string;
  originAirportName?: string;
  originLocationDisplay?: string;
  isAirportUnknown?: boolean;
  destination: string;
  country: string;
  countryFlag?: string;
  landmarkPhotos: string[];
  travelDatesType: 'specific' | 'flexible';
  startDate?: string;
  endDate?: string;
  flexibleSeason?: string;
  durationDays?: number;
  adultsCount: number;
  childrenCount: number;
  roomOccupancy?: 'single' | 'double' | 'triple' | 'quad' | 'group';
  tripVibe: string;
  travelStyle: string;
  cabinClass?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  budgetPerPerson?: string;
  budgetCurrency?: string;
  budgetAmount?: string;
  numericalBudget?: number;
  budgetType?: 'per_person' | 'total_trip';
  mustHaveInclusions: string[];
  specialRequests?: string;
  customerName: string;
  email: string;
  phone: string;
  countryOrParish: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  preferredAmbassador?: string;
  // Flight & Pricing Engine Fields
  flightPricingStatus?: 'Estimated' | 'Manual Flight Pricing Required';
  flightAllowanceEstimatedUSD?: number;
  flightRouteMatched?: string;
  estimatedMinimumBudgetTotal?: number;
  estimatedMinimumBudgetUSD?: number;
  costBreakdown?: {
    flightCostTotal: number;
    accommodationTotal: number;
    mealAllowanceTotal: number;
    transfersTotal: number;
    excursionsTotal: number;
    travelDocumentsTotal: number;
    otherServicesTotal: number;
    taxesAndFeesTotal: number;
  };
  createdAt: string;
  status: 'Pending Admin Review' | 'Trip Proposal Sent' | 'Confirmed' | 'Archived';
}

export type CustomTripRequestInput = Omit<CustomTripRequest, 'id' | 'referenceNumber' | 'createdAt' | 'status'>;

export interface AdminInboxItem {
  id: string;
  type: AdminInboxCategory;
  title: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  summary: string;
  details?: string;
  amount?: number;
  currency?: string;
  tripId?: string;
  tripName?: string;
  rating?: number;
  referenceNumber?: string;
  timestamp: string;
  isRead: boolean;
  adminRecipients?: string[];
  recipientEmails?: string[];
  emailStatus?: 'Sent' | 'Delivered' | 'Pending';
}

export type OrderTypeCategory = 'Booking Inquiry' | 'Custom Trip' | 'Deposit Record' | 'Contact Order' | 'Direct Order';
export type OrderPaymentStatus = 'Unpaid' | 'Deposit Requested' | 'Deposit Paid' | 'Paid in Full' | 'Refunded';
export type OrderWorkflowStatus = 'New' | 'Contacted' | 'Pending' | 'Deposit Received' | 'Proposal Sent' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface AdminOrderExcelRecord {
  id: string;
  orderRef: string;
  receivedAt: string;
  orderType: OrderTypeCategory;
  customerName: string;
  email: string;
  phone: string;
  parishOrCountry: string;
  tripOrDestination: string;
  travelDates: string;
  adultsCount: number;
  childrenCount: number;
  budget?: string;
  numericalBudget?: number;
  totalPrice: number;
  depositPaid: number;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderWorkflowStatus;
  preferredContact: 'WhatsApp' | 'Phone' | 'Email';
  assignedAdmin: string;
  ambassadorCode?: string;
  specialRequests?: string;
  inclusions?: string;
  adminNotes: string;
  originLocation?: string;
  flightPricingStatus?: 'Estimated' | 'Manual Flight Pricing Required';
  estimatedMinimumBudgetUSD?: number;
  flightRouteMatched?: string;
  lastUpdated?: string;
}

// Origin & Flight Pricing Engine Interfaces
export interface AirportRecord {
  id: string;
  country: string;
  city: string;
  code: string; // e.g. KIN, MBJ, JFK, MIA, ATL, FLL, MCO, YYZ, LHR
  name: string; // e.g. Norman Manley International Airport
  isMajorHub?: boolean;
}

export type CabinClassType = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export interface OriginPricingRoute {
  id: string;
  originCountry: string;
  originCity: string;
  originAirportCode: string; // e.g. KIN
  destinationCountry: string; // e.g. Colombia
  destinationCity: string; // e.g. Bogotá, or 'All Cities'
  destinationAirportCode?: string; // e.g. BOG, or 'ALL'
  estimatedRoundtripUSD: number; // e.g. 580
  checkedBagFeeUSD?: number; // e.g. 45
  carryOnIncluded: boolean;
  cabinClassMultipliers?: {
    Economy: number;
    PremiumEconomy: number;
    Business: number;
    First: number;
  };
  oneWayMultiplier?: number;
  seasonalMultiplier?: number;
  isActive: boolean;
  notes?: string;
}

export interface ServiceCostRules {
  accommodationPerNight: {
    Budget: number;
    Standard: number;
    Premium: number;
    Luxury: number;
    VIP: number;
  };
  mealsPerPersonPerDay: {
    Budget: number;
    Standard: number;
    Premium: number;
    Luxury: number;
    VIP: number;
  };
  airportTransfersRoundtrip: number;
  transfersCostType: 'per_booking' | 'per_vehicle' | 'per_person';
  excursionsAllowancePerPerson: {
    Budget: number;
    Standard: number;
    Premium: number;
    Luxury: number;
    VIP: number;
  };
  travelDocumentsFee: number;
  otherServicesFee: number;
  taxesAndFeesPercentage: number;
}

export interface CurrencyRecord {
  code: string;
  name: string;
  symbol: string;
  rateFromUSD: number;
  isDefault?: boolean;
}
