import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, HelpCircle, Phone, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FAQCategory } from '../../types';

export const FAQSection: React.FC = () => {
  const { faqs, settings, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const categories: string[] = [
    'All',
    'Booking',
    'Payments',
    'Travel Documents',
    'Group Trips',
    'Flights',
    'Hotels',
    'Airport Transfers',
    'Excursions',
    'Cancellations',
    'General Questions',
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-neutral-200" id="faq">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
            GOT QUESTIONS?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Everything you need to know about deposits, payment plans, flights, and travel requirements.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. deposit, passport, payment plan, flight)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:border-[#2E0249]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2E0249] text-[#FFC72C]'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-900 hover:text-purple-900 transition-colors"
                  >
                    <span className="font-['Outfit',sans-serif]">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#2E0249]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-neutral-200 p-8">
              <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 font-medium">
                No matching questions found for "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-[#2E0249] font-bold underline"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>

        {/* Direct Contact Prompt */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-neutral-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-neutral-900 font-['Outfit',sans-serif]">
              Still have a specific question?
            </h4>
            <p className="text-xs text-neutral-600">
              Our travel specialists are ready to answer your inquiries directly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
              className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({settings.primaryPhone})</span>
            </a>
            <button
              onClick={() => navigateTo('contact')}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
