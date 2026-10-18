import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FeaturedHeroTripConfig, LocalTrip, TripPackage } from '../../types';
import {
  Sparkles,
  Zap,
  Calendar,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  Globe,
  Compass,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Sliders,
  Plane,
  RotateCcw,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FeaturedHeroTripManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    trips,
    localTrips,
    addLocalTrip,
    updateLocalTrip,
    showNotification,
  } = useApp();

  // Local state for the featured trip config form
  const [featuredForm, setFeaturedForm] = useState<FeaturedHeroTripConfig>(() => {
    return (
      settings.featuredHeroTrip || {
        enabled: true,
        tripType: 'local',
        selectedTripId: 'royalton-negril-flash-sale-2026',
        badgeText: '🚨🌴 FLASH SALE ALERT! 🇯🇲✈️',
        title: 'Royalton Negril Resort & Spa',
        subtitle: 'Escape to Royalton Negril Resort & Spa from October 30 – November 1, 2026 and enjoy a tropical experience with someone special!',
        location: 'Royalton Negril, Jamaica',
        dates: 'October 30 – November 1, 2026',
        priceDisplay: '$108,000',
        priceSubtitle: 'JMD for 2 adults',
        promoHighlight: '👶🏽 Bring ONE child FREE! 🎉',
        depositDisplay: 'Contact us to lock in',
        imageUrl: '/images/royalton_negril_resort.jpg',
        inclusions: [
          'Two (2) Adults Package ($108,000 JMD)',
          '👶🏽 Bring ONE (1) Child Allowed FREE! 🎉',
          'Luxury All-Inclusive Accommodations',
          'All Gourmet Dining, Specialty Bars & Premium Drinks',
          'Seven Mile Beach Access & Resort Pools',
          'Spa Services, Fitness Centre & Resort Activities',
        ],
        ctaText: 'Book Flash Sale',
        ctaAction: 'local-trip',
        targetSlugOrId: 'royalton-negril-flash-sale-2026',
        directPhone: '(876) 834-1537',
        directWhatsapp: '(876) 834-1537',
      }
    );
  });

  const [newInclusionText, setNewInclusionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep in sync when settings change externally
  useEffect(() => {
    if (settings.featuredHeroTrip) {
      setFeaturedForm(settings.featuredHeroTrip);
    }
  }, [settings.featuredHeroTrip]);

  // When admin selects a local trip from dropdown, auto-fill form
  const handleSelectLocalTrip = (tripId: string) => {
    const selected = localTrips.find((t) => t.id === tripId);
    if (!selected) return;

    setFeaturedForm((prev) => ({
      ...prev,
      tripType: 'local',
      selectedTripId: selected.id,
      targetSlugOrId: selected.slug || selected.id,
      title: selected.title,
      subtitle: selected.subtitle || selected.description.slice(0, 100) + '...',
      location: selected.location || 'Jamaica',
      dates: selected.availableDates || 'Upcoming Dates',
      priceDisplay: `$${selected.price.toLocaleString()}`,
      priceSubtitle: `${selected.currency} (${selected.priceType || 'for 2 adults'})`,
      imageUrl: selected.featuredImage || prev.imageUrl,
      inclusions: selected.inclusions?.slice(0, 5) || prev.inclusions,
      ctaAction: 'local-trip',
      ctaText: selected.ctaText || 'Book Flash Sale',
    }));
  };

  // When admin selects an abroad trip from dropdown, auto-fill form
  const handleSelectAbroadTrip = (tripId: string) => {
    const selected = trips.find((t) => t.id === tripId);
    if (!selected) return;

    setFeaturedForm((prev) => ({
      ...prev,
      tripType: 'abroad',
      selectedTripId: selected.id,
      targetSlugOrId: selected.slug || selected.id,
      title: `${selected.countryFlag || '✈️'} ${selected.name}`,
      subtitle: `${selected.destination} • Organized Group Trip`,
      location: `${selected.destination}, ${selected.country}`,
      dates: selected.dates,
      priceDisplay: `$${selected.price.toLocaleString()}`,
      priceSubtitle: `${selected.currency || 'JMD'} / person`,
      depositDisplay: selected.deposit ? `$${selected.deposit.toLocaleString()} ${selected.currency || 'JMD'}` : undefined,
      imageUrl: selected.featuredImage || selected.gallery?.[0] || prev.imageUrl,
      inclusions: selected.packageInclusions?.slice(0, 5) || prev.inclusions,
      ctaAction: 'abroad-trip',
      ctaText: 'View Package Details',
    }));
  };

  // Add inclusion
  const handleAddInclusion = () => {
    if (!newInclusionText.trim()) return;
    setFeaturedForm((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, newInclusionText.trim()],
    }));
    setNewInclusionText('');
  };

  // Remove inclusion
  const handleRemoveInclusion = (idx: number) => {
    setFeaturedForm((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== idx),
    }));
  };

  // Reset to Royalton Negril Flash Sale
  const handleResetToRoyaltonFlashSale = () => {
    setFeaturedForm({
      enabled: true,
      tripType: 'local',
      selectedTripId: 'royalton-negril-flash-sale-2026',
      badgeText: '🚨🌴 FLASH SALE ALERT! 🇯🇲✈️',
      title: 'Royalton Negril Resort & Spa',
      subtitle: 'Escape to Royalton Negril Resort & Spa from October 30 – November 1, 2026 and enjoy a tropical experience with someone special!',
      location: 'Royalton Negril, Jamaica',
      dates: 'October 30 – November 1, 2026',
      priceDisplay: '$108,000',
      priceSubtitle: 'JMD for 2 adults',
      promoHighlight: '👶🏽 Bring ONE child FREE! 🎉',
      depositDisplay: 'Contact us to lock in',
      imageUrl: '/images/royalton_negril_resort.jpg',
      inclusions: [
        'Two (2) Adults Package ($108,000 JMD)',
        '👶🏽 Bring ONE (1) Child Allowed FREE! 🎉',
        'Luxury All-Inclusive Accommodations',
        'All Gourmet Dining, Specialty Bars & Premium Drinks',
        'Seven Mile Beach Access & Resort Pools',
        'Spa Services, Fitness Centre & Resort Activities',
      ],
      ctaText: 'Book Flash Sale',
      ctaAction: 'local-trip',
      targetSlugOrId: 'royalton-negril-flash-sale-2026',
      directPhone: '(876) 834-1537',
      directWhatsapp: '(876) 834-1537',
    });
    showNotification('Loaded Royalton Negril', 'Reset featured card to Royalton Negril Flash Sale. Click Save to publish.');
  };

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const ok = await updateSettings({
        featuredHeroTrip: featuredForm,
      });

      // Synchronize into Local Trips database if marked as local
      if (featuredForm.tripType === 'local') {
        const existingLocal = localTrips.find(
          (t) =>
            t.id === featuredForm.selectedTripId ||
            t.slug === featuredForm.targetSlugOrId ||
            t.title.toLowerCase() === featuredForm.title.toLowerCase()
        );

        const numericPrice =
          typeof featuredForm.priceDisplay === 'string'
            ? parseInt(featuredForm.priceDisplay.replace(/[^0-9]/g, ''), 10) || 108000
            : 108000;

        if (existingLocal) {
          updateLocalTrip(existingLocal.id, {
            title: featuredForm.title,
            subtitle: featuredForm.subtitle,
            location: featuredForm.location,
            availableDates: featuredForm.dates,
            featuredImage: featuredForm.imageUrl,
            inclusions: featuredForm.inclusions,
            price: numericPrice,
            isFeatured: true,
            isPublished: true,
          });
        } else {
          addLocalTrip({
            title: featuredForm.title,
            subtitle: featuredForm.subtitle,
            slug:
              featuredForm.targetSlugOrId ||
              featuredForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: featuredForm.subtitle || featuredForm.title,
            fullDescription: `🚨🌴 FLASH SALE ALERT! 🇯🇲✈️\n\n${featuredForm.subtitle}\n\n📍 ${featuredForm.location}\n📅 ${featuredForm.dates}\n💰 Total package price: ${featuredForm.priceDisplay}\n\n📲 Book now with Smeltravels876!\n📞 Call/WhatsApp: (876) 834-1537\n🌐 www.Smeltravels876.com\n\n✨ Travel More ✈️ Stress Less! 💛💙`,
            featuredImage: featuredForm.imageUrl || '/images/royalton_negril_resort.jpg',
            location: featuredForm.location,
            category: 'Weekend Getaways',
            price: numericPrice,
            currency: 'JMD',
            priceType: featuredForm.priceSubtitle || 'Two (2) Adults',
            deposit: 35000,
            duration: '3 Days / 2 Nights',
            availableDates: featuredForm.dates,
            status: 'Limited Spots',
            ctaText: featuredForm.ctaText || 'Book Flash Sale',
            inclusions: featuredForm.inclusions,
            highlights: ['Flash Sale Deal', featuredForm.priceDisplay, 'Featured Offer'],
            isPublished: true,
            isFeatured: true,
            orderIndex: 0,
            displayOptions: {
              showPrice: true,
              showDeposit: true,
              showDates: true,
              showDuration: true,
              showLocation: true,
              showAvailability: true,
              showCategory: true,
              showInclusions: true,
            },
            contactPhone: '(876) 834-1537',
            contactEmail: 'smeltravels876@gmail.com',
          });
        }
      }

      if (ok) {
        setSaveSuccess(true);
        showNotification(
          'Featured Trip Saved',
          `The homepage hero now showcases "${featuredForm.title}". Mirrored to Local Trips!`,
          'success'
        );
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save featured trip:', err);
      showNotification('Save Notice', 'Saved to browser session.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E0249] to-purple-800 text-[#FFC72C] flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 fill-[#FFC72C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                Homepage Featured Trip Showcase
              </h2>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-black px-2.5 py-0.5 rounded-full border border-purple-300">
                HERO CARD
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choose or customize the featured trip highlighted on the website hero. Set it to a <strong>Local Jamaican Trip</strong> or an <strong>Abroad Group Trip</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToRoyaltonFlashSale}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-neutral-200"
            title="Load the Royalton Negril Flash Sale preset"
          >
            Reset to Royalton Negril
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#2E0249] to-purple-900 hover:from-purple-900 hover:to-[#2E0249] text-[#FFC72C] border border-[#FFC72C]/40'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#FFC72C]" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Saved & Live!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#FFC72C]" />
                <span>Save Featured Trip</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Visibility & Scope Selector */}
          <div className="p-5 bg-gradient-to-r from-purple-50 via-amber-50/40 to-neutral-50 rounded-2xl border border-purple-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#2E0249] block">
                  Featured Hero Card Status
                </span>
                <span className="text-xs text-neutral-500">
                  Controls visibility on the primary homepage hero section
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFeaturedForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`text-xs font-black px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors ${
                  featuredForm.enabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {featuredForm.enabled ? '✓ Enabled on Hero' : 'Disabled / Hidden'}
              </button>
            </div>

            {/* Trip Type Selector (Local vs Abroad) */}
            <div className="pt-3 border-t border-purple-200/60">
              <label className="text-xs font-black uppercase tracking-wider text-purple-950 block mb-2">
                Trip Classification (Local vs Abroad)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeaturedForm((prev) => ({ ...prev, tripType: 'local', ctaAction: 'local-trip' }))}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    featuredForm.tripType === 'local'
                      ? 'bg-[#2E0249] text-[#FFC72C] border-purple-900 shadow-md ring-2 ring-purple-600/30'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                  }`}
                >
                  <Compass className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-black block">🇯🇲 Local Trip</span>
                  <span className="text-[10px] opacity-75">Resort / Excursion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeaturedForm((prev) => ({ ...prev, tripType: 'abroad', ctaAction: 'abroad-trip' }))}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    featuredForm.tripType === 'abroad'
                      ? 'bg-[#2E0249] text-[#FFC72C] border-purple-900 shadow-md ring-2 ring-purple-600/30'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                  }`}
                >
                  <Plane className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-black block">✈️ Abroad Trip</span>
                  <span className="text-[10px] opacity-75">International Group</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeaturedForm((prev) => ({ ...prev, tripType: 'custom' }))}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    featuredForm.tripType === 'custom'
                      ? 'bg-[#2E0249] text-[#FFC72C] border-purple-900 shadow-md ring-2 ring-purple-600/30'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs font-black block">✨ Custom Promo</span>
                  <span className="text-[10px] opacity-75">Custom Spotlight</span>
                </button>
              </div>
            </div>

            {/* Quick Pick Dropdowns */}
            {featuredForm.tripType === 'local' && (
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Choose from Existing Local Trips (Auto-Fills Details):
                </label>
                <select
                  value={featuredForm.selectedTripId || ''}
                  onChange={(e) => handleSelectLocalTrip(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                >
                  <option value="">-- Choose a Local Trip --</option>
                  {localTrips.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.title} • ${lt.price.toLocaleString()} {lt.currency} ({lt.location})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {featuredForm.tripType === 'abroad' && (
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Choose from Existing Abroad Group Trips (Auto-Fills Details):
                </label>
                <select
                  value={featuredForm.selectedTripId || ''}
                  onChange={(e) => handleSelectAbroadTrip(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                >
                  <option value="">-- Choose an Abroad Trip --</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.countryFlag} {t.name} • {t.destination} ({t.dates})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card 2: Headline, Title & Dates */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-purple-700" />
              <span>Headlines, Dates & Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Alert Badge Text (Top Banner)
                </label>
                <input
                  type="text"
                  value={featuredForm.badgeText}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, badgeText: e.target.value })}
                  placeholder="e.g. 🚨🌴 FLASH SALE ALERT! 🇯🇲✈️"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Promo Highlight Badge (Floating Pill)
                </label>
                <input
                  type="text"
                  value={featuredForm.promoHighlight}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, promoHighlight: e.target.value })}
                  placeholder="e.g. 👶🏽 Bring ONE child FREE! 🎉"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Trip / Resort Title
                </label>
                <input
                  type="text"
                  value={featuredForm.title}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, title: e.target.value })}
                  placeholder="e.g. Royalton Negril Resort & Spa"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={featuredForm.location}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, location: e.target.value })}
                  placeholder="e.g. Royalton Negril, Jamaica"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Travel Dates
                </label>
                <input
                  type="text"
                  value={featuredForm.dates}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, dates: e.target.value })}
                  placeholder="e.g. October 30 – November 1, 2026"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Featured Image URL / Path
                </label>
                <input
                  type="text"
                  value={featuredForm.imageUrl}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, imageUrl: e.target.value })}
                  placeholder="e.g. /images/royalton_negril_resort.jpg"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">
                Introductory Subtitle
              </label>
              <textarea
                rows={2}
                value={featuredForm.subtitle}
                onChange={(e) => setFeaturedForm({ ...featuredForm, subtitle: e.target.value })}
                placeholder="e.g. Escape to Royalton Negril Resort & Spa from October 30 – November 1, 2026 and enjoy a tropical experience with someone special!"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Card 3: Pricing & Inclusions */}
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Pricing & Highlights</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Price Display (Big Text)
                </label>
                <input
                  type="text"
                  value={featuredForm.priceDisplay}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, priceDisplay: e.target.value })}
                  placeholder="e.g. $108,000"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-black text-sm text-[#2E0249]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Price Subtitle / Type
                </label>
                <input
                  type="text"
                  value={featuredForm.priceSubtitle}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, priceSubtitle: e.target.value })}
                  placeholder="e.g. JMD for 2 adults"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Direct Phone Contact
                </label>
                <input
                  type="text"
                  value={featuredForm.directPhone || ''}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, directPhone: e.target.value })}
                  placeholder="(876) 834-1537"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Primary Action Button Text
                </label>
                <input
                  type="text"
                  value={featuredForm.ctaText}
                  onChange={(e) => setFeaturedForm({ ...featuredForm, ctaText: e.target.value })}
                  placeholder="e.g. Book Flash Sale"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Inclusions List Manager */}
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">
                Included Highlights ({featuredForm.inclusions.length})
              </label>
              <div className="space-y-1.5">
                {featuredForm.inclusions.map((inc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(idx)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add inclusion input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newInclusionText}
                  onChange={(e) => setNewInclusionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInclusion();
                    }
                  }}
                  placeholder="Add another highlight, e.g. 'All-Inclusive Luxury'..."
                  className="flex-1 p-2 border border-neutral-300 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Column */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-700" />
              <span>Real-Time Hero Card Preview</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Interactive
            </span>
          </div>

          {/* Render Preview of the exact Hero Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FFC72C]/40 bg-[#1F0333] text-white">
            {/* Top Image Banner */}
            <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
              <img
                src={featuredForm.imageUrl}
                alt={featuredForm.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/heroes_weekend_royalton.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F0333] via-black/25 to-black/40"></div>

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="bg-gradient-to-r from-amber-400 via-[#FFC72C] to-amber-400 text-[#2E0249] text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-[#2E0249]" />
                  <span>{featuredForm.badgeText}</span>
                </span>

                <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 border border-white/20">
                  <Calendar className="w-3 h-3 text-[#FFC72C]" />
                  <span>{featuredForm.dates}</span>
                </span>
              </div>

              {/* Scope Pill */}
              <div className="absolute top-11 left-3">
                <span className="bg-purple-900/90 text-white border border-purple-400/40 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                  {featuredForm.tripType === 'local'
                    ? '🇯🇲 LOCAL JAMAICAN TRIP'
                    : featuredForm.tripType === 'abroad'
                    ? '✈️ ABROAD GROUP TRIP'
                    : '✨ CUSTOM SPOTLIGHT'}
                </span>
              </div>

              {/* Bottom Title on Image */}
              <div className="absolute bottom-2.5 left-3.5 right-3.5 text-white">
                <div className="flex items-center gap-1 text-[10px] text-[#FFC72C] font-semibold mb-0.5">
                  <MapPin className="w-2.5 h-2.5 text-[#FFC72C]" />
                  <span>{featuredForm.location}</span>
                </div>
                <h3 className="text-lg font-black font-['Outfit',sans-serif] text-white leading-tight">
                  {featuredForm.title}
                </h3>
              </div>
            </div>

            {/* Card Body Details */}
            <div className="p-4 space-y-3.5">
              {/* Special Offer Highlight Banner */}
              <div className="bg-gradient-to-r from-amber-400/20 via-[#FFC72C]/25 to-amber-400/20 border border-[#FFC72C]/50 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] text-amber-200 font-extrabold uppercase tracking-wider block">
                    Special Flash Offer
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                      {featuredForm.priceDisplay}
                    </span>
                    <span className="text-[11px] text-[#FFC72C] font-bold">
                      {featuredForm.priceSubtitle}
                    </span>
                  </div>
                </div>

                {featuredForm.promoHighlight && (
                  <div className="text-right">
                    <span className="inline-block bg-[#FFC72C] text-[#2E0249] text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                      {featuredForm.promoHighlight}
                    </span>
                  </div>
                )}
              </div>

              {/* Highlights Checklist */}
              <div className="space-y-1 text-xs text-neutral-200">
                {featuredForm.inclusions.slice(0, 4).map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#FFC72C] shrink-0" />
                    <span className="text-[11px] truncate">{inc}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 bg-[#FFC72C] text-[#2E0249] font-black text-xs py-2.5 px-3 rounded-xl text-center shadow-md flex items-center justify-center gap-1"
                >
                  <span>{featuredForm.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>(876) 834-1537</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 text-center">
            Click <strong>Save Featured Trip</strong> above to apply these settings immediately to the customer homepage.
          </p>
        </div>
      </div>
    </div>
  );
};
