import React from 'react';
import { Compass, ArrowRight, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PopularDestinationsSection: React.FC = () => {
  const { destinations, navigateTo } = useApp();

  return (
    <section className="py-20 bg-white border-b border-neutral-200" id="destinations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>DESTINATION DIRECTORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
              Explore Iconic Destinations
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-xl">
              From the crystal beaches of Antigua and Punta Cana to the urban marvels of Panama, Frankfurt, Milan, and Medellín.
            </p>
          </div>

          <button
            onClick={() => navigateTo('destinations')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2E0249] hover:text-[#3B185F] group"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              onClick={() => navigateTo('destinations', dest.slug)}
              className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 flex flex-col h-80 bg-neutral-900"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

              {/* Country Badge */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#FFC72C]" />
                <span>{dest.country}</span>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                <h3 className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight group-hover:text-[#FFC72C] transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {dest.tagline}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#FFC72C]">
                  <span>Explore Destination</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
