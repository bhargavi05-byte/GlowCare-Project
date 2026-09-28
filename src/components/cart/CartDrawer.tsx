import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onOpenAuth
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { user } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponFeedback({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponFeedback({ text: res.message, isError: true });
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/35 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white/90 backdrop-blur-2xl border-l border-white/80 shadow-2xl flex flex-col transform transition-transform duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-rose-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-serif font-bold text-stone-900">Your Skincare Bag</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-stone-800">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Explore our botanical serums, SPF moisturizers, and gentle cleansers.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 hover:opacity-95 transition-all"
                >
                  Explore Skincare
                </button>
              </div>
            ) : (
              items.map((item) => {
                const discountedPrice = item.product.discount
                  ? Math.round(item.product.price * (1 - item.product.discount / 100))
                  : item.product.price;

                return (
                  <div
                    key={item.product.id}
                    className="p-3.5 rounded-2xl bg-white/70 border border-rose-100/70 shadow-xs flex gap-3.5 items-center hover:border-rose-200 transition-all"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-rose-100/80 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {item.product.brand}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          ₹{discountedPrice}
                        </span>
                        {item.product.discount > 0 && (
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{item.product.price}
                          </span>
                        )}
                      </div>

                      {/* Quantity Modifier */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50/80">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 text-stone-600 rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-stone-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 hover:bg-stone-200 text-stone-600 rounded-r-lg disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-rose-100/80 bg-white/60 space-y-4">
              
              {/* Coupon Box */}
              <div>
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied: <strong>{appliedCoupon.code}</strong> (-₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] text-stone-500 hover:text-rose-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponFeedback(null);
                      }}
                      placeholder="Coupon Code (e.g. GLOW20)"
                      className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs uppercase font-mono tracking-wider text-stone-800 placeholder-stone-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p className={`text-[11px] mt-1 ${couponFeedback.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Estimated Tax (GST 5%)</span>
                  <span>₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200/80 pt-2">
                  <span>Grand Total</span>
                  <span className="text-base font-serif text-rose-600">₹{totalAmount}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit Encrypted Checkout • Razorpay Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
