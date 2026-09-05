import React, { useState, useMemo } from 'react';
import { Sparkles, Filter, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TripCard } from './common/TripCard';
import { TripStatus } from '../types';

interface TripsPageProps {
  initialFilterParam?: string | null;
}

export const TripsPage: React.FC<TripsPageProps> = ({ initialFilterParam }) => {
  const { trips, navigateTo } = useApp();

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (initialFilterParam === '2026') return '2026';
    if (initialFilterParam === '2027') return '2027';
    return 'All';
  });

  const [selectedDestination, setSelectedDestination] = useState<string>(() => {
    if (initialFilterParam && initialFilterParam !== '2026' && initialFilterParam !== '2027') {
      const match = trips.find(t => t.slug === initialFilterParam || t.id === initialFilterParam);
      if (match) return match.destination;
    }
    return 'All';
  });

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(400000);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Extract unique destinations
  const uniqueDestinations = useMemo(() => {
    return Array.from(new Set(trips.map(t => t.destination)));
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // Year filter
      if (selectedYear !== 'All' && t.year.toString() !== selectedYear) {
        return false;
      }
      // Destination filter
      if (selectedDestination !== 'All' && t.destination !== selectedDestination) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'All' && t.status !== selectedStatus) {
        return false;
      }
      // Price filter
      if (t.price > maxPrice) {
        return false;
      }
      // Keyword search
      if (searchKeyword.trim() !== '') {
        const kw = searchKeyword.toLowerCase();
        const matches =
          t.name.toLowerCase().includes(kw) ||
          t.country.toLowerCase().includes(kw) ||
          t.destination.toLowerCase().includes(kw) ||
          t.hotel.toLowerCase().includes(kw);
        if (!matches) return false;
      }
      return true;
    });
  }, [trips, selectedYear, selectedDestination, selectedStatus, maxPrice, searchKeyword]);

  const resetFilters = () => {
    setSelectedYear('All');
    setSelectedDestination('All');
    setSelectedStatus('All');
    setMaxPrice(400000);
    setSearchKeyword('');
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-current" />
            <span>CURATED GROUP TRAVEL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Explore Group Trips & Packages
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl">
            Browse our upcoming international group trips departing from Kingston. Every package is thoughtfully coordinated with flights, hotels, airport transfers, and paid excursions.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <Filter className="w-4 h-4 text-[#2E0249]" />
              <span>Filter Group Packages</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Showing <strong>{filteredTrips.length}</strong> of {trips.length} trips</span>
              {(selectedYear !== 'All' || selectedDestination !== 'All' || selectedStatus !== 'All' || searchKeyword) && (
                <button
                  onClick={resetFilters}
                  className="text-purple-900 font-bold hover:underline flex items-center gap-1 ml-2"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                Keyword
              </label>
              <input
                type="text"
                placeholder="Search trip name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                Travel Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="All">All Years (2026 & 2027)</option>
                <option value="2026">2026 (Panama Part 2)</option>
                <option value="2027">2027 Collection</option>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                Destination
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="All">All Destinations</option>
                {uniqueDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                Trip Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Limited Availability">Limited Availability</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1 flex justify-between">
                <span>Max Rate</span>
                <span className="text-purple-900 font-bold">${(maxPrice / 1000).toFixed(0)}k JMD</span>
              </label>
              <input
                type="range"
                min="100000"
                max="400000"
                step="25000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#2E0249] cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif]">
              No packages match your current filter
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Try adjusting your price range or clearing destination filters to view all trips.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 bg-[#2E0249] text-[#FFC72C] text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
