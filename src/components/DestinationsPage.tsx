import React, { useState } from 'react';
import { Compass, MapPin, ArrowRight, ArrowLeft, Calendar, Plane, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Destination } from '../types';

interface DestinationsPageProps {
  initialSlug?: string | null;
}

export const DestinationsPage: React.FC<DestinationsPageProps> = ({ initialSlug }) => {
  const { destinations, trips, navigateTo } = useApp();
  const [activeDestSlug, setActiveDestSlug] = useState<string | null>(initialSlug || null);

  const activeDestination = activeDestSlug ? destinations.find(d => d.slug === activeDestSlug || d.id === activeDestSlug) : null;

  if (activeDestination) {
    const relatedTrips = trips.filter(
      t => t.destination.toLowerCase().includes(activeDestination.name.toLowerCase()) ||
           t.country.toLowerCase().includes(activeDestination.country.toLowerCase()) ||
           (activeDestination.slug === 'frankfurt' && t.id.includes('germany')) ||
           (activeDestination.slug === 'milan' && t.id.includes('germany'))
    );

    return (
      <div className="bg-[#FAF9F6] min-h-screen pb-20">
        <div className="bg-white border-b border-neutral-200 py-3 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setActiveDestSlug(null)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-[#2E0249] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Destination Directory</span>
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative h-80 sm:h-96 w-full bg-neutral-900 overflow-hidden">
          <img
            src={activeDestination.heroImage}
            alt={activeDestination.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto sm:px-4 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>{activeDestination.country}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-['Outfit',sans-serif]">
              {activeDestination.name}
            </h1>
            <p className="text-sm sm:text-base text-neutral-200 max-w-2xl">
              {activeDestination.tagline}
            </p>
          </div>
        </div>

        {/* Destination Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  About {activeDestination.name}
                </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                  {activeDestination.description}
                </p>

                <div className="pt-6 border-t border-neutral-100 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                    Popular Experiences & Highlights
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDestination.popularExperiences.map((exp, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 text-xs sm:text-sm text-neutral-800 border border-purple-100">
                        <CheckCircle2 className="w-4 h-4 text-[#2E0249] shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Trips */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Available Group Trips to {activeDestination.name}
                </h3>
                {relatedTrips.length > 0 ? (
                  <div className="space-y-4">
                    {relatedTrips.map((rt) => (
                      <div
                        key={rt.id}
                        className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={rt.featuredImage}
                            alt={rt.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#2E0249] block">{rt.dates}</span>
                            <h4 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
                              {rt.name}
                            </h4>
                            <p className="text-xs text-neutral-500">{rt.hotel}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-xs text-neutral-500 block">From</span>
                            <span className="text-lg font-black text-neutral-900">${rt.price.toLocaleString()} JMD</span>
                          </div>
                          <button
                            onClick={() => navigateTo('trip-detail', rt.slug)}
                            className="bg-[#2E0249] text-[#FFC72C] hover:bg-[#3B185F] text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            View Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 bg-white p-4 rounded-xl border border-neutral-200">
                    Additional private custom packages available on request through our travel advisors.
                  </p>
                )}
              </div>
            </div>

            {/* Right Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-['Outfit',sans-serif]">
                  Quick Travel Facts
                </h4>
                <div className="space-y-3 text-xs text-neutral-700">
                  <div className="pb-2 border-b border-neutral-100">
                    <span className="font-semibold text-neutral-500 block">Best Time to Visit:</span>
                    <span className="font-medium text-neutral-900 mt-0.5 block">{activeDestination.bestTimeToVisit}</span>
                  </div>
                  <div className="pb-2 border-b border-neutral-100">
                    <span className="font-semibold text-neutral-500 block">Visa & Entry Info:</span>
                    <span className="font-medium text-neutral-900 mt-0.5 block">{activeDestination.visaOverview}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-500 block">Currency:</span>
                    <span className="font-medium text-neutral-900 mt-0.5 block">{activeDestination.currencyInfo}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigateTo('contact')}
                  className="w-full bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-xs py-3 rounded-xl transition-all mt-2"
                >
                  Inquire About {activeDestination.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>GLOBAL DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Explore Our Destinations
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl">
            Discover the international cities and tropical coastlines where SMELTRAVELS876 curates stress-free group travel memories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => setActiveDestSlug(dest.slug)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#FFC72C]" />
                    <span>{dest.country}</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-2xl font-black font-['Outfit',sans-serif]">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 mt-2 text-xs font-bold text-[#2E0249] group-hover:text-purple-700">
                <span>View Experiences & Trips</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
