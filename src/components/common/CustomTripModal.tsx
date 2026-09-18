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
  AlertCircle,
  Building,
  Car,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  WORLD_DESTINATIONS,
  getCountryPhotos,
  CountryDestinationInfo,
} from '../../data/customTripDestinations';
import { CustomTripRequestInput } from '../../types';
import { calculateTripBudget } from '../../lib/pricingEngine';

export const CustomTripModal: React.FC = () => {
  const {
    isCustomTripModalOpen,
    closeCustomTripModal,
    selectedDestinationForCustomTrip,
    submitCustomTripRequest,
    currentUser,
    settings,
    openInquiryTracker,
    showNotification,
    departureAirports,
    originPricingRoutes,
    serviceCostRules: landServiceCostRules,
    supportedCurrencies: originCurrencies,
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

  // Step 2: Dates, Group & Origin / Departure Location
  const [travelDatesType, setTravelDatesType] = useState<'specific' | 'flexible'>('flexible');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flexibleSeason, setFlexibleSeason] = useState('Summer 2026 (June - August)');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Origin / Departure Location (Required: Country, City, Airport)
  const [originCountry, setOriginCountry] = useState<string>('Jamaica');
  const [originCity, setOriginCity] = useState<string>('Kingston');
  const [originAirportCode, setOriginAirportCode] = useState<string>('KIN');
  const [isAirportUnknown, setIsAirportUnknown] = useState<boolean>(false);
  const [customOriginCity, setCustomOriginCity] = useState<string>('');
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First Class'>('Economy');
  const [roomOccupancy, setRoomOccupancy] = useState<'single' | 'double' | 'triple' | 'quad' | 'group'>('double');

  // Dynamic Origin Country & Airport lists from Administrator Database
  const availableOriginCountries = useMemo(() => {
    const list = Array.from(new Set(departureAirports.map((a) => a.country)));
    const core = [
      'Jamaica',
      'United States',
      'Canada',
      'United Kingdom',
      'Trinidad & Tobago',
      'Bahamas',
      'Barbados',
      'Cayman Islands',
    ];
    core.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [departureAirports]);

  const availableOriginAirports = useMemo(() => {
    return departureAirports.filter(
      (a) => a.country.toLowerCase() === originCountry.toLowerCase()
    );
  }, [departureAirports, originCountry]);

  const availableOriginCities = useMemo(() => {
    const cities = Array.from(new Set(availableOriginAirports.map((a) => a.city)));
    return cities.length > 0 ? cities : [originCity || 'Kingston'];
  }, [availableOriginAirports, originCity]);

  // Handle Origin Country selection change
  const handleCountryChange = (newCountry: string) => {
    setOriginCountry(newCountry);
    const matchingAirports = departureAirports.filter(
      (a) => a.country.toLowerCase() === newCountry.toLowerCase()
    );
    if (matchingAirports.length > 0) {
      setOriginCity(matchingAirports[0].city);
      setOriginAirportCode(matchingAirports[0].code);
      setIsAirportUnknown(false);
    } else {
      setOriginCity('');
      setOriginAirportCode('');
      setIsAirportUnknown(true);
    }
  };

  // Step 3: Vibe, Style, Budget & Inclusions
  const AVAILABLE_VIBES = [
    'Beaches & Tropical Relaxation 🏖️',
    'Culture, Museums & History 🏛️',
    'Nightlife, Rooftops & Parties 🍸',
    'Shopping & Duty-Free Spree 🛍️',
    'Romantic Honeymoon / Anniversary 🥂',
    'Family Fun & Theme Parks 🎢',
    'Nature, Volcanoes & Wildlife 🌿',
    'Foodie & Culinary Adventure 🍷',
  ];
  const [tripVibes, setTripVibes] = useState<string[]>(['Beaches & Tropical Relaxation 🏖️']);
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
  const [ambassadorError, setAmbassadorError] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Currency Conversion Rates from USD
  const FX_RATES_FROM_USD: Record<string, { rate: number; symbol: string; label: string }> = {
    USD: { rate: 1.0, symbol: '$', label: 'USD' },
    JMD: { rate: 155.0, symbol: 'JA$', label: 'JMD' },
    CAD: { rate: 1.35, symbol: 'C$', label: 'CAD' },
    GBP: { rate: 0.78, symbol: '£', label: 'GBP' },
    EUR: { rate: 0.92, symbol: '€', label: 'EUR' },
    OTHER: { rate: 1.0, symbol: '', label: 'Custom' },
  };

  // Calculate effective trip days (from specific dates or duration slider)
  const effectiveTripDays = useMemo(() => {
    if (travelDatesType === 'specific' && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (diff > 0) return diff;
      }
    }
    return Number(durationDays) || 7;
  }, [travelDatesType, startDate, endDate, durationDays]);

  // Real-time Pricing Engine Calculation based on Origin, Route, Style, Group and Land Services
  const pricingEngineResult = useMemo(() => {
    const effectiveDestCountry = selectedCountryInfo?.country || selectedCountryInfo?.name || 'Dominican Republic';
    const effectiveDestCity = selectedCountryInfo?.capitalOrCity || selectedCountryInfo?.name || '';
    const activeCode = budgetCurrency === 'OTHER' ? (customCurrencyCode.trim().toUpperCase() || 'USD') : budgetCurrency;

    return calculateTripBudget({
      originCountry,
      originCity: customOriginCity.trim() || originCity,
      originAirportCode: isAirportUnknown ? '' : originAirportCode,
      isAirportUnknown,
      destinationCountry: effectiveDestCountry,
      destinationCity: effectiveDestCity,
      durationDays: effectiveTripDays,
      adultsCount,
      childrenCount,
      travelStyle,
      roomOccupancy,
      cabinClass: cabinClass === 'First Class' ? 'First' : (cabinClass as any),
      isRoundTrip: true,
      selectedServices: mustHaveInclusions,
      routes: originPricingRoutes,
      serviceRules: landServiceCostRules,
      selectedCurrencyCode: activeCode,
      currencies: originCurrencies,
    });
  }, [
    originCountry,
    originCity,
    customOriginCity,
    originAirportCode,
    isAirportUnknown,
    selectedCountryInfo,
    effectiveTripDays,
    adultsCount,
    childrenCount,
    travelStyle,
    roomOccupancy,
    cabinClass,
    mustHaveInclusions,
    originPricingRoutes,
    landServiceCostRules,
    budgetCurrency,
    customCurrencyCode,
    originCurrencies,
  ]);

  // Budget Policy Validation Rules:
  // 1. 2 adults -> total group budget cannot be less than $1500 USD
  // 2. > 5 days -> budget cannot be less than $2000 USD
  // 3. Pricing Engine route + service estimated cost threshold
  // (Converts for other currencies)
  const budgetValidation = useMemo(() => {
    const isTwoAdults = adultsCount >= 2;
    const isMoreThanFiveDays = effectiveTripDays > 5;

    let policyFloorUSD = 0;
    const activeRules: string[] = [];

    if (isTwoAdults) {
      policyFloorUSD = Math.max(policyFloorUSD, 1500);
      activeRules.push(`${adultsCount} Adult Travelers (Min $1,500 USD group policy)`);
    }

    if (isMoreThanFiveDays) {
      policyFloorUSD = Math.max(policyFloorUSD, 2000);
      activeRules.push(`${effectiveTripDays} Days Duration (>5 days requires Min $2,000 USD group policy)`);
    }

    // Minimum total group budget in USD: max of policy floor and pricing engine estimated minimum
    const engineEstimatedUSD = pricingEngineResult.totalEstimatedCostUSD || 0;
    const minTotalBudgetUSD = Math.max(policyFloorUSD, engineEstimatedUSD);

    if (engineEstimatedUSD > policyFloorUSD && engineEstimatedUSD > 0) {
      activeRules.push(`Route & Land Services Estimate ($${engineEstimatedUSD.toLocaleString()} USD minimum)`);
    }

    const fx = FX_RATES_FROM_USD[budgetCurrency] || FX_RATES_FROM_USD.USD;
    const currencyLabel = budgetCurrency === 'OTHER' ? (customCurrencyCode.trim().toUpperCase() || 'CUSTOM') : budgetCurrency;
    const symbol = fx.symbol;

    // Minimum total group budget in active currency
    const minTotalInCurrency = Math.round(minTotalBudgetUSD * fx.rate);

    // Minimum input amount required (per person or total group)
    const minInputAmount = budgetType === 'per_person'
      ? Math.ceil(minTotalInCurrency / (adultsCount || 1))
      : minTotalInCurrency;

    // User's numerical budget amount
    const enteredVal = Number(budgetAmount || 0);

    // User's effective total group budget in current currency
    const userTotalGroupBudget = budgetType === 'per_person'
      ? enteredVal * (adultsCount || 1)
      : enteredVal;

    // User's effective total group budget in USD equivalent
    const userTotalGroupBudgetUSD = fx.rate > 0 ? userTotalGroupBudget / fx.rate : userTotalGroupBudget;

    const isBelowMinimum = minTotalBudgetUSD > 0 && (userTotalGroupBudget < minTotalInCurrency || userTotalGroupBudgetUSD < minTotalBudgetUSD);

    return {
      isTwoAdults,
      isMoreThanFiveDays,
      policyFloorUSD,
      engineEstimatedUSD,
      minTotalBudgetUSD,
      minTotalInCurrency,
      minInputAmount,
      userTotalGroupBudget,
      userTotalGroupBudgetUSD,
      isBelowMinimum,
      activeRules,
      symbol,
      currencyLabel,
      fxRate: fx.rate,
    };
  }, [adultsCount, effectiveTripDays, budgetCurrency, customCurrencyCode, budgetAmount, budgetType, pricingEngineResult]);

  // Dynamic quick presets that respect minimum budget policies
  const dynamicPresets = useMemo(() => {
    const fx = FX_RATES_FROM_USD[budgetCurrency] || FX_RATES_FROM_USD.USD;
    const min = budgetValidation.minInputAmount || (budgetCurrency === 'JMD' ? 150000 : 1200);

    if (budgetCurrency === 'USD') {
      const base1 = Math.max(1200, min);
      const base2 = Math.max(base1 + 500, Math.max(2000, Math.ceil(min * 1.25 / 100) * 100));
      const base3 = Math.max(base2 + 1000, Math.max(3500, Math.ceil(min * 1.75 / 100) * 100));
      const base4 = Math.max(base3 + 1500, Math.max(5000, Math.ceil(min * 2.5 / 100) * 100));
      return [
        { label: `$${base1.toLocaleString()} (${base1 === min && budgetValidation.minTotalBudgetUSD > 0 ? 'Min' : 'Economy'})`, val: String(base1) },
        { label: `$${base2.toLocaleString()} (Comfort)`, val: String(base2) },
        { label: `$${base3.toLocaleString()} (Premium)`, val: String(base3) },
        { label: `$${base4.toLocaleString()}+ (Luxury)`, val: String(base4) },
      ];
    } else if (budgetCurrency === 'JMD') {
      const base1 = Math.max(180000, Math.ceil(min / 1000) * 1000);
      const base2 = Math.max(base1 + 80000, 300000);
      const base3 = Math.max(base2 + 150000, 500000);
      const base4 = Math.max(base3 + 250000, 800000);
      return [
        { label: `JA$${(base1 / 1000).toFixed(0)}k JMD`, val: String(base1) },
        { label: `JA$${(base2 / 1000).toFixed(0)}k JMD`, val: String(base2) },
        { label: `JA$${(base3 / 1000).toFixed(0)}k JMD`, val: String(base3) },
        { label: `JA$${(base4 / 1000).toFixed(0)}k+ JMD`, val: String(base4) },
      ];
    } else {
      const base1 = Math.max(1500, Math.ceil(min / 50) * 50);
      const base2 = Math.max(base1 + 800, Math.ceil((min * 1.4) / 50) * 50);
      const base3 = Math.max(base2 + 1200, Math.ceil((min * 2.0) / 50) * 50);
      const base4 = Math.max(base3 + 2000, Math.ceil((min * 3.0) / 50) * 50);
      return [
        { label: `${fx.symbol}${base1.toLocaleString()}`, val: String(base1) },
        { label: `${fx.symbol}${base2.toLocaleString()}`, val: String(base2) },
        { label: `${fx.symbol}${base3.toLocaleString()}`, val: String(base3) },
        { label: `${fx.symbol}${base4.toLocaleString()}+`, val: String(base4) },
      ];
    }
  }, [budgetCurrency, budgetValidation.minInputAmount, budgetValidation.minTotalBudgetUSD]);

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

  // Toggle inclusion tag (Multi-select)
  const toggleInclusion = (item: string) => {
    setMustHaveInclusions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const ALL_INCLUSION_ITEMS = [
    'Roundtrip Flights',
    'Hotel / Resort Stay',
    'Airport Private Transfers',
    'Curated Tours & Sightseeing',
    'Daily Breakfast / Meals',
    'Travel Visa / Document Help',
  ];

  const selectAllInclusions = () => {
    setMustHaveInclusions(ALL_INCLUSION_ITEMS);
  };

  const clearAllInclusions = () => {
    setMustHaveInclusions([]);
  };

  // Toggle trip vibe (Multi-select)
  const toggleTripVibe = (vibe: string) => {
    setTripVibes((prev) => {
      if (prev.includes(vibe)) {
        if (prev.length === 1) return prev; // keep at least 1 selected
        return prev.filter((v) => v !== vibe);
      }
      return [...prev, vibe];
    });
  };

  const selectAllTripVibes = () => {
    setTripVibes(AVAILABLE_VIBES);
  };

  const resetTripVibes = () => {
    setTripVibes(['Beaches & Tropical Relaxation 🏖️']);
  };

  // Step advancement with validation
  const handleNextStep = () => {
    if (currentStep === 3 && budgetValidation.isBelowMinimum) {
      showNotification(
        'Minimum Budget Required',
        `For your travel party (${adultsCount} adults) and trip duration (${effectiveTripDays} days), the minimum required budget is ${budgetValidation.symbol}${budgetValidation.minTotalInCurrency.toLocaleString()} ${budgetValidation.currencyLabel} ($${budgetValidation.minTotalBudgetUSD.toLocaleString()} USD equivalent). Please adjust your budget before proceeding.`,
        'warning'
      );
      const inputEl = document.getElementById('custom-trip-budget-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim()) {
      showNotification('Contact Information Required', 'Please provide your name and email address so our admins can send your itinerary.', 'warning');
      return;
    }

    if (!preferredAmbassador || !preferredAmbassador.trim()) {
      setAmbassadorError(true);
      showNotification(
        'Ambassador Required',
        'Selecting a dedicated Travel Ambassador is mandatory for custom trips. Please choose your advisor below.',
        'warning'
      );
      const el = document.getElementById('ambassador-selection-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (budgetValidation.isBelowMinimum) {
      showNotification(
        'Minimum Budget Required',
        `For your travel party (${adultsCount} adults) and duration (${effectiveTripDays} days), the minimum required budget is ${budgetValidation.symbol}${budgetValidation.minTotalInCurrency.toLocaleString()} ${budgetValidation.currencyLabel} ($${budgetValidation.minTotalBudgetUSD.toLocaleString()} USD equivalent). Please adjust your budget.`,
        'warning'
      );
      setCurrentStep(3);
      const el = document.getElementById('custom-trip-budget-input');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const destinationTitle = customDestinationName.trim() || selectedCountryInfo?.name || 'Custom International Destination';
    const countryName = selectedCountryInfo?.country || customDestinationName.trim() || 'Custom Country';

    setIsSubmitting(true);
    try {
      const effectiveOriginCity = customOriginCity.trim() || originCity;
      const effectiveAirportName = isAirportUnknown
        ? 'Nearest Major Hub'
        : (availableOriginAirports.find((a) => a.code === originAirportCode)?.name || originAirportCode);
      const originDisplay = `${effectiveOriginCity}, ${originCountry}${isAirportUnknown ? ' (Nearest Airport)' : ` (${originAirportCode})`}`;

      const payload: CustomTripRequestInput = {
        originCountry,
        originCity: effectiveOriginCity,
        originAirportCode: isAirportUnknown ? '' : originAirportCode,
        originAirportName: effectiveAirportName,
        originLocationDisplay: originDisplay,
        isAirportUnknown,
        cabinClass: cabinClass === 'First Class' ? 'First' : (cabinClass as any),
        roomOccupancy,
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
        tripVibe: tripVibes.join(', '),
        travelStyle,
        budgetPerPerson: formattedBudgetSummary,
        budgetCurrency: budgetCurrency === 'OTHER' ? (customCurrencyCode.trim().toUpperCase() || 'OTHER') : budgetCurrency,
        budgetAmount: budgetAmount,
        numericalBudget: Number(budgetAmount || 0),
        budgetType: budgetType,
        mustHaveInclusions,
        specialRequests,
        customerName,
        email,
        phone,
        countryOrParish: countryOrParish || originDisplay,
        preferredContactMethod,
        preferredAmbassador: preferredAmbassador || undefined,
        flightPricingStatus: pricingEngineResult?.flightPricingStatus || 'Manual Flight Pricing Required',
        flightAllowanceEstimatedUSD: pricingEngineResult?.costBreakdown?.flightsUSD || 0,
        flightRouteMatched: pricingEngineResult?.flightRouteMatched || '',
        costBreakdown: {
          flightCostTotal: pricingEngineResult?.costBreakdown?.flightsUSD || 0,
          accommodationTotal: pricingEngineResult?.costBreakdown?.accommodationUSD || 0,
          mealAllowanceTotal: pricingEngineResult?.costBreakdown?.mealsUSD || 0,
          transfersTotal: pricingEngineResult?.costBreakdown?.transfersUSD || 0,
          excursionsTotal: pricingEngineResult?.costBreakdown?.excursionsUSD || 0,
          travelDocumentsTotal: pricingEngineResult?.costBreakdown?.documentsUSD || 0,
          taxesAndFeesTotal: pricingEngineResult?.costBreakdown?.taxesAndFeesUSD || 0,
          otherServicesTotal: pricingEngineResult?.costBreakdown?.bufferUSD || 0,
        },
        estimatedMinimumBudgetTotal: pricingEngineResult?.totalEstimatedCostInCurrency || 0,
        estimatedMinimumBudgetUSD: pricingEngineResult?.totalEstimatedCostUSD || 0,
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
                2. Origin & Dates
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

                  {/* Ideal Trip Length (+ / - Counter Box for Nights & Days) */}
                  <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200" id="ideal-trip-length-container">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#2E0249]" />
                          <span>Ideal Trip Length</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Use the + or − buttons to set duration in days and nights
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                          disabled={durationDays <= 1}
                          className="w-9 h-9 rounded-xl bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
                          aria-label="Decrease trip length by 1 day"
                          id="decrease-trip-length-btn"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div className="min-w-[130px] px-3.5 py-1.5 bg-white border border-neutral-300 rounded-xl text-center shadow-xs">
                          <div className="text-sm sm:text-base font-extrabold text-[#2E0249] leading-tight">
                            {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                          </div>
                          <div className="text-[11px] font-semibold text-neutral-500">
                            {Math.max(0, durationDays - 1)} {durationDays - 1 === 1 ? 'Night' : 'Nights'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDurationDays((prev) => Math.min(60, prev + 1))}
                          disabled={durationDays >= 60}
                          className="w-9 h-9 rounded-xl bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 font-bold hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 cursor-pointer"
                          aria-label="Increase trip length by 1 day"
                          id="increase-trip-length-btn"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick presets for convenience */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-neutral-200/70">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1">
                        Popular:
                      </span>
                      {[
                        { days: 3, label: '3 Days / 2 Nights (Weekend)' },
                        { days: 5, label: '5 Days / 4 Nights' },
                        { days: 7, label: '7 Days / 6 Nights (1 Week)' },
                        { days: 10, label: '10 Days / 9 Nights' },
                        { days: 14, label: '14 Days / 13 Nights (2 Weeks)' },
                      ].map(({ days, label }) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setDurationDays(days)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            durationDays === days
                              ? 'bg-[#2E0249] text-white shadow-xs'
                              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
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

              {/* WHERE ARE YOU TRAVELING FROM? (REQUIRED ORIGIN LOCATION) */}
              <div className="pt-5 border-t border-neutral-200 space-y-4" id="custom-trip-origin-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#2E0249]" />
                    <span>Where Are You Traveling From?</span>
                    <span className="text-[10px] bg-[#2E0249] text-[#FFC72C] font-black px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    We organize trips for clients globally • Route prices calculate automatically
                  </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50/70 via-white to-amber-50/60 p-4 rounded-2xl border border-purple-200/80 space-y-4">
                  {/* Country Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-[#2E0249]" />
                        <span>Departure Country:</span>
                      </label>
                      <select
                        value={originCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none"
                        id="custom-trip-origin-country"
                      >
                        {availableOriginCountries.map((c) => (
                          <option key={c} value={c}>
                            {c === 'Jamaica' ? '🇯🇲 Jamaica' : c === 'United States' ? '🇺🇸 United States' : c === 'Canada' ? '🇨🇦 Canada' : c === 'United Kingdom' ? '🇬🇧 United Kingdom' : c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City Selection */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#2E0249]" />
                        <span>Departure City:</span>
                      </label>
                      <div className="space-y-1.5">
                        <select
                          value={customOriginCity ? 'OTHER_CUSTOM' : originCity}
                          onChange={(e) => {
                            if (e.target.value === 'OTHER_CUSTOM') {
                              setCustomOriginCity(originCity || 'Other City');
                            } else {
                              setCustomOriginCity('');
                              setOriginCity(e.target.value);
                              const matchingAirport = availableOriginAirports.find(
                                (a) => a.city.toLowerCase() === e.target.value.toLowerCase()
                              );
                              if (matchingAirport) {
                                setOriginAirportCode(matchingAirport.code);
                                setIsAirportUnknown(false);
                              }
                            }
                          }}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none"
                          id="custom-trip-origin-city-select"
                        >
                          {availableOriginCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="OTHER_CUSTOM">+ Enter Another City</option>
                        </select>

                        {customOriginCity && (
                          <input
                            type="text"
                            value={customOriginCity}
                            onChange={(e) => setCustomOriginCity(e.target.value)}
                            placeholder="Type your departure city..."
                            className="w-full px-3 py-2 text-xs border border-purple-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none"
                          />
                        )}
                      </div>
                    </div>

                    {/* Airport Selection */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-[#2E0249]" />
                        <span>Departure Airport:</span>
                      </label>
                      <select
                        disabled={isAirportUnknown}
                        value={originAirportCode}
                        onChange={(e) => setOriginAirportCode(e.target.value)}
                        className={`w-full px-3 py-2.5 text-xs sm:text-sm font-semibold border rounded-xl outline-none transition-all ${
                          isAirportUnknown
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                            : 'bg-white border-neutral-300 focus:ring-2 focus:ring-[#2E0249] text-neutral-800'
                        }`}
                        id="custom-trip-origin-airport"
                      >
                        {availableOriginAirports.map((airport) => (
                          <option key={airport.code} value={airport.code}>
                            {airport.name} ({airport.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Airport Unknown / Nearest Checkbox */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-purple-100">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={isAirportUnknown}
                        onChange={(e) => {
                          setIsAirportUnknown(e.target.checked);
                          if (e.target.checked) {
                            setOriginAirportCode('');
                          } else if (availableOriginAirports.length > 0) {
                            setOriginAirportCode(availableOriginAirports[0].code);
                          }
                        }}
                        className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249] accent-[#2E0249]"
                        id="custom-trip-airport-unknown-checkbox"
                      />
                      <span>I don't know my exact airport / Use nearest international gateway</span>
                    </label>

                    {originCountry === 'Jamaica' && (
                      <div className="text-[11px] text-[#2E0249] font-semibold bg-purple-100/70 px-2.5 py-1 rounded-lg border border-purple-200">
                        🇯🇲 Defaulting to Jamaica (KIN / MBJ)
                      </div>
                    )}
                  </div>

                  {/* Flight Cabin Class & Room Occupancy Preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-purple-100">
                    <div>
                      <span className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Flight Cabin Preference:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['Economy', 'Premium Economy', 'Business', 'First Class'] as const).map((cabin) => (
                          <button
                            key={cabin}
                            type="button"
                            onClick={() => setCabinClass(cabin)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                              cabinClass === cabin
                                ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-2xs'
                                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                            }`}
                          >
                            {cabin}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-neutral-700 mb-1.5">
                        Room Occupancy Setup:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'single', label: 'Single (1/rm)' },
                          { id: 'double', label: 'Double (2/rm)' },
                          { id: 'triple', label: 'Triple (3/rm)' },
                          { id: 'quad', label: 'Quad (4/rm)' },
                          { id: 'group', label: 'Multi-Room' },
                        ].map((occ) => (
                          <button
                            key={occ.id}
                            type="button"
                            onClick={() => setRoomOccupancy(occ.id as any)}
                            className={`py-1.5 px-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                              roomOccupancy === occ.id
                                ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-2xs'
                                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                            }`}
                          >
                            {occ.label}
                          </button>
                        ))}
                      </div>
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

              {/* Trip Vibe Chips (Multi-Select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <span>Trip Vibe & Occasion</span>
                    <span className="text-[10px] font-bold bg-[#FFC72C]/20 text-[#2E0249] px-2 py-0.5 rounded-full border border-[#FFC72C]/50">
                      Multi-Select • {tripVibes.length} Selected
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllTripVibes}
                      className="text-[11px] font-bold text-purple-800 hover:text-purple-950 underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-300 text-xs">•</span>
                    <button
                      type="button"
                      onClick={resetTripVibes}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                    >
                      Reset (1)
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mb-2.5">
                  Click to select multiple vibes for your trip (e.g. blend Relaxation + Nightlife + Foodie adventure).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_VIBES.map((vibe) => {
                    const isSelected = tripVibes.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => toggleTripVibe(vibe)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-sm ring-2 ring-purple-400/40'
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        <span className="truncate">{vibe}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#FFC72C]" />}
                      </button>
                    );
                  })}
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

              {/* REAL-TIME ESTIMATED MINIMUM TRIP BUDGET (ORIGIN & ROUTE PRICING ENGINE) */}
              <div
                className="p-5 bg-gradient-to-br from-[#2E0249]/5 via-white to-[#FFC72C]/10 rounded-2xl border-2 border-purple-200 shadow-sm space-y-4"
                id="estimated-minimum-budget-card"
              >
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#2E0249]">
                        Estimated Minimum Trip Budget
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">
                      Calculated using your departure origin ({customOriginCity || originCity}, {originCountry}), destination, and travel party.
                    </p>
                  </div>

                  <div className="self-start sm:self-center">
                    {pricingEngineResult.flightPricingStatus === 'Estimated' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Route Matched • Flight Estimated</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Flight Pricing Requires Custom Quote</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Route & Metadata Banner */}
                <div className="p-3 bg-white rounded-xl border border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-neutral-800">
                    <span className="bg-purple-100 text-[#2E0249] px-2 py-0.5 rounded-md">
                      🛫 {customOriginCity || originCity}, {originCountry} {isAirportUnknown ? '(Nearest Hub)' : `(${originAirportCode})`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="bg-purple-100 text-[#2E0249] px-2 py-0.5 rounded-md">
                      🛬 {selectedCountryInfo?.name || 'Destination'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600 font-semibold">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded">
                      {effectiveTripDays} Days ({effectiveTripDays - 1} Nights)
                    </span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded">
                      {adultsCount} Adult(s){childrenCount > 0 ? `, ${childrenCount} Child(ren)` : ''}
                    </span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded">
                      {cabinClass} Cabin
                    </span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded uppercase">
                      {roomOccupancy} Occupancy
                    </span>
                  </div>
                </div>

                {/* Unconfigured Route Notice if Applicable */}
                {pricingEngineResult.flightPricingStatus === 'Manual Flight Pricing Required' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-amber-900">
                        Custom Flight Quote Required:
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        Airfare for this route is not currently configured in the instant database. <strong>DO NOT WORRY</strong> — our travel advisors will manually price your flights upon submission. Land package accommodations and transfers are estimated below.
                      </div>
                    </div>
                  </div>
                )}

                {/* Itemized Cost Breakdown Grid */}
                {(() => {
                  const bd = pricingEngineResult?.costBreakdown || {
                    flightsUSD: 0,
                    accommodationUSD: 0,
                    mealsUSD: 0,
                    transfersUSD: 0,
                    excursionsUSD: 0,
                    documentsUSD: 0,
                    taxesAndFeesUSD: 0,
                    bufferUSD: 0,
                    flightsInCurrency: 0,
                    accommodationInCurrency: 0,
                    transfersInCurrency: 0,
                    excursionsInCurrency: 0,
                    taxesAndFeesInCurrency: 0,
                    mealsInCurrency: 0,
                    documentsInCurrency: 0,
                    otherServicesInCurrency: 0,
                    bufferInCurrency: 0,
                  };
                  const sym = pricingEngineResult?.currencySymbol || '$';
                  const code = pricingEngineResult?.currencyCode || 'USD';
                  const estTotalCurrency = pricingEngineResult?.totalEstimatedCostInCurrency || 0;
                  const estTotalUSD = pricingEngineResult?.totalEstimatedCostUSD || 0;
                  const isFlightEstimated = pricingEngineResult?.flightPricingStatus === 'Estimated';

                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* Flights */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                            <Plane className="w-3 h-3 text-[#2E0249]" />
                            <span>Roundtrip Airfare</span>
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-1">
                            {isFlightEstimated
                              ? `${sym}${bd.flightsInCurrency.toLocaleString()} ${code}`
                              : 'Custom Quote'}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            {isFlightEstimated
                              ? `$${bd.flightsUSD.toLocaleString()} USD group total`
                              : 'Advisor manual pricing'}
                          </div>
                        </div>

                        {/* Accommodation */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#2E0249]" />
                            <span>Accommodation</span>
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-1">
                            {sym}
                            {bd.accommodationInCurrency.toLocaleString()}{' '}
                            {code}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            {effectiveTripDays} nights • {travelStyle.split(' ')[0]}
                          </div>
                        </div>

                        {/* Transfers */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                            <Car className="w-3 h-3 text-[#2E0249]" />
                            <span>Ground Transfers</span>
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-1">
                            {sym}
                            {bd.transfersInCurrency.toLocaleString()}{' '}
                            {code}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Airport & hotel routes
                          </div>
                        </div>

                        {/* Tours & Taxes */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                            <Compass className="w-3 h-3 text-[#2E0249]" />
                            <span>Tours & Taxes</span>
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-1">
                            {sym}
                            {(
                              bd.excursionsInCurrency +
                              bd.taxesAndFeesInCurrency
                            ).toLocaleString()}{' '}
                            {code}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5">
                            Activities + operations
                          </div>
                        </div>
                      </div>

                      {/* Total Minimum Estimation & Quick Apply Button */}
                      <div className="p-3.5 rounded-xl bg-[#2E0249] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                        <div>
                          <div className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">
                            Total Estimated Minimum Budget:
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-[#FFC72C] leading-tight mt-0.5 flex items-baseline gap-2">
                            <span>
                              {sym}
                              {estTotalCurrency.toLocaleString()}{' '}
                              {code}
                            </span>
                            {code !== 'USD' && (
                              <span className="text-xs font-semibold text-purple-200">
                                (approx. ${estTotalUSD.toLocaleString()} USD)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-purple-200 mt-0.5">
                            Approx. {sym}
                            {Math.ceil(
                              estTotalCurrency / (adultsCount || 1)
                            ).toLocaleString()}{' '}
                            {code} per adult
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const amountToSet =
                              budgetType === 'per_person'
                                ? Math.ceil(
                                    estTotalCurrency / (adultsCount || 1)
                                  )
                                : estTotalCurrency;
                            setBudgetAmount(String(amountToSet));
                            showNotification(
                              'Budget Applied! ✈️',
                              `Set to minimum estimated budget: ${sym}${amountToSet.toLocaleString()} ${code}.`,
                              'success'
                            );
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#ffe17d] text-[#2E0249] font-black text-xs cursor-pointer shadow transition-transform active:scale-95 text-center shrink-0"
                          id="apply-minimum-budget-btn"
                        >
                          Apply Estimated Minimum
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Mandatory Disclaimer as Requested */}
                <div className="pt-2 border-t border-purple-100 flex items-start gap-2 text-[11px] text-neutral-500">
                  <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Disclaimer:</strong> The budget calculator is an <strong>ESTIMATOR</strong>, not a guaranteed flight quote. Airfare fluctuates based on airline availability, departure dates, and booking timing. Final prices may vary upon agent confirmation.
                  </div>
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
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      {/* Styled Budget Label with Policy Indicators */}
                      <label
                        id="custom-trip-budget-label"
                        className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-bold text-neutral-800 mb-1.5"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>Estimated Budget Amount</span>
                          <span className="text-[#2E0249] bg-purple-100 px-2 py-0.5 rounded-md text-[11px] font-bold border border-purple-200 shadow-2xs">
                            {budgetCurrency === 'OTHER' ? customCurrencyCode || 'Custom Currency' : budgetCurrency}
                          </span>
                        </span>

                        {budgetValidation.minTotalBudgetUSD > 0 && (
                          <span
                            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all inline-flex items-center gap-1 shrink-0 ${
                              budgetValidation.isBelowMinimum
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-1 ring-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {budgetValidation.isBelowMinimum ? (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Policy Min: {budgetValidation.symbol}{budgetValidation.minTotalInCurrency.toLocaleString()} {budgetValidation.currencyLabel}</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Meets Min (${budgetValidation.minTotalBudgetUSD.toLocaleString()} USD)</span>
                              </>
                            )}
                          </span>
                        )}
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
                          className={`w-full pl-12 pr-4 py-2.5 text-sm font-bold border rounded-xl bg-white outline-none transition-all ${
                            budgetValidation.isBelowMinimum
                              ? 'border-amber-400 ring-2 ring-amber-200 text-amber-950 focus:ring-amber-300'
                              : 'border-neutral-300 focus:ring-2 focus:ring-[#2E0249] text-neutral-900'
                          }`}
                          placeholder="e.g. 2500"
                          id="custom-trip-budget-input"
                        />
                      </div>
                    </div>

                    <div className="sm:w-56">
                      <label className="block text-xs font-bold text-neutral-700 mb-1.5">
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

                  {/* Policy Alert Banner if Below Minimum */}
                  {budgetValidation.isBelowMinimum && (
                    <div className="p-3 rounded-xl bg-amber-50/95 border border-amber-300 text-amber-950 text-xs space-y-2 shadow-xs animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-amber-900">Minimum Budget Requirement:</span>
                            <div className="text-[11px] text-amber-800 mt-0.5 space-y-0.5">
                              {budgetValidation.isTwoAdults && (
                                <div>• <strong>2 Adult Travelers:</strong> Policy floor cannot be less than <strong>$1,500 USD</strong> ({budgetValidation.symbol}{Math.round(1500 * budgetValidation.fxRate).toLocaleString()} {budgetValidation.currencyLabel}).</div>
                              )}
                              {budgetValidation.isMoreThanFiveDays && (
                                <div>• <strong>Duration {effectiveTripDays} Days (&gt;5 days):</strong> Policy floor cannot be less than <strong>$2,000 USD</strong> ({budgetValidation.symbol}{Math.round(2000 * budgetValidation.fxRate).toLocaleString()} {budgetValidation.currencyLabel}).</div>
                              )}
                              {budgetValidation.engineEstimatedUSD > budgetValidation.policyFloorUSD && (
                                <div>• <strong>Route & Services Estimate:</strong> Estimated real costs from {customOriginCity || originCity} require a minimum of <strong>${budgetValidation.engineEstimatedUSD.toLocaleString()} USD</strong> ({budgetValidation.symbol}{budgetValidation.minTotalInCurrency.toLocaleString()} {budgetValidation.currencyLabel}).</div>
                              )}
                            </div>
                            <div className="text-[11px] text-amber-700 mt-1">
                              Current total group budget entered: <strong>{budgetValidation.symbol}{budgetValidation.userTotalGroupBudget.toLocaleString()} {budgetValidation.currencyLabel}</strong> (approx. <strong>${Math.round(budgetValidation.userTotalGroupBudgetUSD).toLocaleString()} USD</strong>).
                              {budgetType === 'per_person' && (
                                <span> Min per person: <strong>{budgetValidation.symbol}{budgetValidation.minInputAmount.toLocaleString()}</strong>.</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBudgetAmount(String(budgetValidation.minInputAmount))}
                          className="self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-extrabold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
                        >
                          Set to Min ({budgetValidation.symbol}{budgetValidation.minInputAmount.toLocaleString()})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-neutral-500">Quick Presets:</span>
                    {dynamicPresets.map((preset) => (
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

              {/* Must-Have Inclusions Checkboxes (Multi-Select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <span>What would you like SMELTRAVELS876 to arrange?</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Multi-Select • {mustHaveInclusions.length} Selected
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllInclusions}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Select All (6)
                    </button>
                    <span className="text-neutral-300 text-xs">•</span>
                    <button
                      type="button"
                      onClick={clearAllInclusions}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mb-2.5">
                  Click any options below to include flights, luxury stays, transfers, excursions, meals, or visa guidance.
                </p>
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
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-400/40'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <Icon className={`w-4 h-4 ${checked ? 'text-emerald-600' : 'text-neutral-400'}`} />
                          <span>{label}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
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

              {/* Preferred Contact Mode */}
              <div className="pt-1">
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
                      className={`py-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
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

              {/* Mandatory Ambassador Selection Section */}
              <div
                id="ambassador-selection-section"
                className={`p-4 rounded-2xl border transition-all ${
                  ambassadorError
                    ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400'
                    : preferredAmbassador
                    ? 'border-purple-300 bg-purple-50/40 ring-1 ring-purple-200'
                    : 'border-amber-300 bg-amber-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs sm:text-sm font-black text-neutral-900 flex items-center gap-1">
                      <span>Select Your Dedicated Travel Ambassador</span>
                      <span className="text-red-500 text-base leading-none">*</span>
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                      Mandatory
                    </span>
                  </div>
                  {preferredAmbassador ? (
                    <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md self-start sm:self-auto flex items-center gap-1">
                      <Check className="w-3 h-3 text-purple-700" />
                      Assigned: {preferredAmbassador}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-900 self-start sm:self-auto flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                      Selection Required to Submit
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  Every custom trip is personally assigned to a dedicated SMELTRAVELS876 Ambassador who will curate your flights, resort stays, and tailored travel proposal.
                </p>

                {/* Ambassador Interactive Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {(settings.ambassadors && settings.ambassadors.length > 0
                    ? settings.ambassadors.filter((a) => a.isActive)
                    : [
                        { id: 'amb-1', name: 'Zachary Buchanan', title: 'Travel Ambassador', phone: '(876) 848-9772', parishOrRegion: 'Kingston & St. Andrew' },
                        { id: 'amb-2', name: 'Jada Virgo', title: 'Travel Ambassador', phone: '(876) 566-6923', parishOrRegion: 'Montego Bay & Western Jamaica' },
                        { id: 'amb-3', name: 'Shenoya Davis', title: 'Travel Ambassador', phone: '(876) 276-1310', parishOrRegion: 'St. Catherine & Portmore' },
                        { id: 'amb-4', name: 'Elvoy Bennett', title: 'CEO', phone: '(876) 834-1537', parishOrRegion: 'Executive Operations & Corporate Travel' },
                      ]
                  ).map((amb) => {
                    const isSelected = preferredAmbassador === amb.name;
                    const initials = amb.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2);

                    return (
                      <button
                        key={amb.id}
                        type="button"
                        onClick={() => {
                          setPreferredAmbassador(amb.name);
                          setAmbassadorError(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all relative flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#2E0249] bg-white ring-2 ring-[#2E0249] shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-purple-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        {/* Avatar initials badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#2E0249] text-[#FFC72C]'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {initials}
                        </div>

                        {/* Ambassador info */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-900 truncate">
                              {amb.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#2E0249] font-medium truncate">
                            {amb.title || 'Travel Ambassador'}
                          </div>
                          {amb.parishOrRegion && (
                            <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                              📍 {amb.parishOrRegion}
                            </div>
                          )}
                        </div>

                        {/* Radio circle */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#2E0249] bg-[#2E0249]'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Alternative */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-neutral-600 whitespace-nowrap">
                    Or select by list:
                  </span>
                  <select
                    required
                    value={preferredAmbassador}
                    onChange={(e) => {
                      setPreferredAmbassador(e.target.value);
                      if (e.target.value) setAmbassadorError(false);
                    }}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none bg-white font-medium ${
                      ambassadorError
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400'
                        : 'border-neutral-300 focus:ring-2 focus:ring-[#2E0249]'
                    }`}
                  >
                    <option value="">-- Select Your Dedicated Ambassador * (Mandatory) --</option>
                    {(settings.ambassadors || []).map((amb) => (
                      <option key={amb.id} value={amb.name}>
                        {amb.name} — {amb.title || 'Ambassador'} ({amb.parishOrRegion || 'Jamaica'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Banner if user attempts to submit without an ambassador */}
                {ambassadorError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Please choose a dedicated Travel Ambassador above. Selecting an ambassador is required before submitting your custom trip proposal.</span>
                  </div>
                )}
              </div>

              {/* Summary Review Card */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-xs space-y-1.5 text-neutral-700">
                <div className="font-bold text-neutral-900 mb-1">Itinerary Overview Summary:</div>
                <div>📍 Destination: <span className="font-semibold text-neutral-900">{customDestinationName || selectedCountryInfo?.name}</span></div>
                <div>📅 Timing: <span className="font-semibold text-neutral-900">{travelDatesType === 'specific' ? `${startDate} to ${endDate}` : `${flexibleSeason} (${durationDays} Days)`}</span></div>
                <div>👥 Travelers: <span className="font-semibold text-neutral-900">{adultsCount} Adult(s){childrenCount ? `, ${childrenCount} Child(ren)` : ''}</span></div>
                <div>💰 Budget: <span className="font-semibold text-neutral-900">{formattedBudgetSummary}</span></div>
                <div>✨ Style: <span className="font-semibold text-neutral-900">{travelStyle} • {tripVibes.join(', ')}</span></div>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <span className="font-bold text-neutral-900">👤 Dedicated Ambassador:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      preferredAmbassador
                        ? 'text-[#2E0249] bg-purple-100 border border-purple-200'
                        : 'text-red-700 bg-red-100 border border-red-300 font-black'
                    }`}
                  >
                    {preferredAmbassador ? `${preferredAmbassador} ✓` : '⚠️ Mandatory - Please Select Above'}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 transition-all disabled:opacity-50 cursor-pointer"
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
                    <div><strong>Dedicated Ambassador:</strong> <span className="font-semibold text-[#2E0249]">{preferredAmbassador}</span></div>
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
                  onClick={() => {
                    closeCustomTripModal();
                    openInquiryTracker(submittedRef);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-900 hover:bg-purple-950 text-[#FFC72C] font-bold text-sm flex items-center justify-center gap-2 shadow border border-[#FFC72C]/40 transition-all cursor-pointer"
                  id="track-inquiry-custom-trip-btn"
                >
                  <Clock className="w-4 h-4" />
                  <span>Track Inquiry & Deposit</span>
                </button>
                <button
                  type="button"
                  onClick={closeCustomTripModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-white font-bold text-sm shadow transition-all cursor-pointer"
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
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#4A0E4E] text-[#FFC72C] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
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
