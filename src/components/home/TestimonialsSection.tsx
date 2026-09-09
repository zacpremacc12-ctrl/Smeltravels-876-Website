import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  Calendar,
  Edit2,
  CheckCircle,
  Sparkles,
  Plane,
  User,
  MapPin,
  X,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TestimonialItem } from '../../types';

export const TestimonialsSection: React.FC = () => {
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    trips,
    isAdminLoggedIn,
    showNotification,
    openReviewModal,
  } = useApp();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Edit Review Modal State
  const [editingReview, setEditingReview] = useState<TestimonialItem | null>(null);
  const [editForm, setEditForm] = useState<{
    customerName: string;
    location: string;
    tripName: string;
    rating: number;
    reviewText: string;
    date: string;
    isPublished: boolean;
    isSamplePlaceholder: boolean;
  }>({
    customerName: '',
    location: '',
    tripName: '',
    rating: 5,
    reviewText: '',
    date: todayFormatted,
    isPublished: true,
    isSamplePlaceholder: false,
  });

  // On-Site Customer Submission Form State
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('Kingston, Jamaica');
  const [tripName, setTripName] = useState(trips[0]?.name || 'Panama Experience 2026');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewDate, setReviewDate] = useState<string>(todayFormatted);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const publishedTestimonials = testimonials.filter((t) => t.isPublished);

  // Open Edit Review Modal (Admin Only)
  const handleStartEdit = (item: TestimonialItem) => {
    if (!isAdminLoggedIn) {
      showNotification('Access Restricted', 'Traveler reviews cannot be modified by users. Only administrators have editing permissions.', 'warning');
      return;
    }
    setEditingReview(item);
    setEditForm({
      customerName: item.customerName,
      location: item.location,
      tripName: item.tripName,
      rating: item.rating,
      reviewText: item.reviewText,
      date: item.date || todayFormatted,
      isPublished: item.isPublished,
      isSamplePlaceholder: item.isSamplePlaceholder || false,
    });
  };

  // Save Edited Review (Admin Only)
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn) {
      showNotification('Access Restricted', 'Only administrators are authorized to update reviews.', 'error');
      setEditingReview(null);
      return;
    }
    if (!editingReview) return;

    if (!editForm.customerName.trim()) {
      showNotification('Error', 'Please enter a customer name.', 'warning');
      return;
    }
    if (!editForm.reviewText.trim()) {
      showNotification('Error', 'Review text cannot be empty.', 'warning');
      return;
    }

    updateTestimonial(editingReview.id, {
      customerName: editForm.customerName.trim(),
      location: editForm.location.trim(),
      tripName: editForm.tripName.trim(),
      rating: editForm.rating,
      reviewText: editForm.reviewText.trim(),
      date: editForm.date.trim() || todayFormatted,
      isPublished: editForm.isPublished,
      isSamplePlaceholder: editForm.isSamplePlaceholder,
    });

    showNotification('Review Updated', 'Your review modifications were successfully saved.');
    setEditingReview(null);
  };

  // Submit On-Site Customer Review
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setFormError('Please provide at least 10 characters detailing your trip feedback.');
      return;
    }

    setIsSubmitting(true);

    const avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

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
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);
    showNotification('Review Received', `Thank you ${customerName.trim()}! Your review has been posted on site.`);

    // Reset Form
    setCustomerName('');
    setReviewText('');

    setTimeout(() => {
      setSubmitSuccess(false);
      const elem = document.getElementById('traveler-reviews-list');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2500);
  };

  return (
    <section className="py-20 bg-white border-b border-neutral-200" id="traveler-reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
              TRAVELER REVIEWS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-['Outfit',sans-serif] mt-3">
              What Our Community Says
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2">
              Organized group packages designed to foster camaraderie, new friendships, and unforgettable memories.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const elem = document.getElementById('customer-review-section');
                if (elem) {
                  elem.scrollIntoView({ behavior: 'smooth' });
                } else {
                  openReviewModal();
                }
              }}
              className="inline-flex items-center gap-2 bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm px-5 py-2.5 rounded-full shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
              id="reviews-section-leave-review-btn"
            >
              <Star className="w-4 h-4 fill-[#FFC72C]" />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto" id="traveler-reviews-list">
          {publishedTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF9F6] p-6 sm:p-7 rounded-2xl border border-neutral-200 hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                {/* Header: Rating & Date Sent */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
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

                  {/* Date of the review sent */}
                  <div className="flex items-center gap-1 text-[11px] text-neutral-600 font-semibold bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Calendar className="w-3 h-3 text-purple-700 shrink-0" />
                    <span>{item.date || 'Recent'}</span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-neutral-700 italic leading-relaxed">
                  "{item.reviewText}"
                </p>
              </div>

              <div className="pt-5 border-t border-neutral-200/80 mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {item.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 font-['Outfit',sans-serif] truncate">
                      {item.customerName}
                    </h4>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {item.location} • <span className="text-purple-900 font-semibold">{item.tripName}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Only: Edit Review Button (Users cannot edit reviews) */}
                {isAdminLoggedIn && (
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="shrink-0 px-2 py-1 text-purple-900 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer border border-purple-200"
                    title="Admin Edit Review"
                    aria-label={`Admin Edit review from ${item.customerName}`}
                    id={`edit-review-btn-${item.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                    <span className="text-[11px]">Admin Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ON-SITE CUSTOMER REVIEW SUBMISSION SECTION */}
        <div
          id="customer-review-section"
          className="mt-16 bg-[#FAF9F6] border border-neutral-300/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#2E0249] bg-[#FFC72C]/30 px-3 py-1 rounded-full border border-[#FFC72C]/40">
                <Sparkles className="w-3.5 h-3.5 fill-[#2E0249]" />
                <span>COMMUNITY REVIEWS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-['Outfit',sans-serif] tracking-tight">
                Leave Your Traveler Review on Site
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
                Traveled with SMELTRAVELS876 on one of our group packages or custom tours? Share your honest feedback with other travelers! Your review and date sent will be posted on site immediately.
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-3 shadow-xs animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                  Review Successfully Posted!
                </h4>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  Thank you for contributing to the SMELTRAVELS876 community. Your review sent on <strong>{reviewDate}</strong> is now live in the community reviews grid above.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCustomerSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Rating Selector */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900">
                      Overall Trip Rating <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-500">How would you rate your travel experience?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-120 transition-transform cursor-pointer focus:outline-none"
                          aria-label={`${star} Stars`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating)
                                ? 'text-[#FFC72C] fill-[#FFC72C]'
                                : 'text-neutral-300 hover:text-neutral-400'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-purple-900 ml-1">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Traveler Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Kerrie-Ann Williams"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-medium text-neutral-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Home Parish / Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Kingston, Jamaica"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-medium text-neutral-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Trip Taken & Date of Review Sent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Trip Package Experienced <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Plane className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                      <select
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-medium text-neutral-900 bg-white"
                      >
                        {trips.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.countryFlag || '✈️'} {t.name}
                          </option>
                        ))}
                        <option value="Custom Group Package">Custom Group Package</option>
                        <option value="Private Family Vacation">Private Family Vacation</option>
                        <option value="Flight & Hotel Booking">Flight & Hotel Booking</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1">
                      Date of Review Sent <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={reviewDate}
                        onChange={(e) => setReviewDate(e.target.value)}
                        placeholder="e.g. September 5, 2026"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-medium text-neutral-900"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      This date will appear on your published review card.
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Your Review & Experience Details <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <textarea
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience: flight arrangements, hotel comfort, tour activities, group coordination, and agency support..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-normal text-neutral-900 resize-none leading-relaxed"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                    <span>Minimum 10 characters</span>
                    <span>{reviewText.length} characters</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-black text-sm tracking-wide shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="submit-customer-review-btn"
                  >
                    <Star className="w-4 h-4 fill-[#FFC72C]" />
                    <span>POST TRAVELER REVIEW TO SITE</span>
                  </button>
                  <p className="text-[11px] text-center text-neutral-500 mt-2">
                    Verified review will be published instantly with your date of submission.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#2E0249] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#FFC72C]" />
                <h3 className="font-bold text-lg font-['Outfit',sans-serif]">Edit Review</h3>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1 rounded-full text-neutral-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Location / Parish</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Trip Name</label>
                  <input
                    type="text"
                    value={editForm.tripName}
                    onChange={(e) => setEditForm({ ...editForm, tripName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs bg-white"
                  >
                    <option value={5}>★★★★★ 5 Stars</option>
                    <option value={4}>★★★★☆ 4 Stars</option>
                    <option value={3}>★★★☆☆ 3 Stars</option>
                    <option value={2}>★★☆☆☆ 2 Stars</option>
                    <option value={1}>★☆☆☆☆ 1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Date of Review Sent</label>
                  <input
                    type="text"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    placeholder="e.g. September 5, 2026"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Review Text</label>
                <textarea
                  rows={4}
                  value={editForm.reviewText}
                  onChange={(e) => setEditForm({ ...editForm, reviewText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-purple-600 outline-none text-xs font-normal resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isPublished}
                    onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                    className="rounded border-neutral-300 text-purple-900 focus:ring-purple-600"
                  />
                  <span className="font-semibold text-neutral-700">Published on site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isSamplePlaceholder}
                    onChange={(e) => setEditForm({ ...editForm, isSamplePlaceholder: e.target.checked })}
                    className="rounded border-neutral-300 text-purple-900 focus:ring-purple-600"
                  />
                  <span className="text-neutral-500 text-[11px]">Mark as placeholder</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E0249] text-[#FFC72C] font-black hover:bg-[#3B185F] shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
