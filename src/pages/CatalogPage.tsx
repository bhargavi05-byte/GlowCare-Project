import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, SkinType } from '../types';
import { ProductCard } from '../components/customer/ProductCard';
import { GlassCard } from '../components/common/GlassCard';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

interface CatalogPageProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  initialCategory?: ProductCategory | null;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  onSelectProduct,
  initialCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<string>('best-selling');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Available Filter Options
  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Serums',
    'Moisturizers',
    'Sunscreens',
    'Cleansers',
    'Face Care',
    'Masks',
    'Body Care'
  ];

  const skinTypes: (SkinType | 'All')[] = [
    'All',
    'All Skin Types',
    'Oily',
    'Dry',
    'Combination',
    'Sensitive',
    'Normal'
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSkinType('All');
    setMinRating(0);
    setMaxPrice(2000);
    setSortBy('best-selling');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Search query
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

      // Skin type filter
      const matchSkinType =
        selectedSkinType === 'All' ||
        p.skinType === selectedSkinType ||
        p.skinType === 'All Skin Types';

      // Rating filter
      const matchRating = p.rating >= minRating;

      // Price filter
      const effectivePrice = p.discount
        ? Math.round(p.price * (1 - p.discount / 100))
        : p.price;
      const matchPrice = effectivePrice <= maxPrice;

      return matchSearch && matchCategory && matchSkinType && matchRating && matchPrice;
    });

    // Sort logic
    result.sort((a, b) => {
      const priceA = a.discount ? Math.round(a.price * (1 - a.discount / 100)) : a.price;
      const priceB = b.discount ? Math.round(b.price * (1 - b.discount / 100)) : b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'highest-rated') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // best-selling default
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedSkinType, minRating, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Catalog Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100/70">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Curated Formulations
          </span>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Premium Skincare Catalog
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Showing {filteredAndSortedProducts.length} of {products.length} clinical elixirs
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden py-2 px-4 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-2 self-start"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{showMobileFilters ? 'Hide Filters' : 'Filter & Sort'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* ================= FILTERS SIDEBAR ================= */}
        <div className={`space-y-6 lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
          <GlassCard className="p-5 border-rose-100/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100/60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900">
                <Filter className="w-4 h-4 text-rose-500" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Search Input in Sidebar */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vitamin C, Retinol..."
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-rose-500 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Skin Type
              </label>
              <select
                value={selectedSkinType}
                onChange={(e) => setSelectedSkinType(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs text-stone-700"
              >
                {skinTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-2">
                <span>Max Price</span>
                <span className="font-mono text-rose-600">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={500}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>₹500</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Minimum Customer Rating
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 4.0, 4.5, 4.8].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setMinRating(rt)}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                      minRating === rt
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {rt === 0 ? 'All' : `${rt}+`}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ================= PRODUCT GRID AREA ================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting Bar */}
          <div className="p-3 rounded-2xl bg-white/70 border border-rose-100/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-500 font-medium">
              Showing <strong className="text-stone-900">{filteredAndSortedProducts.length}</strong> products
            </span>

            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[11px]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs font-medium text-stone-800"
              >
                <option value="best-selling">Best Selling</option>
                <option value="highest-rated">Highest Rated (★)</option>
                <option value="price-asc">Price: Low to High (₹)</option>
                <option value="price-desc">Price: High to Low (₹)</option>
                <option value="newest">Newest Releases</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-800">
                No matching skincare products found
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4 max-w-sm mx-auto">
                Try widening your price range, clearing your keyword search, or choosing all skin types.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2 px-5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Reset All Filters
              </button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
