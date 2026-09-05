import React from 'react';
import { Star, MessageSquare, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TestimonialsSection: React.FC = () => {
  const { testimonials, navigateTo } = useApp();

  const publishedTestimonials = testimonials.filter(t => t.isPublished);

  return (
    <section className="py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
            TRAVELER REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
            What Our Community Says
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Organized trips designed to foster camaraderie, new friendships, and unforgettable memories.
          </p>
        </div>

        {/* Authenticity notice */}
        <div className="max-w-2xl mx-auto mb-8 p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs flex items-center justify-center gap-2 text-center">
          <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>
            <strong>Agency Policy:</strong> We do not publish unverified customer reviews. Development placeholders below are designed for administrator replacement with verified traveler submissions.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {publishedTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF9F6] p-6 sm:p-8 rounded-2xl border border-neutral-200 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? 'text-[#FFC72C] fill-[#FFC72C]'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>

                  {item.isSamplePlaceholder && (
                    <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-mono">
                      CMS Placeholder
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 italic leading-relaxed">
                  "{item.reviewText}"
                </p>
              </div>

              <div className="pt-5 border-t border-neutral-200 mt-5 flex items-center gap-3">
                <img
                  src={item.avatarUrl}
                  alt={item.customerName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-300"
                />
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 font-['Outfit',sans-serif]">
                    {item.customerName}
                  </h4>
                  <div className="text-[11px] text-neutral-500">
                    {item.location} • <span className="text-purple-900 font-medium">{item.tripName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
