import React, { useState } from 'react';
import { X, Star, Calendar, MapPin, User, MessageSquare, CheckCircle, Sparkles, Plane } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReviewSubmissionModal: React.FC = () => {
  const {
    isReviewModalOpen,
    closeReviewModal,
    addTestimonial,
    trips,
    currentUser,
    showNotification,
  } = useApp();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.homeParishOrCountry || 'Kingston, Jamaica');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [tripName, setTripName] = useState(trips[0]?.name || 'Panama Experience 2026');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewDate, setReviewDate] = useState<string>(todayFormatted);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>('');

  if (!isReviewModalOpen) return null;

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '5 Stars — Outstanding & Flawless Experience!';
      case 4:
        return '4 Stars — Great Trip & Wonderful Memories!';
      case 3:
        return '3 Stars — Good Trip, Enjoyed the Journey.';
      case 2:
        return '2 Stars — Fair, Room for Improvement.';
      case 1:
        return '1 Star — Did Not Meet Expectations.';
      default:
        return 'Select your rating';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setError('Please write at least 10 characters detailing your trip experience.');
      return;
    }

    // Default avatar based on initials or warm photo
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`;

    addTestimonial({
      customerName: customerName.trim(),
      location: location.trim() || 'Jamaica',
      rating,
      reviewText: reviewText.trim(),
      tripName: tripName.trim(),
      date: reviewDate.trim() || todayFormatted,
      avatarUrl,
      isPublished: true,
      isSamplePlaceholder: false,
      email: email.trim() || undefined,
    });

    setSubmitted(true);
    showNotification('Review Submitted', 'Thank you! Your traveler review has been posted to our community section.');

    setTimeout(() => {
      setSubmitted(false);
      setReviewText('');
      closeReviewModal();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReviewModal();
      }}
      role="dialog"
      aria-modal="true"
      id="leave-review-modal"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2E0249] to-[#3B185F] text-white p-6 relative shrink-0">
          <button
            onClick={closeReviewModal}
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFC72C] mb-1.5">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>COMMUNITY FEEDBACK</span>
          </div>
          <h3 className="text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
            Leave a Traveler Review
          </h3>
          <p className="text-xs text-neutral-200 mt-1 max-w-md leading-relaxed">
            Traveled with SMELTRAVELS876? Share your authentic journey details, hotel experiences, flights, and coordination guidance.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                Thank You, {customerName}!
              </h4>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                Your traveler review with date <strong>{reviewDate}</strong> has been successfully published to our traveler reviews section.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-neutral-200 space-y-2">
                <label className="font-bold text-neutral-900 block text-xs">
                  Your Overall Trip Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-[#FFC72C] fill-[#FFC72C]'
                              : 'text-neutral-300 hover:text-neutral-400'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-bold text-purple-950 text-xs ml-2">
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Kerrie-Ann Williams"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-xs font-medium text-neutral-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Home Parish / Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kingston, Jamaica"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-xs font-medium text-neutral-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Trip Package & Review Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Trip Package Taken <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Plane className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <select
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-xs font-medium text-neutral-900 bg-white"
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.countryFlag || '✈️'} {t.name}
                        </option>
                      ))}
                      <option value="Custom Group Package">Custom Group Package</option>
                      <option value="Private Family Vacation">Private Family Vacation</option>
                      <option value="Weekend Flight & Hotel Stay">Weekend Flight & Hotel Stay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Date of Review Sent <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                      placeholder="e.g. September 5, 2026"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-xs font-medium text-neutral-900"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    Recorded and displayed on your review card.
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Your Review & Trip Feedback <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell other travelers about your experience with SMELTRAVELS876: flight coordination, group camaraderie, hotels, payment plan schedules, and customer care..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none text-xs text-neutral-900 leading-relaxed font-normal resize-none"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{reviewText.length} characters</span>
                </div>
              </div>

              {/* Optional Email */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Your Email <span className="text-neutral-400 font-normal">(optional, for verification only)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs text-neutral-800"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#2E0249] to-[#3B185F] hover:from-[#3B185F] hover:to-[#2E0249] text-[#FFC72C] font-black text-sm tracking-wide shadow-lg shadow-purple-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-[#FFC72C]" />
                  <span>SUBMIT & PUBLISH TRAVELER REVIEW</span>
                </button>
                <p className="text-[10px] text-center text-neutral-500 mt-2">
                  Your review will be posted to the SMELTRAVELS876 community reviews section with the sent date.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
