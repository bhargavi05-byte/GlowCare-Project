import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Sparkles, ShieldCheck, Heart, Award, CheckCircle2, Leaf, FlaskConical } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200/50">
          The GlowCare Philosophy
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Where Clean Science Meets Radiant Skin.
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          GlowCare is a premium skincare e-commerce platform that provides carefully selected skincare products with a convenient and secure online shopping experience, engineered for modern skin resilience.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-8 border-rose-100 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Our Mission</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            To democratize access to dermatological-grade, safe, and transparent skincare formulations. We empower every customer to build an effective daily ritual without confusing jargon or harmful additives.
          </p>
        </GlassCard>

        <GlassCard className="p-8 border-rose-100 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Our Vision</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            To become the premier trusted SaaS e-commerce destination for conscious skincare in India and worldwide—uniting discerning customers with independent, ethical cosmetic labs through real-time technology.
          </p>
        </GlassCard>
      </div>

      {/* Why GlowCare & 4 Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Why Choose GlowCare?
          </h2>
          <p className="text-xs text-stone-500">
            We adhere to rigorous international formulation standards and clinical efficacy benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <GlassCard className="p-6 border-rose-100/70 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 w-fit">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-900">Biocompatible Actives</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We exclusively select ingredients that mirror the skin’s natural lipid structure—such as plant ceramides, squalane, and multi-weight hyaluronic acid.
            </p>
          </GlassCard>

          <GlassCard className="p-6 border-rose-100/70 space-y-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-900">Zero Questionable Chemicals</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every drop is free from sulfates (SLS/SLES), phthalates, mineral oils, synthetic drying alcohols, and artificial dyes.
            </p>
          </GlassCard>

          <GlassCard className="p-6 border-rose-100/70 space-y-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-900">Clinical Quality Promise</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Each batch is stability-tested in certified laboratories under tropical heat and humidity to guarantee potency from day one to the last pump.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
