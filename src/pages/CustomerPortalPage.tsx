import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Edit2
} from 'lucide-react';
import { Appointment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CustomerPortalPageProps {
  onOpenBooking: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onOpenBooking }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'orders' | 'profile'>('appointments');
  const [isLoading, setIsLoading] = useState(true);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const loadData = async () => {
      try {
        const [apptsRes, ordersRes] = await Promise.all([
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          setAppointments(apptsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, navigate]);

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment according to salon policy?')) {
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Appointment cancelled successfully.', 'info');
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
        );
      } else {
        showToast(data.error || 'Failed to cancel.', 'error');
      }
    } catch (err) {
      showToast('Network error while cancelling.', 'error');
    }
  };

  const handleReschedule = async (id: number) => {
    if (!newDate || !newTime) {
      showToast('Please select a new date and time slot.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_date: newDate, new_time_slot: newTime }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Appointment rescheduled successfully!', 'success');
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, appointment_date: newDate, time_slot: newTime, status: 'confirmed' }
              : a
          )
        );
        setReschedulingId(null);
      } else {
        showToast(data.error || 'Failed to reschedule.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  if (!user) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed'
  );
  const pastAppointments = appointments.filter(
    (a) => a.appointment_date < todayStr || a.status === 'completed' || a.status === 'cancelled'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Welcome Card */}
      <div className="bg-[#541224] text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FCE7EC] text-[#541224] font-serif font-bold text-2xl flex items-center justify-center border-2 border-[#D4A5AC]">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                Namaste, {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/20 text-[#F8CAD5]">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-[#F8CAD5] mt-1 flex items-center gap-3">
              <span>{user.email}</span>
              {user.phone && <span>• {user.phone}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBooking}
          className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-[#541224] bg-[#FCE7EC] hover:bg-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#541224]" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-[#541224] text-[#541224] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#541224] text-[#541224] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Product Orders ({orders.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'appointments' && (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#541224] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B76E79]" />
              Upcoming Appointments ({upcomingAppointments.length})
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
                <p className="text-xs text-gray-500">You have no upcoming appointments scheduled.</p>
                <button
                  onClick={onOpenBooking}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient"
                >
                  Book a Treatment Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-6 rounded-3xl bg-white border border-[#D4A5AC]/40 shadow-xs hover:shadow-md transition-all space-y-4 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 block">
                          REF: {appt.booking_ref}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#541224]">
                          {appt.service_name}
                        </h4>
                        <span className="text-gray-500 capitalize">
                          Category: {appt.service_category}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {appt.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-xl border border-gray-100 space-y-1.5 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#B76E79]" />
                        <span>Date: <strong>{appt.appointment_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#B76E79]" />
                        <span>Time: <strong>{appt.time_slot}</strong></span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100 font-bold text-[#541224]">
                        <span>Price in ₹:</span>
                        <span>₹{appt.price}</span>
                      </div>
                    </div>

                    {reschedulingId === appt.id ? (
                      /* Inline Reschedule Controls */
                      <div className="p-4 bg-rose-50/60 rounded-2xl border border-[#D4A5AC]/50 space-y-3">
                        <span className="font-bold text-[#541224] block">Select New Date & Slot:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            min={todayStr}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                          />
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                          >
                            {['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReschedule(appt.id)}
                            className="flex-1 py-1.5 rounded-lg bg-[#541224] text-white text-xs font-semibold"
                          >
                            Save Reschedule
                          </button>
                          <button
                            onClick={() => setReschedulingId(null)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Action Buttons */
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => {
                            setReschedulingId(appt.id);
                            setNewDate(appt.appointment_date);
                            setNewTime(appt.time_slot);
                          }}
                          className="flex-1 py-2 rounded-full border border-[#B76E79] text-[#541224] hover:bg-[#FCE7EC]/50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="flex-1 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Slot</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="font-serif text-lg font-bold text-gray-700">
              Past & Completed Appointments ({pastAppointments.length})
            </h3>

            {pastAppointments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No past history recorded.</p>
            ) : (
              <div className="divide-y divide-gray-100 bg-white rounded-3xl border border-gray-200 overflow-hidden">
                {pastAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-gray-900">{appt.service_name}</h4>
                        <span className="font-mono text-[10px] text-gray-400">{appt.booking_ref}</span>
                      </div>
                      <span className="text-gray-500">
                        {appt.appointment_date} at {appt.time_slot}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-serif font-bold text-gray-900">₹{appt.price}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          appt.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#541224]">
            Your Product Orders & Salon Pickups
          </h3>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
              <p className="text-xs text-gray-500">You haven't placed any product orders yet.</p>
              <Link
                to="/products"
                className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient"
              >
                Browse Beauty Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-5 bg-white rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#541224]">{o.order_ref}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {o.order_status}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment: {o.payment_method} ({o.payment_status})</span>
                    <span className="font-serif font-bold text-sm text-[#541224]">₹{o.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
