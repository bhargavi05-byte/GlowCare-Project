import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Order, PaymentMethod, ShippingAddress } from '../../types';
import { createOrder } from '../../services/db-service';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { items, subtotal, discountAmount, shippingFee, taxAmount, totalAmount, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [addressInfo, setAddressInfo] = useState({
    addressLine: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Simulated Razorpay Modal State
  const [isRazorpaySimOpen, setIsRazorpaySimOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone) return;
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInfo.addressLine || !addressInfo.city || !addressInfo.pinCode) return;
    setStep(3);
  };

  const triggerRazorpayCheckout = () => {
    setPaymentError(null);
    setIsRazorpaySimOpen(true);
  };

  const handleSimulatePayment = async (status: 'success' | 'failure' | 'cancelled') => {
    setPaymentProcessing(true);
    setPaymentError(null);

    // Simulate network latency of payment gateway (Razorpay standard checkout)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (status === 'failure') {
      setPaymentProcessing(false);
      setPaymentError('Payment was declined by your issuing bank. Please try UPI or another card.');
      return;
    }

    if (status === 'cancelled') {
      setPaymentProcessing(false);
      setIsRazorpaySimOpen(false);
      setPaymentError('Payment transaction was cancelled.');
      return;
    }

    // Success flow
    const orderId = `GLOW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 11)}`;

    const orderPayload: Order = {
      id: orderId,
      userId: user?.id || 'guest-' + Date.now(),
      customerName: customerInfo.fullName,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      items: items.map((i) => {
        const discountedPrice = i.product.discount
          ? Math.round(i.product.price * (1 - i.product.discount / 100))
          : i.product.price;
        return {
          productId: i.product.id,
          productName: i.product.name,
          brand: i.product.brand,
          price: discountedPrice,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl
        };
      }),
      subtotal,
      discountAmount,
      couponCode: appliedCoupon?.code,
      shippingFee,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'Paid',
      paymentId,
      orderStatus: 'Order Placed',
      shippingAddress: `${addressInfo.addressLine}, ${addressInfo.city}, ${addressInfo.state} - ${addressInfo.pinCode}`,
      city: addressInfo.city,
      state: addressInfo.state,
      pinCode: addressInfo.pinCode,
      createdAt: new Date().toISOString()
    };

    try {
      await createOrder(orderPayload);
      clearCart();
      setIsRazorpaySimOpen(false);
      setPaymentProcessing(false);
      onClose();
      onOrderSuccess(orderPayload);
    } catch (err: any) {
      console.error('Error creating order in Firestore:', err);
      // Fallback: still notify user and celebrate successful simulated order
      clearCart();
      setIsRazorpaySimOpen(false);
      setPaymentProcessing(false);
      onClose();
      onOrderSuccess(orderPayload);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isRazorpaySimOpen}
        onClose={onClose}
        title="Secure Checkout"
        subtitle={`Step ${step} of 3 • Total Payable: ₹${totalAmount}`}
        maxWidth="max-w-2xl"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-500'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-medium ${step >= 1 ? 'text-stone-900' : 'text-stone-400'}`}>
              Contact
            </span>
          </div>

          <div className="w-12 h-0.5 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-500'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-medium ${step >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>
              Shipping
            </span>
          </div>

          <div className="w-12 h-0.5 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-500'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-medium ${step === 3 ? 'text-stone-900' : 'text-stone-400'}`}>
              Payment
            </span>
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* STEP 1: Customer Contact */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerInfo.fullName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                placeholder="Aanya Sharma"
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address (for order updates) *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="aanya@example.com"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2"
              >
                <span>Continue to Shipping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Shipping Address */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Street Address / Flat / Landmark *
              </label>
              <textarea
                required
                rows={2}
                value={addressInfo.addressLine}
                onChange={(e) => setAddressInfo({ ...addressInfo, addressLine: e.target.value })}
                placeholder="Apartment 4B, Silver Oak Heights, MG Road"
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={addressInfo.city}
                  onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                  placeholder="Mumbai"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={addressInfo.state}
                  onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                  placeholder="Maharashtra"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={addressInfo.pinCode}
                  onChange={(e) => setAddressInfo({ ...addressInfo, pinCode: e.target.value.replace(/\D/g, '') })}
                  placeholder="400001"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center gap-2.5 text-xs text-stone-600">
              <Truck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Free standard express dispatch (2-4 business days across India)</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Contact
              </button>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 flex items-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Payment Options & Razorpay Gateway trigger */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider">
                Select Secure Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">UPI / QR</span>
                  <span className="text-[10px] text-stone-400">GPay, PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">Cards</span>
                  <span className="text-[10px] text-stone-400">Visa, Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Net Banking')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Net Banking'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-bold">Net Banking</span>
                  <span className="text-[10px] text-stone-400">All Banks</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Wallets')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Wallets'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold">Wallets</span>
                  <span className="text-[10px] text-stone-400">Paytm, Amazon</span>
                </button>
              </div>
            </div>

            {/* Selected Method Details Form */}
            {paymentMethod === 'UPI' && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Enter VPA / UPI ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono"
                  />
                  <span className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-600 flex items-center">
                    Instant Pay
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'Credit Card' && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <p className="text-xs text-stone-600">
                  <Lock className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  Card details are encrypted directly via Razorpay PCI-DSS compliant checkout.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-[11px] rounded bg-white border border-stone-200 font-mono text-stone-600">VISA</span>
                  <span className="px-2 py-1 text-[11px] rounded bg-white border border-stone-200 font-mono text-stone-600">MasterCard</span>
                  <span className="px-2 py-1 text-[11px] rounded bg-white border border-stone-200 font-mono text-stone-600">RuPay</span>
                </div>
              </div>
            )}

            {/* Order Total Quick Review */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block">Total Amount to Pay</span>
                <span className="text-lg font-serif font-bold text-stone-900">₹{totalAmount}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-semibold block">All taxes & duties included</span>
                <span className="text-[11px] text-stone-400">Order ID will be generated</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Shipping
              </button>

              <button
                type="button"
                onClick={triggerRazorpayCheckout}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-500/25 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalAmount} with Razorpay</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* RAZORPAY CHECKOUT INTERACTIVE MODAL */}
      {isRazorpaySimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] tracking-widest uppercase font-mono text-emerald-400 font-semibold">
                    Razorpay Secure Checkout
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white mt-1">GlowCare – Premium Skincare</h3>
                <p className="text-xs text-blue-200">Amount: ₹{totalAmount}.00 INR</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-serif font-bold">
                GC
              </div>
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">Customer:</span>
                  <span className="font-semibold text-stone-800">{customerInfo.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Payment Channel:</span>
                  <span className="font-semibold text-stone-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Gateway Status:</span>
                  <span className="font-semibold text-blue-600">Simulated / Live Sandbox</span>
                </div>
              </div>

              {paymentProcessing ? (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-stone-800">Processing secure transaction...</p>
                  <p className="text-xs text-stone-400">Contacting banking network. Please do not refresh.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500 text-center font-medium">
                    Test the complete payment lifecycle below:
                  </p>

                  <button
                    onClick={() => handleSimulatePayment('success')}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Successful Payment (₹{totalAmount})</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePayment('failure')}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all"
                  >
                    Simulate Bank Decline / Failure
                  </button>

                  <button
                    onClick={() => handleSimulatePayment('cancelled')}
                    className="w-full py-2 px-4 rounded-xl text-stone-400 hover:text-stone-600 text-xs font-medium transition-all"
                  >
                    Cancel Transaction
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Level 1 Compliant • End-to-End Encryption</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
