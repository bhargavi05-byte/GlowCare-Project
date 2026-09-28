import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Sparkles, ShieldCheck, Mail, Lock, User, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'customer',
  initialTab = 'login'
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    verifyMfaOtp,
    resendMfaOtp,
    resetPassword,
    quickLoginDemo,
    isMfaPending,
    mfaExpirySeconds
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isMfaPending) {
        await verifyMfaOtp(otpInput.trim());
        setSuccessMsg('MFA verification successful. Welcome back!');
        setTimeout(() => onClose(), 800);
        return;
      }

      if (tab === 'login') {
        const res = await loginWithEmail(email, password, role);
        if (res.requiresMFA) {
          setDemoOtpHint('Enter the 6-digit code or bypass with 123456');
          setSuccessMsg('Retailer 2FA OTP generated. Check code below.');
        } else {
          setSuccessMsg('Login successful!');
          setTimeout(() => onClose(), 600);
        }
      } else if (tab === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await registerWithEmail(name, email, password, role);
        setSuccessMsg('Account created successfully!');
        setTimeout(() => onClose(), 600);
      } else if (tab === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const code = await resendMfaOtp();
      setDemoOtpHint(`New OTP: ${code} (or enter 123456)`);
      setSuccessMsg('New OTP code sent!');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await quickLoginDemo(demoRole);
      if (demoRole === 'retailer') {
        setDemoOtpHint('Enter 123456 or check system OTP');
      } else {
        setSuccessMsg('Logged in as Customer Demo');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle(role);
      setSuccessMsg('Google authentication successful!');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMfaPending ? 'Two-Factor Authentication' : tab === 'login' ? 'Welcome Back' : tab === 'register' ? 'Join GlowCare' : 'Reset Password'}
      subtitle={
        isMfaPending
          ? 'Enter the 6-digit security code to verify your Retailer privileges'
          : tab === 'login'
          ? 'Sign in to access your skincare cart and personalized orders'
          : tab === 'register'
          ? 'Create your account for exclusive rewards, fast checkout, and routine tracking'
          : 'Enter your email to receive recovery instructions'
      }
    >
      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* MFA OTP Verification View */}
      {isMfaPending ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              A high-security verification code has been dispatched. For rapid testing in demo mode, you may enter <strong className="text-rose-700 font-mono">123456</strong>.
            </p>
            {demoOtpHint && (
              <p className="mt-1.5 text-xs text-stone-500 font-mono bg-white/80 py-1 px-3 rounded-lg border border-stone-200 inline-block">
                {demoOtpHint}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
              6-Digit Security OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="glass-input w-full px-4 py-3 rounded-xl text-center text-2xl font-mono tracking-widest text-stone-800 placeholder-stone-300 font-bold"
              required
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
              <span>
                Expires in: <strong className="font-mono text-rose-600">{Math.floor(mfaExpirySeconds / 60)}:{String(mfaExpirySeconds % 60).padStart(2, '0')}</strong>
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Resend Code
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otpInput.length < 6}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium shadow-md shadow-rose-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Verify & Enter Retailer Suite'}
          </button>
        </form>
      ) : (
        <>
          {/* Tabs header */}
          <div className="flex p-1 mb-6 rounded-xl bg-stone-100/80 border border-stone-200/60">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 to-purple-50/70 border border-rose-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> 1-Click Demo Profiles
              </span>
              <span className="text-[10px] text-stone-400">Pre-configured testing</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="py-1.5 px-2.5 rounded-lg bg-white/90 hover:bg-white text-stone-700 text-xs font-medium border border-rose-200/60 shadow-xs hover:border-rose-400 transition-all text-left flex items-center justify-between"
              >
                <span>🛍️ Customer</span>
                <span className="text-[10px] text-stone-400">Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('retailer')}
                className="py-1.5 px-2.5 rounded-lg bg-white/90 hover:bg-white text-stone-700 text-xs font-medium border border-purple-200/60 shadow-xs hover:border-purple-400 transition-all text-left flex items-center justify-between"
              >
                <span>📊 Retailer</span>
                <span className="text-[10px] text-purple-600 font-semibold">Admin</span>
              </button>
            </div>
          </div>

          {/* Role selector if registering */}
          {tab === 'register' && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                Account Purpose
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                    role === 'customer'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200/50'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  Customer (Shopping)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('retailer')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                    role === 'retailer'
                      ? 'bg-purple-50 border-purple-400 text-purple-800 ring-2 ring-purple-200/50'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  Retailer (Dashboard)
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aanya Sharma"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-stone-800 placeholder-stone-400"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@glowcare.demo"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-stone-800 placeholder-stone-400"
                  required
                />
              </div>
            </div>

            {tab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-stone-800 placeholder-stone-400"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium shadow-md shadow-rose-500/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                'Processing...'
              ) : tab === 'login' ? (
                <>Sign In to Account <ArrowRight className="w-4 h-4" /></>
              ) : tab === 'register' ? (
                <>Create Free Account <ArrowRight className="w-4 h-4" /></>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 px-2 text-stone-400">or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs sm:text-sm font-medium shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Google Account
            </button>
          </div>

          {tab === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
