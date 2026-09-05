import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plane,
  CheckCircle2,
  Calendar,
  Users,
  Copy,
  Check,
  Send,
  CreditCard,
  FileCheck2,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { TripPackage, TravelInterestType } from '../../types';
import { useApp, formatPriceJMD } from '../../context/AppContext';

interface BookingModalProps {
  trip: TripPackage | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ trip, onClose }) => {
  const { trips, createBooking, settings, showNotification } = useApp();

  const [selectedTripId, setSelectedTripId] = useState<string>(trip ? trip.id : trips[0]?.id || '');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryOrParish, setCountryOrParish] = useState('Kingston & St. Andrew, Jamaica');
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [travelInterestType, setTravelInterestType] = useState<TravelInterestType>('ready_to_book');
  const [specialRequests, setSpecialRequests] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp');
  
  // Submission result state
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTrip = trips.find(t => t.id === selectedTripId) || trip || trips[0];

  useEffect(() => {
    if (activeTrip) {
      setPreferredTravelDate(activeTrip.dates);
    }
  }, [activeTrip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      showNotification('Missing Information', 'Please complete your contact details.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const ref = createBooking({
      tripId: activeTrip.id,
      tripName: activeTrip.name,
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      countryOrParish: countryOrParish.trim(),
      adultsCount,
      childrenCount,
      preferredTravelDate: preferredTravelDate || activeTrip.dates,
      travelInterestType,
      specialRequests: specialRequests.trim(),
      preferredContactMethod,
      status: travelInterestType === 'ready_to_book' ? 'New' : 'Pending',
      depositPaid: 0,
      totalPrice: activeTrip.price * adultsCount,
      currency: activeTrip.currency,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(ref);
      showNotification('Request Received', `Your inquiry reference is ${ref}.`);
    }, 400);
  };

  const copyReference = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getWhatsAppBookingLink = () => {
    const text = `Hi SMELTRAVELS876! I just submitted a booking request (${submittedRef}) for "${activeTrip.name}". My name is ${customerName}.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#2E0249] text-white p-5 sm:p-6 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow overflow-hidden">
              <img
                src="/logo.png"
                alt="SMELTRAVELS876 Logo"
                className="w-9 h-9 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold font-['Outfit',sans-serif] text-white">
                {submittedRef ? 'Booking Request Confirmed' : 'Trip Reservation & Inquiry'}
              </h3>
              <p className="text-xs text-[#FFC72C]">
                SMELTRAVELS876 • Travel More. Worry Less.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            id="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {submittedRef ? (
            /* Confirmation Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Thank You, {customerName}!
                </h4>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Your trip submission has been registered with SMELTRAVELS876. Our booking coordinator will contact you to verify details and assist with your deposit payment arrangements.
                </p>
              </div>

              {/* Reference Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                  Your Unique Booking Reference
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#2E0249]">
                    {submittedRef}
                  </span>
                  <button
                    onClick={copyReference}
                    className="p-2 rounded-lg bg-white border border-purple-300 hover:bg-purple-100 text-[#2E0249] transition-colors"
                    title="Copy reference code"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-neutral-500 block">
                  Save this reference number for all customer service correspondence.
                </span>
              </div>

              {/* Summary Details */}
              <div className="bg-neutral-50 rounded-xl p-4 text-xs text-neutral-700 text-left max-w-md mx-auto space-y-2 border border-neutral-200">
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Selected Package:</span>
                  <span className="font-bold text-neutral-900">{activeTrip.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Dates:</span>
                  <span className="font-medium text-neutral-900">{activeTrip.dates}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Travelers:</span>
                  <span className="font-medium text-neutral-900">
                    {adultsCount} Adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child(ren)` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Est. Package Total:</span>
                  <span className="font-bold text-[#2E0249]">{formatPriceJMD(activeTrip.price * adultsCount)}</span>
                </div>
              </div>

              {/* Next Steps Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppBookingLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reference via WhatsApp</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Selector & Rate Banner */}
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
                  Select Group Package
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.countryFlag} {t.name} ({t.dates}) — {formatPriceJMD(t.price)}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-600">
                    Deposit to lock in: <strong className="text-[#2E0249]">{formatPriceJMD(activeTrip.deposit)}</strong>
                  </span>
                  <span className="text-purple-900 font-medium">
                    Payment plans available
                  </span>
                </div>
              </div>

              {/* Intent Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  What is your booking stage?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTravelInterestType('ready_to_book')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                      travelInterestType === 'ready_to_book'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    ✓ I'm ready to book
                  </button>

                  <button
                    type="button"
                    onClick={() => setTravelInterestType('more_info')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                      travelInterestType === 'more_info'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    ℹ I want more information
                  </button>

                  <button
                    type="button"
                    onClick={() => setTravelInterestType('need_help')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                      travelInterestType === 'need_help'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    💬 Interested but need help
                  </button>
                </div>
              </div>

              {/* Traveler & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shanique Powell"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. shanique@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. (876) 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Parish / Country of Residence
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kingston, St. Catherine, Montego Bay"
                    value={countryOrParish}
                    onChange={(e) => setCountryOrParish(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>
              </div>

              {/* Traveler Counts & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Adults (18+)
                  </label>
                  <select
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} Adult{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Children (where applicable)
                  </label>
                  <select
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} Child{n !== 1 ? 'ren' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  >
                    <option value="whatsapp">WhatsApp (Recommended)</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Questions or Special Requests (Roommate preferences, dietary, visa questions)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Traveling with my partner, interested in single occupancy or payment plan details..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                ></textarea>
              </div>

              {/* Pricing & Booking Disclaimer */}
              <div className="bg-neutral-100 rounded-xl p-3.5 text-xs text-neutral-600 flex items-start gap-2 border border-neutral-200">
                <AlertCircle className="w-4 h-4 text-purple-900 shrink-0 mt-0.5" />
                <span>
                  <strong>No Immediate Charge:</strong> Submitting this request places your hold inquiry into our CMS. You will receive an instant reference code and our coordinator will confirm payment options with you.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>
                        {travelInterestType === 'ready_to_book' ? 'Submit Booking Request' : 'Submit Travel Inquiry'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
