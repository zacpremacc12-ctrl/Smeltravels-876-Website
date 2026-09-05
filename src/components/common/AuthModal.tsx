import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Plane,
  LogOut,
  Ticket,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    currentUser,
    loginUser,
    signupUser,
    logoutUser,
    bookings,
    navigateTo,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parish, setParish] = useState('Kingston & St. Andrew');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Error/validation state
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    loginUser(email.trim());
    setEmail('');
    setPassword('');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the traveler terms to continue.');
      return;
    }

    signupUser(name, email, phone, parish);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
  };

  const handleDemoLogin = () => {
    loginUser('zacpremacc12@gmail.com', 'Zachary Buchanan', '(876) 848-9772');
  };

  // Traveler's existing bookings matching email or name
  const userBookings = currentUser
    ? bookings.filter(
        (b) =>
          b.email.toLowerCase() === currentUser.email.toLowerCase() ||
          b.customerName.toLowerCase().includes(currentUser.name.toLowerCase())
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAuthModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-[#2E0249] to-[#3B185F] text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black shadow-md">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Outfit',sans-serif] tracking-tight">
                SMELTRAVELS<span className="text-[#FFC72C]">876</span>
              </h2>
              <p className="text-xs text-purple-200">
                {currentUser ? 'Traveler Account Hub' : 'Traveler Portal • Sign In / Register'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {currentUser ? (
            /* Logged-In User Profile & Active Bookings */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-[#FFC72C] text-[#2E0249] font-black text-lg flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">{currentUser.name}</h3>
                    <p className="text-xs text-neutral-500">{currentUser.email}</p>
                    {currentUser.phone && (
                      <p className="text-[11px] text-neutral-400">{currentUser.phone}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={logoutUser}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-600 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Account Quick Stats */}
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#2E0249]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FFC72C] fill-current" />
                    <span>Member Level</span>
                  </span>
                  <span className="bg-[#FFC72C] text-[#2E0249] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Verified Traveler
                  </span>
                </div>
                <p className="text-neutral-600">
                  Parish / Base: <strong>{currentUser.homeParishOrCountry || 'Jamaica'}</strong>
                </p>
                <p className="text-neutral-600">
                  Member Since: <strong>{currentUser.memberSince || '2026'}</strong>
                </p>
              </div>

              {/* User Inquiries / Bookings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-purple-900" />
                    <span>Your Bookings & Inquiries ({userBookings.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      navigateTo('trips');
                    }}
                    className="text-xs font-bold text-[#2E0249] hover:underline flex items-center gap-0.5"
                  >
                    <span>Browse Trips</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {userBookings.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {userBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-neutral-900">{b.tripName}</div>
                          <div className="text-[11px] text-neutral-500">
                            Ref: <span className="font-mono text-purple-900 font-bold">{b.referenceNumber}</span> • {b.preferredTravelDate}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed' || b.status === 'Deposit Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-xl p-4 text-center text-xs text-neutral-500">
                    <p>You haven't submitted any group trip inquiries yet.</p>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(false);
                        navigateTo('trips');
                      }}
                      className="mt-2 text-xs font-bold text-[#2E0249] underline"
                    >
                      Explore 2026 & 2027 Group Packages
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-xs hover:bg-neutral-200 transition-colors"
              >
                Close Portal
              </button>
            </div>
          ) : (
            /* Login / Signup Tabs & Forms */
            <div>
              {/* Tab Selector */}
              <div className="flex bg-neutral-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    authModalMode === 'login'
                      ? 'bg-white text-[#2E0249] shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    authModalMode === 'signup'
                      ? 'bg-white text-[#2E0249] shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {authModalMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Email Address or Phone
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. traveler@gmail.com or 876-848-9772"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-neutral-700">Password</label>
                      <span className="text-[11px] text-purple-900 hover:underline cursor-pointer">
                        Forgot Password?
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-black text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>LOG IN TO TRAVELER PORTAL</span>
                  </button>

                  {/* One-click Demo Login Helper */}
                  <div className="pt-3 border-t border-neutral-100 text-center">
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-[#2E0249] bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFC72C] fill-current" />
                      <span>Quick Demo Sign-In (Zachary Buchanan)</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SIGN UP FORM */}
              {authModalMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Zachary Buchanan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="name@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="(876) 848-9772"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Parish / Country
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={parish}
                          onChange={(e) => setParish(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249] bg-white font-medium"
                        >
                          <option value="Kingston & St. Andrew">Kingston & St. Andrew</option>
                          <option value="St. Catherine">St. Catherine</option>
                          <option value="Montego Bay (St. James)">Montego Bay (St. James)</option>
                          <option value="St. Ann (Ocho Rios)">St. Ann (Ocho Rios)</option>
                          <option value="Manchester">Manchester</option>
                          <option value="Westmoreland (Negril)">Westmoreland (Negril)</option>
                          <option value="Clarendon">Clarendon</option>
                          <option value="Portland">Portland</option>
                          <option value="Overseas / Diaspora">Overseas / Diaspora</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 6 chars"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer text-xs text-neutral-600 pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#2E0249] focus:ring-[#2E0249]"
                    />
                    <span>
                      I agree to receive trip updates, Panama 2026 and 2027 group itineraries.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-black text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>CREATE TRAVELER ACCOUNT</span>
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1 text-xs text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct group reservation & customer care support</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
