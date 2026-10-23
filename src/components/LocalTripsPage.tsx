import React, { useState, useMemo } from 'react';
import { useApp, formatPriceJMD } from '../context/AppContext';
import { LocalTrip, TripPackage } from '../types';
import { LocalTripDetailModal } from './common/LocalTripDetailModal';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Tag,
  Users,
  Eye,
  Info,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

export const LocalTripsPage: React.FC = () => {
  const {
    localTrips,
    localTripsPageSettings,
    setSelectedTripForBooking,
    openCustomTripModal,
    settings,
    navigateTo,
    selectedLocalTripDetail,
    setSelectedLocalTripDetail,
    openLocalTripDetail,
    openWiPayCheckout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title'>('featured');
  const [activeModalTrip, setActiveModalTrip] = useState<LocalTrip | null>(null);

  // Available categories based on settings and active trips
  const categories = useMemo(() => {
    const list = localTripsPageSettings.categories && localTripsPageSettings.categories.length > 0
      ? localTripsPageSettings.categories
      : ['Weekend Getaways', 'Beach Trips', 'Adventure', 'Cultural Experiences', 'Nature & Hiking', 'Group Outings', 'Family Trips', 'Other'];
    return ['All', ...list];
  }, [localTripsPageSettings.categories]);

  // Filtered trips list (only published trips for customer view)
  const filteredTrips = useMemo(() => {
    return localTrips
      .filter((t) => t.isPublished !== false)
      .filter((trip) => {
        if (selectedCategory !== 'All' && trip.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = trip.title.toLowerCase().includes(q);
          const matchLocation = trip.location.toLowerCase().includes(q);
          const matchDesc = trip.description.toLowerCase().includes(q);
          const matchSub = trip.subtitle?.toLowerCase().includes(q) || false;
          const matchCat = trip.category.toLowerCase().includes(q);
          return matchTitle || matchLocation || matchDesc || matchSub || matchCat;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        }
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [localTrips, selectedCategory, searchQuery, sortBy]);

  const handleOpenBooking = (trip: LocalTrip) => {
    openWiPayCheckout({
      tripId: trip.id,
      title: trip.title,
      deposit: trip.deposit || Math.round(trip.price * 0.3),
      totalPrice: trip.price,
      dates: trip.availableDates || trip.duration,
      location: trip.location,
    });
    setActiveModalTrip(null);
    setSelectedLocalTripDetail(null);
  };

  const currentDetailTrip = selectedLocalTripDetail || activeModalTrip;

  const getStatusBadge = (status: LocalTrip['status']) => {
    switch (status) {
      case 'Limited Spots':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Limited Spots
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Available
          </span>
        );
      case 'Sold Out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Sold Out
          </span>
        );
      case 'Coming Soon':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
            Coming Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {/* Hero / Page Header */}
      <section className="relative bg-gradient-to-b from-[#2E0249] via-[#3B185F] to-neutral-900 pt-16 pb-14 border-b border-purple-900/40 overflow-hidden">
        {/* Decorative backdrop elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFC72C_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFC72C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 mb-4">
            <button onClick={() => navigateTo('home')} className="hover:text-[#FFC72C] transition-colors">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-[#FFC72C] font-bold">Local Trips</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#FFC72C]/30 text-[#FFC72C] text-xs font-black tracking-wide uppercase mb-4 shadow-sm backdrop-blur-sm">
              <Compass className="w-4 h-4 text-[#FFC72C]" />
              <span>{localTripsPageSettings.heroBadge || 'Authentic Jamaican Experiences'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {localTripsPageSettings.pageTitle || 'Local Trips'}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
              {localTripsPageSettings.introText ||
                'Discover Jamaica, one unforgettable experience at a time. Explore local trips, breathtaking destinations, cultural experiences, and exciting adventures curated by SMELTRAVELS876.'}
            </p>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="mt-8 bg-neutral-900/90 border border-purple-800/40 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
              {/* Search input */}
              <div className="md:col-span-8 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Jamaican trips, parish, hotel, or getaway..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] transition-all"
                  id="local-trips-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="md:col-span-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-800/90 border border-neutral-700 text-white text-xs font-semibold focus:outline-none focus:border-[#FFC72C] transition-all"
                  id="local-trips-sort-select"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#FFC72C]" />
                Filter:
              </span>
              {categories.map((cat) => {
                const count =
                  cat === 'All'
                    ? localTrips.filter((t) => t.isPublished !== false).length
                    : localTrips.filter((t) => t.isPublished !== false && t.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#FFC72C] text-[#2E0249] shadow-md shadow-[#FFC72C]/20'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700/60'
                    }`}
                    id={`category-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-[#2E0249]/20 text-[#2E0249]' : 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Trips Grid Section */}
      <section className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Result summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Explore Jamaican Getaways</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-900/80 text-[#FFC72C] border border-[#FFC72C]/30">
                {filteredTrips.length} {filteredTrips.length === 1 ? 'Trip' : 'Trips'}
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Handcrafted local trips across Jamaica with low deposit options and hassle-free booking.
            </p>
          </div>

          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#FFC72C] hover:underline self-start sm:self-auto font-bold flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredTrips.map((trip) => {
              const opts = trip.displayOptions || {
                showPrice: true,
                showDeposit: true,
                showDates: true,
                showDuration: true,
                showLocation: true,
                showAvailability: true,
                showCategory: true,
                showInclusions: true,
              };

              return (
                <article
                  key={trip.id}
                  className="bg-neutral-800/90 rounded-2xl border border-neutral-700/80 overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#FFC72C]/50 transition-all duration-300 flex flex-col group"
                  id={`local-trip-card-${trip.id}`}
                >
                  {/* Trip Card Image & Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                    <img
                      src={trip.featuredImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      {opts.showCategory && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2E0249]/90 text-[#FFC72C] border border-[#FFC72C]/40 backdrop-blur-md shadow-sm">
                          {trip.category}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        {trip.isFeatured && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFC72C] text-[#2E0249] shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        )}
                        {opts.showAvailability && getStatusBadge(trip.status)}
                      </div>
                    </div>

                    {/* Bottom overlay metadata */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      {opts.showLocation && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                          <span className="truncate">{trip.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trip Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {trip.subtitle && (
                        <div className="text-[11px] font-bold text-[#FFC72C] uppercase tracking-wider mb-1">
                          {trip.subtitle}
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#FFC72C] transition-colors">
                        {trip.title}
                      </h3>

                      {/* Date & Duration Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                        {opts.showDates && trip.availableDates && (
                          <div className="inline-flex items-center gap-1 bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-neutral-700/50">
                            <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
                            <span>{trip.availableDates}</span>
                          </div>
                        )}
                        {opts.showDuration && trip.duration && (
                          <div className="inline-flex items-center gap-1 bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-neutral-700/50">
                            <Clock className="w-3.5 h-3.5 text-[#FFC72C]" />
                            <span>{trip.duration}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                        {trip.description}
                      </p>

                      {/* Inclusions preview */}
                      {opts.showInclusions && trip.inclusions && trip.inclusions.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-neutral-700/60">
                          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                            Key Inclusions:
                          </div>
                          <ul className="space-y-1">
                            {trip.inclusions.slice(0, 2).map((inc, i) => (
                              <li key={i} className="text-xs text-neutral-200 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Pricing & Actions */}
                    <div className="mt-5 pt-4 border-t border-neutral-700/80">
                      <div className="flex items-end justify-between gap-2 mb-3.5">
                        {opts.showPrice ? (
                          <div>
                            <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                              Package Rate ({trip.priceType || 'Per Person'})
                            </div>
                            <div className="text-xl font-extrabold text-[#FFC72C] leading-none mt-1">
                              {formatPriceJMD(trip.price)}
                            </div>
                            {opts.showDeposit && trip.deposit && trip.deposit > 0 && (
                              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                                Low Deposit: {formatPriceJMD(trip.deposit)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-neutral-400">Inquire for pricing</div>
                          </div>
                        )}

                        <button
                          onClick={() => openLocalTripDetail(trip.id)}
                          className="text-xs text-neutral-300 hover:text-white font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-700/60 hover:bg-neutral-700 transition-colors cursor-pointer"
                          id={`view-details-btn-${trip.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openLocalTripDetail(trip.id)}
                          className="py-2.5 px-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-neutral-600 cursor-pointer"
                        >
                          <span>Full Overview</span>
                        </button>

                        <button
                          onClick={() => handleOpenBooking(trip)}
                          disabled={trip.status === 'Sold Out'}
                          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                            trip.status === 'Sold Out'
                              ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                              : 'bg-[#FFC72C] text-[#2E0249] hover:bg-amber-300 hover:shadow-[#FFC72C]/20'
                          }`}
                          id={`book-trip-btn-${trip.id}`}
                          title="Book Now (Pay Deposit) with secure WiPay Jamaica checkout"
                        >
                          <span>Book Now (Pay Deposit)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-neutral-800/40 rounded-3xl border border-neutral-800 max-w-2xl mx-auto p-8">
            <Compass className="w-12 h-12 text-[#FFC72C] mx-auto opacity-70 mb-3" />
            <h3 className="text-lg font-bold text-white">No Local Trips Found</h3>
            <p className="text-xs text-neutral-300 mt-2">
              We couldn't find any trips matching your current filter criteria. Try clearing your search or selecting
              another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#FFC72C] text-[#2E0249] text-xs font-black hover:bg-amber-300 transition-all shadow-md"
            >
              Show All Local Trips
            </button>
          </div>
        )}

        {/* Custom Jamaican Excursion Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-purple-950 border border-[#FFC72C]/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFC72C] text-[#2E0249] inline-block mb-2.5">
                Bespoke Island Group & Private Tours
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Looking for a Custom Local Trip or Private Excursion?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 mt-2 leading-relaxed">
                Planning a parish road trip, family beach day, church retreat, corporate team-builder, or luxury villa
                weekend in Jamaica? Our local travel experts can organize private luxury buses, vetted drivers, resort
                day passes, catering, and VIP island experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => openCustomTripModal('Jamaica')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FFC72C] text-[#2E0249] text-xs sm:text-sm font-black hover:bg-amber-300 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                id="cta-custom-local-trip-btn"
              >
                <Sparkles className="w-4 h-4 text-[#2E0249]" />
                <span>Request Custom Local Trip (Select Dates)</span>
              </button>

              <a
                href={`https://wa.me/18768341537?text=${encodeURIComponent(
                  "Hello SMELTRAVELS876, I'm interested in booking or customizing a local Jamaican trip / excursion!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Trip Detail Modal */}
      {activeModalTrip && !selectedLocalTripDetail && (
        <LocalTripDetailModal
          trip={activeModalTrip}
          onClose={() => setActiveModalTrip(null)}
        />
      )}
    </div>
  );
};
