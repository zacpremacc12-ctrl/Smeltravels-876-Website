import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginLock: React.FC = () => {
  const { loginAdminWithCredentials, navigateTo, settings } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'unreachable'>('checking');

  const checkServerHealth = async () => {
    setServerStatus('checking');
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === 'ok') {
        setServerStatus('online');
        return true;
      }
      setServerStatus('unreachable');
      return false;
    } catch {
      setServerStatus('unreachable');
      return false;
    }
  };

  React.useEffect(() => {
    checkServerHealth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter the administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter the administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAdminWithCredentials(email, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Access denied.');
        if (result.error && (result.error.includes('503') || result.error.includes('unreachable'))) {
          setServerStatus('unreachable');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleAutofillEmail = (adminEmail: string) => {
    setEmail(adminEmail);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-900/95 relative overflow-hidden">
      {/* Subtle Background Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2E0249] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-900 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="w-full max-w-md bg-[#1C1226] border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-white backdrop-blur-md">
        {/* Live Backend Connection Status Pill */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                serverStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : serverStatus === 'checking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
              }`}
            />
            <span className="text-[11px] font-semibold text-neutral-300">
              {serverStatus === 'online'
                ? 'Backend API: Online'
                : serverStatus === 'checking'
                ? 'Checking backend...'
                : 'Backend: Stopped / 503'}
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              const ok = await checkServerHealth();
              if (ok && errorMessage && errorMessage.includes('503')) {
                setErrorMessage(null);
              }
            }}
            className="text-[10px] text-purple-300 hover:text-white px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 hover:bg-purple-900 transition-colors"
          >
            Recheck API
          </button>
        </div>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E0249] to-purple-950 border border-[#FFC72C]/40 flex items-center justify-center shadow-lg shadow-purple-950/60">
              <Lock className="w-8 h-8 text-[#FFC72C]" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 p-1 rounded-full text-[10px] font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/50 text-[11px] font-bold text-purple-200 tracking-wider uppercase mb-2">
            <span>Restricted Access</span>
          </div>

          <h1 className="text-2xl font-black font-['Outfit',sans-serif] text-white">
            Admin Portal Locked
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Enter your authorized administrator email and password to access the {settings.siteName || 'SMELTRAVELS876'} management console.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
            {(errorMessage.includes('Hostinger Gateway') || errorMessage.includes('503') || errorMessage.includes('unreachable')) && (
              <div className="mt-1 pt-2 border-t border-rose-800/60 flex items-center justify-between text-[11px] text-rose-300">
                <span>Node.js process may be starting up on Hostinger.</span>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await checkServerHealth();
                    if (ok) {
                      setErrorMessage(null);
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-900/90 hover:bg-rose-800 text-white rounded-lg font-bold border border-rose-500/50 transition-colors"
                >
                  Test Reconnect
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="text-xs font-bold text-neutral-300">
                Administrator Email
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAutofillEmail('zacpremacc12@gmail.com')}
                  className="text-[10px] bg-purple-900/70 hover:bg-purple-800 text-[#FFC72C] px-2 py-0.5 rounded border border-[#FFC72C]/40 font-bold transition-colors"
                  title="Autofill zacpremacc12@gmail.com (Lead Admin)"
                >
                  Zachary (Lead)
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofillEmail('smeltravels876@gmail.com')}
                  className="text-[10px] bg-purple-900/50 hover:bg-purple-800 text-purple-200 px-2 py-0.5 rounded border border-purple-700/50 font-semibold transition-colors"
                  title="Autofill smeltravels876@gmail.com (CEO)"
                >
                  Elvoy (CEO)
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofillEmail('zbuchanan.smeltravels@gmail.com')}
                  className="text-[10px] bg-purple-900/50 hover:bg-purple-800 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40 text-[9px] font-medium transition-colors"
                  title="Autofill zbuchanan.smeltravels@gmail.com"
                >
                  zbuchanan
                </button>
              </div>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                id="admin-email-input"
                autoComplete="email"
                placeholder="smeltravels876@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-neutral-900/90 border border-purple-900/70 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Administrator Password
              </label>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="admin-password-input"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-900/90 border border-purple-900/70 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="admin-unlock-btn"
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFC72C] to-amber-400 hover:from-amber-400 hover:to-[#FFC72C] text-[#2E0249] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#2E0249] border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-5 border-t border-purple-900/40 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="mt-3 text-xs text-neutral-400 hover:text-[#FFC72C] transition-colors inline-flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Live Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
