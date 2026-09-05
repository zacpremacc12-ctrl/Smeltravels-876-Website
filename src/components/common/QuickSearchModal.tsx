import React, { useState, useMemo } from 'react';
import { Search, X, Plane, Compass, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickSearchModalProps {
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ onClose }) => {
  const { trips, destinations, blogPosts, faqs, navigateTo } = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { trips: [], destinations: [], blog: [], faqs: [] };
    const q = query.toLowerCase();

    return {
      trips: trips.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.hotel.toLowerCase().includes(q)
      ),
      destinations: destinations.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      ),
      blog: blogPosts.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tags.some(tag => tag.toLowerCase().includes(q))
      ),
      faqs: faqs.filter(
        f =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      ),
    };
  }, [query, trips, destinations, blogPosts, faqs]);

  const hasAnyResults =
    results.trips.length > 0 ||
    results.destinations.length > 0 ||
    results.blog.length > 0 ||
    results.faqs.length > 0;

  const handleSelectTrip = (slug: string) => {
    navigateTo('trips', slug);
    onClose();
  };

  const handleSelectDest = (slug: string) => {
    navigateTo('destinations', slug);
    onClose();
  };

  const handleSelectBlog = (slug: string) => {
    navigateTo('guides', slug);
    onClose();
  };

  const handleSelectFaq = () => {
    navigateTo('faq');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-200 flex items-center gap-3 bg-neutral-50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search Panama, Germany, Schengen visa, deposits, all-inclusive..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-5 text-sm">
          {!query.trim() ? (
            <div className="py-8 text-center text-neutral-400 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-neutral-300" />
              <p className="text-xs">Type a destination, travel year, hotel, or keyword to search the SMELTRAVELS876 platform.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['Panama 2026', 'Antigua', 'Schengen Visa', 'Punta Cana', 'Payment Plans'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="text-xs bg-neutral-100 hover:bg-purple-100 text-neutral-700 px-2.5 py-1 rounded-md border border-neutral-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="py-8 text-center text-neutral-500">
              <p>No results found matching "{query}".</p>
            </div>
          ) : (
            <>
              {/* Trips */}
              {results.trips.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 mb-2">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Group Trips ({results.trips.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {results.trips.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTrip(t.slug)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 flex items-center justify-between transition-colors border border-transparent hover:border-purple-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{t.countryFlag}</span>
                          <div>
                            <div className="font-bold text-neutral-900">{t.name}</div>
                            <div className="text-xs text-neutral-500">{t.dates} • ${t.price.toLocaleString()} JMD</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-900" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinations */}
              {results.destinations.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Destinations ({results.destinations.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {results.destinations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDest(d.slug)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 flex items-center justify-between transition-colors border border-transparent hover:border-amber-200"
                      >
                        <div>
                          <div className="font-bold text-neutral-900">{d.name} ({d.country})</div>
                          <div className="text-xs text-neutral-500 line-clamp-1">{d.tagline}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-900" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts */}
              {results.blog.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Travel Guides ({results.blog.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {results.blog.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBlog(b.slug)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between transition-colors"
                      >
                        <div className="pr-4">
                          <div className="font-semibold text-neutral-900 line-clamp-1">{b.title}</div>
                          <div className="text-xs text-neutral-500">{b.category} • {b.readTime}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {results.faqs.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 mb-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Answers in FAQs ({results.faqs.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {results.faqs.map((f) => (
                      <button
                        key={f.id}
                        onClick={handleSelectFaq}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between transition-colors"
                      >
                        <div className="pr-4">
                          <div className="font-semibold text-neutral-900">{f.question}</div>
                          <div className="text-xs text-neutral-500 line-clamp-1">{f.answer}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
