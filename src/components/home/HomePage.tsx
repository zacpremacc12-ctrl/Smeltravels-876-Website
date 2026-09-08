import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  fetchSiteContentFromRTDB,
  subscribeToSiteContent,
  db,
  SITE_CONTENT_PATH,
} from '../../lib/firebase';
import { ref, get, onValue } from 'firebase/database';

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

  // When the customer homepage loads, fetch and subscribe directly from Realtime Database at '/siteContent'
  useEffect(() => {
    let isMounted = true;

    async function loadCustomerHomepageContent() {
      try {
        console.log("[Customer Homepage] Reading from Firebase Realtime Database at '/siteContent'...");

        // 1. Fetch initial snapshot from /siteContent using get()
        const contentRef = ref(db, SITE_CONTENT_PATH);
        const snapshot = await get(contentRef);

        if (snapshot.exists() && isMounted) {
          const data = snapshot.val();
          applyFirestoreContent(data);
          setIsLiveLoaded(true);
        }
      } catch (err) {
        console.warn("[Customer Homepage] RTDB initial fetch notice:", err);
      }
    }

    loadCustomerHomepageContent();

    // 2. Subscribe to real-time live changes from RTDB path '/siteContent' using onValue
    const contentRef = ref(db, SITE_CONTENT_PATH);
    const unsubscribe = onValue(
      contentRef,
      (snapshot) => {
        if (snapshot.exists() && isMounted) {
          const liveData = snapshot.val();
          console.log("[Customer Homepage] Realtime Database update received from '/siteContent':", liveData);
          applyFirestoreContent(liveData);
          setIsLiveLoaded(true);
        }
      },
      (error) => {
        console.warn("[Customer Homepage] RTDB onValue listener error:", error);
      }
    );

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
