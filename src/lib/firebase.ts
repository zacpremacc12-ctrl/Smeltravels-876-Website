import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';

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
export const db: Firestore = getFirestore(app);

export const SITE_CONTENT_COLLECTION = 'siteContent';

/**
 * Pushes updated travel packages or any site section directly into Firestore 'siteContent' collection
 */
export async function pushSiteContentToFirestore(sectionKey: string, data: any): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    // 1. Save directly to specific section document in 'siteContent' (e.g. 'siteContent/packages', 'siteContent/settings')
    const sectionDocRef = doc(db, SITE_CONTENT_COLLECTION, sectionKey);
    await setDoc(sectionDocRef, {
      [sectionKey]: data,
      updatedAt: timestamp,
    }, { merge: true });

    // 2. Also save to the unified 'siteContent/main' document for fast complete page loading
    const mainDocRef = doc(db, SITE_CONTENT_COLLECTION, 'main');
    await setDoc(mainDocRef, {
      [sectionKey]: data,
      updatedAt: timestamp,
    }, { merge: true });

    return true;
  } catch (err) {
    console.error(`[Firebase Firestore] Error saving ${sectionKey} to siteContent:`, err);
    return false;
  }
}

/**
 * Pushes full site payload to Firestore 'siteContent' collection
 */
export async function pushFullSiteContentToFirestore(payload: Record<string, any>): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const cleanPayload: Record<string, any> = { updatedAt: timestamp };

    // Sanitize values to prevent undefined in Firestore
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        cleanPayload[key] = value;
      }
    }

    const mainDocRef = doc(db, SITE_CONTENT_COLLECTION, 'main');
    await setDoc(mainDocRef, cleanPayload, { merge: true });

    // Also push individual sections if present
    if (cleanPayload.trips) {
      await setDoc(doc(db, SITE_CONTENT_COLLECTION, 'packages'), {
        trips: cleanPayload.trips,
        updatedAt: timestamp,
      }, { merge: true });
    }
    if (cleanPayload.settings) {
      await setDoc(doc(db, SITE_CONTENT_COLLECTION, 'settings'), {
        settings: cleanPayload.settings,
        updatedAt: timestamp,
      }, { merge: true });
    }

    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error pushing full payload to siteContent:', err);
    return false;
  }
}

/**
 * Fetches site data directly from Firestore 'siteContent' collection
 */
export async function fetchSiteContentFromFirestore(): Promise<Record<string, any> | null> {
  try {
    // First try the unified 'main' document
    const mainDocRef = doc(db, SITE_CONTENT_COLLECTION, 'main');
    const snap = await getDoc(mainDocRef);

    if (snap.exists()) {
      return snap.data();
    }

    // Fallback: check all documents in 'siteContent' collection
    const colRef = collection(db, SITE_CONTENT_COLLECTION);
    const colSnap = await getDocs(colRef);
    if (!colSnap.empty) {
      const merged: Record<string, any> = {};
      colSnap.forEach(docSnap => {
        const d = docSnap.data();
        Object.assign(merged, d);
      });
      return merged;
    }

    return null;
  } catch (err) {
    console.warn('[Firebase Firestore] Error fetching from siteContent:', err);
    return null;
  }
}

/**
 * Subscribes to real-time live changes in Firestore 'siteContent' collection
 */
export function subscribeToSiteContent(callback: (data: Record<string, any>) => void): () => void {
  try {
    const mainDocRef = doc(db, SITE_CONTENT_COLLECTION, 'main');
    const unsubscribe = onSnapshot(
      mainDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      },
      (error) => {
        console.warn('[Firebase Firestore] onSnapshot error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase Firestore] Failed to subscribe to onSnapshot:', err);
    return () => {};
  }
}
