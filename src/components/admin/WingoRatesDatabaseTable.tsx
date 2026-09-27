import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WingoRouteRate } from '../../types';
import {
  INITIAL_WINGO_SUPPORTED_COUNTRIES,
} from '../../data/initialWingoRates';
import {
  verifyFlightRouteAndPrice,
  normalizeCountryName,
  isWingoSupportedCountry,
  WingoEngineResponse,
} from '../../lib/wingoFlightEngine';
import {
  Plane,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  DollarSign,
  AlertCircle,
  Copy,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const WingoRatesDatabaseTable: React.FC = () => {
  const {
    wingoRoutes,
    addWingoRoute,
    updateWingoRoute,
    deleteWingoRoute,
    batchUpdateWingoRoutes,
    saveWingoRoutesToLive,
    resetWingoRoutesToDefault,
    showNotification,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [originCountryFilter, setOriginCountryFilter] = useState('All');
  const [destCountryFilter, setDestCountryFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState<'All' | 'USD' | 'COP'>('All');
  const [routeTypeFilter, setRouteTypeFilter] = useState<'All' | 'domestic' | 'international'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof WingoRouteRate>('originCountry');
  const [sortAsc, setSortAsc] = useState(true);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active cell inline editing state
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof WingoRouteRate;
  } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRouteModal, setEditingRouteModal] = useState<WingoRouteRate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState<number>(5);
  const [bulkFieldTarget, setBulkFieldTarget] = useState<'baseFares' | 'grandTotals' | 'ancillaries'>('baseFares');

  // Form for New or Edit Route
  const [routeForm, setRouteForm] = useState<Omit<WingoRouteRate, 'id'>>({
    originCountry: 'Jamaica',
    originCity: 'Kingston',
    originAirportCode: 'KIN',
    destinationCountry: 'Colombia',
    destinationCity: 'Bogotá',
    destinationAirportCode: 'BOG',
    routeType: 'international',
    currency: 'USD',
    oneWayBaseFare: 120.0,
    oneWayTaxesAndFees: 39.25,
    oneWayAncillaryFees: 17.5,
    oneWayNetCost: 145.0,
    oneWayGrandTotal: 176.75,
    roundTripBaseFare: 240.0,
    roundTripTaxesAndFees: 78.5,
    roundTripAncillaryFees: 35.0,
    roundTripNetCost: 290.0,
    roundTripGrandTotal: 353.5,
    markupPercentage: 15,
    notes: 'Regular scheduled service.',
    isActive: true,
    isPopular: false,
    seasonalNotes: '',
  });

  // Simulator / Verification console state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);
  const [simOrigin, setSimOrigin] = useState('Jamaica');
  const [simDestination, setSimDestination] = useState('Colombia');
  const [simJourneyType, setSimJourneyType] = useState<'one_way' | 'round_trip'>('round_trip');
  const [simPassengers, setSimPassengers] = useState(1);
  const [simResult, setSimResult] = useState<WingoEngineResponse | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Execute verification calculation
  const runSimulator = () => {
    const res = verifyFlightRouteAndPrice({
      originCountry: simOrigin,
      destinationCountry: simDestination,
      journeyType: simJourneyType,
      passengers: simPassengers,
      customRoutes: wingoRoutes,
    });
    setSimResult(res);
  };

  // Run simulator on mount and when parameters change
  useEffect(() => {
    runSimulator();
  }, [simOrigin, simDestination, simJourneyType, simPassengers, wingoRoutes]);

  // Filtered and sorted route records
  const filteredRoutes = useMemo(() => {
    let result = [...wingoRoutes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.originCountry.toLowerCase().includes(q) ||
          r.destinationCountry.toLowerCase().includes(q) ||
          r.originCity.toLowerCase().includes(q) ||
          r.destinationCity.toLowerCase().includes(q) ||
          r.originAirportCode.toLowerCase().includes(q) ||
          r.destinationAirportCode.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    if (originCountryFilter !== 'All') {
      result = result.filter((r) => r.originCountry === originCountryFilter);
    }

    if (destCountryFilter !== 'All') {
      result = result.filter((r) => r.destinationCountry === destCountryFilter);
    }

    if (currencyFilter !== 'All') {
      result = result.filter((r) => r.currency === currencyFilter);
    }

    if (routeTypeFilter !== 'All') {
      result = result.filter((r) => r.routeType === routeTypeFilter);
    }

    if (statusFilter !== 'All') {
      const activeBool = statusFilter === 'Active';
      result = result.filter((r) => r.isActive === activeBool);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return result;
  }, [
    wingoRoutes,
    searchQuery,
    originCountryFilter,
    destCountryFilter,
    currencyFilter,
    routeTypeFilter,
    statusFilter,
    sortField,
    sortAsc,
  ]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = wingoRoutes.length;
    const activeCount = wingoRoutes.filter((r) => r.isActive).length;
    const domesticCount = wingoRoutes.filter((r) => r.routeType === 'domestic').length;
    const intlCount = wingoRoutes.filter((r) => r.routeType === 'international').length;

    const usdRoutes = wingoRoutes.filter((r) => r.currency === 'USD');
    const avgOneWayUSD =
      usdRoutes.length > 0
        ? usdRoutes.reduce((acc, r) => acc + (r.oneWayGrandTotal || 0), 0) / usdRoutes.length
        : 0;
    const avgRoundTripUSD =
      usdRoutes.length > 0
        ? usdRoutes.reduce((acc, r) => acc + (r.roundTripGrandTotal || 0), 0) / usdRoutes.length
        : 0;

    const avgMarginUSD =
      usdRoutes.length > 0
        ? usdRoutes.reduce(
            (acc, r) => acc + ((r.roundTripGrandTotal || 0) - (r.roundTripNetCost || 0)),
            0
          ) / usdRoutes.length
        : 0;

    return {
      total,
      activeCount,
      domesticCount,
      intlCount,
      avgOneWayUSD: Math.round(avgOneWayUSD * 100) / 100,
      avgRoundTripUSD: Math.round(avgRoundTripUSD * 100) / 100,
      avgMarginUSD: Math.round(avgMarginUSD * 100) / 100,
    };
  }, [wingoRoutes]);

  // Inline edit handlers
  const startEditingCell = (id: string, field: keyof WingoRouteRate, currentVal: any) => {
    setEditingCell({ id, field });
    setEditingValue(String(currentVal ?? ''));
  };

  const commitCellEdit = () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    const route = wingoRoutes.find((r) => r.id === id);
    if (!route) {
      setEditingCell(null);
      return;
    }

    const numFields: (keyof WingoRouteRate)[] = [
      'oneWayBaseFare',
      'oneWayTaxesAndFees',
      'oneWayAncillaryFees',
      'oneWayNetCost',
      'oneWayGrandTotal',
      'roundTripBaseFare',
      'roundTripTaxesAndFees',
      'roundTripAncillaryFees',
      'roundTripNetCost',
      'roundTripGrandTotal',
      'markupPercentage',
    ];

    let updatedVal: any = editingValue;
    if (numFields.includes(field)) {
      const parsed = parseFloat(editingValue.replace(/[^0-9.]/g, ''));
      updatedVal = isNaN(parsed) ? 0 : parsed;
    }

    const updates: Partial<WingoRouteRate> = { [field]: updatedVal };

    // Auto-update totals if constituent fees change
    if (field === 'oneWayBaseFare' || field === 'oneWayTaxesAndFees' || field === 'oneWayAncillaryFees') {
      const b = field === 'oneWayBaseFare' ? updatedVal : route.oneWayBaseFare;
      const t = field === 'oneWayTaxesAndFees' ? updatedVal : route.oneWayTaxesAndFees;
      const a = field === 'oneWayAncillaryFees' ? updatedVal : route.oneWayAncillaryFees;
      updates.oneWayGrandTotal = Math.round((b + t + a) * 100) / 100;
    }

    if (field === 'roundTripBaseFare' || field === 'roundTripTaxesAndFees' || field === 'roundTripAncillaryFees') {
      const b = field === 'roundTripBaseFare' ? updatedVal : route.roundTripBaseFare;
      const t = field === 'roundTripTaxesAndFees' ? updatedVal : route.roundTripTaxesAndFees;
      const a = field === 'roundTripAncillaryFees' ? updatedVal : route.roundTripAncillaryFees;
      updates.roundTripGrandTotal = Math.round((b + t + a) * 100) / 100;
    }

    updateWingoRoute(id, updates);
    setEditingCell(null);
    showNotification('Cell Updated', `Updated ${String(field)} on route ${route.originAirportCode} ✈ ${route.destinationAirportCode}.`, 'success');
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
  };

  // Save all changes with visual persistence feedback
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const ok = await saveWingoRoutesToLive();
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Open modal for new route
  const openNewRouteModal = () => {
    setEditingRouteModal(null);
    setRouteForm({
      originCountry: 'Jamaica',
      originCity: 'Kingston',
      originAirportCode: 'KIN',
      destinationCountry: 'Colombia',
      destinationCity: 'Bogotá',
      destinationAirportCode: 'BOG',
      routeType: 'international',
      currency: 'USD',
      oneWayBaseFare: 120.0,
      oneWayTaxesAndFees: 39.25,
      oneWayAncillaryFees: 17.5,
      oneWayNetCost: 145.0,
      oneWayGrandTotal: 176.75,
      roundTripBaseFare: 240.0,
      roundTripTaxesAndFees: 78.5,
      roundTripAncillaryFees: 35.0,
      roundTripNetCost: 290.0,
      roundTripGrandTotal: 353.5,
      markupPercentage: 15,
      notes: '',
      isActive: true,
      isPopular: false,
      seasonalNotes: '',
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditRouteModal = (route: WingoRouteRate) => {
    setEditingRouteModal(route);
    setRouteForm({
      originCountry: route.originCountry,
      originCity: route.originCity,
      originAirportCode: route.originAirportCode,
      destinationCountry: route.destinationCountry,
      destinationCity: route.destinationCity,
      destinationAirportCode: route.destinationAirportCode,
      routeType: route.routeType,
      currency: route.currency,
      oneWayBaseFare: route.oneWayBaseFare,
      oneWayTaxesAndFees: route.oneWayTaxesAndFees,
      oneWayAncillaryFees: route.oneWayAncillaryFees,
      oneWayNetCost: route.oneWayNetCost,
      oneWayGrandTotal: route.oneWayGrandTotal,
      roundTripBaseFare: route.roundTripBaseFare,
      roundTripTaxesAndFees: route.roundTripTaxesAndFees,
      roundTripAncillaryFees: route.roundTripAncillaryFees,
      roundTripNetCost: route.roundTripNetCost,
      roundTripGrandTotal: route.roundTripGrandTotal,
      markupPercentage: route.markupPercentage || 15,
      notes: route.notes || '',
      isActive: route.isActive,
      isPopular: !!route.isPopular,
      seasonalNotes: route.seasonalNotes || '',
    });
    setIsAddModalOpen(true);
  };

  // Duplicate a route
  const handleDuplicateRoute = (route: WingoRouteRate) => {
    const copy: Omit<WingoRouteRate, 'id'> = {
      ...route,
      destinationCity: `${route.destinationCity} (Copy)`,
      notes: `Copy of ${route.originAirportCode}-${route.destinationAirportCode}`,
    };
    addWingoRoute(copy);
  };

  // Submit modal form
  const handleSaveModalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRouteModal) {
      updateWingoRoute(editingRouteModal.id, routeForm);
      showNotification('Route Updated', `Saved route ${routeForm.originAirportCode} ✈ ${routeForm.destinationAirportCode}.`, 'success');
    } else {
      addWingoRoute(routeForm);
    }
    setIsAddModalOpen(false);
    setEditingRouteModal(null);
  };

  // Bulk rate adjuster
  const handleApplyBulkAdjust = () => {
    const factor = 1 + bulkPercent / 100;
    const updated = wingoRoutes.map((r) => {
      const matchOrigin = originCountryFilter === 'All' || r.originCountry === originCountryFilter;
      const matchDest = destCountryFilter === 'All' || r.destinationCountry === destCountryFilter;
      if (!matchOrigin || !matchDest) return r;

      if (bulkFieldTarget === 'baseFares') {
        const newOwBase = Math.round(r.oneWayBaseFare * factor * 100) / 100;
        const newRtBase = Math.round(r.roundTripBaseFare * factor * 100) / 100;
        return {
          ...r,
          oneWayBaseFare: newOwBase,
          roundTripBaseFare: newRtBase,
          oneWayGrandTotal: Math.round((newOwBase + r.oneWayTaxesAndFees + r.oneWayAncillaryFees) * 100) / 100,
          roundTripGrandTotal: Math.round((newRtBase + r.roundTripTaxesAndFees + r.roundTripAncillaryFees) * 100) / 100,
        };
      } else if (bulkFieldTarget === 'grandTotals') {
        const newOwGt = Math.round(r.oneWayGrandTotal * factor * 100) / 100;
        const newRtGt = Math.round(r.roundTripGrandTotal * factor * 100) / 100;
        return {
          ...r,
          oneWayGrandTotal: newOwGt,
          roundTripGrandTotal: newRtGt,
        };
      } else {
        const newOwAnc = Math.round(r.oneWayAncillaryFees * factor * 100) / 100;
        const newRtAnc = Math.round(r.roundTripAncillaryFees * factor * 100) / 100;
        return {
          ...r,
          oneWayAncillaryFees: newOwAnc,
          roundTripAncillaryFees: newRtAnc,
          oneWayGrandTotal: Math.round((r.oneWayBaseFare + r.oneWayTaxesAndFees + newOwAnc) * 100) / 100,
          roundTripGrandTotal: Math.round((r.roundTripBaseFare + r.roundTripTaxesAndFees + newRtAnc) * 100) / 100,
        };
      }
    });

    batchUpdateWingoRoutes(updated);
    setIsBulkAdjustOpen(false);
    showNotification('Bulk Adjustment Applied', `Adjusted ${bulkFieldTarget} by ${bulkPercent > 0 ? '+' : ''}${bulkPercent}% across selected routes.`, 'success');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Route ID',
      'Origin Country',
      'Origin City',
      'Origin Code',
      'Destination Country',
      'Destination City',
      'Destination Code',
      'Route Type',
      'Currency',
      'One-Way Base Fare',
      'One-Way Taxes & Fees',
      'One-Way Ancillaries',
      'One-Way Net Cost',
      'One-Way Grand Total',
      'Round-Trip Base Fare',
      'Round-Trip Taxes & Fees',
      'Round-Trip Ancillaries',
      'Round-Trip Net Cost',
      'Round-Trip Grand Total',
      'Estimated Margin',
      'Active Status',
      'Notes',
    ];

    const rows = filteredRoutes.map((r) => [
      r.id,
      `"${r.originCountry}"`,
      `"${r.originCity}"`,
      r.originAirportCode,
      `"${r.destinationCountry}"`,
      `"${r.destinationCity}"`,
      r.destinationAirportCode,
      r.routeType,
      r.currency,
      r.oneWayBaseFare,
      r.oneWayTaxesAndFees,
      r.oneWayAncillaryFees,
      r.oneWayNetCost,
      r.oneWayGrandTotal,
      r.roundTripBaseFare,
      r.roundTripTaxesAndFees,
      r.roundTripAncillaryFees,
      r.roundTripNetCost,
      r.roundTripGrandTotal,
      Math.round(((r.roundTripGrandTotal || 0) - (r.roundTripNetCost || 0)) * 100) / 100,
      r.isActive ? 'Active' : 'Inactive',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wingo_network_rates_database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Excel CSV Exported', 'Downloaded complete Wingo network rates spreadsheet.', 'success');
  };

  // Helper format currency
  const formatMoney = (amount: number, curr: 'USD' | 'COP') => {
    if (curr === 'COP') {
      return `$${amount.toLocaleString()} COP`;
    }
    return `$${amount.toFixed(2)} USD`;
  };

  // Copy JSON response from simulator
  const handleCopySimulatorJson = () => {
    if (!simResult) return;
    navigator.clipboard.writeText(JSON.stringify(simResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
    showNotification('JSON Copied', 'Wingo Engine / Skyscanner fallback response copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-100/50 via-amber-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                    Wingo Countries & Rates Database
                  </h2>
                  <span className="text-[11px] bg-purple-100 text-purple-900 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                    <Plane className="w-3 h-3 text-purple-700" />
                    11-Country Flight Engine
                  </span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Excel Grid Active
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
                  Manage official and agency rates for Wingo's 11-country flight network. Edit base fares, taxes & fees, ancillary baggage/seat costs, net airline costs, and customer grand totals for both <strong>Round-Trip</strong> and <strong>One-Way</strong> flights.
                </p>
              </div>
            </div>

            {/* 11 Wingo Network Countries Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                Wingo Network (11):
              </span>
              {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => {
                const isSelected = originCountryFilter === c.name || destCountryFilter === c.name;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      if (originCountryFilter === c.name) {
                        setOriginCountryFilter('All');
                      } else {
                        setOriginCountryFilter(c.name);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E0249] text-[#FFC72C] shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                    title={`Click to filter by ${c.name} (${c.defaultAirport})`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    {c.isHub && (
                      <span className="text-[9px] bg-amber-400 text-[#2E0249] font-black px-1 rounded">HUB</span>
                    )}
                  </button>
                );
              })}
              {(originCountryFilter !== 'All' || destCountryFilter !== 'All') && (
                <button
                  onClick={() => {
                    setOriginCountryFilter('All');
                    setDestCountryFilter('All');
                  }}
                  className="text-[11px] text-purple-700 hover:underline font-bold ml-2 cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Functional Save Button */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
              }`}
              title="Save all edited rates and persist to flight engine"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Rates...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved & Synchronized!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>

            <button
              onClick={openNewRouteModal}
              className="bg-[#2E0249] hover:bg-purple-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FFC72C]" />
              <span>Add Wingo Route</span>
            </button>

            <button
              onClick={() => setIsBulkAdjustOpen(true)}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-neutral-300 transition-colors cursor-pointer"
              title="Bulk adjust base fares or prices by percentage"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-600" />
              <span>Bulk Adjust</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-neutral-300 transition-colors cursor-pointer"
              title="Export complete database to CSV"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isSimulatorOpen
                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
              }`}
              title="Toggle Flight Engine & Skyscanner Fallback Simulator"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>{isSimulatorOpen ? 'Hide Simulator' : 'Test Engine'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset Wingo rates database to original baseline rates? Any custom pricing will be replaced with defaults.')) {
                  resetWingoRoutesToDefault();
                }
              }}
              className="p-2.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-neutral-200 transition-colors"
              title="Reset to default Wingo network rates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Wingo Flight Engine & Skyscanner Fallback Router Simulator Console */}
      {isSimulatorOpen && (
        <div className="bg-gradient-to-br from-neutral-900 via-[#1C002E] to-neutral-950 text-white rounded-2xl p-5 border border-purple-900/60 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-wide font-['Outfit',sans-serif]">
                    Wingo Flight Engine & Skyscanner Fallback Router Console
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                    LIVE VERIFICATION
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Tests route verification: 11 Wingo countries calculate pricing via database; non-network countries automatically hand off to Skyscanner API.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySimulatorJson}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>{copiedJson ? 'Copied!' : 'Copy Output JSON'}</span>
              </button>
            </div>
          </div>

          {/* Simulator Inputs & Result Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
            {/* Left Inputs */}
            <div className="lg:col-span-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Origin Country
                  </label>
                  <select
                    value={simOrigin}
                    onChange={(e) => setSimOrigin(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#FFC72C]"
                  >
                    <optgroup label="Wingo Network (11 Countries)">
                      {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name} className="bg-neutral-900 text-white">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Fallback Test Countries (Non-Wingo)">
                      <option value="USA" className="bg-neutral-900 text-white">🇺🇸 USA</option>
                      <option value="Canada" className="bg-neutral-900 text-white">🇨🇦 Canada</option>
                      <option value="United Kingdom" className="bg-neutral-900 text-white">🇬🇧 United Kingdom</option>
                      <option value="Barbados" className="bg-neutral-900 text-white">🇧🇧 Barbados</option>
                      <option value="Spain" className="bg-neutral-900 text-white">🇪🇸 Spain</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Destination Country
                  </label>
                  <select
                    value={simDestination}
                    onChange={(e) => setSimDestination(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#FFC72C]"
                  >
                    <optgroup label="Wingo Network (11 Countries)">
                      {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name} className="bg-neutral-900 text-white">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Fallback Test Countries (Non-Wingo)">
                      <option value="USA" className="bg-neutral-900 text-white">🇺🇸 USA</option>
                      <option value="Canada" className="bg-neutral-900 text-white">🇨🇦 Canada</option>
                      <option value="United Kingdom" className="bg-neutral-900 text-white">🇬🇧 United Kingdom</option>
                      <option value="France" className="bg-neutral-900 text-white">🇫🇷 France</option>
                      <option value="Brazil" className="bg-neutral-900 text-white">🇧🇷 Brazil</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Journey Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSimJourneyType('round_trip')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simJourneyType === 'round_trip'
                          ? 'bg-[#FFC72C] text-[#2E0249] shadow-xs'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      Round-Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimJourneyType('one_way')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simJourneyType === 'one_way'
                          ? 'bg-[#FFC72C] text-[#2E0249] shadow-xs'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      One-Way
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={simPassengers}
                    onChange={(e) => setSimPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#FFC72C]"
                  />
                </div>
              </div>

              {/* Status pill summary */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-neutral-300">Routing Decision:</span>
                {simResult?.provider === 'wingo' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    WINGO FLIGHT ENGINE ({simResult.currency})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    SKYSCANNER FALLBACK ROUTER
                  </span>
                )}
              </div>
            </div>

            {/* Right JSON Preview */}
            <div className="lg:col-span-7 bg-black/60 rounded-xl p-4 border border-white/10 font-mono text-xs overflow-x-auto relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-neutral-400">
                <span>SYSTEM SPECIFICATION OUTPUT JSON</span>
                <span className="text-emerald-400">200 OK</span>
              </div>
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {simResult ? JSON.stringify(simResult, null, 2) : '// Loading...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Wingo Network Routes</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.activeCount} active in engine</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Supported Nations</div>
          <div className="text-2xl font-black text-purple-900 mt-1">11</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Colombia Hub + 10</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Domestic Routes (COP)</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{stats.domesticCount}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Colombia Domestic</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Avg One-Way (USD)</div>
          <div className="text-2xl font-black text-neutral-900 mt-1">${stats.avgOneWayUSD}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Across Intl Routes</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Avg Round-Trip (USD)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">${stats.avgRoundTripUSD}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Selling Grand Total</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Avg Agency Margin</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">+${stats.avgMarginUSD}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Profit per RT booking</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route, city, code, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
            />
          </div>

          {/* Origin Country */}
          <select
            value={originCountryFilter}
            onChange={(e) => setOriginCountryFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Origins</option>
            {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                From: {c.name}
              </option>
            ))}
          </select>

          {/* Destination Country */}
          <select
            value={destCountryFilter}
            onChange={(e) => setDestCountryFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Destinations</option>
            {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                To: {c.name}
              </option>
            ))}
          </select>

          {/* Currency */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="COP">COP (Colombian Peso)</option>
          </select>

          {/* Route Type */}
          <select
            value={routeTypeFilter}
            onChange={(e) => setRouteTypeFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Route Types</option>
            <option value="international">International Network</option>
            <option value="domestic">Domestic Colombia</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <span className="text-xs text-neutral-500 font-medium">
            Showing <strong>{filteredRoutes.length}</strong> of {wingoRoutes.length} routes
          </span>
        </div>
      </div>

      {/* Spreadsheet / Excel Rates Grid */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">Excel Grid Instructions:</span>
            <span>Click any rate or cost cell to edit value directly. Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono text-[10px]">Enter</kbd> to save.</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            Totals & Margins recalculate in real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-[#2E0249] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-48">Route / Corridor</th>
                <th className="p-3 w-24">Type</th>
                <th className="p-3 w-20">Curr</th>
                {/* ONE WAY COLUMNS */}
                <th className="p-3 bg-purple-900/60 text-amber-200 text-center border-l border-r border-purple-800" colSpan={4}>
                  ONE-WAY RATES & COSTS
                </th>
                {/* ROUND TRIP COLUMNS */}
                <th className="p-3 bg-purple-950 text-[#FFC72C] text-center border-r border-purple-800" colSpan={4}>
                  ROUND-TRIP RATES & COSTS
                </th>
                <th className="p-3 w-28 text-right">Margin / Profit</th>
                <th className="p-3 w-20 text-center">Status</th>
                <th className="p-3 w-24 text-right">Actions</th>
              </tr>
              <tr className="bg-neutral-100 text-neutral-600 text-[10px] font-bold border-b border-neutral-200">
                <th className="p-2.5">Origin ➔ Destination</th>
                <th className="p-2.5">Scope</th>
                <th className="p-2.5">Unit</th>
                {/* ONE WAY SUB-HEADERS */}
                <th className="p-2.5 border-l border-neutral-200 text-right">Base Fare</th>
                <th className="p-2.5 text-right">Taxes/Fees</th>
                <th className="p-2.5 text-right">Ancillaries</th>
                <th className="p-2.5 border-r border-neutral-200 text-right text-purple-900 font-black">Grand Total</th>
                {/* ROUND TRIP SUB-HEADERS */}
                <th className="p-2.5 text-right">Base Fare</th>
                <th className="p-2.5 text-right">Taxes/Fees</th>
                <th className="p-2.5 text-right">Ancillaries</th>
                <th className="p-2.5 border-r border-neutral-200 text-right text-emerald-900 font-black">Grand Total</th>
                <th className="p-2.5 text-right">Net vs Sell</th>
                <th className="p-2.5 text-center">State</th>
                <th className="p-2.5 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => {
                  const owMargin = (route.oneWayGrandTotal || 0) - (route.oneWayNetCost || 0);
                  const rtMargin = (route.roundTripGrandTotal || 0) - (route.roundTripNetCost || 0);

                  const renderEditableCell = (
                    field: keyof WingoRouteRate,
                    value: number,
                    isHighlight: boolean = false,
                    textColor: string = 'text-neutral-800'
                  ) => {
                    const isEditing = editingCell?.id === route.id && editingCell?.field === field;

                    if (isEditing) {
                      return (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitCellEdit();
                              if (e.key === 'Escape') cancelCellEdit();
                            }}
                            autoFocus
                            className="w-20 px-1.5 py-0.5 bg-amber-50 border-2 border-[#2E0249] rounded text-right text-xs font-bold text-neutral-900 focus:outline-none"
                          />
                          <button
                            onClick={commitCellEdit}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelCellEdit}
                            className="p-1 bg-neutral-300 text-neutral-700 rounded hover:bg-neutral-400 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        onClick={() => startEditingCell(route.id, field, value)}
                        className={`group cursor-pointer px-2 py-1 rounded transition-colors text-right flex items-center justify-end gap-1 ${
                          isHighlight ? 'font-black ' + textColor : textColor
                        } hover:bg-amber-100/70 hover:ring-1 hover:ring-amber-300`}
                        title="Click to edit cell"
                      >
                        <span>{route.currency === 'COP' ? value.toLocaleString() : value.toFixed(2)}</span>
                        <Edit3 className="w-2.5 h-2.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  };

                  return (
                    <tr
                      key={route.id}
                      className={`hover:bg-purple-50/40 transition-colors ${
                        !route.isActive ? 'opacity-60 bg-neutral-50' : ''
                      }`}
                    >
                      {/* Route / Corridor */}
                      <td className="p-3 font-sans">
                        <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-[10px] font-extrabold">
                            {route.originAirportCode}
                          </span>
                          <span className="text-neutral-400">➔</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-[10px] font-extrabold">
                            {route.destinationAirportCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {route.originCountry} ({route.originCity}) to {route.destinationCountry} ({route.destinationCity})
                        </div>
                        {route.notes && (
                          <div className="text-[10px] text-neutral-400 italic truncate max-w-xs mt-0.5">
                            {route.notes}
                          </div>
                        )}
                      </td>

                      {/* Scope */}
                      <td className="p-3 font-sans">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            route.routeType === 'domestic'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {route.routeType === 'domestic' ? 'Domestic' : 'Intl Network'}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="p-3">
                        <span className="font-bold text-[11px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {route.currency}
                        </span>
                      </td>

                      {/* ONE WAY Base Fare */}
                      <td className="p-2 border-l border-neutral-200">
                        {renderEditableCell('oneWayBaseFare', route.oneWayBaseFare)}
                      </td>

                      {/* ONE WAY Taxes */}
                      <td className="p-2">
                        {renderEditableCell('oneWayTaxesAndFees', route.oneWayTaxesAndFees)}
                      </td>

                      {/* ONE WAY Ancillary */}
                      <td className="p-2">
                        {renderEditableCell('oneWayAncillaryFees', route.oneWayAncillaryFees)}
                      </td>

                      {/* ONE WAY Grand Total */}
                      <td className="p-2 border-r border-neutral-200 bg-purple-50/50">
                        {renderEditableCell('oneWayGrandTotal', route.oneWayGrandTotal, true, 'text-purple-950 font-black')}
                      </td>

                      {/* ROUND TRIP Base Fare */}
                      <td className="p-2">
                        {renderEditableCell('roundTripBaseFare', route.roundTripBaseFare)}
                      </td>

                      {/* ROUND TRIP Taxes */}
                      <td className="p-2">
                        {renderEditableCell('roundTripTaxesAndFees', route.roundTripTaxesAndFees)}
                      </td>

                      {/* ROUND TRIP Ancillary */}
                      <td className="p-2">
                        {renderEditableCell('roundTripAncillaryFees', route.roundTripAncillaryFees)}
                      </td>

                      {/* ROUND TRIP Grand Total */}
                      <td className="p-2 border-r border-neutral-200 bg-emerald-50/50">
                        {renderEditableCell('roundTripGrandTotal', route.roundTripGrandTotal, true, 'text-emerald-950 font-black')}
                      </td>

                      {/* Margin / Profit */}
                      <td className="p-3 text-right font-sans">
                        <div className="font-extrabold text-emerald-700 text-xs">
                          +{formatMoney(rtMargin, route.currency)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          OW: +{formatMoney(owMargin, route.currency)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center font-sans">
                        <button
                          onClick={() => {
                            updateWingoRoute(route.id, { isActive: !route.isActive });
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            route.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                          }`}
                        >
                          {route.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditRouteModal(route)}
                            className="p-1.5 text-neutral-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit full route details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateRoute(route)}
                            className="p-1.5 text-neutral-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate route"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete route ${route.originAirportCode} ➔ ${route.destinationAirportCode}?`)) {
                                deleteWingoRoute(route.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-neutral-500 font-sans">
                    <Plane className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-bold">No routes match the current filters.</p>
                    <p className="text-xs text-neutral-400 mt-1">Try resetting the origin/destination or search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Route Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 font-['Outfit',sans-serif]">
                    {editingRouteModal ? 'Edit Wingo Route & Rates' : 'Configure New Wingo Route'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Set one-way and roundtrip fares, taxes, ancillaries, and operational costs.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="space-y-4 mt-5">
              {/* Route Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
                  <span className="text-xs font-bold text-purple-900 uppercase">Origin Details</span>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Origin Country</label>
                    <select
                      value={routeForm.originCountry}
                      onChange={(e) => {
                        const country = INITIAL_WINGO_SUPPORTED_COUNTRIES.find((c) => c.name === e.target.value);
                        setRouteForm((prev) => ({
                          ...prev,
                          originCountry: e.target.value,
                          originAirportCode: country ? country.defaultAirport : prev.originAirportCode,
                          originCity: country && country.cities[0] ? country.cities[0] : prev.originCity,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">City</label>
                      <input
                        type="text"
                        value={routeForm.originCity}
                        onChange={(e) => setRouteForm({ ...routeForm, originCity: e.target.value })}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Airport Code</label>
                      <input
                        type="text"
                        value={routeForm.originAirportCode}
                        onChange={(e) => setRouteForm({ ...routeForm, originAirportCode: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
                  <span className="text-xs font-bold text-purple-900 uppercase">Destination Details</span>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Destination Country</label>
                    <select
                      value={routeForm.destinationCountry}
                      onChange={(e) => {
                        const country = INITIAL_WINGO_SUPPORTED_COUNTRIES.find((c) => c.name === e.target.value);
                        setRouteForm((prev) => ({
                          ...prev,
                          destinationCountry: e.target.value,
                          destinationAirportCode: country ? country.defaultAirport : prev.destinationAirportCode,
                          destinationCity: country && country.cities[0] ? country.cities[0] : prev.destinationCity,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      {INITIAL_WINGO_SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">City</label>
                      <input
                        type="text"
                        value={routeForm.destinationCity}
                        onChange={(e) => setRouteForm({ ...routeForm, destinationCity: e.target.value })}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Airport Code</label>
                      <input
                        type="text"
                        value={routeForm.destinationAirportCode}
                        onChange={(e) => setRouteForm({ ...routeForm, destinationAirportCode: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Currency and Route Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">Currency</label>
                  <select
                    value={routeForm.currency}
                    onChange={(e) => setRouteForm({ ...routeForm, currency: e.target.value as any })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="USD">USD ($) - International Wingo Network</option>
                    <option value="COP">COP ($) - Colombia Domestic Flights</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">Route Scope</label>
                  <select
                    value={routeForm.routeType}
                    onChange={(e) => setRouteForm({ ...routeForm, routeType: e.target.value as any })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="international">International Flight Route</option>
                    <option value="domestic">Domestic Colombia Flight</option>
                  </select>
                </div>
              </div>

              {/* One Way Rates */}
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200">
                <span className="text-xs font-bold text-purple-900 block mb-2">ONE-WAY Rates & Costs</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Base Fare</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.oneWayBaseFare}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          oneWayBaseFare: val,
                          oneWayGrandTotal: Math.round((val + prev.oneWayTaxesAndFees + prev.oneWayAncillaryFees) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Taxes & Fees</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.oneWayTaxesAndFees}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          oneWayTaxesAndFees: val,
                          oneWayGrandTotal: Math.round((prev.oneWayBaseFare + val + prev.oneWayAncillaryFees) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Ancillaries</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.oneWayAncillaryFees}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          oneWayAncillaryFees: val,
                          oneWayGrandTotal: Math.round((prev.oneWayBaseFare + prev.oneWayTaxesAndFees + val) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-purple-900 block mb-1">Selling Grand Total</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.oneWayGrandTotal}
                      onChange={(e) => setRouteForm({ ...routeForm, oneWayGrandTotal: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-purple-100/70 border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-purple-950"
                    />
                  </div>
                </div>
              </div>

              {/* Round Trip Rates */}
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-2">ROUND-TRIP Rates & Costs</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Base Fare</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.roundTripBaseFare}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          roundTripBaseFare: val,
                          roundTripGrandTotal: Math.round((val + prev.roundTripTaxesAndFees + prev.roundTripAncillaryFees) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Taxes & Fees</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.roundTripTaxesAndFees}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          roundTripTaxesAndFees: val,
                          roundTripGrandTotal: Math.round((prev.roundTripBaseFare + val + prev.roundTripAncillaryFees) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block mb-1">Ancillaries</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.roundTripAncillaryFees}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRouteForm((prev) => ({
                          ...prev,
                          roundTripAncillaryFees: val,
                          roundTripGrandTotal: Math.round((prev.roundTripBaseFare + prev.roundTripTaxesAndFees + val) * 100) / 100,
                        }));
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-1">Selling Grand Total</label>
                    <input
                      type="number"
                      step="any"
                      value={routeForm.roundTripGrandTotal}
                      onChange={(e) => setRouteForm({ ...routeForm, roundTripGrandTotal: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-emerald-100/70 border border-emerald-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-emerald-950"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-neutral-600 block mb-1">Operational & Route Notes</label>
                <textarea
                  rows={2}
                  value={routeForm.notes}
                  onChange={(e) => setRouteForm({ ...routeForm, notes: e.target.value })}
                  placeholder="e.g. Flight operates Mon, Wed, Fri. Baggage rules, peak periods..."
                  className="w-full bg-white border border-neutral-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2E0249] hover:bg-purple-900 text-[#FFC72C] font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm"
                >
                  {editingRouteModal ? 'Update Route Rates' : 'Save New Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Adjust Modal */}
      {isBulkAdjustOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-black text-neutral-900">Bulk Rate Adjuster</h3>
              </div>
              <button
                onClick={() => setIsBulkAdjustOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <p className="text-xs text-neutral-500">
                Quickly adjust rates across {filteredRoutes.length} filtered routes by a percentage.
              </p>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Target Field</label>
                <select
                  value={bulkFieldTarget}
                  onChange={(e) => setBulkFieldTarget(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="baseFares">Base Fares (Auto-recalculates Grand Totals)</option>
                  <option value="grandTotals">Grand Totals (Selling Rates)</option>
                  <option value="ancillaries">Ancillary Fees (Baggage / Seat fees)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Adjustment Percentage ({bulkPercent > 0 ? '+' : ''}{bulkPercent}%)
                </label>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="1"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(parseInt(e.target.value) || 0)}
                  className="w-full accent-purple-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>-30%</span>
                  <span className="font-bold text-purple-800">{bulkPercent}%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => setIsBulkAdjustOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyBulkAdjust}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Apply to {filteredRoutes.length} Routes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
