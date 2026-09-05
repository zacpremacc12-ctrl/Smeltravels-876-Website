import React from 'react';
import { Sparkles, CheckCircle2, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripCard } from '../common/TripCard';

export const GroupTrips2027Section: React.FC = () => {
  const { trips, navigateTo } = useApp();

  // Filter 2027 trips: Antigua, Germany + Italy, Punta Cana, Medellin
  const trips2027 = trips.filter(t => t.year === 2027 || t.is2027Collection);

  return (
    <section className="py-20 bg-white border-b border-neutral-200" id="trips-2027">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#2E0249] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#2E0249] fill-current" />
            <span>SMELTRAVELS876 GROUP TRIPS 2027</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Three destinations. Three unforgettable experiences. <br className="hidden sm:inline" />
            <span className="text-[#2E0249]">One year of memories!</span>
          </h2>

          <p className="text-neutral-600 text-base sm:text-lg">
            Plan ahead for 2027 with our premier collection of international journeys, from Caribbean all-inclusive beaches to dual-country European culture and Colombian mountain highlands.
          </p>

          {/* Standard Inclusions Callout Banner */}
          <div className="mt-6 bg-[#FAF9F6] border-2 border-purple-900/20 rounded-2xl p-5 text-left shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E0249]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standard 2027 Package Inclusions</span>
                </div>
                <p className="text-sm font-semibold text-neutral-800">
                  Every package includes flights, hotel, roundtrip airport transfers, trip memorabilia, travel document preparation + 2 paid excursions!
                </p>
              </div>

              <div className="shrink-0 bg-[#2E0249] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FFC72C]" />
                <span>Payment plans available after your deposit is made.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2027 Trips Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trips2027.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* Bottom Booking Notice */}
        <div className="mt-12 text-center bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Ready to reserve your 2027 international vacation?
            </h4>
            <p className="text-xs text-neutral-600">
              Initial deposits are open. Secure your preferred package early to lock in your double occupancy rate.
            </p>
          </div>
          <button
            onClick={() => navigateTo('trips', '2027')}
            className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm px-6 py-3 rounded-xl shadow transition-all shrink-0 flex items-center gap-2"
          >
            <span>View All 2027 Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
