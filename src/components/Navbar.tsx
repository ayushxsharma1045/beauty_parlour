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
        <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 xl:gap-4">
            {/* Logo & Brand Identity */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden p-0.5 border-2 border-[#D4A5AC] shadow-md group-hover:border-[#541224] group-hover:shadow-lg transition-all duration-300 bg-white shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Durga Beauty Parlour Logo"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col justify-center shrink-0">
                <span className="font-serif text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#541224] leading-tight whitespace-nowrap group-hover:text-[#7A1C36] transition-colors">
                  Durga Beauty Parlour
                </span>
                <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold tracking-widest uppercase text-[#B76E79] whitespace-nowrap">
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
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-[#FCE7EC]/70 text-[#541224] transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5 text-[#541224]" />
                {totalCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#541224] text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
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
                      className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#D4A5AC]/40 hover:border-[#B76E79] bg-[#FCE7EC]/40 text-[#541224] text-xs font-medium transition-all"
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
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium border-t border-gray-100"
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
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-[#D4A5AC]/60 hover:bg-[#FCE7EC]/40 text-[#541224] text-xs font-medium transition-all shrink-0"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Book Appointment CTA Button */}
              <button
                onClick={() => onOpenBooking()}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase text-white shadow-md hover:shadow-lg transition-all maroon-gradient hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-[#F4B8C5]" />
                <span className="hidden 2xl:inline whitespace-nowrap">Book Appointment</span>
                <span className="inline 2xl:hidden whitespace-nowrap">Book Now</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="xl:hidden p-2 rounded-lg text-[#541224] hover:bg-[#FCE7EC]/50 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="xl:hidden border-t border-[#F4B8C5]/30 bg-[#FDFBF7] px-4 pt-4 pb-6 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isAnchor = link.path.startsWith('/#');
                const content = (
                  <span className="flex items-center justify-between">
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
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A3B32] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-[#FCE7EC] text-[#541224] font-semibold'
                        : 'text-[#4A3B32] hover:bg-[#F8F4EE]'
                    }`}
                  >
                    {content}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-[#F4B8C5]/20 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#F4B8C5]" />
                  <span>Book Appointment Now</span>
                </button>

                {!user && (
                  <Link
                    to="/auth"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium border border-[#B76E79] text-[#541224] hover:bg-[#FCE7EC]/40"
                  >
                    <User className="w-4 h-4" />
                    <span>Customer & Staff Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
