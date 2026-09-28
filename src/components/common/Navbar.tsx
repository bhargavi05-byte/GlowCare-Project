import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  User,
  Search,
  LogOut,
  Sparkles,
  ShieldAlert,
  Menu,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (role?: 'customer' | 'retailer') => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 border-b border-rose-100/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            G
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-rose-600 transition-colors">
              GlowCare
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-stone-400 font-semibold -mt-1">
              Premium Skincare
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick('home')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'home'
                ? 'text-rose-600 border-b-2 border-rose-500 pb-0.5'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'catalog'
                ? 'text-rose-600 border-b-2 border-rose-500 pb-0.5'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Shop Products
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'about'
                ? 'text-rose-600 border-b-2 border-rose-500 pb-0.5'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              currentView === 'contact'
                ? 'text-rose-600 border-b-2 border-rose-500 pb-0.5'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search Button */}
          <button
            onClick={() => handleNavClick('catalog')}
            className="p-2.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Search products"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Icon with live badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Shopping bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* User Auth / Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-full bg-white/80 hover:bg-white border border-rose-200/60 shadow-2xs transition-all text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 text-white font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block max-w-[100px]">
                  <p className="font-semibold text-stone-800 truncate text-[11px] leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-rose-600 font-bold">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl border border-stone-200 shadow-xl rounded-2xl py-2 z-50 text-xs animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-800 truncate">{user.name}</p>
                    <p className="text-stone-400 text-[10px] truncate">{user.email}</p>
                  </div>

                  {user.role === 'retailer' && (
                    <button
                      onClick={() => onNavigate('retailer')}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-700 font-semibold flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Retailer Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('orders')}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-stone-700 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                    <span>My Skincare Orders</span>
                  </button>

                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Profile & Addresses</span>
                  </button>

                  <div className="my-1 border-t border-stone-100" />

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('customer')}
                className="py-2 px-3.5 rounded-xl text-stone-700 hover:text-stone-900 text-xs font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('customer')}
                className="hidden sm:flex py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors items-center gap-1.5"
              >
                <span>Get Started</span>
              </button>
            </div>
          )}

          {/* Retailer Portal Shortcut Button */}
          <button
            onClick={() => {
              if (user && user.role === 'retailer') {
                onNavigate('retailer');
              } else {
                onOpenAuth('retailer');
              }
            }}
            className="hidden lg:flex py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-bold tracking-tight items-center gap-1.5 transition-colors"
            title="Retailer Management Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Retailer Hub</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-rose-100 p-5 space-y-3">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left py-2 font-medium text-stone-800 text-sm"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className="w-full text-left py-2 font-medium text-stone-800 text-sm"
          >
            Shop Products
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left py-2 font-medium text-stone-800 text-sm"
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="w-full text-left py-2 font-medium text-stone-800 text-sm"
          >
            Contact Us
          </button>
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                if (user?.role === 'retailer') onNavigate('retailer');
                else onOpenAuth('retailer');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold text-center block"
            >
              Retailer Management Hub
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
