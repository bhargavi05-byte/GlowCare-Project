import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import { subscribeOrders } from '../../services/db-service';
import { GlassCard } from '../common/GlassCard';
import {
  Package,
  Calendar,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

const ORDER_STATUS_STEPS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

interface OrderHistoryViewProps {
  onStartShopping: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onStartShopping }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeOrders(user.id, user.role === 'retailer', (liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
      if (liveOrders.length > 0 && !expandedOrderId) {
        setExpandedOrderId(liveOrders[0].id);
      }
    });

    return () => unsub();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <GlassCard className="max-w-md mx-auto p-8 text-center">
          <Package className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-serif font-bold text-stone-900">Sign in to view your orders</h2>
          <p className="text-xs text-stone-500 mt-1 mb-5">
            Log in to monitor live delivery tracking and review order receipts.
          </p>
          <button
            onClick={onStartShopping}
            className="py-2.5 px-6 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
          >
            Explore Catalog
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time fulfillment timeline and purchase records
          </p>
        </div>

        <button
          onClick={onStartShopping}
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-white/80 hover:bg-white border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs transition-all"
        >
          Browse More Skincare
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-white/50 animate-pulse border border-white" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Package className="w-12 h-12 text-rose-300 mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-stone-800">No Orders Yet</h3>
          <p className="text-xs text-stone-500 mt-1 mb-6 max-w-sm mx-auto">
            You haven't placed any orders yet. Discover our award-winning serums and cleansers.
          </p>
          <button
            onClick={onStartShopping}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 hover:opacity-95"
          >
            Start Shopping
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = getStepIndex(order.orderStatus);

            return (
              <GlassCard key={order.id} className="overflow-hidden border border-rose-100/80 shadow-md">
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-700">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.items.reduce((s, i) => s + i.quantity, 0)} Items</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-stone-400 block">Total Amount</span>
                      <span className="text-base font-bold text-stone-900 font-serif">
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <button className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-rose-100/60 bg-white/40 space-y-6">
                    {/* Live Tracking Timeline */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-rose-500" />
                        Fulfillment Timeline
                      </h4>

                      {order.orderStatus === 'Cancelled' ? (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>This order was cancelled. Payment refund will reflect in 3-5 banking days.</span>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Horizontal step line */}
                          <div className="hidden sm:block absolute top-3.5 left-4 right-4 h-0.5 bg-stone-200 -z-0" />
                          
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 relative z-10">
                            {ORDER_STATUS_STEPS.map((stepName, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;

                              return (
                                <div key={stepName} className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                                        : 'bg-stone-200 text-stone-400'
                                    } ${isCurrent ? 'ring-4 ring-rose-200 font-bold bg-rose-500 text-white' : ''}`}
                                  >
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                  </div>
                                  <span
                                    className={`text-[10px] sm:text-[11px] mt-2 font-medium leading-tight ${
                                      isCurrent
                                        ? 'text-rose-600 font-bold'
                                        : isCompleted
                                        ? 'text-stone-800'
                                        : 'text-stone-400'
                                    }`}
                                  >
                                    {stepName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ordered Items List */}
                    <div>
                      <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Products Ordered
                      </h4>
                      <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl bg-white/80 overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-100"
                              />
                              <div>
                                <h5 className="text-xs font-semibold text-stone-900">{item.productName}</h5>
                                <p className="text-[11px] text-stone-500">{item.brand}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <span className="text-stone-400 block">
                                Qty: {item.quantity} × ₹{item.price}
                              </span>
                              <span className="font-bold text-stone-900">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                      <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" /> Delivery Address
                        </span>
                        <p className="font-medium text-stone-800">{order.customerName}</p>
                        <p className="text-stone-600">{order.shippingAddress}</p>
                        <p className="text-stone-500 text-[11px]">Phone: {order.customerPhone}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-500" /> Payment & Receipt
                        </span>
                        <div className="flex justify-between">
                          <span>Method:</span>
                          <span className="font-semibold text-stone-800">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="font-mono text-[11px] text-stone-700">{order.paymentId}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-stone-100">
                          <span>Payment Status:</span>
                          <span>{order.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
