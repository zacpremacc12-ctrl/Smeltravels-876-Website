import React from 'react';
import {
  Plane,
  Users,
  Compass,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { settings, navigateTo } = useApp();

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider">
            <Plane className="w-3.5 h-3.5 transform rotate-[-45deg]" />
            <span>ABOUT SMELTRAVELS876</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Travel More. Worry Less.
          </h1>

          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            SMELTRAVELS876 is a Jamaican travel agency dedicated to making international travel accessible, organized, and stress-free through curated group experiences.
          </p>
        </div>

        {/* Section 1: Who We Are & What We Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Who We Are
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We are a passionate team of Jamaican travel coordinators and group travel specialists. We believe that stepping out to see the world should be an empowering and exhilarating journey, not a labyrinth of confusing flight connections, foreign taxi negotiations, and visa paperwork headaches.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
              What We Do
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We curate comprehensive group travel packages featuring verified flights departing from Kingston (KIN), handpicked hotel properties, airport transfers, paid cultural excursions, and travel document preparation—all backed by clear deposit terms and manageable installment payment plans.
            </p>
          </div>
        </div>

        {/* Section 2: Our Approach to Travel */}
        <div className="bg-gradient-to-br from-[#2E0249] to-[#3B185F] text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
              OUR CORE PHILOSOPHY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-['Outfit',sans-serif]">
              Our Approach to Travel
            </h2>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              Planning international trips from the Caribbean often comes with distinct visa questions, transit logistics, and budgeting needs. Our approach addresses these directly:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-purple-800/60">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#FFC72C]">Zero Hidden Logistics</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Airport transfers and core excursions are locked in beforehand so travelers are never stranded in unfamiliar surroundings.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#FFC72C]">Proactive Visa Support</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Whether traveling visa-free to Panama or needing full Schengen Visa assistance for Germany & Italy, we provide structured document checklists.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#FFC72C]">Community & Camaraderie</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Travel solo or with friends. Our group departures unite like-minded travelers who create shared memories together.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: The Group Travel Experience */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
              The Group Travel Experience
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              On a SMELTRAVELS876 group trip, you enjoy the perfect balance of organized group excursions and personal downtime. You never have to worry about waking up to coordinate foreign transportation or negotiate taxi fares in another currency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              'Guaranteed group departures with confirmed flight seats',
              'Pre-booked roundtrip airport transfers in destination country',
              'Daily breakfast or all-inclusive dining depending on package',
              'Two paid excursions curated to showcase the destination',
              'Exclusive trip memorabilia included in every package',
              'Personalized support before departure and throughout your trip',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ambassador Spotlight */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-[#2E0249] shrink-0">
              <UserCheck className="w-12 h-12" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-1 rounded">
                AMBASSADOR SPOTLIGHT
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                {settings.ambassadorName}
              </h3>
              <p className="text-xs text-neutral-500 font-semibold">{settings.ambassadorTitle}</p>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl leading-relaxed">
                Connect directly with Zachary for one-on-one inquiries about upcoming 2026 and 2027 package details, group bookings, payment plans, and travel document requirements.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
                <a
                  href={`tel:${settings.ambassadorPhone.replace(/[^0-9]/g, '')}`}
                  className="font-bold text-[#2E0249] hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{settings.ambassadorPhone}</span>
                </a>
                <a
                  href={`mailto:${settings.ambassadorEmail}`}
                  className="font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{settings.ambassadorEmail}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigateTo('trips')}
            className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all"
          >
            Explore Our Upcoming Group Trips
          </button>
        </div>
      </div>
    </div>
  );
};
