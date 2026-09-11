import type React from 'react';

/**
 * Universal Image Utilities for SMELTRAVELS876
 * Ensures all trip, destination, and media images load reliably with automatic fallbacks
 * and correct browser referrer policies.
 */

export const UNIVERSAL_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

export const DESTINATION_FALLBACKS: Record<string, string> = {
  panama: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
  mexico: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
  cancun: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
  antigua: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
  germany: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80',
  italy: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  milan: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80',
  'punta cana': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  dominican: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  medellin: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=80',
  colombia: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Returns a guaranteed valid image URL for any trip or destination
 */
export function getSafeTripImageUrl(imageUrl?: string | null, destinationOrCountry?: string): string {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 5) {
    // Check if it's an old known broken 404 URL and map to the active one
    if (imageUrl.includes('1512815777174')) {
      return DESTINATION_FALLBACKS.mexico;
    }
    if (imageUrl.includes('1599827552599')) {
      return DESTINATION_FALLBACKS.medellin;
    }
    return imageUrl.trim();
  }

  if (destinationOrCountry) {
    const lower = destinationOrCountry.toLowerCase();
    for (const [k, fallback] of Object.entries(DESTINATION_FALLBACKS)) {
      if (lower.includes(k)) return fallback;
    }
  }

  return UNIVERSAL_FALLBACK_IMAGE;
}

/**
 * Synthetic onError event handler for <img> elements that prevents infinite loops
 * and swaps in an appropriate fallback image.
 */
export function handleTripImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  destinationOrCountry?: string
): void {
  const target = e.currentTarget;
  if (!target.dataset.hasFailedFallback) {
    target.dataset.hasFailedFallback = 'true';
    if (destinationOrCountry) {
      const lower = destinationOrCountry.toLowerCase();
      for (const [k, fallback] of Object.entries(DESTINATION_FALLBACKS)) {
        if (lower.includes(k)) {
          target.src = fallback;
          return;
        }
      }
    }
    target.src = UNIVERSAL_FALLBACK_IMAGE;
  }
}
