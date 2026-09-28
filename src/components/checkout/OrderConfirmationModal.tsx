import React from 'react';
import { Modal } from '../common/Modal';
import { Order } from '../../types';
import { CheckCircle2, PackageCheck, MapPin, CreditCard, ArrowRight, ShoppingBag } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewOrders,
  onContinueShopping
}) => {
  if (!isOpen || !order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="text-center py-2">
        {/* Animated Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Thank You for Your Order!
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Your skincare ritual is being crafted. A confirmation and tracking receipt has been registered.
        </p>

        {/* Order Details Card */}
        <div className="mt-6 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-left space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                Order Reference
              </span>
              <span className="text-sm font-mono font-bold text-rose-600">
                {order.id}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5" /> Confirmed
            </span>
          </div>

          {/* Items preview */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-medium truncate">{item.productName}</p>
                  <p className="text-stone-400 text-[10px]">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <span className="font-semibold text-stone-800">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Address & Payment summary */}
          <div className="pt-2 border-t border-stone-200/60 text-xs text-stone-600 space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span className="truncate">{order.shippingAddress}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1 text-stone-500">
                <CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod} • ID: {order.paymentId.slice(0, 14)}...
              </span>
              <span className="font-bold text-stone-900 text-sm">
                Total Paid: ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Track Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onClose();
              onContinueShopping();
            }}
            className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop More</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
