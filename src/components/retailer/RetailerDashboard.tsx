import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product, Order, OrderStatus, ProductCategory, SkinType } from '../../types';
import {
  subscribeProducts,
  subscribeOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus
} from '../../services/db-service';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Boxes,
  LineChart,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  IndianRupee,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

type DashboardTab = 'overview' | 'products' | 'orders' | 'customers' | 'inventory' | 'analytics' | 'settings';

interface RetailerDashboardProps {
  onExitToStore: () => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ onExitToStore }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Real-time Firestore State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Product Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Selected Order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form State for Add/Edit Product
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'GlowCare Pure',
    category: 'Serums' as ProductCategory,
    price: 999,
    discount: 10,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    description: '',
    ingredients: '',
    benefits: '',
    skinType: 'All Skin Types' as SkinType,
    howToUse: '',
    isFeatured: false,
    isBestSeller: false
  });

  // Settings state
  const [retailerSettings, setRetailerSettings] = useState({
    storeName: 'GlowCare Luxury Cosmetics India',
    gstin: '27AABCG1234F1Z5',
    supportEmail: 'care@glowcare.demo',
    supportPhone: '+91 800-456-9900',
    razorpayKeyId: 'rzp_test_GlowCareDemoKey99',
    freeShippingThreshold: 999
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubProducts = subscribeProducts((liveProducts) => {
      setProducts(liveProducts);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsLoading(false);
    });

    const unsubOrders = subscribeOrders(null, true, (liveOrders) => {
      setOrders(liveOrders);
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // Real-time Aggregated Metrics
  const totalSales = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const totalOrders = orders.length;

  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; totalSpent: number; ordersCount: number }>();
    orders.forEach((o) => {
      const key = o.customerEmail || o.userId;
      if (!map.has(key)) {
        map.set(key, {
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          totalSpent: o.totalAmount,
          ordersCount: 1
        });
      } else {
        const item = map.get(key)!;
        item.totalSpent += o.totalAmount;
        item.ordersCount += 1;
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= 10);
  }, [products]);

  const averageOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalSales / (orders.filter(o => o.paymentStatus === 'Paid').length || 1));
  }, [orders, totalSales]);

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'GlowCare Pure',
      category: 'Serums',
      price: 999,
      discount: 10,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      description: 'Handcrafted botanical formulation with clinical grade actives for youthful skin.',
      ingredients: 'Aqua, Niacinamide, Sodium Hyaluronate, Botanical Extracts.',
      benefits: 'Hydrates deeply, refines pores, and imparts natural glow.',
      skinType: 'All Skin Types',
      howToUse: 'Apply 3 drops onto clean skin morning and evening.',
      isFeatured: false,
      isBestSeller: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      discount: prod.discount,
      stock: prod.stock,
      imageUrl: prod.imageUrl,
      description: prod.description,
      ingredients: prod.ingredients,
      benefits: prod.benefits,
      skinType: prod.skinType,
      howToUse: prod.howToUse,
      isFeatured: !!prod.isFeatured,
      isBestSeller: !!prod.isBestSeller
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...productForm,
          price: Number(productForm.price),
          discount: Number(productForm.discount),
          stock: Number(productForm.stock)
        });
      } else {
        await addProduct({
          ...productForm,
          price: Number(productForm.price),
          discount: Number(productForm.discount),
          stock: Number(productForm.stock),
          rating: 5.0,
          ratingCount: 1,
          createdAt: new Date().toISOString()
        });
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert('Error updating product catalog: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateProduct(productId, { stock: Math.max(0, newStock) });
    } catch (err: any) {
      alert('Error updating stock: ' + err.message);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err: any) {
      alert('Error updating order status: ' + err.message);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, categoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Category Breakdown for Analytics
  const categoryStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#fcf8fa] flex flex-col md:flex-row text-stone-800">
      
      {/* RETAILER SIDEBAR */}
      <aside className="w-full md:w-64 bg-white/80 backdrop-blur-2xl border-r border-rose-100/80 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-rose-100/60 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-rose-500/20">
              GC
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900 tracking-tight">GlowCare</h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">
                Retailer Hub
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Boxes className="w-4 h-4" />
                <span>Inventory</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                  {lowStockProducts.length} low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'customers'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Real-time Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="pt-6 border-t border-rose-100/60 space-y-2">
          {/* Customer Store Switcher */}
          <button
            onClick={onExitToStore}
            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100/80 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5 text-rose-700 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firestore Live Sync</span>
            </div>
            <p className="text-[10px] text-stone-400">Synced at: {lastSyncTime}</p>
          </div>

          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        
        {/* Top Header bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 capitalize">
              {activeTab === 'overview' ? 'Retailer Command Center' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Welcome back, <strong>{user?.name || 'Retail Partner'}</strong> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddProduct}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skincare Product</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 5 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <GlassCard className="p-4 border-rose-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Total Revenue
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    ₹{totalSales.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% this month
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Total Orders
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {totalOrders}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    Avg Order: ₹{averageOrderValue}
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Total Customers
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {uniqueCustomers.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                    +100% Verified accounts
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Catalog Items
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    {products.length}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    7 Active Categories
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Low Stock Alert
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-rose-600">
                    {lowStockProducts.length}
                  </span>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                    {lowStockProducts.length > 0 ? 'Needs restock (<10 units)' : 'All healthy'}
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Quick Chart Preview & Live Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Live Revenue Spark Glass Card */}
              <GlassCard className="lg:col-span-2 p-6 border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-stone-900">
                      Real-time Revenue Velocity
                    </h3>
                    <p className="text-xs text-stone-400">
                      Live Firestore sales aggregation updated per order
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Deep Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Glassmorphic SVG Area Chart */}
                <div className="h-52 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="glowRevGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f1e6eb" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#f1e6eb" strokeDasharray="3 3" />
                    <line x1="0" y1="130" x2="500" y2="130" stroke="#f1e6eb" strokeDasharray="3 3" />

                    {/* Shaded Area */}
                    <path
                      d="M 10 130 Q 80 110, 150 90 T 280 60 T 390 40 T 490 20 L 490 145 L 10 145 Z"
                      fill="url(#glowRevGrad)"
                    />
                    {/* Glowing Stroke */}
                    <path
                      d="M 10 130 Q 80 110, 150 90 T 280 60 T 390 40 T 490 20"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="3"
                    />

                    {/* Data Points */}
                    <circle cx="150" cy="90" r="4" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
                    <circle cx="280" cy="60" r="4" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
                    <circle cx="390" cy="40" r="4" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
                    <circle cx="490" cy="20" r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Today (Live)</span>
                  </div>
                </div>
              </GlassCard>

              {/* Low Stock Watchlist */}
              <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-stone-900">
                    Stock Replenishment
                  </h3>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                    {lowStockProducts.length} items
                  </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      All inventory levels are above safe thresholds.
                    </div>
                  ) : (
                    lowStockProducts.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-white/70 border border-amber-200/60 flex items-center justify-between gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-amber-700 font-bold">Only {p.stock} units remaining</p>
                        </div>
                        <button
                          onClick={() => handleQuickStockUpdate(p.id, p.stock + 20)}
                          className="py-1 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-semibold"
                        >
                          +20 Stock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Recent Orders Overview */}
            <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-bold text-stone-900">
                    Live Inbound Customer Orders
                  </h3>
                  <p className="text-xs text-stone-400">
                    Instant status updating synchronizes with customer tracking timeline
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Manage All Orders <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Payment</th>
                      <th className="pb-3 font-semibold">Fulfillment Status</th>
                      <th className="pb-3 font-semibold text-right">Quick Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/50">
                        <td className="py-3 font-mono font-bold text-rose-700">
                          {ord.id}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-stone-800">{ord.customerName}</p>
                          <p className="text-[10px] text-stone-400">{ord.city}</p>
                        </td>
                        <td className="py-3 text-stone-600">
                          {ord.items.length} items
                        </td>
                        <td className="py-3 font-bold text-stone-900">
                          ₹{ord.totalAmount}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className="text-[11px] bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-700 font-medium focus:ring-1 focus:ring-rose-400"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS MANAGEMENT ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title or brand..."
                    className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs text-stone-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Face Care">Face Care</option>
                  <option value="Cleansers">Cleansers</option>
                  <option value="Moisturizers">Moisturizers</option>
                  <option value="Serums">Serums</option>
                  <option value="Sunscreens">Sunscreens</option>
                  <option value="Masks">Masks</option>
                  <option value="Body Care">Body Care</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <GlassCard className="p-6 border-rose-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price (₹)</th>
                      <th className="pb-3 font-semibold">Stock Units</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/60">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                          />
                          <div>
                            <p className="font-bold text-stone-900">{p.name}</p>
                            <p className="text-[10px] text-stone-400">{p.brand} • {p.skinType}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/50 text-rose-700 text-[10px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-stone-900">
                          ₹{p.price}
                          {p.discount > 0 && (
                            <span className="text-[10px] text-rose-500 ml-1">
                              (-{p.discount}%)
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${p.stock <= 10 ? 'text-amber-600' : 'text-stone-800'}`}>
                              {p.stock}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleQuickStockUpdate(p.id, p.stock + 10)}
                                className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[10px] text-stone-600"
                                title="Add 10 units"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          {p.stock > 10 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              In Stock
                            </span>
                          ) : p.stock > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
                              Sold Out
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(p);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 3: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID, customer, email..."
                    className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="glass-input px-3 py-2 rounded-xl text-xs text-stone-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <GlassCard className="p-6 border-rose-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Delivery Location</th>
                      <th className="pb-3 font-semibold">Total (₹)</th>
                      <th className="pb-3 font-semibold">Status Pipeline</th>
                      <th className="pb-3 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/60">
                        <td className="py-3 font-mono font-bold text-rose-700">
                          {ord.id}
                        </td>
                        <td className="py-3 text-stone-500">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-stone-800">{ord.customerName}</p>
                          <p className="text-[10px] text-stone-400">{ord.customerEmail}</p>
                        </td>
                        <td className="py-3 text-stone-600">
                          {ord.city}, {ord.state}
                        </td>
                        <td className="py-3 font-bold text-stone-900">
                          ₹{ord.totalAmount}
                        </td>
                        <td className="py-3">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className="text-[11px] bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-700 font-medium focus:ring-1 focus:ring-rose-400"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="py-1 px-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 4: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <GlassCard className="p-6 border-rose-100 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-stone-900 mb-4">
                Verified Customer Directory ({uniqueCustomers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold">Orders Placed</th>
                      <th className="pb-3 font-semibold text-right">Lifetime Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {uniqueCustomers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-white/60">
                        <td className="py-3 font-semibold text-stone-900">{c.name}</td>
                        <td className="py-3 text-stone-600 font-mono text-[11px]">{c.email}</td>
                        <td className="py-3 text-stone-500">{c.phone || '+91 98765 00000'}</td>
                        <td className="py-3 text-stone-700">{c.ordersCount} orders</td>
                        <td className="py-3 text-right font-bold text-stone-900 font-serif">
                          ₹{c.totalSpent.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 5: INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard className="p-4 border-rose-100">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Total SKU Units
                </span>
                <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  {products.reduce((s, p) => s + p.stock, 0)} Units
                </p>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Low Stock Warning
                </span>
                <p className="text-2xl font-serif font-bold text-amber-600 mt-1">
                  {lowStockProducts.length} Products
                </p>
              </GlassCard>

              <GlassCard className="p-4 border-rose-100">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                  Estimated Stock Value
                </span>
                <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
                  ₹{products.reduce((s, p) => s + p.price * p.stock, 0).toLocaleString('en-IN')}
                </p>
              </GlassCard>
            </div>

            <GlassCard className="p-6 border-rose-100 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-stone-900 mb-4">
                Inventory Units & Restock Operations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Units Remaining</th>
                      <th className="pb-3 font-semibold">Stock Health</th>
                      <th className="pb-3 font-semibold text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/60">
                        <td className="py-3 font-medium text-stone-900 flex items-center gap-2">
                          <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span>{p.name}</span>
                        </td>
                        <td className="py-3 text-stone-600">{p.category}</td>
                        <td className="py-3 font-mono font-bold text-stone-900">{p.stock}</td>
                        <td className="py-3">
                          <div className="w-32 bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                p.stock > 20
                                  ? 'bg-emerald-500'
                                  : p.stock > 10
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock + 15)}
                            className="py-1 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-semibold"
                          >
                            +15 Restock
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock + 50)}
                            className="py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-semibold"
                          >
                            +50 Bulk
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 6: REAL-TIME ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Sales Distribution */}
              <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Sales Distribution by Skincare Category
                </h3>
                <div className="space-y-3">
                  {categoryStats.map(([cat, count]) => {
                    const pct = Math.round((count / (products.length || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-stone-700">
                          <span>{cat}</span>
                          <span className="font-mono text-stone-400">{count} products ({pct}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Order Status Breakdown */}
              <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Fulfillment Pipeline Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((st) => {
                    const count = orders.filter((o) => o.orderStatus === st).length;
                    return (
                      <div key={st} className="p-3.5 rounded-2xl bg-white/70 border border-rose-100/70 text-center">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                          {st}
                        </span>
                        <span className="text-xl font-serif font-bold text-stone-900 mt-1 block">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* Top-Selling Skincare Leaderboard */}
            <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Top-Selling Skincare Products Leaderboard
              </h3>
              <div className="space-y-3">
                {products.slice(0, 4).map((p, idx) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-white/60 border border-stone-200/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold text-stone-900">{p.name}</p>
                        <p className="text-[11px] text-stone-400">{p.brand} • ★ {p.rating}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-stone-900">₹{p.price}</span>
                      <span className="text-emerald-600 block text-[10px]">High Velocity</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ================= TAB 7: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <GlassCard className="p-6 border-rose-100 shadow-sm space-y-4">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Retailer Business Configuration
              </h3>

              {settingsSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Store settings updated successfully!</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Store Brand Name</label>
                  <input
                    type="text"
                    value={retailerSettings.storeName}
                    onChange={(e) => setRetailerSettings({ ...retailerSettings, storeName: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={retailerSettings.gstin}
                      onChange={(e) => setRetailerSettings({ ...retailerSettings, gstin: e.target.value })}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      value={retailerSettings.freeShippingThreshold}
                      onChange={(e) => setRetailerSettings({ ...retailerSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Razorpay API Key ID (Sandbox/Production)</label>
                  <input
                    type="text"
                    value={retailerSettings.razorpayKeyId}
                    onChange={(e) => setRetailerSettings({ ...retailerSettings, razorpayKeyId: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Secured through server-side authorization headers. Client will execute payment modal.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSettingsSavedMsg(true);
                      setTimeout(() => setSettingsSavedMsg(false), 2500);
                    }}
                    className="py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Skincare Product' : 'Add New Skincare Product'}
        subtitle="Configure product information, pricing, formulas, and stock"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Luminous Peptide Eye Cream"
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                placeholder="GlowCare Pure"
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category *</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              >
                <option value="Face Care">Face Care</option>
                <option value="Cleansers">Cleansers</option>
                <option value="Moisturizers">Moisturizers</option>
                <option value="Serums">Serums</option>
                <option value="Sunscreens">Sunscreens</option>
                <option value="Masks">Masks</option>
                <option value="Body Care">Body Care</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Price in INR (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Stock Units *</label>
              <input
                type="number"
                required
                min={0}
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Skin Type *</label>
              <select
                value={productForm.skinType}
                onChange={(e) => setProductForm({ ...productForm, skinType: e.target.value as SkinType })}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              >
                <option value="All Skin Types">All Skin Types</option>
                <option value="Oily">Oily</option>
                <option value="Dry">Dry</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Discount %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={productForm.discount}
                onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Product Image URL *</label>
            <input
              type="url"
              required
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Active Ingredients</label>
              <input
                type="text"
                value={productForm.ingredients}
                onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                placeholder="Niacinamide, Hyaluronic Acid..."
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Key Skin Benefits</label>
              <input
                type="text"
                value={productForm.benefits}
                onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                placeholder="Fades dark spots, hydrates..."
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.isBestSeller}
                onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-stone-700 font-medium">Highlight as Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productForm.isFeatured}
                onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-stone-700 font-medium">Feature on Homepage</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-md shadow-rose-500/20"
            >
              {editingProduct ? 'Save Product Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Product Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-stone-600">
            Are you sure you want to remove <strong>{productToDelete?.name}</strong> from the GlowCare catalog? This action will permanently remove it from Firestore.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="py-2 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>

      {/* ORDER DETAILS RECEIPT MODAL */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.id}`}
        subtitle={`Placed on ${selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : ''}`}
        maxWidth="max-w-lg"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <p className="font-bold text-stone-900">{selectedOrder.customerName}</p>
              <p className="text-stone-500">{selectedOrder.customerEmail} • {selectedOrder.customerPhone}</p>
              <p className="text-stone-600 pt-1">{selectedOrder.shippingAddress}</p>
            </div>

            <div>
              <h4 className="font-semibold text-stone-700 mb-2 uppercase tracking-wider text-[10px]">Ordered Items</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={item.imageUrl} alt={item.productName} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-stone-900">{item.productName}</p>
                        <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
              <span>Grand Total</span>
              <span className="text-rose-600 font-serif">₹{selectedOrder.totalAmount}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
