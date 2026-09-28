import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, ProductCategory, Order, UserRole } from './types';
import { subscribeProducts } from './services/db-service';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderConfirmationModal } from './components/checkout/OrderConfirmationModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';
import { RetailerDashboard } from './components/retailer/RetailerDashboard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  // Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('customer');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Live Products Catalog
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsub = subscribeProducts((liveProducts) => {
      setProducts(liveProducts);
      // Keep selected product updated if it's currently viewed
      if (selectedProduct) {
        const refreshed = liveProducts.find(p => p.id === selectedProduct.id);
        if (refreshed) setSelectedProduct(refreshed);
      }
    });
    return () => unsub();
  }, [selectedProduct]);

  // Handle URL hash changes or internal routing
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  const handleOpenAuth = (role: UserRole = 'customer') => {
    setAuthDefaultRole(role);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'retailer') {
      // RBAC Security Check
      if (!user) {
        setAuthDefaultRole('retailer');
        setIsAuthModalOpen(true);
        return;
      }
      if (user.role !== 'retailer') {
        // Deny access
        alert('Access Denied: You do not possess Retailer/Admin privileges. Please log in with a Retailer account.');
        setCurrentView('home');
        return;
      }
    }
    setCurrentView(view);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
  };

  const handleNavigateCatalog = (category?: ProductCategory) => {
    setSelectedCategory(category || null);
    setCurrentView('catalog');
  };

  const handleDirectBuyNow = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setLastCompletedOrder(order);
    setIsConfirmationOpen(true);
  };

  // If viewing Retailer Dashboard, render fullscreen dedicated Retailer Workspace
  if (currentView === 'retailer') {
    if (user?.role !== 'retailer') {
      return (
        <div className="min-h-screen bg-[#faf5f8] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Retailer Authentication Required</h2>
            <p className="text-xs text-stone-600">
              This administrative area is strictly restricted to verified GlowCare retail operators. Customer accounts cannot access business analytics or product controls.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleOpenAuth('retailer')}
                className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Sign In with Retailer Credentials
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="py-2.5 px-4 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-medium"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <RetailerDashboard
        onExitToStore={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf5f8] text-stone-900 selection:bg-rose-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigateCatalog={handleNavigateCatalog}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogPage
            products={products}
            onSelectProduct={handleSelectProduct}
            initialCategory={selectedCategory}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onBackToCatalog={() => setCurrentView('catalog')}
            onSelectProduct={handleSelectProduct}
            onDirectBuyNow={handleDirectBuyNow}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryView
            onStartShopping={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'about' && <AboutPage />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'profile' && (
          <ProfilePage
            onViewOrders={() => setCurrentView('orders')}
            onOpenAuth={() => handleOpenAuth('customer')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Shopping Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onOpenAuth={() => handleOpenAuth('customer')}
      />

      {/* Auth Modal (Login / Register / MFA / 2FA / Demo switcher) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      {/* Multi-Step Checkout Modal with Simulated Razorpay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={lastCompletedOrder}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onViewOrders={() => setCurrentView('orders')}
        onContinueShopping={() => setCurrentView('catalog')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
