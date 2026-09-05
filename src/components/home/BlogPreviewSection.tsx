import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BlogPreviewSection: React.FC = () => {
  const { blogPosts, navigateTo } = useApp();

  const previewPosts = blogPosts.filter(p => p.isPublished).slice(0, 3);

  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-neutral-200" id="guides">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>TRAVEL GUIDES & INSIGHTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
              Destination Guides & Travel Advice
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-xl">
              Practical advice on packing, international entry rules, and Schengen Visa requirements.
            </p>
          </div>

          <button
            onClick={() => navigateTo('guides')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2E0249] hover:text-[#3B185F] group"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Notice Disclaimer Banner */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
          <span className="font-bold">Editorial Note:</span>
          <span>Sample travel guides are provided for demonstration and are fully editable through the Agency CMS. Official embassy guidelines govern actual visa issuance.</span>
        </div>

        {/* Blog Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => navigateTo('guides', post.slug)}
              className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#2E0249] text-[#FFC72C] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                    {post.category}
                  </div>
                  {post.isSampleContent && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-neutral-300 text-[10px] px-2 py-0.5 rounded border border-white/20">
                      Sample Post
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif] group-hover:text-purple-900 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-100 mt-4 text-xs font-bold text-[#2E0249] group-hover:text-purple-700">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
