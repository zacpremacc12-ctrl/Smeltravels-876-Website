import React, { useEffect } from 'react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import {
  Bookmark,
  X,
  ArrowRight,
  Calendar,
  MapPin,
  Trash2,
  Sparkles,
  Plus,
  ShieldCheck,
  Plane,
} from 'lucide-react';
import { getSafeTripImageUrl, handleTripImageError } from '../../lib/imageUtils';
import { AnimatePresence, motion } from 'motion/react';
import { TripPackage } from '../../types';

export const SavedTripsDrawer: React.FC = () => {
  const {
    trips,
    savedTrips,
    savedTripIds,
    isSavedTripsDrawerOpen,
    closeSavedTripsDrawer,
    toggleSaveTrip,
    clearAllSavedTrips,
    navigateTo,
    secureSpotForTrip,
  } = useApp();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSavedTripsDrawerOpen) {
        closeSavedTripsDrawer();
      }
    };
    if (isSavedTripsDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSavedTripsDrawerOpen, closeSavedTripsDrawer]);

  const handleSecureSpot = (trip: TripPackage) => {
    closeSavedTripsDrawer();
    secureSpotForTrip(trip);
  };

  const handleViewTrip = (trip: TripPackage) => {
    closeSavedTripsDrawer();
    navigateTo('trip-detail', trip.slug || trip.id);
  };

  const handleBrowseTrips = () => {
    closeSavedTripsDrawer();
    navigateTo('trips');
  };

  // Recommended trips if empty or to discover
  const suggestedTrips = trips.filter((t) => !savedTripIds.includes(t.id)).slice(0, 3);

  return (
    <AnimatePresence>
      {isSavedTripsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="saved-trips-drawer-portal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            onClick={closeSavedTripsDrawer}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200"
              role="dialog"
              aria-modal="true"
              aria-labelledby="saved-trips-title"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 bg-[#2E0249] text-white flex items-center justify-between border-b border-purple-900/60 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center shadow-md shrink-0">
                    <Bookmark className="w-5 h-5 fill-current text-[#2E0249]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 id="saved-trips-title" className="text-lg font-black font-['Outfit',sans-serif] tracking-tight">
                        Saved Trips
                      </h2>
                      <span className="bg-[#FFC72C] text-[#2E0249] text-xs font-black px-2 py-0.5 rounded-full font-mono shadow-xs">
                        {savedTrips.length}
                      </span>
                    </div>
                    <p className="text-xs text-purple-200 truncate">
                      {savedTrips.length === 1 ? '1 package bookmarked' : `${savedTrips.length} packages bookmarked`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSavedTripsDrawer}
                  className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]/50"
                  aria-label="Close saved trips drawer"
                  id="close-saved-trips-drawer-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {savedTrips.length === 0 ? (
                  <div className="py-8 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-inner border border-purple-100">
                        <Bookmark className="w-8 h-8 text-purple-600 stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
                          No Saved Trips Yet
                        </h3>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                          Click the bookmark icon on any trip card or package to save it here for quick access, comparison, and booking.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBrowseTrips}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E0249] text-[#FFC72C] text-xs font-bold shadow-md hover:bg-[#3B185F] transition-all cursor-pointer hover:scale-102 active:scale-98"
                        id="empty-drawer-browse-btn"
                      >
                        <span>Explore 2026 & 2027 Trips</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Recommendations to Bookmark */}
                    {suggestedTrips.length > 0 && (
                      <div className="pt-4 border-t border-neutral-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700 font-['Outfit',sans-serif] uppercase tracking-wider">
                            Recommended Trips
                          </span>
                          <span className="text-[10px] text-neutral-400">1-click bookmark</span>
                        </div>

                        <div className="space-y-2.5">
                          {suggestedTrips.map((trip) => (
                            <div
                              key={trip.id}
                              className="p-2.5 bg-neutral-50 hover:bg-purple-50/40 rounded-xl border border-neutral-200 transition-all flex items-center justify-between gap-2.5"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={getSafeTripImageUrl(trip.featuredImage, trip.name)}
                                  alt={trip.name}
                                  onError={(e) => handleTripImageError(e, trip.name)}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-neutral-900 truncate leading-snug">
                                    {trip.name}
                                  </h4>
                                  <p className="text-[10px] text-neutral-500 truncate">
                                    {trip.dates} • {formatPriceJMD(trip.price)}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleSaveTrip(trip.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-purple-900 hover:text-[#FFC72C] text-neutral-700 border border-neutral-200 text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                                title={`Save ${trip.name} to wishlist`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 pb-1 border-b border-neutral-100">
                      <span>
                        {savedTrips.length} {savedTrips.length === 1 ? 'Package' : 'Packages'} Bookmarked
                      </span>
                      <span className="text-[11px] text-purple-800 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ready to reserve</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {savedTrips.map((trip) => {
                        const tripImg = trip.featuredImage;
                        const tripPrice = trip.price;
                        const tripDeposit = trip.deposit;

                        return (
                          <div
                            key={trip.id}
                            className="bg-neutral-50/70 rounded-2xl p-3.5 border border-neutral-200 hover:border-purple-300 transition-all space-y-3 group shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex gap-3">
                              <div
                                onClick={() => handleViewTrip(trip)}
                                className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-neutral-200 cursor-pointer"
                              >
                                <img
                                  src={getSafeTripImageUrl(tripImg, trip.name)}
                                  alt={trip.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleTripImageError(e, trip.name)}
                                />
                                {trip.isAdultsOnly && (
                                  <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                                    18+
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <h4
                                    onClick={() => handleViewTrip(trip)}
                                    className="font-bold text-xs text-neutral-900 hover:text-purple-900 cursor-pointer truncate font-['Outfit',sans-serif] leading-tight"
                                    title={trip.name}
                                  >
                                    {trip.name}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => toggleSaveTrip(trip.id)}
                                    className="text-neutral-400 hover:text-rose-600 p-1 rounded-md hover:bg-white transition-colors shrink-0 cursor-pointer"
                                    title="Remove from saved trips"
                                    aria-label={`Remove ${trip.name} from saved trips`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                                  <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span className="truncate">{trip.destination || trip.country}</span>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                                  <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">{trip.dates}</span>
                                </div>

                                <div className="mt-2 flex items-baseline justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] text-neutral-500 block">Total Rate:</span>
                                    <span className="text-xs font-black text-[#2E0249]">
                                      {formatPriceJMD(tripPrice)}
                                    </span>
                                  </div>
                                  {tripDeposit && (
                                    <div className="text-right">
                                      <span className="text-[10px] text-amber-700 font-bold block">Deposit:</span>
                                      <span className="text-xs font-black text-amber-800">
                                        {formatPriceJMD(tripDeposit)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/80">
                              <button
                                type="button"
                                onClick={() => handleViewTrip(trip)}
                                className="w-full py-2 px-3 text-[11px] font-bold text-neutral-700 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 text-center transition-colors cursor-pointer"
                              >
                                View Itinerary
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSecureSpot(trip)}
                                className="w-full py-2 px-3 text-[11px] font-bold text-[#2E0249] bg-[#FFC72C] hover:bg-amber-300 rounded-xl shadow-2xs text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-[#2E0249]/70 fill-current" />
                                <span>Secure Spot</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {savedTrips.length > 0 && (
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs shrink-0">
                  <button
                    type="button"
                    onClick={clearAllSavedTrips}
                    className="text-neutral-500 hover:text-rose-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    id="clear-all-saved-trips-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBrowseTrips}
                    className="text-purple-800 hover:text-purple-950 font-bold flex items-center gap-1 cursor-pointer"
                    id="drawer-browse-more-btn"
                  >
                    <span>Browse more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
