import React, { useState } from 'react';
import {
  Plane,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Send,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Lock,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './common/BrandLogo';

interface FooterProps {
  onOpenLegal: (topic: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenAdmin }) => {
  const { settings, subscribeNewsletter, navigateTo, showNotification } = useApp();
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [hasConsented, setHasConsented] = useState(true);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterName) return;
    if (!hasConsented) {
      showNotification('Consent Required', 'Please confirm you wish to receive trip updates.', 'warning');
      return;
    }
    const success = subscribeNewsletter(newsletterName.trim(), newsletterEmail.trim());
    if (success) {
      setSubscribedSuccess(true);
      showNotification('Welcome aboard!', 'You are subscribed to SMELTRAVELS876 upcoming trips.');
      setNewsletterName('');
      setNewsletterEmail('');
    } else {
      showNotification('Already Subscribed', 'This email is already on our travel priority list.', 'info');
    }
  };

  return (
    <footer className="bg-[#1A1824] text-neutral-300 border-t border-purple-900/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigateTo('home')}
              className="cursor-pointer flex items-center group"
            >
              <BrandLogo size="md" tagline={settings.tagline} />
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Your premier Jamaican group travel agency. We specialize in organized international adventures, complete flight & hotel packages, airport transfers, and travel document preparation.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-neutral-300 hover:text-[#FFC72C] hover:border-[#FFC72C] transition-all"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-neutral-300 hover:text-[#FFC72C] hover:border-[#FFC72C] transition-all"
                title="Follow on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessageTemplate)}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
                title="Chat on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-['Outfit',sans-serif]">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trips')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  All Group Trips
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('destinations')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  Destinations Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  About SMELTRAVELS876
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('guides')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  Travel Guides & Visa Tips
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('faq')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-[#FFC72C] transition-colors"
                >
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Real Upcoming Packages */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-['Outfit',sans-serif]">
              UPCOMING TRIPS
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => navigateTo('trip-detail', 'panama-2026')}
                  className="hover:text-[#FFC72C] transition-colors text-left group cursor-pointer"
                >
                  <div className="font-semibold text-white group-hover:text-[#FFC72C] flex items-center gap-1">
                    <span>🇵🇦 Panama 2026 Part 2</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">Oct 13–18, 2026 • From $152,303</div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trip-detail', 'antigua-2027')}
                  className="hover:text-[#FFC72C] transition-colors text-left group cursor-pointer"
                >
                  <div className="font-semibold text-white group-hover:text-[#FFC72C]">
                    🇦🇬 Antigua Jolly Beach
                  </div>
                  <div className="text-[11px] text-neutral-400">Jan 24–28, 2027 • All Inclusive</div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trip-detail', 'germany-italy-2027')}
                  className="hover:text-[#FFC72C] transition-colors text-left group cursor-pointer"
                >
                  <div className="font-semibold text-white group-hover:text-[#FFC72C]">
                    🇩🇪🇮🇹 Germany + Italy
                  </div>
                  <div className="text-[11px] text-neutral-400">Feb 3–10, 2027 • Frankfurt & Milan</div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trip-detail', 'punta-cana-2027')}
                  className="hover:text-[#FFC72C] transition-colors text-left group cursor-pointer"
                >
                  <div className="font-semibold text-white group-hover:text-[#FFC72C]">
                    🇩🇴 Punta Cana Riu Bambu
                  </div>
                  <div className="text-[11px] text-neutral-400">Mar 23–27, 2027 • All Inclusive</div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trip-detail', 'medellin-2027')}
                  className="hover:text-[#FFC72C] transition-colors text-left group cursor-pointer"
                >
                  <div className="font-semibold text-white group-hover:text-[#FFC72C]">
                    🇨🇴 Medellín NH Collection
                  </div>
                  <div className="text-[11px] text-neutral-400">May 20–25, 2027 • City of Spring</div>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contacts */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-['Outfit',sans-serif]">
              CONTACT US
            </h4>
            <div className="space-y-2.5 text-neutral-300">
              <div>
                <span className="text-neutral-400 block text-[11px] font-semibold uppercase">Primary Agency</span>
                <a
                  href={`tel:${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
                  className="font-medium text-white hover:text-[#FFC72C] flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>{settings.primaryPhone}</span>
                </a>
                <a
                  href={`mailto:${settings.primaryEmail}`}
                  className="text-neutral-400 hover:text-white flex items-center gap-1.5 mt-1"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span className="truncate">{settings.primaryEmail}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 block text-[11px] font-semibold uppercase">Ambassador Network</span>
                  {settings.ambassadors && settings.ambassadors.length > 1 && (
                    <span className="text-[10px] text-[#FFC72C] font-mono font-bold">
                      {settings.ambassadors.length} Agents
                    </span>
                  )}
                </div>
                <div className="font-medium text-white flex items-center gap-1.5 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>{settings.ambassadorName || (settings.ambassadors?.[0]?.name ?? 'Zachary Buchanan')}</span>
                </div>
                <a
                  href={`tel:${(settings.ambassadorPhone || (settings.ambassadors?.[0]?.phone ?? '(876) 848-9772')).replace(/[^0-9]/g, '')}`}
                  className="text-neutral-300 hover:text-[#FFC72C] block mt-0.5"
                >
                  {settings.ambassadorPhone || (settings.ambassadors?.[0]?.phone ?? '(876) 848-9772')}
                </a>
                <a
                  href={`mailto:${settings.ambassadorEmail || (settings.ambassadors?.[0]?.email ?? 'zbuchanan.smeltravels@gmail.com')}`}
                  className="text-neutral-400 hover:text-white block mt-0.5 truncate"
                >
                  {settings.ambassadorEmail || (settings.ambassadors?.[0]?.email ?? 'zbuchanan.smeltravels@gmail.com')}
                </a>
              </div>

              <div className="pt-2 flex items-start gap-1.5 text-neutral-400">
                <MapPin className="w-3.5 h-3.5 text-[#FFC72C] shrink-0 mt-0.5" />
                <span>{settings.operatingBase || 'Kingston, Jamaica'} (Serving Islandwide & Diaspora)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Banner */}
        <div className="my-10 bg-purple-950/40 border border-purple-800/40 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <h4 className="text-white text-lg font-bold font-['Outfit',sans-serif]">
                Get Updates On Upcoming Trips & Travel Deals
              </h4>
              <p className="text-neutral-400 text-sm max-w-xl">
                Get updates on upcoming trips, travel deals, new destinations, and SMELTRAVELS876 announcements. Payment plan notifications sent directly to your inbox.
              </p>
            </div>

            {subscribedSuccess ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm bg-emerald-950/50 border border-emerald-800 px-4 py-3 rounded-xl">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you! You will receive our latest trip announcements.</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  placeholder="First name"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  required
                  className="w-full sm:w-36 bg-[#111019] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFC72C]"
                />
                <input
                  type="email"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full sm:w-64 bg-[#111019] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFC72C]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
            <input
              type="checkbox"
              id="footer-consent-checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="rounded accent-[#FFC72C]"
            />
            <label htmlFor="footer-consent-checkbox" className="cursor-pointer">
              I consent to receive travel announcements from SMELTRAVELS876. You can unsubscribe at any time.
            </label>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} SMELTRAVELS876. All rights reserved.</span>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-[#FFC72C] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-[#FFC72C] transition-colors"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onOpenLegal('booking')}
              className="hover:text-[#FFC72C] transition-colors"
            >
              Booking Terms
            </button>
            <button
              onClick={() => onOpenLegal('cancellation')}
              className="hover:text-[#FFC72C] transition-colors"
            >
              Cancellation & Refund Policy
            </button>
            <button
              onClick={() => onOpenLegal('schengen')}
              className="hover:text-[#FFC72C] transition-colors"
            >
              Schengen Visa Notice
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="text-neutral-400 hover:text-[#FFC72C] flex items-center gap-1.5 transition-colors font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Agency CMS Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
