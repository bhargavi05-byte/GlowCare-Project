import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { User, Mail, Phone, MapPin, Package, Shield, Save, CheckCircle2, LogOut } from 'lucide-react';

interface ProfilePageProps {
  onViewOrders: () => void;
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onViewOrders, onOpenAuth }) => {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [defaultAddress, setDefaultAddress] = useState('Flat 402, Lotus Tower, Indiranagar, Bengaluru, Karnataka 560038');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <GlassCard className="max-w-md mx-auto p-8">
          <User className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-stone-900">Member Sign In Required</h2>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            Please log in or register to manage your personal details and delivery addresses.
          </p>
          <button
            onClick={onOpenAuth}
            className="py-2.5 px-6 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
          >
            Sign In / Register
          </button>
        </GlassCard>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Card */}
      <GlassCard className="p-6 border-rose-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white font-serif font-bold text-3xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-stone-500">{user.email}</p>
          <p className="text-[11px] text-stone-400">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={onViewOrders}
          className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-center sm:self-start"
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
        </button>
      </GlassCard>

      {/* Edit Form */}
      <GlassCard className="p-8 border-rose-100 shadow-md space-y-6">
        <h2 className="text-lg font-serif font-bold text-stone-900">
          Personal Information & Addresses
        </h2>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and delivery address updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email (Account ID)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="bg-stone-100/80 border border-stone-200 text-stone-500 w-full pl-10 pr-4 py-2.5 rounded-xl text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile Contact</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Primary Delivery Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={logout}
              className="py-2.5 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
