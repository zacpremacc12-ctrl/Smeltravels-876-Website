import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  Search,
  Sliders,
  Plane,
  Building2,
  DollarSign,
  TrendingDown,
  Info,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CheapestDateFinderSettings,
  CheapestDateFinderResult,
  DateOptionEvaluation,
} from '../../types';
import { DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS } from '../../data/cheapestDateFinderDefaults';
import { findCheapestDateOptions } from '../../lib/seasonalPricing';

export const CheapestDateFinderManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    showNotification,
    originPricingRoutes,
    serviceCostRules,
    supportedCurrencies,
    departureAirports,
  } = useApp();

  // Settings draft state
  const [config, setConfig] = useState<CheapestDateFinderSettings>(
    settings.cheapestDateFinderSettings || DEFAULT_CHEAPEST_DATE_FINDER_SETTINGS
  );
  const [isSaving, setIsSaving] = useState(false);

  // Skyscanner status check
  const [skyscannerStatus, setSkyscannerStatus] = useState<{
    configured: boolean;
    provider?: string;
    market?: string;
    currency?: string;
    loading: boolean;
  }>({
    configured: false,
    loading: true,
  });

  useEffect(() => {
    fetch('/api/skyscanner/status')
      .then((res) => res.json())
      .then((data) => {
        setSkyscannerStatus({
          configured: !!data.configured,
          provider: data.provider || 'Skyscanner Travel API',
          market: data.market || 'JM',
          currency: data.currency || 'USD',
          loading: false,
        });
      })
      .catch(() => {
        setSkyscannerStatus({ configured: false, loading: false });
      });
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    updateSettings({
      cheapestDateFinderSettings: config,
    });
    setTimeout(() => {
      setIsSaving(false);
      showNotification(
        'Settings Saved',
        'Cheapest Date Finder configuration updated successfully across the platform.'
      );
    }, 400);
  };

  // --- ADMIN TEST MODE (SECTION 41) ---
  const [testOriginAirportCode, setTestOriginAirportCode] = useState('KIN');
  const [testDestinationCountry, setTestDestinationCountry] = useState('Panama');
  const [testDestinationCity, setTestDestinationCity] = useState('Panama City');
  const [testMonth, setTestMonth] = useState('2026-12');
  const [testTripLengthDays, setTestTripLengthDays] = useState(5);
  const [testAdultsCount, setTestAdultsCount] = useState(2);
  const [testChildrenCount, setTestChildrenCount] = useState(0);
  const [testTripStyle, setTestTripStyle] = useState('Standard');
  const [testCabinClass, setTestCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');

  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<CheapestDateFinderResult | null>(null);

  const handleRunAdminTest = async () => {
    setIsTesting(true);
    try {
      const originAirport = departureAirports.find((a) => a.code === testOriginAirportCode);
      const res = await findCheapestDateOptions({
        originCountry: originAirport?.country || 'Jamaica',
        originCity: originAirport?.city || 'Kingston',
        originAirportCode: testOriginAirportCode,
        destinationCountry: testDestinationCountry,
        destinationCity: testDestinationCity,
        flexibilityOption: 'entire_month',
        targetMonth: testMonth,
        durationDays: testTripLengthDays,
        adultsCount: testAdultsCount,
        childrenCount: testChildrenCount,
        travelStyle: testTripStyle,
        cabinClass: testCabinClass,
        routes: originPricingRoutes,
        serviceRules: serviceCostRules,
        currencies: supportedCurrencies,
        selectedCurrencyCode: config.defaultCurrency || 'USD',
        settings: config,
      });
      setTestResults(res);
      showNotification(
        'Date Finder Test Completed',
        `Evaluated ${res.evaluatedCombinationsCount} date combinations across ${testMonth}.`
      );
    } catch (err: any) {
      console.error('[Admin Test Error]:', err);
      showNotification('Test Error', err.message || 'Failed to evaluate date combinations.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8" id="cheapest-date-finder-admin-section">
      {/* SECTION 1: SETTINGS & SKYSCANNER STATUS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#2E0249] text-[#FFC72C] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-[#2E0249]">
                Cheapest Date Finder Configuration
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Configure date search behaviors, algorithm flexibility limits, seasonal multipliers, and flight integration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              id="save-cheapest-date-settings-btn"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Skyscanner & Flight Engine Status Banner */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Plane className="w-5 h-5 text-[#2E0249] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#2E0249] flex items-center gap-2">
                <span>Flight Pricing Integration:</span>
                {skyscannerStatus.loading ? (
                  <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
                    Checking...
                  </span>
                ) : skyscannerStatus.configured ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Skyscanner API Connected
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    Administrator Route Allowances Active (Fallback)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-600 mt-1">
                {skyscannerStatus.configured
                  ? 'Live & indicative flight quotes are proxied securely through the backend without exposing API credentials.'
                  : 'Skyscanner API key not detected in server environment. The system automatically utilizes the SMELTRAVELS876 administrator route pricing engine for flight allowances.'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form Grid (Section 40) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Enable / Disable */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">Feature Status:</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cdf_enabled"
                  checked={config.isEnabled}
                  onChange={() => setConfig((prev) => ({ ...prev, isEnabled: true }))}
                  className="w-4 h-4 text-[#2E0249]"
                />
                <span className="font-bold text-emerald-700">Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cdf_enabled"
                  checked={!config.isEnabled}
                  onChange={() => setConfig((prev) => ({ ...prev, isEnabled: false }))}
                  className="w-4 h-4 text-[#2E0249]"
                />
                <span className="font-bold text-rose-700">Disabled</span>
              </label>
            </div>
            <p className="text-[11px] text-neutral-500">
              When enabled, customers can click "Find Cheaper Travel Dates" in the Trip Planner.
            </p>
          </div>

          {/* Maximum Alternatives Shown */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Max Alternatives Shown:
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={config.maxAlternativesShown}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxAlternativesShown: Math.max(1, parseInt(e.target.value) || 5),
                }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-bold"
            />
            <p className="text-[11px] text-neutral-500">
              Number of top lower-cost date alternatives presented to the traveler (default: 5).
            </p>
          </div>

          {/* Maximum Date Combinations */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Max Combinations Evaluated:
            </label>
            <input
              type="number"
              min={6}
              max={60}
              value={config.maxDateCombinations}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxDateCombinations: Math.max(6, parseInt(e.target.value) || 24),
                }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-bold"
            />
            <p className="text-[11px] text-neutral-500">
              Algorithm search cap for candidate departure dates in a single query (default: 24).
            </p>
          </div>

          {/* Seasonal Pricing Behavior */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Seasonal Pricing Behavior:
            </label>
            <select
              value={config.seasonalPricingBehavior}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  seasonalPricingBehavior: e.target.value as any,
                }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-semibold"
            >
              <option value="automatic">Automatic Seasonal Adjustments</option>
              <option value="manual_override">Manual Override</option>
              <option value="disabled">Disabled (Flat Rates)</option>
            </select>
            <p className="text-[11px] text-neutral-500">
              Applies peak holiday (+38%), high summer (+20%), and shoulder/low (-12%) rates.
            </p>
          </div>

          {/* Hotel Pricing Behavior */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Hotel Pricing Behavior:
            </label>
            <select
              value={config.hotelPricingBehavior}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  hotelPricingBehavior: e.target.value as any,
                }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-semibold"
            >
              <option value="dynamic_seasonal">Dynamic Seasonal Multipliers</option>
              <option value="fixed_flat">Fixed Flat Rate</option>
            </select>
            <p className="text-[11px] text-neutral-500">
              Adjusts resort and hotel night costs depending on calendar demand.
            </p>
          </div>

          {/* Default Currency */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">Default Currency:</label>
            <select
              value={config.defaultCurrency}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, defaultCurrency: e.target.value }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-semibold"
            >
              {supportedCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500">
              Fallback currency for date comparison results.
            </p>
          </div>

          {/* Preferred Airports */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Preferred Hub Airports (comma separated):
            </label>
            <input
              type="text"
              value={(config.preferredAirports || []).join(', ')}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  preferredAirports: e.target.value.split(',').map((s) => s.trim().toUpperCase()),
                }))
              }
              className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-bold"
              placeholder="KIN, MBJ, MIA, FLL, JFK"
            />
            <p className="text-[11px] text-neutral-500">
              Hubs prioritized when searching or generating route estimates.
            </p>
          </div>

          {/* Compare Total Trip Cost */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Compare Total Trip Cost:
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={config.compareTotalTripCost}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, compareTotalTripCost: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[#2E0249]"
              />
              <span className="font-bold text-neutral-700">
                Always evaluate total package (flight + hotel + land)
              </span>
            </label>
            <p className="text-[11px] text-neutral-500">
              Never evaluates airfare in isolation; protects against misleading low-flight/high-hotel combinations.
            </p>
          </div>

          {/* Display Potential Savings */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="font-bold text-neutral-800 block">
              Display Potential Savings:
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={config.displayPotentialSavings}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, displayPotentialSavings: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[#2E0249]"
              />
              <span className="font-bold text-neutral-700">
                Show "Save up to $XXX" callouts
              </span>
            </label>
            <p className="text-[11px] text-neutral-500">
              Renders highlight badges indicating potential savings relative to customer's baseline dates.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TEST CHEAPEST DATE FINDER (SECTION 41) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-black text-neutral-900">
              Test Cheapest Date Finder (Admin Sandbox)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Simulate the customer date exploration engine across any origin, destination, season, and party size.
          </p>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Origin Airport:</label>
            <select
              value={testOriginAirportCode}
              onChange={(e) => setTestOriginAirportCode(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            >
              {departureAirports.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.code} ({a.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Destination Country:</label>
            <input
              type="text"
              value={testDestinationCountry}
              onChange={(e) => setTestDestinationCountry(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Month to Test:</label>
            <select
              value={testMonth}
              onChange={(e) => setTestMonth(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            >
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026 (Summer Peak)</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026 (Low Season)</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026 (Festive Peak)</option>
              <option value="2027-01">January 2027</option>
              <option value="2027-02">February 2027</option>
              <option value="2027-03">March 2027 (Spring Break)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Trip Length:</label>
            <select
              value={testTripLengthDays}
              onChange={(e) => setTestTripLengthDays(parseInt(e.target.value))}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            >
              {[3, 4, 5, 7, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d} Days ({d - 1} Nights)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Travelers:</label>
            <select
              value={testAdultsCount}
              onChange={(e) => setTestAdultsCount(parseInt(e.target.value))}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            >
              {[1, 2, 3, 4, 6, 8].map((num) => (
                <option key={num} value={num}>
                  {num} Adult{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Trip Style:</label>
            <select
              value={testTripStyle}
              onChange={(e) => setTestTripStyle(e.target.value)}
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg font-semibold"
            >
              <option value="Standard">Standard</option>
              <option value="Comfort / Balanced">Comfort / Balanced</option>
              <option value="Luxury">Luxury</option>
              <option value="Budget / Explorer">Budget / Explorer</option>
              <option value="Ultra-Luxury / VIP">VIP</option>
            </select>
          </div>
        </div>

        {/* Run Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRunAdminTest}
            disabled={isTesting}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            id="btn-admin-find-dates"
          >
            <Search className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Evaluating Dates...' : 'Find Dates'}</span>
          </button>
        </div>

        {/* Results Section */}
        {testResults && (
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            {/* Highlights comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  Lowest Estimated Total Trip Budget
                </span>
                <div className="text-base font-black text-emerald-950 mt-1.5">
                  {testResults.lowestTotalTripOption?.formattedDateRange}
                </div>
                <div className="text-xs font-bold text-emerald-800 mt-0.5">
                  Total Trip Cost: ${testResults.lowestTotalTripOption?.totalEstimatedTripCostUSD} USD (
                  {testResults.lowestTotalTripOption?.seasonLabel})
                </div>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[10px] font-black uppercase text-[#2E0249] bg-purple-200/80 px-2 py-0.5 rounded-full">
                  Lowest Estimated Flight Price
                </span>
                <div className="text-base font-black text-[#2E0249] mt-1.5">
                  {testResults.lowestFlightOption?.formattedDateRange}
                </div>
                <div className="text-xs font-bold text-purple-900 mt-0.5">
                  Flight Total: ${testResults.lowestFlightOption?.flightPriceTotalUSD} USD (
                  {testResults.lowestFlightOption?.flightPriceSource})
                </div>
              </div>
            </div>

            {/* Evaluation Table (Section 41) */}
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-2.5">Date Range</th>
                    <th className="p-2.5">Season</th>
                    <th className="p-2.5 text-right">Flight Est.</th>
                    <th className="p-2.5 text-right">Hotel Est.</th>
                    <th className="p-2.5 text-right">Other Services</th>
                    <th className="p-2.5 text-right">Seasonal Adj.</th>
                    <th className="p-2.5 text-right">Estimated Total</th>
                    <th className="p-2.5">Pricing Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {/* Baseline row */}
                  {testResults.selectedDatesOption && (
                    <tr className="bg-neutral-50/90 font-bold">
                      <td className="p-2.5">
                        <span className="text-[#2E0249]">
                          {testResults.selectedDatesOption.formattedDateRange}
                        </span>
                        <span className="ml-1.5 text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded-full">
                          Baseline
                        </span>
                      </td>
                      <td className="p-2.5">{testResults.selectedDatesOption.seasonLabel}</td>
                      <td className="p-2.5 text-right">
                        ${testResults.selectedDatesOption.flightPriceTotalUSD}
                      </td>
                      <td className="p-2.5 text-right">
                        ${testResults.selectedDatesOption.hotelTotalUSD}
                      </td>
                      <td className="p-2.5 text-right">
                        $
                        {testResults.selectedDatesOption.mealsTotalUSD +
                          testResults.selectedDatesOption.transfersTotalUSD +
                          testResults.selectedDatesOption.excursionsTotalUSD +
                          testResults.selectedDatesOption.taxesAndFeesTotalUSD}
                      </td>
                      <td className="p-2.5 text-right">
                        ${testResults.selectedDatesOption.seasonalAdjustmentUSD}
                      </td>
                      <td className="p-2.5 text-right font-black text-neutral-900">
                        ${testResults.selectedDatesOption.totalEstimatedTripCostUSD} USD
                      </td>
                      <td className="p-2.5 text-neutral-500 text-[11px]">
                        {testResults.selectedDatesOption.flightPriceSource}
                      </td>
                    </tr>
                  )}

                  {/* Alternative candidate rows */}
                  {testResults.alternativeOptions.map((opt) => {
                    const otherServices =
                      opt.mealsTotalUSD +
                      opt.transfersTotalUSD +
                      opt.excursionsTotalUSD +
                      opt.taxesAndFeesTotalUSD;

                    return (
                      <tr
                        key={opt.id}
                        className={`hover:bg-neutral-50/80 ${
                          opt.isLowestTotalTrip ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span>{opt.formattedDateRange}</span>
                            {opt.isLowestTotalTrip && (
                              <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                                Lowest Total
                              </span>
                            )}
                            {opt.isLowestFlight && (
                              <span className="text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                                Lowest Flight
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              opt.season === 'Low Season'
                                ? 'bg-emerald-100 text-emerald-800'
                                : opt.season === 'Holiday Peak'
                                ? 'bg-rose-100 text-rose-800'
                                : opt.season === 'Peak / High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {opt.seasonLabel}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">${opt.flightPriceTotalUSD}</td>
                        <td className="p-2.5 text-right">${opt.hotelTotalUSD}</td>
                        <td className="p-2.5 text-right">${otherServices}</td>
                        <td className="p-2.5 text-right font-mono">
                          {opt.seasonalAdjustmentUSD >= 0 ? '+' : ''}${opt.seasonalAdjustmentUSD}
                        </td>
                        <td className="p-2.5 text-right font-black text-neutral-900">
                          ${opt.totalEstimatedTripCostUSD} USD
                        </td>
                        <td className="p-2.5 text-neutral-500 text-[11px]">{opt.flightPriceSource}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
