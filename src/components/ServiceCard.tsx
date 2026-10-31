import React, { useState } from 'react';
import { Clock, Sparkles, Calendar, Heart, Check } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: number) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');

  const getPrice = (): number => {
    if (service.category.startsWith('hair')) {
      if (selectedLength === 'short' && service.price_short) return service.price_short;
      if (selectedLength === 'long' && service.price_long) return service.price_long;
      if (service.price_medium) return service.price_medium;
    }
    return service.price;
  };

  const isHair = service.category.startsWith('hair') || service.category === 'haircut' || service.category === 'hairstyling';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#D4A5AC]/30 hover:border-[#B76E79] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={service.image_url}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category & Duration Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#541224]/90 text-white backdrop-blur-xs">
            {service.category.replace('_', ' ')}
          </span>
          {service.is_popular === 1 && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E8C5CA] text-[#541224] flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#B76E79]" />
              Popular
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-[#F4B8C5]" />
          <span>{service.duration_mins} mins</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#541224] group-hover:text-[#B76E79] transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
            {service.description}
          </p>

          {/* Suitable Skin Tag */}
          {service.suitable_skin && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#B76E79] font-medium bg-[#FDF2F4] px-2.5 py-1 rounded-md w-fit">
              <Sparkles className="w-3 h-3" />
              <span>Skin: {service.suitable_skin}</span>
            </div>
          )}

          {/* Hair Length Selector if applicable */}
          {isHair && service.price_short && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1.5 font-medium">
                <span>Select Length:</span>
                <span className="capitalize text-[#541224] font-semibold">{selectedLength}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSelectedLength(len)}
                    className={`py-1 px-1.5 rounded-lg border font-medium capitalize text-center transition-all cursor-pointer ${
                      selectedLength === len
                        ? 'bg-[#541224] text-white border-[#541224]'
                        : 'bg-[#FDFBF7] text-gray-600 border-gray-200 hover:border-[#B76E79]'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price & Book CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              {isHair ? 'Calculated Price' : 'Starting Price'}
            </span>
            <span className="font-serif text-xl font-bold text-[#541224]">
              ₹{getPrice()}
            </span>
          </div>

          <button
            onClick={() => onBook(service.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
