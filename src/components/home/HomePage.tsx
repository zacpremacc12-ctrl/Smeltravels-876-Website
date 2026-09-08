import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  fetchSiteContentFromFirestore,
  subscribeToSiteContent,
  db,
  SITE_CONTENT_COLLECTION,
} from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// Homepage Sections
import { HeroSection } from './HeroSection';
import { FeaturedTripsSection } from './FeaturedTripsSection';
import { GroupTrips2027Section } from './GroupTrips2027Section';
import { WhyChooseSection } from './WhyChooseSection';
import { PopularDestinationsSection } from './PopularDestinationsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { OffersSection } from './OffersSection';
import { BlogPreviewSection } from './BlogPreviewSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { BookingCTASection } from './BookingCTASection';

export const HomePage: React.FC = () => {
  const { applyFirestoreContent } = useApp();
  const [isLiveLoaded, setIsLiveLoaded] = useState(false);

  // When the customer homepage loads, fetch data directly from the 'siteContent' Firestore collection
  useEffect(() => {
    let isMounted = true;

    async function loadCustomerHomepageContent() {
      try {
        console.log("[Customer Homepage] Fetching data directly from Firestore 'siteContent' collection...");

        // 1. Fetch unified 'main' document from 'siteContent'
        const mainDocRef = doc(db, SITE_CONTENT_COLLECTION, 'main');
        const mainSnap = await getDoc(mainDocRef);

        if (mainSnap.exists()) {
          const data = mainSnap.data();
          if (isMounted) {
            applyFirestoreContent(data);
            setIsLiveLoaded(true);
          }
        }

        // 2. Fetch specific 'packages' document from 'siteContent' for updated travel packages
        const packagesDocRef = doc(db, SITE_CONTENT_COLLECTION, 'packages');
        const packagesSnap = await getDoc(packagesDocRef);
        if (packagesSnap.exists()) {
          const pkgData = packagesSnap.data();
          if (isMounted && (pkgData.trips || pkgData.packages)) {
            applyFirestoreContent({ trips: pkgData.trips || pkgData.packages });
            setIsLiveLoaded(true);
          }
        }

        // 3. Fallback: query entire 'siteContent' collection
        const colRef = collection(db, SITE_CONTENT_COLLECTION);
        const colSnap = await getDocs(colRef);
        if (!colSnap.empty && isMounted) {
          const merged: Record<string, any> = {};
          colSnap.forEach((d) => {
            Object.assign(merged, d.data());
          });
          applyFirestoreContent(merged);
          setIsLiveLoaded(true);
        }
      } catch (err) {
        console.warn("[Customer Homepage] Firestore fetch notice:", err);
      }
    }

    loadCustomerHomepageContent();

    // Subscribe to real-time live changes from Firestore 'siteContent'
    // so any changes an admin makes dynamically update the screen for the customer
    const unsubscribe = subscribeToSiteContent((realtimeData) => {
      if (isMounted && realtimeData) {
        console.log("[Customer Homepage] Real-time Firestore update received from 'siteContent':", realtimeData);
        applyFirestoreContent(realtimeData);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [applyFirestoreContent]);

  return (
    <main className="relative">
      <HeroSection />
      <FeaturedTripsSection />
      <GroupTrips2027Section />
      <WhyChooseSection />
      <PopularDestinationsSection />
      <HowItWorksSection />
      <OffersSection />
      <BlogPreviewSection />
      <TestimonialsSection />
      <FAQSection />
      <BookingCTASection />
    </main>
  );
};
