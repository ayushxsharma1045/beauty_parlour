import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Sparkles, Shield, X } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsAdded(true);
    showToast(`Added ${product.name} to your beauty bag!`, 'success');
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <div className="group bg-white rounded-3xl overflow-hidden border border-[#D4A5AC]/30 hover:border-[#B76E79] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        {/* Product Image */}
        <div className="relative h-56 overflow-hidden bg-[#FDFBF7] flex items-center justify-center p-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Used In Salon Badge */}
          {product.is_used_in_salon === 1 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#541224] text-[#FCE7EC] shadow-sm">
              Used In Salon Treatments
            </span>
          )}

          {/* Quick View Button */}
          <button
            onClick={() => setShowDetailModal(true)}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
            aria-label="View product details"
          >
            <Eye className="w-4 h-4 text-[#541224]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center text-[11px] text-[#B76E79] font-semibold uppercase tracking-wider">
              <span>{product.brand}</span>
              <span className="text-gray-500 lowercase bg-[#F8F4EE] px-2 py-0.5 rounded-full">
                {product.size}
              </span>
            </div>

            <h3 className="font-serif text-base font-bold text-[#541224] mt-1 group-hover:text-[#B76E79] transition-colors leading-snug">
              {product.name}
            </h3>

            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {product.suitability && (
              <span className="inline-block mt-2 text-[10px] text-gray-500 bg-[#FDF2F4] px-2 py-0.5 rounded-md">
                Suitable for: {product.suitability}
              </span>
            )}
          </div>

          {/* Price & Add to Bag */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase tracking-wider">
                Retail Price
              </span>
              <span className="font-serif text-xl font-bold text-[#541224]">
                ₹{product.price}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                isAdded
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'maroon-gradient text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
              <span>{isAdded ? 'Added' : 'Add to Bag'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D4A5AC]/40 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-[#541224] text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FCE7EC]">
                Product Details
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="h-56 rounded-2xl overflow-hidden bg-[#FDFBF7]">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-[#B76E79] uppercase">
                  {product.brand} • {product.size}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#541224] mt-1">
                  {product.name}
                </h3>
                <span className="font-serif text-xl font-bold text-[#541224] block mt-1">
                  ₹{product.price}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed text-sm">
                {product.description}
              </p>

              {product.suitability && (
                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#D4A5AC]/30">
                  <span className="font-bold text-[#541224] block mb-0.5">
                    Recommended Skin / Hair Profile:
                  </span>
                  <span className="text-gray-600">{product.suitability}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    handleAddToCart();
                    setShowDetailModal(false);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • ₹{product.price}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
