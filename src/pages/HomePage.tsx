import React from 'react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/customer/ProductCard';
import { GlassCard } from '../components/common/GlassCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Sun,
  Heart,
  Star,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onNavigateCatalog: (category?: ProductCategory) => void;
}

const CATEGORIES: { name: ProductCategory; icon: string; countDesc: string }[] = [
  { name: 'Serums', icon: '💧', countDesc: 'Clinical Actives' },
  { name: 'Moisturizers', icon: '🧴', countDesc: 'Deep Barrier Repair' },
  { name: 'Sunscreens', icon: '☀️', countDesc: 'SPF 50+ Invisible' },
  { name: 'Cleansers', icon: '🫧', countDesc: 'pH 5.5 Gentle' },
  { name: 'Face Care', icon: '✨', countDesc: 'Peptides & Retinoids' },
  { name: 'Masks', icon: '🌸', countDesc: 'Detox French Clays' },
  { name: 'Body Care', icon: '🌿', countDesc: 'Exfoliating AHA' },
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onNavigateCatalog
}) => {
  const featuredProducts = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-20 pb-16">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 glow-orb-rose pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 glow-orb-purple pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-semibold text-rose-800 tracking-wide uppercase">
                  Dermatologist Approved Clinical Skincare
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
                Elevate Your Skincare, <br />
                <span className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Naturally & Scientifically.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover clean, biocompatible formulations enriched with multi-molecular hyaluronic acids, botanical ceramides, and stabilized vitamin C. Formulated specifically to shield and illuminate Indian skin.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigateCatalog()}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
                >
                  <span>Shop Routine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateCatalog('Serums')}
                  className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-white/80 hover:bg-white text-stone-700 font-semibold text-sm border border-stone-200 shadow-xs hover:border-rose-300 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Serums</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>

              {/* Social Proof Metric Strip */}
              <div className="pt-6 border-t border-rose-100/60 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">98.4%</span>
                  <p className="text-[11px] text-stone-500">Reported radiant glow</p>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">100%</span>
                  <p className="text-[11px] text-stone-500">Vegan & Toxin-Free</p>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">4.9 ★</span>
                  <p className="text-[11px] text-stone-500">Over 10,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Glass Card with Skincare Bottle Image */}
                <GlassCard
                  variant="elevated"
                  className="overflow-hidden p-3 relative border-white/90 shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
                    alt="GlowRevive Vitamin C Serum"
                    className="w-full h-96 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent rounded-2xl flex flex-col justify-end p-6 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300">
                      Signature Hero
                    </span>
                    <h3 className="text-xl font-serif font-bold">GlowRevive 15% Vitamin C</h3>
                    <p className="text-xs text-stone-200 mt-1">Multi-award winning brightening elixir</p>
                  </div>
                </GlassCard>

                {/* Floating Glass Pill 1 */}
                <GlassCard
                  className="absolute -top-4 -left-6 p-3.5 border-white shadow-lg hidden sm:flex items-center gap-3 animate-bounce duration-1000"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                    15%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Pure Ethyl Ascorbic</p>
                    <p className="text-[10px] text-stone-500">Fades dark spots in 14d</p>
                  </div>
                </GlassCard>

                {/* Floating Glass Pill 2 */}
                <GlassCard
                  className="absolute -bottom-5 -right-5 p-3.5 border-white shadow-lg hidden sm:flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    3X
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Ceramide Shield</p>
                    <p className="text-[10px] text-stone-500">72-Hour lock-in moisture</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY SHOWCASE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/50">
            Targeted Skin Routines
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Shop by Skincare Category
          </h2>
          <p className="text-xs text-stone-500">
            Formulated to balance pH, soothe inflammation, and restore skin barrier equilibrium.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <GlassCard
              key={cat.name}
              hoverEffect
              onClick={() => onNavigateCatalog(cat.name)}
              className="p-4 text-center border-rose-100/60 shadow-xs flex flex-col items-center justify-center space-y-2 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 to-pink-50 border border-rose-100/80 flex items-center justify-center text-2xl shadow-2xs">
                {cat.icon}
              </div>
              <h4 className="text-xs font-serif font-bold text-stone-900">{cat.name}</h4>
              <span className="text-[10px] text-stone-400 block">{cat.countDesc}</span>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Formulations
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Featured Skincare Drops
            </h2>
          </div>
          <button
            onClick={() => onNavigateCatalog()}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <span>View All Catalog ({products.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* ================= BEST SELLERS STRIP ================= */}
      <section className="bg-gradient-to-b from-rose-50/50 via-white/40 to-transparent py-12 border-y border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Community Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                Best-Selling Elixirs
              </h2>
            </div>
            <button
              onClick={() => onNavigateCatalog()}
              className="text-xs font-semibold text-stone-700 hover:text-rose-600 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore Top Rated</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CUSTOMER REVIEWS SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/50">
            Real Transformations
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Loved by Skincare Aficionados
          </h2>
          <p className="text-xs text-stone-500">
            Unfiltered feedback from customers who transformed their skin barrier with GlowCare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "The 15% Vitamin C serum is truly unmatched. Within 2 weeks of daily application my acne dark spots faded noticeably, with ZERO irritation or tingling on my sensitive skin."
            </p>
            <div className="pt-2 border-t border-rose-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">Dr. Meera Sen</p>
                <p className="text-[10px] text-stone-400">Combination Skin • Verified Buyer</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                Verified
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "The Invisible Dew SPF 50 has literally ended my search for an everyday sunscreen. Zero white cast on wheatish Indian complexion, completely sweat-resistant and leaves a soft velvet glow."
            </p>
            <div className="pt-2 border-t border-rose-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">Kabir Varma</p>
                <p className="text-[10px] text-stone-400">Oily Skin • Verified Buyer</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                Verified
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "I damaged my barrier through over-exfoliation last year. The Ceramide Barrier Recovery Cream felt like a soothing blanket. 48 hours later, all redness and peeling were history."
            </p>
            <div className="pt-2 border-t border-rose-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">Ananya Deshmukh</p>
                <p className="text-[10px] text-stone-400">Dry / Barrier Impaired • Verified</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                Verified
              </span>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
