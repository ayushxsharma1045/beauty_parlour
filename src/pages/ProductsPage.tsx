import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Filter,
  Search,
  CheckCircle,
  Eye,
  Info,
  Package,
  Layers
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'retail' | 'used_in_salon'>('retail');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setIsCartOpen, totalCount } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Cleansers & Face Wash', value: 'cleansers' },
    { label: 'Facial Kits', value: 'facial_kits' },
    { label: 'Face Masks', value: 'face_masks' },
    { label: 'Moisturizers', value: 'moisturizers' },
    { label: 'Serums', value: 'serums' },
    { label: 'Sunscreens', value: 'sunscreens' },
    { label: 'Haircare Products', value: 'haircare' },
    { label: 'Bridal Makeup Products', value: 'bridal_makeup' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === 'retail' ? true : p.is_used_in_salon === 1;
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,184,197,0.18)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Sparkles className="w-3.5 h-3.5" />
            Salon-Grade Formulations
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Beauty Products Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed">
            Take home the salon glow. Explore gentle cleansers, nourishing botanical facial kits, soothing clay masks, and rich Moroccan hair elixirs used and recommended by Durga Beauty Parlour.
          </p>

          {/* View Toggle Tabs */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#D4A5AC]/40">
              <button
                onClick={() => setActiveTab('retail')}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeTab === 'retail'
                    ? 'bg-white text-[#541224] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Shop Retail Products
              </button>
              <button
                onClick={() => setActiveTab('used_in_salon')}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeTab === 'used_in_salon'
                    ? 'bg-white text-[#541224] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Products We Use in Salon
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Transparency note */}
        <div className="p-4 rounded-2xl bg-[#F8F4EE] border border-[#D4A5AC]/40 text-xs text-gray-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#B76E79] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Authentic Beauty Guarantee:</strong> All skincare and haircare items featured are selected for their gentle herbal actives, nourishing lipids, and compatibility with diverse Indian skin and hair types. All products can be collected at the salon counter or reserved online.
          </p>
        </div>

        {/* Filter Categories Bar & Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs focus:border-[#B76E79] outline-none bg-white"
              />
            </div>

            {totalCount > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#541224] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#681E34]"
              >
                <ShoppingBag className="w-4 h-4 text-[#F4B8C5]" />
                <span>View Bag ({totalCount} items)</span>
              </button>
            )}
          </div>

          {/* Categories Pill List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap tracking-wider uppercase transition-all shrink-0 ${
                  selectedCategory === c.value
                    ? 'bg-[#541224] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-xs text-gray-500">
            No products found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
