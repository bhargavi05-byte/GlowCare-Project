import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/initialProducts';
import { useAuth } from './AuthContext';
import { saveUserCart, getUserCart } from '../services/db-service';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('glowcare_local_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const savedCoupon = localStorage.getItem('glowcare_applied_coupon');
    if (savedCoupon) {
      return AVAILABLE_COUPONS.find(c => c.code === savedCoupon) || null;
    }
    return null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('glowcare_local_cart', JSON.stringify(items));
    if (user && user.role === 'customer') {
      saveUserCart(user.id, items, appliedCoupon?.code);
    }
  }, [items, appliedCoupon, user]);

  // Load cloud cart on user sign-in
  useEffect(() => {
    if (user && user.role === 'customer') {
      getUserCart(user.id).then((cloudCart) => {
        if (cloudCart && cloudCart.items && cloudCart.items.length > 0 && items.length === 0) {
          // Cloud items found
          if (cloudCart.couponCode) {
            const found = AVAILABLE_COUPONS.find(c => c.code === cloudCart.couponCode);
            if (found) setAppliedCoupon(found);
          }
        }
      });
    }
  }, [user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('glowcare_local_cart');
    localStorage.removeItem('glowcare_applied_coupon');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const discountedPrice = item.product.discount
      ? Math.round(item.product.price * (1 - item.product.discount / 100))
      : item.product.price;
    return sum + discountedPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minPurchase) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountFixed) {
      discountAmount = Math.min(subtotal, appliedCoupon.discountFixed);
    }
  }

  // Free shipping above ₹999, else ₹99
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 99;

  // 5% GST on discounted taxable value
  const taxableValue = Math.max(0, subtotal - discountAmount);
  const taxAmount = subtotal === 0 ? 0 : Math.round(taxableValue * 0.05);

  const totalAmount = Math.max(0, taxableValue + shippingFee + taxAmount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const formattedCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === formattedCode);
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try GLOW20 or FIRSTCARE.' };
    }
    if (subtotal < coupon.minPurchase) {
      return {
        success: false,
        message: `Cart subtotal must be at least ₹${coupon.minPurchase} to use coupon ${formattedCode}.`,
      };
    }
    setAppliedCoupon(coupon);
    localStorage.setItem('glowcare_applied_coupon', coupon.code);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('glowcare_applied_coupon');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        totalAmount,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
