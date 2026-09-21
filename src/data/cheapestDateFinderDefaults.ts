import { CheapestDateFinderSettings } from '../types';

export const DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS: CheapestDateFinderSettings = {
  isEnabled: true,
  minimumFlexibilityDays: 3,
  maximumFlexibilityDays: 14,
  maxAlternativesShown: 5,
  maxDateCombinations: 24,
  apiSearchLimitsPerMinute: 30,
  defaultSearchMonth: '2026-12',
  defaultCurrency: 'USD',
  preferredAirports: ['KIN', 'MBJ', 'MIA', 'FLL', 'JFK', 'YYZ', 'LHR'],
  maxStops: 'any',
  seasonalPricingBehavior: 'automatic',
  hotelPricingBehavior: 'dynamic_seasonal',
  compareTotalTripCost: true,
  displayPotentialSavings: true,
  skyscannerApiMarket: 'JM',
  skyscannerApiLocale: 'en-US',
};
