/**
 * Utilities for formatting, embedding, and validating video URLs (YouTube, Vimeo, MP4, etc.)
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'other';
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
  isDirectVideo: boolean;
}

/**
 * Extracts embed URL and type from video links
 */
export function parseVideoUrl(rawUrl: string): VideoInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      type: 'other',
      embedUrl: '',
      originalUrl: '',
      isDirectVideo: false,
    };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      originalUrl: trimmed,
      videoId,
      isDirectVideo: false,
    };
  }

  // 2. Vimeo formats: vimeo.com/ID
  const vimeoMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: trimmed,
      videoId,
      isDirectVideo: false,
    };
  }

  // 3. Direct video files (.mp4, .webm, .ogg, .mov)
  const isDirect = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed);
  if (isDirect) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      originalUrl: trimmed,
      isDirectVideo: true,
    };
  }

  return {
    type: 'other',
    embedUrl: trimmed,
    originalUrl: trimmed,
    isDirectVideo: false,
  };
}

/**
 * Curated high-quality video presets for demo past trip showcases
 */
export const PAST_TRIP_VIDEO_PRESETS = [
  {
    title: 'Panama Canal & City Highlights Reel',
    caption: 'Official traveler group highlights along the Miraflores Locks & Amador Causeway.',
    url: 'https://www.youtube.com/watch?v=1la4iSRIEz8',
  },
  {
    title: 'Caribbean Island & Catamaran Group Sailing',
    caption: 'Full day snorkeling, music, and beach feast with our Jamaica travel family.',
    url: 'https://www.youtube.com/watch?v=kYI9F2J_oQI',
  },
  {
    title: 'Historic Casco Viejo & Sunset Rooftop Dinner',
    caption: 'Evening celebration with traditional live music and authentic cuisine.',
    url: 'https://www.youtube.com/watch?v=rN9CN_8dKRo',
  },
];

/**
 * Curated high-quality photo presets for past trips
 */
export const PAST_TRIP_PHOTO_PRESETS = [
  {
    title: 'Group Welcome Toast',
    caption: 'First evening welcome celebration with the travel squad.',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Panama Canal Miraflores Locks',
    caption: 'Witnessing the world-famous mega cargo ships crossing the canal.',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Tropical Catamaran & San Blas Excursion',
    caption: 'Clear crystal turquoise waters and private island lunch.',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Casco Viejo Colonial Stroll',
    caption: 'Exploring colorful colonial streets, cafes, and rooftop views.',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Farewell Gala Dinner',
    caption: 'Dressed in our best for the final group celebration banquet.',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Duty Free Shopping Spree',
    caption: 'Unbeatable duty-free shopping deals at Albrook Mall & Colon Free Zone.',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
  },
];
