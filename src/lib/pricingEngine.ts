import {
  OriginPricingRoute,
  ServiceCostRules,
  CurrencyRecord,
  CabinClassType,
} from '../types';
import {
  INITIAL_SERVICE_COST_RULES,
  INITIAL_SUPPORTED_CURRENCIES,
} from '../data/originPricingData';

export interface CostBreakdownItemized {
  flightsUSD: number;
  accommodationUSD: number;
  mealsUSD: number;
  transfersUSD: number;
  excursionsUSD: number;
  documentsUSD: number;
  otherServicesUSD: number;
  taxesAndFeesUSD: number;
  bufferUSD: number;

  flightsInCurrency: number;
  accommodationInCurrency: number;
  mealsInCurrency: number;
  transfersInCurrency: number;
  excursionsInCurrency: number;
  documentsInCurrency: number;
  otherServicesInCurrency: number;
  taxesAndFeesInCurrency: number;
  bufferInCurrency: number;
}

export interface PricingEngineInput {
  originCountry: string;
  originCity: string;
  originAirportCode?: string;
  isAirportUnknown?: boolean;
  destinationCountry: string;
  destinationCity: string;
  travelDatesType?: 'specific' | 'flexible';
  startDate?: string;
  endDate?: string;
  durationDays: number;
  adultsCount: number;
  childrenCount: number;
  travelStyle: 'Budget' | 'Standard' | 'Premium' | 'Luxury' | 'VIP' | string;
  roomOccupancy?: 'single' | 'double' | 'triple' | 'quad' | 'group';
  cabinClass?: CabinClassType;
  isRoundTrip?: boolean;
  selectedServices?: string[];
  routes?: OriginPricingRoute[];
  serviceRules?: ServiceCostRules;
  selectedCurrencyCode?: string;
  currencies?: CurrencyRecord[];
}

export interface PricingEngineResult {
  // Flight findings
  flightRequested: boolean;
  flightPricingStatus: 'Estimated' | 'Manual Flight Pricing Required' | 'Not Requested';
  flightRouteMatched?: string;
  matchedRoute?: OriginPricingRoute;
  flightCostTotalUSD: number;
  flightCostPerAdultUSD: number;
  flightNotice?: string;

  // Breakdown in USD
  breakdownUSD: {
    flightCost: number;
    accommodation: number;
    meals: number;
    transfers: number;
    excursions: number;
    travelDocuments: number;
    otherServices: number;
    taxesAndFees: number;
  };

  // Operational metrics
  roomsCount: number;
  durationNights: number;
  totalTravelers: number;

  // Totals
  rawCalculatedTotalUSD: number;
  policyFloorUSD: number;
  minimumBudgetUSD: number;
  minimumBudgetPerPersonUSD: number;

  // Aliases for seamless UI and custom trip modal consumption
  totalEstimatedCostUSD: number;
  totalEstimatedCostInCurrency: number;
  currencyCode: string;
  currencySymbol: string;
  costBreakdown: CostBreakdownItemized;

  // Converted totals in selected currency
  currency: {
    code: string;
    symbol: string;
    rateFromUSD: number;
    name: string;
  };
  minimumBudgetInCurrency: number;
  minimumBudgetPerPersonInCurrency: number;
  breakdownInCurrency: {
    flightCost: number;
    accommodation: number;
    meals: number;
    transfers: number;
    excursions: number;
    travelDocuments: number;
    otherServices: number;
    taxesAndFees: number;
  };

  // Policy triggers
  policyRulesApplied: string[];
}

/**
 * Normalizes travel style to one of: Budget | Standard | Premium | Luxury | VIP
 */
export function normalizeTravelStyle(style: string): 'Budget' | 'Standard' | 'Premium' | 'Luxury' | 'VIP' {
  const lower = (style || '').toLowerCase();
  if (lower.includes('budget') || lower.includes('backpacker') || lower.includes('essential')) return 'Budget';
  if (lower.includes('premium') || lower.includes('4-star') || lower.includes('boutique') || lower.includes('comfort')) return 'Premium';
  if (lower.includes('luxury') || lower.includes('5-star')) return 'Luxury';
  if (lower.includes('vip') || lower.includes('ultra') || lower.includes('celebrity')) return 'VIP';
  return 'Standard';
}

/**
 * Calculates accurate, transparent minimum trip budget based on origin, destination,
 * route pricing rules, style tiers, duration, group size, and selected services.
 */
export function calculateTripBudget(input: PricingEngineInput): PricingEngineResult {
  const {
    originCountry = 'Jamaica',
    originCity = 'Kingston',
    originAirportCode = '',
    isAirportUnknown = false,
    destinationCountry = 'Dominican Republic',
    destinationCity = '',
    durationDays = 7,
    adultsCount = 2,
    childrenCount = 0,
    travelStyle = 'Standard',
    roomOccupancy = 'double',
    cabinClass = 'Economy',
    isRoundTrip = true,
    selectedServices = [],
    routes = [],
    serviceRules = INITIAL_SERVICE_COST_RULES,
    selectedCurrencyCode = 'USD',
    currencies = INITIAL_SUPPORTED_CURRENCIES,
  } = input || {};

  const safeServiceRules: ServiceCostRules = {
    ...INITIAL_SERVICE_COST_RULES,
    ...(serviceRules || {}),
    accommodationPerNight: {
      ...INITIAL_SERVICE_COST_RULES.accommodationPerNight,
      ...(serviceRules?.accommodationPerNight || {}),
    },
    mealsPerPersonPerDay: {
      ...INITIAL_SERVICE_COST_RULES.mealsPerPersonPerDay,
      ...(serviceRules?.mealsPerPersonPerDay || {}),
    },
    excursionsAllowancePerPerson: {
      ...INITIAL_SERVICE_COST_RULES.excursionsAllowancePerPerson,
      ...(serviceRules?.excursionsAllowancePerPerson || {}),
    },
  };

  const totalTravelers = Math.max(1, adultsCount + childrenCount);
  const durationNights = Math.max(1, durationDays);
  const styleTier = normalizeTravelStyle(travelStyle);

  // Normalize selected services checking (case-insensitive check)
  const hasService = (keyword: string) => {
    return (selectedServices || []).some((s) => (s || '').toLowerCase().includes(keyword.toLowerCase()));
  };

  const flightRequested = hasService('flight');
  const hotelRequested = hasService('hotel') || hasService('resort') || hasService('stay') || hasService('accommodation');
  const transfersRequested = hasService('transfer') || hasService('airport');
  const excursionsRequested = hasService('tour') || hasService('excursion') || hasService('sightseeing') || hasService('activity');
  const mealsRequested = hasService('meal') || hasService('dining') || hasService('food');
  const travelDocsRequested = hasService('document') || hasService('visa');
  const otherServicesRequested = hasService('other') || hasService('concierge') || hasService('custom');

  // 1. FLIGHT ESTIMATION ENGINE
  let flightPricingStatus: 'Estimated' | 'Manual Flight Pricing Required' | 'Not Requested' = 'Not Requested';
  let matchedRoute: OriginPricingRoute | undefined;
  let flightCostTotalUSD = 0;
  let flightCostPerAdultUSD = 0;
  let flightRouteMatched = '';
  let flightNotice: string | undefined;

  if (flightRequested) {
    const normOriginCountry = (originCountry || '').trim().toLowerCase();
    const normOriginCity = (originCity || '').trim().toLowerCase();
    const normOriginCode = (originAirportCode || '').trim().toUpperCase();
    const normDestCountry = (destinationCountry || '').trim().toLowerCase();
    const normDestCity = (destinationCity || '').trim().toLowerCase();

    // Route matching algorithm with priority cascading
    const activeRoutes = (routes || []).filter((r) => r && r.isActive !== false);

    // Priority 1: Exact airport code + destination country + city
    matchedRoute = activeRoutes.find(
      (r) =>
        r.originAirportCode.toUpperCase() === normOriginCode &&
        r.destinationCountry.toLowerCase() === normDestCountry &&
        (r.destinationCity.toLowerCase().includes(normDestCity) || normDestCity.includes(r.destinationCity.toLowerCase()))
    );

    // Priority 2: Exact airport code + destination country
    if (!matchedRoute) {
      matchedRoute = activeRoutes.find(
        (r) =>
          r.originAirportCode.toUpperCase() === normOriginCode &&
          r.destinationCountry.toLowerCase() === normDestCountry
      );
    }

    // Priority 3: City match (if airport unknown or not specified)
    if (!matchedRoute) {
      matchedRoute = activeRoutes.find(
        (r) =>
          r.originCity.toLowerCase() === normOriginCity &&
          r.destinationCountry.toLowerCase() === normDestCountry
      );
    }

    // Priority 4: Origin Country + Destination Country
    if (!matchedRoute) {
      matchedRoute = activeRoutes.find(
        (r) =>
          r.originCountry.toLowerCase() === normOriginCountry &&
          r.destinationCountry.toLowerCase() === normDestCountry
      );
    }

    if (matchedRoute) {
      flightPricingStatus = 'Estimated';
      const baseUSD = matchedRoute.estimatedRoundtripUSD || 500;

      // Cabin class multiplier
      const cabinKey =
        cabinClass === 'Premium Economy'
          ? 'PremiumEconomy'
          : cabinClass === 'Business'
          ? 'Business'
          : cabinClass === 'First'
          ? 'First'
          : 'Economy';
      const cabinMult = matchedRoute.cabinClassMultipliers?.[cabinKey] || 1.0;

      // Round-trip vs one-way
      const tripTypeMult = isRoundTrip ? 1.0 : (matchedRoute.oneWayMultiplier || 0.65);

      flightCostPerAdultUSD = Math.round(baseUSD * cabinMult * tripTypeMult);
      // Children flight allowance approx 85% of adult fare
      const flightCostPerChildUSD = Math.round(flightCostPerAdultUSD * 0.85);

      flightCostTotalUSD = adultsCount * flightCostPerAdultUSD + childrenCount * flightCostPerChildUSD;
      flightRouteMatched = `${matchedRoute.originAirportCode} (${matchedRoute.originCity}) → ${matchedRoute.destinationAirportCode || matchedRoute.destinationCity} (${matchedRoute.destinationCountry})`;
    } else {
      // Prompt Rule: NEVER INVENT FLIGHT PRICES
      flightPricingStatus = 'Manual Flight Pricing Required';
      flightCostTotalUSD = 0;
      flightCostPerAdultUSD = 0;
      flightNotice = 'Flight pricing requires a custom quote.';
    }
  }

  // 2. ACCOMMODATION ENGINE
  let roomsCount = 1;
  if (roomOccupancy === 'single') {
    roomsCount = Math.max(1, adultsCount);
  } else if (roomOccupancy === 'double') {
    roomsCount = Math.max(1, Math.ceil((adultsCount + (childrenCount > 1 ? childrenCount - 1 : 0)) / 2));
  } else if (roomOccupancy === 'triple') {
    roomsCount = Math.max(1, Math.ceil(totalTravelers / 3));
  } else if (roomOccupancy === 'quad') {
    roomsCount = Math.max(1, Math.ceil(totalTravelers / 4));
  } else {
    // group
    roomsCount = Math.max(1, Math.ceil(totalTravelers / 2));
  }

  const roomNightRateUSD = safeServiceRules.accommodationPerNight[styleTier] || 130;
  const accommodationTotalUSD = hotelRequested ? Math.round(roomsCount * durationNights * roomNightRateUSD) : 0;

  // 3. MEALS & DINING ENGINE
  const mealRatePerPersonUSD = safeServiceRules.mealsPerPersonPerDay[styleTier] || 60;
  const mealAllowanceTotalUSD = mealsRequested
    ? Math.round((adultsCount * mealRatePerPersonUSD + childrenCount * mealRatePerPersonUSD * 0.6) * durationDays)
    : 0;

  // 4. AIRPORT TRANSFERS ENGINE
  const vehiclesNeeded = Math.max(1, Math.ceil(totalTravelers / 4));
  let transfersTotalUSD = 0;
  if (transfersRequested) {
    if (safeServiceRules.transfersCostType === 'per_person') {
      transfersTotalUSD = Math.round(totalTravelers * (safeServiceRules.airportTransfersRoundtrip || 90));
    } else {
      // per vehicle or per booking
      transfersTotalUSD = Math.round(vehiclesNeeded * (safeServiceRules.airportTransfersRoundtrip || 90));
    }
  }

  // 5. EXCURSIONS & TOURS ENGINE
  const excursionRateUSD = safeServiceRules.excursionsAllowancePerPerson[styleTier] || 150;
  const excursionsTotalUSD = excursionsRequested
    ? Math.round(adultsCount * excursionRateUSD + childrenCount * excursionRateUSD * 0.65)
    : 0;

  // 6. TRAVEL DOCUMENTS & VISA
  const travelDocumentsTotalUSD = travelDocsRequested
    ? Math.round(totalTravelers * (safeServiceRules.travelDocumentsFee || 65))
    : 0;

  // 7. OTHER SERVICES
  const otherServicesTotalUSD = otherServicesRequested
    ? Math.round(totalTravelers * (safeServiceRules.otherServicesFee || 50))
    : 0;

  // 8. TAXES & REGULATORY FEES
  const landSubtotalUSD =
    accommodationTotalUSD +
    mealAllowanceTotalUSD +
    transfersTotalUSD +
    excursionsTotalUSD +
    travelDocumentsTotalUSD +
    otherServicesTotalUSD;

  const taxesPercentage = safeServiceRules.taxesAndFeesPercentage || 8.5;
  const taxesAndFeesTotalUSD = Math.round(landSubtotalUSD * (taxesPercentage / 100));

  // RAW CALCULATED TOTAL
  const rawCalculatedTotalUSD = flightCostTotalUSD + landSubtotalUSD + taxesAndFeesTotalUSD;

  // POLICY CHECKS
  // 1. 2 adults -> total group budget cannot be less than $1500 USD
  // 2. > 5 days -> budget cannot be less than $2000 USD
  const policyRulesApplied: string[] = [];
  let policyFloorUSD = 0;

  if (adultsCount >= 2) {
    policyFloorUSD = Math.max(policyFloorUSD, 1500);
    policyRulesApplied.push('2 Adult Travelers (Min $1,500 USD group policy)');
  }

  if (durationDays > 5) {
    policyFloorUSD = Math.max(policyFloorUSD, 2000);
    policyRulesApplied.push(`${durationDays} Days Duration (>5 days requires Min $2,000 USD group policy)`);
  }

  // Final Estimated Minimum Budget (must satisfy both the calculated sum AND the minimum policy floor)
  const minimumBudgetUSD = Math.max(rawCalculatedTotalUSD, policyFloorUSD);
  const minimumBudgetPerPersonUSD = Math.round(minimumBudgetUSD / (adultsCount || 1));

  // CURRENCY CONVERSION
  const curList = currencies && currencies.length > 0 ? currencies : INITIAL_SUPPORTED_CURRENCIES;
  const matchedCurrency = curList.find(
    (c) => c.code.toUpperCase() === (selectedCurrencyCode || 'USD').toUpperCase()
  ) || {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rateFromUSD: 1.0,
  };

  const fxRate = matchedCurrency.rateFromUSD || 1.0;
  const minimumBudgetInCurrency = Math.round(minimumBudgetUSD * fxRate);
  const minimumBudgetPerPersonInCurrency = Math.round(minimumBudgetPerPersonUSD * fxRate);

  const breakdownUSD = {
    flightCost: flightCostTotalUSD,
    accommodation: accommodationTotalUSD,
    meals: mealAllowanceTotalUSD,
    transfers: transfersTotalUSD,
    excursions: excursionsTotalUSD,
    travelDocuments: travelDocumentsTotalUSD,
    otherServices: otherServicesTotalUSD,
    taxesAndFees: taxesAndFeesTotalUSD,
  };

  const breakdownInCurrency = {
    flightCost: Math.round(flightCostTotalUSD * fxRate),
    accommodation: Math.round(accommodationTotalUSD * fxRate),
    meals: Math.round(mealAllowanceTotalUSD * fxRate),
    transfers: Math.round(transfersTotalUSD * fxRate),
    excursions: Math.round(excursionsTotalUSD * fxRate),
    travelDocuments: Math.round(travelDocumentsTotalUSD * fxRate),
    otherServices: Math.round(otherServicesTotalUSD * fxRate),
    taxesAndFees: Math.round(taxesAndFeesTotalUSD * fxRate),
  };

  const costBreakdown: CostBreakdownItemized = {
    flightsUSD: flightCostTotalUSD,
    accommodationUSD: accommodationTotalUSD,
    mealsUSD: mealAllowanceTotalUSD,
    transfersUSD: transfersTotalUSD,
    excursionsUSD: excursionsTotalUSD,
    documentsUSD: travelDocumentsTotalUSD,
    otherServicesUSD: otherServicesTotalUSD,
    taxesAndFeesUSD: taxesAndFeesTotalUSD,
    bufferUSD: Math.max(0, minimumBudgetUSD - rawCalculatedTotalUSD),

    flightsInCurrency: Math.round(flightCostTotalUSD * fxRate),
    accommodationInCurrency: Math.round(accommodationTotalUSD * fxRate),
    mealsInCurrency: Math.round(mealAllowanceTotalUSD * fxRate),
    transfersInCurrency: Math.round(transfersTotalUSD * fxRate),
    excursionsInCurrency: Math.round(excursionsTotalUSD * fxRate),
    documentsInCurrency: Math.round(travelDocumentsTotalUSD * fxRate),
    otherServicesInCurrency: Math.round(otherServicesTotalUSD * fxRate),
    taxesAndFeesInCurrency: Math.round(taxesAndFeesTotalUSD * fxRate),
    bufferInCurrency: Math.round(Math.max(0, minimumBudgetUSD - rawCalculatedTotalUSD) * fxRate),
  };

  return {
    flightRequested,
    flightPricingStatus,
    flightRouteMatched,
    matchedRoute,
    flightCostTotalUSD,
    flightCostPerAdultUSD,
    flightNotice,
    breakdownUSD,
    roomsCount,
    durationNights,
    totalTravelers,
    rawCalculatedTotalUSD,
    policyFloorUSD,
    minimumBudgetUSD,
    minimumBudgetPerPersonUSD,

    // Aliases
    totalEstimatedCostUSD: minimumBudgetUSD,
    totalEstimatedCostInCurrency: minimumBudgetInCurrency,
    currencyCode: matchedCurrency.code,
    currencySymbol: matchedCurrency.symbol,
    costBreakdown,

    currency: matchedCurrency,
    minimumBudgetInCurrency,
    minimumBudgetPerPersonInCurrency,
    breakdownInCurrency,
    policyRulesApplied,
  };
}
