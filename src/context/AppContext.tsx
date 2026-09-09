import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  AdminInboxItem,
  Ambassador,
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
  INITIAL_ADMIN_INBOX,
} from '../data/initialData';
import {
  pushSiteContentToRTDB,
  pushFullSiteContentToRTDB,
  fetchSiteContentFromRTDB,
  subscribeToSiteContent,
} from '../lib/firebase';

interface AppContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
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

  // Admin Inbox
  adminInbox: AdminInboxItem[];
  addInboxItem: (item: Omit<AdminInboxItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markInboxItemAsRead: (id: string) => void;
  markAllInboxAsRead: () => void;
  deleteInboxItem: (id: string) => void;
  unreadInboxCount: number;

  // Bookmarks / Saved Trips
  savedTripIds: string[];
  savedTrips: TripPackage[];
  toggleSaveTrip: (tripId: string) => void;
  isTripSaved: (tripId: string) => boolean;
  isSavedTripsDrawerOpen: boolean;
  setIsSavedTripsDrawerOpen: (open: boolean) => void;
  openSavedTripsDrawer: () => void;
  closeSavedTripsDrawer: () => void;

  // Force Auth / Spot Booking Flow
  secureSpotForTrip: (trip: TripPackage) => void;
  pendingTripForBooking: TripPackage | null;
  setPendingTripForBooking: (trip: TripPackage | null) => void;
  authNotice: string | null;
  setAuthNotice: (notice: string | null) => void;

  // Ambassador Code & Discount Helpers
  verifyAmbassadorCode: (code: string) => { valid: boolean; ambassador?: Ambassador; discountPercentage: number };

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

  // Review submission modal state
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;

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
  applyFirestoreContent: (data: any) => void;
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
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const loaded = getStoredItem('settings', INITIAL_SETTINGS);
    const hasCanonical4 = Array.isArray(loaded.ambassadors) &&
      loaded.ambassadors.length === 4 &&
      loaded.ambassadors.some((a: Ambassador) => a.email === 'zbuchanan.smeltravels@gmail.com') &&
      loaded.ambassadors.some((a: Ambassador) => a.email === 'jvirgo.smeltravels@gmail.com') &&
      loaded.ambassadors.some((a: Ambassador) => a.email === 'sdavis.smeltravels@gmail.com') &&
      loaded.ambassadors.some((a: Ambassador) => a.email === 'smeltravels876@gmail.com');

    if (!hasCanonical4) {
      return {
        ...loaded,
        ambassadorName: INITIAL_SETTINGS.ambassadorName,
        ambassadorTitle: INITIAL_SETTINGS.ambassadorTitle,
        ambassadorPhone: INITIAL_SETTINGS.ambassadorPhone,
        ambassadorEmail: INITIAL_SETTINGS.ambassadorEmail,
        ambassadors: INITIAL_SETTINGS.ambassadors,
        requireAmbassadorSelection: true,
      };
    }
    const updatedAmbassadors = (loaded.ambassadors as Ambassador[]).map((a) => {
      if (a.email === 'jvirgo.smeltravels@gmail.com' && a.phone !== '(876) 566-6923') {
        return { ...a, phone: '(876) 566-6923' };
      }
      if (a.email === 'sdavis.smeltravels@gmail.com' && a.phone !== '(876) 276-1310') {
        return { ...a, phone: '(876) 276-1310' };
      }
      return a;
    });
    return {
      ...loaded,
      ambassadors: updatedAmbassadors,
      requireAmbassadorSelection: loaded.requireAmbassadorSelection ?? true,
    };
  });
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

  // Admin Inbox state
  const [adminInbox, setAdminInbox] = useState<AdminInboxItem[]>(() => {
    return getStoredItem('admin_inbox', INITIAL_ADMIN_INBOX);
  });

  // Bookmarked / Saved trips state
  const [savedTripIds, setSavedTripIds] = useState<string[]>(() => {
    return getStoredItem('saved_trips', ['panama-2026']);
  });
  const [isSavedTripsDrawerOpen, setIsSavedTripsDrawerOpen] = useState<boolean>(false);

  // Forced Auth for Spot Booking state
  const [pendingTripForBooking, setPendingTripForBooking] = useState<TripPackage | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => getStoredItem('admin_logged', false));
  const [adminEmail, setAdminEmail] = useState<string | null>(() => getStoredItem('admin_email', null));
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>(() => getStoredItem('admin_role', 'Super Admin'));

  // Notification state
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => setIsReviewModalOpen(false);

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
  useEffect(() => { setStoredItem('admin_inbox', adminInbox); }, [adminInbox]);
  useEffect(() => { setStoredItem('saved_trips', savedTripIds); }, [savedTripIds]);
  useEffect(() => { setStoredItem('admin_logged', isAdminLoggedIn); }, [isAdminLoggedIn]);
  useEffect(() => { setStoredItem('admin_email', adminEmail); }, [adminEmail]);
  useEffect(() => { setStoredItem('admin_role', currentAdminRole); }, [currentAdminRole]);
  useEffect(() => { setStoredItem('traveler_user', currentUser); }, [currentUser]);

  // Centralized state updater for live website feed updates
  const applyFirestoreContent = (d: any) => {
    if (!d || typeof d !== 'object') return;
    if (d.settings && typeof d.settings === 'object') {
      setSettings(prev => ({
        ...prev,
        ...d.settings,
        ambassadors: Array.isArray(d.settings.ambassadors) && d.settings.ambassadors.length > 0
          ? d.settings.ambassadors
          : prev.ambassadors,
      }));
    }
    const tripsArray = (Array.isArray(d.trips) && d.trips) || (Array.isArray(d.packages) && d.packages) || (Array.isArray(d.travelPackages) && d.travelPackages);
    if (tripsArray) setTrips(tripsArray);
    if (d.destinations && Array.isArray(d.destinations)) setDestinations(d.destinations);
    if (d.bookings && Array.isArray(d.bookings)) setBookings(d.bookings);
    if (d.contacts && Array.isArray(d.contacts)) setContactSubmissions(d.contacts);
    if (d.customers && Array.isArray(d.customers)) setCustomers(d.customers);
    if (d.blog && Array.isArray(d.blog)) setBlogPosts(d.blog);
    if (d.offers && Array.isArray(d.offers)) setOffers(d.offers);
    if (d.testimonials && Array.isArray(d.testimonials)) setTestimonials(d.testimonials);
    if (d.faqs && Array.isArray(d.faqs)) setFaqs(d.faqs);
    if (d.adminInbox && Array.isArray(d.adminInbox)) setAdminInbox(d.adminInbox);
    if (d.media && Array.isArray(d.media)) setMediaList(d.media);
  };

  const applyServerData = applyFirestoreContent;

  // Real-time Realtime Database '/siteContent' listener & initial fetch
  useEffect(() => {
    fetchSiteContentFromRTDB().then((data) => {
      if (data) {
        applyFirestoreContent(data);
      }
    });

    const unsubscribe = subscribeToSiteContent((realtimeData) => {
      if (realtimeData) {
        applyFirestoreContent(realtimeData);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Helper to persist admin changes directly to Firebase Realtime Database path '/siteContent'
  const syncToLiveServer = async (payload: Record<string, any>): Promise<boolean> => {
    try {
      // Instant cross-tab broadcast within the browser (0ms delay)
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const ch = new BroadcastChannel('smeltravels_live_feed');
          ch.postMessage({ type: 'LIVE_FEED_SYNC', payload });
          ch.close();
        }
      } catch (e) {}

      // Push directly to Realtime Database '/siteContent' path using native SDK set
      const ok = await pushFullSiteContentToRTDB(payload);
      return ok;
    } catch (e) {
      console.error('[RTDB Save Error]:', e);
      return false;
    }
  };

  // Cross-tab broadcast receiver for instantaneous same-browser tab-to-tab sync
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('smeltravels_live_feed');
        channel.onmessage = (event) => {
          if (event.data?.type === 'LIVE_FEED_SYNC' && event.data?.payload) {
            applyFirestoreContent(event.data.payload);
          }
        };
      }
    } catch (e) {}

    return () => {
      channel?.close();
    };
  }, []);

  // Listen for storage events (e.g. from other tabs) or custom sync events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(parsed);
        } catch (err) {}
      }
    };
    const handleCustomSync = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('site-settings-updated', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('site-settings-updated', handleCustomSync);
    };
  }, []);

  // Auto-sync to LIVE WEBSITE FEED: When an administrator is logged in, any modification to site data
  // is automatically synchronized and published to the live backend server and live website feed.
  const isAdminActive = isAdminLoggedIn || (currentUser?.isAdmin ?? false);
  const adminSyncInitialRef = useRef(false);

  useEffect(() => {
    if (!adminSyncInitialRef.current) {
      adminSyncInitialRef.current = true;
      return;
    }
    if (isAdminActive) {
      const timer = setTimeout(() => {
        const payload = {
          settings,
          trips,
          destinations,
          offers,
          blog: blogPosts,
          testimonials,
          faqs,
          adminInbox,
          media: mediaList,
        };
        syncToLiveServer(payload);
        pushFullSiteContentToRTDB(payload);
        pushSiteContentToRTDB('packages', trips);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAdminActive, settings, trips, destinations, offers, blogPosts, testimonials, faqs, adminInbox, mediaList]);

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
  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    let updatedSnapshot: SiteSettings = settings;
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      updatedSnapshot = updated;
      setStoredItem('settings', updated);
      return updated;
    });

    // Broadcast instantaneous update across windows/tabs
    try {
      window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: updatedSnapshot }));
    } catch (e) {}

    // Push directly to Realtime Database '/siteContent' path
    await pushSiteContentToRTDB('settings', updatedSnapshot);
    await pushFullSiteContentToRTDB({ settings: updatedSnapshot });
    const isLiveSynced = await syncToLiveServer({ settings: updatedSnapshot });
    return isLiveSynced;
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
    syncToLiveServer({ settings: INITIAL_SETTINGS });
    showNotification('Settings Reset', 'Website configurations reverted to initial settings.');
  };

  // Trips
  const addTrip = (tripData: Omit<TripPackage, 'id'>) => {
    const id = `trip-${Date.now()}`;
    const newTrip: TripPackage = { ...tripData, id };
    setTrips(prev => {
      const updated = [newTrip, ...prev];
      syncToLiveServer({ trips: updated });
      return updated;
    });
    showNotification('Trip Created', `Successfully added "${newTrip.name}".`);
  };

  const updateTrip = (id: string, tripData: Partial<TripPackage>) => {
    setTrips(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, ...tripData } : t));
      syncToLiveServer({ trips: updated });
      return updated;
    });
    showNotification('Trip Updated', 'Package details were successfully saved.');
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => {
      const updated = prev.filter(t => t.id !== id);
      syncToLiveServer({ trips: updated });
      return updated;
    });
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
    setTrips(prev => {
      const updated = [duplicated, ...prev];
      syncToLiveServer({ trips: updated });
      return updated;
    });
    showNotification('Trip Duplicated', `Created a copy of ${existing.name}.`);
  };

  // Destinations
  const addDestination = (destData: Omit<Destination, 'id'>) => {
    const newDest: Destination = { ...destData, id: `dest-${Date.now()}` };
    setDestinations(prev => {
      const updated = [...prev, newDest];
      syncToLiveServer({ destinations: updated });
      return updated;
    });
    showNotification('Destination Added', `Added ${newDest.name} to directory.`);
  };

  const updateDestination = (id: string, destData: Partial<Destination>) => {
    setDestinations(prev => {
      const updated = prev.map(d => (d.id === id ? { ...d, ...destData } : d));
      syncToLiveServer({ destinations: updated });
      return updated;
    });
    showNotification('Destination Updated', 'Destination profile updated.');
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => {
      const updated = prev.filter(d => d.id !== id);
      syncToLiveServer({ destinations: updated });
      return updated;
    });
    showNotification('Destination Deleted', 'Destination was removed.', 'warning');
  };

  // Admin Inbox methods
  const addInboxItem = (itemData: Omit<AdminInboxItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newItem: AdminInboxItem = {
      ...itemData,
      id: `inbox-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setAdminInbox(prev => {
      const updated = [newItem, ...prev];
      syncToLiveServer({ adminInbox: updated });
      return updated;
    });
  };

  const markInboxItemAsRead = (id: string) => {
    setAdminInbox(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, isRead: true } : item);
      syncToLiveServer({ adminInbox: updated });
      return updated;
    });
  };

  const markAllInboxAsRead = () => {
    setAdminInbox(prev => {
      const updated = prev.map(item => ({ ...item, isRead: true }));
      syncToLiveServer({ adminInbox: updated });
      return updated;
    });
    showNotification('Inbox Updated', 'All inbox notifications marked as read.');
  };

  const deleteInboxItem = (id: string) => {
    setAdminInbox(prev => {
      const updated = prev.filter(item => item.id !== id);
      syncToLiveServer({ adminInbox: updated });
      return updated;
    });
    showNotification('Item Removed', 'Notification dismissed from inbox.', 'info');
  };

  const unreadInboxCount = adminInbox.filter(i => !i.isRead).length;

  // Bookmarks / Saved Trips methods
  const toggleSaveTrip = (tripId: string) => {
    setSavedTripIds(prev => {
      const exists = prev.includes(tripId);
      if (exists) {
        showNotification('Bookmark Removed', 'Trip removed from your saved list.', 'info');
        return prev.filter(id => id !== tripId);
      } else {
        const trip = trips.find(t => t.id === tripId);
        showNotification('Trip Bookmarked! 📌', `Saved "${trip ? trip.name : 'Trip'}" to your wishlist.`);
        return [...prev, tripId];
      }
    });
  };

  const isTripSaved = (tripId: string): boolean => {
    return savedTripIds.includes(tripId);
  };

  const savedTrips: TripPackage[] = trips.filter(t => savedTripIds.includes(t.id));

  const openSavedTripsDrawer = () => setIsSavedTripsDrawerOpen(true);
  const closeSavedTripsDrawer = () => setIsSavedTripsDrawerOpen(false);

  // Forced Authentication on Spot Booking
  const secureSpotForTrip = (trip: TripPackage) => {
    if (!currentUser) {
      setPendingTripForBooking(trip);
      setAuthNotice(`Please sign in or create an account to secure your spot for ${trip.name}.`);
      openAuthModal('signup');
    } else {
      setSelectedTripForBooking(trip);
    }
  };

  // Ambassador Code validation
  const verifyAmbassadorCode = (code: string) => {
    const clean = (code || '').trim().toUpperCase();
    const discountPct = settings.ambassadorDiscountPercentage ?? 10;
    const match = (settings.ambassadors || []).find(
      a => a.code && a.code.toUpperCase() === clean && a.isActive !== false
    );
    if (match) {
      return { valid: true, ambassador: match, discountPercentage: discountPct };
    }
    return { valid: false, discountPercentage: discountPct };
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

    setBookings(prev => {
      const updated = [newBooking, ...prev];
      syncToLiveServer({ bookings: updated });
      return updated;
    });

    // Notify Admin Inbox: Inquiry!
    addInboxItem({
      type: 'inquiry',
      title: `New Booking Inquiry: ${data.tripName}`,
      senderName: data.customerName,
      senderEmail: data.email,
      senderPhone: data.phone,
      summary: `Inquiry submitted for ${data.adultsCount} traveler(s). Interest: ${data.travelInterestType === 'ready_to_book' ? 'Ready to Book & Lock In Spot' : 'General Inquiry'}.`,
      details: data.specialRequests || `Travel Date: ${data.preferredTravelDate}. Preferred Contact: ${data.preferredContactMethod}. Total: $${data.totalPrice?.toLocaleString()} JMD.`,
      tripId: data.tripId,
      tripName: data.tripName,
      referenceNumber: ref,
    });

    // Upsert Customer
    setCustomers(prev => {
      const existing = prev.find(c => c.email.toLowerCase() === data.email.toLowerCase());
      let updatedCustomers: CustomerRecord[];
      if (existing) {
        updatedCustomers = prev.map(c =>
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
        updatedCustomers = [newCustomer, ...prev];
      }
      syncToLiveServer({ customers: updatedCustomers });
      return updatedCustomers;
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
    setContactSubmissions(prev => {
      const updated = [newContact, ...prev];
      syncToLiveServer({ contacts: updated });
      return updated;
    });

    // Notify Admin Inbox: Message!
    addInboxItem({
      type: 'message',
      title: `New Contact Message: ${subData.subject || 'Website Inquiry'}`,
      senderName: subData.name,
      senderEmail: subData.email,
      senderPhone: subData.phone,
      summary: `Inquiry from ${subData.name}: "${(subData.message || '').slice(0, 100)}..."`,
      details: subData.message,
      referenceNumber: ref,
    });

    return ref;
  };

  // Customers
  const addCustomerNote = (id: string, note: string) => {
    setCustomers(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, notes: [...c.notes, note] } : c));
      syncToLiveServer({ customers: updated });
      return updated;
    });
  };

  // Blog
  const addBlogPost = (postData: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = { ...postData, id: `blog-${Date.now()}` };
    setBlogPosts(prev => {
      const updated = [newPost, ...prev];
      syncToLiveServer({ blog: updated });
      return updated;
    });
    showNotification('Article Published', `"${newPost.title}" was saved.`);
  };

  const updateBlogPost = (id: string, postData: Partial<BlogPost>) => {
    setBlogPosts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...postData } : p));
      syncToLiveServer({ blog: updated });
      return updated;
    });
    showNotification('Article Updated', 'Travel guide updated.');
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => {
      const updated = prev.filter(p => p.id !== id);
      syncToLiveServer({ blog: updated });
      return updated;
    });
    showNotification('Article Deleted', 'Post removed.', 'warning');
  };

  // Offers
  const addOffer = (offerData: Omit<OfferItem, 'id'>) => {
    const newOffer: OfferItem = { ...offerData, id: `offer-${Date.now()}` };
    setOffers(prev => {
      const updated = [newOffer, ...prev];
      syncToLiveServer({ offers: updated });
      return updated;
    });
    showNotification('Offer Created', 'New promotion was published.');
  };

  const updateOffer = (id: string, offerData: Partial<OfferItem>) => {
    setOffers(prev => {
      const updated = prev.map(o => (o.id === id ? { ...o, ...offerData } : o));
      syncToLiveServer({ offers: updated });
      return updated;
    });
    showNotification('Offer Updated', 'Promotion updated.');
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => {
      const updated = prev.filter(o => o.id !== id);
      syncToLiveServer({ offers: updated });
      return updated;
    });
    showNotification('Offer Deleted', 'Promotion removed.', 'warning');
  };

  // Testimonials
  const addTestimonial = (testData: Omit<TestimonialItem, 'id'>) => {
    const newTest: TestimonialItem = { ...testData, id: `test-${Date.now()}` };
    setTestimonials(prev => {
      const updated = [newTest, ...prev];
      syncToLiveServer({ testimonials: updated });
      return updated;
    });

    // Notify Admin Inbox: Review!
    addInboxItem({
      type: 'review',
      title: `New Review: ${newTest.rating} Stars from ${newTest.customerName}`,
      senderName: newTest.customerName,
      summary: `Traveler rating: ${newTest.rating}★ for ${newTest.tripName}. "${newTest.reviewText.slice(0, 100)}..."`,
      details: newTest.reviewText,
      rating: newTest.rating,
      tripName: newTest.tripName,
    });

    showNotification('Testimonial Added', 'Customer review saved.');
  };

  const updateTestimonial = (id: string, testData: Partial<TestimonialItem>) => {
    setTestimonials(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, ...testData } : t));
      syncToLiveServer({ testimonials: updated });
      return updated;
    });
    showNotification('Testimonial Updated', 'Review details updated.');
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => {
      const updated = prev.filter(t => t.id !== id);
      syncToLiveServer({ testimonials: updated });
      return updated;
    });
    showNotification('Testimonial Deleted', 'Review removed.', 'warning');
  };

  // FAQs
  const addFaq = (faqData: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = { ...faqData, id: `faq-${Date.now()}` };
    setFaqs(prev => {
      const updated = [...prev, newFaq];
      syncToLiveServer({ faqs: updated });
      return updated;
    });
    showNotification('FAQ Added', 'Question and answer published.');
  };

  const updateFaq = (id: string, faqData: Partial<FAQItem>) => {
    setFaqs(prev => {
      const updated = prev.map(f => (f.id === id ? { ...f, ...faqData } : f));
      syncToLiveServer({ faqs: updated });
      return updated;
    });
    showNotification('FAQ Updated', 'FAQ item updated.');
  };

  const deleteFaq = (id: string) => {
    setFaqs(prev => {
      const updated = prev.filter(f => f.id !== id);
      syncToLiveServer({ faqs: updated });
      return updated;
    });
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
  const REQUIRED_ADMIN_EMAIL = 'smeltravels876@gmail.com';
  const REQUIRED_ADMIN_PASSWORD = 'Jjrrss5521';
  const ADMIN_AUTHORIZED_EMAILS = [
    'smeltravels876@gmail.com',
    'zbuchanan.smeltravels@gmail.com',
    'jvirgo.smeltravels@gmail.com',
    'sdavis.smeltravels@gmail.com',
    'zacpremacc12@gmail.com',
  ];

  const ADMIN_PROFILES: Record<string, { name: string; title: string; phone: string; role: AdminRole }> = {
    'smeltravels876@gmail.com': {
      name: 'Elvoy Bennett',
      title: 'CEO | SMELTRAVELS876',
      phone: '(876) 834-1537',
      role: 'Super Admin',
    },
    'zbuchanan.smeltravels@gmail.com': {
      name: 'Zachary Buchanan',
      title: 'Travel Ambassador',
      phone: '(876) 848-9772',
      role: 'Super Admin',
    },
    'jvirgo.smeltravels@gmail.com': {
      name: 'Jada Virgo',
      title: 'Travel Ambassador',
      phone: '(876) 566-6923',
      role: 'Super Admin',
    },
    'sdavis.smeltravels@gmail.com': {
      name: 'Shenoya Davis',
      title: 'Travel Ambassador',
      phone: '(876) 276-1310',
      role: 'Super Admin',
    },
    'zacpremacc12@gmail.com': {
      name: 'Zachary Buchanan',
      title: 'Travel Ambassador / Lead Admin',
      phone: '(876) 848-9772',
      role: 'Super Admin',
    },
  };

  // Keep Admin and User in sync: If admin is logged in, ensure currentUser reflects this
  useEffect(() => {
    if (isAdminLoggedIn) {
      const activeAdminProfile = (adminEmail && ADMIN_PROFILES[adminEmail.toLowerCase()]) || {
        name: adminEmail === 'smeltravels876@gmail.com' ? 'SMEL Travels 876 Admin' : 'Zachary Buchanan',
        title: 'Executive Travel Operations & CMS Director',
        phone: '(876) 848-9772',
        role: (currentAdminRole || 'Super Admin') as AdminRole,
      };

      setCurrentUser(prev => {
        if (!prev) {
          return {
            id: `admin-user-${(adminEmail || REQUIRED_ADMIN_EMAIL).replace(/[^a-z0-9]/gi, '-')}`,
            name: activeAdminProfile.name,
            email: adminEmail || REQUIRED_ADMIN_EMAIL,
            phone: activeAdminProfile.phone,
            homeParishOrCountry: 'Kingston, Jamaica',
            memberSince: '2026',
            isAdmin: true,
            adminRole: currentAdminRole || 'Super Admin',
          };
        } else if (!prev.isAdmin || prev.email !== (adminEmail || REQUIRED_ADMIN_EMAIL)) {
          return {
            ...prev,
            name: activeAdminProfile.name,
            email: adminEmail || REQUIRED_ADMIN_EMAIL,
            isAdmin: true,
            adminRole: currentAdminRole || 'Super Admin',
          };
        }
        return prev;
      });
    }
  }, [isAdminLoggedIn, adminEmail, currentAdminRole]);

  const loginAdmin = (role: AdminRole = 'Super Admin') => {
    const profile = ADMIN_PROFILES[REQUIRED_ADMIN_EMAIL] || {
      name: 'SMEL Travels 876 Admin',
      title: 'Executive Travel Operations',
      phone: '(876) 848-9772',
      role: 'Super Admin',
    };
    setIsAdminLoggedIn(true);
    setAdminEmail(REQUIRED_ADMIN_EMAIL);
    setCurrentAdminRole(role);
    setCurrentUser(prev => ({
      id: prev?.id || 'admin-user-smeltravels876',
      name: profile.name,
      email: REQUIRED_ADMIN_EMAIL,
      phone: profile.phone,
      homeParishOrCountry: prev?.homeParishOrCountry || 'Kingston, Jamaica',
      memberSince: prev?.memberSince || '2026',
      firstDeposit: prev?.firstDeposit,
      deposits: prev?.deposits,
      isAdmin: true,
      adminRole: role,
    }));
    showNotification('Admin Authenticated', `Signed in to SMELTRAVELS876 as ${role}.`);
  };

  const loginAdminWithCredentials = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const isMatchEmail = ADMIN_AUTHORIZED_EMAILS.includes(cleanEmail) || 
      cleanEmail === REQUIRED_ADMIN_EMAIL.toLowerCase() ||
      (settings.ambassadors || []).some(a => a.email && a.email.toLowerCase() === cleanEmail);

    if (isMatchEmail && cleanPassword === REQUIRED_ADMIN_PASSWORD) {
      const profile = ADMIN_PROFILES[cleanEmail] || {
        name: cleanEmail.includes('smeltravels876') ? 'SMEL Travels 876 Admin' : 'Zachary Buchanan',
        title: 'Executive Travel Operations',
        phone: '(876) 848-9772',
        role: 'Super Admin',
      };

      setIsAdminLoggedIn(true);
      setAdminEmail(cleanEmail);
      setCurrentAdminRole('Super Admin');
      setCurrentUser(prev => ({
        id: prev?.id || `admin-user-${cleanEmail.replace(/[^a-z0-9]/gi, '-')}`,
        name: profile.name,
        email: cleanEmail,
        phone: profile.phone,
        homeParishOrCountry: prev?.homeParishOrCountry || 'Kingston, Jamaica',
        memberSince: prev?.memberSince || '2026',
        firstDeposit: prev?.firstDeposit,
        deposits: prev?.deposits,
        isAdmin: true,
        adminRole: 'Super Admin',
      }));
      showNotification('Access Granted', `Welcome back, ${profile.name} (${cleanEmail}). Super Admin unlocked.`);
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
    setCurrentUser(prev => prev ? { ...prev, isAdmin: false } : null);
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

    const isSpecialAdmin = ADMIN_AUTHORIZED_EMAILS.includes(cleanEmail) ||
      cleanEmail === REQUIRED_ADMIN_EMAIL.toLowerCase() ||
      cleanEmail.includes('smeltravels') ||
      (settings.ambassadors || []).some(a => a.email && a.email.toLowerCase() === cleanEmail);

    const user: TravelerUser = {
      id: existingCustomer ? existingCustomer.id : `traveler-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      phone: phone || (existingCustomer ? existingCustomer.phone : ''),
      homeParishOrCountry: existingCustomer ? existingCustomer.countryOrParish : 'Jamaica',
      memberSince: new Date().getFullYear().toString(),
      isAdmin: isSpecialAdmin,
      adminRole: isSpecialAdmin ? 'Super Admin' : undefined,
    };

    if (isSpecialAdmin) {
      setIsAdminLoggedIn(true);
      setAdminEmail(cleanEmail);
      setCurrentAdminRole('Super Admin');
      showNotification('Admin Signed In', `Welcome back, Administrator ${user.name}! Administrative privileges active.`);
    } else {
      showNotification('Welcome Back!', `Signed in as ${user.name}`);
    }

    setCurrentUser(user);
    setIsAuthModalOpen(false);

    // If traveler was waiting to secure their spot, open booking modal now!
    if (pendingTripForBooking) {
      const tripToLock = pendingTripForBooking;
      setPendingTripForBooking(null);
      setAuthNotice(null);
      setTimeout(() => {
        setSelectedTripForBooking(tripToLock);
        showNotification('Spot Secured!', `Welcome back, ${user.name}! Finish reserving your spot for ${tripToLock.name}.`);
      }, 300);
    }

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
      const updated = [newCustomer, ...prev];
      syncToLiveServer({ customers: updated });
      return updated;
    });

    setIsAuthModalOpen(false);
    showNotification('Account Created!', `Welcome to SMELTRAVELS876, ${user.name}!`);

    // If traveler was waiting to secure their spot, open booking modal now!
    if (pendingTripForBooking) {
      const tripToLock = pendingTripForBooking;
      setPendingTripForBooking(null);
      setAuthNotice(null);
      setTimeout(() => {
        setSelectedTripForBooking(tripToLock);
        showNotification('Spot Secured!', `Welcome, ${user.name}! Finish reserving your spot for ${tripToLock.name}.`);
      }, 300);
    }

    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
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

    // Notify Admin Inbox: Deposit!
    addInboxItem({
      type: 'deposit',
      title: `Deposit Recorded: ${deposit.tripName} ($${deposit.amount.toLocaleString()} JMD)`,
      senderName: currentUser?.name || 'Verified Traveler',
      senderEmail: currentUser?.email || userEmail,
      senderPhone: currentUser?.phone,
      summary: `Deposit payment of $${deposit.amount.toLocaleString()} JMD recorded for ${deposit.tripName}. Method: ${deposit.paymentMethod}.`,
      details: `Booking Reference: ${deposit.bookingRef}. Status: Verified. Payment receipt verified by traveler.`,
      amount: deposit.amount,
      currency: 'JMD',
      tripName: deposit.tripName,
      referenceNumber: deposit.bookingRef,
    });

    // Also update in customers table
    const targetEmail = (currentUser?.email || userEmail || deposit.bookingRef).toLowerCase();
    setCustomers(prev => {
      const updated = prev.map(c => {
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
      });
      syncToLiveServer({ customers: updated });
      return updated;
    });
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      syncToLiveServer({ bookings: updated });
      return updated;
    });
    showNotification('Inquiry Removed', 'Booking inquiry deleted from records.', 'info');
  };

  const saveTrip = (trip: TripPackage) => {
    setTrips(prev => {
      const idx = prev.findIndex(t => t.id === trip.id);
      let updated: TripPackage[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = trip;
      } else {
        updated = [trip, ...prev];
      }
      syncToLiveServer({ trips: updated });
      // Push directly into Realtime Database '/siteContent' path
      pushSiteContentToRTDB('packages', updated);
      pushSiteContentToRTDB('trips', updated);
      pushFullSiteContentToRTDB({ trips: updated, settings });
      return updated;
    });
  };

  const saveDestination = (dest: Destination) => {
    setDestinations(prev => {
      const idx = prev.findIndex(d => d.id === dest.id);
      let updated: Destination[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = dest;
      } else {
        updated = [dest, ...prev];
      }
      syncToLiveServer({ destinations: updated });
      return updated;
    });
  };

  const saveBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => {
      const idx = prev.findIndex(p => p.id === post.id);
      let updated: BlogPost[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = post;
      } else {
        updated = [post, ...prev];
      }
      syncToLiveServer({ blog: updated });
      return updated;
    });
  };

  const saveFaq = (faq: FAQItem) => {
    setFaqs(prev => {
      const idx = prev.findIndex(f => f.id === faq.id);
      let updated: FAQItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = faq;
      } else {
        updated = [...prev, faq];
      }
      syncToLiveServer({ faqs: updated });
      return updated;
    });
  };

  const saveOffer = (offer: OfferItem) => {
    setOffers(prev => {
      const idx = prev.findIndex(o => o.id === offer.id);
      let updated: OfferItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = offer;
      } else {
        updated = [...prev, offer];
      }
      syncToLiveServer({ offers: updated });
      return updated;
    });
  };

  const saveTestimonial = (test: TestimonialItem) => {
    setTestimonials(prev => {
      const idx = prev.findIndex(t => t.id === test.id);
      let updated: TestimonialItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = test;
      } else {
        updated = [test, ...prev];
      }
      syncToLiveServer({ testimonials: updated });
      return updated;
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
    setAdminInbox(INITIAL_ADMIN_INBOX);
    syncToLiveServer({
      settings: INITIAL_SETTINGS,
      trips: INITIAL_TRIPS,
      destinations: INITIAL_DESTINATIONS,
      bookings: INITIAL_BOOKINGS,
      blog: INITIAL_BLOG_POSTS,
      offers: INITIAL_OFFERS,
      testimonials: INITIAL_TESTIMONIALS,
      faqs: INITIAL_FAQS,
      adminInbox: INITIAL_ADMIN_INBOX,
    });
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
        isReviewModalOpen,
        setIsReviewModalOpen,
        openReviewModal,
        closeReviewModal,
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
        applyFirestoreContent,
        adminInbox,
        addInboxItem,
        markInboxItemAsRead,
        markAllInboxAsRead,
        deleteInboxItem,
        unreadInboxCount,
        savedTripIds,
        savedTrips,
        toggleSaveTrip,
        isTripSaved,
        isSavedTripsDrawerOpen,
        setIsSavedTripsDrawerOpen,
        openSavedTripsDrawer,
        closeSavedTripsDrawer,
        secureSpotForTrip,
        pendingTripForBooking,
        setPendingTripForBooking,
        authNotice,
        setAuthNotice,
        verifyAmbassadorCode,
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
