import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Crown,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Flower2,
  Gem,
  Award,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Service } from '../types';
import { useToast } from '../context/ToastContext';

interface WeddingsFestivePageProps {
  onOpenBooking: (serviceId?: number) => void;
}

export const WeddingsFestivePage: React.FC<WeddingsFestivePageProps> = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState<'bridal' | 'festive'>('bridal');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Consultation form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event_date: '',
    occasion: 'Royal Indian Bridal',
    guest_count: '1',
    venue: 'In-Salon VIP Suite',
    concerns: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data: Service[]) => {
        // Filter bridal and festive services
        const packages = data.filter(
          (s) => s.category === 'bridal' || s.category === 'festive'
        );
        setServices(packages);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const bridalPackages = services.filter((s) => s.category === 'bridal');
  const festivePackages = services.filter((s) => s.category === 'festive');

  const displayedPackages = activeTab === 'bridal' ? bridalPackages : festivePackages;

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Please enter your name and phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          skin_type: `${formData.occasion} (${formData.guest_count} persons, ${formData.venue})`,
          concerns: `Event Date: ${formData.event_date || 'TBD'}. Details: ${formData.concerns || 'Bespoke Package Inquiry'}`,
          preferred_contact: 'whatsapp'
        })
      });

      if (response.ok) {
        showToast('Bridal consultation request received! Our bridal coordinator will call you shortly.', 'success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          event_date: '',
          occasion: 'Royal Indian Bridal',
          guest_count: '1',
          venue: 'In-Salon VIP Suite',
          concerns: ''
        });
      } else {
        showToast('Failed to submit consultation. Please WhatsApp us directly.', 'error');
      }
    } catch {
      showToast('Network error. Please WhatsApp us directly.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Royal Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center bg-[#541224] text-white overflow-hidden py-20 px-4">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url('/images/festive-hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#541224] via-[#541224]/85 to-[#380b18]" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Crown className="w-3.5 h-3.5 text-[#F4B8C5]" />
            Royal Wedding & Festive Artistry
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Weddings & Celebrations
          </h1>

          <p className="text-sm sm:text-base text-[#FCE7EC]/90 max-w-2xl mx-auto font-light leading-relaxed">
            From regal wedding ceremonies and Mehendi nights to Karwa Chauth, Diwali, and Navratri, Durga Beauty Parlour crafts timeless, sweat-proof elegance tailored for your most cherished moments.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-3xl mx-auto text-center">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block font-serif text-2xl font-bold text-[#F4B8C5]">500+</span>
              <span className="text-[11px] text-[#FCE7EC]/80 uppercase tracking-wider">Royal Brides</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block font-serif text-2xl font-bold text-[#F4B8C5]">16-Hour</span>
              <span className="text-[11px] text-[#FCE7EC]/80 uppercase tracking-wider">Sweat-Proof HD</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block font-serif text-2xl font-bold text-[#F4B8C5]">VIP Suite</span>
              <span className="text-[11px] text-[#FCE7EC]/80 uppercase tracking-wider">Private Dressing</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="block font-serif text-2xl font-bold text-[#F4B8C5]">Free Draping</span>
              <span className="text-[11px] text-[#FCE7EC]/80 uppercase tracking-wider">Saree & Dupatta</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('bridal')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer ${
              activeTab === 'bridal'
                ? 'bg-[#541224] text-white shadow-lg ring-2 ring-[#B76E79]/50 scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
            }`}
          >
            <Crown className="w-4 h-4 text-[#B76E79]" />
            <span>Bridal & Wedding Makeovers</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold ml-1">
              {bridalPackages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('festive')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-sm cursor-pointer ${
              activeTab === 'festive'
                ? 'bg-[#541224] text-white shadow-lg ring-2 ring-[#B76E79]/50 scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#B76E79]" />
            <span>Festival Celebration Packages</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold ml-1">
              {festivePackages.length}
            </span>
          </button>
        </div>

        {/* Tab Description Banner */}
        <div className="p-6 rounded-3xl bg-[#FDF2F4] border border-[#D4A5AC]/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B76E79]">
              {activeTab === 'bridal' ? 'Your Special Day • Lifetime Memories' : 'Festivals of India • Radiant Glow'}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#541224]">
              {activeTab === 'bridal'
                ? 'Bespoke Wedding & Pre-Bridal Packages'
                : 'Karwa Chauth, Diwali, Navratri & Eid Festive Glam'}
            </h3>
            <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
              {activeTab === 'bridal'
                ? 'Every bride is a royal story. Our bridal packages include HD/Airbrush base, hair artistry with fresh jasmine flowers, jewelry setting, dupatta pinning, and complimentary touch-up kits.'
                : 'Celebrate traditions with glowing skin, intricate henna art, sweat-proof party makeup, and dazzling hair updos curated for Indian festivals.'}
            </p>
          </div>

          <a
            href="https://wa.me/919876543210?text=Hello%20Durga%20Beauty%20Parlour!%20I%20would%20like%20to%20inquire%20about%20your%20Wedding%20and%20Festive%20packages."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Direct WhatsApp Inquiry</span>
          </a>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-gray-500">
            Loading wedding & festive packages...
          </div>
        ) : displayedPackages.length === 0 ? (
          <div className="text-center py-16 text-xs text-gray-500">
            No packages available in this category currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#D4A5AC]/40 hover:border-[#B76E79] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo Banner */}
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#541224]/90 text-white backdrop-blur-xs">
                      {pkg.category === 'bridal' ? 'Wedding Ritual' : 'Festive Special'}
                    </span>
                    {pkg.is_popular === 1 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E8C5CA] text-[#541224] flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-[#541224]" />
                        Top Choice
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#F4B8C5]" />
                    <span>Duration: {pkg.duration_mins} mins</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-bold text-[#541224] group-hover:text-[#B76E79] transition-colors leading-snug">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Standard Wedding / Festive Perks */}
                    <div className="pt-2 space-y-1.5 text-[11px] text-gray-700">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B76E79] shrink-0" />
                        <span>Includes Professional Saree / Dupatta Draping</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B76E79] shrink-0" />
                        <span>High-Definition Waterproof 16-Hour Longevity</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B76E79] shrink-0" />
                        <span>Complimentary False Lashes & Hair Accessories Setting</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                        Complete Package Rate
                      </span>
                      <span className="font-serif text-2xl font-bold text-[#541224]">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenBooking(pkg.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bespoke Bridal & Festive Consultation Booking Form */}
        <section className="mt-16 bg-white rounded-3xl p-8 sm:p-12 border border-[#D4A5AC]/40 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#FDF2F4] pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7EC] text-[11px] font-bold uppercase tracking-wider text-[#541224]">
                <Flower2 className="w-3.5 h-3.5 text-[#B76E79]" />
                Bespoke Event Consultation
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#541224] leading-snug">
                Planning a Wedding or Grand Celebration?
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                Leave your event details below. Our senior bridal consultant will curate a tailored schedule, group discounts for family & bridesmaids, and confirm artist availability.
              </p>

              <div className="pt-4 space-y-3">
                <div className="flex items-start gap-3 text-xs text-gray-700">
                  <div className="p-2 rounded-xl bg-[#FCE7EC] text-[#541224]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-semibold">100% On-Time Guarantee</strong>
                    <span>We strictly respect wedding muhurats and celebration schedules.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-gray-700">
                  <div className="p-2 rounded-xl bg-[#FCE7EC] text-[#541224]">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-semibold">Premium International Cosmetics</strong>
                    <span>Using MAC, Huda Beauty, Kryolan HD, and Estée Lauder formulas.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleInquirySubmit} className="space-y-4 bg-[#FDFBF7] p-6 sm:p-8 rounded-2xl border border-gray-100">
                <h4 className="font-serif text-base font-bold text-[#541224]">
                  Request Custom Bridal & Festive Quote
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Occasion
                    </label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white cursor-pointer"
                    >
                      <option value="Royal Indian Bridal">Royal Wedding Bride</option>
                      <option value="Engagement / Sagan">Engagement / Sagan</option>
                      <option value="Mehendi / Haldi">Mehendi & Haldi</option>
                      <option value="Sangeet Night">Sangeet Night</option>
                      <option value="Karwa Chauth">Karwa Chauth</option>
                      <option value="Diwali Celebration">Diwali Glam</option>
                      <option value="Navratri Garba">Navratri Garba</option>
                      <option value="Eid Celebration">Eid Celebration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Persons Count
                    </label>
                    <select
                      value={formData.guest_count}
                      onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white cursor-pointer"
                    >
                      <option value="1">Bride Only (1)</option>
                      <option value="2-3">Bride + 2 Family (2-3)</option>
                      <option value="4-6">Bridal Party (4-6)</option>
                      <option value="7+">Grand Group (7+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Special Wishes or Outfit / Jewelry Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Saree draping in Gujarati style, heavy dupatta setting, pastel lehenga shade..."
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Bridal & Festive Consultation Request'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
