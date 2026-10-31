import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ContactPageProps {
  onOpenBooking: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenBooking }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Salon Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in required fields (Name, Phone, Message).', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      showToast('Thank you! Your message has been sent to Durga Beauty Parlour.', 'success');
    }, 600);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <MapPin className="w-3.5 h-3.5" />
            Connect With Us
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            Contact Durga Beauty Parlour
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed mt-2">
            Have questions about bridal packages, hair transformations, or want to schedule an appointment? Reach out via phone, WhatsApp, or drop by our salon.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="lg:col-span-1 bg-[#F8F4EE] rounded-3xl p-8 border border-[#D4A5AC]/40 space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#541224]">
              Salon Information
            </h3>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">Salon Address</span>
                  <span className="leading-relaxed">
                    42, Rose Garden Avenue, Near City Centre, Jaipur, Rajasthan 302001
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">Phone Support</span>
                  <a href="tel:+919876543210" className="hover:text-[#541224] transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">WhatsApp Bookings</span>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-semibold hover:underline"
                  >
                    +91 98765 43210 (Chat Now)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">Email Inquiries</span>
                  <a href="mailto:contact@durgabeautyparlour.com" className="hover:text-[#541224]">
                    contact@durgabeautyparlour.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                <Clock className="w-5 h-5 text-[#B76E79] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">Operating Hours</span>
                  <span className="block">Mon, Wed – Sun: 10:00 AM – 08:00 PM</span>
                  <span className="block font-semibold text-rose-800">Tuesday: Closed (Weekly Maintenance)</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Follow Our Social Media
              </span>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/durgabeautyparlour"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:text-[#541224] hover:border-[#B76E79]"
                >
                  <svg className="w-3.5 h-3.5 fill-currentColor text-[#B76E79]" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a
                  href="https://facebook.com/durgabeautyparlour"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:text-[#541224] hover:border-[#B76E79]"
                >
                  <svg className="w-3.5 h-3.5 fill-currentColor text-blue-600" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            <button
              onClick={onOpenBooking}
              className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Directly</span>
            </button>
          </div>

          {/* Interactive Contact / Inquiry Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#D4A5AC]/40 shadow-sm flex flex-col justify-between">
            {isSent ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FCE7EC] text-[#541224] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#541224]">
                  Message Received!
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for contacting Durga Beauty Parlour. Our salon manager will get back to you within 2 business hours.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#541224] border border-[#B76E79]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#541224]">
                    Send Us an Inquiry
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Fill out the form below and we will respond promptly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Topic / Inquiry Type</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none bg-white"
                    >
                      <option value="General Salon Inquiry">General Salon Inquiry</option>
                      <option value="Bridal Makeover Consultation">Bridal Makeover Consultation</option>
                      <option value="Hair Services & Styling">Hair Services & Styling</option>
                      <option value="Facial & Skincare Advice">Facial & Skincare Advice</option>
                      <option value="Feedback / Suggestions">Feedback / Suggestions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what services you are interested in or any specific dates..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Location Embed */}
        <div className="rounded-3xl overflow-hidden border border-[#D4A5AC]/40 shadow-md bg-white p-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div>
              <h4 className="font-serif text-lg font-bold text-[#541224]">
                Find Durga Beauty Parlour on Map
              </h4>
              <p className="text-xs text-gray-500">
                Convenient parking available on Rose Garden Avenue.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=26.9124,75.7873"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#B76E79] hover:underline"
            >
              Open in Google Maps App →
            </a>
          </div>

          <div className="h-72 w-full rounded-2xl overflow-hidden bg-gray-100 relative">
            <iframe
              title="Durga Beauty Parlour Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113886.87788478477!2d75.72051786524177!3d26.912433600000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db40f3531b463%3A0xb35515324b171630!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
