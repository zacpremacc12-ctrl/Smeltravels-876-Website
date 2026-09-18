import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AirportRecord,
  OriginPricingRoute,
  ServiceCostRules,
  CurrencyRecord,
  CabinClassType,
} from '../../types';
import {
  calculateTripBudget,
  PricingEngineInput,
} from '../../lib/pricingEngine';
import {
  Plane,
  MapPin,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Search,
  DollarSign,
  AlertCircle,
  Building2,
  Luggage,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  Calendar,
  Users,
  Percent,
} from 'lucide-react';

export const OriginPricingManager: React.FC = () => {
  const {
    departureAirports,
    addDepartureAirport,
    updateDepartureAirport,
    deleteDepartureAirport,
    originPricingRoutes,
    addOriginPricingRoute,
    updateOriginPricingRoute,
    deleteOriginPricingRoute,
    serviceCostRules,
    updateServiceCostRules,
    resetServiceCostRules,
    supportedCurrencies,
    addSupportedCurrency,
    updateSupportedCurrency,
    deleteSupportedCurrency,
    resetOriginPricingData,
    showNotification,
  } = useApp();

  // Active sub-tab inside Origin & Route Pricing
  const [subTab, setSubTab] = useState<'airports' | 'routes' | 'land-costs' | 'currencies' | 'simulator'>('routes');

  // Search & Filter States
  const [airportSearch, setAirportSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [routeOriginFilter, setRouteOriginFilter] = useState('All');

  // Modal States
  const [isAddAirportModalOpen, setIsAddAirportModalOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<AirportRecord | null>(null);

  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<OriginPricingRoute | null>(null);

  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyRecord | null>(null);

  // Forms
  const [airportForm, setAirportForm] = useState<Omit<AirportRecord, 'id'>>({
    country: 'Jamaica',
    city: 'Kingston',
    code: 'KIN',
    name: 'Norman Manley International Airport',
    isMajorHub: true,
  });

  const [routeForm, setRouteForm] = useState<Omit<OriginPricingRoute, 'id'>>({
    originCountry: 'Jamaica',
    originCity: 'Kingston',
    originAirportCode: 'KIN',
    destinationCountry: 'Colombia',
    destinationCity: 'All Cities',
    destinationAirportCode: 'ALL',
    estimatedRoundtripUSD: 580,
    checkedBagFeeUSD: 45,
    carryOnIncluded: true,
    cabinClassMultipliers: {
      Economy: 1.0,
      PremiumEconomy: 1.35,
      Business: 2.2,
      First: 3.2,
    },
    seasonalMultiplier: 1.2,
    isActive: true,
    notes: 'Direct or 1-stop via PTY/MIA typical airfare.',
  });

  const [currencyForm, setCurrencyForm] = useState<CurrencyRecord>({
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    rateFromUSD: 1.52,
  });

  // Land Costs Edit State
  const [serviceRulesDraft, setServiceRulesDraft] = useState<ServiceCostRules>(serviceCostRules);
  const [hasUnsavedServiceRules, setHasUnsavedServiceRules] = useState(false);

  const handleServiceRulesChange = (updated: Partial<ServiceCostRules>) => {
    setServiceRulesDraft(prev => ({
      ...prev,
      ...updated,
      accommodationPerNight: { ...prev.accommodationPerNight, ...(updated.accommodationPerNight || {}) },
      mealsPerPersonPerDay: { ...prev.mealsPerPersonPerDay, ...(updated.mealsPerPersonPerDay || {}) },
      excursionsAllowancePerPerson: { ...prev.excursionsAllowancePerPerson, ...(updated.excursionsAllowancePerPerson || {}) },
    }));
    setHasUnsavedServiceRules(true);
  };

  const handleSaveServiceRules = () => {
    updateServiceCostRules(serviceRulesDraft);
    setHasUnsavedServiceRules(false);
  };

  // Simulator State
  const [simOriginAirport, setSimOriginAirport] = useState<string>('KIN');
  const [simDestination, setSimDestination] = useState<string>('Colombia');
  const [simAdults, setSimAdults] = useState<number>(2);
  const [simChildren, setSimChildren] = useState<number>(0);
  const [simDays, setSimDays] = useState<number>(6);
  const [simStyle, setSimStyle] = useState<string>('Premium');
  const [simCabin, setSimCabin] = useState<CabinClassType>('Economy');
  const [simCurrency, setSimCurrency] = useState<string>('USD');
  const [simIncludeFlights, setSimIncludeFlights] = useState<boolean>(true);

  // Filtered Lists
  const filteredAirports = useMemo(() => {
    return departureAirports.filter(a => {
      const q = airportSearch.toLowerCase();
      return (
        !q ||
        a.country.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
      );
    });
  }, [departureAirports, airportSearch]);

  const filteredRoutes = useMemo(() => {
    return originPricingRoutes.filter(r => {
      const q = routeSearch.toLowerCase();
      const matchesSearch =
        !q ||
        r.originCountry.toLowerCase().includes(q) ||
        r.originCity.toLowerCase().includes(q) ||
        r.originAirportCode.toLowerCase().includes(q) ||
        r.destinationCountry.toLowerCase().includes(q) ||
        (r.destinationCity && r.destinationCity.toLowerCase().includes(q));

      const matchesOrigin =
        routeOriginFilter === 'All' ||
        r.originCountry === routeOriginFilter ||
        r.originAirportCode === routeOriginFilter;

      return matchesSearch && matchesOrigin;
    });
  }, [originPricingRoutes, routeSearch, routeOriginFilter]);

  const distinctCountries = useMemo(() => {
    return Array.from(new Set(departureAirports.map(a => a.country))).sort();
  }, [departureAirports]);

  // Simulator calculation
  const simResult = useMemo(() => {
    const airport = departureAirports.find(a => a.code === simOriginAirport) || departureAirports[0];
    const services = ['Hotel / Resort Stay', 'Airport Private Transfers', 'Curated Tours & Sightseeing'];
    if (simIncludeFlights) services.unshift('Roundtrip Flights');

    const input: PricingEngineInput = {
      originCountry: airport?.country || 'Jamaica',
      originCity: airport?.city || 'Kingston',
      originAirportCode: airport?.code || 'KIN',
      destinationCountry: simDestination,
      destinationCity: 'All Cities',
      durationDays: simDays,
      adultsCount: simAdults,
      childrenCount: simChildren,
      travelStyle: simStyle,
      cabinClass: simCabin,
      selectedServices: services,
      routes: originPricingRoutes,
      serviceRules: serviceCostRules,
      selectedCurrencyCode: simCurrency,
      currencies: supportedCurrencies,
    };

    return calculateTripBudget(input);
  }, [
    simOriginAirport,
    simDestination,
    simAdults,
    simChildren,
    simDays,
    simStyle,
    simCabin,
    simCurrency,
    simIncludeFlights,
    departureAirports,
    originPricingRoutes,
    serviceCostRules,
    supportedCurrencies,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#2E0249] via-[#4A0E4E] to-[#2E0249] text-white rounded-3xl p-6 shadow-md border border-purple-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center shrink-0 shadow-lg font-black">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif]">
                  Origin & Route Pricing Engine
                </h2>
                <span className="bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Admin Managed
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-3xl">
                SMELTRAVELS876 dynamically prices custom trips based on where the customer is traveling from.
                Configure departure hubs (airports), origin-to-destination flight allowances, land service baselines, and currency exchange rates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (window.confirm('Reset all origin airports, route allowances, and cost baselines to initial defaults?')) {
                  resetOriginPricingData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer"
              title="Restore initial airport hubs and route baseline pricing"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Baselines</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-purple-800/60 overflow-x-auto">
          {[
            { id: 'routes', label: 'Route Flight Allowances', count: originPricingRoutes.length, icon: Plane },
            { id: 'airports', label: 'Departure Hubs & Airports', count: departureAirports.length, icon: MapPin },
            { id: 'land-costs', label: 'Land & Service Costs', icon: Building2 },
            { id: 'currencies', label: 'Currency Rates', count: supportedCurrencies.length, icon: DollarSign },
            { id: 'simulator', label: 'Pricing Simulator', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC72C] text-[#2E0249] shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/15 text-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-[#2E0249] text-[#FFC72C]' : 'bg-black/30 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: ROUTE FLIGHT ALLOWANCES */}
      {subTab === 'routes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search routes or cities..."
                  value={routeSearch}
                  onChange={e => setRouteSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-[#2E0249]"
                />
              </div>

              <select
                value={routeOriginFilter}
                onChange={e => setRouteOriginFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-neutral-300 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-[#2E0249]"
              >
                <option value="All">All Origin Hubs</option>
                {distinctCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setRouteForm({
                  originCountry: departureAirports[0]?.country || 'Jamaica',
                  originCity: departureAirports[0]?.city || 'Kingston',
                  originAirportCode: departureAirports[0]?.code || 'KIN',
                  destinationCountry: 'Colombia',
                  destinationCity: 'All Cities',
                  destinationAirportCode: 'ALL',
                  estimatedRoundtripUSD: 550,
                  checkedBagFeeUSD: 45,
                  carryOnIncluded: true,
                  cabinClassMultipliers: {
                    Economy: 1.0,
                    PremiumEconomy: 1.35,
                    Business: 2.2,
                    First: 3.2,
                  },
                  seasonalMultiplier: 1.2,
                  isActive: true,
                  notes: 'Direct or 1-stop typical flight allowance.',
                });
                setIsAddRouteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Route Flight Allowance</span>
            </button>
          </div>

          {/* Routes Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="p-3">Origin Hub</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Base Roundtrip (USD)</th>
                    <th className="p-3">Cabin Multipliers</th>
                    <th className="p-3">Baggage Fee</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        No route pricing rules found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRoutes.map(route => (
                      <tr key={route.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono font-black text-[11px]">
                              {route.originAirportCode}
                            </span>
                            <span>{route.originCity}, {route.originCountry}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-neutral-400" />
                            <span>{route.destinationCountry}</span>
                            {route.destinationCity && route.destinationCity !== 'All Cities' && (
                              <span className="text-neutral-500 font-normal">({route.destinationCity})</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#2E0249] text-sm">
                          ${route.estimatedRoundtripUSD.toLocaleString()} USD
                        </td>
                        <td className="p-3">
                          <div className="text-[11px] text-neutral-600 space-y-0.5">
                            <div>Prem Econ: <strong>{route.cabinClassMultipliers?.PremiumEconomy || 1.35}x</strong></div>
                            <div>Biz: <strong>{route.cabinClassMultipliers?.Business || 2.2}x</strong> | First: <strong>{route.cabinClassMultipliers?.First || 3.2}x</strong></div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-neutral-700">
                          ${route.checkedBagFeeUSD || 0} USD
                          <div className="text-[10px] text-emerald-700 font-bold">
                            {route.carryOnIncluded ? '✓ Carry-on inc.' : 'Personal item only'}
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => updateOriginPricingRoute(route.id, { isActive: !route.isActive })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                              route.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                            }`}
                          >
                            {route.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingRoute(route);
                                setRouteForm({ ...route });
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-[#2E0249] transition-colors"
                              title="Edit Route"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete route ${route.originAirportCode} → ${route.destinationCountry}?`)) {
                                  deleteOriginPricingRoute(route.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                              title="Delete Route"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DEPARTURE HUBS & AIRPORTS */}
      {subTab === 'airports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country, city, or IATA code..."
                value={airportSearch}
                onChange={e => setAirportSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-[#2E0249]"
              />
            </div>

            <button
              onClick={() => {
                setAirportForm({
                  country: 'Jamaica',
                  city: 'Kingston',
                  code: '',
                  name: '',
                  isMajorHub: true,
                });
                setIsAddAirportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Departure Airport</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAirports.map(airport => (
              <div
                key={airport.id}
                className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs hover:shadow-md transition-all relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#2E0249] border border-purple-200 flex items-center justify-center font-mono font-black text-sm shrink-0">
                    {airport.code}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingAirport(airport);
                        setAirportForm({ ...airport });
                      }}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[#2E0249]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete airport ${airport.code} (${airport.city})?`)) {
                          deleteDepartureAirport(airport.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-rose-50 text-neutral-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-bold text-sm text-neutral-900 leading-tight">
                    {airport.city}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {airport.country}
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-1 line-clamp-1" title={airport.name}>
                    {airport.name}
                  </div>
                </div>

                {airport.isMajorHub && (
                  <span className="mt-3 inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    Major Hub
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LAND & SERVICE COSTS */}
      {subTab === 'land-costs' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Land Service Cost Rules & Allowances
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                These base rates determine the land portion of the estimated minimum trip budget (hotels, meals, transfers, excursions, and taxes).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset service cost baselines to initial standards?')) {
                    resetServiceCostRules();
                    setServiceRulesDraft(serviceCostRules);
                    setHasUnsavedServiceRules(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                onClick={handleSaveServiceRules}
                disabled={!hasUnsavedServiceRules}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasUnsavedServiceRules
                    ? 'bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] shadow-md scale-102'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Cost Rules</span>
              </button>
            </div>
          </div>

          {/* Section 1: Hotel Base Rates Per Night */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2E0249]" />
              <span>Hotel Base Rate Per Night (USD / Room) by Travel Style</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(['Budget', 'Standard', 'Premium', 'Luxury', 'VIP'] as const).map(tier => (
                <div key={tier} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{tier}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      min={10}
                      value={serviceRulesDraft.accommodationPerNight[tier]}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        handleServiceRulesChange({
                          accommodationPerNight: {
                            ...serviceRulesDraft.accommodationPerNight,
                            [tier]: val,
                          },
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#2E0249]"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block">per night</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Daily Meal Allowances */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2E0249]" />
              <span>Meal Allowance Per Person / Day (USD)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(['Budget', 'Standard', 'Premium', 'Luxury', 'VIP'] as const).map(tier => (
                <div key={tier} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{tier}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      min={5}
                      value={serviceRulesDraft.mealsPerPersonPerDay[tier]}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        handleServiceRulesChange({
                          mealsPerPersonPerDay: {
                            ...serviceRulesDraft.mealsPerPersonPerDay,
                            [tier]: val,
                          },
                        });
                      }}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#2E0249]"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 block">per person / day</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Transfers & Activity Allowances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Airport Private Transfers (Roundtrip USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={serviceRulesDraft.airportTransfersRoundtrip}
                  onChange={e => handleServiceRulesChange({ airportTransfersRoundtrip: Number(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#2E0249]"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Covers vehicle pickup & drop-off for the group.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Travel Document & Visa Help Fee (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={serviceRulesDraft.travelDocumentsFee}
                  onChange={e => handleServiceRulesChange({ travelDocumentsFee: Number(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#2E0249]"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Optional document guidance and visa assistance flat rate.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                Taxes, Service & Tourism Fees (%)
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">%</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={serviceRulesDraft.taxesAndFeesPercentage}
                  onChange={e => handleServiceRulesChange({ taxesAndFeesPercentage: Number(e.target.value) || 0 })}
                  className="w-full pl-3 pr-7 py-2 text-xs font-bold border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#2E0249]"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Local hotel city taxes, service charges, and regulatory fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SUPPORTED CURRENCIES */}
      {subTab === 'currencies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Supported Currencies & FX Rates
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                All base rates are stored in USD. Customer budgets are dynamically converted at these exchange rates.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrencyForm({
                  code: '',
                  name: '',
                  symbol: '',
                  rateFromUSD: 1.0,
                });
                setIsAddCurrencyModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Currency</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {supportedCurrencies.map(curr => (
              <div
                key={curr.code}
                className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs hover:shadow-md transition-all space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-lg text-[#2E0249]">
                    {curr.code}
                  </span>
                  <span className="text-sm font-bold text-neutral-500">
                    {curr.symbol}
                  </span>
                </div>

                <div className="text-xs text-neutral-700 font-semibold truncate">
                  {curr.name}
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-baseline justify-between text-xs">
                  <span className="text-neutral-500 text-[11px]">1 USD =</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {curr.rateFromUSD} {curr.code}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingCurrency(curr);
                      setCurrencyForm({ ...curr });
                    }}
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[#2E0249]"
                    title="Edit Rate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {curr.code !== 'USD' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove currency ${curr.code}?`)) {
                          deleteSupportedCurrency(curr.code);
                        }
                      }}
                      className="p-1 rounded hover:bg-rose-50 text-neutral-400 hover:text-rose-600"
                      title="Remove Currency"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LIVE PRICING SIMULATOR */}
      {subTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2E0249]" />
                <span>Test Pricing Engine Parameters</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Simulate customer selections to verify that departure routes, policies, and currency conversions function accurately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Where is traveler departing from?
              </label>
              <select
                value={simOriginAirport}
                onChange={e => setSimOriginAirport(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-[#2E0249] outline-none"
              >
                {departureAirports.map(a => (
                  <option key={a.id} value={a.code}>
                    {a.country} → {a.city} ({a.code}) - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Destination Country:
              </label>
              <select
                value={simDestination}
                onChange={e => setSimDestination(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-[#2E0249] outline-none"
              >
                <option value="Colombia">Colombia</option>
                <option value="Panama">Panama</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Peru">Peru</option>
                <option value="Thailand">Thailand</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="United Arab Emirates">United Arab Emirates (Dubai)</option>
                <option value="South Africa">South Africa</option>
                <option value="Australia">Australia (Unconfigured route test)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Adults:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={simAdults}
                  onChange={e => setSimAdults(Number(e.target.value) || 1)}
                  className="w-full py-2 px-3 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Duration (Days):</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={simDays}
                  onChange={e => setSimDays(Number(e.target.value) || 1)}
                  className="w-full py-2 px-3 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Style Tier:</label>
                <select
                  value={simStyle}
                  onChange={e => setSimStyle(e.target.value)}
                  className="w-full py-2 px-2 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 outline-none"
                >
                  <option value="Budget">Budget</option>
                  <option value="Standard">Standard (3-Star)</option>
                  <option value="Premium">Premium (4-Star)</option>
                  <option value="Luxury">Luxury (5-Star)</option>
                  <option value="VIP">VIP Ultra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Cabin Class:</label>
                <select
                  value={simCabin}
                  onChange={e => setSimCabin(e.target.value as any)}
                  className="w-full py-2 px-2 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Currency:</label>
                <select
                  value={simCurrency}
                  onChange={e => setSimCurrency(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-semibold border border-neutral-300 rounded-xl bg-neutral-50 outline-none"
                >
                  {supportedCurrencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="sim-flights-check"
                  checked={simIncludeFlights}
                  onChange={e => setSimIncludeFlights(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249]"
                />
                <label htmlFor="sim-flights-check" className="text-xs font-bold text-neutral-700 cursor-pointer">
                  Include Flights
                </label>
              </div>
            </div>
          </div>

          {/* Engine Output & Live Breakdown */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                  Pricing Calculation Engine
                </span>
                <h3 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Estimated Minimum Trip Budget
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">Total Group Estimate</span>
                <span className="text-2xl font-black text-[#2E0249] font-mono">
                  {simResult.currency.symbol}{simResult.minimumBudgetInCurrency.toLocaleString()} {simResult.currency.code}
                </span>
                {simResult.currency.code !== 'USD' && (
                  <span className="text-[11px] text-neutral-500 font-mono block">
                    (≈ ${simResult.minimumBudgetUSD.toLocaleString()} USD)
                  </span>
                )}
              </div>
            </div>

            {/* Flight Status Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
              simResult.flightPricingStatus === 'Estimated'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : simResult.flightPricingStatus === 'Manual Flight Pricing Required'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-neutral-50 border-neutral-200 text-neutral-700'
            }`}>
              <Plane className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Flight Pricing Status: {simResult.flightPricingStatus}
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  {simResult.flightNotice}
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-2xl border border-neutral-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Cost Component</th>
                    <th className="p-3 text-right">Per Person ({simResult.currency.code})</th>
                    <th className="p-3 text-right">Group Total ({simResult.currency.code})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 font-sans font-semibold text-neutral-900 flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-purple-700" />
                      <span>Estimated Flights ({simCabin})</span>
                    </td>
                    <td className="p-3 text-right">
                      {simResult.flightPricingStatus === 'Estimated'
                        ? `${simResult.currency.symbol}${Math.round(simResult.breakdownInCurrency.flightCost / simResult.totalTravelers).toLocaleString()}`
                        : 'Custom Quote'}
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {simResult.flightPricingStatus === 'Estimated'
                        ? `${simResult.currency.symbol}${simResult.breakdownInCurrency.flightCost.toLocaleString()}`
                        : 'Custom Quote'}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-semibold text-neutral-900 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-purple-700" />
                      <span>Estimated Accommodation ({simDays} Days, {simResult.roomsCount} Room)</span>
                    </td>
                    <td className="p-3 text-right">
                      {simResult.currency.symbol}{Math.round(simResult.breakdownInCurrency.accommodation / simResult.totalTravelers).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {simResult.currency.symbol}{simResult.breakdownInCurrency.accommodation.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-semibold text-neutral-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-700" />
                      <span>Private Airport Transfers</span>
                    </td>
                    <td className="p-3 text-right">
                      {simResult.currency.symbol}{Math.round(simResult.breakdownInCurrency.transfers / simResult.totalTravelers).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {simResult.currency.symbol}{simResult.breakdownInCurrency.transfers.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-semibold text-neutral-900 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                      <span>Activities & Sightseeing Allowance</span>
                    </td>
                    <td className="p-3 text-right">
                      {simResult.currency.symbol}{Math.round(simResult.breakdownInCurrency.excursions / simResult.totalTravelers).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {simResult.currency.symbol}{simResult.breakdownInCurrency.excursions.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-sans font-semibold text-neutral-900 flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-purple-700" />
                      <span>Taxes & Service Fees</span>
                    </td>
                    <td className="p-3 text-right">
                      {simResult.currency.symbol}{Math.round(simResult.breakdownInCurrency.taxesAndFees / simResult.totalTravelers).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      {simResult.currency.symbol}{simResult.breakdownInCurrency.taxesAndFees.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Policy Rules Floor notice */}
            {simResult.policyRulesApplied.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-[#2E0249] space-y-1">
                <span className="font-bold">Policy Floor Applied:</span>
                <ul className="text-[11px] text-purple-900 list-disc list-inside">
                  {simResult.policyRulesApplied.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ROUTE */}
      {(isAddRouteModalOpen || editingRoute) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingRoute ? 'Edit Route Flight Allowance' : 'Add Route Flight Allowance'}
              </h3>
              <button
                onClick={() => {
                  setIsAddRouteModalOpen(false);
                  setEditingRoute(null);
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (editingRoute) {
                  updateOriginPricingRoute(editingRoute.id, routeForm);
                } else {
                  addOriginPricingRoute(routeForm);
                }
                setIsAddRouteModalOpen(false);
                setEditingRoute(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Origin Departure Airport / Hub:</label>
                <select
                  value={routeForm.originAirportCode}
                  onChange={e => {
                    const found = departureAirports.find(a => a.code === e.target.value);
                    if (found) {
                      setRouteForm(prev => ({
                        ...prev,
                        originCountry: found.country,
                        originCity: found.city,
                        originAirportCode: found.code,
                      }));
                    }
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-xl bg-neutral-50 font-semibold"
                >
                  {departureAirports.map(a => (
                    <option key={a.id} value={a.code}>
                      {a.country} → {a.city} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Destination Country:</label>
                  <input
                    type="text"
                    required
                    value={routeForm.destinationCountry}
                    onChange={e => setRouteForm(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                    placeholder="e.g. Colombia"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City or 'All Cities':</label>
                  <input
                    type="text"
                    value={routeForm.destinationCity}
                    onChange={e => setRouteForm(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                    placeholder="e.g. Bogotá or All Cities"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Base Roundtrip (USD):</label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={routeForm.estimatedRoundtripUSD}
                    onChange={e => setRouteForm(prev => ({ ...prev, estimatedRoundtripUSD: Number(e.target.value) || 0 }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Checked Bag Fee (USD):</label>
                  <input
                    type="number"
                    min={0}
                    value={routeForm.checkedBagFeeUSD}
                    onChange={e => setRouteForm(prev => ({ ...prev, checkedBagFeeUSD: Number(e.target.value) || 0 }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>

              {/* Cabin Multipliers */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 block">Cabin Class Multipliers (relative to Economy):</span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <label className="text-neutral-500 block">Prem. Economy</label>
                    <input
                      type="number"
                      step={0.05}
                      value={routeForm.cabinClassMultipliers?.PremiumEconomy}
                      onChange={e => setRouteForm(prev => ({
                        ...prev,
                        cabinClassMultipliers: {
                          ...prev.cabinClassMultipliers!,
                          PremiumEconomy: Number(e.target.value) || 1.35,
                        },
                      }))}
                      className="w-full p-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 block">Business</label>
                    <input
                      type="number"
                      step={0.05}
                      value={routeForm.cabinClassMultipliers?.Business}
                      onChange={e => setRouteForm(prev => ({
                        ...prev,
                        cabinClassMultipliers: {
                          ...prev.cabinClassMultipliers!,
                          Business: Number(e.target.value) || 2.2,
                        },
                      }))}
                      className="w-full p-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 block">First Class</label>
                    <input
                      type="number"
                      step={0.05}
                      value={routeForm.cabinClassMultipliers?.First}
                      onChange={e => setRouteForm(prev => ({
                        ...prev,
                        cabinClassMultipliers: {
                          ...prev.cabinClassMultipliers!,
                          First: Number(e.target.value) || 3.2,
                        },
                      }))}
                      className="w-full p-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={routeForm.isActive}
                    onChange={e => setRouteForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2E0249]"
                  />
                  <span>Active Route</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddRouteModalOpen(false);
                      setEditingRoute(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] font-bold"
                  >
                    {editingRoute ? 'Save Changes' : 'Create Route'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT AIRPORT */}
      {(isAddAirportModalOpen || editingAirport) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingAirport ? 'Edit Departure Airport' : 'Add Departure Airport'}
              </h3>
              <button
                onClick={() => {
                  setIsAddAirportModalOpen(false);
                  setEditingAirport(null);
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!airportForm.code.trim() || !airportForm.city.trim()) return;
                const formatted = {
                  ...airportForm,
                  code: airportForm.code.trim().toUpperCase(),
                };
                if (editingAirport) {
                  updateDepartureAirport(editingAirport.id, formatted);
                } else {
                  addDepartureAirport(formatted);
                }
                setIsAddAirportModalOpen(false);
                setEditingAirport(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Country:</label>
                <input
                  type="text"
                  required
                  value={airportForm.country}
                  onChange={e => setAirportForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                  placeholder="e.g. Jamaica, United States, Canada"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City:</label>
                  <input
                    type="text"
                    required
                    value={airportForm.city}
                    onChange={e => setAirportForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                    placeholder="e.g. Montego Bay"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">IATA Code (3 letters):</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={airportForm.code}
                    onChange={e => setAirportForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-mono font-black uppercase"
                    placeholder="e.g. MBJ"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Airport Name:</label>
                <input
                  type="text"
                  required
                  value={airportForm.name}
                  onChange={e => setAirportForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                  placeholder="e.g. Sangster International Airport"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={airportForm.isMajorHub}
                    onChange={e => setAirportForm(prev => ({ ...prev, isMajorHub: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2E0249]"
                  />
                  <span>Major Hub</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddAirportModalOpen(false);
                      setEditingAirport(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] font-bold"
                  >
                    {editingAirport ? 'Save Changes' : 'Add Airport'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CURRENCY */}
      {(isAddCurrencyModalOpen || editingCurrency) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingCurrency ? 'Edit Currency Rate' : 'Add Supported Currency'}
              </h3>
              <button
                onClick={() => {
                  setIsAddCurrencyModalOpen(false);
                  setEditingCurrency(null);
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const code = currencyForm.code.trim().toUpperCase();
                if (!code) return;
                const formatted = { ...currencyForm, code };
                if (editingCurrency) {
                  updateSupportedCurrency(editingCurrency.code, formatted);
                } else {
                  addSupportedCurrency(formatted);
                }
                setIsAddCurrencyModalOpen(false);
                setEditingCurrency(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Currency Code (3 letters):</label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  disabled={!!editingCurrency}
                  value={currencyForm.code}
                  onChange={e => setCurrencyForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-mono font-black uppercase"
                  placeholder="e.g. AUD, TTD, BBD"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Currency Name:</label>
                <input
                  type="text"
                  required
                  value={currencyForm.name}
                  onChange={e => setCurrencyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-semibold"
                  placeholder="e.g. Trinidad and Tobago Dollar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Symbol:</label>
                  <input
                    type="text"
                    value={currencyForm.symbol}
                    onChange={e => setCurrencyForm(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-bold"
                    placeholder="e.g. TT$, $, £"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rate from 1 USD:</label>
                  <input
                    type="number"
                    step={0.0001}
                    min={0.0001}
                    required
                    value={currencyForm.rateFromUSD}
                    onChange={e => setCurrencyForm(prev => ({ ...prev, rateFromUSD: Number(e.target.value) || 1 }))}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white font-bold"
                    placeholder="e.g. 155.0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCurrencyModalOpen(false);
                    setEditingCurrency(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] font-bold"
                >
                  {editingCurrency ? 'Save Changes' : 'Add Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
