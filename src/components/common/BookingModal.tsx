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
  AlertCircle,
  ShieldCheck,
  Lock,
  Building2,
  QrCode,
  ArrowLeft,
  ArrowRight,
  User,
  Wallet,
  BadgeCheck,
  UserCheck,
} from 'lucide-react';
import { TripPackage, TravelInterestType, TravelerDepositRecord } from '../../types';
import { useApp, formatPriceJMD } from '../../context/AppContext';

interface BookingModalProps {
  trip: TripPackage | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ trip, onClose }) => {
  const {
    trips,
    createBooking,
    settings,
    showNotification,
    currentUser,
    recordUserDeposit,
    signupUser,
    openAuthModal,
    verifyAmbassadorCode,
  } = useApp();

  const [step, setStep] = useState<'details' | 'checkout' | 'confirmation'>('details');

  const [selectedTripId, setSelectedTripId] = useState<string>(trip ? trip.id : trips[0]?.id || '');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [countryOrParish, setCountryOrParish] = useState(currentUser?.homeParishOrCountry || 'Kingston & St. Andrew, Jamaica');
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [travelInterestType, setTravelInterestType] = useState<TravelInterestType>('ready_to_book');
  const [specialRequests, setSpecialRequests] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp');

  // Ambassador selection state
  const ambassadorsList = settings.ambassadors && settings.ambassadors.length > 0
    ? settings.ambassadors.filter((a) => a.isActive !== false)
    : [
        {
          id: 'amb-1',
          name: settings.ambassadorName || 'Zachary Buchanan',
          title: settings.ambassadorTitle || 'Senior Travel Ambassador',
          phone: settings.ambassadorPhone || '(876) 848-9772',
          email: settings.ambassadorEmail || 'zbuchanan.smeltravels@gmail.com',
          code: 'ZAC876',
          isActive: true,
          parishOrRegion: 'Kingston & St. Andrew',
        },
      ];
  const [selectedAmbassadorId, setSelectedAmbassadorId] = useState<string>('');
  const [ambassadorError, setAmbassadorError] = useState<string>('');

  // Ambassador Promo Code & Discount state (hidden codes from customer)
  const [ambassadorCodeInput, setAmbassadorCodeInput] = useState('');
  const [appliedAmbassadorCode, setAppliedAmbassadorCode] = useState('');
  const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState(0);
  const [ambassadorCodeError, setAmbassadorCodeError] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Checkout payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'lynk' | 'office'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(currentUser?.name || '');
  const [bankRefCode, setBankRefCode] = useState('');
  const [lynkRefCode, setLynkRefCode] = useState('');
  const [autoCreateAccount, setAutoCreateAccount] = useState(!currentUser);

  // Result state
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [txnId, setTxnId] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasFirstDepositTracked, setWasFirstDepositTracked] = useState(false);

  const activeTrip = trips.find(t => t.id === selectedTripId) || trip || trips[0];
  const originalTotalPackagePrice = activeTrip.price * adultsCount;
  const discountAmount = appliedDiscountPercentage > 0
    ? Math.round(originalTotalPackagePrice * (appliedDiscountPercentage / 100))
    : 0;
  const totalPackagePrice = originalTotalPackagePrice - discountAmount;
  const depositDue = activeTrip.deposit * adultsCount;
  const remainingBalance = Math.max(0, totalPackagePrice - depositDue);

  const handleApplyAmbassadorCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ambassadorCodeInput.trim()) {
      setAmbassadorCodeError('Please enter an ambassador code');
      return;
    }
    const result = verifyAmbassadorCode(ambassadorCodeInput);
    if (result.valid && result.ambassador) {
      setSelectedAmbassadorId(result.ambassador.id);
      setAppliedAmbassadorCode(ambassadorCodeInput.trim().toUpperCase());
      setAppliedDiscountPercentage(result.discountPercentage);
      setAmbassadorCodeError('');
      setAmbassadorError('');
      showNotification(
        'Ambassador Code Applied!',
        `${result.discountPercentage}% discount applied courtesy of ${result.ambassador.name}!`,
        'success'
      );
    } else {
      setAmbassadorCodeError('Invalid ambassador code. Please check with your travel ambassador or choose from the list below.');
      showNotification('Invalid Ambassador Code', 'The code you entered is not recognized.', 'error');
    }
  };

  const handleRemoveAmbassadorCode = () => {
    setAppliedAmbassadorCode('');
    setAppliedDiscountPercentage(0);
    setAmbassadorCodeInput('');
    setAmbassadorCodeError('');
    showNotification('Ambassador Code Removed', 'Discount removed from package.', 'info');
  };

  const companyBank = settings.companyBanking || {
    bankName: 'National Commercial Bank (NCB) Jamaica',
    accountName: 'SMELTRAVELS876 LIMITED',
    accountNumber: '354-928-1029',
    accountType: 'Chequing Account',
    branch: 'Half-Way-Tree Branch, Kingston',
    swiftOrRoutingCode: 'JNCBJMKX',
    lynkHandle: '@smeltravels876',
    lynkPhone: settings.ambassadorPhone || '(876) 848-9772',
    officeDepositAddress: '12 Trafalgar Road, Suite 4B, Kingston 10, Jamaica',
    paymentInstructions: 'Deposits directly credit the official SMELTRAVELS876 corporate operational account.',
  };

  // Auto-sync dates
  useEffect(() => {
    if (activeTrip) {
      setPreferredTravelDate(activeTrip.dates);
    }
  }, [activeTrip]);

  // Sync logged in user details if available
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.homeParishOrCountry) setCountryOrParish(currentUser.homeParishOrCountry);
      if (!cardName) setCardName(currentUser.name);
    }
  }, [currentUser]);

  // Step 1 -> Step 2: Proceed to Checkout
  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      showNotification('Missing Information', 'Please complete your contact details first.', 'warning');
      return;
    }

    const isMandatory = settings.requireAmbassadorSelection !== false;
    if (isMandatory && !selectedAmbassadorId) {
      setAmbassadorError('Please choose an assigned travel ambassador to proceed with your booking.');
      showNotification('Ambassador Required', 'Please select a travel ambassador to manage your booking.', 'warning');
      const elem = document.getElementById('ambassador-selection-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setAmbassadorError('');

    if (!cardName) {
      setCardName(customerName.trim());
    }
    setStep('checkout');
  };

  // Step 2 -> Step 3: Process Lock-in Deposit
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        showNotification('Card Information', 'Please enter your credit or debit card details.', 'warning');
        return;
      }
    }

    setIsSubmitting(true);

    const chosenAmbassador = ambassadorsList.find((a) => a.id === selectedAmbassadorId) || ambassadorsList[0];

    const generatedTxn = `TXN-876-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnId(generatedTxn);

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
      travelInterestType: 'ready_to_book',
      specialRequests: specialRequests.trim(),
      preferredContactMethod,
      status: 'Deposit Paid',
      depositPaid: depositDue,
      totalPrice: totalPackagePrice,
      currency: activeTrip.currency || 'JMD',
      ambassadorId: chosenAmbassador?.id,
      ambassadorName: chosenAmbassador?.name,
      ambassadorPhone: chosenAmbassador?.phone,
      ambassadorCode: appliedAmbassadorCode || undefined,
      discountPercentage: appliedDiscountPercentage > 0 ? appliedDiscountPercentage : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    });

    const paymentMethodLabels: Record<string, string> = {
      card: 'Credit / Debit Card (Online)',
      bank: 'NCB Direct Bank Transfer',
      lynk: 'Lynk Jamaica Instant Wallet',
      office: 'SMELTRAVELS876 Branch Deposit Hold',
    };
    const methodLabel = paymentMethodLabels[paymentMethod] || 'Deposit Payment';

    const depositRecord: TravelerDepositRecord = {
      id: `dep-${Date.now()}`,
      tripId: activeTrip.id,
      tripName: activeTrip.name,
      amount: depositDue,
      currency: activeTrip.currency || 'JMD',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      bookingRef: ref,
      paymentMethod: methodLabel,
      transactionId: generatedTxn,
      status: 'Confirmed',
    };

    // Track first deposit if signed in or if auto-create account
    if (currentUser) {
      recordUserDeposit(depositRecord, currentUser.email);
      setWasFirstDepositTracked(true);
    } else if (autoCreateAccount) {
      signupUser(customerName.trim(), email.trim(), phone.trim(), countryOrParish.trim());
      recordUserDeposit(depositRecord, email.trim());
      setWasFirstDepositTracked(true);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(ref);
      setStep('confirmation');
      showNotification('Deposit Confirmed', `Lock-in deposit of ${formatPriceJMD(depositDue)} recorded for ${activeTrip.name}!`);
    }, 800);
  };

  const copyReference = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getWhatsAppBookingLink = () => {
    const text = `Hi SMELTRAVELS876! I just placed a lock-in deposit of ${formatPriceJMD(depositDue)} for "${activeTrip.name}" (${activeTrip.dates}). Booking Ref: ${submittedRef}. Traveler Name: ${customerName}.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const formatCardNumberInput = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const parts = clean.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const formatExpiryInput = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 2) {
      setCardExpiry(`${clean.substring(0, 2)}/${clean.substring(2)}`);
    } else {
      setCardExpiry(clean);
    }
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
                {step === 'confirmation'
                  ? 'Deposit Confirmed & Spot Secured!'
                  : step === 'checkout'
                  ? 'Deposit Checkout & Reservation'
                  : 'Trip Reservation & Inquiry'}
              </h3>
              <p className="text-xs text-[#FFC72C]">
                SMELTRAVELS876 • Travel More. Worry Less.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            id="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="bg-purple-950/20 px-6 py-2.5 border-b border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'details'
                  ? 'bg-[#2E0249] text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {step === 'details' ? '1' : '✓'}
            </span>
            <span className={step === 'details' ? 'font-bold text-[#2E0249]' : 'text-neutral-500'}>
              Traveler Details
            </span>
          </div>

          <div className="w-6 h-[1px] bg-neutral-300"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'checkout'
                  ? 'bg-[#2E0249] text-white'
                  : step === 'confirmation'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {step === 'confirmation' ? '✓' : '2'}
            </span>
            <span className={step === 'checkout' ? 'font-bold text-[#2E0249]' : 'text-neutral-500'}>
              Deposit Checkout
            </span>
          </div>

          <div className="w-6 h-[1px] bg-neutral-300"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              3
            </span>
            <span className={step === 'confirmation' ? 'font-bold text-emerald-800' : 'text-neutral-500'}>
              Confirmed
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {step === 'confirmation' ? (
            /* STEP 3: Confirmation Screen */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Deposit Received & Guaranteed
                </span>
                <h4 className="text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Congratulations, {customerName}!
                </h4>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Your lock-in deposit for <strong>{activeTrip.name}</strong> has been secured. Your spot is officially reserved!
                </p>
              </div>

              {/* First Deposit Tracked Badge */}
              {wasFirstDepositTracked && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-4 max-w-md mx-auto text-left shadow-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-950 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
                      <span>First Deposit Tracked to Your Account!</span>
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1.5">
                    Your deposit of <strong>{formatPriceJMD(depositDue)}</strong> is permanently linked to your traveler profile (<strong>{currentUser?.email || email}</strong>). You can view your payment receipt anytime in your Traveler Portal.
                  </p>
                </div>
              )}

              {/* Reference & Transaction Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                  Your Official Booking Reference
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#2E0249]">
                    {submittedRef}
                  </span>
                  <button
                    onClick={copyReference}
                    className="p-2 rounded-lg bg-white border border-purple-300 hover:bg-purple-100 text-[#2E0249] transition-colors cursor-pointer"
                    title="Copy reference code"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1 flex items-center justify-between border-t border-purple-100">
                  <span>Transaction ID: <strong className="font-mono text-neutral-800">{txnId}</strong></span>
                  <span className="text-emerald-700 font-bold">Deposit Paid: {formatPriceJMD(depositDue)}</span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="bg-neutral-50 rounded-xl p-4 text-xs text-neutral-700 text-left max-w-md mx-auto space-y-2 border border-neutral-200">
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Selected Package:</span>
                  <span className="font-bold text-neutral-900">{activeTrip.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Travel Dates:</span>
                  <span className="font-medium text-neutral-900">{activeTrip.dates}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Travelers:</span>
                  <span className="font-medium text-neutral-900">
                    {adultsCount} Adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child(ren)` : ''}
                  </span>
                </div>
                {appliedDiscountPercentage > 0 && (
                  <div className="flex justify-between py-1 border-b border-neutral-200 text-emerald-800 font-medium">
                    <span>Ambassador Discount ({appliedDiscountPercentage}%):</span>
                    <span className="font-bold text-emerald-700">-{formatPriceJMD(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Deposit Paid Today:</span>
                  <span className="font-bold text-emerald-700">{formatPriceJMD(depositDue)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Remaining Balance:</span>
                  <span className="font-bold text-[#2E0249]">{formatPriceJMD(remainingBalance)}</span>
                </div>
              </div>

              {/* Dedicated Assigned Ambassador Card (Codes hidden from customers) */}
              {(() => {
                const assignedAmbassador = ambassadorsList.find((a) => a.id === selectedAmbassadorId) || ambassadorsList[0];
                return (
                  <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 max-w-md mx-auto text-left shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-purple-700" />
                        <span>Your Assigned Travel Ambassador</span>
                      </span>
                      {appliedDiscountPercentage > 0 ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ {appliedDiscountPercentage}% Discount Applied
                        </span>
                      ) : (
                        <span className="bg-[#2E0249] text-[#FFC72C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Verified Specialist
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {assignedAmbassador.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-neutral-900 leading-tight">
                            {assignedAmbassador.name}
                          </h5>
                          <p className="text-[11px] text-neutral-500">
                            {assignedAmbassador.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <a
                          href={`tel:${assignedAmbassador.phone.replace(/[^0-9]/g, '')}`}
                          className="font-bold text-[#2E0249] hover:underline block"
                        >
                          {assignedAmbassador.phone}
                        </a>
                        <a
                          href={`mailto:${assignedAmbassador.email}`}
                          className="text-[10px] text-neutral-500 hover:underline block truncate max-w-[140px]"
                        >
                          {assignedAmbassador.email}
                        </a>
                      </div>
                    </div>
                    <p className="text-[11px] text-purple-900 pt-1.5 border-t border-purple-200/80">
                      {assignedAmbassador.name} will be your dedicated point of contact for trip onboarding and payment confirmation.
                    </p>
                  </div>
                );
              })()}

              {/* Next Steps Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={getWhatsAppBookingLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Receipt via WhatsApp</span>
                </a>

                {wasFirstDepositTracked && (
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal('login');
                    }}
                    className="w-full sm:w-auto bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>View in My Traveler Account</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 'checkout' ? (
            /* STEP 2: Checkout Option to Make a Deposit */
            <form onSubmit={handleProcessPayment} className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Details Button & Trip Title */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-bold text-[#2E0249] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Traveler Details</span>
                </button>

                <span className="text-xs font-semibold text-neutral-500">
                  Step 2 of 2: Secure Deposit
                </span>
              </div>

              {/* Package & Deposit Summary Banner */}
              <div className="bg-neutral-900 text-white p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url(${activeTrip.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'})` }}
                />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{activeTrip.countryFlag}</span>
                      <span className="text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
                        {activeTrip.destination}
                      </span>
                    </div>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-neutral-200">
                      {adultsCount} Traveler{adultsCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black font-['Outfit',sans-serif]">
                    {activeTrip.name}
                  </h4>
                  <div className="text-xs text-neutral-300">
                    {activeTrip.dates} • {activeTrip.hotelName}
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {appliedDiscountPercentage > 0 ? (
                      <>
                        <div>
                          <span className="text-neutral-400 block text-[11px]">Original Package:</span>
                          <span className="font-medium text-neutral-400 line-through">{formatPriceJMD(originalTotalPackagePrice)}</span>
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            -{appliedDiscountPercentage}% Ambassador Code ({formatPriceJMD(discountAmount)})
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-300 font-bold block text-[11px]">Discounted Total:</span>
                          <span className="text-sm font-black text-emerald-300">{formatPriceJMD(totalPackagePrice)}</span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Total Package:</span>
                        <span className="font-semibold text-white">{formatPriceJMD(totalPackagePrice)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#FFC72C] font-bold block text-[11px]">Lock-In Deposit Due:</span>
                      <span className="text-base font-black text-[#FFC72C]">{formatPriceJMD(depositDue)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-neutral-400 block text-[11px]">Remaining Balance:</span>
                      <span className="font-semibold text-neutral-200">{formatPriceJMD(remainingBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Ambassador Banner in Checkout (Codes hidden from customer) */}
              {(() => {
                const assignedAmbassador = ambassadorsList.find((a) => a.id === selectedAmbassadorId) || ambassadorsList[0];
                return (
                  <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-3 sm:p-3.5 px-4 flex items-center justify-between text-xs shadow-xs">
                    <span className="font-bold text-[#2E0249] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>Assigned Travel Ambassador: <strong>{assignedAmbassador.name}</strong></span>
                    </span>
                    {appliedDiscountPercentage > 0 ? (
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        ✓ {appliedDiscountPercentage}% Ambassador Discount Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-900 font-medium bg-white px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                        {assignedAmbassador.phone}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Signed In vs Guest Account Tracking Notice */}
              {currentUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Signed In as {currentUser.name}</span>
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      First Deposit Tracking ON
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    ⭐ <strong>Permanent Tracking:</strong> Because you are signed in, your first deposit of <strong>{formatPriceJMD(depositDue)}</strong> will be automatically tracked and saved to your Traveler Account ({currentUser.email}).
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-amber-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Track Your First Deposit</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-[#2E0249] bg-white hover:bg-neutral-50 px-3 py-1 rounded-lg border border-amber-300 font-bold text-[11px] shadow-xs cursor-pointer"
                    >
                      Sign In to Account
                    </button>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    To keep track of your first deposit and view your trip balance in your personal portal, sign in or leave the box checked below.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={autoCreateAccount}
                      onChange={(e) => setAutoCreateAccount(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249] accent-[#2E0249]"
                    />
                    <span className="text-neutral-800 font-semibold text-[11px]">
                      Track my first deposit and link to <strong>{email}</strong>
                    </span>
                  </label>
                </div>
              )}

              {/* Payment Methods Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Select Deposit Checkout Option
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                      paymentMethod === 'card'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm ring-2 ring-[#FFC72C]/40'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                      paymentMethod === 'bank'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm ring-2 ring-[#FFC72C]/40'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('lynk')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                      paymentMethod === 'lynk'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm ring-2 ring-[#FFC72C]/40'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Lynk Jamaica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('office')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                      paymentMethod === 'office'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm ring-2 ring-[#FFC72C]/40'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>In-Office Hold</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Option Details */}
              {paymentMethod === 'card' && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200">
                    <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-Bit Encrypted Card Payment</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Visa • Mastercard • Keycard
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => formatCardNumberInput(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => formatExpiryInput(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Security Code (CVV) *
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2E0249] text-sm">
                      {companyBank.bankName}
                    </span>
                    <span className="bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      Official Company Account
                    </span>
                  </div>
                  <div className="space-y-1.5 text-neutral-700 font-mono bg-white p-3 rounded-xl border border-purple-200">
                    <div><strong>Account Name:</strong> {companyBank.accountName}</div>
                    <div><strong>Account #:</strong> {companyBank.accountNumber} ({companyBank.accountType})</div>
                    <div><strong>Branch:</strong> {companyBank.branch}</div>
                    {companyBank.swiftOrRoutingCode && (
                      <div><strong>SWIFT / Routing:</strong> {companyBank.swiftOrRoutingCode}</div>
                    )}
                    <div><strong>Deposit Amount:</strong> {formatPriceJMD(depositDue)}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Bank Transfer Reference / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NCB Online Ref #192842 or your initials"
                      value={bankRefCode}
                      onChange={(e) => setBankRefCode(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {companyBank.paymentInstructions || 'Our team matches your transfer and updates your booking status immediately upon confirmation.'}
                  </p>
                </div>
              )}

              {paymentMethod === 'lynk' && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span>Instant Lynk Jamaica Mobile Transfer</span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      Official Business Lynk
                    </span>
                  </div>
                  <div className="space-y-1.5 text-neutral-700 font-mono bg-white p-3 rounded-xl border border-emerald-200">
                    <div><strong>Lynk Handle:</strong> {companyBank.lynkHandle}</div>
                    <div><strong>Business Phone:</strong> {companyBank.lynkPhone}</div>
                    <div><strong>Beneficiary:</strong> {companyBank.accountName}</div>
                    <div><strong>Amount:</strong> {formatPriceJMD(depositDue)}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Lynk Confirmation Code / Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LY-894721"
                      value={lynkRefCode}
                      onChange={(e) => setLynkRefCode(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'office' && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                  <div className="font-bold text-neutral-900 text-sm">
                    In-Office Cash / Wire Reservation
                  </div>
                  <p className="text-neutral-600">
                    Placing this hold guarantees your reservation for <strong>48 hours</strong> while you complete your deposit at our agency office:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-neutral-200 font-medium text-neutral-800 space-y-0.5">
                    <div>{companyBank.accountName}</div>
                    <div>{companyBank.officeDepositAddress}</div>
                    <div>Hours: {settings.businessHours || 'Mon–Fri, 9:00 AM – 5:00 PM EST'}</div>
                  </div>
                </div>
              )}

              {/* Checkout Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-confirm-deposit-payment"
                  className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-sm px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Deposit...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay Deposit of {formatPriceJMD(depositDue)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 1: Traveler Details Form */
            <form onSubmit={handleProceedToCheckout} className="space-y-6">
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
                    Required Lock-In Deposit: <strong className="text-[#2E0249] font-bold">{formatPriceJMD(activeTrip.deposit)}</strong> / person
                  </span>
                  <span className="text-purple-900 font-bold bg-[#FFC72C]/40 px-2 py-0.5 rounded-full text-[11px]">
                    Direct Deposit Checkout Available
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
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                      travelInterestType === 'ready_to_book'
                        ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    ✓ I'm ready to book & deposit
                  </button>

                  <button
                    type="button"
                    onClick={() => setTravelInterestType('more_info')}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
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
                    className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
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

              {/* MANDATORY AMBASSADOR SELECTION */}
              <div
                id="ambassador-selection-section"
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  ambassadorError
                    ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400'
                    : selectedAmbassadorId
                    ? 'bg-purple-50/70 border-purple-300'
                    : 'bg-gradient-to-br from-purple-50/50 via-amber-50/30 to-purple-50/50 border-purple-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2E0249] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-purple-700" />
                    <span>Choose Your Travel Ambassador *</span>
                  </label>
                  <span className="inline-flex items-center gap-1 bg-[#FFC72C] text-[#2E0249] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto shadow-xs">
                    Mandatory Selection
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mb-3">
                  Please select a verified SMELTRAVELS876 ambassador who will be your designated agent for flight coordination, payment plans, and personalized itinerary guidance:
                </p>

                {/* Grid of ambassador cards (Codes hidden from customers) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-2">
                  {ambassadorsList.map((amb) => {
                    const isSelected = selectedAmbassadorId === amb.id;
                    return (
                      <button
                        type="button"
                        key={amb.id}
                        onClick={() => {
                          setSelectedAmbassadorId(amb.id);
                          setAmbassadorError('');
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 relative ${
                          isSelected
                            ? 'bg-white border-[#2E0249] ring-2 ring-[#2E0249] shadow-sm'
                            : 'bg-white/90 border-neutral-200 hover:border-purple-300 hover:bg-white'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-[#2E0249] text-[#FFC72C]' : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {amb.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="flex-1 min-w-0 pr-5">
                          <span className="font-bold text-xs text-neutral-900 truncate block">
                            {amb.name}
                          </span>
                          <p className="text-[11px] text-neutral-500 truncate">{amb.title}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-500 mt-1">
                            <span>{amb.phone}</span>
                            {amb.parishOrRegion && (
                              <span className="text-purple-700 font-medium">
                                • {amb.parishOrRegion}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 absolute top-3 right-3 ${
                            isSelected ? 'border-[#2E0249] bg-[#2E0249] text-[#FFC72C]' : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* USE AMBASSADOR CODE INPUT BOX (Discount changeable in agency settings, default 10%) */}
                <div className="mt-3.5 pt-3.5 border-t border-purple-200/80">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(!showCodeInput)}
                      className="text-xs font-bold text-[#2E0249] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>{showCodeInput || appliedAmbassadorCode ? 'Ambassador Code' : 'Have an Ambassador Code? Click to apply'}</span>
                    </button>
                    <span className="text-[10px] font-extrabold text-purple-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Save {settings.ambassadorDiscountPercentage ?? 10}% Off
                    </span>
                  </div>

                  {(showCodeInput || appliedAmbassadorCode) && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      {appliedAmbassadorCode ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="font-bold text-emerald-950 block">
                                Ambassador Code Applied ({appliedDiscountPercentage}% Discount)
                              </span>
                              <span className="text-emerald-700 text-[11px]">
                                Your package discount has been applied courtesy of your ambassador.
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveAmbassadorCode}
                            className="text-xs font-bold text-neutral-500 hover:text-rose-600 underline cursor-pointer px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter your ambassador's code"
                              value={ambassadorCodeInput}
                              onChange={(e) => {
                                setAmbassadorCodeInput(e.target.value);
                                setAmbassadorCodeError('');
                              }}
                              className="flex-1 bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                              id="ambassador-code-input"
                            />
                            <button
                              type="button"
                              onClick={handleApplyAmbassadorCode}
                              className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                              id="apply-ambassador-code-btn"
                            >
                              Apply Code
                            </button>
                          </div>

                          {ambassadorCodeError ? (
                            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{ambassadorCodeError}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-neutral-500">
                              Enter the confidential code provided by your travel ambassador to automatically claim your {settings.ambassadorDiscountPercentage ?? 10}% trip discount.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {ambassadorError && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-100 text-red-800 text-xs font-semibold rounded-xl border border-red-300 animate-in fade-in duration-200 mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{ambassadorError}</span>
                  </div>
                )}

                {selectedAmbassadorId && (
                  <div className="text-[11px] text-[#2E0249] bg-white/80 px-3 py-2 rounded-xl border border-purple-200 flex items-center gap-2 font-medium mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Selected Ambassador: <strong>{ambassadorsList.find((a) => a.id === selectedAmbassadorId)?.name}</strong> will manage your booking.
                    </span>
                  </div>
                )}
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
              <div className="bg-amber-50/80 rounded-xl p-3.5 text-xs text-neutral-800 flex items-start gap-2.5 border border-amber-200">
                <CreditCard className="w-4 h-4 text-purple-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#2E0249] block">Instant Lock-In Deposit Checkout:</span>
                  <span>
                    Clicking below carries you directly to the secure checkout option to make your deposit of <strong>{formatPriceJMD(depositDue)}</strong>. If you are signed in, your first deposit is permanently tracked to your account.
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-proceed-checkout"
                  className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Carrying to Checkout...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Proceed to Deposit Checkout ({formatPriceJMD(depositDue)})</span>
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
