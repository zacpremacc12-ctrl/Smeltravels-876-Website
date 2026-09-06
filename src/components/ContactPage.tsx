import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TravelInterestType } from '../types';

export const ContactPage: React.FC = () => {
  const { settings, trips, createBooking, showNotification } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryOrParish, setCountryOrParish] = useState('Kingston & St. Andrew, Jamaica');
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [adultsCount, setAdultsCount] = useState(1);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [travelInterestType, setTravelInterestType] = useState<TravelInterestType>('more_info');
  const [message, setMessage] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      showNotification('Missing Fields', 'Please complete your name, email, and phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const ref = createBooking({
      tripId: activeTrip?.id || 'general-inquiry',
      tripName: activeTrip?.name || 'General Inquiry',
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      countryOrParish: countryOrParish.trim(),
      adultsCount,
      childrenCount: 0,
      preferredTravelDate: preferredTravelDate || activeTrip?.dates || 'Flexible',
      travelInterestType,
      specialRequests: message.trim(),
      preferredContactMethod,
      status: 'New',
      depositPaid: 0,
      totalPrice: activeTrip?.price || 0,
      currency: 'JMD',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(ref);
      showNotification('Inquiry Registered', `Reference code ${ref} generated.`);
    }, 400);
  };

  const copyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getWhatsAppLink = () => {
    const text = `Hi SMELTRAVELS876! I just sent an inquiry (${submittedRef}) regarding travel planning. My name is ${customerName}.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>CONNECT WITH SMELTRAVELS876</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Get In Touch With Our Travel Advisors
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Have questions about upcoming departures, deposit structures, or Schengen Visa assistance? We are here to guide your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Agency Office */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                SMELTRAVELS876 Headquarters
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Official Phone & WhatsApp</span>
                    <a
                      href={`tel:${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
                      className="font-bold text-neutral-900 hover:text-[#2E0249] text-base"
                    >
                      {settings.primaryPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Official Email</span>
                    <a
                      href={`mailto:${settings.primaryEmail}`}
                      className="font-bold text-neutral-900 hover:text-[#2E0249]"
                    >
                      {settings.primaryEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Operating Base</span>
                    <span className="font-semibold text-neutral-800">{settings.operatingBase}</span>
                    <p className="text-xs text-neutral-500 mt-0.5">Departures coordinated via Norman Manley Int'l (KIN).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Business Hours</span>
                    <span className="font-semibold text-neutral-800">{settings.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambassador Dedicated Contact */}
            <div className="bg-gradient-to-br from-[#2E0249] to-[#3B185F] text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black shadow">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC72C] block">
                      Agency Ambassadors
                    </span>
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                      Connect with an Ambassador
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-purple-200">
                  Direct Support
                </span>
              </div>

              <p className="text-xs text-neutral-200 leading-relaxed">
                Need specialized assistance with group packages, custom itineraries, or payment plan scheduling? Connect directly with any of our verified ambassadors:
              </p>

              <div className="space-y-2.5 pt-2 border-t border-purple-800/80 text-xs">
                {(settings.ambassadors && settings.ambassadors.length > 0
                  ? settings.ambassadors.filter((a) => a.isActive !== false)
                  : [
                      {
                        id: 'amb-default',
                        name: settings.ambassadorName || 'Zachary Buchanan',
                        title: settings.ambassadorTitle || 'Travel Ambassador',
                        phone: settings.ambassadorPhone || '(876) 848-9772',
                        email: settings.ambassadorEmail || 'zbuchanan.smeltravels@gmail.com',
                        parishOrRegion: 'Kingston & St. Andrew',
                      },
                    ]
                ).map((amb) => (
                  <div key={amb.id} className="bg-purple-950/50 p-3 rounded-xl border border-purple-800/60 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-xs">{amb.name}</div>
                      <div className="text-[10px] text-purple-300">{amb.title}{amb.parishOrRegion ? ` • ${amb.parishOrRegion}` : ''}</div>
                    </div>
                    <a
                      href={`tel:${amb.phone.replace(/[^0-9]/g, '')}`}
                      className="text-xs font-bold text-[#FFC72C] hover:underline shrink-0 bg-[#2E0249] px-2.5 py-1 rounded-lg border border-purple-700"
                    >
                      {amb.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Form or Confirmation */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
              {submittedRef ? (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                      Inquiry Successfully Received!
                    </h3>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                      Thank you, {customerName}. Your travel inquiry has been saved into the SMELTRAVELS876 management system.
                    </p>
                  </div>

                  {/* Reference Display */}
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                      Your Unique Reference Number
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl sm:text-3xl font-mono font-black text-[#2E0249]">
                        {submittedRef}
                      </span>
                      <button
                        onClick={copyRef}
                        className="p-2 rounded-lg bg-white border border-purple-300 hover:bg-purple-100 text-[#2E0249] transition-colors"
                        title="Copy code"
                      >
                        {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Next Steps Checklist */}
                  <div className="bg-neutral-50 rounded-2xl p-5 text-xs text-neutral-700 text-left max-w-md mx-auto space-y-2.5 border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 text-sm">What Happens Next:</h4>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>A travel coordinator reviews availability for {activeTrip?.name}.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>We reach out via your preferred method ({preferredContactMethod.toUpperCase()}) to confirm your package spot.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span>We provide bank/card transfer details for your deposit to lock in your reservation.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Message with Reference on WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                      Send Us an Inquiry
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Fill out your travel preferences and we will generate an official booking reference.
                    </p>
                  </div>

                  {/* Stage of Interest */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Your Booking Stage
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setTravelInterestType('ready_to_book')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'ready_to_book'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        ✓ Ready to book
                      </button>

                      <button
                        type="button"
                        onClick={() => setTravelInterestType('more_info')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'more_info'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        ℹ Want more info
                      </button>

                      <button
                        type="button"
                        onClick={() => setTravelInterestType('need_help')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'need_help'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        💬 Interested / Need help
                      </button>
                    </div>
                  </div>

                  {/* Traveler Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Althea Thompson"
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
                        placeholder="e.g. althea@gmail.com"
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
                        placeholder="e.g. (876) 834-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Country / Parish
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kingston, St. Catherine, Diaspora"
                        value={countryOrParish}
                        onChange={(e) => setCountryOrParish(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>

                  {/* Trip Selection & Travelers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Interested Trip Package
                      </label>
                      <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      >
                        {trips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.countryFlag} {t.name} ({t.dates})
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
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      >
                        <option value="whatsapp">WhatsApp (Fastest response)</option>
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Message / Special Requests / Visa Inquiries
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ask about payment schedules, single occupancy upgrades, Schengen visa guidance, or custom requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Inquiry & Generate Reference</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
