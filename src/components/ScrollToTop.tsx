import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

/**
 * ScrollToTop Component:
 * 1. Automatically resets scroll position to the top (0, 0) whenever the route/pathname changes.
 * 2. If navigating to a specific hash (e.g. /#makeover-reels), smoothly scrolls to that element.
 * 3. Provides a floating luxury "Back to Top" button when user scrolls down any page.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 1. AUTOMATIC SCROLL TO TOP ON ROUTE CHANGE
  useEffect(() => {
    // If a hash anchor is provided (e.g. #makeover-reels), scroll to target section
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId) || document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return;
      }
    }

    // Temporarily set scrollBehavior to 'auto' to override CSS smooth-scroll,
    // ensuring the new page opens instantly at the top without slow creeping.
    const originalStyle = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Restore smooth scroll behavior for in-page link navigation
    const timer = setTimeout(() => {
      document.documentElement.style.scrollBehavior = originalStyle;
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  // 2. SHOW / HIDE FLOATING BACK-TO-TOP BUTTON ON SCROLL
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleManualScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {showBackToTop && (
        <button
          onClick={handleManualScrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border border-[#B76E79]/50 group"
          style={{
            background: 'linear-gradient(135deg, #541224 0%, #681E34 60%, #450E1E 100%)',
          }}
          aria-label="Scroll back to top of page"
          title="Back to Top"
        >
          <ChevronUp className="w-5 h-5 text-[#F8CAD5] group-hover:text-white transition-colors animate-pulse" />
        </button>
      )}
    </>
  );
};
