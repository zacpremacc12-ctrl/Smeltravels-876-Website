import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LegalPolicyPageProps {
  initialTab?: string | null;
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({ initialTab }) => {
  const { settings, navigateTo } = useApp();
  const [activePolicyTab, setActivePolicyTab] = useState<string>(() => {
    if (initialTab && ['terms', 'privacy', 'cancellation', 'schengen'].includes(initialTab)) {
      return initialTab;
    }
    return 'booking';
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-[#2E0249] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 font-['Outfit',sans-serif]">
            Legal Policies & Travel Terms
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            SMELTRAVELS876 Operating Disclaimers, Booking Conditions, and Cancellation Framework.
          </p>
        </div>

        {/* Policy Tab Selectors */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-8 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          {[
            { id: 'booking', label: 'Booking & Payment Terms' },
            { id: 'cancellation', label: 'Cancellations & Refunds' },
            { id: 'schengen', label: 'Schengen & Visa Disclaimer' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'terms', label: 'Terms of Website Use' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePolicyTab(tab.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activePolicyTab === tab.id
                  ? 'bg-[#2E0249] text-[#FFC72C]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm text-neutral-700 text-xs sm:text-sm space-y-6 leading-relaxed">
          {activePolicyTab === 'booking' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                1. Booking & Payment Terms
              </h2>
              <p>
                All group packages organized by SMELTRAVELS876 are subject to availability and supplier confirmation. A booking is formally confirmed once the mandatory initial deposit has been received and verified by our travel team.
              </p>
              <h3 className="font-bold text-neutral-900 pt-2">Deposit Structure & Installments</h3>
              <p>
                Deposits lock in flight inventory and hotel allocations. Following deposit payment, the remaining balance can be settled in flexible monthly installments as outlined on your trip voucher, provided the full trip balance is cleared 45 days prior to scheduled departure.
              </p>
              <h3 className="font-bold text-neutral-900 pt-2">Rates & Currency</h3>
              <p>
                Package prices are quoted per person based on double occupancy in Jamaican Dollars (JMD) or US Dollars (USD) where explicitly designated. Single occupancy rooms are available on request subject to hotel supplement rates.
              </p>
            </div>
          )}

          {activePolicyTab === 'cancellation' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                2. Cancellations & Refund Framework
              </h2>
              <p>
                We understand unforeseen life circumstances can emerge. Because airline tickets and hotel group blocks involve contractual advance commitments, the following cancellation guidelines apply:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Initial Deposits:</strong> Initial deposits are generally non-refundable once airline booking sectors and room allocations have been secured.
                </li>
                <li>
                  <strong>Cancellation 60+ Days Prior:</strong> Installment payments made above the initial non-refundable deposit are eligible for refund or credit toward a future SMELTRAVELS876 departure.
                </li>
                <li>
                  <strong>Cancellation Under 45 Days:</strong> Subject to airline and hotel supplier penalties. SMELTRAVELS876 will advocate on the traveler's behalf for any supplier credits possible.
                </li>
                <li>
                  <strong>Name Changes & Transfers:</strong> In most cases, a traveler may transfer their group package reservation to a qualified replacement traveler up to 21 days prior to departure, subject to airline administrative ticket reissue fees.
                </li>
              </ul>
            </div>
          )}

          {activePolicyTab === 'schengen' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Official Visa & Embassy Disclaimer</h3>
                  <p className="mt-1 text-xs leading-relaxed">
                    SMELTRAVELS876 provides travel coordination, official flight reservations, hotel vouchers, and appointment checklist guidance. However, foreign visa issuance and entry permissions are at the sole discretion of sovereign government embassies, consulates, and border control officers.
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-neutral-900 pt-2">Germany & Italy Schengen Requirements</h3>
              <p>
                Jamaican passport holders traveling on our 2027 Germany + Italy group package require an active Schengen Visa. Travelers are responsible for submitting truthful documents, attending their biometric appointment at the relevant European consulate or visa processing center, and holding a valid passport with at least six months validity beyond the date of departure.
              </p>
            </div>
          )}

          {activePolicyTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                3. Privacy & Customer Data Notice
              </h2>
              <p>
                SMELTRAVELS876 respects your privacy. When you request a quote or submit an inquiry, we collect contact information (name, phone, email, parish/country) and travel preferences strictly to fulfill airline booking requirements, issue travel vouchers, and coordinate your package.
              </p>
              <p>
                We never sell or monetize traveler records to third-party advertisers. Information is only shared with verified travel service suppliers (airlines, registered hotels, licensed transport operators) necessary to complete your travel reservation.
              </p>
            </div>
          )}

          {activePolicyTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                4. Website Terms of Use
              </h2>
              <p>
                Content, imagery, logos, and package designs presented on this web platform are proprietary to SMELTRAVELS876. While every effort is made to maintain accurate pricing, dates, and hotel details, suppliers may occasionally adjust flight schedules or hotel room categories due to operational requirements.
              </p>
              <p>
                For official booking confirmation or custom policy questions, please contact our team directly at <a href={`mailto:${settings.primaryEmail}`} className="text-[#2E0249] font-bold underline">{settings.primaryEmail}</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
