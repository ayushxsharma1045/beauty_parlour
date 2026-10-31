import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Info,
  Calendar,
  Filter,
  Check,
  Search
} from 'lucide-react';
import { Service } from '../types';
import { ServiceCard } from '../components/ServiceCard';

interface HairServicesPageProps {
  onOpenBooking: (serviceId?: number) => void;
}

export const HairServicesPage: React.FC<HairServicesPageProps> = ({ onOpenBooking }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data: Service[]) => {
        // Filter hair-related categories
        const hair = data.filter(
          (s) =>
            s.category === 'haircut' ||
            s.category === 'hairstyling' ||
            s.category === 'hairspa' ||
            s.category === 'haircoloring'
        );
        setServices(hair);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filters = [
    { label: 'All Hair Services', value: 'all' },
    { label: 'Haircuts', value: 'haircut' },
    { label: 'Hair Styling', value: 'hairstyling' },
    { label: 'Hair Spa', value: 'hairspa' },
    { label: 'Hair Coloring', value: 'haircoloring' },
  ];

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      activeFilter === 'all' || service.category === activeFilter;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(244,184,197,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Scissors className="w-3.5 h-3.5" />
            Precision Hair Craftsmanship
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Hair Services Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed">
            From modern layered bobs to royal herbal hair spas and vibrant gloss coloring, our master stylists curate looks that frame your natural beauty.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Transparency & Sample Pricing Notice */}
        <div className="p-4 rounded-2xl bg-[#F8F4EE] border border-[#D4A5AC]/40 text-xs text-gray-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#B76E79] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#541224]">
              Sample Pricing Transparency Notice:
            </p>
            <p className="leading-relaxed">
              All prices listed below are starting sample rates in Indian Rupees (₹). As with standard salon practice, exact final charges may vary depending on hair length (Short, Medium, Long) and hair density. You can toggle hair lengths on eligible cards below to see tailored estimates.
            </p>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`py-2 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeFilter === f.value
                    ? 'bg-[#541224] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hair service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white"
            />
          </div>
        </div>

        {/* Hair Coloring Feature Spotlight Banner (shown when All or Hair Coloring is selected) */}
        {(activeFilter === 'all' || activeFilter === 'haircoloring') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#541224] to-[#7A1E37] text-white flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="w-full md:w-1/3 h-52 sm:h-60 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md">
              <img
                src="/images/hair-coloring.jpg"
                alt="Hair Coloring Artistry at Durga Salon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest text-[#F8CAD5]">
                <Sparkles className="w-3.5 h-3.5" />
                Ammonia-Free & Gloss Formulations
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                Master Hair Coloring & Balayage Spectrum
              </h3>
              <p className="text-xs text-[#FCE7EC]/90 leading-relaxed font-light">
                Discover our full spectrum of hair coloring artistry: French freehand Balayage, sun-kissed Ombré, precision Crown Highlights, 100% seamless Grey Coverage Root Touch-ups, vivid Fashion Colors (Burgundy/Copper/Plum), organic Ayurvedic Rajasthani Henna, and mirror-shine Keratin Gloss Toners.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px] font-medium text-[#F8CAD5]">
                <span className="px-2.5 py-1 rounded-full bg-white/10">✓ 100% Ammonia-Free Global</span>
                <span className="px-2.5 py-1 rounded-full bg-white/10">✓ Bond-Protecting Serums</span>
                <span className="px-2.5 py-1 rounded-full bg-white/10">✓ Short / Medium / Long Custom Rates</span>
              </div>
            </div>
          </div>
        )}

        {/* Hair Services Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-gray-500">
            Loading hair services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 text-xs text-gray-500">
            No hair services match your current selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={onOpenBooking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
