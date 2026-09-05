import React from 'react';
import { Compass, Send, CheckCircle2, FileText, Luggage, HeartHandshake } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorksSection: React.FC = () => {
  const { navigateTo } = useApp();

  const steps = [
    {
      num: '01',
      icon: Compass,
      title: 'Choose Your Trip',
      desc: 'Browse our upcoming 2026 and 2027 group packages to Panama, Antigua, Germany & Italy, Punta Cana, or Medellín.',
    },
    {
      num: '02',
      icon: Send,
      title: 'Submit Your Inquiry',
      desc: 'Tell us your preferred package, number of travelers, and questions. We verify availability and share trip details.',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: 'Secure Your Spot',
      desc: 'Lock in your booking with the designated deposit. Flexible installment payment plans are available thereafter.',
    },
    {
      num: '04',
      icon: FileText,
      title: 'Prepare Travel Documents',
      desc: 'We assist with immigration registrations, checklist requirements, and Schengen Visa guidance for European itineraries.',
    },
    {
      num: '05',
      icon: Luggage,
      title: 'Get Ready to Travel',
      desc: 'Receive your official flight vouchers, hotel confirmation pack, packing tips, and exclusive trip memorabilia.',
    },
    {
      num: '06',
      icon: HeartHandshake,
      title: 'Enjoy the Experience',
      desc: 'Meet your fellow travelers at Norman Manley (KIN), land at your destination, and embark on stress-free adventures.',
    },
  ];

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
            HOW GROUP TRAVEL WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
            Six Simple Steps to Your Next Adventure
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            We handle the heavy lifting so you can focus on making lifelong memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-3 right-4 text-3xl font-black text-neutral-200 font-['Outfit',sans-serif] select-none">
                  {step.num}
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigateTo('trips')}
            className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all"
          >
            Start By Choosing Your Trip
          </button>
        </div>
      </div>
    </section>
  );
};
