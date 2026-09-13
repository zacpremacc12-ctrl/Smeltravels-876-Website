import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Compass,
  CheckCircle2,
  Send,
  Plane,
  Camera,
  Heart,
  ChevronRight,
  ChevronLeft,
  Search,
  Globe,
  DollarSign,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  WORLD_DESTINATIONS,
  getCountryPhotos,
  CountryDestinationInfo,
} from '../../data/customTripDestinations';
import { CustomTripRequestInput } from '../../types';

export const CustomTripModal: React.FC = () => {
  const {
    isCustomTripModalOpen,
    closeCustomTripModal,
    selectedDestinationForCustomTrip,
    submitCustomTripRequest,
    currentUser,
    settings,
  } = useApp();

  // Wizard Steps: 1: Destination & Country, 2: Dates & Group, 3: Style & Inclusions, 4: Traveler Details, 5: Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Live destination catalog from Agency Settings or fallback to WORLD_DESTINATIONS
  const availableDestinations: CountryDestinationInfo[] = useMemo(() => {
    if (Array.isArray(settings?.customTripDestinations) && settings.customTripDestinations.length > 0) {
      return settings.customTripDestinations;
    }
    return WORLD_DESTINATIONS;
  }, [settings?.customTripDestinations]);

  // Step 1: Destination Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCountryInfo, setSelectedCountryInfo] = useState<CountryDestinationInfo | null>(() => {
    if (Array.isArray(settings?.customTripDestinations) && settings.customTripDestinations.length > 0) {
      return settings.customTripDestinations[0];
    }
    return WORLD_DESTINATIONS[0];
  });
  const [customDestinationName, setCustomDestinationName] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Step 2: Dates & Timing
  const [travelDatesType, setTravelDatesType] = useState<'specific' | 'flexible'>('flexible');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flexibleSeason, setFlexibleSeason] = useState('Summer 2026 (June - August)');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Step 3: Vibe, Style, Budget & Inclusions
  const [tripVibe, setTripVibe] = useState('Beaches & Tropical Relaxation');
  const [travelStyle, setTravelStyle] = useState('4-Star Comfort & Boutique');
  
  // Custom Budget State (USD, JMD, or any currency)
  const [budgetCurrency, setBudgetCurrency] = useState<'USD' | 'JMD' | 'CAD' | 'GBP' | 'EUR' | 'OTHER'>('USD');
  const [customCurrencyCode, setCustomCurrencyCode] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<string>('2500');
  const [budgetType, setBudgetType] = useState<'per_person' | 'total_trip'>('per_person');
  const [budgetFlexibility, setBudgetFlexibility] = useState<'target' | 'flexible' | 'maximum'>('target');

  const [mustHaveInclusions, setMustHaveInclusions] = useState<string[]>([
    'Roundtrip Flights',
    'Hotel / Resort Stay',
    'Airport Private Transfers',
    'Curated Tours & Sightseeing',
  ]);
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 4: Traveler Contact
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryOrParish, setCountryOrParish] = useState('Kingston, Jamaica');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [preferredAmbassador, setPreferredAmbassador] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Formatted Budget Summary String
  const formattedBudgetSummary = useMemo(() => {
    const currencyLabel = budgetCurrency === 'OTHER' ? (customCurrencyCode.trim().toUpperCase() || 'CUSTOM') : budgetCurrency;
    const symbol = budgetCurrency === 'USD' ? '$' : budgetCurrency === 'JMD' ? 'JA$' : budgetCurrency === 'CAD' ? 'CA$' : budgetCurrency === 'GBP' ? '£' : budgetCurrency === 'EUR' ? '€' : '';
    const formattedAmount = Number(budgetAmount || 0).toLocaleString();
    const scopeLabel = budgetType === 'per_person' ? 'per person' : 'total group';
    const flexLabel = budgetFlexibility === 'target' ? 'approx.' : budgetFlexibility === 'flexible' ? 'flexible' : 'max';
    return `${symbol}${formattedAmount} ${currencyLabel} (${scopeLabel}, ${flexLabel})`;
  }, [budgetCurrency, customCurrencyCode, budgetAmount, budgetType, budgetFlexibility]);

  // Initialize or prefill from user session or passed country
  useEffect(() => {
    if (isCustomTripModalOpen) {
      if (currentUser) {
        if (!customerName) setCustomerName(currentUser.name);
        if (!email) setEmail(currentUser.email);
        if (!phone && currentUser.phone) setPhone(currentUser.phone);
        if (!countryOrParish && currentUser.homeParishOrCountry) setCountryOrParish(currentUser.homeParishOrCountry);
      }

      if (selectedDestinationForCustomTrip) {
        const found = availableDestinations.find(
          (d) =>
            d.name.toLowerCase().includes(selectedDestinationForCustomTrip.toLowerCase()) ||
            d.country.toLowerCase().includes(selectedDestinationForCustomTrip.toLowerCase())
        );
        if (found) {
          setSelectedCountryInfo(found);
          setCustomDestinationName(found.name);
        } else {
          setCustomDestinationName(selectedDestinationForCustomTrip);
        }
      }
    }
  }, [isCustomTripModalOpen, selectedDestinationForCustomTrip, currentUser, availableDestinations]);

  // Derived current photos
  const currentPhotos = useMemo(() => {
    if (selectedCountryInfo && (!customDestinationName || customDestinationName === selectedCountryInfo.name)) {
      return selectedCountryInfo.photos;
    }
    return getCountryPhotos(customDestinationName || 'World');
  }, [selectedCountryInfo, customDestinationName]);

  // Filtered country catalog
  const filteredDestinations = useMemo(() => {
    return availableDestinations.filter((dest) => {
      const matchesRegion = selectedRegion === 'All' || dest.region === selectedRegion;
      const matchesSearch =
        !searchQuery.trim() ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.popularCities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dest.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedRegion, availableDestinations]);

  if (!isCustomTripModalOpen) return null;

  // Toggle inclusion tag
  const toggleInclusion = (item: string) => {
    setMustHaveInclusions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim()) {
      alert('Please provide your name and email address so our admins can send your itinerary.');
      return;
    }

    const destinationTitle = customDestinationName.trim() || selectedCountryInfo?.name || 'Custom International Destination';
    const countryName = selectedCountryInfo?.country || customDestinationName.trim() || 'Custom Country';

    setIsSubmitting(true);
    try {
      const payload: CustomTripRequestInput = {
        destination: destinationTitle,
        country: countryName,
        countryFlag: selectedCountryInfo?.flag || '✈️',
        landmarkPhotos: currentPhotos.map((p) => p.url),
        travelDatesType,
        startDate: travelDatesType === 'specific' ? startDate : undefined,
        endDate: travelDatesType === 'specific' ? endDate : undefined,
        flexibleSeason: travelDatesType === 'flexible' ? flexibleSeason : undefined,
        durationDays,
        adultsCount,
        childrenCount,
        tripVibe,
        travelStyle,
        budgetPerPerson: formattedBudgetSummary,
        budgetCurrency: budgetCurrency === 'OTHER' ? (customCurrencyCode.trim().toUpperCase() || 'OTHER') : budgetCurrency,
        budgetAmount: budgetAmount,
        budgetType: budgetType,
        mustHaveInclusions,
        specialRequests,
        customerName,
        email,
        phone,
        countryOrParish,
        preferredContactMethod,
        preferredAmbassador: preferredAmbassador || undefined,
      };

      const result = await submitCustomTripRequest(payload);
      setSubmittedRef(result.referenceNumber);
      setCurrentStep(5); // Success step
    } catch (err) {
      console.error('Error submitting custom trip:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePhoto = currentPhotos[activePhotoIndex] || currentPhotos[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in"
      id="custom-trip-modal-overlay"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        id="custom-trip-modal-container"
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#2E0249] via-[#4A0E4E] to-[#2E0249] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-purple-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC72C]/20 border border-[#FFC72C]/40 flex items-center justify-center text-[#FFC72C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
                  Design Your Dream Journey
                </span>
                <span className="inline-flex items-center text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/90">
                  Routed to All Admins
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Custom Trip Creator
              </h2>
            </div>
          </div>

          <button
            onClick={closeCustomTripModal}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close Custom Trip Creator"
            id="close-custom-trip-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        {currentStep < 5 && (
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex items-center justify-between text-xs font-medium text-neutral-600 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 1
                    ? 'bg-[#2E0249] text-white'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span className={currentStep === 1 ? 'font-bold text-[#2E0249]' : ''}>
                1. Destination
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-neutral-300" />

            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 2
                    ? 'bg-[#2E0249] text-white'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </span>
              <span className={currentStep === 2 ? 'font-bold text-[#2E0249]' : ''}>
                2. When & Group
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-neutral-300" />

            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 3
                    ? 'bg-[#2E0249] text-white'
                    : currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
              </span>
              <span className={currentStep === 3 ? 'font-bold text-[#2E0249]' : ''}>
                3. Style & Inclusions
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-neutral-300 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 4 ? 'bg-[#2E0249] text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                4
              </span>
              <span className={currentStep === 4 ? 'font-bold text-[#2E0249]' : ''}>
                4. Send to Admins
              </span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: INTERACTIVE DESTINATION & COUNTRY SELECTOR WITH PHOTOS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#2E0249]" />
                    <span>Where in the world would you like to travel?</span>
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded-full">
                    Any Country or City
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Choose from popular destinations below, or type in any country or city worldwide. We provide interactive landmark photographs instantly!
                </p>
              </div>

              {/* Interactive Destination Search & Custom Input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search or type ANY country or city (e.g., Japan, Italy, Panama, Bali, Paris)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim().length > 1) {
                        setCustomDestinationName(e.target.value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] focus:border-transparent outline-none bg-white shadow-sm"
                    id="custom-trip-destination-search-input"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full py-2.5 px-3 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none bg-white shadow-sm"
                    id="custom-trip-region-filter"
                  >
                    <option value="All">All Continents</option>
                    <option value="Caribbean">Caribbean</option>
                    <option value="Americas">Americas</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia & Middle East">Asia & Middle East</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
              </div>

              {/* Interactive Photo Showcase for Selected Destination */}
              <div className="bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-lg border border-neutral-800">
                <div className="relative h-60 sm:h-72 w-full overflow-hidden group">
                  {activePhoto && (
                    <img
                      src={activePhoto.url}
                      alt={activePhoto.landmark || 'Destination preview'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#FFC72C] border border-white/20">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Interactive Photo {activePhotoIndex + 1} of {currentPhotos.length}</span>
                      </span>

                      {selectedCountryInfo?.flag && (
                        <span className="text-3xl drop-shadow-md">
                          {selectedCountryInfo.flag}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#FFC72C] font-bold">
                        Selected Itinerary Destination
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                        {customDestinationName || selectedCountryInfo?.name}
                      </h4>
                      {activePhoto?.caption && (
                        <p className="text-xs sm:text-sm text-neutral-200 mt-1 line-clamp-2 max-w-xl drop-shadow">
                          {activePhoto.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Photo Navigation arrows if multiple photos */}
                  {currentPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === 0 ? currentPhotos.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIndex((prev) =>
                            prev === currentPhotos.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Photo Thumbnail Strip */}
                <div className="p-3 bg-neutral-950 flex items-center gap-2 overflow-x-auto">
                  {currentPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIndex === idx
                          ? 'border-[#FFC72C] scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.landmark}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Selection Chips / Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Select or Explore Curated Destinations:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {filteredDestinations.map((dest) => {
                    const isSelected =
                      selectedCountryInfo?.id === dest.id &&
                      (!customDestinationName || customDestinationName === dest.name);
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          setSelectedCountryInfo(dest);
                          setCustomDestinationName(dest.name);
                          setActivePhotoIndex(0);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-md'
                            : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                        id={`dest-card-${dest.id}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl">{dest.flag}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#FFC72C]" />}
                        </div>
                        <div className="mt-2">
                          <div className="font-bold text-sm leading-snug">{dest.name}</div>
                          <div
                            className={`text-[11px] truncate ${
                              isSelected ? 'text-purple-200' : 'text-neutral-500'
                            }`}
                          >
                            {dest.capitalOrMainCity}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Destination Input Box */}
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2E0249]">
                      Traveling somewhere else not listed?
                    </span>
                    <p className="text-[11px] text-neutral-600">
                      Type any specific country, island, or multi-city route here.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="e.g., Greece (Santorini & Athens)"
                    value={customDestinationName}
                    onChange={(e) => {
                      setCustomDestinationName(e.target.value);
                      setActivePhotoIndex(0);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2E0249]"
                    id="custom-destination-exact-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATES, TIMING & PARTY SIZE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2E0249]" />
                  <span>Whenever You Want to Go</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  You can set exact flight dates or let our administrators know your preferred travel season.
                </p>
              </div>

              {/* Timing Mode Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTravelDatesType('flexible')}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    travelDatesType === 'flexible'
                      ? 'bg-white text-[#2E0249] shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                  id="tab-flexible-dates"
                >
                  Flexible / Ideal Season
                </button>
                <button
                  type="button"
                  onClick={() => setTravelDatesType('specific')}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    travelDatesType === 'specific'
                      ? 'bg-white text-[#2E0249] shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                  id="tab-specific-dates"
                >
                  Exact Dates
                </button>
              </div>

              {/* Flexible Season Selection */}
              {travelDatesType === 'flexible' ? (
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Select Your Preferred Season or Month:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      'Summer 2026 (June - August)',
                      'Fall / Autumn 2026 (Sept - Nov)',
                      'December Festive 2026 (Holidays)',
                      'Winter / New Year 2027 (Jan - Feb)',
                      'Spring 2027 (March - May)',
                      'Anytime / Open to Best Rates',
                    ].map((season) => (
                      <button
                        key={season}
                        type="button"
                        onClick={() => setFlexibleSeason(season)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                          flexibleSeason === season
                            ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-sm'
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>

                  {/* Duration Slider / Pill */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-2">
                      <span>Ideal Trip Length:</span>
                      <span className="text-sm font-extrabold text-[#2E0249] bg-purple-50 px-3 py-1 rounded-lg">
                        {durationDays} Days / {durationDays - 1} Nights
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="21"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full accent-[#2E0249] cursor-pointer"
                      id="duration-days-slider"
                    />
                    <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                      <span>3 Days (Quick Getaway)</span>
                      <span>7 Days (Standard Vacation)</span>
                      <span>14+ Days (Grand Tour)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Specific Dates Inputs */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Departure Date (Fly Out):
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-start-date"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Return Date (Fly Home):
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-end-date"
                    />
                  </div>
                </div>
              )}

              {/* Group Size (Adults & Children) */}
              <div className="pt-4 border-t border-neutral-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2E0249]" />
                  <span>Number of Travelers</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-neutral-900">Adults</div>
                      <div className="text-[11px] text-neutral-500">Ages 12 and above</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdultsCount((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="text-base font-extrabold text-[#2E0249] w-6 text-center">
                        {adultsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount((prev) => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-neutral-900">Children</div>
                      <div className="text-[11px] text-neutral-500">Under 12 years old</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="text-base font-extrabold text-[#2E0249] w-6 text-center">
                        {childrenCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount((prev) => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STYLE, INCLUSIONS & VIBE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2E0249]" />
                  <span>Trip Vibe & Travel Inclusions</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Customize the experience style so our administrators know exactly how to structure your package.
                </p>
              </div>

              {/* Trip Vibe Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Trip Vibe & Occasion:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Beaches & Tropical Relaxation 🏖️',
                    'Culture, Museums & History 🏛️',
                    'Nightlife, Rooftops & Parties 🍸',
                    'Shopping & Duty-Free Spree 🛍️',
                    'Romantic Honeymoon / Anniversary 🥂',
                    'Family Fun & Theme Parks 🎢',
                    'Nature, Volcanoes & Wildlife 🌿',
                    'Foodie & Culinary Adventure 🍷',
                  ].map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => setTripVibe(vibe)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        tripVibe === vibe
                          ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-sm'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style Tier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Accommodation Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Affordable / Standard', desc: 'Clean 3-Star Hotels, great location & value' },
                    { title: '4-Star Comfort & Boutique', desc: 'Upscale amenities, pools & breakfast' },
                    { title: '5-Star Luxury VIP', desc: 'All-inclusive resorts, private suites & transfers' },
                  ].map((style) => (
                    <button
                      key={style.title}
                      type="button"
                      onClick={() => setTravelStyle(style.title)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        travelStyle === style.title
                          ? 'bg-purple-50 text-[#2E0249] border-[#2E0249] ring-2 ring-[#2E0249]'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{style.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Budget Specification (USD, JMD, or Any Currency) */}
              <div className="p-4 bg-gradient-to-r from-purple-50/80 via-amber-50/60 to-purple-50/80 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#2E0249]" />
                      <span>Set Your Trip Budget & Currency</span>
                      <span className="text-[10px] bg-[#FFC72C] text-[#2E0249] font-black px-2 py-0.5 rounded-full">Required</span>
                    </label>
                    <p className="text-[11px] text-neutral-600">
                      Choose USD, JMD, or type any global currency so admins can align flights and luxury stays.
                    </p>
                  </div>

                  {/* Scope: Per Person vs Total Group */}
                  <div className="inline-flex p-1 bg-white rounded-xl border border-neutral-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setBudgetType('per_person')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        budgetType === 'per_person' ? 'bg-[#2E0249] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Per Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('total_trip')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        budgetType === 'total_trip' ? 'bg-[#2E0249] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Total Group Budget
                    </button>
                  </div>
                </div>

                {/* Currency Selection Pills */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-700 block mb-1.5">Choose Currency:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'USD', label: 'USD ($)', desc: 'US Dollars' },
                      { id: 'JMD', label: 'JMD (JA$)', desc: 'Jamaican Dollars' },
                      { id: 'CAD', label: 'CAD (C$)', desc: 'Canadian Dollars' },
                      { id: 'GBP', label: 'GBP (£)', desc: 'British Pounds' },
                      { id: 'EUR', label: 'EUR (€)', desc: 'Euros' },
                      { id: 'OTHER', label: 'Other', desc: 'Any Currency' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setBudgetCurrency(c.id as any)}
                        className={`py-2 px-2 rounded-xl border text-center transition-all ${
                          budgetCurrency === c.id
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249] shadow-sm ring-2 ring-[#2E0249]'
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{c.label}</div>
                        <div className={`text-[10px] ${budgetCurrency === c.id ? 'text-purple-200' : 'text-neutral-400'}`}>{c.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* If 'OTHER' currency selected, input custom currency code/name */}
                {budgetCurrency === 'OTHER' && (
                  <div className="animate-fade-in bg-white p-3 rounded-xl border border-purple-200">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Type Your Currency Code or Name (e.g., TTD, BBD, KYD, AUD, CHF, etc.):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TTD (Trinidad & Tobago Dollars)"
                      value={customCurrencyCode}
                      onChange={(e) => setCustomCurrencyCode(e.target.value)}
                      className="w-full sm:w-80 px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-[#2E0249] outline-none"
                    />
                  </div>
                )}

                {/* Budget Amount Input & Flexibility */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Estimated Budget Amount ({budgetCurrency === 'OTHER' ? customCurrencyCode || 'Custom Currency' : budgetCurrency}):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-500">
                          {budgetCurrency === 'USD' ? '$' : budgetCurrency === 'JMD' ? 'JA$' : budgetCurrency === 'CAD' ? 'C$' : budgetCurrency === 'GBP' ? '£' : budgetCurrency === 'EUR' ? '€' : ''}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-2.5 text-sm font-bold border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none"
                          placeholder="e.g. 2500"
                          id="custom-trip-budget-input"
                        />
                      </div>
                    </div>

                    <div className="sm:w-56">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Budget Flexibility:
                      </label>
                      <select
                        value={budgetFlexibility}
                        onChange={(e) => setBudgetFlexibility(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-xs font-semibold border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none"
                      >
                        <option value="target">Approximate Target</option>
                        <option value="flexible">Flexible (+/- 20%)</option>
                        <option value="maximum">Strict Maximum Ceiling</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-neutral-500">Quick Presets:</span>
                    {(budgetCurrency === 'USD' ? [
                      { label: '$1,200 (Economy)', val: '1200' },
                      { label: '$2,000 (Comfort)', val: '2000' },
                      { label: '$3,500 (Premium)', val: '3500' },
                      { label: '$5,000+ (Luxury VIP)', val: '5000' },
                    ] : budgetCurrency === 'JMD' ? [
                      { label: '$180k JMD', val: '180000' },
                      { label: '$300k JMD', val: '300000' },
                      { label: '$500k JMD', val: '500000' },
                      { label: '$800k+ JMD', val: '800000' },
                    ] : [
                      { label: '1,500', val: '1500' },
                      { label: '3,000', val: '3000' },
                      { label: '5,000', val: '5000' },
                      { label: '8,000', val: '8000' },
                    ]).map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setBudgetAmount(preset.val)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          budgetAmount === preset.val
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Live Formatted Summary Pill */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
                    <span className="text-neutral-600">Selected Budget:</span>
                    <span className="font-extrabold text-[#2E0249] text-sm">
                      {formattedBudgetSummary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Must-Have Inclusions Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  What would you like SMELTRAVELS876 to arrange for you?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Roundtrip Flights', label: 'Roundtrip Flights (from Jamaica or overseas)', icon: Plane },
                    { id: 'Hotel / Resort Stay', label: 'Hotel / All-Inclusive Resort Accommodations', icon: MapPin },
                    { id: 'Airport Private Transfers', label: 'Private Airport Pickup & Return Transfers', icon: Compass },
                    { id: 'Curated Tours & Sightseeing', label: 'Curated Excursions & Sightseeing Tours', icon: Camera },
                    { id: 'Daily Breakfast / Meals', label: 'Daily Breakfast / All-Inclusive Dining', icon: Sparkles },
                    { id: 'Travel Visa / Document Help', label: 'Entry Visa & Travel Document Assistance', icon: ShieldCheck },
                  ].map(({ id, label, icon: Icon }) => {
                    const checked = mustHaveInclusions.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleInclusion(id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <Icon className={`w-4 h-4 ${checked ? 'text-emerald-600' : 'text-neutral-400'}`} />
                          <span>{label}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Requests or Dreams Textbox */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Special Wishes or Custom Itinerary Notes (Optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., We want a private yacht sunset cruise, halal/vegetarian meal options, connecting rooms for children, or celebration champagne..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                  id="custom-trip-special-requests-textarea"
                />
              </div>
            </div>
          )}

          {/* STEP 4: TRAVELER DETAILS & DISPATCH CONFIRMATION */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#2E0249]" />
                  <span>Where Should Admins Send Your Proposal?</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Once submitted, this request will be immediately routed to all admins to craft your personalized itinerary and official quote.
                </p>
              </div>

              {/* Administrative Notification Badge */}
              <div className="p-4 bg-gradient-to-r from-purple-50 via-amber-50 to-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shrink-0 mt-0.5 shadow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs text-neutral-700 leading-relaxed">
                  <div className="font-bold text-[#2E0249] text-sm mb-0.5">
                    Proposal Dispatch: Routed to All Admins
                  </div>
                  Your customized itinerary request for <strong>{customDestinationName || selectedCountryInfo?.name}</strong> will be routed to all admins for priority itinerary preparation and booking coordination.
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Kadeen Campbell"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g., kadeen@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g., (876) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Home Parish / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g., St. Andrew, Jamaica"
                      value={countryOrParish}
                      onChange={(e) => setCountryOrParish(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="custom-trip-parish-input"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Contact Mode & Ambassador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    How Should We Contact You?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'phone', label: 'Phone Call' },
                      { id: 'email', label: 'Email' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPreferredContactMethod(method.id as any)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all text-center ${
                          preferredContactMethod === method.id
                            ? 'bg-[#2E0249] text-white border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Preferred Ambassador / Advisor (Optional)
                  </label>
                  <select
                    value={preferredAmbassador}
                    onChange={(e) => setPreferredAmbassador(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none bg-white"
                  >
                    <option value="">Executive Travel Desk (Default)</option>
                    {(settings.ambassadors || []).map((amb) => (
                      <option key={amb.id} value={amb.name}>
                        {amb.name} ({amb.title || 'Ambassador'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-xs space-y-1.5 text-neutral-700">
                <div className="font-bold text-neutral-900 mb-1">Itinerary Overview Summary:</div>
                <div>📍 Destination: <span className="font-semibold text-neutral-900">{customDestinationName || selectedCountryInfo?.name}</span></div>
                <div>📅 Timing: <span className="font-semibold text-neutral-900">{travelDatesType === 'specific' ? `${startDate} to ${endDate}` : `${flexibleSeason} (${durationDays} Days)`}</span></div>
                <div>👥 Travelers: <span className="font-semibold text-neutral-900">{adultsCount} Adult(s){childrenCount ? `, ${childrenCount} Child(ren)` : ''}</span></div>
                <div>💰 Budget: <span className="font-semibold text-neutral-900">{formattedBudgetSummary}</span></div>
                <div>✨ Style: <span className="font-semibold text-neutral-900">{travelStyle} • {tripVibe}</span></div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 transition-all disabled:opacity-50"
                  id="submit-custom-trip-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#FFC72C] border-t-transparent rounded-full animate-spin" />
                      <span>Routing to All Admins...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Route Proposal to All Admins</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION & ADMIN DISPATCH NOTICE */}
          {currentStep === 5 && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ref #{submittedRef}
                </span>
                <h3 className="text-2xl font-black text-[#2E0249] mt-3">
                  Your Custom Trip is on its Way!
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto mt-2">
                  Your customized itinerary request for{' '}
                  <strong className="text-neutral-900">
                    {customDestinationName || selectedCountryInfo?.name}
                  </strong>{' '}
                  has been routed to all admins.
                </p>
              </div>

              {/* Destination Photo Confirmation Card */}
              {activePhoto && (
                <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-neutral-200 shadow-sm text-left">
                  <div className="h-40 relative">
                    <img
                      src={activePhoto.url}
                      alt="Destination"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <div className="text-xs text-[#FFC72C] font-bold">Dream Destination</div>
                        <div className="text-lg font-bold text-white leading-tight">
                          {customDestinationName || selectedCountryInfo?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-50 text-xs space-y-1 text-neutral-700">
                    <div><strong>Traveler:</strong> {customerName} ({email})</div>
                    <div><strong>Timing:</strong> {travelDatesType === 'specific' ? `${startDate} to ${endDate}` : `${flexibleSeason} (${durationDays} Days)`}</div>
                    <div><strong>Party Size:</strong> {adultsCount} Adult(s){childrenCount ? `, ${childrenCount} Child(ren)` : ''}</div>
                    <div><strong>Budget:</strong> {formattedBudgetSummary}</div>
                  </div>
                </div>
              )}

              {/* Proposal Status Box - Strictly 'Routed to All Admins' */}
              <div className="p-4 max-w-md mx-auto bg-purple-50 rounded-xl border border-purple-200 text-xs text-left">
                <div className="font-bold text-[#2E0249] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2E0249]" />
                  <span>Proposal Status: Routed to All Admins</span>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  Your customized itinerary proposal has been successfully routed to all admins. Our administrative team will review flight schedules, villa/resort inventory, and custom excursions to design your official quote and booking itinerary.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={closeCustomTripModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-sm shadow transition-all"
                  id="done-custom-trip-btn"
                >
                  Return to Website
                </button>
                <a
                  href={`https://wa.me/18764024220?text=${encodeURIComponent(
                    `Hi SMELTRAVELS876! I just submitted a custom trip request for ${customDestinationName || selectedCountryInfo?.name} (Ref #${submittedRef}). Looking forward to setting it up!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow transition-all"
                  id="whatsapp-custom-trip-btn"
                >
                  <Phone className="w-4 h-4" />
                  <span>Chat with Admin on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-200 transition-colors"
                  id="custom-trip-prev-step-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 hidden sm:inline">
                Step {currentStep} of 4
              </span>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-xs sm:text-sm shadow-md transition-all"
                  id="custom-trip-next-step-btn"
                >
                  <span>Next: {currentStep === 1 ? 'When & Group' : currentStep === 2 ? 'Style & Inclusions' : 'Send to Admins'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
                  id="custom-trip-finish-step-btn"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch to All Admins</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
