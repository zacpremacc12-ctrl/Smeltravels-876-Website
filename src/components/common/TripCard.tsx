import React from 'react';
import {
  Calendar,
  Hotel,
  Check,
  ArrowRight,
  Sparkles,
  Plane,
  ShieldAlert,
  CreditCard
} from 'lucide-react';
import { TripPackage } from '../../types';
import { formatPriceJMD, useApp } from '../../context/AppContext';

interface TripCardProps {
  trip: TripPackage;
  highlight2026?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, highlight2026 }) => {
  const { navigateTo, setSelectedTripForBooking, setSelectedTripForInquiry } = useApp();

  const getStatusBadge = (status: TripPackage['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Limited Availability':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Coming Soon':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Sold Out':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Closed':
        return 'bg-neutral-200 text-neutral-700 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border flex flex-col h-full ${
        highlight2026 || trip.is2026Featured
          ? 'border-purple-300 ring-2 ring-purple-600/20'
          : 'border-neutral-200'
      }`}
      id={`trip-card-${trip.id}`}
    >
      {/* Top Media Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-neutral-900">
        <img
          src={trip.featuredImage}
          alt={`${trip.name} - ${trip.destination}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {trip.is2026Featured && (
            <span className="bg-[#FFC72C] text-[#2E0249] text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow">
              2026 Featured Trip
            </span>
          )}
          {trip.is2027Collection && (
            <span className="bg-[#2E0249] text-[#FFC72C] text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-[#FFC72C]/40 shadow">
              2027 Collection
            </span>
          )}
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border shadow-sm ${getStatusBadge(
              trip.status
            )}`}
          >
            {trip.status}
          </span>
        </div>

        {/* Dates Pill on Top Right */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-white/15">
          <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
          <span>{trip.dates}</span>
        </div>

        {/* Destination & Country at Bottom of Image */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
            <span className="text-base">{trip.countryFlag}</span>
            <span>{trip.country}</span>
            {trip.requiresSchengenVisa && (
              <span className="bg-purple-900/80 text-[#FFC72C] text-[10px] px-1.5 py-0.5 rounded font-semibold border border-[#FFC72C]/30">
                Schengen Visa Required
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-white tracking-tight mt-0.5 leading-snug">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Hotel / Accommodation */}
        <div className="flex items-start gap-2 text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
          <Hotel className="w-4 h-4 text-[#2E0249] shrink-0 mt-0.5" />
          <div className="truncate">
            <span className="font-semibold text-neutral-900 block">Hotel Accommodation:</span>
            <span className="text-neutral-600 truncate block">{trip.hotel}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
          {trip.shortDescription}
        </p>

        {/* Included Services Preview */}
        <div className="space-y-1.5 border-t border-neutral-100 pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
            Package Inclusions:
          </span>
          <div className="grid grid-cols-1 gap-1 text-xs text-neutral-700">
            {trip.packageInclusions.slice(0, 3).map((inc, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{inc}</span>
              </div>
            ))}
            {trip.packageInclusions.length > 3 && (
              <span className="text-[11px] text-purple-700 font-medium pl-5">
                + {trip.packageInclusions.length - 3} more included services
              </span>
            )}
          </div>
        </div>

        {/* Price & Deposit Area */}
        <div className="pt-3 border-t border-neutral-200 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Package Rate
            </span>
            <div className="text-2xl font-black text-[#2E0249] font-['Outfit',sans-serif] leading-none">
              {formatPriceJMD(trip.price)}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">per person</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Deposit
            </span>
            <span className="text-base font-bold text-amber-700 block leading-none">
              {formatPriceJMD(trip.deposit)}
            </span>
            <span className="text-[10px] text-neutral-500">Locks in your spot</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateTo('trips', trip.slug)}
            className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
            id={`view-trip-${trip.id}`}
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedTripForBooking(trip)}
            disabled={trip.status === 'Sold Out' || trip.status === 'Closed'}
            className={`w-full font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm ${
              trip.status === 'Sold Out' || trip.status === 'Closed'
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249]'
            }`}
            id={`book-trip-${trip.id}`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Book / Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};
