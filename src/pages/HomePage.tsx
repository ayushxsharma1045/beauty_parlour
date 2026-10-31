import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Heart,
  Star,
  Users,
  Award,
  Smile,
  Tag,
  Scissors,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Service, Promotion, Review } from '../types';
import { MakeoverReelsSection } from '../components/MakeoverReelsSection';

interface HomePageProps {
  onOpenBooking: (serviceId?: number) => void;
  onOpenConsultation: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBooking, onOpenConsultation }) => {
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Fetch popular services
    fetch('/api/services')
      .then((res) => res.json())
      .then((data: Service[]) => {
        // Filter or select the 8 required popular services
        const selected = data.filter((s) => s.is_popular === 1).slice(0, 8);
        setPopularServices(selected.length ? selected : data.slice(0, 8));
      })
      .catch((err) => console.error(err));

    // Fetch promotions
    fetch('/api/promotions')
      .then((res) => res.json())
      .then((data) => setPromotions(data))
      .catch((err) => console.error(err));

    // Fetch reviews
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));
  }, []);

  const whyChooseUsPoints = [
    {
      title: 'Experienced Beauty Professionals',
      desc: 'Our certified aestheticians and stylists bring years of refined artistry and gentle precision to every service.',
      icon: Users,
    },
    {
      title: 'Personalized Consultations',
      desc: 'We examine your individual hair texture, facial contours, and skin hydration before tailoring every treatment.',
      icon: Sparkles,
    },
    {
      title: 'Hygienic Salon Environment',
      desc: 'Medical-grade UV tool sterilization, fresh single-use disposables, and pristine salon suites for your complete peace of mind.',
      icon: ShieldCheck,
    },
    {
      title: 'Quality Skincare & Haircare',
      desc: 'We use genuine botanical extracts, dermatologically tested hypoallergenic creams, and premium salon formulations.',
      icon: Award,
    },
    {
      title: 'Affordable & Transparent Pricing',
      desc: 'Clear upfront pricing in Indian Rupees (₹) with zero hidden fees or unrequested add-ons.',
      icon: Tag,
    },
    {
      title: 'Friendly & Welcoming Care',
      desc: 'A tranquil, all-women sanctuary designed to help you relax, recharge, and leave feeling confident.',
      icon: Smile,
    },
  ];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Background Salon Hero Image with subtle zoom */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-banner.jpg"
            alt="Durga Beauty Parlour Interior"
            className="w-full h-full object-cover scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#450E1E]/95 via-[#541224]/85 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,184,197,0.25)_0%,transparent_60%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="max-w-2xl text-white space-y-6">
            {/* Promotional Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#F4B8C5]/40 backdrop-blur-md text-xs font-semibold tracking-widest uppercase text-[#F8CAD5]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B8C5]" />
              <span>Your Beauty, Your Confidence</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              Discover Your Beauty at <span className="text-[#F4B8C5] italic">Durga Beauty Parlour.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#FCE7EC]/90 font-light leading-relaxed max-w-xl">
              Expert hair styling, rejuvenating facials, skincare, and bridal beauty services designed just for you. Relax in an atmosphere of warmth, luxury, and unmatched hygiene.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenBooking()}
                className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#541224] bg-[#FCE7EC] hover:bg-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#541224]" />
                <span>Book an Appointment</span>
              </button>

              <Link
                to="/hair-services"
                className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-white border-2 border-[#D4A5AC]/60 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <span>Explore Our Services</span>
                <ArrowRight className="w-4 h-4 text-[#F4B8C5]" />
              </Link>
            </div>

            {/* Quick Trust Highlights */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4B8C5] shrink-0" />
                <span className="text-rose-100 font-light">100% Women-Only Salon</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4B8C5] shrink-0" />
                <span className="text-rose-100 font-light">Sterilized Instruments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F4B8C5] shrink-0" />
                <span className="text-rose-100 font-light">Transparent Pricing (₹)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
            Exquisite Salon Offerings
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#541224]">
            Popular Beauty Services
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Indulge in our most loved hair cuts, revitalizing facials, herbal treatments, and bridal artistry crafted to elevate your natural charm.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#D4A5AC]/30 hover:border-[#B76E79] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#F4B8C5]" />
                  {service.duration_mins} mins
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#541224] group-hover:text-[#B76E79] transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                      Starting Price
                    </span>
                    <span className="font-serif text-lg font-bold text-[#541224]">
                      ₹{service.price}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-sm hover:shadow hover:scale-105 transition-all cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/hair-services"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#541224] hover:text-[#B76E79] border-b-2 border-[#541224] pb-1 hover:border-[#B76E79] transition-colors"
          >
            <span>View Full Services & Pricing Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 2B. SHORT VIDEO MAKEOVER REELS SECTION (BEFORE & AFTER TRANSFORMATION SHOWCASE) */}
      <MakeoverReelsSection onOpenBooking={onOpenBooking} />

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="bg-[#F8F4EE] py-20 border-y border-[#D4A5AC]/25 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
              The Durga Difference
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#541224]">
              Why Choose Durga Beauty Parlour?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              We believe that every woman deserves an extraordinary salon experience characterized by warmth, uncompromised safety, and genuine care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUsPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-7 rounded-3xl border border-[#D4A5AC]/30 shadow-xs hover:shadow-md transition-all duration-300 space-y-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FCE7EC] text-[#541224] flex items-center justify-center group-hover:bg-[#541224] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#541224]">
                    {point.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-light">
                    {point.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SPECIAL OFFERS SECTION (EDITABLE THROUGH ADMIN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
            Limited Time Privileges
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#541224]">
            Exclusive Packages & Special Offers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Enjoy specially designed pampering packages with attractive savings for new guests, festive celebrations, and brides-to-be.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="relative p-6 rounded-3xl bg-gradient-to-b from-[#FDF2F4] to-white border-2 border-[#D4A5AC]/40 hover:border-[#B76E79] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#541224] text-[#FCE7EC]">
                  {promo.discount_text}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#541224] pt-1">
                  {promo.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  {promo.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4A5AC]/30 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Promo Code</span>
                  <span className="font-mono font-bold text-xs text-[#541224] bg-[#F8F4EE] px-2 py-0.5 rounded border border-dashed border-[#B76E79]/50">
                    {promo.code}
                  </span>
                </div>

                <button
                  onClick={() => onOpenBooking()}
                  className="text-xs font-bold text-[#541224] hover:text-[#B76E79] flex items-center gap-1 cursor-pointer"
                >
                  <span>Claim</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SKIN CONSULTATION CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 maroon-gradient text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-[#F8CAD5]">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B8C5]" />
              Complimentary Skin Analysis
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Unsure which facial suits your skin type?
            </h2>
            <p className="text-xs sm:text-sm text-[#FCE7EC]/90 leading-relaxed font-light">
              Schedule a personalized, zero-obligation consultation with our senior aesthetician. We will assess your skin’s hydration, texture, and sensitivity before recommending the ideal herbal or hydration treatment.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={onOpenConsultation}
                className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#541224] bg-[#FCE7EC] hover:bg-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#541224]" />
                <span>Request Skin Consultation</span>
              </button>
              <Link
                to="/facials"
                className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-[#D4A5AC] hover:bg-white/10 transition-all"
              >
                Browse Facial Menu
              </Link>
            </div>
          </div>

          <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden border-2 border-[#D4A5AC]/40 shadow-xl z-10 shrink-0">
            <img
              src="/images/facial-hero.jpg"
              alt="Facial Skincare Consultation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
            Client Stories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#541224]">
            Loved by Our Guests
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Read authentic feedback from women who trust Durga Beauty Parlour for their everyday styling and most cherished life milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-[#D4A5AC]/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Star Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-gray-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h4 className="font-serif text-sm font-bold text-[#541224]">
                  {rev.customer_name}
                </h4>
                <span className="text-[11px] text-[#B76E79] font-medium block">
                  {rev.service_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
