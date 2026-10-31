import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Search,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { Service } from '../types';

interface FacialSkincarePageProps {
  onOpenBooking: (serviceId?: number) => void;
  onOpenConsultation: () => void;
}

export const FacialSkincarePage: React.FC<FacialSkincarePageProps> = ({
  onOpenBooking,
  onOpenConsultation
}) => {
  const [facials, setFacials] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkinFilter, setSelectedSkinFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services?category=facial')
      .then((res) => res.json())
      .then((data) => setFacials(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const skinFilters = [
    { label: 'All Facials', value: 'all' },
    { label: 'Normal / Dry', value: 'dry' },
    { label: 'Sensitive Skin', value: 'sensitive' },
    { label: 'Glow & Festive', value: 'festive' },
    { label: 'Bridal', value: 'bridal' },
  ];

  const filteredFacials = facials.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.suitable_skin && f.suitable_skin.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesFilter = true;
    if (selectedSkinFilter === 'dry') {
      matchesFilter = (f.suitable_skin?.toLowerCase().includes('dry') || f.name.toLowerCase().includes('hydrat')) || false;
    } else if (selectedSkinFilter === 'sensitive') {
      matchesFilter = (f.suitable_skin?.toLowerCase().includes('sensitive') || f.name.toLowerCase().includes('herbal')) || false;
    } else if (selectedSkinFilter === 'festive') {
      matchesFilter = (f.name.toLowerCase().includes('gold') || f.name.toLowerCase().includes('diamond') || f.name.toLowerCase().includes('pearl')) || false;
    } else if (selectedSkinFilter === 'bridal') {
      matchesFilter = f.name.toLowerCase().includes('bridal');
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(244,184,197,0.2)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Sparkles className="w-3.5 h-3.5" />
            Holistic Facial & Skincare Wellness
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Facial and Skincare Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed">
            Recharge your skin with our nurturing herbal pastes, collagen masks, 24K gold dust elixirs, and deep hydration therapies performed by skilled aestheticians.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Skin Consultation Banner */}
        <div className="p-6 rounded-3xl bg-[#FDF2F4] border-2 border-[#D4A5AC]/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#541224] text-white">
                Expert Recommendation
              </span>
              <h3 className="font-serif text-xl font-bold text-[#541224]">
                Free Skin Consultation with Our Beauty Expert
              </h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-light">
              Every skin is unique. Chat with our certified aesthetician to evaluate your skin condition, discuss allergies, and choose the most effective treatment for your lifestyle.
            </p>
            <p className="text-[11px] text-[#B76E79] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              We promote honest, restorative skincare focused on cellular hydration and nourishment without unrealistic medical claims.
            </p>
          </div>

          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Request Skin Consultation</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {skinFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setSelectedSkinFilter(f.value)}
                className={`py-2 px-4 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedSkinFilter === f.value
                    ? 'bg-[#541224] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search facials by name or skin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs focus:border-[#B76E79] outline-none bg-white"
            />
          </div>
        </div>

        {/* Facials Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-gray-500">
            Loading facial treatments...
          </div>
        ) : filteredFacials.length === 0 ? (
          <div className="text-center py-16 text-xs text-gray-500">
            No facials match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacials.map((facial) => (
              <div
                key={facial.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#D4A5AC]/30 hover:border-[#B76E79] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Facial Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={facial.image_url}
                    alt={facial.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#F4B8C5]" />
                    <span>{facial.duration_mins} mins</span>
                  </div>

                  {facial.is_popular === 1 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#541224] text-white">
                      Guest Favorite
                    </span>
                  )}
                </div>

                {/* Facial Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#541224] group-hover:text-[#B76E79] transition-colors">
                      {facial.name}
                    </h3>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {facial.description}
                    </p>

                    {facial.suitable_skin && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B76E79] bg-[#FDF2F4] px-2.5 py-1 rounded-lg">
                        <Sparkles className="w-3 h-3" />
                        <span>Suitable for: {facial.suitable_skin}</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Book Button */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                        Treatment Price
                      </span>
                      <span className="font-serif text-xl font-bold text-[#541224]">
                        ₹{facial.price}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenBooking(facial.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book This Facial</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
