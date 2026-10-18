import React from 'react';
import { LocalTrip, TripPackage } from '../../types';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface LocalTripDetailModalProps {
  trip: LocalTrip;
  onClose: () => void;
}

export const LocalTripDetailModal: React.FC<LocalTripDetailModalProps> = ({
  trip,
  onClose,
}) => {
  const { settings, openWiPayCheckout } = useApp();

  const handleBookTrip = () => {
    onClose();
    openWiPayCheckout({
      tripId: trip.id,
      title: trip.title,
      deposit: trip.deposit || Math.round(trip.price * 0.3),
      totalPrice: trip.price,
      dates: trip.availableDates || trip.duration,
      location: trip.location,
    });
  };

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
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Featured
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-purple-800/60 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative text-neutral-100"
        onClick={(e) => e.stopPropagation()}
        id={`local-trip-detail-modal-${trip.id}`}
      >
        {/* Modal Header / Banner */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-neutral-950 overflow-hidden shrink-0">
          <img
            src={trip.featuredImage}
            alt={trip.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white hover:text-[#FFC72C] transition-all border border-white/20 cursor-pointer"
            id="close-trip-detail-modal-btn"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#2E0249] text-[#FFC72C] border border-[#FFC72C]/40 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-[#FFC72C]" />
              <span>{trip.category || 'Local Jamaican Trip'}</span>
            </span>
            {getStatusBadge(trip.status)}
            {trip.isFeatured && (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-[#2E0249]">
                ★ Featured Offer
              </span>
            )}
          </div>

          {/* Title on Banner */}
          <div className="absolute bottom-4 left-4 right-4">
            {trip.subtitle && (
              <div className="text-xs font-bold text-[#FFC72C] uppercase tracking-wider mb-1">
                {trip.subtitle}
              </div>
            )}
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight font-['Outfit',sans-serif]">
              {trip.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FFC72C]" />
                {trip.location}
              </span>
              {trip.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FFC72C]" />
                  {trip.duration}
                </span>
              )}
              {trip.availableDates && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
                  {trip.availableDates}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Pricing & Deposit Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-800/90 border border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Total Package Rate ({trip.priceType || 'Per Person'})
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#FFC72C] mt-1 font-['Outfit',sans-serif]">
                {formatPriceJMD(trip.price)}
              </div>
              {trip.deposit && trip.deposit > 0 && (
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    Deposit to Reserve Spot: {formatPriceJMD(trip.deposit)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBookTrip}
                disabled={trip.status === 'Sold Out'}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                  trip.status === 'Sold Out'
                    ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                    : 'bg-[#FFC72C] text-[#2E0249] hover:bg-amber-300 shadow-[#FFC72C]/20 hover:scale-102 active:scale-98'
                }`}
                id="modal-reserve-spot-btn"
                title="Book Now (Pay Deposit) with secure WiPay Jamaica checkout"
              >
                <span>Book Now (Pay Deposit)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#FFC72C]" />
              Trip Overview
            </h4>
            <div className="text-sm text-neutral-200 leading-relaxed font-normal whitespace-pre-line">
              {trip.fullDescription || trip.description}
            </div>
          </div>

          {/* Highlights */}
          {trip.highlights && trip.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                Trip Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {trip.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-800 border border-purple-800/40 text-neutral-200 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]"></span>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {trip.inclusions && trip.inclusions.length > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  What's Included
                </h4>
                <ul className="space-y-2">
                  {trip.inclusions.map((inc, i) => (
                    <li key={i} className="text-xs text-neutral-200 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {trip.exclusions && trip.exclusions.length > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  What's Not Included
                </h4>
                <ul className="space-y-2">
                  {trip.exclusions.map((exc, i) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact / Inquire Options */}
          <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-neutral-400 text-center sm:text-left">
              Have questions about this trip? Reach our team directly:
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/18768341537?text=${encodeURIComponent(
                  `Hi SMELTRAVELS876, I would like more information on the "${trip.title}" local trip!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${trip.contactPhone || settings.primaryPhone || '(876) 834-1537'}`}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Call Us</span>
              </a>

              <a
                href={`mailto:${trip.contactEmail || settings.primaryEmail || 'smeltravels876@gmail.com'}?subject=${encodeURIComponent(
                  `Inquiry: ${trip.title}`
                )}`}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
