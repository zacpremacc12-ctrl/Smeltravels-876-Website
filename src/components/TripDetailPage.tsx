import React, { useState } from 'react';
import {
  Calendar,
  Hotel,
  Plane,
  Car,
  Check,
  X as XIcon,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  Sparkles,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  Info
} from 'lucide-react';
import { TripPackage } from '../types';
import { useApp, formatPriceJMD } from '../context/AppContext';

interface TripDetailPageProps {
  slug: string;
}

export const TripDetailPage: React.FC<TripDetailPageProps> = ({ slug }) => {
  const { trips, navigateTo, setSelectedTripForBooking, settings, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'inclusions' | 'itinerary' | 'requirements' | 'payment'>('overview');

  const trip = trips.find(t => t.slug === slug || t.id === slug) || trips[0];

  if (!trip) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Trip Package Not Found</h2>
        <button
          onClick={() => navigateTo('trips')}
          className="mt-4 bg-[#2E0249] text-[#FFC72C] text-sm font-bold px-6 py-2.5 rounded-xl"
        >
          Return to Trips
        </button>
      </div>
    );
  }

  const remainingBalance = trip.price - trip.deposit;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trip.name} | SMELTRAVELS876`,
        text: `Check out this group trip to ${trip.destination} with SMELTRAVELS876!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link Copied', 'Trip URL copied to clipboard.');
    }
  };

  const getWhatsAppBookingLink = () => {
    const text = `Hi SMELTRAVELS876! I am interested in booking the "${trip.name}" (${trip.dates}) package. Please send me further details.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Back Navigation Bar */}
      <div className="bg-white border-b border-neutral-200 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigateTo('trips')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-[#2E0249] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Group Trips</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Trip</span>
            </button>

            <button
              onClick={() => setSelectedTripForBooking(trip)}
              className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Secure Your Spot
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative bg-[#1A1824] text-white">
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={trip.featuredImage}
            alt={trip.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1824] via-black/40 to-transparent"></div>

          <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto sm:px-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
                <span className="text-xl">{trip.countryFlag}</span>
                <span>{trip.country}</span>
                <span>•</span>
                <span>{trip.destination}</span>
                {trip.is2026Featured && (
                  <span className="bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded text-[11px] font-black">
                    2026 FEATURED
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Outfit',sans-serif] text-white leading-tight">
                {trip.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#FFC72C]" />
                  <span>{trip.dates}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Hotel className="w-4 h-4 text-[#FFC72C]" />
                  <span>{trip.hotel}</span>
                </span>
              </div>
            </div>

            {/* Pricing Card on Desktop */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-white min-w-[280px]">
              <div className="text-xs text-neutral-300 uppercase tracking-wider">Package Rate</div>
              <div className="text-3xl font-black font-['Outfit',sans-serif] text-white">
                {formatPriceJMD(trip.price)}
              </div>
              <div className="text-xs text-[#FFC72C] font-semibold mt-0.5">
                Lock in with {formatPriceJMD(trip.deposit)} deposit
              </div>
              {trip.occupancyNote && (
                <div className="text-[11px] text-neutral-300 mt-1">{trip.occupancyNote}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'inclusions', label: 'Inclusions & Services' },
                { id: 'itinerary', label: 'Day-by-Day Itinerary' },
                { id: 'requirements', label: 'Travel & Visa Requirements' },
                { id: 'payment', label: 'Payment Plan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#2E0249] text-[#FFC72C]'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    Experience Summary
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                    {trip.fullDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-1">
                      <span className="text-xs font-bold text-[#2E0249] uppercase tracking-wider block">
                        Accommodation
                      </span>
                      <p className="text-sm font-semibold text-neutral-900">{trip.hotel}</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-1">
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                        Baggage Included
                      </span>
                      <p className="text-sm font-semibold text-neutral-900">{trip.baggageInfo}</p>
                    </div>
                  </div>
                </div>

                {/* Photo Gallery Grid */}
                {trip.gallery && trip.gallery.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
                      Destination Gallery
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {trip.gallery.map((img, i) => (
                        <div key={i} className="h-40 rounded-xl overflow-hidden bg-neutral-100 shadow-xs">
                          <img src={img} alt={`${trip.destination} view ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Inclusions & Exclusions */}
            {activeTab === 'inclusions' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif] flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Package Inclusions</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Everything listed below is covered in your all-inclusive package price.
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trip.packageInclusions.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-neutral-800">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100">
                    <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif] flex items-center gap-2">
                      <XIcon className="w-4 h-4 text-rose-500" />
                      <span>Exclusions</span>
                    </h3>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {trip.exclusions.map((exc, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></span>
                          <span>{exc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Itinerary */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                        Day-by-Day Schedule
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Planned timeline for our group travel experience.
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                      {trip.dates}
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {trip.itinerary.map((day) => (
                      <div
                        key={day.day}
                        className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-[#2E0249] bg-white px-2.5 py-1 rounded-md border border-neutral-200 shadow-xs">
                            Day {day.day}
                          </span>
                          <span className="text-xs font-bold text-neutral-800">{day.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 pl-1 pt-1">
                          {day.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                    <span>
                      <strong>Notice:</strong> Specific day-to-day excursion departure times and meeting points will be delivered to confirmed travelers in their departure packet.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Requirements & Schengen */}
            {activeTab === 'requirements' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    Travel Documents & Visa Guidance
                  </h3>

                  {trip.requiresSchengenVisa && (
                    <div className="bg-purple-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>IMPORTANT TRAVEL REQUIREMENT</span>
                      </div>
                      <h4 className="text-lg font-bold font-['Outfit',sans-serif]">
                        Schengen Visa Required for Germany & Italy
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                        Clients will need a valid Schengen Visa to enter Frankfurt, Germany and Milan, Italy. 
                        <strong> SMELTRAVELS876 provides dedicated Schengen Visa assistance</strong>, including certified flight reservation vouchers, hotel booking proof, itinerary documentation, and embassy appointment checklists.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                      General Requirements
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-neutral-700">
                      {trip.travelRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#2E0249] shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Visa Regulations Summary
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {trip.visaRequirements}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Payment Plan */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    Pricing Breakdown & Payment Schedules
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                      <span className="text-xs text-neutral-500 uppercase font-semibold block">Total Package</span>
                      <span className="text-2xl font-black text-[#2E0249] font-['Outfit',sans-serif] block mt-1">
                        {formatPriceJMD(trip.price)}
                      </span>
                      <span className="text-[11px] text-neutral-500">Per person</span>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <span className="text-xs text-amber-800 uppercase font-semibold block">Initial Deposit</span>
                      <span className="text-2xl font-black text-amber-900 font-['Outfit',sans-serif] block mt-1">
                        {formatPriceJMD(trip.deposit)}
                      </span>
                      <span className="text-[11px] text-amber-700">Secures your spot</span>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <span className="text-xs text-purple-900 uppercase font-semibold block">Remaining Balance</span>
                      <span className="text-2xl font-black text-[#2E0249] font-['Outfit',sans-serif] block mt-1">
                        {formatPriceJMD(remainingBalance)}
                      </span>
                      <span className="text-[11px] text-purple-700">Pay in installments</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200 space-y-2">
                    <h4 className="text-sm font-bold text-neutral-900">How the Payment Plan Works:</h4>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {trip.paymentPlanInfo}
                    </p>
                    <p className="text-xs text-neutral-500 italic pt-1">
                      Our coordinator works with you to establish a monthly installment timeline tailored around your travel date.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Booking Box */}
            <div className="bg-white rounded-3xl p-6 border-2 border-purple-900/20 shadow-lg space-y-5 sticky top-28">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                  Reserve Your Spot
                </span>
                <div className="text-3xl font-black text-neutral-900 font-['Outfit',sans-serif] mt-1">
                  {formatPriceJMD(trip.price)}
                </div>
                <div className="text-xs text-neutral-500">
                  Initial deposit: <strong className="text-[#2E0249]">{formatPriceJMD(trip.deposit)}</strong>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setSelectedTripForBooking(trip)}
                  className="w-full bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  id="package-secure-spot-btn"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Secure Your Spot</span>
                </button>

                <button
                  onClick={() => setSelectedTripForBooking(trip)}
                  className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  id="package-ask-trip-btn"
                >
                  <span>Ask About This Trip</span>
                </button>

                <a
                  href={getWhatsAppBookingLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Inclusions summary list */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Flights & Airport Transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotel Accommodation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2 Paid Destination Excursions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Travel Document Preparation</span>
                </div>
              </div>

              {/* Direct Travel Specialist Contact */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                <span className="font-bold text-neutral-800 block">Direct Inquiries:</span>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#2E0249]" />
                  <span>{settings.primaryPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#2E0249]" />
                  <span className="truncate">{settings.primaryEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
