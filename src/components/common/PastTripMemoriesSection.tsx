import React, { useState } from 'react';
import {
  Camera,
  Film,
  Play,
  X,
  Sparkles,
  Calendar,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowRight,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { TripPackage, PastTripMediaItem } from '../../types';
import { parseVideoUrl } from '../../lib/videoUtils';
import { useApp } from '../../context/AppContext';

interface PastTripMemoriesSectionProps {
  trip: TripPackage;
}

export const PastTripMemoriesSection: React.FC<PastTripMemoriesSectionProps> = ({ trip }) => {
  const { navigateTo, openCustomTripModal, settings } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PastTripMediaItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const mediaList: PastTripMediaItem[] = trip.pastTripMedia || [];
  const photos = mediaList.filter((m) => m.type === 'image');
  const videos = mediaList.filter((m) => m.type === 'video');

  const displayedMedia = mediaList.filter((m) => {
    if (activeFilter === 'photos') return m.type === 'image';
    if (activeFilter === 'videos') return m.type === 'video';
    return true;
  });

  const handleShareMemories = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trip.name} — Past Trip Memories & Photos`,
        text: `Check out the photos and recap videos from the SMELTRAVELS876 ${trip.name} group adventure!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div className="space-y-8" id="past-trip-memories-section">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] text-white p-6 sm:p-8 rounded-3xl border border-purple-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FFC72C] text-[#2E0249] text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 fill-current" />
                <span>Completed Past Trip Showcase</span>
              </span>
              {trip.pastTripDateSummary && (
                <span className="bg-white/10 text-neutral-200 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>{trip.pastTripDateSummary}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight text-white">
              Trip Memories, Photos & Video Reel
            </h2>

            <p className="text-xs sm:text-sm text-neutral-200 max-w-2xl leading-relaxed">
              {trip.pastTripRecap ||
                `Relive the unforgettable moments from our group adventure to ${trip.destination}, ${trip.country}. Browse the authentic photos and video recaps shared by our Jamaican travelers!`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleShareMemories}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#FFC72C]" />
                  <span>Share Album</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Hi SMELTRAVELS876! I saw the past trip photos for ${trip.name} and would love to know when you are hosting a similar trip next!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Inquire Next Tour</span>
            </a>
          </div>
        </div>

        {/* Media Stats Summary Strip */}
        <div className="mt-6 pt-5 border-t border-purple-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Camera className="w-4 h-4 text-[#FFC72C]" />
              <span>{photos.length} Published Photos</span>
            </span>
            <span className="text-purple-400">•</span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Film className="w-4 h-4 text-amber-400" />
              <span>{videos.length} Video Highlights</span>
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#FFC72C] text-[#2E0249] shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              All ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('photos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'photos'
                  ? 'bg-[#FFC72C] text-[#2E0249] shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Photos ({photos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('videos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeFilter === 'videos'
                  ? 'bg-[#FFC72C] text-[#2E0249] shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Videos ({videos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {displayedMedia.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-900 mx-auto flex items-center justify-center">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">
            No {activeFilter === 'photos' ? 'photos' : activeFilter === 'videos' ? 'videos' : 'media'} in this category yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Our trip coordinators will be uploading the group photos and recap reels shortly. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedMedia.map((item, index) => {
            if (item.type === 'video') {
              const videoInfo = parseVideoUrl(item.url);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  {/* Video Thumbnail / Preview Container */}
                  <div
                    onClick={() => setSelectedVideo(item)}
                    className="relative h-52 w-full bg-black cursor-pointer overflow-hidden group-hover:brightness-105"
                  >
                    {videoInfo.type === 'youtube' && videoInfo.videoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${videoInfo.videoId}/hqdefault.jpg`}
                        alt={item.title || 'Video preview'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : videoInfo.isDirectVideo ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-950 to-neutral-900 flex items-center justify-center p-4">
                        <Film className="w-12 h-12 text-[#FFC72C]/70" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#FFC72C] text-[#2E0249] flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="bg-[#2E0249]/90 backdrop-blur-md text-[#FFC72C] text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow border border-purple-700/50 flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        <span>Video Reel</span>
                      </span>
                    </div>
                  </div>

                  {/* Caption & Title */}
                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 font-['Outfit',sans-serif] leading-snug">
                        {item.title || 'Trip Highlight Reel'}
                      </h4>
                      {item.caption && (
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedVideo(item)}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#2E0249] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Full Video</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Image Card
            const photoIndex = photos.findIndex((p) => p.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhotoIndex(photoIndex)}
                className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="relative h-60 w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title || 'Traveler photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Click to view full photo</span>
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-[#2E0249] text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow border border-purple-200 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Photo</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">
                    {item.title || 'Traveler Memory'}
                  </h4>
                  {item.caption && (
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missed this trip CTA */}
      <div className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/60 text-amber-950 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-900 fill-current" />
            <span>Join The Next Adventure</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
            Want to be in the next group photo?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl">
            Our upcoming international group tours are accepting reservations! Check out our current lineup departing from Kingston with flights, hotels, and excursions included.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigateTo('trips')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Browse Upcoming Trips</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openCustomTripModal()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-neutral-50 text-purple-950 font-bold text-xs sm:text-sm border border-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Request Custom Tour</span>
          </button>
        </div>
      </div>

      {/* LIGHTBOX MODAL: FULL SCREEN PHOTO */}
      {selectedPhotoIndex !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-12 right-0 sm:right-2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : photos.length - 1
                    )
                  }
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null && prev < photos.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title || 'Traveler photo'}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Caption Bar */}
            <div className="w-full bg-[#1A1824] text-white p-4 rounded-2xl mt-3 flex items-center justify-between border border-purple-900/50">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#FFC72C]">
                  {currentPhoto.title || 'Traveler Memory'}
                </h4>
                {currentPhoto.caption && (
                  <p className="text-xs text-neutral-300">{currentPhoto.caption}</p>
                )}
              </div>
              <span className="text-xs text-neutral-400 font-mono shrink-0 ml-4">
                {selectedPhotoIndex + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL: RESPONSIVE PLAYER */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1A1824] rounded-3xl overflow-hidden border border-purple-900 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#2E0249] text-white flex items-center justify-between border-b border-purple-800">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FFC72C]" />
                <h3 className="text-sm font-bold truncate max-w-md">
                  {selectedVideo.title || 'Trip Highlight Reel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const info = parseVideoUrl(selectedVideo.url);

                if (info.type === 'youtube' || info.type === 'vimeo') {
                  return (
                    <iframe
                      src={info.embedUrl + (info.type === 'youtube' ? '&autoplay=1' : '?autoplay=1')}
                      title={selectedVideo.title || 'Video Player'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                if (info.isDirectVideo) {
                  return (
                    <video
                      src={selectedVideo.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }

                return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                    <Film className="w-12 h-12 text-[#FFC72C]" />
                    <p className="text-sm font-bold">External Video Source</p>
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#FFC72C] text-[#2E0249] font-bold text-xs"
                    >
                      Open Video in New Tab
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Video Caption & Info Footer */}
            {selectedVideo.caption && (
              <div className="p-4 bg-[#14121C] text-xs text-neutral-300 border-t border-purple-950">
                <p>{selectedVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
