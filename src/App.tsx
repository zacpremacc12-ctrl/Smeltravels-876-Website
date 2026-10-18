import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { HomePage } from './components/home/HomePage';
import { FAQSection } from './components/home/FAQSection';

// Full Pages
import { TripsPage } from './components/TripsPage';
import { TripDetailPage } from './components/TripDetailPage';
import { DestinationsPage } from './components/DestinationsPage';
import { AboutPage } from './components/AboutPage';
import { TravelGuidesPage } from './components/TravelGuidesPage';
import { LocalTripsPage } from './components/LocalTripsPage';
import { ContactPage } from './components/ContactPage';
import { LegalPolicyPage } from './components/LegalPolicyPage';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals & Floating Elements
import { BookingModal } from './components/common/BookingModal';
import { LocalTripDetailModal } from './components/common/LocalTripDetailModal';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { AuthModal } from './components/common/AuthModal';
import { ReviewSubmissionModal } from './components/common/ReviewSubmissionModal';
import { SavedTripsDrawer } from './components/common/SavedTripsDrawer';
import { CustomTripModal } from './components/common/CustomTripModal';
import { UserInquiryTrackerModal } from './components/common/UserInquiryTrackerModal';
import { WiPayCheckoutModal } from './components/common/WiPayCheckoutModal';
import { BookingConfirmationModal } from './components/common/BookingConfirmationModal';

const MainContent: React.FC = () => {
  const {
    activePage,
    pageParam,
    selectedTripForBooking,
    setSelectedTripForBooking,
    selectedLocalTripDetail,
    closeLocalTripDetail,
    isSearchOpen,
    setIsSearchOpen,
    notification,
    isWiPayCheckoutOpen,
    wiPayCheckoutPayload,
    closeWiPayCheckout,
    confirmedBookingDetails,
    closeConfirmationModal,
  } = useApp();

  const renderCurrentView = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;

      case 'trips':
        return <TripsPage initialFilterParam={pageParam} />;

      case 'trip-detail':
        return <TripDetailPage slug={pageParam || 'panama-2026'} />;

      case 'destinations':
        return <DestinationsPage initialSlug={pageParam} />;

      case 'about':
        return <AboutPage />;

      case 'local-trips':
        return <LocalTripsPage />;

      case 'guides':
        return <TravelGuidesPage initialSlug={pageParam} />;

      case 'faq':
        return (
          <div className="pt-6">
            <FAQSection />
          </div>
        );

      case 'contact':
        return <ContactPage />;

      case 'legal':
        return <LegalPolicyPage initialTab={pageParam} />;

      case 'admin':
        return <AdminDashboard />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border text-xs font-semibold max-w-sm animate-in slide-in-from-top duration-300 ${
            notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : notification.type === 'warning'
              ? 'bg-amber-800 text-white border-amber-600'
              : 'bg-[#2E0249] text-white border-purple-800'
          }`}
        >
          <div className="font-bold text-sm text-[#FFC72C]">{notification.title}</div>
          <div className="mt-0.5 text-neutral-200">{notification.message}</div>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header />

      {/* Dynamic Main Body Content */}
      <div className="flex-1">
        {renderCurrentView()}
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Booking / Inquiry Modal */}
      {selectedTripForBooking && (
        <BookingModal
          trip={selectedTripForBooking}
          onClose={() => setSelectedTripForBooking(null)}
        />
      )}

      {/* Local Trip Full Overview / Detail Modal */}
      {selectedLocalTripDetail && (
        <LocalTripDetailModal
          trip={selectedLocalTripDetail}
          onClose={closeLocalTripDetail}
        />
      )}

      {/* Quick Search Modal */}
      {isSearchOpen && (
        <QuickSearchModal onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Traveler Login & Sign Up Modal */}
      <AuthModal />

      {/* Traveler Review Submission Modal */}
      <ReviewSubmissionModal />

      {/* Bookmarked / Saved Trips Drawer */}
      <SavedTripsDrawer />

      {/* Interactive Custom Trip Creator Modal */}
      <CustomTripModal />

      {/* User Inquiry & Deposit Progress Tracker (Guest & User accessible) */}
      <UserInquiryTrackerModal />

      {/* Live WiPay Jamaica Embedded Checkout Lightbox / Overlay */}
      {isWiPayCheckoutOpen && wiPayCheckoutPayload && (
        <WiPayCheckoutModal
          payload={wiPayCheckoutPayload}
          onClose={closeWiPayCheckout}
          onSuccess={() => {
            closeWiPayCheckout();
          }}
        />
      )}

      {/* Clean Booking Confirmed Modal */}
      {confirmedBookingDetails && (
        <BookingConfirmationModal
          details={confirmedBookingDetails}
          onClose={closeConfirmationModal}
        />
      )}

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
