import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, ArrowLeft, AlertCircle, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BlogPost } from '../types';

interface TravelGuidesPageProps {
  initialSlug?: string | null;
}

export const TravelGuidesPage: React.FC<TravelGuidesPageProps> = ({ initialSlug }) => {
  const { blogPosts, navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePostSlug, setActivePostSlug] = useState<string | null>(initialSlug || null);

  const categories = [
    'All',
    'Visa Information',
    'Destination Guides',
    'Travel Tips',
    'Packing Advice',
    'Group Travel Insights',
  ];

  const activePost = activePostSlug ? blogPosts.find(b => b.slug === activePostSlug || b.id === activePostSlug) : null;

  if (activePost) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen pb-20">
        <div className="bg-white border-b border-neutral-200 py-3 sticky top-16 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <button
              onClick={() => setActivePostSlug(null)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-[#2E0249] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Travel Guides</span>
            </button>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
          {/* Post Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#2E0249] text-[#FFC72C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {activePost.category}
              </span>
              {activePost.isSampleContent && (
                <span className="bg-neutral-200 text-neutral-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  Editable Sample Guide
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 font-['Outfit',sans-serif] leading-tight">
              {activePost.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activePost.date}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{activePost.readTime}</span>
              </span>
              <span>•</span>
              <span>By {activePost.author}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-3xl overflow-hidden shadow-lg h-72 sm:h-96 w-full bg-neutral-900">
            <img
              src={activePost.image}
              alt={activePost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Important Travel & Visa Disclaimer</span>
              <p>
                Visa policies and international entry requirements are subject to change by foreign sovereign governments at any time. The travel guidance provided here is for informational reference and general trip preparation. SMELTRAVELS876 assists travelers with document vouchers and visa appointment prep, but final entry decisions rest with official embassy and border authorities.
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm prose prose-neutral max-w-none text-neutral-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {activePost.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <Tag className="w-4 h-4 text-neutral-400" />
            {activePost.tags.map((t) => (
              <span key={t} className="bg-neutral-100 text-neutral-600 text-xs px-3 py-1 rounded-lg">
                #{t}
              </span>
            ))}
          </div>

          {/* Booking CTA at bottom of guide */}
          <div className="bg-purple-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                Ready to turn inspiration into travel?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300">
                Join our next organized departure with all flight and hotel arrangements handled for you.
              </p>
            </div>
            <button
              onClick={() => navigateTo('trips')}
              className="bg-[#FFC72C] text-[#2E0249] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow shrink-0"
            >
              Browse Group Trips
            </button>
          </div>
        </article>
      </div>
    );
  }

  const filteredPosts = blogPosts.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TRAVEL RESOURCES & BLOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Travel Guides & Insights
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl">
            Practical packing advice, destination spotlights, and official guidance on Schengen Visa requirements for Germany and Italy.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2E0249] text-[#FFC72C]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setActivePostSlug(post.slug)}
              className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-200 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#2E0249] text-[#FFC72C] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 font-['Outfit',sans-serif] group-hover:text-purple-900 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-100 mt-4 text-xs font-bold text-[#2E0249]">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
