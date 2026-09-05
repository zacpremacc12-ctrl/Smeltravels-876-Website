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
  featuredImage: string;
  gallery: string[];
  status: TripStatus;
  isFeatured?: boolean;
  is2026Featured?: boolean;
  is2027Collection?: boolean;
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
  subject: string;
  message: string;
  interestedTrip?: string;
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

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryPhone: string;
  primaryEmail: string;
  ambassadorName: string;
  ambassadorTitle: string;
  ambassadorPhone: string;
  ambassadorEmail: string;
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
}

export type AdminRole = 'Super Admin' | 'Content Manager' | 'Booking Manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}
