import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { SkinConsultationModal } from './components/SkinConsultationModal';
import { CartDrawer } from './components/CartDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { HairServicesPage } from './pages/HairServicesPage';
import { FacialSkincarePage } from './pages/FacialSkincarePage';
import { ProductsPage } from './pages/ProductsPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { WeddingsFestivePage } from './pages/WeddingsFestivePage';
import { WelcomeIntroAnimation } from './components/WelcomeIntroAnimation';

export function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const handleOpenBooking = (serviceId?: number) => {
    setBookingServiceId(serviceId || null);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setBookingServiceId(null);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col justify-between bg-[#FDFBF7] text-[#2C1810]">
              {/* Grand Welcome Entrance Intro Animation */}
              <WelcomeIntroAnimation />

              {/* Sticky Luxury Navbar */}
              <Navbar onOpenBooking={handleOpenBooking} />

              {/* Main App Content View */}
              <main className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        onOpenBooking={handleOpenBooking}
                        onOpenConsultation={() => setIsConsultationOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/hair-services"
                    element={<HairServicesPage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route
                    path="/facials"
                    element={
                      <FacialSkincarePage
                        onOpenBooking={handleOpenBooking}
                        onOpenConsultation={() => setIsConsultationOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/weddings-festive"
                    element={<WeddingsFestivePage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route
                    path="/gallery"
                    element={<GalleryPage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route
                    element={<AboutPage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route
                    path="/contact"
                    element={<ContactPage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    path="/portal"
                    element={<CustomerPortalPage onOpenBooking={handleOpenBooking} />}
                  />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer onOpenBooking={handleOpenBooking} />

              {/* Global Modals & Drawers */}
              <BookingModal
                isOpen={isBookingOpen}
                onClose={handleCloseBooking}
                initialServiceId={bookingServiceId}
              />

              <SkinConsultationModal
                isOpen={isConsultationOpen}
                onClose={() => setIsConsultationOpen(false)}
              />

              <CartDrawer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
