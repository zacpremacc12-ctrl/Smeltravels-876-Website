import React, { useState, useEffect } from 'react';
import {
  Plane,
  Phone,
  Mail,
  Menu,
  X,
  Search,
  Lock,
  MessageCircle,
  ChevronDown,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  Star,
  Bookmark,
} from 'lucide-react';
import { useApp, formatPriceJMD } from '../context/AppContext';
import { BrandLogo } from './common/BrandLogo';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin }) => {
  const {
    settings,
    trips,
    navigateTo,
    activePage,
    isAdminLoggedIn,
    currentAdminRole,
    currentUser,
    openAuthModal,
    setIsSearchOpen,
    openReviewModal,
    savedTripIds,
    openSavedTripsDrawer,
  } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false);
  const [isMobileTripsOpen, setIsMobileTripsOpen] = useState(false);

  const handleOpenSearch = onOpenSearch || (() => setIsSearchOpen(true));
  const handleOpenAdmin = onOpenAdmin || (() => navigateTo('admin'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string, param?: string) => {
    navigateTo(page, param);
    setIsMobileMenuOpen(false);
    setIsTripsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement & Contact Bar */}
      {settings.announcementBanner.enabled && (
        <div className="bg-[#1A1824] text-white text-xs sm:text-sm py-2 px-4 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFC72C] text-[#2E0249]">
                ANNOUNCEMENT
              </span>
              <span className="font-medium text-neutral-200">
                {settings.announcementBanner.text}
              </span>
            </div>
            <div className="flex items-center gap-4 text-neutral-300 shrink-0 text-xs">
              <a
                href={`tel:${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 hover:text-[#FFC72C] transition-colors"
                id="header-phone-link"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>{settings.primaryPhone}</span>
              </a>
              <span className="hidden sm:inline text-neutral-600">|</span>
              {/* Traveler Login / Sign Up Space */}
              {currentUser ? (
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 text-neutral-200 hover:text-[#FFC72C] transition-colors"
                  title="View your traveler profile and bookings"
                  id="topbar-user-profile-btn"
                >
                  <div className="w-4 h-4 rounded-full bg-[#FFC72C] text-[#2E0249] flex items-center justify-center text-[10px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span>{currentUser.name}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 text-xs" id="topbar-auth-space">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center gap-1 font-semibold text-neutral-200 hover:text-[#FFC72C] transition-colors"
                    id="topbar-login-btn"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#FFC72C]" />
                    <span>Log In</span>
                  </button>
                  <span className="text-neutral-600 font-light">/</span>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="inline-flex items-center gap-1 font-semibold text-[#FFC72C] hover:text-white transition-colors"
                    id="topbar-signup-btn"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
              <span className="hidden sm:inline text-neutral-600">|</span>
              <button
                onClick={handleOpenAdmin}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded transition-all ${
                  isAdminLoggedIn
                    ? 'bg-purple-900/80 text-[#FFC72C] border border-[#FFC72C]/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
                title={isAdminLoggedIn ? "Open Admin Dashboard (Unlocked)" : "Open Admin Portal (Password Protected)"}
                id="header-admin-btn"
              >
                <Lock className={`w-3 h-3 ${isAdminLoggedIn ? 'text-[#FFC72C]' : 'text-neutral-400'}`} />
                <span className={isAdminLoggedIn ? "text-[#FFC72C] font-bold" : "text-neutral-300 font-medium"}>
                  {isAdminLoggedIn ? `${currentAdminRole} Active` : 'Admin (Protected)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#2E0249]/95 backdrop-blur-md shadow-lg border-b border-purple-900/30 py-3'
            : 'bg-[#2E0249] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNav('home')}
            className="cursor-pointer group flex items-center lg:w-[310px] shrink-0"
            id="header-logo-link"
          >
            <BrandLogo size="md" tagline={settings.tagline} />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => handleNav('home')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'home' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-home-btn"
            >
              HOME
            </button>

            {/* Trips with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsTripsDropdownOpen(true)}
              onMouseLeave={() => setIsTripsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsTripsDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors py-1 cursor-pointer ${
                  activePage === 'trips' || activePage === 'trip-detail'
                    ? 'text-[#FFC72C]'
                    : 'text-neutral-200 hover:text-white'
                }`}
                id="nav-trips-btn"
                aria-expanded={isTripsDropdownOpen}
                title="Browse group trips and packages"
              >
                <span>TRIPS</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isTripsDropdownOpen ? 'rotate-180 text-[#FFC72C]' : ''
                  }`}
                />
              </button>

              {isTripsDropdownOpen && (
                <div className="absolute top-full left-0 w-80 sm:w-[420px] pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-[#1A1824]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-800/60 p-3.5 text-sm text-neutral-200 max-h-[82vh] overflow-y-auto space-y-2.5">
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-1.5 pb-2 border-b border-purple-800/40">
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#FFC72C]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-current" />
                        <span>Select Trip to View Package</span>
                      </div>
                      <button
                        onClick={() => handleNav('trips')}
                        className="text-[11px] text-neutral-300 hover:text-[#FFC72C] font-bold transition-colors flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Full Catalog</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 2026 Featured Section */}
                    {trips.filter((t) => t.year === 2026 || t.is2026Featured).length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 pt-0.5 text-[10px] font-extrabold text-[#FFC72C] uppercase tracking-wider flex items-center justify-between">
                          <span>★ 2026 Featured Trip Packages</span>
                          <span className="text-[9px] bg-[#FFC72C]/20 text-[#FFC72C] px-1.5 py-0.2 rounded font-bold">Limited Spots</span>
                        </div>
                        {trips
                          .filter((t) => t.year === 2026 || t.is2026Featured)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleNav('trip-detail', t.slug)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#3B185F] transition-all group flex items-center justify-between gap-3 border border-purple-900/20 hover:border-purple-600/50 cursor-pointer bg-purple-950/20"
                              id={`dropdown-trip-${t.slug}`}
                              title={`View package for ${t.name}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-700 bg-neutral-800">
                                  <img src={t.featuredImage} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  {t.tripLogo && (
                                    <img src={t.tripLogo} alt="" className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded bg-white p-0.5 object-contain" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-white text-xs group-hover:text-[#FFC72C] transition-colors truncate block">
                                    {t.countryFlag} {t.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 block truncate">
                                    {t.dates} • <strong className="text-neutral-200">{formatPriceJMD(t.price)}</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold bg-[#FFC72C]/20 text-[#FFC72C] group-hover:bg-[#FFC72C] group-hover:text-[#2E0249] px-2.5 py-1.5 rounded-lg transition-all shadow-sm">
                                <span>View Package</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* 2027 Group Trips Collection */}
                    {trips.filter((t) => t.year === 2027 || t.is2027Collection).length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-purple-800/30">
                        <div className="px-2 pt-0.5 text-[10px] font-extrabold text-[#FFC72C] uppercase tracking-wider flex items-center justify-between">
                          <span>✈ 2027 Group Trips Collection</span>
                          <span className="text-[9px] text-neutral-400 font-medium">Reserve Early</span>
                        </div>
                        {trips
                          .filter((t) => t.year === 2027 || t.is2027Collection)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleNav('trip-detail', t.slug)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#3B185F] transition-all group flex items-center justify-between gap-3 border border-transparent hover:border-purple-600/50 cursor-pointer"
                              id={`dropdown-trip-${t.slug}`}
                              title={`View package for ${t.name}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-700 bg-neutral-800">
                                  <img src={t.featuredImage} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  {t.tripLogo && (
                                    <img src={t.tripLogo} alt="" className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded bg-white p-0.5 object-contain" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-white text-xs group-hover:text-[#FFC72C] transition-colors truncate block">
                                    {t.countryFlag} {t.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 block truncate">
                                    {t.dates} • <strong className="text-neutral-200">{formatPriceJMD(t.price)}</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold bg-[#FFC72C]/20 text-[#FFC72C] group-hover:bg-[#FFC72C] group-hover:text-[#2E0249] px-2.5 py-1.5 rounded-lg transition-all shadow-sm">
                                <span>View Package</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Other Custom or Newly Added Trips */}
                    {trips.filter(
                      (t) => !(t.year === 2026 || t.is2026Featured) && !(t.year === 2027 || t.is2027Collection)
                    ).length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-purple-800/30">
                        <div className="px-2 pt-0.5 text-[10px] font-extrabold text-[#FFC72C] uppercase tracking-wider">
                          More Group Adventures
                        </div>
                        {trips
                          .filter(
                            (t) => !(t.year === 2026 || t.is2026Featured) && !(t.year === 2027 || t.is2027Collection)
                          )
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleNav('trip-detail', t.slug)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-[#3B185F] transition-all group flex items-center justify-between gap-3 border border-transparent hover:border-purple-600/50 cursor-pointer"
                              id={`dropdown-trip-${t.slug}`}
                              title={`View package for ${t.name}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-700 bg-neutral-800">
                                  <img src={t.featuredImage} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-white text-xs group-hover:text-[#FFC72C] transition-colors truncate block">
                                    {t.countryFlag} {t.name}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 block truncate">
                                    {t.dates} • <strong className="text-neutral-200">{formatPriceJMD(t.price)}</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold bg-[#FFC72C]/20 text-[#FFC72C] group-hover:bg-[#FFC72C] group-hover:text-[#2E0249] px-2.5 py-1.5 rounded-lg transition-all shadow-sm">
                                <span>View Package</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Bottom Catalog Bar */}
                    <div className="pt-2 border-t border-purple-800/40">
                      <button
                        onClick={() => handleNav('trips')}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2E0249] to-[#3B185F] hover:from-[#3B185F] hover:to-[#2E0249] border border-[#FFC72C]/30 text-[#FFC72C] text-xs font-extrabold text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer group"
                      >
                        <Plane className="w-4 h-4 text-[#FFC72C] group-hover:translate-x-0.5 transition-transform" />
                        <span>Browse All Group Packages Catalog (Full Grid)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('destinations')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'destinations' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-destinations-btn"
            >
              DESTINATIONS
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'about' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-about-btn"
            >
              ABOUT US
            </button>

            <button
              onClick={() => handleNav('guides')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'guides' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-guides-btn"
            >
              TRAVEL GUIDES
            </button>

            <button
              onClick={() => handleNav('faq')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'faq' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-faq-btn"
            >
              FAQ
            </button>

            <button
              onClick={() => handleNav('contact')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'contact' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
              }`}
              id="nav-contact-btn"
            >
              CONTACT
            </button>
          </div>

          {/* Right Action Icons & CTAs */}
          <div className="flex items-center gap-3">
            {/* Saved Trips Bookmark Button */}
            <button
              onClick={openSavedTripsDrawer}
              className="relative p-2 text-neutral-300 hover:text-[#FFC72C] hover:bg-purple-900/40 rounded-full transition-colors cursor-pointer"
              title="View bookmarked trips you saved to revisit"
              id="header-saved-trips-btn"
              aria-label="View saved trips"
            >
              <Bookmark className={`w-5 h-5 ${savedTripIds.length > 0 ? 'text-[#FFC72C]' : ''}`} />
              {savedTripIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFC72C] text-[#2E0249] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedTripIds.length}
                </span>
              )}
            </button>

            {/* Quick Search Button */}
            <button
              onClick={handleOpenSearch}
              className="p-2 text-neutral-300 hover:text-[#FFC72C] hover:bg-purple-900/40 rounded-full transition-colors"
              title="Search trips, guides, and destinations"
              id="header-search-btn"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Direct Booking CTA */}
            <button
              onClick={() => handleNav('trips')}
              className="hidden sm:inline-flex items-center gap-2 bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-5 py-2.5 rounded-full shadow-md shadow-[#FFC72C]/20 hover:scale-102 active:scale-98 transition-all"
              id="header-explore-trips-btn"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>EXPLORE TRIPS</span>
            </button>

            {/* Leave a Review Button - Placed on the right beside explore trips */}
            <button
              onClick={() => {
                if (activePage !== 'home') {
                  navigateTo('home');
                  setTimeout(() => {
                    const elem = document.getElementById('customer-review-section');
                    if (elem) {
                      elem.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      openReviewModal();
                    }
                  }, 200);
                } else {
                  const elem = document.getElementById('customer-review-section');
                  if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    openReviewModal();
                  }
                }
              }}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#3B185F] hover:bg-[#4A1D75] text-[#FFC72C] hover:text-white font-bold text-sm px-4 py-2.5 rounded-full border border-[#FFC72C]/40 hover:border-[#FFC72C] shadow-sm hover:scale-102 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
              id="header-leave-review-btn"
              title="Leave a traveler review on site"
            >
              <Star className="w-4 h-4 fill-[#FFC72C] text-[#FFC72C]" />
              <span>LEAVE A REVIEW</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#FFC72C] transition-colors"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle-btn"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1A1824] border-t border-purple-900/40 px-4 pt-3 pb-6 space-y-2 text-white shadow-xl animate-in slide-in-from-top duration-200">
            <button
              onClick={() => handleNav('home')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'home' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              HOME
            </button>
            {/* Mobile Trips Accordion */}
            <div className="rounded-xl border border-purple-900/30 overflow-hidden bg-purple-950/20">
              <button
                onClick={() => setIsMobileTripsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-base font-semibold ${
                  activePage === 'trips' || activePage === 'trip-detail'
                    ? 'bg-[#3B185F] text-[#FFC72C]'
                    : 'text-white hover:bg-neutral-800'
                }`}
                id="mobile-nav-trips-btn"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#FFC72C]" />
                  <span>TRIPS (Packages)</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                    isMobileTripsOpen ? 'rotate-180 text-[#FFC72C]' : ''
                  }`}
                />
              </button>

              {isMobileTripsOpen && (
                <div className="p-2 space-y-1.5 bg-[#151320] border-t border-purple-900/30">
                  <button
                    onClick={() => handleNav('trips')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#FFC72C] bg-purple-900/30 hover:bg-[#3B185F] flex items-center justify-between border border-purple-800/40"
                  >
                    <span>Browse All Packages Catalog</span>
                    <span className="flex items-center gap-1">All Trips <ArrowRight className="w-3 h-3" /></span>
                  </button>

                  <div className="px-2 pt-1.5 text-[10px] font-black text-[#FFC72C] uppercase tracking-wider">
                    Select a Package to View:
                  </div>

                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleNav('trip-detail', t.slug)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#3B185F] text-xs text-neutral-200 flex items-center justify-between group transition-colors border border-transparent hover:border-purple-700/40"
                      id={`mobile-trip-option-${t.slug}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-base shrink-0">{t.countryFlag}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{t.name}</span>
                          <span className="text-[10px] text-neutral-400 block truncate">{t.dates} • {formatPriceJMD(t.price)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-[#FFC72C] text-[#2E0249] px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        View Package
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleNav('destinations')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'destinations' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              DESTINATIONS
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'about' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              ABOUT US
            </button>
            <button
              onClick={() => handleNav('guides')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'guides' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              TRAVEL GUIDES
            </button>
            <button
              onClick={() => handleNav('faq')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'faq' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'contact' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              CONTACT
            </button>

            <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2.5">
              {/* Mobile Traveler Account Portal CTA */}
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-900/50 border border-[#FFC72C]/40 text-white font-bold text-xs flex items-center justify-between"
                  id="mobile-user-profile-btn"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FFC72C] text-[#2E0249] flex items-center justify-center text-xs font-black">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span>{currentUser.name} (Traveler Portal)</span>
                  </div>
                  <span className="text-[10px] text-[#FFC72C] underline">Manage</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700"
                    id="mobile-login-btn"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#FFC72C]" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-[#FFC72C] font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-700"
                    id="mobile-signup-btn"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSavedTripsDrawer();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-center flex items-center justify-center gap-2 border border-neutral-700 cursor-pointer text-xs"
                id="mobile-saved-trips-btn"
              >
                <Bookmark className={`w-4 h-4 ${savedTripIds.length > 0 ? 'text-[#FFC72C] fill-current' : ''}`} />
                <span>SAVED TRIPS ({savedTripIds.length})</span>
              </button>

              <button
                onClick={() => handleNav('trips')}
                className="w-full py-3 rounded-xl bg-[#FFC72C] text-[#2E0249] font-bold text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>BOOK A GROUP TRIP</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (activePage !== 'home') {
                    navigateTo('home');
                    setTimeout(() => {
                      const elem = document.getElementById('customer-review-section');
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      else openReviewModal();
                    }, 200);
                  } else {
                    const elem = document.getElementById('customer-review-section');
                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                    else openReviewModal();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#3B185F] text-[#FFC72C] font-bold text-center flex items-center justify-center gap-2 border border-[#FFC72C]/40 shadow-sm"
                id="mobile-leave-review-btn"
              >
                <Star className="w-4 h-4 fill-[#FFC72C]" />
                <span>LEAVE A REVIEW ON SITE</span>
              </button>

              <div className="flex items-center justify-between text-xs text-neutral-400 px-2 pt-2">
                <span>Call: {settings.primaryPhone}</span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenAdmin();
                  }}
                  className="text-[#FFC72C] underline flex items-center gap-1 font-semibold"
                >
                  <Lock className="w-3 h-3" /> {isAdminLoggedIn ? `${currentAdminRole} (Active)` : 'Admin (Protected)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
