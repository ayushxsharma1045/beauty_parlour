import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, Camera, Filter, Image as ImageIcon, Film, Play } from 'lucide-react';
import { LightboxModal } from '../components/LightboxModal';
import { MakeoverReelsSection } from '../components/MakeoverReelsSection';
import { GalleryPhoto } from '../types';

interface GalleryPageProps {
  onOpenBooking?: (serviceId?: number) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenBooking = () => {} }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'reels' ? 'reels' : 'photos';
  const [viewTab, setViewTab] = useState<'reels' | 'photos'>(initialTab);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'reels') {
      setViewTab('reels');
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data: GalleryPhoto[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryItems(data);
        } else {
          // Fallback defaults
          setGalleryItems([
            {
              id: 1,
              title: 'Luxury Salon Styling Suite & Arched Mirrors',
              category: 'interiors',
              url: '/images/hero-banner.jpg',
              description: 'Our main styling floor with rose gold accents and custom lighting.'
            },
            {
              id: 2,
              title: 'Royal Indian Bridal Makeover & Hair Artistry',
              category: 'bridal',
              url: '/images/bridal-hero.jpg',
              description: 'High-definition bridal makeup with authentic jewelry and floral hairstyle.'
            },
            {
              id: 3,
              title: 'Hydrating Botanical Facial & Rose Petal Spa',
              category: 'facial',
              url: '/images/facial-hero.jpg',
              description: 'Soothing facial treatment room with fresh damask rose petals.'
            },
            {
              id: 4,
              title: 'Caramel Honey Balayage & Soft Waves',
              category: 'hair',
              url: '/images/hair-coloring.jpg',
              description: 'Seamless French freehand balayage with luminous dimension.'
            },
            {
              id: 5,
              title: 'Karwa Chauth & Diwali Festive Glow',
              category: 'festive',
              url: '/images/festive-hero.jpg',
              description: 'Radiant festive glam in royal velvet maroon and gold jewelry.'
            }
          ]);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery photos:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    { label: 'All Photos', value: 'all' },
    { label: 'Hair & Coloring', value: 'hair' },
    { label: 'Facial Treatments', value: 'facial' },
    { label: 'Bridal Artistry', value: 'bridal' },
    { label: 'Festive Glam', value: 'festive' },
    { label: 'Party Makeup', value: 'makeup' },
    { label: 'Salon Interiors', value: 'interiors' },
  ];

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'hair': return 'Hair & Coloring';
      case 'facial': return 'Facial Treatments';
      case 'bridal': return 'Bridal Artistry';
      case 'festive': return 'Festive Glam';
      case 'makeup': return 'Party Makeup';
      case 'interiors': return 'Salon Interiors';
      default: return cat;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white overflow-hidden text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Camera className="w-3.5 h-3.5" />
            Visual Portfolio
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            Salon Gallery & Transformations
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed mt-2">
            A glimpse into the serene spaces, balayage hair artistry, royal bridal makeovers, and festival radiance created every day at Durga Beauty Parlour.
          </p>
        </div>
      </section>

      {/* View Switcher: Makeover Video Reels vs Photo Portfolio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-1.5 shadow-lg border border-[#D4A5AC]/30 flex max-w-md mx-auto gap-1.5">
          <button
            onClick={() => {
              setViewTab('reels');
              setSearchParams({ tab: 'reels' });
            }}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              viewTab === 'reels'
                ? 'maroon-gradient text-white shadow-md'
                : 'text-gray-600 hover:text-[#541224] hover:bg-[#FDF2F4]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Makeover Reels</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase bg-[#FCE7EC] text-[#541224] font-bold">
              HOT
            </span>
          </button>

          <button
            onClick={() => {
              setViewTab('photos');
              setSearchParams({});
            }}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              viewTab === 'photos'
                ? 'maroon-gradient text-white shadow-md'
                : 'text-gray-600 hover:text-[#541224] hover:bg-[#FDF2F4]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Portfolio</span>
          </button>
        </div>
      </div>

      {viewTab === 'reels' ? (
        <div className="space-y-6">
          <MakeoverReelsSection onOpenBooking={onOpenBooking} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCategory === c.value
                    ? 'bg-[#541224] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-xs text-gray-500">
              Loading salon gallery...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-md mx-auto space-y-3">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">
                No photos currently available in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(idx)}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl border border-[#D4A5AC]/30 transition-all duration-300"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                    <span className="self-end p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Eye className="w-5 h-5" />
                    </span>
                    <div className="text-white space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#F4B8C5]">
                        {getCategoryLabel(item.category)}
                      </span>
                      <h4 className="font-serif text-lg font-bold leading-tight">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-[#FCE7EC]/80 line-clamp-2 font-light">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={filteredItems.map(item => ({
          ...item,
          categoryLabel: getCategoryLabel(item.category)
        }))}
        currentIndex={currentImageIndex}
        onPrev={() =>
          setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
        }
        onNext={() =>
          setCurrentImageIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0))
        }
      />
    </div>
  );
};
