import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Plane, Lock, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripCard } from '../common/TripCard';
import { getSafeTripImageUrl, handleTripImageError } from '../../lib/imageUtils';

export const FeaturedTripsSection: React.FC = () => {
  const { trips, navigateTo, openWiPayCheckout } = useApp();

  const openTrips = trips.filter(t => !t.isPastTrip && t.status !== 'Past Trip' && t.status !== 'Closed');
  const pastTrips = trips.filter(t => t.isPastTrip || t.status === 'Past Trip');

  // Priority to Mexico package for 2026 featured trip, or first open upcoming trip
  const featuredTrip = openTrips.find(t => t.country.toLowerCase().includes('mexico') || t.id.includes('mexico'))
    || openTrips.find(t => t.id === 'panama-2026' || t.is2026Featured)
    || openTrips[0]
    || trips[0];

  const otherUpcoming = openTrips.filter(t => t.id !== featuredTrip?.id).slice(0, 2);

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-neutral-200" id="trips">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-current" />
              <span>UPCOMING GROUP TRIPS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
              Featured Group Adventures
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-xl">
              Curated international itineraries crafted for Caribbean travelers. Flights, hotels, airport transfers, and guided excursions all coordinated for you.
            </p>
          </div>

          <button
            onClick={() => navigateTo('trips')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2E0249] hover:text-[#3B185F] group"
          >
            <span>View All Group Packages</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Highlight Featured Trip Banner Card */}
        {featuredTrip && (
          <div className="mb-14 bg-gradient-to-br from-[#2E0249] to-[#3B185F] rounded-3xl overflow-hidden shadow-xl text-white border border-purple-900/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[420px]">
                <img
                  src={getSafeTripImageUrl(featuredTrip.featuredImage, `${featuredTrip.destination} ${featuredTrip.country}`)}
                  alt={featuredTrip.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleTripImageError(e, `${featuredTrip.destination} ${featuredTrip.country}`)}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#2E0249]/80"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFC72C] text-[#2E0249] text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                    ★ 2026 FEATURED TRIP
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#FFC72C] uppercase tracking-wider mb-2 flex-wrap">
                    <span>{featuredTrip.countryFlag} {featuredTrip.country}</span>
                    {featuredTrip.countryAcronym && (
                      <span className="bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded font-black text-[11px] tracking-wider uppercase shadow-xs">
                        {featuredTrip.countryAcronym}
                      </span>
                    )}
                    <span>•</span>
                    <span>{featuredTrip.dates}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                      {featuredTrip.status}
                    </span>
                    {featuredTrip.availabilityNote && (
                      <span className="px-2 py-0.5 rounded bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/40 text-[10px] font-bold">
                        {featuredTrip.availabilityNote}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-['Outfit',sans-serif] text-white leading-tight">
                    {featuredTrip.name}
                  </h3>

                  <p className="text-neutral-200 text-sm sm:text-base mt-3 leading-relaxed">
                    {featuredTrip.fullDescription}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-200">
                    {featuredTrip.packageInclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]"></span>
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-300 block">Package Price</span>
                    <span className="text-3xl font-black text-white font-['Outfit',sans-serif]">
                      ${featuredTrip.price.toLocaleString()}{' '}
                      <span className="text-xs text-[#FFC72C] font-semibold">JMD / person</span>
                    </span>
                    <span className="text-xs text-amber-300 block mt-0.5">
                      Deposit: ${featuredTrip.deposit.toLocaleString()} JMD
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigateTo('trip-detail', featuredTrip.slug)}
                      className="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-3 rounded-xl border border-white/20 transition-all cursor-pointer"
                    >
                      View Full Details
                    </button>

                    {featuredTrip.status === 'Closed' ? (
                      <button
                        type="button"
                        disabled={true}
                        className="bg-white/20 text-white/50 font-bold text-sm px-6 py-3 rounded-xl cursor-not-allowed flex items-center gap-1.5 border border-white/10"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Bookings Closed</span>
                      </button>
                    ) : (featuredTrip.status === 'Past Trip' || featuredTrip.isPastTrip) ? (
                      <button
                        onClick={() => navigateTo('trip-detail', featuredTrip.slug)}
                        className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 fill-current" />
                        <span>View Photos & Videos</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openWiPayCheckout({
                            tripId: featuredTrip.id,
                            title: featuredTrip.name,
                            deposit: featuredTrip.deposit,
                            totalPrice: featuredTrip.price,
                            dates: featuredTrip.dates,
                            location: `${featuredTrip.destination}, ${featuredTrip.country}`,
                          })
                        }
                        disabled={featuredTrip.status === 'Sold Out'}
                        className={`font-black text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          featuredTrip.status === 'Sold Out'
                            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                            : 'bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249]'
                        }`}
                        title={featuredTrip.status === 'Sold Out' ? 'Package Sold Out' : 'Book Now (Pay Deposit) with secure WiPay Jamaica checkout'}
                      >
                        <Sparkles className="w-4 h-4 fill-current" />
                        <span>{featuredTrip.status === 'Sold Out' ? 'Sold Out' : 'Book Now (Pay Deposit)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other trips quick grid */}
        {otherUpcoming.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherUpcoming.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Completed Past Trips & Traveler Memories Showcase Strip */}
        {pastTrips.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider mb-2">
                  <Camera className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  <span>TRAVELER MEMORIES & RECAPS</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
                  Completed Past Trips & Photo Galleries
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm mt-1 max-w-xl">
                  Relive the authentic moments, smiles, excursions, and video highlights shared by Jamaican travelers on our completed tours!
                </p>
              </div>

              <button
                onClick={() => navigateTo('trips')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-900 hover:text-purple-700 cursor-pointer"
              >
                <span>Browse All Past Trips ({pastTrips.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTrips.slice(0, 3).map((past) => (
                <TripCard key={past.id} trip={past} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
