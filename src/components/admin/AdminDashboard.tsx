import React, { useState } from 'react';
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
  Search,
  ExternalLink,
  Building2,
  CreditCard,
  QrCode,
  Lock,
  LogOut,
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import { BookingInquiry, TripPackage, BlogPost, FAQItem, PromotionalOffer, TestimonialItem, Destination } from '../../types';
import { AdminLoginLock } from './AdminLoginLock';
import { ImageUploader } from './ImageUploader';
import { MultiGalleryUploader } from './MultiGalleryUploader';

export const AdminDashboard: React.FC = () => {
  const {
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

  const [activeTab, setActiveTab] = useState<'inquiries' | 'trips' | 'destinations' | 'guides' | 'faqs' | 'offers' | 'testimonials' | 'settings'>('inquiries');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<BookingInquiry | null>(null);

  // Quick edit trip state
  const [editingTrip, setEditingTrip] = useState<TripPackage | null>(null);

  // Quick edit destination state
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Quick edit FAQ state
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  // Quick edit offer state
  const [editingOffer, setEditingOffer] = useState<PromotionalOffer | null>(null);

  // Settings form state
  const [localSettings, setLocalSettings] = useState(settings);

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    showNotification('Settings Updated', 'Agency details and contact numbers updated.');
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
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-mono font-bold">
                  UNLOCKED
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
            { id: 'inquiries', label: `Inquiries (${bookings.length})`, icon: Inbox },
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
                        <td colSpan={7} className="p-8 text-center text-neutral-500">
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
                    destination: 'New Destination',
                    countryFlag: '✈️',
                    year: 2027,
                    dates: 'Dates TBA',
                    price: 250000,
                    deposit: 40000,
                    currency: 'JMD',
                    status: 'Coming Soon',
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
                <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">{t.countryFlag}</span>
                          <span className="text-xs font-bold text-purple-900">{t.year}</span>
                          {t.is2026Featured && <span className="bg-[#FFC72C] text-[#2E0249] text-[9px] px-1.5 py-0.5 rounded font-black">2026 FEATURED</span>}
                          {t.is2027Collection && <span className="bg-purple-100 text-purple-900 text-[9px] px-1.5 py-0.5 rounded font-bold">2027 COLLECTION</span>}
                          {t.gallery && t.gallery.length > 0 && (
                            <span className="bg-neutral-100 text-neutral-600 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                              +{t.gallery.length} photos
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-neutral-900 font-['Outfit',sans-serif] text-base">{t.name}</h3>
                        <p className="text-xs text-neutral-500">{t.dates} • {t.hotel}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-neutral-900">{formatPriceJMD(t.price)}</div>
                      <div className="text-[11px] text-neutral-500">Dep: {formatPriceJMD(t.deposit)}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
                      Status: {t.status}
                    </span>

                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingTrip(t)}
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Trip Name</label>
                        <input
                          type="text"
                          value={editingTrip.name}
                          onChange={(e) => setEditingTrip({ ...editingTrip, name: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Dates</label>
                        <input
                          type="text"
                          value={editingTrip.dates}
                          onChange={(e) => setEditingTrip({ ...editingTrip, dates: e.target.value })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
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
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Deposit (JMD)</label>
                        <input
                          type="number"
                          value={editingTrip.deposit}
                          onChange={(e) => setEditingTrip({ ...editingTrip, deposit: Number(e.target.value) })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 block mb-1">Year</label>
                        <select
                          value={editingTrip.year}
                          onChange={(e) => setEditingTrip({ ...editingTrip, year: Number(e.target.value) })}
                          className="w-full p-2 border border-neutral-300 rounded-xl"
                        >
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                        </select>
                      </div>
                    </div>

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
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        saveTrip(editingTrip);
                        setEditingTrip(null);
                        showNotification('Trip Saved', `Updated "${editingTrip.name}"`);
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
                        showNotification('Destination Saved', `Updated "${editingDestination.name}"`);
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
                        showNotification('FAQ Saved', 'Knowledge base updated.');
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Traveler Reviews & Testimonial Moderation
                </h2>
                <p className="text-xs text-neutral-500">
                  Replace sample staging placeholders with verified reviews received from travelers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {t.isSamplePlaceholder && (
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                        Demo Placeholder
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-700 italic">"{t.reviewText}"</p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">{t.customerName}</span>
                      <span className="text-neutral-500 text-[11px]">{t.tripName}</span>
                    </div>

                    <button
                      onClick={() => {
                        saveTestimonial({ ...t, isPublished: !t.isPublished });
                        showNotification('Review Updated', `Review is now ${!t.isPublished ? 'Published' : 'Hidden'}.`);
                      }}
                      className="text-purple-900 font-bold hover:underline"
                    >
                      {t.isPublished ? 'Hide from Site' : 'Show on Site'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AGENCY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Official Agency & Contact Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Ambassador Name</label>
                  <input
                    type="text"
                    value={localSettings.ambassadorName}
                    onChange={(e) => setLocalSettings({ ...localSettings, ambassadorName: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Ambassador Phone</label>
                  <input
                    type="text"
                    value={localSettings.ambassadorPhone}
                    onChange={(e) => setLocalSettings({ ...localSettings, ambassadorPhone: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Ambassador Email</label>
                <input
                  type="email"
                  value={localSettings.ambassadorEmail}
                  onChange={(e) => setLocalSettings({ ...localSettings, ambassadorEmail: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: e.target.value,
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Company Account Name (Beneficiary)</label>
                    <input
                      type="text"
                      placeholder="e.g. SMELTRAVELS876 LIMITED"
                      value={localSettings.companyBanking?.accountName || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: e.target.value,
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 354-928-1029"
                      value={localSettings.companyBanking?.accountNumber || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: e.target.value,
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Account Type</label>
                    <select
                      value={localSettings.companyBanking?.accountType || 'Chequing Account'}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: e.target.value,
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
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
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: e.target.value,
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">SWIFT / Routing Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. JNCBJMKX"
                      value={localSettings.companyBanking?.swiftOrRoutingCode || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: e.target.value,
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Lynk Jamaica Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. @smeltravels876"
                      value={localSettings.companyBanking?.lynkHandle || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: e.target.value,
                          lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Lynk Associated Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. (876) 848-9772"
                      value={localSettings.companyBanking?.lynkPhone || ''}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        companyBanking: {
                          bankName: localSettings.companyBanking?.bankName || '',
                          accountName: localSettings.companyBanking?.accountName || '',
                          accountNumber: localSettings.companyBanking?.accountNumber || '',
                          accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                          branch: localSettings.companyBanking?.branch || '',
                          swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                          lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                          lynkPhone: e.target.value,
                          officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                          cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                          cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                          paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                        }
                      })}
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
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      companyBanking: {
                        bankName: localSettings.companyBanking?.bankName || '',
                        accountName: localSettings.companyBanking?.accountName || '',
                        accountNumber: localSettings.companyBanking?.accountNumber || '',
                        accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                        branch: localSettings.companyBanking?.branch || '',
                        swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                        lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                        lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                        officeDepositAddress: e.target.value,
                        cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                        cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                        paymentInstructions: localSettings.companyBanking?.paymentInstructions || '',
                      }
                    })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Payment Instructions / Notes for Traveler</label>
                  <textarea
                    rows={2}
                    value={localSettings.companyBanking?.paymentInstructions || ''}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      companyBanking: {
                        bankName: localSettings.companyBanking?.bankName || '',
                        accountName: localSettings.companyBanking?.accountName || '',
                        accountNumber: localSettings.companyBanking?.accountNumber || '',
                        accountType: localSettings.companyBanking?.accountType || 'Chequing Account',
                        branch: localSettings.companyBanking?.branch || '',
                        swiftOrRoutingCode: localSettings.companyBanking?.swiftOrRoutingCode || '',
                        lynkHandle: localSettings.companyBanking?.lynkHandle || '',
                        lynkPhone: localSettings.companyBanking?.lynkPhone || '',
                        officeDepositAddress: localSettings.companyBanking?.officeDepositAddress || '',
                        cardGatewayProvider: localSettings.companyBanking?.cardGatewayProvider || '',
                        cardGatewayMerchantId: localSettings.companyBanking?.cardGatewayMerchantId || '',
                        paymentInstructions: e.target.value,
                      }
                    })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#2E0249] text-[#FFC72C] font-bold text-xs py-3 px-6 rounded-xl shadow transition-all cursor-pointer hover:bg-[#3B185F]"
              >
                Save Agency & Bank Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
