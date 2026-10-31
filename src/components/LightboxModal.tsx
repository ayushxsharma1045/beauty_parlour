import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; title: string; category: string }>;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrev,
  onNext
}) => {
  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Image Container */}
      <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
        <img
          src={current.url}
          alt={current.title}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
        />
        <div className="mt-4 text-center text-white">
          <span className="text-[10px] uppercase tracking-widest text-[#F4B8C5] font-semibold block">
            {current.category}
          </span>
          <h4 className="font-serif text-lg font-bold mt-0.5">{current.title}</h4>
        </div>
      </div>
    </div>
  );
};
