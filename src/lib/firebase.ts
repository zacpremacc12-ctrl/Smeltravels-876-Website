import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
  Database,
  Unsubscribe,
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyBQOFuvMkwYrDZYKf93HQ51rSMmwRUtaRI",
  authDomain: "smeltravels876-44f64.firebaseapp.com",
  databaseURL: "https://smeltravels876-44f64-default-rtdb.firebaseio.com",
  projectId: "smeltravels876-44f64",
  storageBucket: "smeltravels876-44f64.firebasestorage.app",
  messagingSenderId: "168131031051",
  appId: "1:168131031051:web:4552ef3b8ea4069fb8d70e",
  measurementId: "G-Z7KQT4P9KN"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Database = getDatabase(app, firebaseConfig.databaseURL);

export const SITE_CONTENT_PATH = 'siteContent';

// Helper to safely strip undefined values and functions for Realtime Database
function sanitizeData(val: any): any {
  if (val === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(val));
  } catch (e) {
    return val;
  }
}

/**
 * Pushes updated travel packages or any site section directly into Realtime Database at '/siteContent'
 */
export async function pushSiteContentToRTDB(sectionKey: string, data: any): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const cleanData = sanitizeData(data);

    // Save directly to /siteContent/<sectionKey>
    const sectionRef = ref(db, `${SITE_CONTENT_PATH}/${sectionKey}`);
    await set(sectionRef, cleanData);

    // Keep packages & trips mirrors in sync
    if (sectionKey === 'trips') {
      await set(ref(db, `${SITE_CONTENT_PATH}/packages`), cleanData);
    } else if (sectionKey === 'packages') {
      await set(ref(db, `${SITE_CONTENT_PATH}/trips`), cleanData);
    }

    // Also update timestamp at /siteContent/updatedAt
    await set(ref(db, `${SITE_CONTENT_PATH}/updatedAt`), timestamp);

    return true;
  } catch (err) {
    console.error(`[Firebase RTDB] Error saving ${sectionKey} to /siteContent:`, err);
    return false;
  }
}

/**
 * Pushes site payload to Realtime Database at '/siteContent' using atomic update()
 * to guarantee that other sections are NEVER overwritten or wiped out.
 */
export async function pushFullSiteContentToRTDB(payload: Record<string, any>): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const cleanPayload: Record<string, any> = { updatedAt: timestamp };

    // Deep sanitize values to prevent undefined in Realtime Database
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        cleanPayload[key] = sanitizeData(value);
      }
    }

    // Also mirror trips & packages if either is present
    if (cleanPayload.trips && !cleanPayload.packages) {
      cleanPayload.packages = cleanPayload.trips;
    } else if (cleanPayload.packages && !cleanPayload.trips) {
      cleanPayload.trips = cleanPayload.packages;
    }

    // Critical: Use update() instead of set() so that saving one section never wipes out other sections!
    const contentRef = ref(db, SITE_CONTENT_PATH);
    await update(contentRef, cleanPayload);

    return true;
  } catch (err) {
    console.error('[Firebase RTDB] Error pushing payload to /siteContent:', err);
    return false;
  }
}

/**
 * Synchronizes updates across BOTH Firebase Realtime Database and Express Backend Disk Store,
 * plus local cross-tab broadcast for instant multi-user reflection.
 */
export async function syncAllBackends(payload: Record<string, any>): Promise<boolean> {
  try {
    const cleanPayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        cleanPayload[key] = sanitizeData(value);
      }
    }
    cleanPayload.updatedAt = new Date().toISOString();

    // 1. Cross-tab BroadcastChannel for 0ms same-browser sync
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('smeltravels_live_feed');
        ch.postMessage({ type: 'LIVE_FEED_SYNC', payload: cleanPayload });
        ch.close();
      }
    } catch (e) {}

    // 2. Firebase RTDB atomic update
    const rtdbPromise = pushFullSiteContentToRTDB(cleanPayload);

    // 3. Express backend persistence & SSE broadcast to all connected devices (signed in or not)
    const serverPromise = fetch('/api/site-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload),
    }).catch((err) => {
      console.warn('[Server Sync Notice] /api/site-data unreachable:', err);
      return null;
    });

    const [rtdbOk, serverRes] = await Promise.all([rtdbPromise, serverPromise]);
    const serverOk = !!(serverRes && (serverRes as Response).ok);
    return rtdbOk || serverOk;
  } catch (err) {
    console.error('[syncAllBackends] Error syncing data:', err);
    return false;
  }
}

/**
 * Fetches site data directly from Realtime Database at '/siteContent'
 */
export async function fetchSiteContentFromRTDB(): Promise<Record<string, any> | null> {
  try {
    const contentRef = ref(db, SITE_CONTENT_PATH);
    const snap = await get(contentRef);
    if (snap.exists()) {
      return snap.val();
    }
    return null;
  } catch (err) {
    console.warn('[Firebase RTDB] Error fetching from /siteContent:', err);
    return null;
  }
}

/**
 * Subscribes to real-time live changes in Realtime Database at '/siteContent'
 */
export function subscribeToSiteContent(callback: (data: Record<string, any>) => void): Unsubscribe {
  try {
    const contentRef = ref(db, SITE_CONTENT_PATH);
    const unsubscribe = onValue(
      contentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val());
        }
      },
      (error) => {
        console.warn('[Firebase RTDB] onValue error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase RTDB] Failed to subscribe to onValue:', err);
    return () => {};
  }
}

// Aliases for compatibility
export const pushSiteContentToFirestore = pushSiteContentToRTDB;
export const pushFullSiteContentToFirestore = pushFullSiteContentToRTDB;
export const fetchSiteContentFromFirestore = fetchSiteContentFromRTDB;
export const SITE_CONTENT_COLLECTION = SITE_CONTENT_PATH;
