import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OffersSection: React.FC = () => {
  const { offers, navigateTo, showNotification } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffers = offers.filter(o => o.isActive);
  if (activeOffers.length === 0) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showNotification('Code Copied!', `Promo code "${code}" copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
            EXCLUSIVE PROMOTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
            Special Offers & Booking Incentives
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Take advantage of early booking promotions and group referral credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gradient-to-br from-purple-50 via-white to-amber-50/40 rounded-2xl p-6 sm:p-8 border border-purple-200 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#2E0249] text-[#FFC72C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {offer.badgeText}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    Valid until: {offer.validUntil}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  {offer.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {offer.description}
                </p>

                <div className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                      Benefit
                    </span>
                    <span className="text-xs font-bold text-[#2E0249]">
                      {offer.discountSummary}
                    </span>
                  </div>

                  {offer.promoCode && (
                    <button
                      onClick={() => handleCopyCode(offer.promoCode!)}
                      className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-colors border border-neutral-300"
                      title="Click to copy promo code"
                    >
                      {copiedCode === offer.promoCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{offer.promoCode}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-neutral-400 italic">
                  * {offer.terms}
                </p>
              </div>

              <div className="pt-6 border-t border-purple-100 mt-6 flex items-center justify-between">
                <button
                  onClick={() => navigateTo('trips')}
                  className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>{offer.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
