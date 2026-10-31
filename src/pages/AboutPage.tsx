import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Users,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Smile
} from 'lucide-react';

interface AboutPageProps {
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="relative py-16 bg-[#541224] text-white text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-[#F8CAD5]">
            <Heart className="w-3.5 h-3.5" />
            Our Philosophy & Mission
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            About Durga Beauty Parlour
          </h1>
          <p className="text-xs sm:text-sm text-[#FCE7EC]/80 max-w-2xl mx-auto font-light leading-relaxed mt-2">
            "Your Beauty, Our Passion." A dedicated haven where women receive personalized beauty consultations, restorative therapies, and master hair styling.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Salon Story & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
              The Heart Behind Durga Beauty Parlour
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#541224] leading-tight">
              A Warm, Safe Sanctuary Designed Exclusively for Women
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
              Durga Beauty Parlour was founded with a singular, heartfelt vision: to provide women with a comfortable, dignified, and spotless salon environment where every service is performed with respect, artistry, and genuine hospitality.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
              Rather than rushing appointments, our beauty professionals take the time to listen. We evaluate your unique hair texture, facial structure, skin sensitivity, and personal preferences to ensure the final result enhances your natural confidence.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B76E79]" />
                <span>Zero pressure to purchase unnecessary products or upgrades.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B76E79]" />
                <span>100% transparent and pre-displayed pricing in Indian Rupees (₹).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B76E79]" />
                <span>Attentive customer care and post-treatment maintenance guidance.</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4A5AC]/40 h-96">
            <img
              src="/images/hero-banner.jpg"
              alt="Durga Beauty Parlour Salon Styling Room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-medium">
              <span className="block text-sm font-serif font-bold text-[#F4B8C5]">
                Pristine Cleanliness & Warm Ambiance
              </span>
              <span>Every styling station is sanitized between each guest.</span>
            </div>
          </div>
        </div>

        {/* Hygiene & Safety Protocols */}
        <section className="bg-[#F8F4EE] rounded-3xl p-8 sm:p-12 border border-[#D4A5AC]/30 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B76E79]">
              Strict Hygiene Standards
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#541224]">
              Cleanliness You Can Trust
            </h3>
            <p className="text-xs text-gray-600 font-light">
              Your health and peace of mind are non-negotiable. Here is how we uphold spotless hygiene every single day:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] text-[#541224] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#541224]">
                Sterilized Equipment
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                All metallic haircutting scissors, tweezers, cuticle nippers, and extraction probes undergo hospital-grade UV sterilization between clients.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] text-[#541224] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#541224]">
                Single-Use Disposables
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                We strictly use fresh disposable bed sheets, facial headbands, sanitized waxing strips, and freshly laundered towels for every facial and spa treatment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] text-[#541224] flex items-center justify-center">
                <Smile className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#541224]">
                Clean Formulations
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                We refuse to use harsh, bleaching chemical agents. Our products prioritize skin safety, soothing botanicals, and hypoallergenic formulas.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center py-8 space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#541224]">
            Ready to Experience Durga Beauty Parlour?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Book an appointment online in seconds or walk in to discuss your beauty goals with our friendly team.
          </p>
          <button
            onClick={onOpenBooking}
            className="px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Your Appointment Today</span>
          </button>
        </div>
      </div>
    </div>
  );
};
