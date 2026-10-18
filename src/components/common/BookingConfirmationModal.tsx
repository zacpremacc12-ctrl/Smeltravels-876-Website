import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  DollarSign,
  MessageCircle,
  Share2,
  ShieldCheck,
  X,
  Plane,
  Download,
} from 'lucide-react';
import { BookingConfirmationDetails } from '../../types';
import { useApp } from '../../context/AppContext';

interface BookingConfirmationModalProps {
  details: BookingConfirmationDetails;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  details,
  onClose,
}) => {
  const { settings } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(details.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDeposit = `$${details.depositPaid.toLocaleString()} JMD`;

  const getWhatsAppMessage = () => {
    const text = `Hi Smeltravels876! I just completed my deposit of ${formattedDeposit} for "${details.tripTitle}". Booking Reference: ${details.referenceNumber}. Traveler: ${details.customerName}. Please confirm my receipt!`;
    return `https://wa.me/${settings.whatsappNumber || '18768341537'}?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Festive Jamaican Gold & Royal Purple Gradient Top */}
        <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#FFC72C] to-amber-300 flex items-center justify-center shadow-lg border-2 border-white/30">
            <CheckCircle2 className="w-10 h-10 text-[#2E0249] stroke-[2.5]" />
          </div>

          <span className="inline-block px-3 py-1 bg-[#FFC72C] text-[#2E0249] text-[11px] font-black uppercase tracking-wider rounded-full mb-2 shadow-xs">
            WiPay Jamaica Verified Payment
          </span>

          {/* Exact required text */}
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight leading-snug">
            Booking Confirmed! Thank you for choosing Smeltravels876
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 mt-1.5 max-w-md mx-auto">
            Your lock-in deposit has been successfully processed and your spot is permanently reserved.
          </p>
        </div>

        {/* Receipt / Booking Details Card */}
        <div className="p-6 space-y-5">
          {/* Booking Reference Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider block">
                Official Booking Reference
              </span>
              <span className="text-lg sm:text-xl font-black text-[#2E0249] tracking-wider font-mono">
                {details.referenceNumber}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2E0249] bg-white border border-amber-300 hover:bg-amber-100/60 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Ref</span>
                </>
              )}
            </button>
          </div>

          {/* Breakdown Grid */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200">
              <span className="text-neutral-500 font-medium">Selected Trip:</span>
              <span className="font-bold text-neutral-900 text-right max-w-[65%] truncate">
                {details.tripTitle}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200">
              <span className="text-neutral-500 font-medium">Deposit Paid (Locked In):</span>
              <span className="text-base font-black text-emerald-700">
                {formattedDeposit}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200">
              <span className="text-neutral-500 font-medium">Payment Gateway:</span>
              <span className="font-semibold text-neutral-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#2E0249]" />
                WiPay Jamaica ({details.paymentMethod || 'WiPay Me Online'})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200">
              <span className="text-neutral-500 font-medium">Transaction ID:</span>
              <span className="font-mono text-xs text-neutral-700">{details.transactionId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Date & Time:</span>
              <span className="text-neutral-700">{details.date}</span>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Spot 100% Guaranteed & Reserved</p>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">
                Your payment has been logged with Smeltravels876 executive desk. A detailed itinerary and payment receipt have been prepared for you.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <a
              href={getWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect with Operations Desk on WhatsApp</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Done / Back to Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
