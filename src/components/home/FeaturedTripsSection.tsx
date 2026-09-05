import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Plane } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripCard } from '../common/TripCard';

export const FeaturedTripsSection: React.FC = () => {
  const { trips, navigateTo } = useApp();

  const panamaTrip = trips.find(t => t.id === 'panama-2026' || t.is2026Featured);
  const otherUpcoming = trips.filter(t => t.id !== 'panama-2026' && !t.is2026Featured).slice(0, 2);

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

        {/* Highlight 2026 Panama Trip Banner Card */}
        {panamaTrip && (
          <div className="mb-14 bg-gradient-to-br from-[#2E0249] to-[#3B185F] rounded-3xl overflow-hidden shadow-xl text-white border border-purple-900/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[420px]">
                <img
                  src={panamaTrip.featuredImage}
                  alt={panamaTrip.name}
                  className="w-full h-full object-cover"
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#FFC72C] uppercase tracking-wider mb-2">
                    <span>{panamaTrip.countryFlag} {panamaTrip.country}</span>
                    <span>•</span>
                    <span>{panamaTrip.dates}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-['Outfit',sans-serif] text-white leading-tight">
                    {panamaTrip.name}
                  </h3>

                  <p className="text-neutral-200 text-sm sm:text-base mt-3 leading-relaxed">
                    {panamaTrip.fullDescription}
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-200">
                    {panamaTrip.packageInclusions.map((inc, i) => (
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
                      ${panamaTrip.price.toLocaleString()}{' '}
                      <span className="text-xs text-[#FFC72C] font-semibold">JMD / person</span>
                    </span>
                    <span className="text-xs text-amber-300 block mt-0.5">
                      Deposit: ${panamaTrip.deposit.toLocaleString()} JMD
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateTo('trips', panamaTrip.slug)}
                      className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
                    >
                      View Panama Package
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other trips quick grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otherUpcoming.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </section>
  );
};
