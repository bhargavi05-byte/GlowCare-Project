import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Product, Order, OrderStatus, Review, CartItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CARTS_COLLECTION = 'carts';
const REVIEWS_COLLECTION = 'reviews';

// Initial orders seed to provide beautiful charts on first launch
const INITIAL_DEMO_ORDERS: Partial<Order>[] = [
  {
    id: 'GLOW-ORD-9021',
    userId: 'demo-customer-1',
    customerName: 'Aanya Sharma',
    customerEmail: 'aanya.sharma@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        productId: 'prod-vit-c-serum',
        productName: 'GlowRevive 15% Vitamin C Brightening Serum',
        brand: 'GlowCare Pure',
        price: 1104,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'prod-spf-50-sunscreen',
        productName: 'Invisible Dew SPF 50+ PA++++ Fluid Sunscreen',
        brand: 'GlowCare Shield',
        price: 791,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 1895,
    discountAmount: 200,
    couponCode: 'FIRSTCARE',
    shippingFee: 0,
    taxAmount: 85,
    totalAmount: 1780,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    paymentId: 'pay_demo_rzp_98124',
    orderStatus: 'Delivered',
    shippingAddress: 'Flat 402, Lotus Tower, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'GLOW-ORD-9045',
    userId: 'demo-customer-2',
    customerName: 'Rohan Mehra',
    customerEmail: 'rohan.m@example.com',
    customerPhone: '+91 99234 56789',
    items: [
      {
        productId: 'prod-ceramide-moisturizer',
        productName: 'Ceramide Barrier Recovery Velvet Cream',
        brand: 'GlowCare Pure',
        price: 919,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 1838,
    discountAmount: 0,
    shippingFee: 0,
    taxAmount: 92,
    totalAmount: 1930,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    paymentId: 'pay_demo_rzp_98299',
    orderStatus: 'Shipped',
    shippingAddress: 'B-12, Sector 15, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'GLOW-ORD-9078',
    userId: 'demo-customer-3',
    customerName: 'Priya Iyer',
    customerEmail: 'priya.iyer@example.com',
    customerPhone: '+91 98451 22334',
    items: [
      {
        productId: 'prod-retinol-night-cream',
        productName: 'Renewing 0.3% Encapsulated Retinol Night Elixir',
        brand: 'GlowCare Pure',
        price: 1349,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'prod-hyaluronic-acid',
        productName: 'HydroPlump Multi-Molecular Hyaluronic Acid Serum',
        brand: 'GlowCare Pure',
        price: 899,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1608248597358-6e545e8f498c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 2248,
    discountAmount: 450,
    couponCode: 'GLOW20',
    shippingFee: 0,
    taxAmount: 90,
    totalAmount: 1888,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    paymentId: 'pay_demo_rzp_98456',
    orderStatus: 'Processing',
    shippingAddress: '84 Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500033',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'GLOW-ORD-9102',
    userId: 'demo-customer-4',
    customerName: 'Kavita Nair',
    customerEmail: 'kavita.nair@example.com',
    customerPhone: '+91 97401 11223',
    items: [
      {
        productId: 'prod-gentle-cleanser',
        productName: 'Rose & Oat Milk Gentle Foaming Cleanser',
        brand: 'GlowCare Botanics',
        price: 749,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'prod-french-clay-mask',
        productName: 'Pink Kaolin & Rose Quartz Clarifying Clay Mask',
        brand: 'GlowCare Botanics',
        price: 799,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 1548,
    discountAmount: 155,
    couponCode: 'GLOW10',
    shippingFee: 0,
    taxAmount: 70,
    totalAmount: 1463,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    paymentId: 'pay_demo_rzp_98610',
    orderStatus: 'Confirmed',
    shippingAddress: '403 Marine Drive, Sea Breeze Apt',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400020',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

// Product Services
export async function seedInitialProductsIfNeeded(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial products into Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      }
    }
  } catch (error) {
    console.warn('Auto-seeding products note (using local cache if unauthenticated):', error);
  }
}

export async function seedInitialOrdersIfNeeded(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial orders into Firestore for analytics demo...');
      for (const ord of INITIAL_DEMO_ORDERS) {
        if (ord.id) {
          await setDoc(doc(db, ORDERS_COLLECTION, ord.id), ord);
        }
      }
    }
  } catch (error) {
    console.warn('Initial orders check note:', error);
  }
}

export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // If firestore is empty, emit initial products and trigger seed
        onUpdate(INITIAL_PRODUCTS);
        seedInitialProductsIfNeeded();
      } else {
        const prods: Product[] = [];
        snapshot.forEach((d) => {
          prods.push({ id: d.id, ...d.data() } as Product);
        });
        onUpdate(prods);
      }
    },
    (error) => {
      console.error('Products subscription listener error:', error);
      // Fallback to initial products in offline/guest state
      onUpdate(INITIAL_PRODUCTS);
      if (onError) onError(error);
    }
  );
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const newId = 'prod-' + Date.now();
  const path = `${PRODUCTS_COLLECTION}/${newId}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, newId);
    await setDoc(docRef, { ...product, id: newId });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Order Services
export async function createOrder(order: Order): Promise<string> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, order);

    // Atomically decrement stock for each ordered item
    for (const item of order.items) {
      try {
        const prodDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, item.productId));
        if (prodDoc.exists()) {
          const currentStock = prodDoc.data().stock || 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(doc(db, PRODUCTS_COLLECTION, item.productId), {
            stock: nextStock
          });
        }
      } catch (stockErr) {
        console.warn('Stock update note:', stockErr);
      }
    }

    return order.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeOrders(
  userId: string | null,
  isRetailer: boolean,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  let q = query(ordersRef, orderBy('createdAt', 'desc'));

  if (!isRetailer && userId) {
    q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((d) => {
        orders.push({ id: d.id, ...d.data() } as Order);
      });
      // If collection is empty for retailer, fallback to demo seed
      if (orders.length === 0 && isRetailer) {
        onUpdate(INITIAL_DEMO_ORDERS as Order[]);
        seedInitialOrdersIfNeeded();
      } else {
        onUpdate(orders);
      }
    },
    (error) => {
      console.warn('Orders subscription note:', error);
      if (isRetailer) {
        onUpdate(INITIAL_DEMO_ORDERS as Order[]);
      }
      if (onError) onError(error);
    }
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      orderStatus: status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// User Cart Services
export async function saveUserCart(userId: string, items: CartItem[], couponCode?: string): Promise<void> {
  const path = `${CARTS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CARTS_COLLECTION, userId);
    await setDoc(docRef, {
      userId,
      items: items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price
      })),
      couponCode: couponCode || null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    // Non-blocking warning for offline/guest state
    console.warn('Cart sync note:', error);
  }
}

export async function getUserCart(userId: string): Promise<{ items: { productId: string; quantity: number }[]; couponCode?: string } | null> {
  const path = `${CARTS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, CARTS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
    return null;
  } catch (error) {
    console.warn('Cart retrieval note:', error);
    return null;
  }
}

// Product Reviews
export function subscribeReviews(productId: string, onUpdate: (reviews: Review[]) => void): Unsubscribe {
  const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', productId));
  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: Review[] = [];
      snapshot.forEach(d => reviews.push({ id: d.id, ...d.data() } as Review));
      onUpdate(reviews);
    },
    (error) => {
      console.warn('Reviews subscription note:', error);
      onUpdate([]);
    }
  );
}

export async function addReview(review: Omit<Review, 'id'>): Promise<string> {
  const newId = 'rev-' + Date.now();
  const path = `${REVIEWS_COLLECTION}/${newId}`;
  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, newId), { ...review, id: newId });
    return newId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
