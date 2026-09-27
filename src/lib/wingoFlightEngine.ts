import { WingoRouteRate } from '../types';

/**
 * Wingo Flight Engine & Skyscanner Fallback Router
 * 
 * Verifies whether requested flight routes (origin / destination) fall within
 * the 11 supported Wingo Airlines network countries:
 * - Colombia (Domestic network and international hub)
 * - Aruba, Costa Rica, Cuba, Curaçao, Dominican Republic, Guatemala, Jamaica, Mexico, Panama, Venezuela
 * 
 * Pricing & Routing Rules:
 * 1. Both countries in Wingo network:
 *    - Provider: 'wingo'
 *    - Currency: 'COP' if domestic (both Colombia), 'USD' for international
 *    - Calculated breakdown (base fare, taxes, ancillary fees, grand total)
 * 2. Either country outside Wingo network:
 *    - Immediately halts Wingo calculations
 *    - Provider: 'skyscanner'
 *    - breakdown: null, grand_total: null
 *    - Fallback triggered note
 */

export const WINGO_SUPPORTED_COUNTRIES = [
  'Colombia',
  'Aruba',
  'Costa Rica',
  'Cuba',
  'Curaçao',
  'Dominican Republic',
  'Guatemala',
  'Jamaica',
  'Mexico',
  'Panama',
  'Venezuela',
] as const;

export type WingoCountry = typeof WINGO_SUPPORTED_COUNTRIES[number];

export interface FlightPricingBreakdown {
  base_fare_subtotal: number;
  taxes_and_fees: number;
  ancillary_fees: number;
}

export interface WingoEngineResponse {
  provider: 'wingo' | 'skyscanner';
  journey_type: 'one_way' | 'round_trip';
  currency: 'COP' | 'USD';
  countries_involved: [string, string];
  breakdown: FlightPricingBreakdown | null;
  grand_total: number | null;
  notes: string;
}

// Normalizer to match country strings reliably
export function normalizeCountryName(country: string): string {
  if (!country) return '';
  const trimmed = country.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'curacao' || lower === 'curaçao') return 'Curaçao';
  if (lower === 'colombia' || lower === 'co') return 'Colombia';
  if (lower === 'aruba' || lower === 'aw') return 'Aruba';
  if (lower === 'costa rica' || lower === 'cr') return 'Costa Rica';
  if (lower === 'cuba' || lower === 'cu') return 'Cuba';
  if (lower === 'dominican republic' || lower === 'dr' || lower === 'do') return 'Dominican Republic';
  if (lower === 'guatemala' || lower === 'gt') return 'Guatemala';
  if (lower === 'jamaica' || lower === 'jm') return 'Jamaica';
  if (lower === 'mexico' || lower === 'mx') return 'Mexico';
  if (lower === 'panama' || lower === 'pa') return 'Panama';
  if (lower === 'venezuela' || lower === 've') return 'Venezuela';

  // Capitalize title case fallback
  return trimmed;
}

export function isWingoSupportedCountry(country: string): boolean {
  const normalized = normalizeCountryName(country);
  return WINGO_SUPPORTED_COUNTRIES.some(
    c => c.toLowerCase() === normalized.toLowerCase()
  );
}

export interface FlightRouteVerificationParams {
  originCountry: string;
  destinationCountry: string;
  originCity?: string;
  destinationCity?: string;
  journeyType?: 'one_way' | 'round_trip';
  passengers?: number;
  cabinClass?: string;
  customRoutes?: WingoRouteRate[];
}

/**
 * Core Route and Pricing Verification Engine
 */
export function verifyFlightRouteAndPrice(params: FlightRouteVerificationParams): WingoEngineResponse {
  const origin = normalizeCountryName(params.originCountry);
  const destination = normalizeCountryName(params.destinationCountry);
  const journeyType = params.journeyType || 'round_trip';
  const multiplier = journeyType === 'round_trip' ? 2 : 1;
  const passengers = Math.max(1, params.passengers || 1);

  const originSupported = isWingoSupportedCountry(origin);
  const destSupported = isWingoSupportedCountry(destination);

  // IF EITHER country is NOT on the list:
  // Immediately halt Wingo calculations and return Skyscanner fallback status
  if (!originSupported || !destSupported) {
    return {
      provider: 'skyscanner',
      journey_type: journeyType,
      currency: 'USD',
      countries_involved: [origin || params.originCountry, destination || params.destinationCountry],
      breakdown: null,
      grand_total: null,
      notes: 'Fallback triggered. Destination or origin country is outside Wingo network. Route handed over to Skyscanner search API.',
    };
  }

  // BOTH countries are supported by Wingo
  const isDomesticColombia = origin.toLowerCase() === 'colombia' && destination.toLowerCase() === 'colombia';
  const currency: 'COP' | 'USD' = isDomesticColombia ? 'COP' : 'USD';

  // Check if a custom route exists in customRoutes
  let matchedCustomRoute: WingoRouteRate | undefined;
  if (params.customRoutes && params.customRoutes.length > 0) {
    matchedCustomRoute = params.customRoutes.find(r => {
      if (!r.isActive) return false;
      const matchForward =
        normalizeCountryName(r.originCountry).toLowerCase() === origin.toLowerCase() &&
        normalizeCountryName(r.destinationCountry).toLowerCase() === destination.toLowerCase();
      const matchReverse =
        normalizeCountryName(r.originCountry).toLowerCase() === destination.toLowerCase() &&
        normalizeCountryName(r.destinationCountry).toLowerCase() === origin.toLowerCase();
      return matchForward || matchReverse;
    });
  }

  let base_fare_subtotal: number;
  let taxes_and_fees: number;
  let ancillary_fees: number;
  let grand_total: number;

  if (matchedCustomRoute) {
    if (journeyType === 'one_way') {
      base_fare_subtotal = Math.round(matchedCustomRoute.oneWayBaseFare * passengers * 100) / 100;
      taxes_and_fees = Math.round(matchedCustomRoute.oneWayTaxesAndFees * passengers * 100) / 100;
      ancillary_fees = Math.round(matchedCustomRoute.oneWayAncillaryFees * passengers * 100) / 100;
      grand_total = Math.round(matchedCustomRoute.oneWayGrandTotal * passengers * 100) / 100;
    } else {
      base_fare_subtotal = Math.round(matchedCustomRoute.roundTripBaseFare * passengers * 100) / 100;
      taxes_and_fees = Math.round(matchedCustomRoute.roundTripTaxesAndFees * passengers * 100) / 100;
      ancillary_fees = Math.round(matchedCustomRoute.roundTripAncillaryFees * passengers * 100) / 100;
      grand_total = Math.round(matchedCustomRoute.roundTripGrandTotal * passengers * 100) / 100;
    }
  } else {
    // Standard default calculations
    let baseFarePerLeg: number;
    let taxesPerLeg: number;
    let ancillaryPerLeg: number;

    if (isDomesticColombia) {
      baseFarePerLeg = 180000;
      taxesPerLeg = 45000;
      ancillaryPerLeg = 25000;
    } else {
      baseFarePerLeg = 120;
      taxesPerLeg = 39.25;
      ancillaryPerLeg = 17.50;
    }

    base_fare_subtotal = Math.round(baseFarePerLeg * multiplier * passengers * 100) / 100;
    taxes_and_fees = Math.round(taxesPerLeg * multiplier * passengers * 100) / 100;
    ancillary_fees = Math.round(ancillaryPerLeg * multiplier * passengers * 100) / 100;
    grand_total = Math.round((base_fare_subtotal + taxes_and_fees + ancillary_fees) * 100) / 100;
  }

  return {
    provider: 'wingo',
    journey_type: journeyType,
    currency,
    countries_involved: [origin, destination],
    breakdown: {
      base_fare_subtotal,
      taxes_and_fees,
      ancillary_fees,
    },
    grand_total,
    notes: 'Route verified. Pricing successfully calculated via Wingo engine.',
  };
}
