import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Check,
  X,
  Search,
  RotateCcw,
  Globe,
  MapPin,
  Camera,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Info,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { CountryDestinationInfo, DestinationPhoto } from '../../types';
import { WORLD_DESTINATIONS } from '../../data/customTripDestinations';

interface CustomTripDestinationsManagerProps {
  destinations: CountryDestinationInfo[];
  onUpdateDestinations: (newDestinations: CountryDestinationInfo[]) => void;
  onInstantSave?: (newDestinations: CountryDestinationInfo[]) => Promise<void>;
  isSyncing?: boolean;
}

const REGION_OPTIONS: CountryDestinationInfo['region'][] = [
  'Caribbean',
  'Americas',
  'Europe',
  'Asia & Middle East',
  'Africa',
  'Global & Islands',
];

const MONTHS_LIST = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DEFAULT_SAMPLE_PHOTOS: DestinationPhoto[] = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    landmark: 'Coastal Paradise Shore',
    caption: 'Crystal-clear azure waters and pristine powder sands',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    landmark: 'Historic Old Town & Harbor',
    caption: 'Vibrant local culture, waterfront promenades, and culinary delights',
  },
  {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    landmark: 'Scenic Vista & Adventure Trails',
    caption: 'Breathtaking panoramic viewpoints and guided private excursions',
  },
];

export const CustomTripDestinationsManager: React.FC<CustomTripDestinationsManagerProps> = ({
  destinations = [],
  onUpdateDestinations,
  onInstantSave,
  isSyncing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [activeModalMode, setActiveModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingDestination, setEditingDestination] = useState<CountryDestinationInfo | null>(null);

  // Quick photo viewer modal
  const [viewingPhotosDestination, setViewingPhotosDestination] = useState<CountryDestinationInfo | null>(null);

  // State for the editor form
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formRegion, setFormRegion] = useState<CountryDestinationInfo['region']>('Caribbean');
  const [formFlag, setFormFlag] = useState('✈️');
  const [formCapital, setFormCapital] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDuration, setFormDuration] = useState('5 - 8 Days');
  const [formBudgetTier, setFormBudgetTier] = useState<'Affordable' | 'Moderate' | 'Luxury'>('Moderate');
  const [formPopularCities, setFormPopularCities] = useState<string>('');
  const [formHighlights, setFormHighlights] = useState<string>('');
  const [formVibes, setFormVibes] = useState<string>('');
  const [formBestMonths, setFormBestMonths] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Nov', 'Dec']);
  const [formPhotos, setFormPhotos] = useState<DestinationPhoto[]>([]);

  // New photo sub-form state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoLandmark, setNewPhotoLandmark] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [photoError, setPhotoError] = useState('');

  // Filtered destinations
  const currentList = Array.isArray(destinations) && destinations.length > 0 ? destinations : WORLD_DESTINATIONS;

  const filteredDestinations = currentList.filter((dest) => {
    const matchesRegion = selectedRegion === 'All' || dest.region === selectedRegion;
    const matchesSearch =
      !searchQuery.trim() ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    const id = `dest-${Date.now()}`;
    setFormId(id);
    setFormName('');
    setFormCountry('');
    setFormRegion('Caribbean');
    setFormFlag('🌴');
    setFormCapital('');
    setFormTagline('');
    setFormDuration('6 - 8 Days');
    setFormBudgetTier('Moderate');
    setFormPopularCities('');
    setFormHighlights('Private Beach Excursions, Cultural Old Town Tour, Local Culinary Tasting');
    setFormVibes('Beaches & Tropical Relaxation, Foodie & Culinary Adventure');
    setFormBestMonths(['Jan', 'Feb', 'Mar', 'Nov', 'Dec']);
    setFormPhotos([...DEFAULT_SAMPLE_PHOTOS]);
    setNewPhotoUrl('');
    setNewPhotoLandmark('');
    setNewPhotoCaption('');
    setPhotoError('');
    setEditingDestination(null);
    setActiveModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (dest: CountryDestinationInfo) => {
    setFormId(dest.id);
    setFormName(dest.name);
    setFormCountry(dest.country);
    setFormRegion(dest.region);
    setFormFlag(dest.flag || '✈️');
    setFormCapital(dest.capitalOrMainCity || '');
    setFormTagline(dest.tagline || '');
    setFormDuration(dest.recommendedDuration || '7 Days');
    setFormBudgetTier(dest.typicalBudgetTier || 'Moderate');
    setFormPopularCities((dest.popularCities || []).join(', '));
    setFormHighlights((dest.highlights || []).join(', '));
    setFormVibes((dest.vibes || []).join(', '));
    setFormBestMonths(dest.bestMonths || ['Jan', 'Feb', 'Mar']);
    setFormPhotos(Array.isArray(dest.photos) ? [...dest.photos] : []);
    setNewPhotoUrl('');
    setNewPhotoLandmark('');
    setNewPhotoCaption('');
    setPhotoError('');
    setEditingDestination(dest);
    setActiveModalMode('edit');
  };

  // Add Photo to current form
  const handleAddPhotoToForm = () => {
    if (!newPhotoUrl.trim()) {
      setPhotoError('Please enter a photo image URL.');
      return;
    }
    if (!newPhotoLandmark.trim()) {
      setPhotoError('Please specify the landmark or photo title.');
      return;
    }

    const photo: DestinationPhoto = {
      url: newPhotoUrl.trim(),
      landmark: newPhotoLandmark.trim(),
      caption: newPhotoCaption.trim() || newPhotoLandmark.trim(),
    };

    setFormPhotos((prev) => [...prev, photo]);
    setNewPhotoUrl('');
    setNewPhotoLandmark('');
    setNewPhotoCaption('');
    setPhotoError('');
  };

  // Remove photo from form
  const handleRemovePhotoFromForm = (index: number) => {
    setFormPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Move photo up/down
  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    setFormPhotos((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Toggle Month
  const handleToggleMonth = (m: string) => {
    setFormBestMonths((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  // Save form (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCountry.trim()) {
      alert('Destination name and country are required.');
      return;
    }

    if (formPhotos.length === 0) {
      alert('Please include at least one landmark photo for travelers to see.');
      return;
    }

    const popularCities = formPopularCities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const highlights = formHighlights
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const vibes = formVibes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedDestination: CountryDestinationInfo = {
      id: formId || `dest-${Date.now()}`,
      name: formName.trim(),
      country: formCountry.trim(),
      region: formRegion,
      flag: formFlag.trim() || '✈️',
      capitalOrMainCity: formCapital.trim(),
      tagline: formTagline.trim() || `Explore the beauty of ${formCountry}`,
      popularCities: popularCities.length > 0 ? popularCities : [formCountry],
      bestMonths: formBestMonths.length > 0 ? formBestMonths : ['All Year'],
      recommendedDuration: formDuration.trim() || '7 Days',
      typicalBudgetTier: formBudgetTier,
      highlights: highlights.length > 0 ? highlights : ['Sightseeing', 'Guided Excursions'],
      vibes: vibes.length > 0 ? vibes : ['Beaches & Tropical Relaxation'],
      photos: formPhotos,
    };

    let updatedList: CountryDestinationInfo[];
    if (activeModalMode === 'create') {
      updatedList = [updatedDestination, ...currentList];
    } else {
      updatedList = currentList.map((d) => (d.id === updatedDestination.id ? updatedDestination : d));
    }

    onUpdateDestinations(updatedList);
    if (onInstantSave) {
      await onInstantSave(updatedList);
    }
    setActiveModalMode(null);
  };

  // Delete Destination
  const handleDeleteDestination = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the Custom Trip Creator catalog?`)) {
      return;
    }
    const updatedList = currentList.filter((d) => d.id !== id);
    onUpdateDestinations(updatedList);
    if (onInstantSave) {
      await onInstantSave(updatedList);
    }
  };

  // Reset to Agency Default Destinations
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        'Reset all Custom Trip Creator destinations back to agency factory defaults (16 pre-configured global countries with curated landmark galleries)?'
      )
    ) {
      onUpdateDestinations(WORLD_DESTINATIONS);
      if (onInstantSave) {
        await onInstantSave(WORLD_DESTINATIONS);
      }
    }
  };

  return (
    <div className="space-y-6" id="agency-custom-trip-destinations-manager">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#1F0333] text-white p-6 rounded-3xl border border-purple-900/40 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#FFC72C]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-[#FFC72C] text-[#2E0249] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Admin Feature
              </span>
              <span className="text-xs text-purple-200">Agency Settings • Custom Trip Creator</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#FFC72C]" />
              <span>Custom Trip Destinations & Photo Manager</span>
            </h3>
            <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
              Manage the catalog of default world countries and destinations that appear when users click <strong>"Create Your Own Trip"</strong>. Edit high-resolution landmark photos, add new default countries, and control highlights shown to travelers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              id="admin-add-custom-dest-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Default Destination</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset destinations to original default catalog"
              id="admin-reset-custom-dest-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-300" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destinations by name, country, or tagline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none"
              id="admin-search-custom-dest-input"
            />
          </div>

          <div className="text-xs font-bold text-neutral-600 shrink-0">
            Showing {filteredDestinations.length} of {currentList.length} destinations
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-neutral-500 mr-1">Region:</span>
          {['All', ...REGION_OPTIONS].map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedRegion === region
                  ? 'bg-[#2E0249] text-white'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="admin-destinations-catalog-grid">
        {filteredDestinations.map((dest) => {
          const coverPhoto = dest.photos?.[0]?.url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
          const photoCount = dest.photos?.length || 0;

          return (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              id={`admin-dest-card-${dest.id}`}
            >
              {/* Cover Image & Quick Photo Carousel Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                <img
                  src={coverPhoto}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-xl drop-shadow">{dest.flag}</span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">
                    {dest.region}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => setViewingPhotosDestination(dest)}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-[#FFC72C] text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 transition-colors cursor-pointer"
                    title="View all photos for this destination"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{photoCount} Photos</span>
                  </button>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-base font-black leading-tight drop-shadow">
                    {dest.name}
                  </h4>
                  <p className="text-[11px] text-purple-200 drop-shadow line-clamp-1">
                    {dest.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <strong className="text-neutral-800">{dest.country}</strong>
                    </span>
                    <span className="bg-purple-50 text-[#2E0249] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                      {dest.typicalBudgetTier}
                    </span>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                    {(dest.photos || []).slice(0, 4).map((p, idx) => (
                      <div
                        key={idx}
                        className="w-11 h-11 rounded-lg overflow-hidden border border-neutral-200 shrink-0 relative group/thumb"
                        title={`${p.landmark}: ${p.caption}`}
                      >
                        <img
                          src={p.url}
                          alt={p.landmark}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-[#2E0249]/90 text-[#FFC72C] text-[7px] font-black text-center py-0.2 uppercase">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                    {(dest.photos?.length || 0) > 4 && (
                      <button
                        type="button"
                        onClick={() => setViewingPhotosDestination(dest)}
                        className="w-11 h-11 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[10px] flex items-center justify-center border border-neutral-200 shrink-0"
                      >
                        +{(dest.photos?.length || 0) - 4}
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-500 line-clamp-1">
                    <strong>Highlights:</strong> {(dest.highlights || []).slice(0, 3).join(' • ')}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dest)}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-[#2E0249] font-bold text-xs py-2 px-3 rounded-xl border border-purple-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    id={`admin-edit-dest-${dest.id}-btn`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Destination & Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDestination(dest.id, dest.name)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove from custom destinations catalog"
                    id={`admin-delete-dest-${dest.id}-btn`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT DESTINATION & PHOTOS */}
      {activeModalMode && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] text-white px-6 py-4 flex items-center justify-between border-b border-purple-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFC72C]/20 border border-[#FFC72C]/40 flex items-center justify-center text-[#FFC72C]">
                  {activeModalMode === 'create' ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-['Outfit',sans-serif]">
                    {activeModalMode === 'create' ? 'Add Default Destination' : `Edit Destination: ${formName || 'Destination'}`}
                  </h3>
                  <p className="text-xs text-purple-200">
                    Custom Trip Creator Catalog • Live Synced Across Website
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalMode(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="overflow-y-auto p-6 space-y-6 text-xs flex-1">
              {/* Basic Destination Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 pb-2 border-b border-neutral-200">
                  <MapPin className="w-4 h-4 text-[#2E0249]" />
                  <span>Destination Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-neutral-700 block mb-1">
                      Destination Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greece & Santorini or Tokyo, Japan"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                      id="admin-dest-name-input"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Country Flag Emoji
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🇬🇷 or 🇯🇵"
                      value={formFlag}
                      onChange={(e) => setFormFlag(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-center text-base focus:ring-2 focus:ring-[#2E0249] outline-none"
                      id="admin-dest-flag-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Country Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greece"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                      id="admin-dest-country-input"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Region
                    </label>
                    <select
                      value={formRegion}
                      onChange={(e) => setFormRegion(e.target.value as any)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                    >
                      {REGION_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Typical Budget Tier
                    </label>
                    <select
                      value={formBudgetTier}
                      onChange={(e) => setFormBudgetTier(e.target.value as any)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                    >
                      <option value="Affordable">Affordable</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Tagline / Subheading
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cycladic islands, volcanic sunsets & azure Aegean waters"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Recommended Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 7 - 10 Days"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Popular Cities & Hotspots (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Athens, Santorini, Mykonos, Crete"
                    value={formPopularCities}
                    onChange={(e) => setFormPopularCities(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Signature Highlights (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acropolis Tour, Oia Sunset Catamaran, Wine Tasting, Beach Clubs"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                  />
                </div>

                {/* Best Travel Months */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1.5">
                    Best Months to Travel:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MONTHS_LIST.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleToggleMonth(m)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          formBestMonths.includes(m)
                            ? 'bg-[#2E0249] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHOTO GALLERY MANAGEMENT SECTION */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#2E0249]" />
                      <span>Destination Photo Gallery ({formPhotos.length} Photos)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      These photos will be shown interactively in the Custom Trip Creator when users select this destination. First photo is used as the cover.
                    </p>
                  </div>
                </div>

                {/* Current Photo List */}
                <div className="space-y-2.5">
                  {formPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-neutral-300 shrink-0 bg-neutral-200 relative">
                          <img
                            src={photo.url}
                            alt={photo.landmark}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-[#2E0249] text-[#FFC72C] text-[7px] font-black text-center py-0.2">
                              Cover
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-neutral-900 truncate flex items-center gap-1.5">
                            <span>{idx + 1}. {photo.landmark}</span>
                            {idx === 0 && (
                              <span className="text-[9px] bg-purple-100 text-[#2E0249] font-black px-1.5 py-0.2 rounded">
                                Primary Cover Photo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate">{photo.caption}</p>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">{photo.url}</p>
                        </div>
                      </div>

                      {/* Photo Reorder & Delete controls */}
                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhoto(idx, 'up')}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-200 transition-colors"
                          title="Move up (make cover)"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formPhotos.length - 1}
                          onClick={() => handleMovePhoto(idx, 'down')}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-200 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoFromForm(idx)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors ml-1"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formPhotos.length === 0 && (
                    <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 text-xs">
                      No photos added yet. Add at least one photo below.
                    </div>
                  )}
                </div>

                {/* Sub-form: Add New Photo */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                  <div className="font-bold text-[#2E0249] text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Add Photo to Gallery</span>
                  </div>

                  {photoError && (
                    <div className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {photoError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">
                        Landmark / Photo Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Oia Caldera Sunset or Eiffel Tower"
                        value={newPhotoLandmark}
                        onChange={(e) => {
                          setNewPhotoLandmark(e.target.value);
                          setPhotoError('');
                        }}
                        className="w-full p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                        id="admin-add-photo-landmark-input"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">
                        Caption / Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Breathtaking sunset views and whitewashed villas"
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Direct Photo URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or https://..."
                        value={newPhotoUrl}
                        onChange={(e) => {
                          setNewPhotoUrl(e.target.value);
                          setPhotoError('');
                        }}
                        className="flex-1 p-2 border border-neutral-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2E0249] outline-none text-xs"
                        id="admin-add-photo-url-input"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoToForm}
                        className="bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        id="admin-append-photo-btn"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    </div>
                  </div>

                  {newPhotoUrl.trim() && (
                    <div className="pt-2 flex items-center gap-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0">
                        <img
                          src={newPhotoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-neutral-500">Live image preview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModalMode(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  id="admin-save-dest-submit-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {activeModalMode === 'create' ? 'Add Destination to Catalog' : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PHOTO GALLERY VIEWER MODAL */}
      {viewingPhotosDestination && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 border border-neutral-300 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{viewingPhotosDestination.flag}</span>
                <div>
                  <h4 className="text-base font-black text-neutral-900 font-['Outfit',sans-serif]">
                    {viewingPhotosDestination.name} Photography Gallery
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {viewingPhotosDestination.photos?.length || 0} Curated Landmarks for Travelers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingPhotosDestination(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto p-1">
              {(viewingPhotosDestination.photos || []).map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-xs">
                  <div className="h-36 relative">
                    <img
                      src={photo.url}
                      alt={photo.landmark}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#2E0249] text-[#FFC72C] text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                        Cover Photo
                      </span>
                    )}
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <div className="font-bold text-neutral-900">{photo.landmark}</div>
                    <div className="text-[11px] text-neutral-500">{photo.caption}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingPhotosDestination;
                  setViewingPhotosDestination(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 rounded-xl bg-[#2E0249] text-[#FFC72C] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit These Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingPhotosDestination(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
