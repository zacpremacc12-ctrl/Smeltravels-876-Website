import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bookmark, X, ArrowRight, Calendar, MapPin, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

export const SavedTripsDrawer: React.FC = () => {
  const {
    savedTrips,
    isSavedTripsDrawerOpen,
    closeSavedTripsDrawer,
    toggleSaveTrip,
    navigateTo,
    currentUser,
    secureSpotForTrip,
  } = useApp();

  if (!isSavedTripsDrawerOpen) return null;

  const handleSecureSpot = (trip: any) => {
    closeSavedTripsDrawer();
    secureSpotForTrip(trip);
  };

  const handleViewTrip = (trip: any) => {
    closeSavedTripsDrawer();
    navigateTo('trip-detail', trip.slug || trip.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeSavedTripsDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 bg-[#2E0249] text-white flex items-center justify-between border-b border-purple-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center shadow">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black font-['Outfit',sans-serif]">Saved Trips</h2>
                  <span className="bg-white/20 text-[#FFC72C] text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                    {savedTrips.length}
                  </span>
                </div>
                <p className="text-xs text-purple-200">Bookmarked travel packages to revisit</p>
              </div>
            </div>

            <button
              onClick={closeSavedTripsDrawer}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close saved trips drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {savedTrips.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
                  <Bookmark className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    No Saved Trips Yet
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Click the small bookmark icon on any trip card or package to save it here so you can easily compare and secure your spot later.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeSavedTripsDrawer();
                    navigateTo('trips');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E0249] text-[#FFC72C] text-xs font-bold shadow hover:bg-[#3B185F] transition-all cursor-pointer"
                >
                  <span>Explore 2026 & 2027 Trips</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 pb-1 border-b border-neutral-100">
                  <span>{savedTrips.length} {savedTrips.length === 1 ? 'Package' : 'Packages'} Bookmarked</span>
                  <span className="text-[11px] text-purple-700 font-medium">Ready to reserve</span>
                </div>

                {savedTrips.map((trip: any) => {
                  const tripImg = trip.featuredImage || trip.image;
                  const tripName = trip.name || trip.title;
                  const tripPrice = trip.price ?? trip.priceJMD;
                  const tripDeposit = trip.deposit ?? trip.depositJMD;

                  return (
                    <div
                      key={trip.id}
                      className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200 hover:border-purple-300 transition-all space-y-3 group"
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-neutral-200">
                          <img
                            src={tripImg}
                            alt={tripName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4
                              onClick={() => handleViewTrip(trip)}
                              className="font-bold text-xs text-neutral-900 hover:text-purple-900 cursor-pointer truncate font-['Outfit',sans-serif]"
                            >
                              {tripName}
                            </h4>
                            <button
                              onClick={() => toggleSaveTrip(trip.id)}
                              className="text-neutral-400 hover:text-rose-600 p-1 rounded-md hover:bg-white transition-colors shrink-0 cursor-pointer"
                              title="Remove from saved trips"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{trip.destination || trip.country}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{trip.dates}</span>
                          </div>

                          <div className="mt-2 flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-neutral-500 block">Total:</span>
                              <span className="text-xs font-black text-[#2E0249]">
                                ${tripPrice ? tripPrice.toLocaleString() : '0'} JMD
                              </span>
                            </div>
                            {tripDeposit && (
                              <div className="text-right">
                                <span className="text-[10px] text-amber-700 font-bold block">Deposit:</span>
                                <span className="text-xs font-black text-amber-800">
                                  ${tripDeposit.toLocaleString()} JMD
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/80">
                        <button
                          onClick={() => handleViewTrip(trip)}
                          className="w-full py-2 px-3 text-[11px] font-bold text-neutral-700 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 text-center transition-colors cursor-pointer"
                        >
                          View Itinerary
                        </button>

                        <button
                          onClick={() => handleSecureSpot(trip)}
                          className="w-full py-2 px-3 text-[11px] font-bold text-[#2E0249] bg-[#FFC72C] hover:bg-amber-300 rounded-xl shadow-xs text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#2E0249]/70 fill-current" />
                          <span>Secure Spot</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {savedTrips.length > 0 && (
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  savedTrips.forEach((t) => toggleSaveTrip(t.id));
                }}
                className="text-neutral-500 hover:text-rose-600 transition-colors font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>

              <button
                onClick={() => {
                  closeSavedTripsDrawer();
                  navigateTo('trips');
                }}
                className="text-purple-800 hover:text-purple-950 font-bold flex items-center gap-1"
              >
                <span>Browse more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
