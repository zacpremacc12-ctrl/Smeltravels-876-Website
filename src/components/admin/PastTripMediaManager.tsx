import React, { useState, useRef } from 'react';
import {
  Camera,
  Video,
  Plus,
  Trash2,
  Upload,
  Link,
  Sparkles,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Film,
  Play,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { TripPackage, PastTripMediaItem, TripStatus } from '../../types';
import { parseVideoUrl, PAST_TRIP_PHOTO_PRESETS, PAST_TRIP_VIDEO_PRESETS } from '../../lib/videoUtils';

interface PastTripMediaManagerProps {
  trip: TripPackage;
  onChange: (updatedTrip: TripPackage) => void;
}

export const PastTripMediaManager: React.FC<PastTripMediaManagerProps> = ({
  trip,
  onChange,
}) => {
  const isPast = trip.isPastTrip || trip.status === 'Past Trip';

  // State for adding photo
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // State for adding video
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCaption, setNewVideoCaption] = useState('');

  // Active sub-tab inside past trip manager: 'recap' | 'photos' | 'videos'
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'photos' | 'videos' | 'recap'>('all');

  const mediaList: PastTripMediaItem[] = trip.pastTripMedia || [];
  const photos = mediaList.filter((m) => m.type === 'image');
  const videos = mediaList.filter((m) => m.type === 'video');

  // Toggle trip between Upcoming and Past Trip
  const handleTogglePastTrip = (enabled: boolean) => {
    onChange({
      ...trip,
      isPastTrip: enabled,
      status: enabled ? 'Past Trip' : (trip.status === 'Past Trip' ? 'Available' : trip.status),
      pastTripDateSummary: enabled ? (trip.pastTripDateSummary || `Completed in ${trip.year}`) : trip.pastTripDateSummary,
      pastTripRecap: enabled
        ? (trip.pastTripRecap || `Our unforgettable group journey to ${trip.destination}, ${trip.country}. Relive the special moments, excursions, and traveler memories below!`)
        : trip.pastTripRecap,
    });
  };

  // Add photo
  const handleAddPhoto = (urlToAdd: string, titleToAdd?: string, captionToAdd?: string) => {
    if (!urlToAdd.trim()) return;
    const newItem: PastTripMediaItem = {
      id: `media-photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'image',
      url: urlToAdd.trim(),
      title: titleToAdd?.trim() || 'Group Traveler Memory',
      caption: captionToAdd?.trim() || '',
      uploadedAt: new Date().toISOString(),
    };

    const nextMedia = [...mediaList, newItem];
    onChange({
      ...trip,
      isPastTrip: true,
      status: 'Past Trip',
      pastTripMedia: nextMedia,
    });

    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoCaption('');
  };

  // Handle local image file upload
  const handlePhotoFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          handleAddPhoto(result, file.name.replace(/\.[^/.]+$/, ''), 'Traveler captured memory');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add video
  const handleAddVideo = (urlToAdd: string, titleToAdd?: string, captionToAdd?: string) => {
    if (!urlToAdd.trim()) return;
    const newItem: PastTripMediaItem = {
      id: `media-video-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'video',
      url: urlToAdd.trim(),
      title: titleToAdd?.trim() || 'Trip Highlights Video',
      caption: captionToAdd?.trim() || '',
      uploadedAt: new Date().toISOString(),
    };

    const nextMedia = [...mediaList, newItem];
    onChange({
      ...trip,
      isPastTrip: true,
      status: 'Past Trip',
      pastTripMedia: nextMedia,
    });

    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoCaption('');
  };

  // Remove media item
  const handleRemoveMedia = (idToRemove: string) => {
    const nextMedia = mediaList.filter((m) => m.id !== idToRemove);
    onChange({
      ...trip,
      pastTripMedia: nextMedia,
    });
  };

  // Move media item
  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mediaList.length - 1) return;

    const next = [...mediaList];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;

    onChange({
      ...trip,
      pastTripMedia: next,
    });
  };

  // Quick 1-click populate demo past trip media
  const handleApplyAllPresets = () => {
    const presetItems: PastTripMediaItem[] = [
      ...PAST_TRIP_PHOTO_PRESETS.map((p, i) => ({
        id: `preset-photo-${i}-${Date.now()}`,
        type: 'image' as const,
        url: p.url,
        title: p.title,
        caption: p.caption,
      })),
      ...PAST_TRIP_VIDEO_PRESETS.map((v, i) => ({
        id: `preset-video-${i}-${Date.now()}`,
        type: 'video' as const,
        url: v.url,
        title: v.title,
        caption: v.caption,
      })),
    ];

    onChange({
      ...trip,
      isPastTrip: true,
      status: 'Past Trip',
      pastTripDateSummary: trip.pastTripDateSummary || `Completed in ${trip.year}`,
      pastTripRecap: trip.pastTripRecap || `Our flagship group trip to ${trip.destination}, ${trip.country} was a resounding success! With over 30 Jamaican travelers, we explored historical landmarks, enjoyed luxury beach clubs, and created lifelong bonds. Relive the full journey in our photos and video reels below!`,
      pastTripMedia: [...mediaList, ...presetItems],
    });
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/80 via-white to-amber-50/50 rounded-2xl border border-purple-200 shadow-sm space-y-5">
      {/* Top Banner & Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-900 text-[#FFC72C] flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-purple-950 font-['Outfit',sans-serif] flex items-center gap-2">
                <span>Past Trip Showcase, Photos & Videos</span>
                {isPast ? (
                  <span className="bg-purple-900 text-[#FFC72C] text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                    📸 Marked as Past Trip
                  </span>
                ) : (
                  <span className="bg-neutral-200 text-neutral-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Upcoming Package
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Mark completed trips as "Past Trip", publish traveler photos & videos, and showcase memories to the public.
              </p>
            </div>
          </div>
        </div>

        {/* Master Past Trip Switch */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs shrink-0">
          <span className="text-xs font-bold text-neutral-800">
            {isPast ? 'Past Trip Active' : 'Enable Past Trip Mode'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPast}
              onChange={(e) => handleTogglePastTrip(e.target.checked)}
              className="sr-only peer"
              id="toggle-past-trip-switch"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-900"></div>
          </label>
        </div>
      </div>

      {/* When Past Trip is toggled on, show full suite */}
      {isPast ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quick Stats & Quick Preset Loader */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-purple-100 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-purple-950">
                <Camera className="w-3.5 h-3.5 text-purple-700" />
                <span>{photos.length} Photos</span>
              </span>
              <span className="text-neutral-300">|</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-900">
                <Film className="w-3.5 h-3.5 text-amber-600" />
                <span>{videos.length} Videos</span>
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publicly Visible on Live Site</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyAllPresets}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-purple-950 border border-amber-300 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Load sample high-resolution past photos and YouTube recap reels"
            >
              <Sparkles className="w-3 h-3 text-purple-900 fill-current" />
              <span>Load 1-Click Photos & Videos Demo</span>
            </button>
          </div>

          {/* Section 1: Past Trip Recap & Completed Date */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-900" />
                <span>Past Trip Recap Story & Traveler Highlights</span>
              </label>
              <span className="text-[10px] text-neutral-400">Shown in public trip detail overview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={trip.pastTripRecap || ''}
                  onChange={(e) => onChange({ ...trip, pastTripRecap: e.target.value })}
                  placeholder="e.g. In September 2025, our group of 28 Jamaican travelers embarked on an epic journey to Panama! From touring the historic canal to shopping duty-free in Colon and dancing in Casco Viejo, this trip made unforgettable memories..."
                  className="w-full p-2.5 text-xs text-neutral-800 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Trip Completed Date / Tag
                </label>
                <input
                  type="text"
                  value={trip.pastTripDateSummary || ''}
                  onChange={(e) => onChange({ ...trip, pastTripDateSummary: e.target.value })}
                  placeholder="e.g. Completed October 2025"
                  className="w-full p-2 text-xs text-neutral-800 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Quick chips:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[
                    `Completed ${trip.year - 1}`,
                    `Completed Fall ${trip.year - 1}`,
                    `Concluded ${trip.dates}`,
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => onChange({ ...trip, pastTripDateSummary: chip })}
                      className="text-[9px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-300 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Upload Pictures & Add Videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box A: Add Pictures */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-900" />
                  <span>Post Pictures ({photos.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => photoFileInputRef.current?.click()}
                  className="text-[10px] font-bold px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload from Computer</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={photoFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoFileUpload(e.target.files)}
              />

              {/* URL & caption form */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste Photo Image URL (https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Photo Title (e.g. Group Gala)"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Short Caption (Optional)"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPhoto(newPhotoUrl, newPhotoTitle, newPhotoCaption)}
                  disabled={!newPhotoUrl.trim()}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    newPhotoUrl.trim()
                      ? 'bg-purple-900 text-[#FFC72C] hover:bg-purple-800 cursor-pointer shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Picture to Trip Gallery</span>
                </button>
              </div>

              {/* 1-click Preset Photo Chips */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  1-Click Sample Photos:
                </span>
                <div className="flex flex-wrap gap-1">
                  {PAST_TRIP_PHOTO_PRESETS.slice(0, 4).map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleAddPhoto(p.url, p.title, p.caption)}
                      className="text-[10px] font-semibold bg-neutral-50 hover:bg-purple-50 text-neutral-700 hover:text-purple-900 px-2 py-0.5 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                    >
                      + {p.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Box B: Add Videos */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-600" />
                  <span>Post Videos ({videos.length})</span>
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
                  YouTube • Vimeo • MP4
                </span>
              </div>

              {/* URL & caption form */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste YouTube, Vimeo or MP4 Video Link..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Video Title (e.g. Official Reel)"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Video Caption / Description"
                    value={newVideoCaption}
                    onChange={(e) => setNewVideoCaption(e.target.value)}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-purple-900/20 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddVideo(newVideoUrl, newVideoTitle, newVideoCaption)}
                  disabled={!newVideoUrl.trim()}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    newVideoUrl.trim()
                      ? 'bg-[#2E0249] text-[#FFC72C] hover:bg-[#3B185F] cursor-pointer shadow-xs'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Video to Public Showcase</span>
                </button>
              </div>

              {/* 1-click Preset Video Chips */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  1-Click Sample Videos:
                </span>
                <div className="flex flex-wrap gap-1">
                  {PAST_TRIP_VIDEO_PRESETS.map((v) => (
                    <button
                      key={v.title}
                      type="button"
                      onClick={() => handleAddVideo(v.url, v.title, v.caption)}
                      className="text-[10px] font-semibold bg-amber-50/70 hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                    >
                      + {v.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Current Published Media Grid */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-800">
                  Published Media on Public Site ({mediaList.length} items)
                </span>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    activeMediaTab === 'all'
                      ? 'bg-purple-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  All ({mediaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    activeMediaTab === 'photos'
                      ? 'bg-purple-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Photos ({photos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    activeMediaTab === 'videos'
                      ? 'bg-purple-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Videos ({videos.length})
                </button>
              </div>
            </div>

            {mediaList.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-neutral-300" />
                <p className="text-xs font-semibold">No pictures or videos posted for this trip yet.</p>
                <p className="text-[11px] text-neutral-400">
                  Use the photo uploader or video link form above, or click "Load 1-Click Photos & Videos Demo" to populate.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mediaList
                  .filter((m) => {
                    if (activeMediaTab === 'photos') return m.type === 'image';
                    if (activeMediaTab === 'videos') return m.type === 'video';
                    return true;
                  })
                  .map((item, index) => {
                    const videoInfo = item.type === 'video' ? parseVideoUrl(item.url) : null;

                    return (
                      <div
                        key={item.id}
                        className="bg-neutral-50 rounded-xl border border-neutral-200 p-2.5 flex flex-col space-y-2 relative group hover:border-purple-300 transition-colors"
                      >
                        {/* Media Preview Box */}
                        <div className="relative h-32 w-full rounded-lg overflow-hidden bg-neutral-900">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.title || 'Trip photo'}
                              className="w-full h-full object-cover"
                            />
                          ) : videoInfo && videoInfo.type === 'youtube' ? (
                            <div className="relative w-full h-full">
                              <iframe
                                src={videoInfo.embedUrl}
                                title={item.title || 'Video'}
                                className="w-full h-full border-0 pointer-events-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : videoInfo && videoInfo.isDirectVideo ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <video src={item.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950 text-white p-2 text-center">
                              <Film className="w-6 h-6 text-[#FFC72C] mb-1" />
                              <span className="text-[10px] font-mono truncate max-w-full">{item.url}</span>
                            </div>
                          )}

                          {/* Media Type Tag */}
                          <div className="absolute top-2 left-2">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow ${
                                item.type === 'video'
                                  ? 'bg-amber-400 text-purple-950'
                                  : 'bg-purple-900 text-white'
                              }`}
                            >
                              {item.type === 'video' ? '🎬 Video' : '📸 Photo'}
                            </span>
                          </div>

                          {/* Controls (Move & Delete) */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(item.id)}
                              className="w-6 h-6 rounded-md bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow cursor-pointer transition-colors"
                              title="Delete media"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Caption */}
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const next = mediaList.map((m) =>
                                m.id === item.id ? { ...m, title: e.target.value } : m
                              );
                              onChange({ ...trip, pastTripMedia: next });
                            }}
                            placeholder="Media title..."
                            className="w-full text-xs font-bold text-neutral-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-purple-600 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={item.caption || ''}
                            onChange={(e) => {
                              const next = mediaList.map((m) =>
                                m.id === item.id ? { ...m, caption: e.target.value } : m
                              );
                              onChange({ ...trip, pastTripMedia: next });
                            }}
                            placeholder="Add traveler caption / notes..."
                            className="w-full text-[11px] text-neutral-500 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-purple-600 focus:outline-none"
                          />
                        </div>

                        {/* Order Reordering Buttons */}
                        <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>#{index + 1} of {mediaList.length}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveMedia(index, 'up')}
                              className={`p-1 rounded hover:bg-neutral-200 text-neutral-600 ${
                                index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title="Move left/up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === mediaList.length - 1}
                              onClick={() => handleMoveMedia(index, 'down')}
                              className={`p-1 rounded hover:bg-neutral-200 text-neutral-600 ${
                                index === mediaList.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title="Move right/down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Disabled Preview State */
        <div className="p-4 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
          <div>
            <span className="font-bold text-neutral-800 block">Currently configured as an Upcoming Trip package</span>
            <span className="text-[11px] text-neutral-500">
              Toggle the switch above or select "Past Trip" in the status dropdown whenever this tour concludes to post customer photos & videos.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTogglePastTrip(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-900 text-[#FFC72C] font-bold text-xs hover:bg-purple-800 transition-colors cursor-pointer shrink-0"
          >
            Switch to Past Trip Now
          </button>
        </div>
      )}
    </div>
  );
};
