import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
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

    // Also update timestamp at /siteContent/updatedAt
    await set(ref(db, `${SITE_CONTENT_PATH}/updatedAt`), timestamp);

    return true;
  } catch (err) {
    console.error(`[Firebase RTDB] Error saving ${sectionKey} to /siteContent:`, err);
    return false;
  }
}

/**
 * Pushes full site payload to Realtime Database at '/siteContent'
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

    // Save to /siteContent
    const contentRef = ref(db, SITE_CONTENT_PATH);
    await set(contentRef, cleanPayload);

    return true;
  } catch (err) {
    console.error('[Firebase RTDB] Error pushing full payload to /siteContent:', err);
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
