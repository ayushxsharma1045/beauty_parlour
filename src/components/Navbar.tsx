import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Calendar,
  Sparkles,
  Phone,
  LogOut,
  LayoutDashboard,
  Clock,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenBooking: (serviceId?: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin, isStaff } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Hair Services', shortName: 'Hair', path: '/hair-services' },
    { name: 'Facials & Skincare', shortName: 'Facials', path: '/facials' },
    { name: 'Weddings & Festive', shortName: 'Bridal', path: '/weddings-festive' },
    { name: 'Makeover Reels', shortName: 'Reels', path: '/#makeover-reels', badge: 'Reels' },
    { name: 'Beauty Products', shortName: 'Products', path: '/products' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', shortName: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-[#541224] text-[#FCE7EC] text-xs py-2 px-4 border-b border-[#B76E79]/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wide">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B8C5]" />
              Festive Glow Offer: 20% OFF First Visit with code <strong>WELCOME20</strong>
            </span>
            <span className="flex items-center gap-1.5 text-rose-300/80">
              <Clock className="w-3.5 h-3.5" />
              Open 10:00 AM – 8:00 PM (Closed Tuesdays)
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F4B8C5]" />
              <span>+91 98765 43210</span>
            </a>
            <span className="text-[#B76E79]/60">|</span>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 text-[#F4B8C5]"
            >
              WhatsApp Us
            </a>
            <span className="text-[#B76E79]/60">|</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('replay-welcome-intro'))}
              className="hover:text-white transition-colors flex items-center gap-1 text-[#FFF3B0] font-medium cursor-pointer"
              title="Experience Makeup Brush & Royal Welcome Animation"
            >
              <Sparkles className="w-3 h-3 text-[#FFDF00] animate-pulse" />
              <span className="hidden sm:inline">Intro Animation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-panel shadow-md py-2.5'
            : 'bg-[#FDFBF7]/95 backdrop-blur-md py-3.5 border-b border-[#F4B8C5]/30'
        }`}
      >
        <div className="w-full max-w-[1540px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 xl:gap-4">
            {/* Logo & Brand Identity */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0" aria-label="Durga Beauty Parlour Home">
              <div className="relative w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden p-0.5 border-2 border-[#D4A5AC] shadow-md group-hover:border-[#541224] group-hover:shadow-lg transition-all duration-300 bg-white shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Durga Beauty Parlour Logo"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-[#541224]');
                      target.parentElement.innerHTML = '<span class="text-white font-serif font-bold text-xs sm:text-sm">DBP</span>';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-serif text-[15px] min-[380px]:text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-[#541224] leading-tight truncate sm:whitespace-nowrap group-hover:text-[#7A1C36] transition-colors">
                  Durga Beauty Parlour
                </span>
                <span className="hidden min-[480px]:block text-[8px] sm:text-[10px] lg:text-xs font-semibold tracking-widest uppercase text-[#B76E79] whitespace-nowrap">
                  Your Beauty, Our Passion.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-4 shrink-0">
              {navLinks.map((link) => {
                const isAnchor = link.path.startsWith('/#');
                const content = (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <span className="hidden 2xl:inline">{link.name}</span>
                    <span className="inline 2xl:hidden">{('shortName' in link && (link as any).shortName) || link.name}</span>
                    {'badge' in link && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#541224] text-white">
                        {(link as any).badge}
                      </span>
                    )}
                  </span>
                );

                if (isAnchor) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) => {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          const el = document.getElementById(link.path.replace('/#', ''));
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-1.5 py-1 text-xs 2xl:text-sm font-medium tracking-normal 2xl:tracking-wide text-[#4A3B32] hover:text-[#B76E79] transition-colors relative cursor-pointer whitespace-nowrap"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-1.5 py-1 text-xs 2xl:text-sm font-medium tracking-normal 2xl:tracking-wide transition-colors relative whitespace-nowrap ${
                      isActive(link.path)
                        ? 'text-[#541224] font-semibold'
                        : 'text-[#4A3B32] hover:text-[#B76E79]'
                    }`}
                  >
                    {content}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B76E79] rounded-full animate-in fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full hover:bg-[#FCE7EC]/70 text-[#541224] transition-colors cursor-pointer shrink-0"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 text-[#541224]" />
                {totalCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#541224] text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center animate-pulse">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-full border border-[#D4A5AC]/40 hover:border-[#B76E79] bg-[#FCE7EC]/40 text-[#541224] text-xs font-medium transition-all cursor-pointer"
                      title={user.name}
                    >
                      <User className="w-4 h-4 text-[#B76E79]" />
                      <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    </button>

                    {userDropdown && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#D4A5AC]/30 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-semibold bg-[#FCE7EC] text-[#541224]">
                            {user.role}
                          </span>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-[#541224] hover:bg-[#FCE7EC]/50 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#B76E79]" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/portal"
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-[#FCE7EC]/50 font-medium"
                        >
                          <Calendar className="w-4 h-4 text-[#B76E79]" />
                          My Appointments
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdown(false);
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium border-t border-gray-100 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full border border-[#D4A5AC]/60 hover:bg-[#FCE7EC]/40 text-[#541224] text-xs font-medium transition-all shrink-0 cursor-pointer"
                    title="Sign In"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Book Appointment CTA Button (Tablet & Desktop) */}
              <button
                onClick={() => onOpenBooking()}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase text-white shadow-md hover:shadow-lg transition-all maroon-gradient hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-[#F4B8C5]" />
                <span className="hidden 2xl:inline whitespace-nowrap">Book Appointment</span>
                <span className="inline 2xl:hidden whitespace-nowrap">Book Now</span>
              </button>

              {/* Mobile Menu Toggle Button (Prominent, High Contrast, Always Visible) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="xl:hidden p-2 rounded-xl bg-[#FCE7EC] text-[#541224] border border-[#D4A5AC]/50 hover:bg-[#F8CAD5] transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
                aria-label="Toggle navigation menu"
                title={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="xl:hidden border-t border-[#F4B8C5]/30 bg-[#FDFBF7] px-4 pt-4 pb-6 shadow-2xl animate-in fade-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
            {/* Branded Mobile Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#F4B8C5]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4A5AC] p-0.5 bg-white shrink-0 shadow-xs">
                  <img
                    src="/images/logo.jpg"
                    alt="Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-[#541224] block leading-tight">
                    Durga Beauty Parlour
                  </span>
                  <span className="text-[9px] text-[#B76E79] font-medium tracking-wider uppercase block">
                    Your Beauty, Our Passion.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FCE7EC] text-[#541224] border border-[#D4A5AC]/40">
                Jaipur Salon
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isAnchor = link.path.startsWith('/#');
                const content = (
                  <span className="flex items-center justify-between w-full">
                    <span>{link.name}</span>
                    {'badge' in link && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#541224] text-white">
                        {(link as any).badge}
                      </span>
                    )}
                  </span>
                );

                if (isAnchor) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) => {
                        setIsOpen(false);
                        if (location.pathname === '/') {
                          e.preventDefault();
                          const el = document.getElementById(link.path.replace('/#', ''));
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A3B32] hover:bg-[#F8F4EE] transition-colors cursor-pointer flex items-center"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center ${
                      isActive(link.path)
                        ? 'bg-[#FCE7EC] text-[#541224] font-semibold'
                        : 'text-[#4A3B32] hover:bg-[#F8F4EE]'
                    }`}
                  >
                    {content}
                  </Link>
                );
              })}

              {/* Action Buttons in Mobile Drawer */}
              <div className="pt-3 mt-2 border-t border-[#F4B8C5]/30 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md cursor-pointer hover:opacity-95"
                >
                  <Calendar className="w-4 h-4 text-[#F4B8C5]" />
                  <span>Book Appointment Now</span>
                </button>

                {user ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 rounded-2xl bg-white border border-[#D4A5AC]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900 block truncate">{user.name}</span>
                        <span className="text-gray-500 text-[10px] block truncate">{user.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#FCE7EC] text-[#541224]">
                        {user.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#541224] text-white text-xs font-semibold"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#F4B8C5]" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                      <Link
                        to="/portal"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 ${
                          !isAdmin ? 'col-span-2' : ''
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#B76E79]" />
                        <span>My Bookings</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-red-600 text-xs font-semibold hover:bg-red-50 rounded-xl cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium border border-[#B76E79] text-[#541224] hover:bg-[#FCE7EC]/40"
                  >
                    <User className="w-4 h-4" />
                    <span>Customer & Staff Login</span>
                  </Link>
                )}

                {/* Direct Phone & WhatsApp Access for Mobile Users */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#541224]" />
                    <span>Call Salon</span>
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200/60"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
