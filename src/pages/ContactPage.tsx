import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200/50">
          We are here for you
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Get in Touch with GlowCare
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have questions about skincare ingredients, order delivery, or retail partnerships? Our dermatological care specialists are available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 border-rose-100 shadow-sm space-y-6">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Corporate Headquarters & Hub
            </h3>

            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-stone-900 block">Flagship Office</strong>
                  <span>GlowCare Tower, Suite 701, G-Block, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-stone-900 block">Email Inquiries</strong>
                  <span>Customer Support: care@glowcare.demo</span>
                  <span className="block text-stone-400">Retailer Partnerships: retailer@glowcare.demo</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-stone-900 block">Toll-Free Helpline</strong>
                  <span>+91 800-456-9900 (Mon - Sun: 9 AM - 9 PM IST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-stone-900 block">Live Chat & Response Time</strong>
                  <span>Average response time within 15 minutes</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 border-rose-100 shadow-md">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
              Send us a Message
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Fill in your inquiry details below and our team will get back to you promptly.
            </p>

            {submitted && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been received. Our skincare advisor will reply shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Priya Nair"
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="priya@example.com"
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Message or Query *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you need assistance with..."
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
