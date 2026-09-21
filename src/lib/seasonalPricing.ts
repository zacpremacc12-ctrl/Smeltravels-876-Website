import {
  SeasonType,
  DateOptionEvaluation,
  CalendarDayPrice,
  CheapestDateFinderResult,
  DateFlexibilityOption,
  FlightPriceSource,
  OriginPricingRoute,
  ServiceCostRules,
  CurrencyRecord,
  CabinClassType,
  CheapestDateFinderSettings,
} from '../types';
import {
  INITIAL_SERVICE_COST_RULES,
  INITIAL_SUPPORTED_CURRENCIES,
} from '../data/originPricingData';
import { DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS } from '../data/cheapestDateFinderDefaults';
import { normalizeTravelStyle } from './pricingEngine';

/**
 * Returns applicable travel season and multiplier factors based on departure date.
 */
export function getApplicableSeason(dateStr: string): {
  season: SeasonType;
  label: string;
  flightMult: number;
  hotelMult: number;
  mealsMult: number;
  toursMult: number;
  reason: string;
} {
  if (!dateStr || typeof dateStr !== 'string') {
    return {
      season: 'Standard',
      label: 'Standard Travel Season',
      flightMult: 1.0,
      hotelMult: 1.0,
      mealsMult: 1.0,
      toursMult: 1.0,
      reason: 'Standard airline and hotel rate schedule applies.',
    };
  }

  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(month) || isNaN(day)) {
    return {
      season: 'Standard',
      label: 'Standard Travel Season',
      flightMult: 1.0,
      hotelMult: 1.0,
      mealsMult: 1.0,
      toursMult: 1.0,
      reason: 'Standard airline and hotel rate schedule applies.',
    };
  }

  // 1. HOLIDAY / FESTIVE PEAK (Dec 18 - Jan 6)
  if ((month === 12 && day >= 18) || (month === 1 && day <= 6)) {
    return {
      season: 'Holiday Peak',
      label: 'Holiday / Festive Peak Season',
      flightMult: 1.38,
      hotelMult: 1.45,
      mealsMult: 1.1,
      toursMult: 1.05,
      reason: 'Christmas, New Year, and holiday peak demand increase carrier and resort rates.',
    };
  }

  // 2. SPRING BREAK / EASTER PEAK (Mar 26 - Apr 14)
  if ((month === 3 && day >= 26) || (month === 4 && day <= 14)) {
    return {
      season: 'Holiday Peak',
      label: 'Easter & Spring Break Peak',
      flightMult: 1.25,
      hotelMult: 1.3,
      mealsMult: 1.05,
      toursMult: 1.0,
      reason: 'High international traveler volume during Easter and Spring holiday school breaks.',
    };
  }

  // 3. PEAK SUMMER (June 28 - Aug 18)
  if ((month === 6 && day >= 28) || month === 7 || (month === 8 && day <= 18)) {
    return {
      season: 'Peak / High',
      label: 'Peak Summer Season',
      flightMult: 1.2,
      hotelMult: 1.25,
      mealsMult: 1.05,
      toursMult: 1.0,
      reason: 'High summer vacation demand across international airlines and hotels.',
    };
  }

  // 4. THANKSGIVING PEAK (Nov 20 - Nov 30)
  if (month === 11 && day >= 20 && day <= 30) {
    return {
      season: 'Peak / High',
      label: 'Thanksgiving Travel Window',
      flightMult: 1.22,
      hotelMult: 1.2,
      mealsMult: 1.05,
      toursMult: 1.0,
      reason: 'Peak flight demand around Thanksgiving holiday weekend.',
    };
  }

  // 5. CARNIVAL / WINTER HIGH (Feb 8 - Feb 26)
  if (month === 2 && day >= 8 && day <= 26) {
    return {
      season: 'Peak / High',
      label: 'Carnival & Winter Warmth Peak',
      flightMult: 1.18,
      hotelMult: 1.2,
      mealsMult: 1.05,
      toursMult: 1.0,
      reason: 'High travel interest for Caribbean & South American carnival festivities.',
    };
  }

  // 6. LOW SEASON / BEST VALUE (Sept 1 - Oct 22)
  if (month === 9 || (month === 10 && day <= 22)) {
    return {
      season: 'Low Season',
      label: 'Low Season (Best Value Rates)',
      flightMult: 0.88,
      hotelMult: 0.85,
      mealsMult: 1.0,
      toursMult: 0.95,
      reason: 'Autumn shoulder season offers discounted carrier seats and hospitality value rates.',
    };
  }

  // 7. POST-HOLIDAY JANUARY VALUE (Jan 10 - Jan 31)
  if (month === 1 && day >= 10) {
    return {
      season: 'Low Season',
      label: 'Post-Holiday January Value',
      flightMult: 0.9,
      hotelMult: 0.88,
      mealsMult: 1.0,
      toursMult: 1.0,
      reason: 'Post-holiday travel lull brings reduced airfare and lower hotel occupancy rates.',
    };
  }

  // 8. STANDARD TRAVEL SEASON (Default)
  return {
    season: 'Standard',
    label: 'Standard Travel Season',
    flightMult: 1.0,
    hotelMult: 1.0,
    mealsMult: 1.0,
    toursMult: 1.0,
    reason: 'Standard airline schedules and baseline hotel rates apply.',
  };
}

/**
 * Adds N days to a YYYY-MM-DD date string.
 */
export function addDaysToDate(dateStr: string, days: number): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + days);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a single date string (YYYY-MM-DD) into readable format, e.g. "Dec 8, 2026".
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date range into e.g. "Dec 8–12, 2026" or "Dec 28, 2026 – Jan 2, 2027".
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return `${startDateStr} – ${endDateStr}`;
  try {
    const [y1, m1, d1] = startDateStr.split('-').map(Number);
    const [y2, m2, d2] = endDateStr.split('-').map(Number);
    const date1 = new Date(Date.UTC(y1, m1 - 1, d1));
    const date2 = new Date(Date.UTC(y2, m2 - 1, d2));

    const month1 = date1.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const month2 = date2.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const year1 = date1.getUTCFullYear();
    const year2 = date2.getUTCFullYear();

    if (year1 === year2) {
      if (month1 === month2) {
        return `${month1} ${d1}–${d2}, ${year1}`;
      }
      return `${month1} ${d1} – ${month2} ${d2}, ${year1}`;
    }
    return `${month1} ${d1}, ${year1} – ${month2} ${d2}, ${year2}`;
  } catch {
    return `${startDateStr} to ${endDateStr}`;
  }
}

export interface EvaluateDateOptionParams {
  departureDate: string;
  durationDays: number;
  adultsCount: number;
  childrenCount: number;
  originCountry: string;
  originCity: string;
  originAirportCode?: string;
  destinationCountry: string;
  destinationCity: string;
  travelStyle: string;
  roomOccupancy?: 'single' | 'double' | 'triple' | 'quad' | 'group';
  cabinClass?: CabinClassType;
  selectedServices?: string[];
  routes?: OriginPricingRoute[];
  serviceRules?: ServiceCostRules;
  currencies?: CurrencyRecord[];
  selectedCurrencyCode?: string;
  settings?: CheapestDateFinderSettings;
  skyscannerQuoteUSD?: number;
  skyscannerQuoteSource?: FlightPriceSource;
  statedBudgetUSD?: number;
}

/**
 * Evaluates the COMPLETE estimated trip cost for a specific departure date.
 * Does NOT only calculate airfare — calculates Flights + Hotels + Meals +
 * Transfers + Excursions + Documents + Seasonal Adjustments + Taxes.
 */
export function evaluateDateOption(params: EvaluateDateOptionParams): DateOptionEvaluation {
  const {
    departureDate,
    durationDays = 5,
    adultsCount = 1,
    childrenCount = 0,
    originCountry = 'Jamaica',
    originCity = 'Kingston',
    originAirportCode = 'KIN',
    destinationCountry = 'Panama',
    destinationCity = 'Panama City',
    travelStyle = 'Standard',
    roomOccupancy = 'double',
    cabinClass = 'Economy',
    selectedServices = ['flight', 'hotel', 'transfers', 'excursions'],
    routes = [],
    serviceRules = INITIAL_SERVICE_COST_RULES,
    currencies = INITIAL_SUPPORTED_CURRENCIES,
    selectedCurrencyCode = 'USD',
    settings = DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS,
    skyscannerQuoteUSD,
    skyscannerQuoteSource,
    statedBudgetUSD,
  } = params;

  const nightsCount = Math.max(1, durationDays - 1);
  const returnDate = addDaysToDate(departureDate, durationDays);
  const formattedDateRange = formatDateRange(departureDate, returnDate);

  // 1. Season Determination
  const seasonInfo = getApplicableSeason(departureDate);
  const seasonBehavior = settings?.seasonalPricingBehavior || 'automatic';
  const flightSeasonMult = seasonBehavior === 'disabled' ? 1.0 : seasonInfo.flightMult;
  const hotelSeasonMult =
    settings?.hotelPricingBehavior === 'fixed_flat' || seasonBehavior === 'disabled'
      ? 1.0
      : seasonInfo.hotelMult;
  const mealsSeasonMult = seasonBehavior === 'disabled' ? 1.0 : seasonInfo.mealsMult;
  const toursSeasonMult = seasonBehavior === 'disabled' ? 1.0 : seasonInfo.toursMult;

  const totalTravelers = adultsCount + childrenCount;
  const styleTier = normalizeTravelStyle(travelStyle);

  const hasService = (keyword: string) =>
    selectedServices.some((s) => s.toLowerCase().includes(keyword.toLowerCase()));

  const flightRequested = hasService('flight');
  const hotelRequested = hasService('hotel') || hasService('accommodation') || hasService('stay');
  const transfersRequested = hasService('transfer') || hasService('airport');
  const excursionsRequested = hasService('excursion') || hasService('tour') || hasService('activity');
  const mealsRequested = hasService('meal') || hasService('dining') || hasService('food');
  const travelDocsRequested = hasService('document') || hasService('visa');
  const otherServicesRequested = hasService('other') || hasService('concierge') || hasService('custom');

  // 2. Flight Pricing Engine
  let flightPricePerAdultUSD = 0;
  let flightPriceTotalUSD = 0;
  let flightPriceSource: FlightPriceSource = 'Flight pricing requires a custom quote';
  let flightPricingStatus: 'Estimated' | 'Manual Flight Pricing Required' = 'Manual Flight Pricing Required';

  if (flightRequested) {
    if (typeof skyscannerQuoteUSD === 'number' && skyscannerQuoteUSD > 0) {
      // Live or Indicative quote from Skyscanner API
      flightPricePerAdultUSD = Math.round(skyscannerQuoteUSD);
      flightPriceSource = skyscannerQuoteSource || 'Indicative Flight Price';
      flightPricingStatus = 'Estimated';
    } else {
      // Match route from admin pricing engine
      const normOriginCountry = (originCountry || '').trim().toLowerCase();
      const normOriginCity = (originCity || '').trim().toLowerCase();
      const normOriginCode = (originAirportCode || '').trim().toUpperCase();
      const normDestCountry = (destinationCountry || '').trim().toLowerCase();
      const normDestCity = (destinationCity || '').trim().toLowerCase();

      const activeRoutes = (routes || []).filter((r) => r && r.isActive !== false);

      let matchedRoute = activeRoutes.find(
        (r) =>
          r.originAirportCode.toUpperCase() === normOriginCode &&
          r.destinationCountry.toLowerCase() === normDestCountry &&
          (r.destinationCity.toLowerCase().includes(normDestCity) || normDestCity.includes(r.destinationCity.toLowerCase()))
      );

      if (!matchedRoute) {
        matchedRoute = activeRoutes.find(
          (r) =>
            r.originAirportCode.toUpperCase() === normOriginCode &&
            r.destinationCountry.toLowerCase() === normDestCountry
        );
      }

      if (!matchedRoute) {
        matchedRoute = activeRoutes.find(
          (r) =>
            r.originCity.toLowerCase() === normOriginCity &&
            r.destinationCountry.toLowerCase() === normDestCountry
        );
      }

      if (!matchedRoute) {
        matchedRoute = activeRoutes.find(
          (r) =>
            r.originCountry.toLowerCase() === normOriginCountry &&
            r.destinationCountry.toLowerCase() === normDestCountry
        );
      }

      if (matchedRoute && matchedRoute.estimatedRoundtripUSD > 0) {
        const cabinKey =
          cabinClass === 'Premium Economy'
            ? 'PremiumEconomy'
            : cabinClass === 'Business'
            ? 'Business'
            : cabinClass === 'First'
            ? 'First'
            : 'Economy';
        const cabinMult = matchedRoute.cabinClassMultipliers?.[cabinKey] || 1.0;

        // Base rate * cabin multiplier * seasonal factor
        flightPricePerAdultUSD = Math.round(
          matchedRoute.estimatedRoundtripUSD * cabinMult * flightSeasonMult
        );
        flightPriceSource = 'SMELTRAVELS876 Estimated Flight Allowance';
        flightPricingStatus = 'Estimated';
      } else {
        flightPricePerAdultUSD = 0;
        flightPriceSource = 'Flight pricing requires a custom quote';
        flightPricingStatus = 'Manual Flight Pricing Required';
      }
    }

    const flightPricePerChildUSD = Math.round(flightPricePerAdultUSD * 0.85);
    flightPriceTotalUSD = adultsCount * flightPricePerAdultUSD + childrenCount * flightPricePerChildUSD;
  }

  // 3. Accommodation
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
    roomsCount = Math.max(1, Math.ceil(totalTravelers / 2));
  }

  const baseRoomRateUSD = serviceRules.accommodationPerNight[styleTier] || 130;
  const roomNightRateUSD = Math.round(baseRoomRateUSD * hotelSeasonMult);
  const hotelTotalUSD = hotelRequested ? Math.round(roomsCount * nightsCount * roomNightRateUSD) : 0;

  // 4. Meals
  const baseMealRateUSD = serviceRules.mealsPerPersonPerDay[styleTier] || 60;
  const mealRatePerPersonUSD = Math.round(baseMealRateUSD * mealsSeasonMult);
  const mealsTotalUSD = mealsRequested
    ? Math.round((adultsCount * mealRatePerPersonUSD + childrenCount * mealRatePerPersonUSD * 0.6) * durationDays)
    : 0;

  // 5. Airport Transfers
  const vehiclesNeeded = Math.max(1, Math.ceil(totalTravelers / 4));
  let transfersTotalUSD = 0;
  if (transfersRequested) {
    if (serviceRules.transfersCostType === 'per_person') {
      transfersTotalUSD = Math.round(totalTravelers * (serviceRules.airportTransfersRoundtrip || 90));
    } else {
      transfersTotalUSD = Math.round(vehiclesNeeded * (serviceRules.airportTransfersRoundtrip || 90));
    }
  }

  // 6. Excursions
  const baseExcursionRateUSD = serviceRules.excursionsAllowancePerPerson[styleTier] || 150;
  const excursionRateUSD = Math.round(baseExcursionRateUSD * toursSeasonMult);
  const excursionsTotalUSD = excursionsRequested
    ? Math.round(adultsCount * excursionRateUSD + childrenCount * excursionRateUSD * 0.65)
    : 0;

  // 7. Travel Documents & Visa
  const travelDocumentsTotalUSD = travelDocsRequested
    ? Math.round(totalTravelers * (serviceRules.travelDocumentsFee || 65))
    : 0;

  // 8. Other Services
  const otherServicesTotalUSD = otherServicesRequested
    ? Math.round(totalTravelers * (serviceRules.otherServicesFee || 50))
    : 0;

  // 9. Taxes & Regulatory Fees
  const landSubtotalUSD =
    hotelTotalUSD +
    mealsTotalUSD +
    transfersTotalUSD +
    excursionsTotalUSD +
    travelDocumentsTotalUSD +
    otherServicesTotalUSD;

  const taxesPercentage = serviceRules.taxesAndFeesPercentage || 8.5;
  const taxesAndFeesTotalUSD = Math.round(landSubtotalUSD * (taxesPercentage / 100));

  // 10. Seasonal Adjustment calculation
  // Computes the difference caused strictly by seasonal multipliers
  const standardFlightUSD = flightRequested
    ? Math.round((flightPriceTotalUSD / (flightSeasonMult || 1)) || 0)
    : 0;
  const standardHotelUSD = hotelRequested
    ? Math.round((hotelTotalUSD / (hotelSeasonMult || 1)) || 0)
    : 0;
  const standardMealsUSD = mealsRequested
    ? Math.round((mealsTotalUSD / (mealsSeasonMult || 1)) || 0)
    : 0;
  const standardToursUSD = excursionsRequested
    ? Math.round((excursionsTotalUSD / (toursSeasonMult || 1)) || 0)
    : 0;

  const seasonalAdjustmentUSD =
    (flightPriceTotalUSD - standardFlightUSD) +
    (hotelTotalUSD - standardHotelUSD) +
    (mealsTotalUSD - standardMealsUSD) +
    (excursionsTotalUSD - standardToursUSD);

  // 11. Raw Calculated Total & Policy Minimum Checks
  const rawCalculatedTotalUSD = flightPriceTotalUSD + landSubtotalUSD + taxesAndFeesTotalUSD;

  let policyFloorUSD = 0;
  if (adultsCount >= 2) {
    policyFloorUSD = Math.max(policyFloorUSD, 1500);
  }
  if (durationDays > 5) {
    policyFloorUSD = Math.max(policyFloorUSD, 2000);
  }

  const rawPolicyFloorApplied = policyFloorUSD > rawCalculatedTotalUSD;
  const totalEstimatedTripCostUSD = Math.max(rawCalculatedTotalUSD, policyFloorUSD);

  // 12. Currency Conversion
  const curList = currencies && currencies.length > 0 ? currencies : INITIAL_SUPPORTED_CURRENCIES;
  const matchedCur = curList.find(
    (c) => c.code.toUpperCase() === (selectedCurrencyCode || 'USD').toUpperCase()
  ) || {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rateFromUSD: 1.0,
  };

  const fxRate = matchedCur.rateFromUSD || 1.0;
  const totalEstimatedTripCostInCurrency = Math.round(totalEstimatedTripCostUSD * fxRate);

  // 13. Stated Budget Evaluation
  let closerToBudget = false;
  let withinBudget = false;
  if (typeof statedBudgetUSD === 'number' && statedBudgetUSD > 0) {
    withinBudget = totalEstimatedTripCostUSD <= statedBudgetUSD;
  }

  return {
    id: `date-opt-${departureDate}-${Math.random().toString(36).substring(2, 7)}`,
    departureDate,
    returnDate,
    formattedDateRange,
    daysCount: durationDays,
    nightsCount,
    season: seasonInfo.season,
    seasonLabel: seasonInfo.label,
    flightPricePerAdultUSD,
    flightPriceTotalUSD,
    flightPriceSource,
    flightPricingStatus,
    hotelTotalUSD,
    mealsTotalUSD,
    transfersTotalUSD,
    excursionsTotalUSD,
    travelDocumentsTotalUSD,
    otherServicesTotalUSD,
    taxesAndFeesTotalUSD,
    seasonalAdjustmentUSD,
    totalEstimatedTripCostUSD,
    totalEstimatedTripCostInCurrency,
    currencyCode: matchedCur.code,
    currencySymbol: matchedCur.symbol,
    closerToBudget,
    withinBudget,
    rawPolicyFloorApplied,
  };
}

export interface CheapestDateFinderInput {
  originCountry: string;
  originCity: string;
  originAirportCode?: string;
  destinationCountry: string;
  destinationCity: string;
  selectedDate?: string; // YYYY-MM-DD
  flexibilityOption: DateFlexibilityOption;
  targetMonth?: string; // YYYY-MM
  customDateStart?: string; // YYYY-MM-DD
  customDateEnd?: string; // YYYY-MM-DD
  durationDays: number;
  adultsCount: number;
  childrenCount: number;
  travelStyle: string;
  roomOccupancy?: 'single' | 'double' | 'triple' | 'quad' | 'group';
  cabinClass?: CabinClassType;
  selectedServices?: string[];
  routes?: OriginPricingRoute[];
  serviceRules?: ServiceCostRules;
  currencies?: CurrencyRecord[];
  selectedCurrencyCode?: string;
  statedBudgetAmount?: number; // In selected currency or USD
  statedBudgetCurrency?: string;
  settings?: CheapestDateFinderSettings;
}

/**
 * Searches for potentially lower-cost travel dates by evaluating full trip costs
 * across multiple candidate dates and comparing them to the customer's selected dates.
 */
export async function findCheapestDateOptions(
  input: CheapestDateFinderInput
): Promise<CheapestDateFinderResult> {
  const {
    originCountry,
    originCity,
    originAirportCode = 'KIN',
    destinationCountry,
    destinationCity,
    selectedDate,
    flexibilityOption = 'plus_minus_7',
    targetMonth,
    customDateStart,
    customDateEnd,
    durationDays = 5,
    adultsCount = 1,
    childrenCount = 0,
    travelStyle = 'Standard',
    roomOccupancy = 'double',
    cabinClass = 'Economy',
    selectedServices,
    routes = [],
    serviceRules = INITIAL_SERVICE_COST_RULES,
    currencies = INITIAL_SUPPORTED_CURRENCIES,
    selectedCurrencyCode = 'USD',
    statedBudgetAmount,
    statedBudgetCurrency = 'USD',
    settings = DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS,
  } = input;

  // Convert stated budget to USD for comparison
  let statedBudgetUSD: number | undefined;
  if (typeof statedBudgetAmount === 'number' && statedBudgetAmount > 0) {
    const matchedCur = currencies.find(
      (c) => c.code.toUpperCase() === (statedBudgetCurrency || 'USD').toUpperCase()
    );
    const rate = matchedCur?.rateFromUSD || 1.0;
    statedBudgetUSD = Math.round(statedBudgetAmount / rate);
  }

  // Determine baseline date: use selectedDate, or 15th of targetMonth, or 30 days from now
  let baseDate = selectedDate;
  if (!baseDate) {
    if (targetMonth) {
      baseDate = `${targetMonth}-10`;
    } else {
      const now = new Date();
      now.setDate(now.getDate() + 45);
      baseDate = now.toISOString().split('T')[0];
    }
  }

  // 1. Evaluate baseline/selected date
  const selectedDatesOption = evaluateDateOption({
    departureDate: baseDate,
    durationDays,
    adultsCount,
    childrenCount,
    originCountry,
    originCity,
    originAirportCode,
    destinationCountry,
    destinationCity,
    travelStyle,
    roomOccupancy,
    cabinClass,
    selectedServices,
    routes,
    serviceRules,
    currencies,
    selectedCurrencyCode,
    settings,
    statedBudgetUSD,
  });

  // 2. Generate candidate departure dates
  const maxCombos = settings?.maxDateCombinations || 24;
  const candidateDatesSet = new Set<string>();

  if (flexibilityOption === 'plus_minus_3') {
    [-3, -2, -1, 1, 2, 3].forEach((offset) => {
      candidateDatesSet.add(addDaysToDate(baseDate, offset));
    });
  } else if (flexibilityOption === 'plus_minus_7') {
    [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7].forEach((offset) => {
      candidateDatesSet.add(addDaysToDate(baseDate, offset));
    });
  } else if (flexibilityOption === 'plus_minus_14') {
    [-14, -12, -10, -8, -7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 7, 8, 10, 12, 14].forEach((offset) => {
      candidateDatesSet.add(addDaysToDate(baseDate, offset));
    });
  } else if (flexibilityOption === 'entire_month') {
    const [yStr, mStr] = (targetMonth || baseDate.substring(0, 7)).split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Sample dates across the entire month up to maxCombos
    const step = Math.max(1, Math.floor(daysInMonth / maxCombos));
    for (let day = 1; day <= daysInMonth; day += step) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (dStr !== baseDate) {
        candidateDatesSet.add(dStr);
      }
    }
  } else if (flexibilityOption === 'custom_range' && customDateStart && customDateEnd) {
    try {
      const [y1, m1, d1] = customDateStart.split('-').map(Number);
      const [y2, m2, d2] = customDateEnd.split('-').map(Number);
      const start = new Date(Date.UTC(y1, m1 - 1, d1));
      const end = new Date(Date.UTC(y2, m2 - 1, d2));
      const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
      const step = Math.max(1, Math.floor(diffDays / maxCombos));

      for (let i = 0; i <= diffDays; i += step) {
        const curr = new Date(start);
        curr.setUTCDate(curr.getUTCDate() + i);
        const curStr = curr.toISOString().split('T')[0];
        if (curStr !== baseDate) {
          candidateDatesSet.add(curStr);
        }
      }
    } catch {
      // Fallback to ±7
      [-7, -5, -3, -1, 1, 3, 5, 7].forEach((offset) => candidateDatesSet.add(addDaysToDate(baseDate, offset)));
    }
  } else {
    // Default fallback
    [-5, -3, -1, 1, 3, 5].forEach((offset) => candidateDatesSet.add(addDaysToDate(baseDate, offset)));
  }

  // 3. Try to fetch Skyscanner quotes if backend endpoint or API key is configured
  let skyscannerQuotesMap: Record<string, { priceUSD: number; source: FlightPriceSource }> = {};
  try {
    const res = await fetch('/api/skyscanner/flight-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originAirportCode,
        destinationCountry,
        destinationCity,
        departureDates: Array.from(candidateDatesSet).slice(0, 15),
        durationDays,
        cabinClass,
        adultsCount,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.quotes && typeof data.quotes === 'object') {
        skyscannerQuotesMap = data.quotes;
      }
    }
  } catch {
    // Graceful offline fallback — Skyscanner integration unavailable or network isolated
  }

  // 4. Evaluate each candidate date
  const candidateDatesList = Array.from(candidateDatesSet).slice(0, maxCombos);
  const evaluatedOptions: DateOptionEvaluation[] = [];

  for (const depDate of candidateDatesList) {
    const skyQuote = skyscannerQuotesMap[depDate];
    const evaluated = evaluateDateOption({
      departureDate: depDate,
      durationDays,
      adultsCount,
      childrenCount,
      originCountry,
      originCity,
      originAirportCode,
      destinationCountry,
      destinationCity,
      travelStyle,
      roomOccupancy,
      cabinClass,
      selectedServices,
      routes,
      serviceRules,
      currencies,
      selectedCurrencyCode,
      settings,
      skyscannerQuoteUSD: skyQuote?.priceUSD,
      skyscannerQuoteSource: skyQuote?.source,
      statedBudgetUSD,
    });

    // Compute detailed differences vs selected date baseline
    const totalDiffUSD = selectedDatesOption.totalEstimatedTripCostUSD - evaluated.totalEstimatedTripCostUSD;
    const flightDiffUSD = selectedDatesOption.flightPriceTotalUSD - evaluated.flightPriceTotalUSD;
    const hotelDiffUSD = selectedDatesOption.hotelTotalUSD - evaluated.hotelTotalUSD;
    const seasonalDiffUSD = selectedDatesOption.seasonalAdjustmentUSD - evaluated.seasonalAdjustmentUSD;
    const otherDiffUSD =
      selectedDatesOption.totalEstimatedTripCostUSD -
      selectedDatesOption.flightPriceTotalUSD -
      selectedDatesOption.hotelTotalUSD -
      (evaluated.totalEstimatedTripCostUSD - evaluated.flightPriceTotalUSD - evaluated.hotelTotalUSD);

    const fxRate =
      currencies.find((c) => c.code.toUpperCase() === (selectedCurrencyCode || 'USD').toUpperCase())
        ?.rateFromUSD || 1.0;

    evaluated.priceDifferenceUSD = totalDiffUSD;
    evaluated.priceDifferenceInCurrency = Math.round(totalDiffUSD * fxRate);
    evaluated.differenceBreakdown = {
      flightDiffUSD,
      hotelDiffUSD,
      seasonalDiffUSD,
      otherDiffUSD,
      totalDiffUSD,
    };

    // Budget comparison
    if (statedBudgetUSD) {
      const baselineDistance = Math.abs(selectedDatesOption.totalEstimatedTripCostUSD - statedBudgetUSD);
      const evalDistance = Math.abs(evaluated.totalEstimatedTripCostUSD - statedBudgetUSD);
      evaluated.closerToBudget = evalDistance < baselineDistance;
    }

    evaluatedOptions.push(evaluated);
  }

  // 5. Separate and track:
  // A. Lowest Estimated Flight Price
  // B. Lowest Estimated Total Trip Budget
  // (Prompt requirement: "Show TWO separate concepts: A. LOWEST ESTIMATED FLIGHT PRICE and B. LOWEST ESTIMATED TOTAL TRIP BUDGET.
  // The two results may be different. Do not assume the lowest airfare automatically produces the lowest overall trip cost.")
  const allOptionsWithBaseline = [selectedDatesOption, ...evaluatedOptions];

  // Lowest flight option (where flight price > 0)
  const validFlightOptions = allOptionsWithBaseline.filter((o) => o.flightPriceTotalUSD > 0);
  let lowestFlightOption: DateOptionEvaluation | undefined;
  if (validFlightOptions.length > 0) {
    lowestFlightOption = [...validFlightOptions].sort(
      (a, b) => a.flightPriceTotalUSD - b.flightPriceTotalUSD
    )[0];
  }

  // Lowest total trip option
  const lowestTotalTripOption = [...allOptionsWithBaseline].sort(
    (a, b) => a.totalEstimatedTripCostUSD - b.totalEstimatedTripCostUSD
  )[0];

  // Mark flags on options
  allOptionsWithBaseline.forEach((opt) => {
    if (lowestFlightOption && opt.departureDate === lowestFlightOption.departureDate) {
      opt.isLowestFlight = true;
    }
    if (lowestTotalTripOption && opt.departureDate === lowestTotalTripOption.departureDate) {
      opt.isLowestTotalTrip = true;
    }
  });

  // Filter alternatives to show (only those that are LOWER or equal cost to selected dates, or closest alternatives)
  // Up to maxAlternativesShown (default 5)
  const maxAlternatives = settings?.maxAlternativesShown || 5;

  // Filter out the exact same departure date as baseline
  const nonBaselineAlternatives = evaluatedOptions.filter(
    (o) => o.departureDate !== selectedDatesOption.departureDate
  );

  // Sort by lowest total trip cost first
  nonBaselineAlternatives.sort((a, b) => a.totalEstimatedTripCostUSD - b.totalEstimatedTripCostUSD);

  const topAlternatives = nonBaselineAlternatives.slice(0, maxAlternatives);

  // 6. Generate Calendar Days for the Month
  // For the visual calendar display (e.g. DECEMBER 2026)
  const targetMonthStr = targetMonth || baseDate.substring(0, 7);
  const [calYearStr, calMonthStr] = targetMonthStr.split('-');
  const calYear = parseInt(calYearStr, 10);
  const calMonth = parseInt(calMonthStr, 10);
  const daysInCalMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarDays: CalendarDayPrice[] = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let day = 1; day <= daysInCalMonth; day++) {
    const dStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(Date.UTC(calYear, calMonth - 1, day));
    const dayOfWeek = daysOfWeek[dateObj.getUTCDay()];
    const season = getApplicableSeason(dStr);

    // Look if we evaluated this date
    const evalMatch = allOptionsWithBaseline.find((o) => o.departureDate === dStr);

    let estCost: number | undefined;
    let flightPrice: number | undefined;
    let pSource: FlightPriceSource = 'Flight pricing requires a custom quote';

    if (evalMatch) {
      estCost = evalMatch.totalEstimatedTripCostUSD;
      flightPrice = evalMatch.flightPriceTotalUSD;
      pSource = evalMatch.flightPriceSource;
    } else {
      // Quick evaluation estimate for calendar cell
      const quickEval = evaluateDateOption({
        departureDate: dStr,
        durationDays,
        adultsCount,
        childrenCount,
        originCountry,
        originCity,
        originAirportCode,
        destinationCountry,
        destinationCity,
        travelStyle,
        roomOccupancy,
        cabinClass,
        selectedServices,
        routes,
        serviceRules,
        currencies,
        selectedCurrencyCode,
        settings,
      });
      estCost = quickEval.totalEstimatedTripCostUSD;
      flightPrice = quickEval.flightPriceTotalUSD;
      pSource = quickEval.flightPriceSource;
    }

    const isCurrentSelected = dStr === selectedDatesOption.departureDate;
    const isLowerCost =
      typeof estCost === 'number' && estCost < selectedDatesOption.totalEstimatedTripCostUSD;

    calendarDays.push({
      date: dStr,
      dayOfMonth: day,
      dayOfWeek,
      estimatedStartingCostUSD: estCost,
      flightPriceUSD: flightPrice,
      season: season.season,
      isAvailable: true,
      pricingSource: pSource,
      isLowerCostHighlight: isLowerCost,
      isCurrentSelected,
    });
  }

  // Check seasonal price difference
  const potentialEstimatedDifferenceUSD = Math.max(
    0,
    selectedDatesOption.totalEstimatedTripCostUSD - lowestTotalTripOption.totalEstimatedTripCostUSD
  );
  const hasSeasonalPriceDifference = potentialEstimatedDifferenceUSD > 0;

  return {
    selectedDatesOption,
    lowestFlightOption,
    lowestTotalTripOption,
    alternativeOptions: topAlternatives,
    calendarDays,
    searchedMonth: targetMonthStr,
    evaluatedCombinationsCount: candidateDatesList.length + 1,
    hasSeasonalPriceDifference,
    potentialEstimatedDifferenceUSD,
  };
}
