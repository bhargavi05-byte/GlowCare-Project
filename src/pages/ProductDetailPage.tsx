import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { subscribeReviews, addReview } from '../services/db-service';
import {
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Heart,
  Droplets,
  Layers,
  Clock,
  Plus,
  Minus
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBackToCatalog: () => void;
  onSelectProduct: (p: Product) => void;
  onDirectBuyNow: (p: Product, qty: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBackToCatalog,
  onSelectProduct,
  onDirectBuyNow
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'howToUse' | 'reviews'>('benefits');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitMsg, setReviewSubmitMsg] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  useEffect(() => {
    const unsub = subscribeReviews(product.id, (revs) => {
      setReviews(revs);
    });
    return () => unsub();
  }, [product.id]);

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    onDirectBuyNow(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    try {
      await addReview({
        productId: product.id,
        userId: user?.id || 'guest-' + Date.now(),
        userName: user?.name || 'Verified Skincare Enthusiast',
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        skinType: product.skinType,
        createdAt: new Date().toISOString()
      });
      setNewReviewComment('');
      setIsAddingReview(false);
      setReviewSubmitMsg(true);
      setTimeout(() => setReviewSubmitMsg(false), 3000);
    } catch (err: any) {
      alert('Review submission notice: ' + err.message);
    }
  };

  // Related products from same category or random
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.skinType === product.skinType))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back button */}
      <button
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Skincare Catalog</span>
      </button>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Large Product Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <GlassCard
            variant="elevated"
            className="p-3 overflow-hidden border-white/90 shadow-xl"
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50/40">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md">
                  SAVE {product.discount}%
                </div>
              )}
            </div>
          </GlassCard>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white/60 border border-rose-100/60 text-stone-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-semibold block">100% Authentic</span>
              <span className="text-[10px] text-stone-400">Direct from Lab</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 border border-rose-100/60 text-stone-700 text-xs">
              <Truck className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <span className="font-semibold block">Free Shipping</span>
              <span className="text-[10px] text-stone-400">Orders above ₹999</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 border border-rose-100/60 text-stone-700 text-xs">
              <RotateCcw className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <span className="font-semibold block">Easy Returns</span>
              <span className="text-[10px] text-stone-400">14-Day Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-stone-400 font-semibold">•</span>
              <span className="text-xs font-semibold text-stone-600">{product.brand}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-stone-300">|</span>
              <span className="text-xs text-stone-500">
                {product.ratingCount + reviews.length} Customer Reviews
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                Target: {product.skinType}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100/80 shadow-xs flex items-baseline gap-3">
            <span className="text-3xl font-serif font-bold text-stone-900">
              ₹{discountedPrice}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-stone-400 line-through">
                  ₹{product.price}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  You Save ₹{product.price - discountedPrice} ({product.discount}% OFF)
                </span>
              </>
            )}
            <span className="text-[11px] text-stone-400 ml-auto font-medium">
              Inclusive of all taxes
            </span>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Stock status indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
            {product.stock > 10 ? (
              <span className="text-emerald-700 font-semibold">In Stock — Dispatched within 24 hours</span>
            ) : product.stock > 0 ? (
              <span className="text-amber-700 font-semibold">Low Stock: Only {product.stock} units left in Mumbai hub</span>
            ) : (
              <span className="text-rose-700 font-semibold">Sold Out — Restocking soon</span>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-stone-700">Quantity</span>
              <div className="flex items-center border border-stone-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-l-xl"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-stone-800 font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-r-xl disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs hover:border-rose-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAddedFeedback ? 'Added to Bag ✓' : 'Add to Shopping Bag'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Buy Now</span>
              </button>
            </div>
          </div>

          {/* Deep Tabs: Benefits, Ingredients, How to Use, Reviews */}
          <div className="pt-6 border-t border-rose-100/70">
            <div className="flex border-b border-stone-200/80 gap-6 text-xs">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`pb-2.5 font-semibold transition-all ${
                  activeTab === 'benefits'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Proven Benefits
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2.5 font-semibold transition-all ${
                  activeTab === 'ingredients'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('howToUse')}
                className={`pb-2.5 font-semibold transition-all ${
                  activeTab === 'howToUse'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                How to Apply
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 font-semibold transition-all ${
                  activeTab === 'reviews'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="pt-4 text-xs text-stone-600 leading-relaxed">
              {activeTab === 'benefits' && (
                <div className="p-4 rounded-2xl bg-white/60 border border-stone-200/60 space-y-2">
                  <p className="font-medium text-stone-800">{product.benefits}</p>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="p-4 rounded-2xl bg-white/60 border border-stone-200/60 space-y-2">
                  <p className="font-mono text-stone-700 leading-relaxed text-[11px]">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {activeTab === 'howToUse' && (
                <div className="p-4 rounded-2xl bg-white/60 border border-stone-200/60 space-y-2">
                  <p className="text-stone-800 font-medium">{product.howToUse}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviewSubmitMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                      Thank you! Your feedback has been verified and published.
                    </div>
                  )}

                  {!isAddingReview ? (
                    <button
                      onClick={() => setIsAddingReview(true)}
                      className="py-2 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                    >
                      Write a Customer Review
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Your Rating</label>
                        <div className="flex gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              onClick={() => setNewReviewRating(star)}
                              className={`w-5 h-5 cursor-pointer ${
                                star <= newReviewRating ? 'fill-amber-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Your Review</label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Share how this product affected your skin texture and routine..."
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingReview(false)}
                          className="py-1.5 px-3 rounded-lg border border-stone-200 text-stone-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="py-1.5 px-4 rounded-lg bg-rose-500 text-white font-semibold"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {reviews.length === 0 ? (
                      <p className="text-stone-400 text-xs italic">
                        Be the first to review this product!
                      </p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 rounded-xl bg-white/70 border border-stone-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{rev.userName}</span>
                            <div className="flex text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-600 text-xs">{rev.comment}</p>
                          <span className="text-[10px] text-stone-400 block pt-1">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN')} • Skin Type: {rev.skinType}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Recommendation Strip */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-rose-100/70 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Complete Your Skincare Routine
            </h3>
            <span className="text-xs text-stone-400">Matching formulations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((relProd) => (
              <GlassCard
                key={relProd.id}
                hoverEffect
                onClick={() => onSelectProduct(relProd)}
                className="p-4 border-rose-100/70 cursor-pointer flex gap-4 items-center"
              >
                <img
                  src={relProd.imageUrl}
                  alt={relProd.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-rose-600 font-bold uppercase">{relProd.category}</span>
                  <h4 className="text-xs font-bold text-stone-900 truncate">{relProd.name}</h4>
                  <p className="text-xs font-bold text-stone-800 mt-1">₹{relProd.price}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
