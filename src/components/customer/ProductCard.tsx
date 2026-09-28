import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { GlassCard } from '../common/GlassCard';
import { Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct
}) => {
  const { addToCart } = useCart();

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <GlassCard
      hoverEffect
      className="group flex flex-col justify-between overflow-hidden border border-rose-100/70 p-4 transition-all duration-300"
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50/50 mb-3.5">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.discount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold tracking-tight shadow-sm">
                -{product.discount}% OFF
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold tracking-tight shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Best Seller
              </span>
            )}
          </div>

          {/* Quick View Button on Hover */}
          <button
            onClick={() => onSelectProduct(product)}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Quick view details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="font-semibold text-rose-600 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({product.ratingCount})</span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-serif font-bold text-stone-900 line-clamp-1 group-hover:text-rose-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-4 pt-3 border-t border-rose-100/60 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-serif font-bold text-stone-900">
              ₹{discountedPrice}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
          <span className="text-[9px] text-stone-400 block -mt-0.5">
            {product.stock <= 5 ? (
              <span className="text-rose-500 font-semibold">Only {product.stock} left</span>
            ) : (
              'In stock'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-xs shadow-rose-500/20 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
