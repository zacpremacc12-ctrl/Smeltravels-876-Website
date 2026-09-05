import React from 'react';
import {
  Users,
  Compass,
  Car,
  FileCheck2,
  Hotel,
  Sparkles,
  CreditCard,
  Headphones,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhyChooseSection: React.FC = () => {
  const { settings, navigateTo } = useApp();

  const benefits = [
    {
      icon: Users,
      title: 'Organized Group Travel',
      description: 'Travel alongside a vibrant community of fellow adventurers. Shared experiences, camaraderie, and group buying advantages.',
    },
    {
      icon: Compass,
      title: 'Convenient Travel Planning',
      description: 'Zero itinerary stress. We handle flight sectors, hotel check-ins, and scheduled transfers so you simply pack and enjoy.',
    },
    {
      icon: Car,
      title: 'Airport Transfer Options',
      description: 'Pre-arranged roundtrip airport transfers in destination countries. No negotiating foreign taxi queues upon arrival.',
    },
    {
      icon: FileCheck2,
      title: 'Travel Document Preparation',
      description: 'Guidance with entry declarations, E-tickets, and Schengen Visa requirements for our European expeditions.',
    },
    {
      icon: Hotel,
      title: 'Carefully Selected Hotels',
      description: 'From beachfront all-inclusive resorts to upscale city properties like NH Collection and Jolly Beach.',
    },
    {
      icon: Sparkles,
      title: 'Excursion Options',
      description: 'Paid destination excursions included in our standard packages, curated to reveal authentic local culture and attractions.',
    },
    {
      icon: CreditCard,
      title: 'Flexible Payment Plans',
      description: 'Lock in your reservation with an initial deposit, then pay your remaining balance in convenient installments before departure.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Customer Support',
      description: 'Personalized assistance from our team and Ambassador Zachary Buchanan before, during, and after your trip.',
    },
  ];

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
            SMELTRAVELS876 ADVANTAGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
            Why Travel With Us?
          </h2>
          <p className="text-neutral-600 text-base mt-2">
            Our founding philosophy is simple: <strong className="text-neutral-900 font-bold">"Travel More. Worry Less."</strong> Here is how we make international group travel effortless for Jamaican and Caribbean travelers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#2E0249] flex items-center justify-center">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    {b.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner with Ambassador Contact Note */}
        <div className="mt-12 bg-gradient-to-r from-[#2E0249] to-[#3B185F] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
              Have questions about an upcoming destination?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              Speak directly with our agency team or Ambassador Zachary Buchanan ({settings.ambassadorPhone}).
            </p>
          </div>
          <button
            onClick={() => navigateTo('contact')}
            className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-bold text-sm px-6 py-3 rounded-xl transition-all shadow shrink-0"
          >
            Contact Travel Advisors
          </button>
        </div>
      </div>
    </section>
  );
};
