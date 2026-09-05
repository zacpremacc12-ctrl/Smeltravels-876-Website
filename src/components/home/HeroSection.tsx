import React, { useState } from 'react';
import {
  Sparkles,
  Plane,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  Car,
  Hotel,
  ArrowRight,
  Compass,
  Calendar,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../../context/AppContext';

export const HeroSection: React.FC = () => {
  const { navigateTo, trips } = useApp();
  const [selectedYear, setSelectedYear] = useState<'all' | '2026' | '2027'>('all');
  const [selectedDest, setSelectedDest] = useState<string>('all');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDest !== 'all') {
      navigateTo('trips', selectedDest);
    } else if (selectedYear !== 'all') {
      navigateTo('trips', selectedYear);
    } else {
      navigateTo('trips');
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2E0249] via-[#381254] to-[#1F0333] text-white pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FFC72C] blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-purple-600 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-[#FFC72C]">
              <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-pulse"></span>
              <span>SMELTRAVELS876 • GROUP TRAVEL EXPERIENCES</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] font-['Outfit',sans-serif]">
              Travel More. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] via-[#FFE17D] to-[#FFC72C]">
                Worry Less.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-neutral-200 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Discover unforgettable group travel experiences with SMELTRAVELS876. From Caribbean getaways to international adventures, we make planning your next trip easier.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigateTo('trips')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-[#FFC72C]/25 hover:scale-102 active:scale-98 transition-all"
                id="hero-explore-trips-btn"
              >
                <span>Explore Group Trips</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigateTo('contact')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-7 py-4 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
                id="hero-plan-trip-btn"
              >
                <span>Plan Your Trip</span>
              </button>
            </div>

            {/* Trust Indicators Pill Row */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Organized group travel</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Flexible payment plans</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Travel document assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Airport transfer options</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Hotel className="w-4 h-4 text-[#FFC72C] shrink-0" />
                <span>Carefully selected accommodations</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5 relative">
            {/* Featured Trip Card Overlay */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#1F0333]/90">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80"
                  alt="Panama 2026 Featured Trip"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F0333] via-transparent to-black/30"></div>
                
                <div className="absolute top-4 left-4">
                  <span className="bg-[#FFC72C] text-[#2E0249] text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
                    2026 Featured Trip
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1.5 border border-white/20">
                  <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>Oct 13–18, 2026</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] flex items-center gap-2">
                    <span>🇵🇦 Panama 2026 — Part 2</span>
                  </h3>
                  <p className="text-xs text-neutral-300">From Kingston (KIN) • Bed & Breakfast • 2 Excursions</p>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Starting Rate</span>
                    <span className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                      $152,303 <span className="text-xs text-[#FFC72C] font-semibold">JMD / person</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Lock-In Deposit</span>
                    <span className="text-lg font-bold text-[#FFC72C]">
                      $83,353 <span className="text-xs text-neutral-300">JMD</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                    <span>Includes Flight from Kingston + Carry-on & Personal item</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                    <span>Roundtrip airport transfers + 2 paid excursions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                    <span>Trip memorabilia + Preparation of travel documents</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => navigateTo('trips', 'panama-2026')}
                    className="flex-1 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm py-3 rounded-xl text-center shadow-md transition-all"
                  >
                    View Package Details
                  </button>
                  <button
                    onClick={() => navigateTo('contact', 'panama-2026')}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Trip Search Bar */}
        <div className="mt-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 md:p-6 text-neutral-800 border border-white/40">
          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Travel Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as any)}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="all">All Departure Years</option>
                <option value="2026">2026 (Panama Part 2)</option>
                <option value="2027">2027 Group Trips Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Destination
              </label>
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#2E0249]"
              >
                <option value="all">All Destinations</option>
                <option value="panama-2026">Panama (Oct 2026)</option>
                <option value="antigua-2027">Antigua (Jan 2027)</option>
                <option value="germany-italy-2027">Germany + Italy (Feb 2027)</option>
                <option value="punta-cana-2027">Punta Cana (Mar 2027)</option>
                <option value="medellin-2027">Medellín (May 2027)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2E0249] mb-1">
                Trip Style
              </label>
              <div className="bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm text-neutral-700 font-medium truncate">
                Organized Group & All-Inclusive
              </div>
            </div>

            <div className="pt-2 sm:pt-0">
              <label className="hidden lg:block text-xs font-bold uppercase tracking-wider text-transparent mb-1">
                Search
              </label>
              <button
                type="submit"
                className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                id="hero-quick-search-submit"
              >
                <Compass className="w-4 h-4" />
                <span>Find Your Group Trip</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
