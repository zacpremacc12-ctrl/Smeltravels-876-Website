import React from 'react';
import { Sparkles, ArrowRight, Plane, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BookingCTASection: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <section className="relative py-20 bg-gradient-to-r from-[#2E0249] via-[#381254] to-[#2E0249] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#FFC72C] blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#FFC72C]">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>JOIN OUR NEXT GROUP DEPARTURE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-['Outfit',sans-serif] max-w-2xl mx-auto leading-tight">
          Ready to Travel More and Worry Less?
        </h2>

        <p className="text-neutral-200 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-normal">
          Spots fill quickly on our organized group trips. Choose your dream destination, place your deposit, and let SMELTRAVELS876 manage the details.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('trips')}
            className="w-full sm:w-auto bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-[#FFC72C]/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Group Trips</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-7 py-4 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
          >
            Contact SMELTRAVELS876
          </button>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
            <span>Curated Flight & Hotel Packages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
            <span>Guaranteed Airport Transfers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
            <span>Schengen & Travel Document Assistance</span>
          </div>
        </div>
      </div>
    </section>
  );
};
