import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  DollarSign,
  Plane,
  Building2,
  Info,
  Clock,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DateFlexibilityOption,
  DateOptionEvaluation,
  CheapestDateFinderResult,
  CalendarDayPrice,
  OriginPricingRoute,
  ServiceCostRules,
  CurrencyRecord,
  CabinClassType,
  CheapestDateFinderSettings,
} from '../../types';
import { findCheapestDateOptions, formatDateDisplay } from '../../lib/seasonalPricing';
import { DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS } from '../../data/cheapestDateFinderDefaults';

interface CheapestDateFinderProps {
  originCountry: string;
  originCity: string;
  originAirportCode?: string;
  destinationCountry: string;
  destinationCity: string;
  currentStartDate?: string;
  currentEndDate?: string;
  durationDays: number;
  adultsCount: number;
  childrenCount: number;
  travelStyle: string;
  roomOccupancy?: 'single' | 'double' | 'triple' | 'quad' | 'group' | string;
  cabinClass?: CabinClassType | string;
  selectedServices?: string[];
  routes: OriginPricingRoute[];
  serviceRules: ServiceCostRules;
  currencies: CurrencyRecord[];
  selectedCurrencyCode: string;
  statedBudgetAmount?: number;
  statedBudgetCurrency?: string;
  settings?: CheapestDateFinderSettings;
  onApplyDates: (newStartDate: string, newEndDate: string) => void;
  onClose?: () => void;
}

export const CheapestDateFinder: React.FC<CheapestDateFinderProps> = ({
  originCountry,
  originCity,
  originAirportCode = 'KIN',
  destinationCountry,
  destinationCity,
  currentStartDate,
  currentEndDate,
  durationDays,
  adultsCount,
  childrenCount,
  travelStyle,
  roomOccupancy = 'double',
  cabinClass = 'Economy',
  selectedServices = ['flight', 'hotel', 'transfers', 'excursions'],
  routes,
  serviceRules,
  currencies,
  selectedCurrencyCode,
  statedBudgetAmount,
  statedBudgetCurrency,
  settings = DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS,
  onApplyDates,
}) => {
  // Flexibility state
  const [flexibility, setFlexibility] = useState<DateFlexibilityOption>('plus_minus_7');
  const [targetMonth, setTargetMonth] = useState<string>(() => {
    if (currentStartDate) {
      return currentStartDate.substring(0, 7);
    }
    return '2026-12';
  });
  const [customRangeStart, setCustomRangeStart] = useState<string>(currentStartDate || '2026-12-01');
  const [customRangeEnd, setCustomRangeEnd] = useState<string>(currentEndDate || '2026-12-31');

  // View state: 'list' or 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Calculation Results
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<CheapestDateFinderResult | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Currency lookup
  const currentCurrency = useMemo(() => {
    return (
      currencies.find((c) => c.code.toUpperCase() === (selectedCurrencyCode || 'USD').toUpperCase()) || {
        code: 'USD',
        symbol: '$',
        rateFromUSD: 1.0,
      }
    );
  }, [currencies, selectedCurrencyCode]);

  // Execute date exploration
  const handleFindCheaperDates = async () => {
    setIsSearching(true);
    try {
      const result = await findCheapestDateOptions({
        originCountry,
        originCity,
        originAirportCode,
        destinationCountry,
        destinationCity,
        selectedDate: currentStartDate,
        flexibilityOption: flexibility,
        targetMonth,
        customDateStart: customRangeStart,
        customDateEnd: customRangeEnd,
        durationDays,
        adultsCount,
        childrenCount,
        travelStyle,
        roomOccupancy: (roomOccupancy as any) || 'double',
        cabinClass: (cabinClass as any) || 'Economy',
        selectedServices,
        routes,
        serviceRules,
        currencies,
        selectedCurrencyCode,
        statedBudgetAmount,
        statedBudgetCurrency,
        settings,
      });
      setSearchResult(result);
    } catch (err) {
      console.error('[CheapestDateFinder Error]:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Initial trigger or when base dates change
  useEffect(() => {
    handleFindCheaperDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    originCountry,
    originCity,
    originAirportCode,
    destinationCountry,
    destinationCity,
    durationDays,
    adultsCount,
    childrenCount,
    travelStyle,
    selectedCurrencyCode,
  ]);

  const toggleBreakdown = (id: string) => {
    setExpandedBreakdownId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="bg-white rounded-2xl border-2 border-purple-200/90 shadow-md p-4 sm:p-6 space-y-5"
      id="cheapest-date-finder-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#2E0249] text-[#FFC72C] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#2E0249]">
              Cheapest Date Finder
            </h3>
            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              Full Trip Cost Evaluator
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            We evaluate complete travel packages (airfare, accommodation, dining, transfers, seasonal adjustments) across alternative dates to discover potential savings.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-[#2E0249] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            id="cdf-toggle-list-view"
          >
            List Comparison
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white text-[#2E0249] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            id="cdf-toggle-calendar-view"
          >
            Visual Calendar
          </button>
        </div>
      </div>

      {/* Date Flexibility Selection Bar */}
      <div className="bg-neutral-50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2E0249]" />
            <span>Search Flexibility:</span>
          </label>
          <span className="text-[11px] text-neutral-500">
            Compare combinations for {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'plus_minus_3', label: '±3 Days' },
            { id: 'plus_minus_7', label: '±7 Days' },
            { id: 'plus_minus_14', label: '±14 Days' },
            { id: 'entire_month', label: 'Entire Month' },
            { id: 'custom_range', label: 'Custom Range' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setFlexibility(opt.id as DateFlexibilityOption);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                flexibility === opt.id
                  ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dynamic Sub-Controls for Entire Month or Custom Range */}
        {flexibility === 'entire_month' && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-neutral-700 whitespace-nowrap">
              Select Month to Explore:
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg outline-none focus:ring-2 focus:ring-[#2E0249]"
            >
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026 (Summer Peak)</option>
              <option value="2026-08">August 2026 (Summer Peak)</option>
              <option value="2026-09">September 2026 (Low Season Deals)</option>
              <option value="2026-10">October 2026 (Standard Value)</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026 (Festive Peak)</option>
              <option value="2027-01">January 2027 (Post-Holiday Value)</option>
              <option value="2027-02">February 2027</option>
              <option value="2027-03">March 2027 (Spring Break)</option>
              <option value="2027-04">April 2027</option>
              <option value="2027-05">May 2027</option>
            </select>
          </div>
        )}

        {flexibility === 'custom_range' && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Earliest Departure:</label>
              <input
                type="date"
                value={customRangeStart}
                onChange={(e) => setCustomRangeStart(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 mb-1">Latest Departure:</label>
              <input
                type="date"
                value={customRangeEnd}
                onChange={(e) => setCustomRangeEnd(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg outline-none"
              />
            </div>
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleFindCheaperDates}
            disabled={isSearching}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#2E0249] hover:bg-[#3b045e] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            id="btn-find-cheaper-travel-dates"
          >
            <Search className={`w-4 h-4 text-[#FFC72C] ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Evaluating Date Combinations...' : 'Find Cheaper Travel Dates'}</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSearching && (
        <div className="py-10 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#2E0249] border-t-[#FFC72C] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-neutral-600">
            Comparing carrier airfares, seasonal hotel tiers, excursions & dining schedules across flexible dates...
          </p>
        </div>
      )}

      {/* Results Content */}
      {!isSearching && searchResult && (
        <div className="space-y-6">
          {/* Top Two Differentiated Highlights (Section 29) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* A. Lowest Estimated Total Trip Budget */}
            {searchResult.lowestTotalTripOption && (
              <div
                className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/50 flex flex-col justify-between space-y-3"
                id="lowest-total-trip-card"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Lowest Estimated Total Trip Budget</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {searchResult.lowestTotalTripOption.seasonLabel}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <div className="text-base sm:text-lg font-extrabold text-neutral-900">
                      {searchResult.lowestTotalTripOption.formattedDateRange}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {searchResult.lowestTotalTripOption.daysCount} Days • Flight + Hotel + Meals + Transfers + Tours
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <div className="text-xl sm:text-2xl font-black text-emerald-900">
                      {currentCurrency.symbol}
                      {searchResult.lowestTotalTripOption.totalEstimatedTripCostInCurrency.toLocaleString()}
                    </div>
                    <span className="text-xs text-neutral-500 font-semibold">
                      ({currentCurrency.code})
                    </span>
                    {searchResult.potentialEstimatedDifferenceUSD && searchResult.potentialEstimatedDifferenceUSD > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                        Save up to ~${searchResult.potentialEstimatedDifferenceUSD} USD
                      </span>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyDates(
                      searchResult.lowestTotalTripOption!.departureDate,
                      searchResult.lowestTotalTripOption!.returnDate
                    );
                  }}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use These Dates</span>
                </button>
              </div>
            )}

            {/* B. Lowest Estimated Flight Price */}
            {searchResult.lowestFlightOption && (
              <div
                className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/40 flex flex-col justify-between space-y-3"
                id="lowest-flight-card"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2E0249] bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      <span>Lowest Estimated Flight Price</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium truncate max-w-[160px]">
                      {searchResult.lowestFlightOption.flightPriceSource}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <div className="text-base sm:text-lg font-extrabold text-neutral-900">
                      {searchResult.lowestFlightOption.formattedDateRange}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      Airfare: ~${searchResult.lowestFlightOption.flightPricePerAdultUSD} USD / adult • Total Trip Budget: {currentCurrency.symbol}
                      {searchResult.lowestFlightOption.totalEstimatedTripCostInCurrency.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <div className="text-xl sm:text-2xl font-black text-[#2E0249]">
                      ${searchResult.lowestFlightOption.flightPriceTotalUSD}
                    </div>
                    <span className="text-xs text-neutral-500 font-semibold">USD Airfare Group Total</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyDates(
                      searchResult.lowestFlightOption!.departureDate,
                      searchResult.lowestFlightOption!.returnDate
                    );
                  }}
                  className="w-full py-2 px-3 bg-[#2E0249] hover:bg-[#3b045e] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use These Dates</span>
                </button>
              </div>
            )}
          </div>

          {/* LIST VIEW: Customer Selected Dates vs Alternatives */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {/* Customer Selected Dates Baseline Banner */}
              {searchResult.selectedDatesOption && (
                <div className="p-3.5 bg-neutral-100 rounded-xl border border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                      Your Selected Travel Dates
                    </div>
                    <div className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5">
                      {searchResult.selectedDatesOption.formattedDateRange} ({searchResult.selectedDatesOption.daysCount} Days)
                    </div>
                    <div className="text-xs text-neutral-600">
                      Season: <span className="font-semibold">{searchResult.selectedDatesOption.seasonLabel}</span> • Estimated Flight: ${searchResult.selectedDatesOption.flightPriceTotalUSD} USD
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-neutral-500 font-medium">Estimated Minimum:</div>
                    <div className="text-base sm:text-lg font-black text-neutral-900">
                      {currentCurrency.symbol}
                      {searchResult.selectedDatesOption.totalEstimatedTripCostInCurrency.toLocaleString()}{' '}
                      <span className="text-xs font-medium text-neutral-500">({currentCurrency.code})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Potentially Lower-Cost Date Alternatives */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-700" />
                    <span>Potentially Lower-Cost Dates Found</span>
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    Showing top {searchResult.alternativeOptions.length} alternatives
                  </span>
                </div>

                {searchResult.alternativeOptions.length === 0 ? (
                  <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200">
                    <Info className="w-5 h-5 text-neutral-400 mx-auto mb-1.5" />
                    <p className="text-xs text-neutral-600 font-medium">
                      Your current selected dates already offer the best estimated rates available for this destination and party size!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResult.alternativeOptions.map((alt) => {
                      const isExpanded = expandedBreakdownId === alt.id;
                      const hasPotentialSavings = (alt.priceDifferenceUSD || 0) > 0;

                      return (
                        <div
                          key={alt.id}
                          className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-purple-300 transition-all shadow-xs space-y-3"
                        >
                          {/* Top Row: Dates, Season, Price */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm sm:text-base font-extrabold text-neutral-900">
                                  {alt.formattedDateRange}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    alt.season === 'Low Season'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : alt.season === 'Holiday Peak'
                                      ? 'bg-rose-100 text-rose-800'
                                      : alt.season === 'Peak / High'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {alt.seasonLabel}
                                </span>

                                {alt.withinBudget && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    Within Stated Budget
                                  </span>
                                )}
                                {alt.closerToBudget && !alt.withinBudget && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    Closer to Budget
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-neutral-500 mt-1 flex flex-wrap items-center gap-3">
                                <span>Flights: ~${alt.flightPriceTotalUSD} USD</span>
                                <span>•</span>
                                <span>Hotel: ~${alt.hotelTotalUSD} USD</span>
                                <span>•</span>
                                <span className="text-neutral-400 text-[11px]">{alt.flightPriceSource}</span>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center sm:items-end justify-between sm:justify-start gap-4">
                              <div className="text-left sm:text-right">
                                <div className="text-xs text-neutral-500 font-medium">Estimated Minimum:</div>
                                <div className="text-base sm:text-lg font-black text-[#2E0249]">
                                  {currentCurrency.symbol}
                                  {alt.totalEstimatedTripCostInCurrency.toLocaleString()}{' '}
                                  <span className="text-xs font-normal text-neutral-500">
                                    ({currentCurrency.code})
                                  </span>
                                </div>
                                {hasPotentialSavings && (
                                  <div className="text-[11px] font-bold text-emerald-700">
                                    Potential difference: ~${alt.priceDifferenceUSD} USD
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => onApplyDates(alt.departureDate, alt.returnDate)}
                                className="px-4 py-2 bg-[#2E0249] hover:bg-[#3b045e] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5 text-[#FFC72C]" />
                                <span>Use These Dates</span>
                              </button>
                            </div>
                          </div>

                          {/* Expandable "Why are these dates different?" (Section 35) */}
                          <div className="pt-2 border-t border-neutral-100">
                            <button
                              type="button"
                              onClick={() => toggleBreakdown(alt.id)}
                              className="text-xs font-bold text-[#2E0249] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Why are these dates different?</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isExpanded && alt.differenceBreakdown && (
                              <div className="mt-2.5 p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-200">
                                <div className="flex justify-between text-neutral-700">
                                  <span>Flight difference:</span>
                                  <span className="font-semibold">
                                    {alt.differenceBreakdown.flightDiffUSD >= 0 ? '-' : '+'}$
                                    {Math.abs(alt.differenceBreakdown.flightDiffUSD)} USD
                                  </span>
                                </div>
                                <div className="flex justify-between text-neutral-700">
                                  <span>Hotel difference:</span>
                                  <span className="font-semibold">
                                    {alt.differenceBreakdown.hotelDiffUSD >= 0 ? '-' : '+'}$
                                    {Math.abs(alt.differenceBreakdown.hotelDiffUSD)} USD
                                  </span>
                                </div>
                                <div className="flex justify-between text-neutral-700">
                                  <span>Seasonal rate adjustment:</span>
                                  <span className="font-semibold">
                                    {alt.differenceBreakdown.seasonalDiffUSD >= 0 ? '-' : '+'}$
                                    {Math.abs(alt.differenceBreakdown.seasonalDiffUSD)} USD
                                  </span>
                                </div>
                                <div className="flex justify-between text-neutral-700">
                                  <span>Other service adjustments:</span>
                                  <span className="font-semibold">
                                    {alt.differenceBreakdown.otherDiffUSD >= 0 ? '-' : '+'}$
                                    {Math.abs(alt.differenceBreakdown.otherDiffUSD)} USD
                                  </span>
                                </div>
                                <div className="flex justify-between pt-1.5 border-t border-neutral-200 font-bold text-neutral-900">
                                  <span>Estimated total potential difference:</span>
                                  <span className={alt.differenceBreakdown.totalDiffUSD >= 0 ? 'text-emerald-700' : 'text-neutral-700'}>
                                    {alt.differenceBreakdown.totalDiffUSD >= 0 ? 'Save ~$' : 'Cost +$'}{Math.abs(alt.differenceBreakdown.totalDiffUSD)} USD
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CALENDAR VIEW: Visual Month Grid (Section 31) */}
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2E0249]" />
                  <span>Estimated Starting Costs by Departure Date</span>
                </h4>
                <div className="text-[11px] text-neutral-500 font-medium">
                  {searchResult.searchedMonth} • Click any date to apply
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {searchResult.calendarDays.map((calDay) => {
                  return (
                    <button
                      key={calDay.date}
                      type="button"
                      onClick={() => {
                        const returnD = formatDateDisplay(calDay.date);
                        // Apply this departure date
                        const [y, m, d] = calDay.date.split('-').map(Number);
                        const dep = new Date(Date.UTC(y, m - 1, d));
                        dep.setUTCDate(dep.getUTCDate() + durationDays);
                        const retStr = dep.toISOString().split('T')[0];
                        onApplyDates(calDay.date, retStr);
                      }}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                        calDay.isCurrentSelected
                          ? 'bg-[#2E0249] text-white border-[#2E0249] shadow-sm ring-2 ring-[#FFC72C]'
                          : calDay.isLowerCostHighlight
                          ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-300 text-neutral-800'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">{calDay.dayOfMonth}</span>
                        {calDay.isCurrentSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#FFC72C]" />
                        )}
                        {!calDay.isCurrentSelected && calDay.isLowerCostHighlight && (
                          <span className="text-[9px] font-black text-emerald-700 uppercase">Save</span>
                        )}
                      </div>

                      <div className="mt-1">
                        {calDay.estimatedStartingCostUSD ? (
                          <div
                            className={`text-[11px] font-black ${
                              calDay.isCurrentSelected ? 'text-[#FFC72C]' : 'text-neutral-900'
                            }`}
                          >
                            From ${calDay.estimatedStartingCostUSD}
                          </div>
                        ) : (
                          <div className="text-[9px] text-neutral-400 font-medium">Quote Req.</div>
                        )}
                        <div
                          className={`text-[8px] truncate ${
                            calDay.isCurrentSelected ? 'text-purple-200' : 'text-neutral-400'
                          }`}
                        >
                          {calDay.season}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-600 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#2E0249]" />
                  <span>Currently Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-300" />
                  <span>Potentially Lower-Cost Dates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-neutral-200" />
                  <span>Standard Schedule</span>
                </div>
              </div>
            </div>
          )}

          {/* Mandatory Disclaimer (Section 45) */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-500 leading-relaxed">
            <strong>Mandatory Rate Disclaimer:</strong> Flight prices and trip budgets are estimates and may change based on availability, carrier airfare, hotel rates, seasonal pricing, taxes, exchange rates, baggage, supplier pricing, and other travel factors. Final pricing will be confirmed by SMELTRAVELS876 before booking.
          </div>
        </div>
      )}
    </div>
  );
};
