import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Heart, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubmitted(false), 5000);
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Promise Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800 text-center">
          <div className="space-y-1">
            <span className="text-xl">🌿</span>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Clean & Vegan</h4>
            <p className="text-[11px] text-stone-400">Zero parabens, toxins or sulfates</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl">🔬</span>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Clinical Actives</h4>
            <p className="text-[11px] text-stone-400">Dermatologist approved efficacy</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl">🐰</span>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">100% Cruelty-Free</h4>
            <p className="text-[11px] text-stone-400">PETA certified ethical formulas</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl">🇮🇳</span>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Formulated for Indian Skin</h4>
            <p className="text-[11px] text-stone-400">Tackles tropical weather & barrier stress</p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-12 border-b border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Exclusive Skincare Club
            </span>
            <h3 className="text-xl font-serif font-bold text-white">
              Unlock 15% off your first skincare routine
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Get dermatologist tips, ingredient analyses, and early access to drops. Use code <strong>GLOW15</strong>.
            </p>
          </div>

          <div className="w-full lg:w-96">
            {newsletterSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Welcome to the Glow Club! Check your inbox for code GLOW15.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-400 flex-1 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white font-serif font-bold text-base">
                G
              </div>
              <span className="text-lg font-serif font-bold text-white tracking-tight">
                GlowCare
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-sm text-[11px]">
              GlowCare is a premium skincare e-commerce platform and retailer ecosystem delivering clinical-grade formulations with transparency, glassmorphism aesthetics, and uncompromising safety.
            </p>
            <div className="flex gap-4 text-stone-400 text-sm">
              <span className="hover:text-white cursor-pointer">Instagram</span>
              <span className="hover:text-white cursor-pointer">YouTube</span>
              <span className="hover:text-white cursor-pointer">LinkedIn</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[10px]">Categories</h4>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white">Vitamin C & Brightening</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white">Hydration & Barrier</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white">Mineral Sunscreens</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white">Gentle Foaming Cleansers</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-white">Overnight Exfoliants</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-2 text-stone-400">
              <li><button onClick={() => onNavigate('about')} className="hover:text-white">Our Heritage</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white">Clinical Research</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white">Dermatologist Helpline</button></li>
              <li><button onClick={() => onNavigate('retailer')} className="hover:text-white text-purple-400 font-semibold">Retailer Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[10px]">Customer Care</h4>
            <ul className="space-y-2 text-stone-400">
              <li><span className="text-stone-300">Mumbai HQ:</span> BKC, Bandra East</li>
              <li><span className="text-stone-300">Hotline:</span> +91 800-GLOW-CARE</li>
              <li><span className="text-stone-300">Email:</span> support@glowcare.demo</li>
              <li><button onClick={() => onNavigate('orders')} className="hover:text-white text-rose-400 font-medium">Track Order</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment security */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} GlowCare – Premium Skincare SaaS & E-commerce. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Razorpay 256-bit Secure Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
