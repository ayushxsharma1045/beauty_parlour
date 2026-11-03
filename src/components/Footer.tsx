import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  Heart,
  Calendar
} from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  return (
    <footer className="bg-[#450E1E] text-[#FDFBF7] pt-16 pb-8 border-t-2 border-[#B76E79]/30 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B76E79]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#681E34]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#B76E79]/20">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#D4A5AC] p-0.5 shadow-md bg-white shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Durga Beauty Parlour"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide text-white">
                  Durga Beauty Parlour
                </h3>
                <p className="text-xs text-[#D4A5AC] tracking-wider uppercase font-medium">
                  Your Beauty, Our Passion.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#F8CAD5]/80 leading-relaxed font-light">
              Jaipur's premier sanctuary for women's beauty care, rejuvenating herbal & gold facials, master hair styling, and royal bridal makeovers in a hygienic and relaxing atmosphere.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com/durgabeautyparlour"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B76E79] flex items-center justify-center transition-colors text-white"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/durgabeautyparlour"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B76E79] flex items-center justify-center transition-colors text-white"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-colors text-white font-bold text-xs"
              >
                WA
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D4A5AC] tracking-wider uppercase">
              Explore Services
            </h4>
            <ul className="space-y-2 text-xs text-rose-100/80 font-light">
              <li>
                <Link to="/hair-services" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Haircuts & Designer Styling
                </Link>
              </li>
              <li>
                <Link to="/facials" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Herbal, Gold & Pearl Facials
                </Link>
              </li>
              <li>
                <Link to="/hair-services" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Deep Conditioning Hair Spa
                </Link>
              </li>
              <li>
                <Link to="/facials" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Royal Bridal Makeovers
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Skincare & Beauty Products
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-[#B76E79]">•</span> Salon Client Transformations
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D4A5AC] tracking-wider uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#B76E79]" />
              Salon Timings
            </h4>
            <ul className="space-y-2 text-xs text-rose-100/80">
              <li className="flex justify-between py-1 border-b border-white/5">
                <span>Mon, Wed – Sun:</span>
                <span className="font-medium text-white">10:00 AM – 08:00 PM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-white/5 text-amber-200">
                <span>Tuesday:</span>
                <span className="font-semibold text-rose-300">Closed (Weekly Off)</span>
              </li>
              <li className="pt-2 text-[11px] text-[#F8CAD5]/70 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F4B8C5] shrink-0" />
                <span>100% Women-Only Salon & Safe Environment</span>
              </li>
            </ul>

            <button
              onClick={onOpenBooking}
              className="mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#541224] bg-[#FCE7EC] hover:bg-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book An Appointment</span>
            </button>
          </div>

          {/* Contact Details & Map Link */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#D4A5AC] tracking-wider uppercase">
              Visit Our Salon
            </h4>
            <div className="space-y-2.5 text-xs text-rose-100/80 font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A5AC] shrink-0 mt-0.5" />
                <span>42, Rose Garden Avenue, Near City Centre, Jaipur, Rajasthan 302001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4A5AC] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4A5AC] shrink-0" />
                <a href="mailto:contact@durgabeautyparlour.com" className="hover:text-white transition-colors">
                  contact@durgabeautyparlour.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Durga+Beauty+Parlour+Jaipur"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#F4B8C5] hover:text-white underline underline-offset-4 font-medium"
              >
                <span>View location on Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Policies */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8CAD5]/60 gap-4">
          <p>© {new Date().getFullYear()} Durga Beauty Parlour. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Hygiene Guaranteed</span>
            <span>•</span>
            <span>Transparent Pricing in ₹</span>
            <Link to="/about" className="hover:text-white">Salon Policies</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-white text-[#F8CAD5]/90 font-medium underline underline-offset-2">
              Staff & Admin Portal
            </Link>
            <span>•</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('replay-welcome-intro'))}
              className="hover:text-white text-[#FFF3B0] font-medium flex items-center gap-1 cursor-pointer transition-colors"
              title="Experience Makeup Brush & Royal Welcome Animation"
            >
              <Sparkles className="w-3 h-3 text-[#FFDF00]" />
              <span>Intro Animation</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
