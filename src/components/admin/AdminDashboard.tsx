import React, { useState, useEffect } from 'react';
import {
  Layers,
  Inbox,
  Plane,
  Compass,
  BookOpen,
  HelpCircle,
  Tag,
  Star,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  Download,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Building2,
  CreditCard,
  QrCode,
  Lock,
  LogOut,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Globe,
  ListCheck,
  ListPlus,
  AlignLeft,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import { BookingInquiry, TripPackage, TripStatus, BlogPost, FAQItem, PromotionalOffer, TestimonialItem, Destination, Ambassador, SiteSettings } from '../../types';
import { AdminLoginLock } from './AdminLoginLock';
import { ImageUploader } from './ImageUploader';
import { MultiGalleryUploader } from './MultiGalleryUploader';
import { AdminInboxView } from './AdminInboxView';
import { pushSiteContentToRTDB, pushFullSiteContentToRTDB } from '../../lib/firebase';
import { getSafeTripImageUrl, handleTripImageError } from '../../lib/imageUtils';

export const AdminDashboard: React.FC = () => {
  const {
    adminInbox,
    unreadInboxCount,
    bookings,
    updateBookingStatus,
    deleteBooking,
    trips,
    saveTrip,
    deleteTrip,
    destinations,
    saveDestination,
    deleteDestination,
    blogPosts,
    saveBlogPost,
    faqs,
    saveFaq,
    deleteFaq,
    offers,
    saveOffer,
    testimonials,
    saveTestimonial,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    settings,
    updateSettings,
    resetToInitialData,
    showNotification,
    navigateTo,
    isAdminLoggedIn,
    adminEmail,
    currentAdminRole,
    logoutAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inbox' | 'inquiries' | 'trips' | 'destinations' | 'guides' | 'faqs' | 'offers' | 'testimonials' | 'settings'>('inbox');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<BookingInquiry | null>(null);

  // Quick edit trip state
  const [editingTrip, setEditingTrip] = useState<TripPackage | null>(null);
  const [newInclusionInput, setNewInclusionInput] = useState<string>('');
  const [bulkInclusionsMode, setBulkInclusionsMode] = useState<boolean>(false);
  const [bulkInclusionsText, setBulkInclusionsText] = useState<string>('');

  // Quick edit destination state
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Quick edit FAQ state
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  // Quick edit offer state
  const [editingOffer, setEditingOffer] = useState<PromotionalOffer | null>(null);

  // Quick edit testimonial state
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<{
    customerName: string;
    location: string;
    tripName: string;
    rating: number;
    reviewText: string;
    date: string;
    isPublished: boolean;
    isSamplePlaceholder: boolean;
  }>({
    customerName: '',
    location: 'Kingston, Jamaica',
    tripName: 'Panama Experience 2026',
    rating: 5,
    reviewText: '',
    date: 'September 5, 2026',
    isPublished: true,
    isSamplePlaceholder: false,
  });

  // Settings form state
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSyncingSettings, setIsSyncingSettings] = useState(false);
  const [settingsSyncSuccess, setSettingsSyncSuccess] = useState(false);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (!isSyncingSettings) {
      setLocalSettings(settings);
    }
  }, [settings, isSyncingSettings]);

  const updateBankingField = (field: string, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      companyBanking: {
        ...(prev.companyBanking || {
          bankName: '',
          accountName: '',
          accountNumber: '',
          accountType: 'Chequing Account',
          branch: '',
          swiftOrRoutingCode: '',
          lynkHandle: '',
          lynkPhone: '',
          officeDepositAddress: '',
          cardGatewayProvider: '',
          cardGatewayMerchantId: '',
          paymentInstructions: '',
        }),
        [field]: value,
      },
    }));
  };

  // Admin Settings - Trip Age Policies & Child Pricing State & Handlers
  const [tripChildPriceDrafts, setTripChildPriceDrafts] = useState<Record<string, number | undefined>>({});

  const handleToggleAdultsOnlyInSettings = (trip: TripPackage) => {
    const nextAdultsOnly = !trip.isAdultsOnly;
    const updatedTrip: TripPackage = {
      ...trip,
      isAdultsOnly: nextAdultsOnly,
      childPrice: nextAdultsOnly ? undefined : (trip.childPrice !== undefined ? trip.childPrice : Math.round(trip.price * 0.7)),
    };
    saveTrip(updatedTrip);
    showNotification(
      nextAdultsOnly ? 'Adults Only (18+) Enabled' : 'Family Friendly Policy Enabled',
      `"${trip.name}" is now ${nextAdultsOnly ? 'Adults Only (18+)' : 'Family Friendly (Children Allowed)'}. Synced across website.`
    );
  };

  const handleSaveChildPriceInSettings = (trip: TripPackage, customPrice?: number) => {
    const rawVal = customPrice !== undefined
      ? customPrice
      : (tripChildPriceDrafts[trip.id] !== undefined
          ? tripChildPriceDrafts[trip.id]
          : (trip.childPrice !== undefined ? trip.childPrice : Math.round(trip.price * 0.7)));

    if (rawVal === undefined || isNaN(rawVal) || rawVal < 0) {
      showNotification('Invalid Rate', 'Please provide a valid child price rate.', 'warning');
      return;
    }

    const updatedPrice = Math.round(rawVal);
    const updatedTrip: TripPackage = {
      ...trip,
      childPrice: updatedPrice,
    };
    saveTrip(updatedTrip);
    showNotification(
      'Child Price Saved & Live',
      `Child price for "${trip.name}" set to ${formatPriceJMD(updatedPrice)}. Updated across all devices.`
    );
  };

  // Ambassador Modal & Management State
  const [ambassadorModalOpen, setAmbassadorModalOpen] = useState(false);
  const [editingAmbassadorId, setEditingAmbassadorId] = useState<string | null>(null);
  const [ambassadorForm, setAmbassadorForm] = useState<Omit<Ambassador, 'id'>>({
    name: '',
    title: 'Senior Travel Ambassador',
    phone: '(876) ',
    email: '',
    code: '',
    parishOrRegion: '',
    isActive: true,
  });

  const openNewAmbassadorModal = () => {
    setEditingAmbassadorId(null);
    setAmbassadorForm({
      name: '',
      title: 'Travel Ambassador',
      phone: '(876) ',
      email: '',
      code: `AMB${Math.floor(100 + Math.random() * 900)}`,
      parishOrRegion: 'Kingston & St. Andrew',
      isActive: true,
    });
    setAmbassadorModalOpen(true);
  };

  const openEditAmbassadorModal = (amb: Ambassador) => {
    setEditingAmbassadorId(amb.id);
    setAmbassadorForm({
      name: amb.name,
      title: amb.title,
      phone: amb.phone,
      email: amb.email,
      code: amb.code || '',
      parishOrRegion: amb.parishOrRegion || '',
      isActive: amb.isActive !== false,
    });
    setAmbassadorModalOpen(true);
  };

  const handleSaveAmbassadorModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassadorForm.name.trim() || !ambassadorForm.phone.trim()) {
      showNotification('Missing Information', 'Ambassador Name and Phone are required.', 'warning');
      return;
    }

    const currentAmbassadors = localSettings.ambassadors || [];
    let updatedAmbassadors: Ambassador[];

    if (editingAmbassadorId) {
      updatedAmbassadors = currentAmbassadors.map((a) =>
        a.id === editingAmbassadorId
          ? {
              ...a,
              name: ambassadorForm.name.trim(),
              title: ambassadorForm.title.trim(),
              phone: ambassadorForm.phone.trim(),
              email: ambassadorForm.email.trim(),
              code: ambassadorForm.code?.trim().toUpperCase(),
              parishOrRegion: ambassadorForm.parishOrRegion?.trim(),
              isActive: ambassadorForm.isActive,
            }
          : a
      );
    } else {
      const newAmbassador: Ambassador = {
        id: `amb-${Date.now()}`,
        name: ambassadorForm.name.trim(),
        title: ambassadorForm.title.trim() || 'Travel Ambassador',
        phone: ambassadorForm.phone.trim(),
        email: ambassadorForm.email.trim(),
        code: ambassadorForm.code?.trim().toUpperCase() || `AMB${Math.floor(100 + Math.random() * 900)}`,
        parishOrRegion: ambassadorForm.parishOrRegion?.trim(),
        isActive: ambassadorForm.isActive,
      };
      updatedAmbassadors = [...currentAmbassadors, newAmbassador];
    }

    const newSettings = {
      ...localSettings,
      ambassadors: updatedAmbassadors,
      ...(currentAmbassadors.length === 0
        ? {
            ambassadorName: ambassadorForm.name.trim(),
            ambassadorTitle: ambassadorForm.title.trim(),
            ambassadorPhone: ambassadorForm.phone.trim(),
            ambassadorEmail: ambassadorForm.email.trim(),
          }
        : {}),
    };

    setLocalSettings(newSettings);
    updateSettings(newSettings);
    setAmbassadorModalOpen(false);
    showNotification(
      editingAmbassadorId ? 'Ambassador Updated' : 'Ambassador Added',
      `${ambassadorForm.name} has been ${editingAmbassadorId ? 'updated' : 'added to the roster'}.`
    );
  };

  const handleDeleteAmbassador = (id: string) => {
    const amb = (localSettings.ambassadors || []).find((a) => a.id === id);
    if (!window.confirm(`Are you sure you want to remove ambassador "${amb?.name || 'this ambassador'}"?`)) {
      return;
    }
    const updated = (localSettings.ambassadors || []).filter((a) => a.id !== id);
    const newSettings = {
      ...localSettings,
      ambassadors: updated,
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
    showNotification('Ambassador Removed', 'Ambassador has been removed from the agency roster.');
  };

  const handleToggleAmbassadorActive = (id: string) => {
    const updated = (localSettings.ambassadors || []).map((a) =>
      a.id === id ? { ...a, isActive: a.isActive === false ? true : false } : a
    );
    const newSettings = { ...localSettings, ambassadors: updated };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
    showNotification('Status Updated', 'Ambassador availability status updated.');
  };

  const handleSetPrimaryAmbassador = (amb: Ambassador) => {
    const newSettings = {
      ...localSettings,
      ambassadorName: amb.name,
      ambassadorTitle: amb.title,
      ambassadorPhone: amb.phone,
      ambassadorEmail: amb.email,
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
    showNotification('Primary Ambassador Set', `${amb.name} is now designated as the primary agency ambassador.`);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = inquiryFilterStatus === 'All' || b.status === inquiryFilterStatus;
    const matchesSearch =
      inquirySearch.trim() === '' ||
      b.referenceNumber.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      b.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      b.phone.includes(inquirySearch) ||
      b.tripName.toLowerCase().includes(inquirySearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportBookings = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smeltravels876_inquiries_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Export Successful', 'All booking inquiries exported as JSON.');
  };

  const handleSaveSettings = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }
    if (isSyncingSettings) return;

    setIsSyncingSettings(true);
    setSettingsSyncSuccess(false);

    // Ensure primary ambassador info aligns with active roster
    const primaryAmb =
      localSettings.ambassadors?.find((a) => a.isActive !== false) ||
      localSettings.ambassadors?.[0];

    const finalizedSettings: SiteSettings = {
      ...localSettings,
      ...(primaryAmb
        ? {
            ambassadorName: primaryAmb.name,
            ambassadorTitle: primaryAmb.title,
            ambassadorPhone: primaryAmb.phone,
            ambassadorEmail: primaryAmb.email,
          }
        : {}),
    };

    try {
      await updateSettings(finalizedSettings);
      setLocalSettings(finalizedSettings);
      setSettingsSyncSuccess(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTimestamp(timeStr);
      showNotification(
        'Settings Saved & Live for All Users',
        'Website settings have been saved permanently to cloud database and synchronized to all visitors and administrators.',
        'success'
      );
      setTimeout(() => {
        setSettingsSyncSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to sync settings:', err);
      showNotification('Save Notice', 'Settings saved in local session.', 'info');
    } finally {
      setIsSyncingSettings(false);
    }
  };

  // Enforce Admin Lock Protection
  if (!isAdminLoggedIn) {
    return <AdminLoginLock />;
  }

  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      {/* Admin Header */}
      <div className="bg-[#2E0249] text-white border-b border-purple-900 sticky top-16 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow overflow-hidden">
              <img
                src="/logo.png"
                alt="SMELTRAVELS876 Logo"
                className="w-9 h-9 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-['Outfit',sans-serif]">SMELTRAVELS876 CMS</h1>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AUTO-SYNC TO LIVE FEED
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Agency Back-Office • Administrator: <strong className="text-[#FFC72C]">{adminEmail || 'zbuchanan.smeltravels@gmail.com'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all CMS data to default demo seed data? This will restore original packages.')) {
                  resetToInitialData();
                }
              }}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold px-3 py-2 rounded-xl border border-rose-400/30 transition-colors flex items-center gap-1"
              title="Restore initial data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            {/* Lock Panel / Logout Button */}
            <button
              onClick={logoutAdmin}
              id="admin-logout-btn"
              className="bg-amber-400 text-[#2E0249] hover:bg-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5 shadow"
              title="Lock administrator portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Panel</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-bold pt-1">
          {[
            {
              id: 'inbox',
              label: 'Admin Inbox',
              count: adminInbox.length,
              badge: unreadInboxCount > 0 ? `${unreadInboxCount} new` : undefined,
              icon: Inbox,
            },
            { id: 'inquiries', label: `Inquiries (${bookings.length})`, icon: UserCheck },
            { id: 'trips', label: `Trips (${trips.length})`, icon: Plane },
            { id: 'destinations', label: `Destinations (${destinations.length})`, icon: Compass },
            { id: 'guides', label: `Blog & Guides (${blogPosts.length})`, icon: BookOpen },
            { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
            { id: 'offers', label: `Offers (${offers.length})`, icon: Tag },
            { id: 'testimonials', label: `Reviews (${testimonials.length})`, icon: Star },
            { id: 'settings', label: 'Agency Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'bg-neutral-100 text-[#2E0249] border-[#FFC72C]'
                    : 'text-neutral-300 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-amber-400 text-[#2E0249] text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 0: ADMIN INBOX */}
        {activeTab === 'inbox' && <AdminInboxView />}

        {/* TAB 1: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, ref code, trip, phone..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <select
                  value={inquiryFilterStatus}
                  onChange={(e) => setInquiryFilterStatus(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Deposit Paid">Deposit Paid</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportBookings}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-neutral-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Customer & Contact</th>
                      <th className="p-4">Assigned Ambassador</th>
                      <th className="p-4">Trip Package</th>
                      <th className="p-4">Travelers / Stage</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#2E0249]">
                            {b.referenceNumber}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-neutral-900">{b.customerName}</div>
                            <div className="text-neutral-500">{b.phone} • {b.email}</div>
                            <div className="text-[11px] text-neutral-400">{b.countryOrParish}</div>
                          </td>
                          <td className="p-4">
                            {b.ambassadorName ? (
                              <div className="flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                                <div>
                                  <span className="font-bold text-[#2E0249] block">{b.ambassadorName}</span>
                                  {b.ambassadorPhone && (
                                    <span className="text-[11px] text-neutral-500">{b.ambassadorPhone}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic text-[11px]">Direct Agency Booking</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-neutral-800">{b.tripName}</div>
                            <div className="text-[11px] text-neutral-500">Pref: {b.preferredTravelDate}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{b.adultsCount} Adult{b.adultsCount > 1 ? 's' : ''}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-900 border border-purple-200">
                              {b.travelInterestType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={b.status}
                              onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                b.status === 'New'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : b.status === 'Deposit Paid' || b.status === 'Deposit Received' || b.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : b.status === 'Contacted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Deposit Paid">Deposit Paid</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-neutral-500">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedInquiry(b)}
                              className="p-1.5 rounded-lg bg-purple-50 text-[#2E0249] hover:bg-purple-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete booking inquiry ${b.referenceNumber}?`)) {
                                  deleteBooking(b.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-500">
                          No inquiries found matching current search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inquiry Details Modal */}
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-neutral-300 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div>
                      <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                        Inquiry {selectedInquiry.referenceNumber}
                      </h3>
                      <span className="text-xs text-neutral-500">
                        Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button onClick={() => setSelectedInquiry(null)} className="p-1 text-neutral-400 hover:text-neutral-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-neutral-700">
                    {/* Chosen Ambassador Box */}
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                      <span className="font-bold block text-purple-900 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>Assigned Travel Ambassador</span>
                      </span>
                      {selectedInquiry.ambassadorName ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-900 text-sm">{selectedInquiry.ambassadorName}</p>
                            {selectedInquiry.ambassadorPhone && (
                              <p className="text-neutral-600 text-[11px]">{selectedInquiry.ambassadorPhone}</p>
                            )}
                          </div>
                          <span className="text-[10px] font-bold bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded font-mono">
                            Assigned
                          </span>
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">No specific ambassador assigned (General Inquiries Pool)</p>
                      )}
                    </div>

                    <div>
                      <span className="font-bold block text-neutral-500">Traveler Details</span>
                      <p className="font-semibold text-neutral-900 text-sm">{selectedInquiry.customerName}</p>
                      <p>Phone: {selectedInquiry.phone}</p>
                      <p>Email: {selectedInquiry.email}</p>
                      <p>Parish/Location: {selectedInquiry.countryOrParish}</p>
                      <p>Preferred Contact: <strong className="capitalize">{selectedInquiry.preferredContactMethod}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                      <span className="font-bold block text-neutral-500">Trip & Schedule</span>
                      <p className="font-semibold text-neutral-900">{selectedInquiry.tripName}</p>
                      <p>Date: {selectedInquiry.preferredTravelDate}</p>
                      <p>Party: {selectedInquiry.adultsCount} Adults, {selectedInquiry.childrenCount} Children</p>
                    </div>

                    {selectedInquiry.specialRequests && (
                      <div className="pt-2 border-t border-neutral-100">
                        <span className="font-bold block text-neutral-500">Special Requests / Questions</span>
                        <p className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 mt-1 italic">
                          "{selectedInquiry.specialRequests}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-end">
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRIPS MANAGEMENT */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Trip Packages Management
                </h2>
                <p className="text-xs text-neutral-500">
                  Update departure dates, prices, deposit terms, and 2026/2027 collection status.
                </p>
              </div>

              <button
                onClick={() => {
                  const newTrip: TripPackage = {
                    id: `trip-${Date.now()}`,
                    slug: `new-group-trip-${Date.now()}`,
                    name: 'New Group Adventure',
                    country: 'Caribbean',
                    countryAcronym: 'CAR',
                    availabilityNote: 'Accepting Deposits',
                    destination: 'New Destination',
                    countryFlag: '✈️',
                    year: 2027,
                    dates: 'Dates TBA',
                    price: 250000,
                    deposit: 40000,
                    currency: 'JMD',
                    status: 'Coming Soon',
                    isAdultsOnly: false,
                    childPrice: 175000,
                    childDeposit: 28000,
                    hotel: 'Selected 4-Star Resort',
                    baggageInfo: '1 Carry-on + Personal item',
                    shortDescription: 'Exciting group trip package coordinated by SMELTRAVELS876.',
                    fullDescription: 'Comprehensive travel package with flights, hotel, transfers, and excursions.',
                    tripLogo: '',
                    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    gallery: [
                      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
                      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
                    ],
                    packageInclusions: ['Roundtrip flights', 'Hotel accommodation', 'Airport transfers'],
                    exclusions: ['Personal expenses', 'Travel insurance'],
                    itinerary: [{ day: 1, title: 'Arrival', description: 'Arrive at destination airport and meet transfer coordinator.' }],
                    travelRequirements: ['Valid passport with 6 months validity'],
                    visaRequirements: 'Entry visa info to be confirmed based on passport nationality.',
                    paymentPlanInfo: 'Monthly installments following deposit.',
                    excursions: ['Sightseeing guided tour', 'Local dining experience'],
                    orderIndex: trips.length + 1,
                  };
                  setEditingTrip(newTrip);
                  setNewInclusionInput('');
                  setBulkInclusionsMode(false);
                  setBulkInclusionsText(newTrip.packageInclusions.join('\n'));
                }}
                className="bg-gradient-to-r from-[#2E0249] to-purple-900 hover:from-purple-900 hover:to-[#2E0249] text-[#FFC72C] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-[#FFC72C]/40 hover:border-[#FFC72C] transition-all flex items-center gap-2 cursor-pointer group"
                id="admin-add-new-trip-btn"
              >
                <div className="w-5 h-5 rounded-lg bg-[#FFC72C]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5 text-[#FFC72C]" />
                </div>
                <span className="font-extrabold tracking-wide">Add New Trip</span>
              </button>
            </div>

            {/* Trip Cards in Admin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={t.featuredImage} alt={t.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-200" />
                        {t.tripLogo && (
                          <img
                            src={t.tripLogo}
                            alt="Trip Logo"
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-white p-0.5 border border-purple-200 shadow object-contain"
                            title="Custom Trip Logo"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base">{t.countryFlag}</span>
                          <span className="text-xs font-semibold text-neutral-800">{t.country}</span>
                          {t.countryAcronym && (
                            <span className="bg-[#FFC72C] text-[#2E0249] px-1.5 py-0.5 rounded font-black text-[10px] tracking-wider uppercase shadow-2xs">
                              {t.countryAcronym}
                            </span>
                          )}
                          <span className="text-xs font-bold text-purple-900">• {t.year}</span>
                          {t.is2026Featured && <span className="bg-[#FFC72C] text-[#2E0249] text-[9px] px-1.5 py-0.5 rounded font-black">2026 FEATURED</span>}
                          {t.is2027Collection && <span className="bg-purple-100 text-purple-900 text-[9px] px-1.5 py-0.5 rounded font-bold">2027 COLLECTION</span>}
                          {t.isAdultsOnly ? (
                            <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.5 rounded font-black border border-rose-200">
                              🔞 ADULTS ONLY (18+)
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                              Child: {formatPriceJMD(t.childPrice ?? Math.round(t.price * 0.7))}
                            </span>
                          )}
                          {t.gallery && t.gallery.length > 0 && (
                            <span className="bg-neutral-100 text-neutral-600 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                              +{t.gallery.length} photos
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-neutral-900 font-['Outfit',sans-serif] text-base mt-0.5">{t.name}</h3>
                        <p className="text-xs text-neutral-500">{t.dates} • {t.hotel}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-neutral-900">{formatPriceJMD(t.price)}</div>
                      <div className="text-[11px] text-neutral-500">Dep: {formatPriceJMD(t.deposit)}</div>
                    </div>
                  </div>

                  {/* What is Included Preview Bar */}
                  <div className="bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
                    <div className="flex items-center justify-between font-bold text-neutral-800">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>What is Included ({t.packageInclusions?.length || 0} items):</span>
                      </span>
                      <span className="text-[10px] text-purple-800 font-semibold cursor-pointer hover:underline" onClick={() => {
                        setEditingTrip(t);
                        setNewInclusionInput('');
                        setBulkInclusionsMode(false);
                        setBulkInclusionsText((t.packageInclusions || []).join('\n'));
                      }}>
                        Edit Inclusions
                      </span>
                    </div>
                    <p className="text-neutral-500 truncate text-[11px]">
                      {t.packageInclusions && t.packageInclusions.length > 0
                        ? t.packageInclusions.slice(0, 3).join(' • ') + (t.packageInclusions.length > 3 ? ` • +${t.packageInclusions.length - 3} more` : '')
                        : 'No package inclusions set yet'}
                    </p>
                  </div>

                  {/* Quick Availability Selector & Action Buttons */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-neutral-600">Availability:</span>
                      <select
                        value={t.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as TripStatus;
                          const updated = { ...t, status: newStatus };
                          saveTrip(updated);
                          showNotification('Availability Updated', `Set "${t.name}" availability to ${newStatus}.`);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-neutral-800 cursor-pointer shadow-2xs hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-900/20"
                      >
                        <option value="Available">🟢 Available</option>
                        <option value="Limited Availability">🟡 Limited Availability</option>
                        <option value="Coming Soon">🔵 Coming Soon</option>
                        <option value="Sold Out">🔴 Sold Out</option>
                        <option value="Closed">⚪ Closed</option>
                      </select>
                      {t.availabilityNote && (
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {t.availabilityNote}
                        </span>
                      )}
                    </div>

                    <div className="space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTrip(t);
                          setNewInclusionInput('');
                          setBulkInclusionsMode(false);
                          setBulkInclusionsText((t.packageInclusions || []).join('\n'));
                        }}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors font-semibold"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete trip "${t.name}"?`)) {
                            deleteTrip(t.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trip Editor Modal */}
            {editingTrip && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                      Edit Trip: {editingTrip.name}
                    </h3>
                    <button onClick={() => setEditingTrip(null)} className="p-1 text-neutral-400 hover:text-neutral-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Trip Name</label>
                        <input
                          type="text"
                          value={editingTrip.name}
                          onChange={(e) => setEditingTrip({ ...editingTrip, name: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Dates</label>
                        <input
                          type="text"
                          value={editingTrip.dates}
                          onChange={(e) => setEditingTrip({ ...editingTrip, dates: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Total Rate (JMD)</label>
                        <input
                          type="number"
                          value={editingTrip.price}
                          onChange={(e) => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })}
                          className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Deposit (JMD)</label>
                        <input
                          type="number"
                          value={editingTrip.deposit}
                          onChange={(e) => setEditingTrip({ ...editingTrip, deposit: Number(e.target.value) })}
                          className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Year</label>
                        <select
                          value={editingTrip.year}
                          onChange={(e) => setEditingTrip({ ...editingTrip, year: Number(e.target.value) })}
                          className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        >
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                        </select>
                      </div>
                    </div>

                    {/* SECTION: ADULTS ONLY & CHILD PRICING (ADMIN CONTROLS) */}
                    <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-bold text-purple-950">
                          <Users className="w-4 h-4 text-purple-700" />
                          <span className="text-xs uppercase tracking-wider">Age Policy & Child Pricing</span>
                        </div>
                        {editingTrip.isAdultsOnly ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                            🔞 Adults Only Trip (18+)
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            👨‍👩‍👧‍👦 Family Friendly (Children Allowed)
                          </span>
                        )}
                      </div>

                      {/* Adults Only Toggle */}
                      <div className="bg-white p-3.5 rounded-xl border border-purple-100 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <label className="font-bold text-neutral-900 text-xs block cursor-pointer" htmlFor="toggle-adults-only">
                            Adults Only Option (18+ Policy)
                          </label>
                          <p className="text-[11px] text-neutral-500 leading-snug">
                            When toggled on, this trip will strictly restrict participation to adults 18+. The booking form will prevent adding children and display an Adults Only badge.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            id="toggle-adults-only"
                            checked={editingTrip.isAdultsOnly || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setEditingTrip({
                                ...editingTrip,
                                isAdultsOnly: isChecked,
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E0249]"></div>
                        </label>
                      </div>

                      {/* Child Pricing Configuration (when not Adults Only) */}
                      {!editingTrip.isAdultsOnly ? (
                        <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="font-bold text-neutral-800 text-xs block">
                              Trip Price for Children (JMD)
                            </label>
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Automatically adds to total when children are booked
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-xs text-neutral-400 font-bold">$</span>
                                <input
                                  type="number"
                                  placeholder={String(Math.round(editingTrip.price * 0.7))}
                                  value={editingTrip.childPrice !== undefined ? editingTrip.childPrice : ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                                    setEditingTrip({ ...editingTrip, childPrice: val });
                                  }}
                                  className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                                />
                              </div>
                              <span className="text-[10px] text-neutral-500 mt-1 block">
                                Current child rate: <strong>{formatPriceJMD(editingTrip.childPrice !== undefined ? editingTrip.childPrice : Math.round(editingTrip.price * 0.7))}</strong>
                              </span>
                            </div>

                            {/* Quick Child Discount Presets */}
                            <div>
                              <span className="text-[10px] text-neutral-500 font-bold block mb-1">Quick Child Rate Presets:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: '50% Rate', ratio: 0.5 },
                                  { label: '60% Rate', ratio: 0.6 },
                                  { label: '70% Rate', ratio: 0.7 },
                                  { label: '80% Rate', ratio: 0.8 },
                                ].map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      setEditingTrip({
                                        ...editingTrip,
                                        childPrice: Math.round(editingTrip.price * preset.ratio),
                                      });
                                    }}
                                    className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-950 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                                  >
                                    {preset.label} ({formatPriceJMD(Math.round(editingTrip.price * preset.ratio))})
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Child pricing is inactive because this package is designated as <strong>Adults Only (18+)</strong>.</span>
                        </div>
                      )}
                    </div>

                    {/* SECTION 1: TRIP AVAILABILITY & BOOKING STATUS */}
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                        <div className="flex items-center gap-2 font-bold text-amber-950">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span className="text-xs uppercase tracking-wider">Trip Availability & Booking Status</span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                          Current: {editingTrip.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Availability Status</label>
                          <select
                            value={editingTrip.status}
                            onChange={(e) => setEditingTrip({ ...editingTrip, status: e.target.value as TripStatus })}
                            className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                          >
                            <option value="Available">🟢 Available (Accepting Bookings & Deposits)</option>
                            <option value="Limited Availability">🟡 Limited Availability (Selling Fast / Few Spots)</option>
                            <option value="Coming Soon">🔵 Coming Soon (Pre-registration & Inquiries)</option>
                            <option value="Sold Out">🔴 Sold Out (Fully Booked)</option>
                            <option value="Closed">⚪ Closed (Registration Closed / Departed)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">
                            Availability Note / Spots Remaining <span className="text-neutral-400 font-normal">(Optional Badge)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Only 3 spots left! or 80% Booked"
                            value={editingTrip.availabilityNote || ''}
                            onChange={(e) => setEditingTrip({ ...editingTrip, availabilityNote: e.target.value })}
                            className="w-full p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Quick preset availability chips */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                          Quick Availability Badges:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Only 2 spots left!',
                            'Few spots remaining',
                            '80% Booked',
                            'Accepting Deposits',
                            'Early Bird Open',
                            'Waitlist Open',
                          ].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setEditingTrip({ ...editingTrip, availabilityNote: chip })}
                              className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              + {chip}
                            </button>
                          ))}
                          {editingTrip.availabilityNote && (
                            <button
                              type="button"
                              onClick={() => setEditingTrip({ ...editingTrip, availabilityNote: '' })}
                              className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              ✕ Clear Note
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: COUNTRY, LOCATION & COUNTRY ACRONYM */}
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                        <div className="flex items-center gap-2 font-bold text-purple-950">
                          <Globe className="w-4 h-4 text-purple-700" />
                          <span className="text-xs uppercase tracking-wider">Country, Location & Country Acronym</span>
                        </div>
                        {editingTrip.countryAcronym && (
                          <div className="flex items-center gap-1 bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded font-black text-[11px] uppercase tracking-wider shadow-2xs">
                            <span>{editingTrip.countryFlag}</span>
                            <span>{editingTrip.countryAcronym}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-neutral-700 block mb-1">Country Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Panama, Colombia, Antigua and Barbuda"
                            value={editingTrip.country}
                            onChange={(e) => setEditingTrip({ ...editingTrip, country: e.target.value })}
                            className="w-full p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">
                            Country Acronym <span className="text-purple-900 font-black text-[10px]">(e.g. PAN, ATG)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="PAN"
                            maxLength={8}
                            value={editingTrip.countryAcronym || ''}
                            onChange={(e) => setEditingTrip({ ...editingTrip, countryAcronym: e.target.value.toUpperCase() })}
                            className="w-full p-2 border border-neutral-300 rounded-xl bg-white uppercase font-black tracking-wider text-purple-950 focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-neutral-700 block mb-1">Flag Emoji</label>
                          <input
                            type="text"
                            placeholder="🇵🇦"
                            value={editingTrip.countryFlag}
                            onChange={(e) => setEditingTrip({ ...editingTrip, countryFlag: e.target.value })}
                            className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-base text-center focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Destination / City Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Panama City & Canal, Jolly Beach, Punta Cana"
                          value={editingTrip.destination}
                          onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                        />
                      </div>

                      {/* Quick 1-Click Country & Acronym Presets */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                          1-Click Country & Acronym Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'Mexico', acronym: 'MEX', flag: '🇲🇽', dest: 'Cancún & Riviera Maya' },
                            { name: 'Panama', acronym: 'PAN', flag: '🇵🇦', dest: 'Panama City & Canal' },
                            { name: 'Antigua and Barbuda', acronym: 'ATG', flag: '🇦🇬', dest: 'Antigua' },
                            { name: 'Dominican Republic', acronym: 'DOM', flag: '🇩🇴', dest: 'Punta Cana' },
                            { name: 'Colombia', acronym: 'COL', flag: '🇨🇴', dest: 'Medellín' },
                            { name: 'Germany + Italy', acronym: 'GER/ITA', flag: '🇩🇪🇮🇹', dest: 'Frankfurt & Milan' },
                            { name: 'Jamaica', acronym: 'JAM', flag: '🇯🇲', dest: 'Kingston & North Coast' },
                            { name: 'United States', acronym: 'USA', flag: '🇺🇸', dest: 'Miami / New York' },
                            { name: 'Barbados', acronym: 'BRB', flag: '🇧🇧', dest: 'Bridgetown' },
                            { name: 'Trinidad and Tobago', acronym: 'TTO', flag: '🇹🇹', dest: 'Port of Spain' },
                            { name: 'France', acronym: 'FRA', flag: '🇫🇷', dest: 'Paris' },
                            { name: 'Spain', acronym: 'ESP', flag: '🇪🇸', dest: 'Madrid & Barcelona' },
                          ].map((preset) => (
                            <button
                              key={preset.acronym}
                              type="button"
                              onClick={() => {
                                setEditingTrip({
                                  ...editingTrip,
                                  country: preset.name,
                                  countryAcronym: preset.acronym,
                                  countryFlag: preset.flag,
                                  destination: editingTrip.destination || preset.dest,
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-purple-100 text-purple-950 border border-purple-200 text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>{preset.flag}</span>
                              <span>{preset.name}</span>
                              <span className="bg-purple-900 text-[#FFC72C] px-1 py-0.2 rounded font-black text-[9px]">{preset.acronym}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: WHAT IS INCLUDED IN THIS PACKAGE */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-950">
                          <ListCheck className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs uppercase tracking-wider">
                            What is Included in this Package ({editingTrip.packageInclusions?.length || 0} items)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!bulkInclusionsMode) {
                                setBulkInclusionsText((editingTrip.packageInclusions || []).join('\n'));
                              } else {
                                const parsed = bulkInclusionsText.split('\n').map(s => s.trim()).filter(Boolean);
                                setEditingTrip({ ...editingTrip, packageInclusions: parsed });
                              }
                              setBulkInclusionsMode(!bulkInclusionsMode);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {bulkInclusionsMode ? (
                              <>
                                <ListCheck className="w-3 h-3" />
                                <span>Switch to List View</span>
                              </>
                            ) : (
                              <>
                                <AlignLeft className="w-3 h-3" />
                                <span>Bulk Paste / Edit Mode</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                        Customize the exact services, accommodations, flights, and perks displayed to customers in the package breakdown.
                      </p>

                      {/* Mode A: Visual List Editor */}
                      {!bulkInclusionsMode ? (
                        <div className="space-y-2.5">
                          {/* List of current inclusions */}
                          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {(editingTrip.packageInclusions || []).map((inclusion, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs group"
                              >
                                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={inclusion}
                                  onChange={(e) => {
                                    const next = [...(editingTrip.packageInclusions || [])];
                                    next[index] = e.target.value;
                                    setEditingTrip({ ...editingTrip, packageInclusions: next });
                                  }}
                                  className="flex-1 p-1.5 text-xs text-neutral-800 bg-transparent border border-transparent hover:border-neutral-200 focus:border-emerald-500 focus:bg-emerald-50/30 rounded-lg focus:outline-none"
                                />

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => {
                                      if (index === 0) return;
                                      const next = [...(editingTrip.packageInclusions || [])];
                                      const temp = next[index - 1];
                                      next[index - 1] = next[index];
                                      next[index] = temp;
                                      setEditingTrip({ ...editingTrip, packageInclusions: next });
                                    }}
                                    className={`p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors ${
                                      index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    disabled={index === (editingTrip.packageInclusions?.length || 0) - 1}
                                    onClick={() => {
                                      if (index >= (editingTrip.packageInclusions?.length || 0) - 1) return;
                                      const next = [...(editingTrip.packageInclusions || [])];
                                      const temp = next[index + 1];
                                      next[index + 1] = next[index];
                                      next[index] = temp;
                                      setEditingTrip({ ...editingTrip, packageInclusions: next });
                                    }}
                                    className={`p-1 rounded text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors ${
                                      index >= (editingTrip.packageInclusions?.length || 0) - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (editingTrip.packageInclusions || []).filter((_, i) => i !== index);
                                      setEditingTrip({ ...editingTrip, packageInclusions: next });
                                    }}
                                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Remove Inclusion"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {(!editingTrip.packageInclusions || editingTrip.packageInclusions.length === 0) && (
                              <div className="p-4 text-center text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
                                No package inclusions added yet. Type below or click quick presets.
                              </div>
                            )}
                          </div>

                          {/* Add New Inclusion Input */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Type new inclusion (e.g. Flight from Kingston (KIN), Hotel stay, etc.)"
                              value={newInclusionInput}
                              onChange={(e) => setNewInclusionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newInclusionInput.trim()) {
                                    setEditingTrip({
                                      ...editingTrip,
                                      packageInclusions: [...(editingTrip.packageInclusions || []), newInclusionInput.trim()],
                                    });
                                    setNewInclusionInput('');
                                  }
                                }
                              }}
                              className="flex-1 p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newInclusionInput.trim()) {
                                  setEditingTrip({
                                    ...editingTrip,
                                    packageInclusions: [...(editingTrip.packageInclusions || []), newInclusionInput.trim()],
                                  });
                                  setNewInclusionInput('');
                                }
                              }}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Inclusion</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Mode B: Bulk multi-line text editor */
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-neutral-700 block">
                            Paste or type each inclusion on a separate line:
                          </label>
                          <textarea
                            rows={6}
                            value={bulkInclusionsText}
                            onChange={(e) => setBulkInclusionsText(e.target.value)}
                            placeholder="Flight from Kingston (KIN)&#10;Hotel accommodation&#10;Bed and breakfast daily&#10;Roundtrip airport transfers&#10;Two paid excursions"
                            className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/30 focus:outline-none leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const parsed = bulkInclusionsText.split('\n').map(s => s.trim()).filter(Boolean);
                              setEditingTrip({ ...editingTrip, packageInclusions: parsed });
                              setBulkInclusionsMode(false);
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            ✓ Apply Bulk Inclusions ({bulkInclusionsText.split('\n').map(s => s.trim()).filter(Boolean).length} items)
                          </button>
                        </div>
                      )}

                      {/* Quick Add Inclusion Presets Chips */}
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                          1-Click Standard Travel Inclusions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Flight from Kingston (KIN)',
                            'Hotel accommodation',
                            'Bed and breakfast daily',
                            'All meals, snacks, and unlimited drinks',
                            'Roundtrip airport transfers',
                            'Two paid excursions',
                            'Exclusive trip memorabilia',
                            'Preparation of travel documents',
                            'Dedicated trip coordinator',
                            'Carry-on luggage & personal item',
                            'Checked baggage included',
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                const current = editingTrip.packageInclusions || [];
                                if (!current.includes(item)) {
                                  setEditingTrip({
                                    ...editingTrip,
                                    packageInclusions: [...current, item],
                                  });
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300/80 text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              + {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hotel, Short Description & Accommodations */}
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Hotel / Resort Name</label>
                      <input
                        type="text"
                        value={editingTrip.hotel}
                        onChange={(e) => setEditingTrip({ ...editingTrip, hotel: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={editingTrip.shortDescription}
                        onChange={(e) => setEditingTrip({ ...editingTrip, shortDescription: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>

                    {/* Visual Branding & Photography Management */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/70 to-amber-50/40 rounded-2xl border border-purple-100/80 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                        <div className="flex items-center gap-2 text-xs font-black text-purple-950">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="uppercase tracking-wider">Trip Logo & Photography Suite</span>
                        </div>
                        <span className="text-[10px] text-purple-900 bg-white px-2 py-0.5 rounded-full font-bold border border-purple-200">
                          Upload, URL or Presets
                        </span>
                      </div>

                      {/* 1. Trip Logo / Badge */}
                      <ImageUploader
                        label="Trip Logo / Emblem / Badge"
                        value={editingTrip.tripLogo || ''}
                        onChange={(url) => setEditingTrip({ ...editingTrip, tripLogo: url })}
                        helperText="Upload or link a custom trip badge or emblem (e.g. Jamaica 2026 seal, crest, or tour logo). Displays on trip cards and hero banner."
                        aspectRatio="square"
                        presets={[
                          { label: 'Jamaica Seal', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
                          { label: 'Tropical Emblem', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
                          { label: 'World Compass', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80' },
                          { label: 'Gold Badge', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80' },
                        ]}
                      />

                      {/* 2. Main Hero / Cover Image */}
                      <ImageUploader
                        label="Main Featured / Hero Cover Photo"
                        value={editingTrip.featuredImage || ''}
                        onChange={(url) => setEditingTrip({ ...editingTrip, featuredImage: url })}
                        helperText="Primary banner image shown on home page, cards, and trip detail hero."
                        aspectRatio="landscape"
                      />

                      {/* 3. Additional Gallery Images */}
                      <MultiGalleryUploader
                        label="Additional Trip Images (Resorts, Excursions, Itinerary Highlights)"
                        images={editingTrip.gallery || []}
                        onChange={(imgs) => setEditingTrip({ ...editingTrip, gallery: imgs })}
                        helperText="Add multiple photos showing hotel suites, excursion adventures, dining experiences, and landmark spots."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTrip.is2026Featured || false}
                          onChange={(e) => setEditingTrip({ ...editingTrip, is2026Featured: e.target.checked })}
                          className="rounded text-[#2E0249]"
                        />
                        <span className="font-semibold">Featured 2026 Trip</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTrip.is2027Collection || false}
                          onChange={(e) => setEditingTrip({ ...editingTrip, is2027Collection: e.target.checked })}
                          className="rounded text-[#2E0249]"
                        />
                        <span className="font-semibold">2027 Collection Trip</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingTrip(null)}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // If in bulk mode, parse text first
                        const finalInclusions = bulkInclusionsMode
                          ? bulkInclusionsText.split('\n').map(s => s.trim()).filter(Boolean)
                          : (editingTrip.packageInclusions || []);

                        const finalTrip: TripPackage = {
                          ...editingTrip,
                          isAdultsOnly: !!editingTrip.isAdultsOnly,
                          childPrice: editingTrip.isAdultsOnly
                            ? undefined
                            : (typeof editingTrip.childPrice === 'number'
                                ? editingTrip.childPrice
                                : Math.round(editingTrip.price * 0.7)),
                          countryAcronym: editingTrip.countryAcronym ? editingTrip.countryAcronym.toUpperCase().trim() : '',
                          packageInclusions: finalInclusions,
                        };

                        // Calculate updated trips list
                        const updatedTrips = trips.some(t => t.id === finalTrip.id)
                          ? trips.map(t => t.id === finalTrip.id ? finalTrip : t)
                          : [finalTrip, ...trips];

                        // Save and sync trip across all backends & clients
                        saveTrip(finalTrip);
                        setEditingTrip(null);
                        showNotification('Trip Saved & Live for All Users', `Pushed "${finalTrip.name}" to cloud database and synced live.`);
                      }}
                      className="px-5 py-2 bg-[#2E0249] text-[#FFC72C] rounded-xl text-xs font-bold hover:bg-[#3B185F] transition-colors cursor-pointer shadow"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Destination Directory Management
                </h2>
                <p className="text-xs text-neutral-500">
                  Add, update or delete travel destinations, photography, and visiting advice.
                </p>
              </div>

              <button
                onClick={() => {
                  const newDest: Destination = {
                    id: `dest-${Date.now()}`,
                    slug: `dest-${Date.now()}`,
                    name: 'New Destination',
                    country: 'Caribbean',
                    countryCode: 'CB',
                    countryFlag: '🌴',
                    tagline: 'Tropical paradise awaits',
                    description: 'Detailed overview of this incredible travel destination.',
                    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
                    popularExperiences: ['Beach Relaxation', 'Cultural Tours', 'Local Dining'],
                    bestTimeToVisit: 'November to April',
                    visaOverview: 'Jamaican passport requirements vary.',
                    currencyInfo: 'Local currency accepted along with USD.',
                    featured: true,
                  };
                  setEditingDestination(newDest);
                }}
                className="bg-gradient-to-r from-[#2E0249] to-purple-900 hover:from-purple-900 hover:to-[#2E0249] text-[#FFC72C] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-[#FFC72C]/40 hover:border-[#FFC72C] transition-all flex items-center gap-2 cursor-pointer group"
                id="admin-add-destination-btn"
              >
                <div className="w-5 h-5 rounded-lg bg-[#FFC72C]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5 text-[#FFC72C]" />
                </div>
                <span className="font-extrabold tracking-wide">Add Destination</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 w-full bg-neutral-100">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {d.country}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      <h3 className="font-bold text-base text-neutral-900 font-['Outfit',sans-serif]">{d.name}</h3>
                      <p className="text-neutral-600 line-clamp-2">{d.description}</p>
                      <div className="pt-2 text-purple-900 font-semibold">
                        Best time: {d.bestTimeToVisit}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-neutral-100 flex items-center justify-between text-xs mt-2">
                    <span className="text-[10px] text-neutral-400 font-mono">ID: {d.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDestination(d)}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors font-semibold"
                      >
                        Edit Details & Image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete destination "${d.name}"?`)) {
                            deleteDestination(d.id);
                            showNotification('Destination Deleted', `Removed "${d.name}".`);
                          }
                        }}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete destination"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Destination Editor Modal */}
            {editingDestination && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                      Edit Destination: {editingDestination.name}
                    </h3>
                    <button onClick={() => setEditingDestination(null)} className="p-1 text-neutral-400 hover:text-neutral-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Destination Name</label>
                        <input
                          type="text"
                          value={editingDestination.name}
                          onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Country / Region</label>
                        <input
                          type="text"
                          value={editingDestination.country}
                          onChange={(e) => setEditingDestination({ ...editingDestination, country: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Best Time to Visit</label>
                      <input
                        type="text"
                        value={editingDestination.bestTimeToVisit}
                        onChange={(e) => setEditingDestination({ ...editingDestination, bestTimeToVisit: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                        placeholder="e.g. November to April"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingDestination.description}
                        onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>

                    {/* Destination Cover Image */}
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                      <ImageUploader
                        label="Destination Cover Image"
                        value={editingDestination.image}
                        onChange={(url) => setEditingDestination({ ...editingDestination, image: url })}
                        helperText="Upload or link high-resolution image for this destination."
                        aspectRatio="landscape"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDestination(null)}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveDestination(editingDestination);
                        setEditingDestination(null);
                        showNotification('Destination Saved', `Updated "${editingDestination.name}" across all devices.`);
                      }}
                      className="px-5 py-2 bg-[#2E0249] text-[#FFC72C] rounded-xl text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOG & GUIDES */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Travel Guides & Visa Advice CMS
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage sample travel guides and official visa checklists.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-100 text-[#2E0249] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {post.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      post.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-bold text-neutral-900 font-['Outfit',sans-serif] text-base">{post.title}</h3>
                  <p className="text-xs text-neutral-600 line-clamp-2">{post.excerpt}</p>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{post.readTime} • {post.date}</span>
                    <button
                      onClick={() => {
                        saveBlogPost({ ...post, isPublished: !post.isPublished });
                        showNotification('Status Updated', `Post is now ${!post.isPublished ? 'Published' : 'Draft'}.`);
                      }}
                      className="text-purple-900 font-bold hover:underline"
                    >
                      {post.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  FAQ Knowledge Base Management
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage questions and answers across all categories.
                </p>
              </div>

              <button
                onClick={() => {
                  const newFaq: FAQItem = {
                    id: `faq-${Date.now()}`,
                    question: 'New Frequently Asked Question',
                    answer: 'Answer explanation goes here.',
                    category: 'General Questions',
                    orderIndex: faqs.length + 1,
                  };
                  setEditingFaq(newFaq);
                }}
                className="bg-[#2E0249] text-[#FFC72C] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#2E0249] bg-purple-50 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <h4 className="font-bold text-sm text-neutral-900">{faq.question}</h4>
                    <p className="text-xs text-neutral-600 line-clamp-1">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this question?')) {
                          deleteFaq(faq.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Editor Modal */}
            {editingFaq && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="font-bold text-base font-['Outfit',sans-serif]">Edit FAQ</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Category</label>
                      <input
                        type="text"
                        value={editingFaq.category}
                        onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Question</label>
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Answer</label>
                      <textarea
                        rows={4}
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        className="w-full p-2 border border-neutral-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditingFaq(null)} className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-semibold">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        saveFaq(editingFaq);
                        setEditingFaq(null);
                        showNotification('FAQ Saved', 'Knowledge base updated and synced live to all users.');
                      }}
                      className="px-4 py-2 bg-[#2E0249] text-[#FFC72C] rounded-xl text-xs font-bold"
                    >
                      Save FAQ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Promotional Offers & Promo Codes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#2E0249] text-[#FFC72C] text-xs font-bold px-2.5 py-0.5 rounded">
                      {offer.badgeText}
                    </span>
                    <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded">
                      {offer.promoCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-900 text-base">{offer.title}</h3>
                  <p className="text-xs text-neutral-600">{offer.description}</p>
                  <p className="text-[11px] text-neutral-400 italic">{offer.terms}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Traveler Reviews & Testimonial Moderation
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage traveler reviews, moderate customer feedback, edit review details, and display date sent.
                </p>
              </div>

              <button
                onClick={() => {
                  setTestimonialForm({
                    customerName: '',
                    location: 'Kingston, Jamaica',
                    tripName: trips[0]?.name || 'Panama Experience 2026',
                    rating: 5,
                    reviewText: '',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    isPublished: true,
                    isSamplePlaceholder: false,
                  });
                  setEditingTestimonial(null);
                  setIsCreatingTestimonial(true);
                }}
                className="bg-[#2E0249] text-[#FFC72C] font-bold text-xs py-2.5 px-4 rounded-xl shadow hover:bg-[#3B185F] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                id="admin-add-review-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Verified Review</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < t.rating ? 'text-[#FFC72C] fill-[#FFC72C]' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Date of review sent */}
                        <div className="flex items-center gap-1 text-[11px] text-neutral-600 font-semibold bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                          <Calendar className="w-3 h-3 text-purple-700" />
                          <span>Sent: {t.date || 'Recent'}</span>
                        </div>

                        {t.isSamplePlaceholder && (
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                            Placeholder
                          </span>
                        )}

                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          t.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {t.isPublished ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 italic leading-relaxed">"{t.reviewText}"</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className="font-bold text-neutral-900 block">{t.customerName}</span>
                      <span className="text-neutral-500 text-[11px]">{t.location} • {t.tripName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setTestimonialForm({
                            customerName: t.customerName,
                            location: t.location,
                            tripName: t.tripName,
                            rating: t.rating,
                            reviewText: t.reviewText,
                            date: t.date || 'September 5, 2026',
                            isPublished: t.isPublished,
                            isSamplePlaceholder: t.isSamplePlaceholder || false,
                          });
                          setIsCreatingTestimonial(false);
                        }}
                        className="p-1.5 text-neutral-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                        title="Edit Review"
                        aria-label={`Edit review from ${t.customerName}`}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          saveTestimonial({ ...t, isPublished: !t.isPublished });
                          showNotification('Review Updated', `Review is now ${!t.isPublished ? 'Published' : 'Hidden'}.`);
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          t.isPublished ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {t.isPublished ? 'Hide' : 'Publish'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the review from ${t.customerName}?`)) {
                            deleteTestimonial(t.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Review"
                        aria-label={`Delete review from ${t.customerName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial Edit / Create Modal */}
            {(editingTestimonial || isCreatingTestimonial) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-[#2E0249] text-white p-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#FFC72C]" />
                      <h3 className="font-bold text-base font-['Outfit',sans-serif]">
                        {isCreatingTestimonial ? 'Add Verified Traveler Review' : `Edit Review: ${testimonialForm.customerName}`}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTestimonial(null);
                        setIsCreatingTestimonial(false);
                      }}
                      className="p-1 rounded-full text-neutral-300 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!testimonialForm.customerName.trim()) {
                        showNotification('Error', 'Customer name is required.', 'warning');
                        return;
                      }
                      if (!testimonialForm.reviewText.trim()) {
                        showNotification('Error', 'Review text is required.', 'warning');
                        return;
                      }

                      if (isCreatingTestimonial) {
                        addTestimonial({
                          customerName: testimonialForm.customerName.trim(),
                          location: testimonialForm.location.trim() || 'Jamaica',
                          rating: testimonialForm.rating,
                          reviewText: testimonialForm.reviewText.trim(),
                          tripName: testimonialForm.tripName.trim(),
                          date: testimonialForm.date.trim(),
                          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                          isPublished: testimonialForm.isPublished,
                          isSamplePlaceholder: testimonialForm.isSamplePlaceholder,
                        });
                        showNotification('Review Added', 'New traveler review has been saved.');
                      } else if (editingTestimonial) {
                        updateTestimonial(editingTestimonial.id, {
                          customerName: testimonialForm.customerName.trim(),
                          location: testimonialForm.location.trim(),
                          rating: testimonialForm.rating,
                          reviewText: testimonialForm.reviewText.trim(),
                          tripName: testimonialForm.tripName.trim(),
                          date: testimonialForm.date.trim(),
                          isPublished: testimonialForm.isPublished,
                          isSamplePlaceholder: testimonialForm.isSamplePlaceholder,
                        });
                        showNotification('Review Saved', 'Review updates were successfully committed.');
                      }

                      setEditingTestimonial(null);
                      setIsCreatingTestimonial(false);
                    }}
                    className="p-6 overflow-y-auto space-y-4 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Customer Full Name</label>
                      <input
                        type="text"
                        value={testimonialForm.customerName}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, customerName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-semibold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Parish / Location</label>
                        <input
                          type="text"
                          value={testimonialForm.location}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Trip Name</label>
                        <input
                          type="text"
                          value={testimonialForm.tripName}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, tripName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Rating</label>
                        <select
                          value={testimonialForm.rating}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs bg-white font-medium"
                        >
                          <option value={5}>★★★★★ 5 Stars</option>
                          <option value={4}>★★★★☆ 4 Stars</option>
                          <option value={3}>★★★☆☆ 3 Stars</option>
                          <option value={2}>★★☆☆☆ 2 Stars</option>
                          <option value={1}>★☆☆☆☆ 1 Star</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Date of Review Sent</label>
                        <input
                          type="text"
                          value={testimonialForm.date}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, date: e.target.value })}
                          placeholder="e.g. September 5, 2026"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Review Feedback Text</label>
                      <textarea
                        rows={4}
                        value={testimonialForm.reviewText}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, reviewText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testimonialForm.isPublished}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, isPublished: e.target.checked })}
                          className="rounded border-neutral-300 text-purple-900 focus:ring-purple-600"
                        />
                        <span className="font-semibold text-neutral-800">Publish on website</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testimonialForm.isSamplePlaceholder}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, isSamplePlaceholder: e.target.checked })}
                          className="rounded border-neutral-300 text-purple-900 focus:ring-purple-600"
                        />
                        <span className="text-neutral-500 text-[11px]">Mark as placeholder</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonial(null);
                          setIsCreatingTestimonial(false);
                        }}
                        className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#2E0249] text-[#FFC72C] font-black hover:bg-[#3B185F] shadow-sm cursor-pointer"
                      >
                        {isCreatingTestimonial ? 'Create Review' : 'Save Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: AGENCY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                    Agency & Ambassador Settings
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync Active
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure agency contact lines, banking information, and registered travel ambassadors. All updates deploy live across the website.
                </p>
                {lastSyncedTimestamp && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live synced with website at {lastSyncedTimestamp}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSyncingSettings}
                className={`group relative inline-flex items-center gap-2.5 font-black text-xs py-3 px-5 rounded-xl border shadow-md transition-all self-start sm:self-auto ${
                  isSyncingSettings
                    ? 'bg-[#2E0249] text-[#FFC72C] border-[#FFC72C]/40 opacity-90 cursor-wait'
                    : settingsSyncSuccess
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/20 cursor-pointer'
                    : 'bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] hover:from-[#3B185F] hover:via-[#4A156B] hover:to-[#3B185F] text-[#FFC72C] border-[#FFC72C]/50 hover:border-[#FFC72C] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isSyncingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#FFC72C] animate-spin" />
                    <span>Syncing Live to Site...</span>
                  </>
                ) : settingsSyncSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>✓ Live Synced!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#FFC72C] transition-transform duration-500 group-hover:rotate-180" />
                    <span>Save All Changes</span>
                    <span className="bg-[#FFC72C]/20 text-[#FFC72C] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FFC72C]/30 tracking-wider">
                      LIVE SYNC
                    </span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8 text-xs">
              {/* SECTION: TRIP POLICIES - ADULTS ONLY & CHILD PRICING (ADMIN SETTINGS) */}
              <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-200/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-800" />
                      <h3 className="text-sm font-black text-[#2E0249] uppercase tracking-wider">
                        Trip Age Policies & Child Pricing Controls
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Toggle <strong>Adults Only (18+)</strong> restrictions and customize <strong>Child Package Rates (JMD)</strong> per trip. Changes instantly deploy live across the entire website for all users.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <span>🔞</span>
                      <span>{trips.filter(t => t.isAdultsOnly).length} Adults Only</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span>👨‍👩‍👧</span>
                      <span>{trips.filter(t => !t.isAdultsOnly).length} Family Friendly</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {trips.map((trip) => {
                    const isAdultsOnly = !!trip.isAdultsOnly;
                    const effectiveChildPrice = tripChildPriceDrafts[trip.id] !== undefined
                      ? tripChildPriceDrafts[trip.id]!
                      : (trip.childPrice !== undefined ? trip.childPrice : Math.round(trip.price * 0.7));

                    return (
                      <div
                        key={trip.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          isAdultsOnly
                            ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Trip Identity */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={getSafeTripImageUrl(trip.featuredImage, trip.name)}
                              alt={trip.name}
                              onError={(e) => handleTripImageError(e, trip.name)}
                              referrerPolicy="no-referrer"
                              className="w-16 h-14 object-cover rounded-xl border border-neutral-200 shrink-0 shadow-xs"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-neutral-900 truncate">
                                  {trip.name}
                                </h4>
                                {isAdultsOnly ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                                    <span>🔞</span>
                                    <span>Adults Only (18+)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <span>👨‍👩‍👧</span>
                                    <span>Family Friendly</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                Adult Package Rate: <strong className="text-neutral-900">{formatPriceJMD(trip.price)}</strong> • Deposit: {formatPriceJMD(trip.deposit)}
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            {/* Adults Only Toggle */}
                            <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200">
                              <div className="text-left">
                                <span className="text-xs font-bold text-neutral-800 block">
                                  Adults Only (18+)
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  {isAdultsOnly ? 'Children blocked' : 'Children allowed'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleAdultsOnlyInSettings(trip)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  isAdultsOnly ? 'bg-rose-600' : 'bg-neutral-300'
                                }`}
                                title={isAdultsOnly ? 'Turn OFF Adults Only' : 'Turn ON Adults Only'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isAdultsOnly ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Child Price Control (if not adults only) */}
                            {!isAdultsOnly ? (
                              <div className="flex flex-wrap items-center gap-2 bg-purple-50/70 px-3 py-2 rounded-xl border border-purple-200">
                                <div className="space-y-0.5">
                                  <label className="text-xs font-bold text-purple-950 block">
                                    Child Rate (JMD):
                                  </label>
                                  <span className="text-[10px] text-neutral-500 block">
                                    Age 2–11
                                  </span>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400 font-bold">$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={effectiveChildPrice}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                                      setTripChildPriceDrafts(prev => ({ ...prev, [trip.id]: val }));
                                    }}
                                    className="w-24 pl-5 pr-2 py-1 text-xs font-bold text-purple-950 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  {[
                                    { label: '50%', ratio: 0.5 },
                                    { label: '60%', ratio: 0.6 },
                                    { label: '70%', ratio: 0.7 },
                                    { label: '80%', ratio: 0.8 },
                                  ].map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        const newP = Math.round(trip.price * preset.ratio);
                                        setTripChildPriceDrafts(prev => ({ ...prev, [trip.id]: newP }));
                                        handleSaveChildPriceInSettings(trip, newP);
                                      }}
                                      className="px-1.5 py-1 text-[10px] font-bold rounded bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors cursor-pointer"
                                      title={`Set to ${preset.label} (${formatPriceJMD(Math.round(trip.price * preset.ratio))})`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSaveChildPriceInSettings(trip)}
                                  className="px-3 py-1 bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                  Save Rate
                                </button>
                              </div>
                            ) : (
                              <div className="bg-rose-100/80 border border-rose-300 text-rose-900 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Child rate inactive (Package is strictly Adults Only)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: GENERAL CONTACT INFO */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-700" />
                  <span>Official Agency Communication</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Agency Phone</label>
                    <input
                      type="text"
                      value={localSettings.primaryPhone}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryPhone: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Agency Email</label>
                    <input
                      type="email"
                      value={localSettings.primaryEmail}
                      onChange={(e) => setLocalSettings({ ...localSettings, primaryEmail: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">WhatsApp Chat Number (Digits only)</label>
                    <input
                      type="text"
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Operating Base</label>
                    <input
                      type="text"
                      value={localSettings.operatingBase}
                      onChange={(e) => setLocalSettings({ ...localSettings, operatingBase: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">WhatsApp Default Message Template</label>
                  <textarea
                    rows={2}
                    value={localSettings.whatsappMessageTemplate}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappMessageTemplate: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              {/* SECTION: MULTIPLE AMBASSADORS ROSTER & MANDATORY SELECTION */}
              <div className="pt-6 border-t border-neutral-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-[#2E0249] flex items-center gap-2 font-['Outfit',sans-serif]">
                      <UserCheck className="w-5 h-5 text-purple-700" />
                      <span>Travel Ambassadors Program ({localSettings.ambassadors?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Add, update, or remove agency ambassadors. Travelers will pick from active ambassadors when reserving packages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openNewAmbassadorModal}
                    className="bg-[#2E0249] text-[#FFC72C] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#3B185F] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Ambassador</span>
                  </button>
                </div>

                {/* Mandatory Selection Rule Setting Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2E0249]">Mandatory Customer Selection</span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          localSettings.requireAmbassadorSelection !== false
                            ? 'bg-[#FFC72C] text-[#2E0249]'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {localSettings.requireAmbassadorSelection !== false ? 'Enforced / Mandatory' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 max-w-xl">
                      When enabled, customers <strong>must</strong> choose an ambassador from the roster before proceeding to deposit checkout and completing their booking.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedValue = localSettings.requireAmbassadorSelection === false ? true : false;
                      const updatedSettings = {
                        ...localSettings,
                        requireAmbassadorSelection: updatedValue,
                      };
                      setLocalSettings(updatedSettings);
                      updateSettings(updatedSettings);
                      showNotification(
                        updatedValue ? 'Mandatory Selection Enabled' : 'Mandatory Selection Disabled',
                        updatedValue
                          ? 'Customers are now strictly required to choose an ambassador.'
                          : 'Ambassador selection is now optional.'
                      );
                    }}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localSettings.requireAmbassadorSelection !== false ? 'bg-[#2E0249]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localSettings.requireAmbassadorSelection !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Ambassador Discount Percentage Setting Card */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-700" />
                        <span className="font-bold text-sm text-[#2E0249]">Ambassador Code Discount Rate</span>
                        <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                          Base {localSettings.ambassadorDiscountPercentage ?? 10}% Off
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 max-w-xl">
                        When travelers click <strong>"Use ambassador code"</strong> on checkout and enter an active staff code, this exact percentage is discounted from their trip total. Ambassador codes are strictly confidential to agency staff and are never exposed publicly on customer pages.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                      <label className="text-xs font-bold text-neutral-700">Rate:</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={localSettings.ambassadorDiscountPercentage ?? 10}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(90, parseInt(e.target.value) || 10));
                          const updated = { ...localSettings, ambassadorDiscountPercentage: val };
                          setLocalSettings(updated);
                          updateSettings(updated);
                        }}
                        className="w-14 text-center font-black text-sm text-[#2E0249] bg-amber-50/50 border border-amber-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="font-bold text-sm text-neutral-600">%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 text-xs">
                    <span className="text-neutral-500 font-medium">Quick presets:</span>
                    {[5, 10, 15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const updated = { ...localSettings, ambassadorDiscountPercentage: pct };
                          setLocalSettings(updated);
                          updateSettings(updated);
                          showNotification('Discount Rate Updated', `Ambassador code discount set to ${pct}%.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          (localSettings.ambassadorDiscountPercentage ?? 10) === pct
                            ? 'bg-[#2E0249] text-[#FFC72C]'
                            : 'bg-white border border-amber-300/80 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <span className="text-[11px] text-neutral-500 ml-auto italic">
                      Live sync enabled • Changes save to live website automatically
                    </span>
                  </div>
                </div>

                {/* Ambassador Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(localSettings.ambassadors || []).map((amb) => {
                    const isPrimary =
                      localSettings.ambassadorName &&
                      localSettings.ambassadorName.trim().toLowerCase() === amb.name.trim().toLowerCase();
                    const isActive = amb.isActive !== false;

                    return (
                      <div
                        key={amb.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPrimary
                            ? 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-300'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                              {amb.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-sm text-neutral-900">{amb.name}</h4>
                                {amb.code && (
                                  <span className="font-mono text-[10px] font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200">
                                    {amb.code}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500">{amb.title}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isPrimary && (
                              <span className="bg-[#FFC72C] text-[#2E0249] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Primary
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-neutral-600 py-2 border-y border-neutral-100 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Phone:</span>
                            <span className="font-semibold text-neutral-800">{amb.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Email:</span>
                            <span className="text-neutral-700 truncate max-w-[200px]">{amb.email}</span>
                          </div>
                          {amb.parishOrRegion && (
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400">Territory:</span>
                              <span className="font-medium text-neutral-700">{amb.parishOrRegion}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          {!isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryAmbassador(amb)}
                              className="text-[11px] font-bold text-purple-900 hover:text-purple-950 hover:underline cursor-pointer"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="text-[10px] text-purple-800 font-semibold italic">
                              Default agency contact
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleAmbassadorActive(amb.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditAmbassadorModal(amb)}
                              className="p-1.5 text-neutral-600 hover:text-[#2E0249] bg-neutral-50 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAmbassador(amb.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Delete ambassador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(!localSettings.ambassadors || localSettings.ambassadors.length === 0) && (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                    <UserCheck className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="font-bold text-neutral-700">No Ambassadors Registered</p>
                    <p className="text-xs text-neutral-500 mb-3">
                      Add your agency ambassadors so travelers can select their preferred agent during checkout.
                    </p>
                    <button
                      type="button"
                      onClick={openNewAmbassadorModal}
                      className="bg-[#2E0249] text-[#FFC72C] font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      + Register First Ambassador
                    </button>
                  </div>
                )}
              </div>

              {/* Company Bank Account & Deposit Payout Settings */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#2E0249] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-700" />
                      <span>Company Bank Account & Deposit Payouts</span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      All deposits paid by travelers online, via NCB bank transfer, or via Lynk display and credit these exact company account details.
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    Live In Checkout
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Company Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. National Commercial Bank (NCB) Jamaica"
                      value={localSettings.companyBanking?.bankName || ''}
                      onChange={(e) => updateBankingField('bankName', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Company Account Name (Beneficiary)</label>
                    <input
                      type="text"
                      placeholder="e.g. SMELTRAVELS876 LIMITED"
                      value={localSettings.companyBanking?.accountName || ''}
                      onChange={(e) => updateBankingField('accountName', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 354-928-1029"
                      value={localSettings.companyBanking?.accountNumber || ''}
                      onChange={(e) => updateBankingField('accountNumber', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Account Type</label>
                    <select
                      value={localSettings.companyBanking?.accountType || 'Chequing Account'}
                      onChange={(e) => updateBankingField('accountType', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    >
                      <option value="Chequing Account">Chequing Account (Business)</option>
                      <option value="Savings Account">Savings Account (Business)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Bank Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Half-Way-Tree Branch, Kingston"
                      value={localSettings.companyBanking?.branch || ''}
                      onChange={(e) => updateBankingField('branch', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">SWIFT / Routing Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. JNCBJMKX"
                      value={localSettings.companyBanking?.swiftOrRoutingCode || ''}
                      onChange={(e) => updateBankingField('swiftOrRoutingCode', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Lynk Jamaica Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. @smeltravels876"
                      value={localSettings.companyBanking?.lynkHandle || ''}
                      onChange={(e) => updateBankingField('lynkHandle', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Lynk Associated Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. (876) 848-9772"
                      value={localSettings.companyBanking?.lynkPhone || ''}
                      onChange={(e) => updateBankingField('lynkPhone', e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Agency Office Address (In-Person Holds)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 Trafalgar Road, Suite 4B, Kingston 10, Jamaica"
                    value={localSettings.companyBanking?.officeDepositAddress || ''}
                    onChange={(e) => updateBankingField('officeDepositAddress', e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Payment Instructions / Notes for Traveler</label>
                  <textarea
                    rows={2}
                    value={localSettings.companyBanking?.paymentInstructions || ''}
                    onChange={(e) => updateBankingField('paymentInstructions', e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-neutral-600">
                  <span className="font-bold text-neutral-900 block">Instant Live Deployment:</span>
                  <span>Saving pushes all agency phone numbers, floating WhatsApp settings, banking instructions, and ambassador roster directly to the live customer-facing website.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSyncingSettings}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-black text-xs py-3.5 px-8 rounded-xl border shadow-lg transition-all ${
                    isSyncingSettings
                      ? 'bg-[#2E0249] text-[#FFC72C] border-[#FFC72C]/40 opacity-90 cursor-wait'
                      : settingsSyncSuccess
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/30 cursor-pointer'
                      : 'bg-gradient-to-r from-[#2E0249] via-[#381255] to-[#2E0249] hover:from-[#3B185F] hover:via-[#4A156B] hover:to-[#3B185F] text-[#FFC72C] border-[#FFC72C]/60 hover:border-[#FFC72C] hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isSyncingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-[#FFC72C] animate-spin" />
                      <span>Pushing Changes to Live Website...</span>
                    </>
                  ) : settingsSyncSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>✓ All Settings Live Synced to Website!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#FFC72C]" />
                      <span>Save Agency & Bank Settings</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Website Sync
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* AMBASSADOR MODAL (Add / Edit) */}
      {ambassadorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-neutral-300 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 font-['Outfit',sans-serif]">
                    {editingAmbassadorId ? 'Edit Ambassador' : 'Add New Ambassador'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {editingAmbassadorId ? 'Update contact & assignment details' : 'Register a new agent for customer bookings'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAmbassadorModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAmbassadorModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Ambassador Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerry-Ann Gordon"
                  value={ambassadorForm.name}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, name: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Official Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Ambassador"
                    value={ambassadorForm.title}
                    onChange={(e) => setAmbassadorForm({ ...ambassadorForm, title: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Staff / Agent Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KAG876"
                    value={ambassadorForm.code}
                    onChange={(e) => setAmbassadorForm({ ...ambassadorForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(876) 555-0199"
                    value={ambassadorForm.phone}
                    onChange={(e) => setAmbassadorForm({ ...ambassadorForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Parish / Territory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. St. Ann & Ochi"
                    value={ambassadorForm.parishOrRegion}
                    onChange={(e) => setAmbassadorForm({ ...ambassadorForm, parishOrRegion: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. kerry@smeltravels876.com"
                  value={ambassadorForm.email}
                  onChange={(e) => setAmbassadorForm({ ...ambassadorForm, email: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={ambassadorForm.isActive}
                    onChange={(e) => setAmbassadorForm({ ...ambassadorForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-bold text-neutral-800 block text-xs">Active on Booking Screen</span>
                    <span className="text-[11px] text-neutral-500">Travelers can select this ambassador when making reservations</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setAmbassadorModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2E0249] text-[#FFC72C] hover:bg-[#3B185F] rounded-xl font-bold transition-all shadow cursor-pointer"
                >
                  {editingAmbassadorId ? 'Save Changes' : 'Add Ambassador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
