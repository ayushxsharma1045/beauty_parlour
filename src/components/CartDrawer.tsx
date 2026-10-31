import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Store,
  CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
    totalAmount
  } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState('Durga Beauty Parlour Salon Pickup (Complimentary)');
  const [paymentMethod, setPaymentMethod] = useState<'salon_pickup_cash' | 'online_simulation'>('salon_pickup_cash');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacedData, setOrderPlacedData] = useState<any | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please provide your name and contact phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('durga_auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || null,
          shipping_address: shippingAddress,
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            brand: i.product.brand,
            price: i.product.price,
            quantity: i.quantity,
          })),
          total_amount: totalAmount,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderPlacedData(data);
        clearCart();
        showToast('Order confirmed! We have reserved your beauty products.', 'success');
      } else {
        showToast(data.error || 'Failed to place order.', 'error');
      }
    } catch (err) {
      showToast('Network error while placing order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setIsCheckingOut(false);
    setOrderPlacedData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#D4A5AC]/40">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#541224] text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F4B8C5]" />
            <h3 className="font-serif text-lg font-semibold tracking-wide">
              Your Beauty Bag ({totalCount})
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderPlacedData ? (
            /* Order Placed Confirmation View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FCE7EC] text-[#541224] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#541224]">
                Order Reserved!
              </h4>
              <p className="text-xs text-gray-600">
                Your order reference code is:
              </p>
              <div className="py-2 px-4 bg-[#F8F4EE] rounded-xl inline-block border border-[#D4A5AC]/40 font-mono font-bold text-sm text-[#541224]">
                {orderPlacedData.order_ref}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Total Amount: <strong>₹{orderPlacedData.total_amount}</strong>. You can collect your products directly at Durga Beauty Parlour reception during salon hours.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient"
              >
                Continue Browsing
              </button>
            </div>
          ) : isCheckingOut ? (
            /* Checkout Form */
            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-[#541224] uppercase tracking-wider">
                  Complete Your Order
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-gray-500 hover:text-gray-900 underline"
                >
                  Edit Bag
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Pickup / Delivery Address</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-[#B76E79] bg-[#FDFBF7]">
                    <input
                      type="radio"
                      name="payment"
                      value="salon_pickup_cash"
                      checked={paymentMethod === 'salon_pickup_cash'}
                      onChange={() => setPaymentMethod('salon_pickup_cash')}
                      className="text-[#541224]"
                    />
                    <Store className="w-4 h-4 text-[#B76E79]" />
                    <span>Pay at Salon Counter (Cash / UPI / Card upon pickup)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-[#B76E79] bg-[#FDFBF7]">
                    <input
                      type="radio"
                      name="payment"
                      value="online_simulation"
                      checked={paymentMethod === 'online_simulation'}
                      onChange={() => setPaymentMethod('online_simulation')}
                      className="text-[#541224]"
                    />
                    <CreditCard className="w-4 h-4 text-[#B76E79]" />
                    <span>Online UPI / Card (Demo Verification)</span>
                  </label>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-3 bg-[#F8F4EE] rounded-xl border border-[#D4A5AC]/30 space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Salon Packaging:</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#541224] pt-1 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md"
              >
                {isSubmitting ? 'Placing Order...' : `Confirm Order • ₹${totalAmount}`}
              </button>
            </form>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FCE7EC] mx-auto flex items-center justify-center text-[#541224]">
                <ShoppingBag className="w-8 h-8 text-[#B76E79]" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#541224]">
                Your Beauty Bag is Empty
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our curated collection of cleansers, facial kits, moisturizing creams, and hair elixirs.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl border border-gray-100 hover:border-[#D4A5AC]/50 bg-[#FDFBF7] transition-all"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-[#B76E79] font-medium block">
                        {item.product.brand} • {item.product.size}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-serif text-sm font-bold text-[#541224]">
                        ₹{item.product.price * item.quantity}
                      </span>

                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !isCheckingOut && !orderPlacedData && (
          <div className="p-6 bg-[#FDFBF7] border-t border-[#D4A5AC]/30 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-serif text-xl font-bold text-[#541224]">
                ₹{totalAmount}
              </span>
            </div>
            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
