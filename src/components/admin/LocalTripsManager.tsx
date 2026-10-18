import React, { useState, useMemo } from 'react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import { LocalTrip, LocalTripsPageSettings } from '../../types';
import {
  Compass,
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  AlertTriangle,
  Copy,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Heroes Weekend Royalton (Falmouth)',
    url: '/images/heroes_weekend_royalton.jpg',
  },
  {
    name: "Dunn's River & Blue Hole (Ocho Rios)",
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: "Negril Seven Mile Beach & Rick's Cafe",
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Portland Blue Lagoon & Bamboo Rafting',
    url: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Blue Mountains Misty Peaks',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Montego Bay Luxury Resort',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
];

export const LocalTripsManager: React.FC = () => {
  const {
    localTrips,
    localTripsPageSettings,
    addLocalTrip,
    updateLocalTrip,
    deleteLocalTrip,
    reorderLocalTrips,
    updateLocalTripsPageSettings,
    saveLocalTripsToLive,
    navigateTo,
  } = useApp();

  // Local state for trips being edited
  const [tripsList, setTripsList] = useState<LocalTrip[]>(localTrips);
  const [pageSettings, setPageSettings] = useState<LocalTripsPageSettings>(localTripsPageSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals
  const [editingTrip, setEditingTrip] = useState<LocalTrip | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);
  const [previewingTrip, setPreviewingTrip] = useState<LocalTrip | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form tab
  const [formTab, setFormTab] = useState<'basic' | 'media' | 'pricing' | 'details' | 'display'>('basic');

  // New item inputs in modal
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Sync external state if updated from cloud
  React.useEffect(() => {
    if (!hasUnsavedChanges) {
      setTripsList(localTrips);
      setPageSettings(localTripsPageSettings);
    }
  }, [localTrips, localTripsPageSettings, hasUnsavedChanges]);

  // Handle Save All to Live Server
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const ok = await saveLocalTripsToLive(tripsList, pageSettings);
      if (ok) {
        setHasUnsavedChanges(false);
        setSaveSuccessMsg('All Local Trips and page settings were successfully saved and will persist on reload.');
        setTimeout(() => setSaveSuccessMsg(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Reordering
  const handleMoveTrip = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tripsList.length) return;

    const updated = [...tripsList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const indexed = updated.map((t, i) => ({ ...t, orderIndex: i }));
    setTripsList(indexed);
    setHasUnsavedChanges(true);
  };

  // Toggle publish
  const handleTogglePublish = (id: string) => {
    const updated = tripsList.map((t) => (t.id === id ? { ...t, isPublished: !t.isPublished } : t));
    setTripsList(updated);
    setHasUnsavedChanges(true);
  };

  // Toggle featured
  const handleToggleFeatured = (id: string) => {
    const updated = tripsList.map((t) => (t.id === id ? { ...t, isFeatured: !t.isFeatured } : t));
    setTripsList(updated);
    setHasUnsavedChanges(true);
  };

  // Delete trip
  const handleDeleteTrip = (id: string) => {
    const updated = tripsList.filter((t) => t.id !== id);
    setTripsList(updated);
    setHasUnsavedChanges(true);
    setDeleteConfirmId(null);
  };

  // Duplicate trip
  const handleDuplicateTrip = (trip: LocalTrip) => {
    const dup: LocalTrip = {
      ...trip,
      id: `local-trip-${Date.now()}`,
      slug: `${trip.slug}-copy`,
      title: `${trip.title} (Copy)`,
      orderIndex: tripsList.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTripsList([dup, ...tripsList]);
    setHasUnsavedChanges(true);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    const defaultTrip: LocalTrip = {
      id: `local-trip-${Date.now()}`,
      slug: '',
      title: '',
      subtitle: '',
      description: '',
      fullDescription: '',
      featuredImage: '/images/heroes_weekend_royalton.jpg',
      location: 'Jamaica',
      category: pageSettings.categories?.[0] || 'Weekend Getaways',
      price: 15000,
      currency: 'JMD',
      priceType: 'Per Person',
      deposit: 5000,
      duration: 'Weekend',
      availableDates: '',
      status: 'Available',
      ctaText: 'Book Now (Pay Deposit)',
      inclusions: ['Roundtrip air-conditioned transportation', 'Guided island excursion'],
      exclusions: ['Gratuities / tips'],
      highlights: ['Authentic Jamaican Experience'],
      isPublished: true,
      isFeatured: false,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTrip(defaultTrip);
    setIsCreatingNew(true);
    setFormTab('basic');
  };

  // Save Trip from Editor Modal
  const handleSaveTripForm = () => {
    if (!editingTrip) return;
    if (!editingTrip.title.trim()) {
      alert('Trip Title is required.');
      return;
    }
    if (!editingTrip.location.trim()) {
      alert('Location is required.');
      return;
    }

    const cleanSlug =
      editingTrip.slug ||
      editingTrip.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const finalTrip: LocalTrip = {
      ...editingTrip,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
    };

    if (isCreatingNew) {
      setTripsList([finalTrip, ...tripsList]);
    } else {
      setTripsList(tripsList.map((t) => (t.id === finalTrip.id ? finalTrip : t)));
    }

    setHasUnsavedChanges(true);
    setEditingTrip(null);
    setIsCreatingNew(false);
  };

  // File upload for flyer/image
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTrip) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingTrip({ ...editingTrip, featuredImage: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add category to page settings
  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    const trimmed = newCategoryInput.trim();
    if (!pageSettings.categories?.includes(trimmed)) {
      setPageSettings({
        ...pageSettings,
        categories: [...(pageSettings.categories || []), trimmed],
      });
      setHasUnsavedChanges(true);
      setNewCategoryInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setPageSettings({
      ...pageSettings,
      categories: (pageSettings.categories || []).filter((c) => c !== cat),
    });
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-[#2E0249] text-white p-6 rounded-2xl border border-purple-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#FFC72C]" />
              <h2 className="text-2xl font-black text-white">Local Trips & Excursions Manager</h2>
              <span className="text-xs bg-[#FFC72C] text-[#2E0249] px-2.5 py-0.5 rounded-full font-black">
                WEBSITE SECTION
              </span>
            </div>
            <p className="text-xs text-neutral-200 mt-1 max-w-2xl">
              Add, update, organize, and publish Jamaican local trips, holiday getaways (e.g. Heroes Weekend), excursions, and day tours shown on the website's navigation ribbon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPageSettingsOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-700"
              id="admin-local-trips-page-settings-btn"
            >
              <Settings className="w-4 h-4 text-[#FFC72C]" />
              <span>Page Headings</span>
            </button>

            <button
              onClick={() => navigateTo('local-trips')}
              className="px-3.5 py-2.5 rounded-xl bg-purple-900/70 hover:bg-purple-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-700"
              id="admin-view-live-page-btn"
            >
              <Eye className="w-4 h-4 text-[#FFC72C]" />
              <span>View Customer Page</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-600 shadow-md"
              id="admin-add-local-trip-btn"
            >
              <Plus className="w-4 h-4 text-[#FFC72C]" />
              <span>Add New Local Trip</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg ${
                hasUnsavedChanges
                  ? 'bg-[#FFC72C] text-[#2E0249] hover:bg-amber-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              id="admin-save-all-local-trips-btn"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : hasUnsavedChanges ? 'Save Unsaved Changes' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Unsaved Changes Alert */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>You have unsaved changes in Local Trips. Click "Save All Changes" to persist them to the live website.</span>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-3 py-1 bg-[#FFC72C] text-[#2E0249] rounded-lg font-black hover:bg-amber-300 text-xs"
            >
              Save Now
            </button>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs text-emerald-200 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-purple-800/60 text-xs">
          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-800/50">
            <span className="text-neutral-400 block text-[11px]">Total Local Trips</span>
            <span className="text-xl font-black text-white">{tripsList.length}</span>
          </div>
          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-800/50">
            <span className="text-neutral-400 block text-[11px]">Published on Site</span>
            <span className="text-xl font-black text-emerald-400">
              {tripsList.filter((t) => t.isPublished !== false).length}
            </span>
          </div>
          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-800/50">
            <span className="text-neutral-400 block text-[11px]">Featured Badged</span>
            <span className="text-xl font-black text-[#FFC72C]">
              {tripsList.filter((t) => t.isFeatured).length}
            </span>
          </div>
          <div className="bg-purple-950/60 p-3 rounded-xl border border-purple-800/50">
            <span className="text-neutral-400 block text-[11px]">Active Categories</span>
            <span className="text-xl font-black text-purple-200">
              {pageSettings.categories?.length || 8}
            </span>
          </div>
        </div>
      </div>

      {/* Trips List Table / Cards */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Local Trips Offerings</h3>
            <p className="text-xs text-neutral-500">
              Drag or use arrows to change the display order on the customer website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-lg bg-[#2E0249] text-white text-xs font-bold hover:bg-purple-900 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>Add Trip</span>
            </button>
          </div>
        </div>

        {tripsList.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {tripsList.map((trip, idx) => (
              <div
                key={trip.id}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  !trip.isPublished ? 'bg-neutral-50/80 opacity-75' : 'hover:bg-neutral-50'
                }`}
                id={`admin-trip-row-${trip.id}`}
              >
                {/* Left info & thumbnail */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Reorder controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveTrip(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveTrip(idx, 'down')}
                      disabled={idx === tripsList.length - 1}
                      className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0 relative border border-neutral-300">
                    <img
                      src={trip.featuredImage}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    {trip.isFeatured && (
                      <span className="absolute top-1 left-1 bg-[#FFC72C] text-[#2E0249] p-0.5 rounded shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Trip details */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        {trip.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          trip.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trip.status === 'Limited Spots'
                            ? 'bg-amber-100 text-amber-800'
                            : trip.status === 'Sold Out'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {trip.status}
                      </span>
                      {!trip.isPublished && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                          Draft (Hidden)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {trip.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[180px]">{trip.location}</span>
                      </span>
                      {trip.availableDates && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{trip.availableDates}</span>
                        </span>
                      )}
                      {trip.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{trip.duration}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right pricing & controls */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  <div className="text-left lg:text-right">
                    <div className="text-xs text-neutral-400 font-medium">
                      Rate ({trip.priceType || 'Per Person'}):
                    </div>
                    <div className="text-base font-extrabold text-[#2E0249]">
                      {trip.currency === 'USD' ? `$${trip.price.toLocaleString()} USD` : formatPriceJMD(trip.price)}
                    </div>
                    {trip.deposit && trip.deposit > 0 && (
                      <div className="text-[11px] text-emerald-600 font-bold">
                        Deposit: {trip.currency === 'USD' ? `$${trip.deposit.toLocaleString()} USD` : formatPriceJMD(trip.deposit)}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Published button */}
                    <button
                      onClick={() => handleTogglePublish(trip.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        trip.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                      }`}
                      title={trip.isPublished ? 'Published on website' : 'Draft / Hidden'}
                    >
                      {trip.isPublished ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>

                    {/* Toggle Featured button */}
                    <button
                      onClick={() => handleToggleFeatured(trip.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                        trip.isFeatured
                          ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                      }`}
                      title={trip.isFeatured ? 'Featured badge active' : 'Not featured'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Preview button */}
                    <button
                      onClick={() => setPreviewingTrip(trip)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 text-xs"
                      title="Preview Trip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Duplicate button */}
                    <button
                      onClick={() => handleDuplicateTrip(trip)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 text-xs"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingTrip({ ...trip });
                        setIsCreatingNew(false);
                        setFormTab('basic');
                      }}
                      className="px-3 py-2 rounded-xl bg-[#2E0249] hover:bg-purple-900 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FFC72C]" />
                      <span>Edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteConfirmId(trip.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Compass className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-neutral-700">No Local Trips Found</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Click the button below to add your first local Jamaican trip offering.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-[#2E0249] text-white rounded-xl text-xs font-bold hover:bg-purple-900"
            >
              + Add Local Trip
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Delete Local Trip?</h4>
            <p className="text-xs text-neutral-600 mt-1">
              Are you sure you want to remove this local trip from the website? Remember to click "Save All Changes" to persist.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrip(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Trip Editor Modal (Create or Edit) */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div
            className="bg-white rounded-3xl w-full max-w-3xl my-8 shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-[#2E0249] text-white flex items-center justify-between border-b border-purple-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#FFC72C]" />
                  <span>{isCreatingNew ? 'Create New Local Trip' : `Edit: ${editingTrip.title}`}</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Configure all pricing, dates, flyer image, and inclusions for this Jamaican experience.
                </p>
              </div>
              <button
                onClick={() => setEditingTrip(null)}
                className="p-1.5 rounded-full hover:bg-purple-900 text-neutral-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Navigation Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 px-5 gap-1 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setFormTab('basic')}
                className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  formTab === 'basic'
                    ? 'border-[#2E0249] text-[#2E0249]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                1. Basic Info
              </button>
              <button
                onClick={() => setFormTab('media')}
                className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  formTab === 'media'
                    ? 'border-[#2E0249] text-[#2E0249]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                2. Flyer & Media
              </button>
              <button
                onClick={() => setFormTab('pricing')}
                className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  formTab === 'pricing'
                    ? 'border-[#2E0249] text-[#2E0249]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                3. Pricing & Dates
              </button>
              <button
                onClick={() => setFormTab('details')}
                className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  formTab === 'details'
                    ? 'border-[#2E0249] text-[#2E0249]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                4. Description & Inclusions
              </button>
              <button
                onClick={() => setFormTab('display')}
                className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  formTab === 'display'
                    ? 'border-[#2E0249] text-[#2E0249]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                5. Display Toggles
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {formTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Trip Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingTrip.title}
                      onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                      placeholder="e.g. HEROES WEEKEND - Royalton Hideaway Blue Waters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={editingTrip.subtitle || ''}
                        onChange={(e) => setEditingTrip({ ...editingTrip, subtitle: e.target.value })}
                        placeholder="e.g. Luxury All-Inclusive Adults Only"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={editingTrip.category}
                        onChange={(e) => setEditingTrip({ ...editingTrip, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      >
                        {(pageSettings.categories || []).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Location in Jamaica <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingTrip.location}
                        onChange={(e) => setEditingTrip({ ...editingTrip, location: e.target.value })}
                        placeholder="e.g. Blue Waters, Falmouth, Trelawny, Jamaica"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        URL Slug (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingTrip.slug}
                        onChange={(e) => setEditingTrip({ ...editingTrip, slug: e.target.value })}
                        placeholder="auto-generated-from-title"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                      <input
                        type="checkbox"
                        checked={editingTrip.isPublished}
                        onChange={(e) => setEditingTrip({ ...editingTrip, isPublished: e.target.checked })}
                        className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249]"
                      />
                      <span>Publish on Website Immediately</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
                      <input
                        type="checkbox"
                        checked={editingTrip.isFeatured}
                        onChange={(e) => setEditingTrip({ ...editingTrip, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249]"
                      />
                      <span>Mark as "Featured" Package</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & FLYER */}
              {formTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Featured Image URL / Flyer Link
                    </label>
                    <input
                      type="text"
                      value={editingTrip.featuredImage}
                      onChange={(e) => setEditingTrip({ ...editingTrip, featuredImage: e.target.value })}
                      placeholder="https://... or /images/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>

                  {/* Upload custom file */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="p-3 bg-purple-100 text-purple-900 rounded-full shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <div className="text-xs font-bold text-neutral-900">Upload Trip Flyer / Photo</div>
                        <div className="text-[11px] text-neutral-500">
                          Select a JPEG or PNG image from your computer to use as the hero card flyer.
                        </div>
                      </div>
                      <label className="px-4 py-2 rounded-xl bg-[#2E0249] hover:bg-purple-900 text-white text-xs font-bold cursor-pointer transition-all">
                        <span>Browse File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Quick Preset Images */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Or Choose a Jamaican Preset Destination:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_IMAGES.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEditingTrip({ ...editingTrip, featuredImage: preset.url })}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            editingTrip.featuredImage === preset.url
                              ? 'border-[#2E0249] bg-purple-50 ring-2 ring-[#2E0249]/30'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <span className="text-[11px] font-bold text-neutral-800 line-clamp-2">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview of flyer */}
                  {editingTrip.featuredImage && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="text-xs font-bold text-neutral-700 mb-2">Current Image Preview:</div>
                      <div className="aspect-[16/9] max-w-md rounded-2xl overflow-hidden border border-neutral-300 shadow-md">
                        <img
                          src={editingTrip.featuredImage}
                          alt="Flyer Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRICING & DATES */}
              {formTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Package Price <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={editingTrip.price}
                        onChange={(e) => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })}
                        placeholder="202530"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Currency
                      </label>
                      <select
                        value={editingTrip.currency || 'JMD'}
                        onChange={(e: any) => setEditingTrip({ ...editingTrip, currency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:outline-none focus:border-[#2E0249]"
                      >
                        <option value="JMD">JMD (Jamaican Dollar)</option>
                        <option value="USD">USD (US Dollar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Pricing Basis
                      </label>
                      <input
                        type="text"
                        value={editingTrip.priceType || 'Per Person'}
                        onChange={(e) => setEditingTrip({ ...editingTrip, priceType: e.target.value })}
                        placeholder="e.g. Two (2) Adults or Per Person"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Deposit Amount
                      </label>
                      <input
                        type="number"
                        value={editingTrip.deposit || 0}
                        onChange={(e) => setEditingTrip({ ...editingTrip, deposit: Number(e.target.value) })}
                        placeholder="60760"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={editingTrip.duration || ''}
                        onChange={(e) => setEditingTrip({ ...editingTrip, duration: e.target.value })}
                        placeholder="e.g. 4 Days / 3 Nights or Full-Day"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Availability Status
                      </label>
                      <select
                        value={editingTrip.status}
                        onChange={(e: any) => setEditingTrip({ ...editingTrip, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:outline-none focus:border-[#2E0249]"
                      >
                        <option value="Available">Available</option>
                        <option value="Limited Spots">Limited Spots</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Available Dates
                      </label>
                      <input
                        type="text"
                        value={editingTrip.availableDates || ''}
                        onChange={(e) => setEditingTrip({ ...editingTrip, availableDates: e.target.value })}
                        placeholder="e.g. October 16 - 19, 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                        Action Button Text
                      </label>
                      <input
                        type="text"
                        value={editingTrip.ctaText || 'Book Now (Pay Deposit)'}
                        onChange={(e) => setEditingTrip({ ...editingTrip, ctaText: e.target.value })}
                        placeholder="e.g. Book Now (Pay Deposit)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DESCRIPTIONS & INCLUSIONS */}
              {formTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Short Description (Card Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={editingTrip.description}
                      onChange={(e) => setEditingTrip({ ...editingTrip, description: e.target.value })}
                      placeholder="Brief teaser description displayed on the main Local Trips card..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Full Description & Itinerary (Modal Overview)
                    </label>
                    <textarea
                      rows={3}
                      value={editingTrip.fullDescription || ''}
                      onChange={(e) => setEditingTrip({ ...editingTrip, fullDescription: e.target.value })}
                      placeholder="Comprehensive overview of resort, itinerary, festivities, and experience..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                    />
                  </div>

                  {/* Inclusions List Editor */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      What's Included:
                    </label>
                    <div className="space-y-2 mb-2">
                      {(editingTrip.inclusions || []).map((inc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs text-neutral-800 flex-1">{inc}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTrip({
                                ...editingTrip,
                                inclusions: (editingTrip.inclusions || []).filter((_, idx) => idx !== i),
                              })
                            }
                            className="text-neutral-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newInclusion}
                        onChange={(e) => setNewInclusion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newInclusion.trim()) {
                              setEditingTrip({
                                ...editingTrip,
                                inclusions: [...(editingTrip.inclusions || []), newInclusion.trim()],
                              });
                              setNewInclusion('');
                            }
                          }
                        }}
                        placeholder="Add new inclusion (press Enter)..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newInclusion.trim()) {
                            setEditingTrip({
                              ...editingTrip,
                              inclusions: [...(editingTrip.inclusions || []), newInclusion.trim()],
                            });
                            setNewInclusion('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Exclusions List Editor */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      What's Excluded / Not Included:
                    </label>
                    <div className="space-y-2 mb-2">
                      {(editingTrip.exclusions || []).map((exc, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="text-xs text-neutral-800 flex-1">{exc}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTrip({
                                ...editingTrip,
                                exclusions: (editingTrip.exclusions || []).filter((_, idx) => idx !== i),
                              })
                            }
                            className="text-neutral-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newExclusion}
                        onChange={(e) => setNewExclusion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newExclusion.trim()) {
                              setEditingTrip({
                                ...editingTrip,
                                exclusions: [...(editingTrip.exclusions || []), newExclusion.trim()],
                              });
                              setNewExclusion('');
                            }
                          }
                        }}
                        placeholder="Add new exclusion item..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newExclusion.trim()) {
                            setEditingTrip({
                              ...editingTrip,
                              exclusions: [...(editingTrip.exclusions || []), newExclusion.trim()],
                            });
                            setNewExclusion('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Highlights Tags */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                      Key Highlights / Badges:
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(editingTrip.highlights || []).map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200"
                        >
                          <span>{h}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTrip({
                                ...editingTrip,
                                highlights: (editingTrip.highlights || []).filter((_, idx) => idx !== i),
                              })
                            }
                            className="hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        placeholder="e.g. All-Inclusive Luxury"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newHighlight.trim()) {
                            setEditingTrip({
                              ...editingTrip,
                              highlights: [...(editingTrip.highlights || []), newHighlight.trim()],
                            });
                            setNewHighlight('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#2E0249] text-white text-xs font-bold"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DISPLAY TOGGLES */}
              {formTab === 'display' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#2E0249]" />
                      Field Visibility Controls
                    </h4>
                    <p className="text-xs text-purple-900">
                      Customize which fields and elements travelers see on the website card for this trip.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'showPrice', label: 'Show Package Price' },
                      { key: 'showDeposit', label: 'Show Deposit Amount' },
                      { key: 'showDates', label: 'Show Available Dates' },
                      { key: 'showDuration', label: 'Show Duration Badge' },
                      { key: 'showLocation', label: 'Show Parish / Location' },
                      { key: 'showAvailability', label: 'Show Availability Status' },
                      { key: 'showCategory', label: 'Show Category Badge' },
                      { key: 'showInclusions', label: 'Show Inclusions Preview' },
                    ].map((item) => {
                      const currentOpts = editingTrip.displayOptions || {
                        showPrice: true,
                        showDeposit: true,
                        showDates: true,
                        showDuration: true,
                        showLocation: true,
                        showAvailability: true,
                        showCategory: true,
                        showInclusions: true,
                      };
                      const isChecked = currentOpts[item.key as keyof typeof currentOpts] ?? true;

                      return (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                        >
                          <span className="text-xs font-bold text-neutral-800">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setEditingTrip({
                                ...editingTrip,
                                displayOptions: {
                                  ...currentOpts,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTripForm}
                className="px-6 py-2.5 rounded-xl bg-[#2E0249] hover:bg-purple-900 text-[#FFC72C] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
                id="save-local-trip-form-btn"
              >
                <Check className="w-4 h-4" />
                <span>{isCreatingNew ? 'Add Trip to Offerings' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Settings Modal */}
      {isPageSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2E0249]" />
                <span>Local Trips Page Headings & Categories</span>
              </h3>
              <button onClick={() => setIsPageSettingsOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Main Page Heading
                </label>
                <input
                  type="text"
                  value={pageSettings.pageTitle || 'Local Trips'}
                  onChange={(e) => {
                    setPageSettings({ ...pageSettings, pageTitle: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Local Trips"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Hero Badge Text
                </label>
                <input
                  type="text"
                  value={pageSettings.heroBadge || 'Authentic Jamaican Experiences'}
                  onChange={(e) => {
                    setPageSettings({ ...pageSettings, heroBadge: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Authentic Jamaican Experiences"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#2E0249]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Introductory Description
                </label>
                <textarea
                  rows={3}
                  value={pageSettings.introText || ''}
                  onChange={(e) => {
                    setPageSettings({ ...pageSettings, introText: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Discover Jamaica, one unforgettable experience at a time..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Trip Categories:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(pageSettings.categories || []).map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-neutral-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="New category name..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[#2E0249]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-[#2E0249] text-white rounded-xl text-xs font-bold"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPageSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  updateLocalTripsPageSettings(pageSettings);
                  setIsPageSettingsOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#2E0249] text-[#FFC72C] text-xs font-black hover:bg-purple-900"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Preview Modal */}
      {previewingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 rounded-3xl max-w-2xl w-full border border-purple-800 text-white overflow-hidden shadow-2xl">
            <div className="p-4 bg-black/60 flex items-center justify-between border-b border-neutral-800">
              <span className="text-xs font-bold text-[#FFC72C]">Customer View Preview</span>
              <button onClick={() => setPreviewingTrip(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full bg-black">
              <img
                src={previewingTrip.featuredImage}
                alt={previewingTrip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/50" />
              <div className="absolute top-3 left-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#2E0249] text-[#FFC72C] border border-[#FFC72C]/40">
                  {previewingTrip.category}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                {previewingTrip.subtitle && (
                  <div className="text-xs font-bold text-[#FFC72C] uppercase">{previewingTrip.subtitle}</div>
                )}
                <h3 className="text-xl font-black text-white">{previewingTrip.title}</h3>
                <div className="text-xs text-neutral-300 mt-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#FFC72C]" />
                  <span>{previewingTrip.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-neutral-800 rounded-2xl">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">
                    Rate ({previewingTrip.priceType || 'Per Person'})
                  </div>
                  <div className="text-xl font-black text-[#FFC72C]">
                    {previewingTrip.currency === 'USD'
                      ? `$${previewingTrip.price.toLocaleString()} USD`
                      : formatPriceJMD(previewingTrip.price)}
                  </div>
                </div>
                {previewingTrip.deposit && previewingTrip.deposit > 0 && (
                  <div className="text-xs font-bold text-emerald-400">
                    Deposit: {previewingTrip.currency === 'USD' ? `$${previewingTrip.deposit.toLocaleString()} USD` : formatPriceJMD(previewingTrip.deposit)}
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {previewingTrip.fullDescription || previewingTrip.description}
              </p>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => setPreviewingTrip(null)}
                  className="px-4 py-2 rounded-xl bg-[#FFC72C] text-[#2E0249] text-xs font-black"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
