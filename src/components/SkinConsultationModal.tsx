import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert, Phone, MessageSquare, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SkinConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinConsultationModal: React.FC<SkinConsultationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [skinType, setSkinType] = useState('Normal / Unsure');
  const [concerns, setConcerns] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'call'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please provide your name and contact phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          skin_type: skinType,
          concerns: concerns.trim(),
          preferred_contact: preferredContact,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        showToast('Skin consultation request submitted! Our expert will reach out.', 'success');
      } else {
        showToast('Failed to submit consultation request. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setConcerns('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D4A5AC]/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#541224] text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#F4B8C5]" />
            <div>
              <h3 className="font-serif text-lg font-semibold tracking-wide text-white">
                Personalized Skin Consultation
              </h3>
              <p className="text-xs text-[#F8CAD5]">Durga Beauty Parlour Aesthetic Experts</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FCE7EC] text-[#541224] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#541224]" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#541224]">
                Consultation Request Received!
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                Thank you, <strong>{name}</strong>. Our senior aesthetician will analyze your skin profile and reach out via <strong>{preferredContact === 'whatsapp' ? 'WhatsApp' : 'Phone Call'}</strong> with tailored recommendations.
              </p>
              <button
                onClick={resetAndClose}
                className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Educational Disclaimer */}
              <div className="p-3 bg-[#FDFBF7] border border-[#D4A5AC]/40 rounded-xl text-gray-600 flex items-start gap-2 text-[11px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-[#B76E79] shrink-0 mt-0.5" />
                <span>
                  Our consultations focus on barrier hydration, soothing skin fatigue, and enhancing your healthy, natural radiance. We do not provide medical dermatology or unnatural skin-lightening promises.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Observed Skin Type</label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none bg-white"
                  >
                    <option value="Normal / Balanced">Normal / Balanced</option>
                    <option value="Dry & Flaky">Dry & Flaky</option>
                    <option value="Oily & Shiny">Oily & Shiny</option>
                    <option value="Combination (T-Zone)">Combination (T-Zone)</option>
                    <option value="Sensitive / Redness-Prone">Sensitive / Redness-Prone</option>
                    <option value="Unsure / Need Guidance">Unsure / Need Guidance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Primary Concerns & Questions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for a gentle facial before an upcoming wedding, dry patches around mouth, or tan recovery..."
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  How would you prefer we contact you?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="whatsapp"
                      checked={preferredContact === 'whatsapp'}
                      onChange={() => setPreferredContact('whatsapp')}
                      className="text-[#541224] focus:ring-[#B76E79]"
                    />
                    <span>WhatsApp Message</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="call"
                      checked={preferredContact === 'call'}
                      onChange={() => setPreferredContact('call')}
                      className="text-[#541224] focus:ring-[#B76E79]"
                    />
                    <span>Phone Call</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Request Free Consultation'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
