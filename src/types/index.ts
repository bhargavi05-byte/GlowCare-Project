export type UserRole = 'customer' | 'retailer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  addresses?: ShippingAddress[];
}

export type ProductCategory = 
  | 'Face Care'
  | 'Cleansers'
  | 'Moisturizers'
  | 'Serums'
  | 'Sunscreens'
  | 'Masks'
  | 'Body Care';

export type SkinType = 
  | 'All Skin Types'
  | 'Oily'
  | 'Dry'
  | 'Combination'
  | 'Sensitive'
  | 'Normal';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: ProductCategory;
  price: number; // in INR (₹)
  discount: number; // percentage (0-100)
  stock: number;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  ingredients: string;
  benefits: string;
  skinType: SkinType;
  howToUse: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Wallets';

export type PaymentStatus = 
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string;
  orderStatus: OrderStatus;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  skinType: SkinType;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  minPurchase: number;
  description: string;
}
