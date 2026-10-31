import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Scissors,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Service } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: number | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(initialServiceId || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hairLength, setHairLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);
  const [timeSlots, setTimeSlots] = useState<Array<{ time: string; available: boolean; remainingCapacity: number }>>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isTuesdayClosed, setIsTuesdayClosed] = useState<boolean>(false);

  // Form fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  // Load user data if logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Fetch all active services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setServices(data);
          if (initialServiceId) {
            setSelectedServiceId(initialServiceId);
          } else if (data.length > 0 && !selectedServiceId) {
            setSelectedServiceId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };
    fetchServices();
  }, [initialServiceId]);

  // Fetch available slots when appointment date changes
  useEffect(() => {
    if (!appointmentDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime('');
      try {
        const res = await fetch(`/api/appointments/available-slots?date=${appointmentDate}`);
        if (res.ok) {
          const data = await res.json();
          setIsTuesdayClosed(data.is_closed || false);
          setTimeSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Failed to fetch available slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [appointmentDate]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Compute calculated price based on hair length
  const calculatePrice = (): number => {
    if (!selectedService) return 350;
    if (selectedService.category.startsWith('hair')) {
      if (hairLength === 'short' && selectedService.price_short) return selectedService.price_short;
      if (hairLength === 'long' && selectedService.price_long) return selectedService.price_long;
      if (selectedService.price_medium) return selectedService.price_medium;
    }
    return selectedService.price;
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      showToast('Please select a service first.', 'error');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please provide your name and phone number.', 'error');
      return;
    }

    if (isTuesdayClosed) {
      showToast('Salon is closed on Tuesdays. Please pick another date.', 'error');
      return;
    }

    if (!selectedTime) {
      showToast('Please select an available appointment time slot.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('durga_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          service_category: selectedService.category,
          service_id: selectedService.id,
          service_name: selectedService.name,
          hair_length: hairLength,
          appointment_date: appointmentDate,
          time_slot: selectedTime,
          notes: notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingSuccessData(data);
        showToast('Appointment booked successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to book appointment.', 'error');
      }
    } catch (err: any) {
      showToast('Network error while booking. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setBookingSuccessData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D4A5AC]/40 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#541224] text-white border-b border-[#B76E79]/30 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FCE7EC] p-0.5 overflow-hidden">
              <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-wide text-white">
                Book Your Salon Experience
              </h3>
              <p className="text-xs text-[#F8CAD5]">Durga Beauty Parlour • Luxury Care</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {bookingSuccessData ? (
            /* Booking Confirmation View */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#FCE7EC] text-[#541224] mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-9 h-9 text-[#681E34]" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-[#FCE7EC] text-[#541224] rounded-full text-xs font-bold tracking-widest uppercase mb-2">
                  Booking Confirmed
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#541224]">
                  We Look Forward to Pampering You!
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Your appointment has been registered in our system.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#D4A5AC]/40 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-[#541224]">{bookingSuccessData.booking_ref}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-semibold text-gray-900">{bookingSuccessData.service_name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Scheduled Date:</span>
                  <span className="font-semibold text-gray-900">{bookingSuccessData.appointment_date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Time Slot:</span>
                  <span className="font-semibold text-gray-900">{bookingSuccessData.time_slot}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-[#541224]">
                  <span>Estimated Total:</span>
                  <span>₹{bookingSuccessData.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={bookingSuccessData.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Confirmation via WhatsApp</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="flex-1 py-3 px-4 rounded-full border border-[#B76E79] text-[#541224] hover:bg-[#FCE7EC]/50 font-medium text-xs transition-colors cursor-pointer"
                >
                  Close & Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form View */
            <form onSubmit={handleBookAppointment} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#541224] mb-2">
                  1. Select Your Service
                </label>
                <select
                  value={selectedServiceId || ''}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] text-sm text-gray-800 bg-[#FDFBF7] outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Choose a salon service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category.toUpperCase()}) — Starting at ₹{s.price} ({s.duration_mins} mins)
                    </option>
                  ))}
                </select>
              </div>

              {/* If hair service, show hair length selector */}
              {selectedService && selectedService.category.startsWith('hair') && (
                <div className="p-3.5 rounded-xl bg-[#FCE7EC]/50 border border-[#D4A5AC]/30 space-y-2">
                  <span className="block text-xs font-semibold text-[#541224] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" /> Hair Length (Adjusts Service Pricing):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['short', 'medium', 'long'] as const).map((len) => (
                      <button
                        type="button"
                        key={len}
                        onClick={() => setHairLength(len)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                          hairLength === len
                            ? 'bg-[#541224] text-white border-[#541224] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#B76E79]'
                        }`}
                      >
                        {len} Hair
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Price Preview Banner */}
              {selectedService && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F4EE] border border-[#D4A5AC]/30 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{selectedService.name}</span>
                    <span className="text-gray-500 ml-2">({selectedService.duration_mins} minutes)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-[11px] block">Service Price:</span>
                    <span className="font-serif text-lg font-bold text-[#541224]">₹{calculatePrice()}</span>
                  </div>
                </div>
              )}

              {/* Date and Time Slot Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#541224] mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B76E79]" />
                    2. Appointment Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] text-sm text-gray-800 bg-[#FDFBF7] outline-none cursor-pointer"
                    required
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    *Closed on Tuesdays for weekly maintenance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#541224] mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B76E79]" />
                    3. Available Time Slot
                  </label>

                  {isTuesdayClosed ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Salon is closed on Tuesdays. Please choose another date.</span>
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="py-3 text-xs text-gray-500 italic">Checking slot availability...</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                            selectedTime === slot.time
                              ? 'bg-[#541224] text-white border-[#541224] shadow-sm cursor-pointer'
                              : slot.available
                              ? 'bg-white text-gray-700 border-gray-200 hover:border-[#B76E79] cursor-pointer'
                              : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time} {!slot.available && '(Full)'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#541224]">
                  4. Your Contact Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Mobile Number (WhatsApp Preferred) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Special Requests or Skin/Hair Concerns (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please use gentle products for sensitive skin, or preference for soft curtain bangs..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isTuesdayClosed || !selectedTime}
                  className={`w-full py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase text-white shadow-lg transition-all ${
                    isSubmitting || isTuesdayClosed || !selectedTime
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'maroon-gradient hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    'Confirming Slot...'
                  ) : (
                    `Confirm Appointment • ₹${calculatePrice()}`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
