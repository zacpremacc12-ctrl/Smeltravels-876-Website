import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ContactSubmission,
  NewsletterSubscriber,
  AdminUser,
  AdminRole,
  TravelerUser,
  TravelerDepositRecord,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TRIPS,
  INITIAL_DESTINATIONS,
  INITIAL_FAQS,
  INITIAL_BLOG_POSTS,
  INITIAL_OFFERS,
  INITIAL_TESTIMONIALS,
  INITIAL_MEDIA,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
} from '../data/initialData';

interface AppContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
  
  trips: TripPackage[];
  addTrip: (trip: Omit<TripPackage, 'id'>) => void;
  updateTrip: (id: string, trip: Partial<TripPackage>) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => void;
  
  destinations: Destination[];
  addDestination: (dest: Omit<Destination, 'id'>) => void;
  updateDestination: (id: string, dest: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  saveDestination: (dest: Destination) => void;
  
  bookings: BookingSubmission[];
  createBooking: (booking: Omit<BookingSubmission, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'internalNotes'>) => string;
  updateBookingStatus: (id: string, status: BookingSubmission['status'], note?: string) => void;
  updateBookingPayment: (id: string, depositPaid: number, note?: string) => void;
  addBookingNote: (id: string, note: string) => void;
  
  contactSubmissions: ContactSubmission[];
  submitContactForm: (sub: Omit<ContactSubmission, 'id' | 'referenceNumber' | 'createdAt' | 'status'>) => string;
  
  customers: CustomerRecord[];
  addCustomerNote: (id: string, note: string) => void;
  
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  
  offers: OfferItem[];
  addOffer: (offer: Omit<OfferItem, 'id'>) => void;
  updateOffer: (id: string, offer: Partial<OfferItem>) => void;
  deleteOffer: (id: string) => void;
  
  testimonials: TestimonialItem[];
  addTestimonial: (test: Omit<TestimonialItem, 'id'>) => void;
  updateTestimonial: (id: string, test: Partial<TestimonialItem>) => void;
  deleteTestimonial: (id: string) => void;
  
  faqs: FAQItem[];
  addFaq: (faq: Omit<FAQItem, 'id'>) => void;
  updateFaq: (id: string, faq: Partial<FAQItem>) => void;
  deleteFaq: (id: string) => void;
  
  mediaList: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => void;
  deleteMediaItem: (id: string) => void;
  
  subscribers: NewsletterSubscriber[];
  subscribeNewsletter: (firstName: string, email: string) => boolean;
  unsubscribeNewsletter: (email: string) => void;
  
  // Admin & View State
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  currentAdminRole: AdminRole;
  loginAdmin: (role?: AdminRole) => void;
  loginAdminWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;

  // Traveler Account Authentication
  currentUser: TravelerUser | null;
  loginUser: (email: string, name?: string, phone?: string) => boolean;
  signupUser: (name: string, email: string, phone?: string, homeParishOrCountry?: string) => boolean;
  logoutUser: () => void;
  recordUserDeposit: (deposit: TravelerDepositRecord, userEmail?: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  
  // Notifications & UI states
  activeNotification: { title: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  notification: { title: string; message: string; type?: 'success' | 'info' | 'warning' | 'error' } | null;
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clearNotification: () => void;
  
  // Search state
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Quick View modals
  selectedTripForBooking: TripPackage | null;
  setSelectedTripForBooking: (trip: TripPackage | null) => void;
  selectedTripForInquiry: TripPackage | null;
  setSelectedTripForInquiry: (trip: TripPackage | null) => void;
  selectedTripDetail: TripPackage | null;
  setSelectedTripDetail: (trip: TripPackage | null) => void;
  
  // Navigation helper
  activePage: string;
  navigateTo: (page: string, param?: string) => void;
  pageParam: string | null;

  // Additional Admin actions
  deleteBooking: (id: string) => void;
  saveTrip: (trip: TripPackage) => void;
  saveBlogPost: (post: BlogPost) => void;
  saveFaq: (faq: FAQItem) => void;
  saveOffer: (offer: OfferItem) => void;
  saveTestimonial: (test: TestimonialItem) => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'smeltravels876_v2_';

function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredItem('settings', INITIAL_SETTINGS));
  const [trips, setTrips] = useState<TripPackage[]>(() => {
    const loaded = getStoredItem('trips', INITIAL_TRIPS);
    return loaded.map((t) => {
      if (t.id === 'panama-2026' && (t.price === 140000 || t.deposit === 71050)) {
        return { ...t, price: 152303, deposit: 83353 };
      }
      return t;
    });
  });
  const [destinations, setDestinations] = useState<Destination[]>(() => getStoredItem('destinations', INITIAL_DESTINATIONS));
  const [bookings, setBookings] = useState<BookingSubmission[]>(() => getStoredItem('bookings', INITIAL_BOOKINGS));
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => getStoredItem('contacts', []));
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => getStoredItem('customers', INITIAL_CUSTOMERS));
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getStoredItem('blog', INITIAL_BLOG_POSTS));
  const [offers, setOffers] = useState<OfferItem[]>(() => getStoredItem('offers', INITIAL_OFFERS));
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => getStoredItem('testimonials', INITIAL_TESTIMONIALS));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getStoredItem('faqs', INITIAL_FAQS));
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => getStoredItem('media', INITIAL_MEDIA));
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => getStoredItem('subscribers', [
    { id: 'sub-1', firstName: 'Kadeen', email: 'kadeen.campbell@example.com', subscribedAt: '2026-08-10', isActive: true, source: 'Website Footer' }
  ]));

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => getStoredItem('admin_logged', false));
  const [adminEmail, setAdminEmail] = useState<string | null>(() => getStoredItem('admin_email', null));
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>(() => getStoredItem('admin_role', 'Super Admin'));

  // Notification state
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Traveler authentication state
  const [currentUser, setCurrentUser] = useState<TravelerUser | null>(() => {
    return getStoredItem<TravelerUser | null>('traveler_user', null);
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Modals & Navigation state
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<TripPackage | null>(null);
  const [selectedTripForInquiry, setSelectedTripForInquiry] = useState<TripPackage | null>(null);
  const [selectedTripDetail, setSelectedTripDetail] = useState<TripPackage | null>(null);
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => { setStoredItem('settings', settings); }, [settings]);
  useEffect(() => { setStoredItem('trips', trips); }, [trips]);
  useEffect(() => { setStoredItem('destinations', destinations); }, [destinations]);
  useEffect(() => { setStoredItem('bookings', bookings); }, [bookings]);
  useEffect(() => { setStoredItem('contacts', contactSubmissions); }, [contactSubmissions]);
  useEffect(() => { setStoredItem('customers', customers); }, [customers]);
  useEffect(() => { setStoredItem('blog', blogPosts); }, [blogPosts]);
  useEffect(() => { setStoredItem('offers', offers); }, [offers]);
  useEffect(() => { setStoredItem('testimonials', testimonials); }, [testimonials]);
  useEffect(() => { setStoredItem('faqs', faqs); }, [faqs]);
  useEffect(() => { setStoredItem('media', mediaList); }, [mediaList]);
  useEffect(() => { setStoredItem('subscribers', subscribers); }, [subscribers]);
  useEffect(() => { setStoredItem('admin_logged', isAdminLoggedIn); }, [isAdminLoggedIn]);
  useEffect(() => { setStoredItem('admin_email', adminEmail); }, [adminEmail]);
  useEffect(() => { setStoredItem('admin_role', currentAdminRole); }, [currentAdminRole]);
  useEffect(() => { setStoredItem('traveler_user', currentUser); }, [currentUser]);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => {
      setActiveNotification((prev) => (prev?.title === title ? null : prev));
    }, 5000);
  };

  const clearNotification = () => setActiveNotification(null);

  const navigateTo = (page: string, param?: string) => {
    setActivePage(page);
    setPageParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Settings
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showNotification('Settings Updated', 'Website configurations were successfully saved.');
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
    showNotification('Settings Reset', 'Website configurations reverted to initial settings.');
  };

  // Trips
  const addTrip = (tripData: Omit<TripPackage, 'id'>) => {
    const id = `trip-${Date.now()}`;
    const newTrip: TripPackage = { ...tripData, id };
    setTrips(prev => [newTrip, ...prev]);
    showNotification('Trip Created', `Successfully added "${newTrip.name}".`);
  };

  const updateTrip = (id: string, tripData: Partial<TripPackage>) => {
    setTrips(prev => prev.map(t => (t.id === id ? { ...t, ...tripData } : t)));
    showNotification('Trip Updated', 'Package details were successfully saved.');
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    showNotification('Trip Deleted', 'Trip was removed from the system.', 'warning');
  };

  const duplicateTrip = (id: string) => {
    const existing = trips.find(t => t.id === id);
    if (!existing) return;
    const duplicated: TripPackage = {
      ...existing,
      id: `trip-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      slug: `${existing.slug}-copy`,
      isFeatured: false,
    };
    setTrips(prev => [duplicated, ...prev]);
    showNotification('Trip Duplicated', `Created a copy of ${existing.name}.`);
  };

  // Destinations
  const addDestination = (destData: Omit<Destination, 'id'>) => {
    const newDest: Destination = { ...destData, id: `dest-${Date.now()}` };
    setDestinations(prev => [...prev, newDest]);
    showNotification('Destination Added', `Added ${newDest.name} to directory.`);
  };

  const updateDestination = (id: string, destData: Partial<Destination>) => {
    setDestinations(prev => prev.map(d => (d.id === id ? { ...d, ...destData } : d)));
    showNotification('Destination Updated', 'Destination profile updated.');
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
    showNotification('Destination Deleted', 'Destination was removed.', 'warning');
  };

  // Bookings & Inquiries
  const createBooking = (data: Omit<BookingSubmission, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'internalNotes'>): string => {
    const now = new Date();
    const yearPrefix = now.getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ref = `ST-${yearPrefix}-${randomSuffix}`;
    const id = `booking-${Date.now()}`;

    const newBooking: BookingSubmission = {
      ...data,
      id,
      referenceNumber: ref,
      internalNotes: [`Submission received via website on ${now.toLocaleString()}`],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);

    // Upsert Customer
    setCustomers(prev => {
      const existing = prev.find(c => c.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? {
                ...c,
                tripsOfInterest: Array.from(new Set([...c.tripsOfInterest, data.tripName])),
                inquiryCount: c.inquiryCount + 1,
                bookingCount: data.travelInterestType === 'ready_to_book' ? c.bookingCount + 1 : c.bookingCount,
              }
            : c
        );
      } else {
        const newCustomer: CustomerRecord = {
          id: `cust-${Date.now()}`,
          name: data.customerName,
          email: data.email,
          phone: data.phone,
          countryOrParish: data.countryOrParish,
          tripsOfInterest: [data.tripName],
          bookingCount: data.travelInterestType === 'ready_to_book' ? 1 : 0,
          inquiryCount: 1,
          totalSpent: 0,
          notes: [`Inquired about ${data.tripName} with reference ${ref}`],
          status: data.travelInterestType === 'ready_to_book' ? 'Active Traveler' : 'Lead',
          communicationPreference: data.preferredContactMethod,
          createdAt: now.toISOString().split('T')[0],
        };
        return [newCustomer, ...prev];
      }
    });

    return ref;
  };

  const updateBookingStatus = (id: string, status: BookingSubmission['status'], note?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const newNotes = note
          ? [...b.internalNotes, `[${new Date().toLocaleDateString()}] Status updated to "${status}": ${note}`]
          : [...b.internalNotes, `[${new Date().toLocaleDateString()}] Status updated to "${status}"`];
        return {
          ...b,
          status,
          internalNotes: newNotes,
          updatedAt: now,
        };
      })
    );
    showNotification('Booking Updated', `Reference status updated to "${status}".`);
  };

  const updateBookingPayment = (id: string, depositPaid: number, note?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const noteText = `Payment record updated: $${depositPaid.toLocaleString()} JMD recorded. ${note || ''}`;
        return {
          ...b,
          depositPaid,
          status: depositPaid >= b.depositPaid && depositPaid > 0 ? 'Deposit Received' : b.status,
          internalNotes: [...b.internalNotes, `[${new Date().toLocaleDateString()}] ${noteText}`],
          updatedAt: now,
        };
      })
    );
    showNotification('Payment Recorded', `Updated deposit payments for booking.`);
  };

  const addBookingNote = (id: string, note: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, internalNotes: [...b.internalNotes, note] } : b))
    );
  };

  // Contacts
  const submitContactForm = (subData: Omit<ContactSubmission, 'id' | 'referenceNumber' | 'createdAt' | 'status'>): string => {
    const ref = `INQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newContact: ContactSubmission = {
      ...subData,
      id: `contact-${Date.now()}`,
      referenceNumber: ref,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    setContactSubmissions(prev => [newContact, ...prev]);
    return ref;
  };

  // Customers
  const addCustomerNote = (id: string, note: string) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, notes: [...c.notes, note] } : c))
    );
  };

  // Blog
  const addBlogPost = (postData: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = { ...postData, id: `blog-${Date.now()}` };
    setBlogPosts(prev => [newPost, ...prev]);
    showNotification('Article Published', `"${newPost.title}" was saved.`);
  };

  const updateBlogPost = (id: string, postData: Partial<BlogPost>) => {
    setBlogPosts(prev => prev.map(p => (p.id === id ? { ...p, ...postData } : p)));
    showNotification('Article Updated', 'Travel guide updated.');
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(p => p.id !== id));
    showNotification('Article Deleted', 'Post removed.', 'warning');
  };

  // Offers
  const addOffer = (offerData: Omit<OfferItem, 'id'>) => {
    const newOffer: OfferItem = { ...offerData, id: `offer-${Date.now()}` };
    setOffers(prev => [newOffer, ...prev]);
    showNotification('Offer Created', 'New promotion was published.');
  };

  const updateOffer = (id: string, offerData: Partial<OfferItem>) => {
    setOffers(prev => prev.map(o => (o.id === id ? { ...o, ...offerData } : o)));
    showNotification('Offer Updated', 'Promotion updated.');
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    showNotification('Offer Deleted', 'Promotion removed.', 'warning');
  };

  // Testimonials
  const addTestimonial = (testData: Omit<TestimonialItem, 'id'>) => {
    const newTest: TestimonialItem = { ...testData, id: `test-${Date.now()}` };
    setTestimonials(prev => [newTest, ...prev]);
    showNotification('Testimonial Added', 'Customer review saved.');
  };

  const updateTestimonial = (id: string, testData: Partial<TestimonialItem>) => {
    setTestimonials(prev => prev.map(t => (t.id === id ? { ...t, ...testData } : t)));
    showNotification('Testimonial Updated', 'Review details updated.');
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    showNotification('Testimonial Deleted', 'Review removed.', 'warning');
  };

  // FAQs
  const addFaq = (faqData: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = { ...faqData, id: `faq-${Date.now()}` };
    setFaqs(prev => [...prev, newFaq]);
    showNotification('FAQ Added', 'Question and answer published.');
  };

  const updateFaq = (id: string, faqData: Partial<FAQItem>) => {
    setFaqs(prev => prev.map(f => (f.id === id ? { ...f, ...faqData } : f)));
    showNotification('FAQ Updated', 'FAQ item updated.');
  };

  const deleteFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    showNotification('FAQ Deleted', 'FAQ removed.', 'warning');
  };

  // Media
  const addMediaItem = (itemData: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: `media-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMediaList(prev => [newItem, ...prev]);
    showNotification('Media Uploaded', 'Image added to media library.');
  };

  const deleteMediaItem = (id: string) => {
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  // Newsletter
  const subscribeNewsletter = (firstName: string, email: string): boolean => {
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) return false;
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      firstName,
      email,
      subscribedAt: new Date().toISOString().split('T')[0],
      isActive: true,
      source: 'Website Newsletter Form'
    };
    setSubscribers(prev => [newSub, ...prev]);
    return true;
  };

  const unsubscribeNewsletter = (email: string) => {
    setSubscribers(prev => prev.map(s => (s.email.toLowerCase() === email.toLowerCase() ? { ...s, isActive: false } : s)));
    showNotification('Unsubscribed', `${email} has been unsubscribed from travel updates.`, 'info');
  };

  // Admin Auth - Email & Password Protected
  const REQUIRED_ADMIN_EMAIL = 'zbuchanan.smeltravels@gmail.com';
  const REQUIRED_ADMIN_PASSWORD = 'Jjrrss5521';

  const loginAdmin = (role: AdminRole = 'Super Admin') => {
    setIsAdminLoggedIn(true);
    setAdminEmail(REQUIRED_ADMIN_EMAIL);
    setCurrentAdminRole(role);
    showNotification('Admin Authenticated', `Logged into SMELTRAVELS876 CMS as ${role}.`);
  };

  const loginAdminWithCredentials = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (cleanEmail === REQUIRED_ADMIN_EMAIL.toLowerCase() && cleanPassword === REQUIRED_ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setAdminEmail(REQUIRED_ADMIN_EMAIL);
      setCurrentAdminRole('Super Admin');
      showNotification('Access Granted', `Welcome back, Administrator (${REQUIRED_ADMIN_EMAIL}).`);
      return { success: true };
    } else {
      showNotification('Access Denied', 'Invalid administrator email or password.', 'warning');
      return { 
        success: false, 
        error: 'Invalid administrator email or password. Please verify your credentials.' 
      };
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    showNotification('Admin Panel Locked', 'Safely signed out. Admin panel is password protected.', 'info');
  };

  // Traveler Auth & Account Methods
  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const loginUser = (email: string, name?: string, phone?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const existingCustomer = customers.find(c => c.email.toLowerCase() === cleanEmail);
    const resolvedName = name?.trim() || (existingCustomer ? existingCustomer.name : cleanEmail.split('@')[0].replace(/[._]/g, ' '));
    const formattedName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);

    const user: TravelerUser = {
      id: existingCustomer ? existingCustomer.id : `traveler-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      phone: phone || (existingCustomer ? existingCustomer.phone : ''),
      homeParishOrCountry: existingCustomer ? existingCustomer.countryOrParish : 'Jamaica',
      memberSince: new Date().getFullYear().toString(),
    };

    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showNotification('Welcome Back!', `Signed in as ${user.name}`);
    return true;
  };

  const signupUser = (name: string, email: string, phone?: string, homeParishOrCountry?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const user: TravelerUser = {
      id: `traveler-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || '',
      homeParishOrCountry: homeParishOrCountry?.trim() || 'Jamaica',
      memberSince: new Date().getFullYear().toString(),
    };

    setCurrentUser(user);
    // Also record traveler in customer leads for agency
    setCustomers(prev => {
      if (prev.some(c => c.email.toLowerCase() === cleanEmail)) return prev;
      const newCustomer: CustomerRecord = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        countryOrParish: user.homeParishOrCountry || 'Jamaica',
        tripsOfInterest: ['Panama 2026', 'Antigua 2027'],
        bookingCount: 0,
        inquiryCount: 0,
        totalSpent: 0,
        notes: ['Registered via Web Portal.'],
        status: 'Active Traveler',
        communicationPreference: 'whatsapp',
        createdAt: new Date().toISOString(),
      };
      return [newCustomer, ...prev];
    });

    setIsAuthModalOpen(false);
    showNotification('Account Created!', `Welcome to SMELTRAVELS876, ${user.name}!`);
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showNotification('Signed Out', 'You have been safely signed out.');
  };

  const recordUserDeposit = (deposit: TravelerDepositRecord, userEmail?: string) => {
    const now = new Date();
    setCurrentUser(prev => {
      if (!prev) return null;
      const isFirst = !prev.firstDeposit;
      const prevDeposits = prev.deposits || [];
      const updatedUser: TravelerUser = {
        ...prev,
        firstDeposit: isFirst ? deposit : prev.firstDeposit,
        deposits: [deposit, ...prevDeposits],
      };
      setStoredItem('traveler_user', updatedUser);
      return updatedUser;
    });

    // Also update in customers table
    const targetEmail = (currentUser?.email || userEmail || deposit.bookingRef).toLowerCase();
    setCustomers(prev =>
      prev.map(c => {
        if (c.email.toLowerCase() === targetEmail) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + deposit.amount,
            notes: [
              ...c.notes,
              `[${now.toLocaleDateString()}] Deposit recorded: $${deposit.amount.toLocaleString()} JMD for ${deposit.tripName} (Ref: ${deposit.bookingRef})`,
            ],
            status: 'Active Traveler',
          };
        }
        return c;
      })
    );
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showNotification('Inquiry Removed', 'Booking inquiry deleted from records.', 'info');
  };

  const saveTrip = (trip: TripPackage) => {
    setTrips(prev => {
      const idx = prev.findIndex(t => t.id === trip.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = trip;
        return updated;
      }
      return [trip, ...prev];
    });
  };

  const saveDestination = (dest: Destination) => {
    setDestinations(prev => {
      const idx = prev.findIndex(d => d.id === dest.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = dest;
        return updated;
      }
      return [dest, ...prev];
    });
  };

  const saveBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => {
      const idx = prev.findIndex(p => p.id === post.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = post;
        return updated;
      }
      return [post, ...prev];
    });
  };

  const saveFaq = (faq: FAQItem) => {
    setFaqs(prev => {
      const idx = prev.findIndex(f => f.id === faq.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = faq;
        return updated;
      }
      return [...prev, faq];
    });
  };

  const saveOffer = (offer: OfferItem) => {
    setOffers(prev => {
      const idx = prev.findIndex(o => o.id === offer.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = offer;
        return updated;
      }
      return [...prev, offer];
    });
  };

  const saveTestimonial = (test: TestimonialItem) => {
    setTestimonials(prev => {
      const idx = prev.findIndex(t => t.id === test.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = test;
        return updated;
      }
      return [test, ...prev];
    });
  };

  const resetToInitialData = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setTrips(INITIAL_TRIPS);
    setDestinations(INITIAL_DESTINATIONS);
    setBookings(INITIAL_BOOKINGS);
    setBlogPosts(INITIAL_BLOG_POSTS);
    setOffers(INITIAL_OFFERS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setFaqs(INITIAL_FAQS);
    showNotification('System Reset', 'All demo data has been restored.');
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        saveTrip,
        destinations,
        addDestination,
        updateDestination,
        deleteDestination,
        saveDestination,
        bookings,
        createBooking,
        updateBookingStatus,
        updateBookingPayment,
        addBookingNote,
        deleteBooking,
        contactSubmissions,
        submitContactForm,
        customers,
        addCustomerNote,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        saveBlogPost,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        saveOffer,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        saveTestimonial,
        faqs,
        addFaq,
        updateFaq,
        deleteFaq,
        saveFaq,
        mediaList,
        addMediaItem,
        deleteMediaItem,
        subscribers,
        subscribeNewsletter,
        unsubscribeNewsletter,
        isAdminLoggedIn,
        adminEmail,
        currentAdminRole,
        loginAdmin,
        loginAdminWithCredentials,
        logoutAdmin,
        currentUser,
        loginUser,
        signupUser,
        logoutUser,
        recordUserDeposit,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        activeNotification,
        notification: activeNotification,
        showNotification,
        clearNotification,
        isSearchOpen,
        setIsSearchOpen,
        selectedTripForBooking,
        setSelectedTripForBooking,
        selectedTripForInquiry,
        setSelectedTripForInquiry,
        selectedTripDetail,
        setSelectedTripDetail,
        activePage,
        navigateTo,
        pageParam,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Formatting helpers
export const formatPriceJMD = (amount: number): string => {
  return `$${amount.toLocaleString()} JMD`;
};
