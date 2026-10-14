import React, { useState } from 'react';
import {
  Sparkles,
  Plane,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  Car,
  Hotel,
  ArrowRight,
  Compass,
  Calendar,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  MessageCircle,
  Tag,
  Zap,
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const {
    navigateTo,
    trips,
    localTrips,
    settings,
    openCustomTripModal,
    openLocalTripDetail,
    openLocalTripInquiry,
    setSelectedTripForInquiry,
  } = useApp();
  const [selectedYear, setSelectedYear] = useState<'all' | '2026' | '2027'>('all');
  const [selectedDest, setSelectedDest] = useState<string>('all');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDest !== 'all') {
      navigateTo('trips', selectedDest);
    } else if (selectedYear !== 'all') {
      navigateTo('trips', selectedYear);
    } else {
      navigateTo('trips');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2E0249] via-[#381254] to-[#1F0333] text-white pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FFC72C] blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-purple-600 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-[#FFC72C]">
              <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-pulse"></span>
              <span>SMELTRAVELS876 • GROUP TRAVEL EXPERIENCES</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] font-['Outfit',sans-serif]">
              Travel More. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] via-[#FFE17D] to-[#FFC72C]">
                Worry Less.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-neutral-200 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Discover unforgettable group travel experiences with SMELTRAVELS876. From Caribbean getaways to international adventures, we make planning your next trip easier.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigateTo('trips')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-[#FFC72C]/25 hover:scale-102 active:scale-98 transition-all"
                id="hero-explore-trips-btn"
              >
                <span>Explore Group Trips</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => openCustomTripModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-800/90 via-purple-900/90 to-[#2E0249] hover:from-purple-700 hover:to-[#3F0463] text-white hover:text-[#FFC72C] font-bold text-base px-7 py-4 rounded-xl border-2 border-[#FFC72C]/70 hover:border-[#FFC72C] backdrop-blur-md shadow-xl shadow-purple-950/40 hover:scale-102 active:scale-98 transition-all group cursor-pointer"
                id="hero-plan-trip-btn"
              >
                <Sparkles className="w-5 h-5 text-[#FFC72C] group-hover:rotate-12 transition-transform" />
                <span>Create Your Own Trip</span>
                <span className="text-[11px] bg-[#FFC72C] text-[#2E0249] font-black px-2.5 py-0.5 rounded-full ml-1 shadow-xs">
                  Any Country
                </span>
              </button>
            </div>

            {/* Trust Indicators Pill Row */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Organized group travel</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Flexible payment plans</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Travel document assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Airport transfer options</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Hotel className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Carefully selected accommodations</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column - DYNAMIC FEATURED TRIP (LOCAL OR ABROAD) */}
          <div className="lg:col-span-5 relative">
            {(() => {
              // Priority 1: Admin-configured Featured Hero Trip from settings
              const heroConfig = settings.featuredHeroTrip;

              // Find matching local trip or abroad trip if linked
              const matchedLocalTrip = localTrips.find(
                (lt) =>
                  lt.id === heroConfig?.selectedTripId ||
                  lt.slug === heroConfig?.targetSlugOrId ||
                  lt.id === 'royalton-negril-flash-sale-2026'
              ) || localTrips[0];

              const matchedAbroadTrip = trips.find(
                (t) => t.id === heroConfig?.selectedTripId || t.slug === heroConfig?.targetSlugOrId
              );

              // Determine if local or abroad
              const isLocal =
                heroConfig?.tripType === 'local' ||
                (!heroConfig?.tripType && (heroConfig?.selectedTripId?.includes('royalton') || !!matchedLocalTrip));

              // Effective values with defaults matching user's requested Royalton Negril Flash Sale
              const badgeText = heroConfig?.badgeText || '🚨🌴 FLASH SALE ALERT! 🇯🇲✈️';
              const cardTitle =
                heroConfig?.title ||
                (isLocal ? matchedLocalTrip?.title : matchedAbroadTrip?.name) ||
                'Royalton Negril Resort & Spa';
              const cardDates =
                heroConfig?.dates ||
                (isLocal ? matchedLocalTrip?.availableDates : matchedAbroadTrip?.dates) ||
                'October 30 – November 1, 2026';
              const cardLocation =
                heroConfig?.location ||
                (isLocal ? matchedLocalTrip?.location : `${matchedAbroadTrip?.destination}, ${matchedAbroadTrip?.country}`) ||
                'Royalton Negril, Jamaica';
              const cardPrice =
                heroConfig?.priceDisplay ||
                (isLocal ? `$${matchedLocalTrip?.price.toLocaleString()}` : `$${matchedAbroadTrip?.price?.toLocaleString()}`) ||
                '$108,000';
              const cardPriceSubtitle =
                heroConfig?.priceSubtitle ||
                (isLocal ? (matchedLocalTrip?.priceType || 'for 2 adults') : 'JMD / person') ||
                'JMD for 2 adults';
              const promoHighlight = heroConfig?.promoHighlight || '👶🏽 Bring ONE child FREE! 🎉';
              const displayImage =
                heroConfig?.imageUrl || matchedLocalTrip?.featuredImage || '/images/royalton_negril_resort.jpg';

              const inclusionsList =
                heroConfig?.inclusions && heroConfig.inclusions.length > 0
                  ? heroConfig.inclusions
                  : [
                      'Two (2) Adults Package: $108,000 JMD',
                      '👶🏽 Bring ONE child FREE! 🎉',
                      'All-Inclusive Resort (Seven Mile Beach)',
                      'Unlimited Gourmet Dining & Premium Drinks',
                      'Spa Services, Fitness Centre & Activities',
                    ];

              const handleFeaturedBooking = () => {
                if (isLocal && matchedLocalTrip) {
                  openLocalTripInquiry(matchedLocalTrip);
                } else if (!isLocal && matchedAbroadTrip) {
                  navigateTo('trip-detail', matchedAbroadTrip.slug);
                } else if (matchedLocalTrip) {
                  openLocalTripInquiry(matchedLocalTrip);
                } else {
                  navigateTo('local-trips');
                }
              };

              const handleFeaturedDetails = () => {
                if (isLocal && matchedLocalTrip) {
                  openLocalTripDetail(matchedLocalTrip.id);
                } else if (!isLocal && matchedAbroadTrip) {
                  navigateTo('trip-detail', matchedAbroadTrip.slug);
                } else {
                  navigateTo('local-trips');
                }
              };

              return (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FFC72C]/40 bg-[#1F0333]/95 backdrop-blur-md">
                  {/* Glowing aura */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-amber-500/20 blur-xl opacity-75 -z-10 pointer-events-none" />

                  {/* Top Image Banner */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 group">
                    <img
                      src={displayImage}
                      alt={cardTitle}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/heroes_weekend_royalton.jpg';
                      }}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F0333] via-black/25 to-black/40"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="bg-gradient-to-r from-amber-400 via-[#FFC72C] to-amber-400 text-[#2E0249] text-xs font-black uppercase px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 tracking-wide animate-pulse">
                        <Zap className="w-3.5 h-3.5 fill-[#2E0249]" />
                        <span>{badgeText}</span>
                      </span>

                      <span className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20 shadow-xs">
                        <Calendar className="w-3 h-3 text-[#FFC72C]" />
                        <span>{cardDates}</span>
                      </span>
                    </div>

                    {/* Scope Pill (Local Trip vs Abroad) */}
                    <div className="absolute top-12 left-3">
                      <span className="bg-purple-900/90 text-white border border-purple-400/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md shadow-sm">
                        {isLocal ? '🇯🇲 LOCAL JAMAICAN TRIP' : '✈️ ABROAD GROUP TRIP'}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-1 text-[11px] text-[#FFC72C] font-semibold mb-0.5">
                        <MapPin className="w-3 h-3 text-[#FFC72C]" />
                        <span>{cardLocation}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] text-white leading-tight drop-shadow-md">
                        {cardTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 space-y-4">
                    {/* Special Offer Highlight Banner */}
                    <div className="bg-gradient-to-r from-amber-400/15 via-[#FFC72C]/25 to-amber-400/15 border border-[#FFC72C]/50 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-amber-200 font-extrabold uppercase tracking-wider block">
                          Special Flash Offer
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
                            {cardPrice}
                          </span>
                          <span className="text-xs text-[#FFC72C] font-bold">
                            {cardPriceSubtitle}
                          </span>
                        </div>
                      </div>

                      {promoHighlight && (
                        <div className="text-right">
                          <span className="inline-block bg-[#FFC72C] text-[#2E0249] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm animate-bounce">
                            {promoHighlight}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Highlights / Inclusions Checklist */}
                    <div className="space-y-1.5 text-xs text-neutral-200">
                      {inclusionsList.slice(0, 4).map((inc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                          <span className="line-clamp-1">{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        onClick={handleFeaturedBooking}
                        className="w-full sm:flex-1 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-sm py-3 px-4 rounded-xl text-center shadow-lg hover:scale-101 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Book Flash Sale Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://wa.me/18768341537?text=${encodeURIComponent(
                          `Hello Smeltravels876! I am interested in booking the ${cardTitle} (${cardDates}) for ${cardPrice}. Please secure my spot!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/40 flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-102"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                        <span>(876) 834-1537</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/10">
                      <button
                        onClick={handleFeaturedDetails}
                        className="text-neutral-300 hover:text-[#FFC72C] underline font-medium cursor-pointer"
                      >
                        View Full Details & Inclusions
                      </button>
                      <span className="text-amber-300 font-semibold">
                        ✨ Travel More • Stress Less!
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Floating Quick Trip Search Bar */}
        <div className="mt-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 md:p-6 text-neutral-800 border border-white/40">
          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Travel Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as any)}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="all">All Departure Years</option>
                <option value="2026">2026 (Panama Part 2)</option>
                <option value="2027">2027 Group Trips Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Destination
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="all">All Destinations</option>
                <option value="mexico-2026">Mexico (Nov 2026)</option>
                <option value="panama-2026">Panama (Oct 2026)</option>
                <option value="antigua-2027">Antigua (Jan 2027)</option>
                <option value="germany-italy-2027">Germany + Italy (Feb 2027)</option>
                <option value="punta-cana-2027">Punta Cana (Mar 2027)</option>
                <option value="medellin-2027">Medellín (May 2027)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Trip Style
              </label>
              <div className="bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-700 font-medium truncate">
                Organized Group & All-Inclusive
              </div>
            </div>

            <div className="pt-2 sm:pt-0">
              <label className="hidden lg:block text-xs font-bold uppercase tracking-wider text-transparent mb-1">
                Search
              </label>
              <button
                type="submit"
                className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                id="hero-quick-search-submit"
              >
                <Compass className="w-4 h-4" />
                <span>Find Your Group Trip</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
