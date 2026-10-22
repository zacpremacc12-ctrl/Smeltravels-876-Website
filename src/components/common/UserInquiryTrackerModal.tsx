import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  FileSpreadsheet,
  Edit3,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Copy,
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Lock,
  Compass,
  Palmtree,
  CalendarClock,
  LogIn,
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import { AdminOrderExcelRecord, BookingSubmission, OrderWorkflowStatus } from '../../types';

// Exclude static sample seed records from traveler-facing tracker
const SAMPLE_SEED_IDS = new Set([
  'order-1',
  'order-2',
  'order-3',
  'order-4',
  'order-5',
  'book-1',
  'book-2',
  'book-3',
  'book-4',
]);

export const UserInquiryTrackerModal: React.FC = () => {
  const {
    isInquiryTrackerOpen,
    closeInquiryTracker,
    inquiryTrackerInitialQuery,
    adminOrdersExcel,
    bookings,
    currentUser,
    updateUserInquiry,
    submitInquiryDeposit,
    showNotification,
    navigateTo,
    openCustomTripModal,
    openWiPayCheckout,
    openAuthModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'changes' | 'deposit'>('progress');

  // Installment payment selection state
  const [installmentChoice, setInstallmentChoice] = useState<'next' | 'full' | 'custom'>('next');
  const [customInstallmentVal, setCustomInstallmentVal] = useState<number>(50000);

  // Edit state for user changes
  const [editDates, setEditDates] = useState('');
  const [editAdults, setEditAdults] = useState(1);
  const [editChildren, setEditChildren] = useState(0);
  const [editPhone, setEditPhone] = useState('');
  const [editSpecialRequests, setEditSpecialRequests] = useState('');
  const [editClientMessage, setEditClientMessage] = useState('');
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('NCB Bank Transfer');
  const [depositRefNumber, setDepositRefNumber] = useState('');
  const [depositProofNotes, setDepositProofNotes] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Sync initial query: only populate if an explicit inquiry reference was passed
  useEffect(() => {
    if (isInquiryTrackerOpen) {
      if (inquiryTrackerInitialQuery) {
        setSearchQuery(inquiryTrackerInitialQuery);
      } else {
        setSearchQuery('');
        setSelectedRecordId(null);
      }
    }
  }, [isInquiryTrackerOpen, inquiryTrackerInitialQuery]);

  // Consolidate inquiries from adminOrdersExcel and bookings (excluding seed sample records)
  const consolidatedInquiries = useMemo(() => {
    const recordsMap = new Map<string, AdminOrderExcelRecord>();

    // 1. Load genuine orders from adminOrdersExcel (skip seed sample orders)
    adminOrdersExcel.forEach((rec) => {
      if (!SAMPLE_SEED_IDS.has(rec.id)) {
        recordsMap.set(rec.orderRef.toUpperCase(), rec);
      }
    });

    // 2. Also incorporate user-submitted bookings (skip seed sample bookings)
    bookings.forEach((b) => {
      if (SAMPLE_SEED_IDS.has(b.id)) return;

      const ref = (b.referenceNumber || b.id).toUpperCase();
      if (!recordsMap.has(ref)) {
        const contactVal: 'WhatsApp' | 'Phone' | 'Email' =
          b.preferredContactMethod === 'phone'
            ? 'Phone'
            : b.preferredContactMethod === 'email'
            ? 'Email'
            : 'WhatsApp';

        const workflowStatus: OrderWorkflowStatus =
          b.status === 'Confirmed'
            ? 'Confirmed'
            : b.status === 'Deposit Received' || b.status === 'Deposit Paid'
            ? 'Deposit Received'
            : 'Pending';

        const synthesizedRecord: AdminOrderExcelRecord = {
          id: b.id,
          orderRef: b.referenceNumber || b.id,
          receivedAt: b.createdAt,
          orderType: b.tripName?.toLowerCase().includes('custom') ? 'Custom Trip' : 'Booking Inquiry',
          customerName: b.customerName,
          email: b.email,
          phone: b.phone,
          parishOrCountry: b.countryOrParish,
          tripOrDestination: b.tripName,
          travelDates: b.preferredTravelDate || 'Flexible',
          adultsCount: b.adultsCount,
          childrenCount: b.childrenCount,
          budget: b.budget || 'Flexible',
          totalPrice: b.totalPrice || 0,
          depositPaid: b.depositPaid || 0,
          currency: 'JMD',
          paymentStatus: b.depositPaid && b.depositPaid > 0 ? (b.totalPrice && b.depositPaid >= b.totalPrice ? 'Paid in Full' : 'Deposit Paid') : 'Unpaid',
          orderStatus: workflowStatus,
          preferredContact: contactVal,
          assignedAdmin: 'Zachary Buchanan',
          specialRequests: b.specialRequests,
          inclusions: 'Flights, Hotel, Airport Transfers',
          adminNotes: b.internalNotes?.join(' | ') || '',
          lastUpdated: b.updatedAt || b.createdAt,
        };
        recordsMap.set(ref, synthesizedRecord);
      }
    });

    return Array.from(recordsMap.values());
  }, [adminOrdersExcel, bookings]);

  // User's inquiries matching the logged-in traveler profile
  const userInquiries = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userName = (currentUser.name || '').trim().toLowerCase();
    const userPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
    const depositRefs = new Set((currentUser.deposits || []).map((d) => (d.bookingRef || '').toUpperCase()));

    return consolidatedInquiries.filter((item) => {
      const matchEmail = Boolean(userEmail && item.email?.toLowerCase() === userEmail);
      const matchName = Boolean(userName && item.customerName?.toLowerCase() === userName);
      const matchPhone = Boolean(userPhone && item.phone && item.phone.replace(/[^0-9]/g, '') === userPhone);
      const matchDeposit = depositRefs.has(item.orderRef.toUpperCase());
      return matchEmail || matchName || matchPhone || matchDeposit;
    });
  }, [consolidatedInquiries, currentUser]);

  // Matched records based on query (or user inquiries by default)
  const matchingRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return userInquiries;
    }

    return consolidatedInquiries.filter((item) => {
      const matchRef = item.orderRef.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchPhone = item.phone ? item.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) : false;
      const matchName = item.customerName.toLowerCase().includes(q);
      const matchDest = item.tripOrDestination.toLowerCase().includes(q);
      return matchRef || matchEmail || matchPhone || matchName || matchDest;
    });
  }, [consolidatedInquiries, searchQuery, userInquiries]);

  // Selected single inquiry record
  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) {
      return matchingRecords[0] || null;
    }
    return matchingRecords.find((r) => r.id === selectedRecordId || r.orderRef === selectedRecordId) || matchingRecords[0] || null;
  }, [matchingRecords, selectedRecordId]);

  // Installments calculation
  const pendingInstallments = useMemo(() => {
    if (!selectedRecord?.paymentSchedule?.installments) return [];
    return selectedRecord.paymentSchedule.installments.filter((inst) => inst.status !== 'Paid');
  }, [selectedRecord]);

  const paidInstallments = useMemo(() => {
    if (!selectedRecord?.paymentSchedule?.installments) return [];
    return selectedRecord.paymentSchedule.installments.filter((inst) => inst.status === 'Paid');
  }, [selectedRecord]);

  const nextPendingInstallment = pendingInstallments[0] || null;

  const balanceDue = selectedRecord ? Math.max(0, (selectedRecord.totalPrice || 0) - (selectedRecord.depositPaid || 0)) : 0;
  const isPaidInFull = selectedRecord ? (selectedRecord.totalPrice > 0 && (selectedRecord.depositPaid || 0) >= selectedRecord.totalPrice) : false;

  // Percentage of total trip package paid
  const percentPaid = useMemo(() => {
    if (!selectedRecord || !selectedRecord.totalPrice || selectedRecord.totalPrice <= 0) {
      return selectedRecord?.depositPaid && selectedRecord.depositPaid > 0 ? 100 : 0;
    }
    return Math.min(100, Math.round(((selectedRecord.depositPaid || 0) / selectedRecord.totalPrice) * 100));
  }, [selectedRecord]);

  // Detect verified WiPay transaction reference
  const wipayTxnId = useMemo(() => {
    if (!selectedRecord) return null;
    const combined = `${selectedRecord.adminNotes || ''} ${selectedRecord.specialRequests || ''}`;
    const match = combined.match(/WP-JM-[A-Z0-9-]+/i);
    return match ? match[0] : (selectedRecord.depositPaid > 0 ? 'WP-JM-VERIFIED' : null);
  }, [selectedRecord]);

  // Sync edit form when selected record changes
  useEffect(() => {
    if (selectedRecord) {
      setEditDates(selectedRecord.travelDates || '');
      setEditAdults(selectedRecord.adultsCount || 1);
      setEditChildren(selectedRecord.childrenCount || 0);
      setEditPhone(selectedRecord.phone || '');
      setEditSpecialRequests(selectedRecord.specialRequests || '');
      setEditClientMessage('');

      const balance = Math.max(0, (selectedRecord.totalPrice || 0) - (selectedRecord.depositPaid || 0));
      const defaultDeposit = selectedRecord.depositPaid > 0 ? balance : Math.min(50000, balance > 0 ? balance : 50000);
      setDepositAmount(defaultDeposit > 0 ? defaultDeposit : 50000);
      setCustomInstallmentVal(nextPendingInstallment ? nextPendingInstallment.amount : (balance > 0 ? Math.min(balance, 50000) : 50000));
    }
  }, [selectedRecord, nextPendingInstallment]);

  // Computed installment amount to pay
  const installmentAmountToPay = useMemo(() => {
    if (installmentChoice === 'full') return balanceDue;
    if (installmentChoice === 'custom') return customInstallmentVal;
    if (nextPendingInstallment) return nextPendingInstallment.amount;
    return Math.min(balanceDue > 0 ? balanceDue : 50000, 50000);
  }, [installmentChoice, balanceDue, customInstallmentVal, nextPendingInstallment]);

  // Pay another installment with WiPay Live Gateway
  const handlePayInstallmentWithWiPay = (specificAmount?: number, label?: string) => {
    if (!selectedRecord) return;
    const amount = specificAmount !== undefined ? specificAmount : installmentAmountToPay;

    if (amount <= 0) {
      showNotification('Invalid Amount', 'Please specify or select an installment amount to pay.', 'warning');
      return;
    }

    const installmentLabel =
      label ||
      (installmentChoice === 'full'
        ? 'Final Balance Payment'
        : nextPendingInstallment
        ? nextPendingInstallment.label
        : `Installment Payment (${formatPriceJMD(amount)})`);

    closeInquiryTracker();
    openWiPayCheckout({
      tripId: selectedRecord.orderRef,
      orderRef: selectedRecord.orderRef,
      isInstallmentPayment: true,
      installmentLabel,
      title: `${selectedRecord.tripOrDestination} - ${installmentLabel}`,
      deposit: amount,
      totalPrice: selectedRecord.totalPrice || amount,
      customerName: currentUser?.name || selectedRecord.customerName,
      email: currentUser?.email || selectedRecord.email,
      phone: currentUser?.phone || selectedRecord.phone,
      countryOrParish: currentUser?.homeParishOrCountry || selectedRecord.parishOrCountry,
      dates: selectedRecord.travelDates,
    });
  };

  if (!isInquiryTrackerOpen) return null;

  // Strict Login Gate: Track Inquiry is only accessible if the user is logged in
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        id="inquiry-tracker-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeInquiryTracker();
        }}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden text-center p-6 sm:p-8 space-y-6"
          id="inquiry-tracker-locked-container"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center mx-auto shadow-lg border border-[#FFC72C]/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
              Traveler Access Only
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
              Log In to Track Your Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Track Inquiry & Installments is strictly accessible to logged-in travelers. Sign in to view where your WiPay transaction has reached, inspect your scheduled payment milestones, and pay your next installment online.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => {
                closeInquiryTracker();
                openAuthModal('login');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#FFC72C]/40"
              id="tracker-auth-login-btn"
            >
              <LogIn className="w-4 h-4 text-[#FFC72C]" />
              <span>Log In as Traveler</span>
            </button>

            <button
              onClick={() => {
                closeInquiryTracker();
                openAuthModal('signup');
              }}
              className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Don't have an account? Sign Up</span>
            </button>

            <button
              onClick={closeInquiryTracker}
              className="text-xs text-neutral-500 hover:text-neutral-800 pt-1 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    showNotification('Reference Copied', `Order reference ${ref} copied to clipboard!`);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsSubmittingChanges(true);

    const success = updateUserInquiry(selectedRecord.orderRef, {
      travelDates: editDates,
      adultsCount: editAdults,
      childrenCount: editChildren,
      phone: editPhone,
      specialRequests: editSpecialRequests,
      customerMessage: editClientMessage,
    });

    setIsSubmittingChanges(false);
    if (success) {
      setActiveTab('progress');
      showNotification('Changes Saved', 'Your inquiry modifications have been submitted to your assigned admin.');
    }
  };

  const handleProcessDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    if (depositAmount <= 0) {
      showNotification('Invalid Amount', 'Please enter a valid deposit amount.', 'warning');
      return;
    }

    setIsSubmittingDeposit(true);
    const success = submitInquiryDeposit(
      selectedRecord.orderRef,
      depositAmount,
      depositPaymentMethod,
      depositRefNumber,
      depositProofNotes
    );

    setIsSubmittingDeposit(false);
    if (success) {
      setDepositRefNumber('');
      setDepositProofNotes('');
      setActiveTab('progress');
      showNotification('Deposit Logged', `Your deposit of ${formatPriceJMD(depositAmount)} has been recorded.`);
    }
  };

  // Compute where the transaction has reached (1 to 5 steps)
  const getProgressStep = () => {
    if (!selectedRecord) return 1;
    if (isPaidInFull || selectedRecord.orderStatus === 'Confirmed' || selectedRecord.orderStatus === 'Ticket Issued') return 5;
    if (paidInstallments.length > 0 || (selectedRecord.depositPaid && selectedRecord.depositPaid > 45000)) return 4;
    if ((selectedRecord.depositPaid || 0) > 0 || selectedRecord.orderStatus === 'Deposit Received') return 3;
    if ((selectedRecord.totalPrice || 0) > 0 || selectedRecord.orderStatus === 'Quote Prepared') return 2;
    return 1;
  };

  const currentStep = getProgressStep();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="inquiry-tracker-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeInquiryTracker();
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        id="inquiry-tracker-container"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#2E0249] text-white flex items-center justify-between border-b border-purple-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Inquiry & Deposit Progress Tracker</span>
              </h2>
              <p className="text-xs text-purple-200">
                Track your trip proposal, manage travel details, and check your deposit balance anytime.
              </p>
            </div>
          </div>

          <button
            onClick={closeInquiryTracker}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close tracker"
            id="close-inquiry-tracker-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Lookup Bar (Works for everyone, logged in or not) */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedRecordId(null);
                }}
                placeholder="Enter Booking Ref (e.g., SMEL-CT-2026-...) or your Email / Phone number"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2E0249] shadow-2xs"
                id="inquiry-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 font-semibold hidden md:inline">
                Traveler: <strong className="text-purple-950">{currentUser.name}</strong> ({currentUser.email})
              </span>
              {matchingRecords.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 text-xs font-bold whitespace-nowrap">
                  {matchingRecords.length} trip{matchingRecords.length > 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </div>

          {/* If multiple inquiries match, show selectable pills */}
          {matchingRecords.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1">
              <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap">Found:</span>
              {matchingRecords.map((rec) => {
                const isSelected = selectedRecord?.orderRef === rec.orderRef;
                return (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2E0249] text-[#FFC72C] shadow-xs'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{rec.orderRef}</span>
                    <span className="text-[10px] opacity-75 font-normal">({rec.tripOrDestination})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!selectedRecord ? (
            /* Empty State: Prompt user to look at our trips or create their own */
            <div className="py-10 px-4 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-900 to-[#2E0249] text-[#FFC72C] flex items-center justify-center mx-auto shadow-lg border border-[#FFC72C]/30">
                <Compass className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  {searchQuery ? `No Trip Found for "${searchQuery}"` : `Welcome, ${currentUser.name}! No Active Trips Found Yet`}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
                  {searchQuery
                    ? "We couldn't find any booking or custom trip inquiry matching your search under this account. Try checking your booking reference or clearing the search."
                    : "You haven't made an inquiry or booking reservation with this account yet. Take a look at our upcoming international packages or let our team design your custom trip!"}
                </p>
              </div>

              {/* Primary CTAs: Look at our trips OR create your own */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeInquiryTracker();
                    navigateTo('trips');
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#2E0249] font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#FFC72C]"
                  id="tracker-look-at-trips-btn"
                >
                  <Palmtree className="w-4 h-4 text-[#2E0249]" />
                  <span>Look At Our Trips</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeInquiryTracker();
                    openCustomTripModal();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer border border-[#FFC72C]/30"
                  id="tracker-create-own-trip-btn"
                >
                  <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                  <span>Create Your Own Custom Trip</span>
                </button>
              </div>

              {searchQuery && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-purple-900 font-bold hover:underline cursor-pointer"
                  >
                    Clear search and check another reference
                  </button>
                </div>
              )}

              {/* Helpful lookup prompt */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-left text-xs text-neutral-600 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-200/70 text-[#2E0249] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="leading-relaxed">
                  <strong className="text-[#2E0249]">Already submitted an inquiry or deposit?</strong><br />
                  Enter your official Booking Reference Number (e.g., <code className="px-1 py-0.5 bg-white rounded border border-purple-200 font-mono text-[11px] text-purple-950">SMEL-CT-2026-...</code>) or the Email address used when submitting your trip into the search box above to track your proposal status and balance.
                </div>
              </div>
            </div>
          ) : (
            /* Inquiry Found: Show Overview, Steps, & Tabs */
            <div className="space-y-6">
              {/* Header Hero Banner for the Matched Inquiry */}
              <div className="bg-gradient-to-br from-purple-950 via-[#2E0249] to-[#3B185F] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 bg-[#FFC72C]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FFC72C] text-[#2E0249] font-black text-xs font-mono">
                        {selectedRecord.orderRef}
                      </span>
                      <button
                        onClick={() => handleCopyRef(selectedRecord.orderRef)}
                        className="text-purple-200 hover:text-white p-1"
                        title="Copy Reference"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-purple-200">•</span>
                      <span className="text-xs font-semibold text-purple-200">{selectedRecord.orderType}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {selectedRecord.tripOrDestination}
                    </h3>

                    <p className="text-xs text-purple-200">
                      Traveler: <strong className="text-white">{selectedRecord.customerName}</strong> ({selectedRecord.email})
                    </p>
                  </div>

                  {/* Right Status Badge */}
                  <div className="sm:text-right shrink-0">
                    <div className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">Inquiry Status</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFC72C] font-bold text-xs mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-pulse" />
                      <span>{selectedRecord.orderStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Details Pill Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-purple-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-purple-300 block">Travel Timing:</span>
                    <span className="font-bold text-white">{selectedRecord.travelDates || 'Flexible'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block">Party Size:</span>
                    <span className="font-bold text-white">
                      {selectedRecord.adultsCount} Adults{selectedRecord.childrenCount ? ` + ${selectedRecord.childrenCount} Children` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block">Selected Budget:</span>
                    <span className="font-bold text-[#FFC72C] font-mono">
                      {selectedRecord.budget || 'Flexible / Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block">Assigned Specialist:</span>
                    <span className="font-bold text-white">{selectedRecord.assignedAdmin || 'Zachary Buchanan'}</span>
                  </div>
                </div>

                {/* Origin Departure & Flight Route Bar */}
                {(selectedRecord.originCountry || selectedRecord.departureAirport) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-purple-800/40 text-xs">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Departure Origin:</span>
                      <span className="font-bold text-[#FFC72C]">
                        🛫 {selectedRecord.originCity ? `${selectedRecord.originCity}, ` : ''}{selectedRecord.originCountry || 'International'}
                        {selectedRecord.departureAirport ? ` (${selectedRecord.departureAirport})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Flight Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecord.flightPricingStatus === 'Estimated'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {selectedRecord.flightPricingStatus || 'Custom Quote Required'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Where the Transaction Has Reached: Progress & WiPay Live Verification */}
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2E0249]" />
                      <span>Where Your Transaction Has Reached</span>
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Live transaction milestones, verified WiPay receipts, and installment schedule.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {wipayTxnId && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WiPay Verified: {wipayTxnId}</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full whitespace-nowrap">
                      Stage {currentStep} of 5
                    </span>
                  </div>
                </div>

                {/* Progress bar showing % of total trip price paid */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-neutral-200">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2E0249]" />
                      <span>Overall Payment & Booking Progress</span>
                    </span>
                    <span className="text-[#2E0249] font-mono font-black">{percentPaid}% Paid</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200">
                    <div
                      className="h-full bg-gradient-to-r from-[#2E0249] via-purple-700 to-[#FFC72C] rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(5, percentPaid)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                    <span>Paid to Date: <strong className="text-emerald-700 font-mono">{formatPriceJMD(selectedRecord.depositPaid || 0)}</strong></span>
                    <span>Remaining Balance: <strong className="text-purple-950 font-mono">{formatPriceJMD(balanceDue)}</strong></span>
                  </div>
                </div>

                {/* 5-Step Progress Stepper Line */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
                  {/* Step 1 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      currentStep >= 1
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-neutral-900">1. Proposal Sent</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Trip proposal received by operations desk.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      currentStep >= 2
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : currentStep === 1
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-[#2E0249] text-[#FFC72C]'
                        }`}
                      >
                        {currentStep >= 2 ? '✓' : '2'}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">2. Quote Ready</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Total package pricing & flights calculated.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      currentStep >= 3
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : currentStep === 2
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 text-neutral-700'
                        }`}
                      >
                        {currentStep >= 3 ? '✓' : '3'}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">3. WiPay Deposit</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Deposit received & traveler spot secured.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      currentStep >= 4
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : currentStep === 3
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 text-neutral-700'
                        }`}
                      >
                        {currentStep >= 4 ? '✓' : '4'}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">4. Installments</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Milestone payments ongoing or settled.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      currentStep >= 5
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-neutral-100/70 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          currentStep >= 5 ? 'bg-emerald-600 text-white' : 'bg-neutral-300 text-neutral-700'
                        }`}
                      >
                        {currentStep >= 5 ? '✓' : '5'}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">5. Vouchers Out</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Hotel passes & flight tickets issued.
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Ledger & Balance Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Trip Price</div>
                  <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono mt-1">
                    {formatPriceJMD(selectedRecord.totalPrice || 0)}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">Quoted package rate</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Total Deposit Paid</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
                    {formatPriceJMD(selectedRecord.depositPaid || 0)}
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-1 font-semibold flex items-center gap-1">
                    <span>Status: {selectedRecord.paymentStatus}</span>
                    {wipayTxnId && <span className="text-[10px] font-mono bg-emerald-200/60 px-1 rounded">(WiPay)</span>}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-2xs">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Remaining Balance Due</div>
                  <div className="text-xl sm:text-2xl font-black text-purple-950 font-mono mt-1">
                    {formatPriceJMD(balanceDue)}
                  </div>
                  <div className="text-[11px] text-purple-700 mt-1 font-semibold">
                    {isPaidInFull ? '✓ Fully Settled Online' : 'Installment options available'}
                  </div>
                </div>
              </div>

              {/* ==========================================================
                  DEDICATED "PAY ANOTHER INSTALLMENT" CARD & ACTION
                 ========================================================== */}
              <div className="rounded-2xl border-2 border-[#FFC72C]/70 bg-gradient-to-br from-[#2E0249] via-[#3B185F] to-[#2E0249] p-5 text-white shadow-lg space-y-4 relative overflow-hidden" id="pay-another-installment-section">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-[#FFC72C]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black shadow-md">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#FFC72C]">
                          WiPay Jamaica Payment Portal
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                          Live Instant Update
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit',sans-serif]">
                        {isPaidInFull ? 'Trip Paid in Full ✓' : 'Pay Another Installment'}
                      </h4>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] text-purple-200 uppercase tracking-wider block">Remaining Balance</span>
                    <span className="text-lg font-black text-[#FFC72C] font-mono">{formatPriceJMD(balanceDue)}</span>
                  </div>
                </div>

                {isPaidInFull ? (
                  <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-white text-sm">Congratulations! All Installments Settled.</strong>
                      <p className="text-xs text-emerald-300 mt-0.5">
                        Your booking #{selectedRecord.orderRef} is 100% paid. Your itinerary tickets and travel vouchers are confirmed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1 relative z-10">
                    <p className="text-xs text-purple-200">
                      Select which installment milestone you would like to pay with WiPay, or specify a custom payment amount:
                    </p>

                    {/* Choice Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Option 1: Next Scheduled Milestone */}
                      <button
                        type="button"
                        onClick={() => setInstallmentChoice('next')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          installmentChoice === 'next'
                            ? 'bg-purple-900/90 border-[#FFC72C] ring-2 ring-[#FFC72C]/40 text-white shadow-md'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC72C]">Next Scheduled</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${installmentChoice === 'next' ? 'border-[#FFC72C] bg-[#FFC72C]' : 'border-neutral-400'}`}>
                            {installmentChoice === 'next' && <span className="w-1.5 h-1.5 rounded-full bg-[#2E0249]" />}
                          </span>
                        </div>
                        <div className="text-base font-black font-mono mt-1 text-white">
                          {formatPriceJMD(nextPendingInstallment ? nextPendingInstallment.amount : Math.min(balanceDue, 50000))}
                        </div>
                        <div className="text-[10px] text-purple-200 truncate mt-0.5">
                          {nextPendingInstallment ? nextPendingInstallment.label : 'Upcoming Milestone'}
                        </div>
                      </button>

                      {/* Option 2: Pay Full Remaining Balance */}
                      <button
                        type="button"
                        onClick={() => setInstallmentChoice('full')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          installmentChoice === 'full'
                            ? 'bg-purple-900/90 border-[#FFC72C] ring-2 ring-[#FFC72C]/40 text-white shadow-md'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Settle Entire Trip</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${installmentChoice === 'full' ? 'border-[#FFC72C] bg-[#FFC72C]' : 'border-neutral-400'}`}>
                            {installmentChoice === 'full' && <span className="w-1.5 h-1.5 rounded-full bg-[#2E0249]" />}
                          </span>
                        </div>
                        <div className="text-base font-black font-mono mt-1 text-white">
                          {formatPriceJMD(balanceDue)}
                        </div>
                        <div className="text-[10px] text-purple-200 truncate mt-0.5">
                          Pay Remaining Balance in Full
                        </div>
                      </button>

                      {/* Option 3: Custom Installment */}
                      <button
                        type="button"
                        onClick={() => setInstallmentChoice('custom')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          installmentChoice === 'custom'
                            ? 'bg-purple-900/90 border-[#FFC72C] ring-2 ring-[#FFC72C]/40 text-white shadow-md'
                            : 'bg-white/5 border-white/15 hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Custom Amount</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${installmentChoice === 'custom' ? 'border-[#FFC72C] bg-[#FFC72C]' : 'border-neutral-400'}`}>
                            {installmentChoice === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-[#2E0249]" />}
                          </span>
                        </div>
                        <div className="text-base font-black font-mono mt-1 text-white">
                          {formatPriceJMD(customInstallmentVal)}
                        </div>
                        <div className="text-[10px] text-purple-200 truncate mt-0.5">
                          Flexible Milestone Deposit
                        </div>
                      </button>
                    </div>

                    {/* Custom Amount Slider / Input */}
                    {installmentChoice === 'custom' && (
                      <div className="p-3 bg-purple-950/80 rounded-xl border border-purple-800/80 space-y-2">
                        <label className="block text-xs font-bold text-purple-200">
                          Enter Custom Installment Amount (JMD):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5000"
                            max={balanceDue > 0 ? balanceDue : 500000}
                            step="1000"
                            value={customInstallmentVal}
                            onChange={(e) => setCustomInstallmentVal(Math.max(1000, Number(e.target.value) || 0))}
                            className="flex-1 px-3 py-2 bg-white/10 border border-purple-400/40 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setCustomInstallmentVal(25000)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-lg font-mono text-purple-200"
                            >
                              $25k
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomInstallmentVal(50000)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-lg font-mono text-purple-200"
                            >
                              $50k
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomInstallmentVal(balanceDue)}
                              className="px-2 py-1 bg-[#FFC72C] text-[#2E0249] text-xs rounded-lg font-mono font-bold hover:bg-[#ffcf47]"
                            >
                              Full Balance
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Primary Trigger Button: Launches WiPay Checkout for Installment */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-purple-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#FFC72C]" />
                        <span>Instant receipt & payment confirmation generated on site.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePayInstallmentWithWiPay()}
                        id="pay-another-installment-btn"
                        className="px-6 py-3 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] active:scale-98 text-[#2E0249] font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 border border-[#FFC72C]"
                        title={`Pay another installment of ${formatPriceJMD(installmentAmountToPay)} with WiPay Jamaica`}
                      >
                        <CreditCard className="w-4 h-4 fill-current" />
                        <span>Pay Another Installment of {formatPriceJMD(installmentAmountToPay)} with WiPay</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* POST-DEPOSIT PAYMENT TIMEFRAME & DEADLINES SCHEDULE */}
              <div className="rounded-2xl border border-purple-200 overflow-hidden shadow-2xs">
                <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-bold shadow-xs">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold font-['Outfit',sans-serif] text-white">
                        Scheduled Installments Breakdown & Deadlines
                      </h4>
                      <p className="text-[11px] text-neutral-300">
                        {selectedRecord.depositPaid > 0 || selectedRecord.paymentStatus === 'Deposit Paid' || selectedRecord.paymentStatus === 'Paid in Full'
                          ? 'Specific payment milestones established following verified deposit.'
                          : 'Payment timeframe is generated following your initial WiPay deposit.'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC72C] border border-white/20">
                    JMD Currency
                  </span>
                </div>

                <div className="p-4 bg-purple-50/40 space-y-3">
                  {selectedRecord.depositPaid > 0 || selectedRecord.paymentStatus === 'Deposit Paid' || selectedRecord.paymentStatus === 'Paid in Full' ? (
                    selectedRecord.paymentSchedule?.installments && selectedRecord.paymentSchedule.installments.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-700 gap-2">
                          <span className="font-semibold">
                            Scheduled by Specialist:{' '}
                            <strong className="text-neutral-900">
                              {selectedRecord.paymentSchedule.configuredByAdmin || selectedRecord.assignedAdmin || 'Zachary Buchanan'}
                            </strong>
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Initial WiPay Deposit: {formatPriceJMD(selectedRecord.depositPaid)}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {selectedRecord.paymentSchedule.installments.map((inst, idx) => (
                            <div
                              key={inst.id || idx}
                              className={`p-3.5 bg-white rounded-xl border shadow-2xs space-y-2 flex flex-col justify-between ${
                                inst.status === 'Paid'
                                  ? 'border-emerald-200 bg-emerald-50/20'
                                  : 'border-purple-200/80'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-neutral-900 text-xs">
                                    {inst.label}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      inst.status === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : inst.status === 'Overdue'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}
                                  >
                                    {inst.status === 'Paid' ? '✓ Paid' : inst.status === 'Overdue' ? '⚠️ Overdue' : '⏳ Pending'}
                                  </span>
                                </div>

                                <div className="text-lg font-black text-[#2E0249] font-mono">
                                  {formatPriceJMD(inst.amount)}
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-neutral-600 font-medium pt-1 border-t border-neutral-100">
                                  <Clock className="w-3 h-3 text-purple-700" />
                                  <span>Deadline: <strong className="text-neutral-900 font-mono">{inst.dueDate}</strong></span>
                                </div>
                              </div>

                              {inst.status !== 'Paid' && (
                                <button
                                  type="button"
                                  onClick={() => handlePayInstallmentWithWiPay(inst.amount, inst.label)}
                                  className="w-full mt-2 py-1.5 px-2 bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay This Installment with WiPay</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Initial Deposit Verified: {formatPriceJMD(selectedRecord.depositPaid)}!</strong>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Your spot is locked. Your assigned travel administrator ({selectedRecord.assignedAdmin || 'Zachary Buchanan'}) is currently drafting your customized installment deadlines and payment timeframe for the remaining balance of {formatPriceJMD(balanceDue)}. You can use the "Pay Another Installment" card above anytime.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Initial WiPay Deposit Required to Unlock Timeframe</strong>
                          <span className="text-[11px] text-amber-800">
                            The deadline schedule and installment breakdown for the rest of your trip payments will be established once the initial deposit is confirmed via WiPay.
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          closeInquiryTracker();
                          openWiPayCheckout({
                            tripId: selectedRecord.orderRef,
                            orderRef: selectedRecord.orderRef,
                            title: selectedRecord.tripOrDestination,
                            deposit: selectedRecord.depositPaid || 45000,
                            totalPrice: selectedRecord.totalPrice || 280000,
                            customerName: selectedRecord.customerName,
                            email: selectedRecord.email,
                            phone: selectedRecord.phone,
                            countryOrParish: selectedRecord.parishOrCountry,
                            dates: selectedRecord.travelDates,
                          });
                        }}
                        className="px-4 py-2 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer hover:scale-101 flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 fill-current" />
                        <span>Book Now (Pay Deposit of {formatPriceJMD(selectedRecord.depositPaid || 45000)})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Navigation Tabs: Progress & Info | Make Changes | Pay Deposit */}
              <div className="flex border-b border-neutral-200">
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'progress'
                      ? 'border-[#2E0249] text-[#2E0249]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Inquiry & Admin Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('changes')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'changes'
                      ? 'border-[#2E0249] text-[#2E0249]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Make Changes to Inquiry</span>
                </button>

                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'deposit'
                      ? 'border-[#2E0249] text-[#2E0249]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Deposit & Payment Process</span>
                </button>
              </div>

              {/* TAB 1: INQUIRY DETAILS & ADMIN NOTES */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Inclusions & Requests */}
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                      <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Package Inclusions & Notes
                      </h5>
                      <div className="text-xs space-y-2 text-neutral-700">
                        <div>
                          <strong className="text-neutral-900">Inclusions:</strong>{' '}
                          {selectedRecord.inclusions || 'Roundtrip flights, 4-star lodging, excursions, airport transfers'}
                        </div>
                        <div>
                          <strong className="text-neutral-900">Special Requests:</strong>{' '}
                          {selectedRecord.specialRequests || 'No special dietary or room requests noted.'}
                        </div>
                        <div>
                          <strong className="text-neutral-900">Contact Method:</strong>{' '}
                          {selectedRecord.preferredContact || 'WhatsApp'}
                        </div>
                      </div>
                    </div>

                    {/* Admin Assigned Contact Card */}
                    <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                          Assigned Travel Specialist
                        </h5>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Official Admin
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-sm">
                          ZB
                        </div>
                        <div>
                          <div className="font-bold text-sm text-neutral-900">
                            {selectedRecord.assignedAdmin || 'Zachary Buchanan'}
                          </div>
                          <div className="text-xs text-neutral-500">Executive Travel Specialist</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`https://wa.me/18764024220?text=${encodeURIComponent(
                            `Hi ${selectedRecord.assignedAdmin || 'SMEL Travels'}! I'm inquiring regarding my booking order ${selectedRecord.orderRef} for ${selectedRecord.tripOrDestination}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp Admin</span>
                        </a>

                        <a
                          href={`mailto:smeltravels876@gmail.com?subject=Inquiry%20Update%20${selectedRecord.orderRef}`}
                          className="py-2 px-3 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions CTA Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-100 border border-neutral-200">
                    <div className="text-xs text-neutral-600">
                      Need to update dates, party size, or special requests?
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('changes')}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs border border-neutral-300 shadow-2xs transition-colors"
                      >
                        Modify Travel Details
                      </button>
                      <button
                        onClick={() => setActiveTab('deposit')}
                        className="px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-xs shadow-xs transition-colors"
                      >
                        Submit Deposit Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MAKE CHANGES TO INQUIRY */}
              {activeTab === 'changes' && (
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Traveler Self-Service Modifications:</span>
                      <p className="mt-0.5 text-blue-800">
                        You can modify your desired travel dates, adjust group guest counts, update your phone number, or leave specific requests for your assigned admin. All updates sync instantly to the admin live spreadsheet database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Preferred Travel Dates / Season
                      </label>
                      <input
                        type="text"
                        value={editDates}
                        onChange={(e) => setEditDates(e.target.value)}
                        placeholder="e.g., June 12 - 18, 2026 or Flexible July"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Contact Phone / WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="e.g., (876) 555-0192"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Number of Adults (12+ yrs)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editAdults}
                        onChange={(e) => setEditAdults(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Number of Children (0 - 11 yrs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={editChildren}
                        onChange={(e) => setEditChildren(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-700 mb-1">
                        Special Requests, Room Preferences, or Inclusions
                      </label>
                      <textarea
                        rows={2}
                        value={editSpecialRequests}
                        onChange={(e) => setEditSpecialRequests(e.target.value)}
                        placeholder="e.g., King bed requested, vegan meal options, airport transfer flight arrival time..."
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-neutral-700 mb-1">
                        Direct Message to Assigned Admin ({selectedRecord.assignedAdmin || 'Zachary Buchanan'})
                      </label>
                      <textarea
                        rows={2}
                        value={editClientMessage}
                        onChange={(e) => setEditClientMessage(e.target.value)}
                        placeholder="Ask questions about itinerary customization, flight times, or payment schedules..."
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('progress')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingChanges}
                      className="px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingChanges ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Changes to Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: DEPOSIT & PAYMENT PROCESS */}
              {activeTab === 'deposit' && (
                <div className="space-y-6">
                  {/* Financial Overview Card */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-neutral-500 font-bold uppercase">Booking Reference</span>
                      <div className="font-mono font-black text-lg text-[#2E0249]">{selectedRecord.orderRef}</div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-neutral-500 font-bold uppercase">Total Price</span>
                        <div className="font-mono font-bold text-neutral-900">{formatPriceJMD(selectedRecord.totalPrice || 0)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-700 font-bold uppercase">Paid So Far</span>
                        <div className="font-mono font-bold text-emerald-700">{formatPriceJMD(selectedRecord.depositPaid || 0)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-purple-900 font-bold uppercase">Balance Due</span>
                        <div className="font-mono font-bold text-purple-950">{formatPriceJMD(balanceDue)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Recommended: Instant WiPay Checkout */}
                  {balanceDue > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-[#2E0249] text-white border-2 border-[#FFC72C]/70 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded-full">
                            Recommended Instant Method
                          </span>
                          <span className="text-xs font-bold text-purple-200">WiPay Jamaica 256-Bit</span>
                        </div>
                        <h4 className="font-black text-white text-base">
                          Pay Next Installment Online via WiPay
                        </h4>
                        <p className="text-xs text-purple-200 max-w-md">
                          Pay directly with any Jamaican or International debit/credit card. Payment is verified in real-time and your balance updates automatically.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePayInstallmentWithWiPay()}
                        className="px-6 py-3 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#2E0249] font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 border border-[#FFC72C] whitespace-nowrap"
                      >
                        <CreditCard className="w-4 h-4 fill-current" />
                        <span>Pay {formatPriceJMD(installmentAmountToPay)} with WiPay</span>
                      </button>
                    </div>
                  )}

                  {/* Alternative Manual Bank Transfer & Lynk Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
                      <div className="font-bold text-neutral-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#2E0249]" />
                        <span>NCB Jamaica (Direct Bank Deposit / Wire)</span>
                      </div>
                      <div className="space-y-1 text-neutral-600 font-mono text-[11px] bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                        <div>Bank: <strong>National Commercial Bank (NCB)</strong></div>
                        <div>Account Name: <strong>SMEL Travels 876 Ltd</strong></div>
                        <div>Account #: <strong>354-982-109</strong></div>
                        <div>Account Type: <strong>Business Chequing</strong></div>
                        <div>Branch: <strong>Kingston, Jamaica</strong></div>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Please include your reference <strong className="text-neutral-800">{selectedRecord.orderRef}</strong> in the transfer remarks.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
                      <div className="font-bold text-neutral-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Scotia, CIBC, Lynk & Card Options</span>
                      </div>
                      <div className="space-y-1 text-neutral-600 font-mono text-[11px] bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                        <div>Scotiabank: <strong>SMEL Travels (Acct: 890-441-2)</strong></div>
                        <div>Lynk ID: <strong>@smeltravels876</strong></div>
                        <div>International Card: <strong>Available via Invoice Link</strong></div>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        After completing transfer, enter the payment reference below to update your records immediately.
                      </p>
                    </div>
                  </div>

                  {/* Submit Deposit Form */}
                  <form onSubmit={handleProcessDeposit} className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#2E0249]" />
                        <span>Log Deposit or Balance Payment</span>
                      </h5>
                      <span className="text-[11px] text-purple-700 font-semibold">
                        Updates your booking status immediately
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Deposit Amount (JMD) *
                        </label>
                        <input
                          type="number"
                          min="1000"
                          step="500"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                        />
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setDepositAmount(30000)}
                            className="text-[10px] bg-white border border-neutral-300 px-1.5 py-0.5 rounded font-mono hover:bg-neutral-100"
                          >
                            $30k
                          </button>
                          <button
                            type="button"
                            onClick={() => setDepositAmount(50000)}
                            className="text-[10px] bg-white border border-neutral-300 px-1.5 py-0.5 rounded font-mono hover:bg-neutral-100"
                          >
                            $50k
                          </button>
                          {balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => setDepositAmount(balanceDue)}
                              className="text-[10px] bg-[#2E0249] text-[#FFC72C] px-1.5 py-0.5 rounded font-mono font-bold hover:bg-[#3B185F]"
                            >
                              Full Balance (${(balanceDue / 1000).toFixed(0)}k)
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Payment Method Used *
                        </label>
                        <select
                          value={depositPaymentMethod}
                          onChange={(e) => setDepositPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                        >
                          <option value="NCB Bank Transfer">NCB Bank Transfer</option>
                          <option value="Scotiabank Jamaica">Scotiabank Jamaica</option>
                          <option value="Lynk Transfer">Lynk Digital Payment</option>
                          <option value="CIBC FirstCaribbean">CIBC FirstCaribbean</option>
                          <option value="Debit / Credit Card">Debit / Credit Card</option>
                          <option value="Cash at Agency Branch">Cash at Agency Branch</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          Bank Reference / Receipt #
                        </label>
                        <input
                          type="text"
                          value={depositRefNumber}
                          onChange={(e) => setDepositRefNumber(e.target.value)}
                          placeholder="e.g., NCB-TXN-882193"
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-bold text-neutral-700 mb-1">
                          Payment Notes / Receipt Confirmation (Optional)
                        </label>
                        <input
                          type="text"
                          value={depositProofNotes}
                          onChange={(e) => setDepositProofNotes(e.target.value)}
                          placeholder="e.g., Transferred from John Doe NCB Account at 2:30 PM..."
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2E0249]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingDeposit}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingDeposit ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing Deposit...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Log Deposit Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-6 py-3.5 bg-neutral-100 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Inquiry Tracking • SMELTRAVELS876 Live Operations Database</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeInquiryTracker}
              className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
