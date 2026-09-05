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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './common/BrandLogo';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenAdmin }) => {
  const {
    settings,
    navigateTo,
    activePage,
    isAdminLoggedIn,
    currentAdminRole,
    currentUser,
    openAuthModal,
    setIsSearchOpen,
  } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTripsDropdownOpen, setIsTripsDropdownOpen] = useState(false);

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
            className="cursor-pointer group flex items-center"
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
                onClick={() => handleNav('trips')}
                className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors py-1 ${
                  activePage === 'trips' ? 'text-[#FFC72C]' : 'text-neutral-200 hover:text-white'
                }`}
                id="nav-trips-btn"
              >
                <span>TRIPS</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isTripsDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50">
                  <div className="bg-[#1A1824] rounded-xl shadow-2xl border border-purple-800/40 p-2 text-sm text-neutral-200">
                    <button
                      onClick={() => handleNav('trips')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#3B185F] hover:text-[#FFC72C] font-medium flex items-center justify-between"
                    >
                      <span>All Group Trips</span>
                      <span className="text-xs text-neutral-400">View All</span>
                    </button>
                    <div className="my-1 border-t border-neutral-800"></div>
                    <div className="px-3 py-1 text-[11px] font-bold text-[#FFC72C] uppercase tracking-wider">
                      2026 Featured
                    </div>
                    <button
                      onClick={() => handleNav('trips', '2026')}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#3B185F] text-xs flex items-center justify-between"
                    >
                      <span>🇵🇦 Panama 2026 Part 2</span>
                      <span className="text-[10px] bg-[#FFC72C]/20 text-[#FFC72C] px-1 rounded">Oct '26</span>
                    </button>

                    <div className="mt-2 px-3 py-1 text-[11px] font-bold text-[#FFC72C] uppercase tracking-wider">
                      2027 Group Trips
                    </div>
                    <button
                      onClick={() => handleNav('trips', '2027')}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#3B185F] text-xs flex items-center justify-between"
                    >
                      <span>🇦🇬 Antigua Jolly Beach</span>
                      <span className="text-[10px] text-neutral-400">Jan '27</span>
                    </button>
                    <button
                      onClick={() => handleNav('trips', '2027')}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#3B185F] text-xs flex items-center justify-between"
                    >
                      <span>🇩🇪🇮🇹 Germany + Italy</span>
                      <span className="text-[10px] text-neutral-400">Feb '27</span>
                    </button>
                    <button
                      onClick={() => handleNav('trips', '2027')}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#3B185F] text-xs flex items-center justify-between"
                    >
                      <span>🇩🇴 Punta Cana Riu Bambu</span>
                      <span className="text-[10px] text-neutral-400">Mar '27</span>
                    </button>
                    <button
                      onClick={() => handleNav('trips', '2027')}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#3B185F] text-xs flex items-center justify-between"
                    >
                      <span>🇨🇴 Medellín NH Collection</span>
                      <span className="text-[10px] text-neutral-400">May '27</span>
                    </button>
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
            <button
              onClick={() => handleNav('trips')}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold ${
                activePage === 'trips' ? 'bg-[#3B185F] text-[#FFC72C]' : 'hover:bg-neutral-800'
              }`}
            >
              TRIPS (2026 & 2027 Packages)
            </button>
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
                onClick={() => handleNav('trips')}
                className="w-full py-3 rounded-xl bg-[#FFC72C] text-[#2E0249] font-bold text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>BOOK A GROUP TRIP</span>
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
