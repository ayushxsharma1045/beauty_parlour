import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Heart } from 'lucide-react';

export const WelcomeIntroAnimation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [stage, setStage] = useState<'rubbing' | 'revealed' | 'complete'>('rubbing');

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isVisibleRef = useRef(false);

  // Synthesize gentle luxury sparkle chime using Web Audio API
  const playLuxuryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.15 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 1.3);
      });
    } catch {
      // Audio policy fallback
    }
  };

  const startAnimation = () => {
    // Clear any previous running timeouts
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    setIsVisible(true);
    isVisibleRef.current = true;
    setIsFadingOut(false);
    setStage('rubbing');

    // Chime
    const tSound = setTimeout(() => {
      playLuxuryChime();
    }, 120);

    // Stage 2: Logo and Name shine in full brilliance as brush buffs
    const tShow = setTimeout(() => {
      setStage('revealed');
    }, 300);

    // Stage 3: Complete & begin fade at 2.2 seconds
    const tFade = setTimeout(() => {
      setIsFadingOut(true);
      setStage('complete');
    }, 2200);

    // Stage 4: Unmount overlay by 2.8 seconds (strictly under 3 sec)
    const tEnd = setTimeout(() => {
      setIsVisible(false);
      isVisibleRef.current = false;
      setIsFadingOut(false);
    }, 2800);

    timeoutsRef.current.push(tSound, tShow, tFade, tEnd);
  };

  const handleSkip = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      isVisibleRef.current = false;
      setIsFadingOut(false);
    }, 200);
  };

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('durga_welcome_intro_seen');
    if (!hasSeen) {
      sessionStorage.setItem('durga_welcome_intro_seen', 'true');
      startAnimation();
    }

    const handleReplay = () => {
      startAnimation();
    };
    window.addEventListener('replay-welcome-intro', handleReplay);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') && isVisibleRef.current) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('replay-welcome-intro', handleReplay);
      window.removeEventListener('keydown', handleKeyDown);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []); // Empty dependency array ensures timeouts are NEVER cleared prematurely

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-500 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #4A0E1E 0%, #2A0610 60%, #150207 100%)',
      }}
      title="Click anywhere to enter immediately"
    >
      {/* Hardware-accelerated Keyframes */}
      <style>{`
        @keyframes brushSweepRub {
          0% {
            transform: translate3d(-150px, -120px, 0) rotate(50deg) scale(0.9);
            opacity: 0;
          }
          14% {
            transform: translate3d(calc(50vw - 180px), calc(50vh - 180px), 0) rotate(35deg) scale(1);
            opacity: 1;
          }
          30% {
            transform: translate3d(calc(50vw - 30px), calc(50vh - 70px), 0) rotate(-18deg) scale(1.05);
            opacity: 1;
          }
          46% {
            transform: translate3d(calc(50vw - 170px), calc(50vh - 50px), 0) rotate(26deg) scale(1.05);
            opacity: 1;
          }
          62% {
            transform: translate3d(calc(50vw - 50px), calc(50vh - 140px), 0) rotate(-14deg) scale(1);
            opacity: 1;
          }
          78% {
            transform: translate3d(calc(50vw + 100px), calc(50vh - 110px), 0) rotate(32deg) scale(0.95);
            opacity: 1;
          }
          100% {
            transform: translate3d(calc(100vw + 180px), -150px, 0) rotate(60deg) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes powderVeilGlow {
          0% {
            transform: scale(0.6);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.4);
            opacity: 0.3;
          }
        }

        @keyframes sparkleTwinkle {
          0%, 100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-16px) scale(1.3) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes logoGrandReveal {
          0% {
            transform: scale(0.7) translateY(24px);
            opacity: 0.3;
            filter: blur(10px);
          }
          60% {
            transform: scale(1.06) translateY(-4px);
            opacity: 1;
            filter: blur(0);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }

        .animate-brush-sweep {
          animation: brushSweepRub 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-powder-veil {
          animation: powderVeilGlow 2s ease-out infinite alternate;
        }

        .animate-logo-grand {
          animation: logoGrandReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Ambient Pulsing Glow Rings in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[620px] h-[620px] rounded-full border border-[#D4AF37]/30 animate-powder-veil" />
        <div className="absolute w-[440px] h-[440px] rounded-full border border-[#F4A7B9]/35 animate-pulse duration-1000" />
        <div className="absolute w-[320px] h-[320px] rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#F4A7B9]/35 to-[#FFDF00]/25 blur-3xl" />
      </div>

      {/* Floating Golden & Rose Sparkle Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '16%', left: '20%', delay: '0s', size: 'w-6 h-6 text-[#FFDF00]' },
          { top: '24%', left: '80%', delay: '0.4s', size: 'w-7 h-7 text-[#F4A7B9]' },
          { top: '74%', left: '16%', delay: '0.8s', size: 'w-6 h-6 text-[#FFF3B0]' },
          { top: '70%', left: '84%', delay: '1.2s', size: 'w-7 h-7 text-[#FFDF00]' },
          { top: '38%', left: '12%', delay: '0.6s', size: 'w-5 h-5 text-[#FFB3C6]' },
          { top: '48%', left: '88%', delay: '1.0s', size: 'w-5 h-5 text-[#FFDF00]' },
        ].map((star, i) => (
          <div
            key={i}
            className={`absolute ${star.size}`}
            style={{
              top: star.top,
              left: star.left,
              animation: `sparkleTwinkle 2.5s ease-in-out infinite`,
              animationDelay: star.delay,
            }}
          >
            <Sparkles className="w-full h-full drop-shadow-[0_0_14px_rgba(255,223,0,0.85)]" />
          </div>
        ))}
      </div>

      {/* Skip Button Top Right */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#F8CAD5] hover:text-white border border-[#D4A5AC]/40 backdrop-blur-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
        title="Skip intro animation (Esc)"
      >
        <span>Skip</span>
        <X className="w-3.5 h-3.5" />
      </button>

      {/* REALISTIC SVG MAKEUP BRUSH SWEEPING & RUBBING ACROSS */}
      <div className="fixed top-0 left-0 pointer-events-none z-50 animate-brush-sweep">
        <svg
          width="160"
          height="230"
          viewBox="0 0 120 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.9))' }}
        >
          <defs>
            {/* Brush Handle Metallic Rose-Gold Gradient */}
            <linearGradient id="handleGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8A2B3E" />
              <stop offset="30%" stopColor="#C97D8A" />
              <stop offset="60%" stopColor="#EAB5BF" />
              <stop offset="100%" stopColor="#5E1424" />
            </linearGradient>

            {/* Gold Ferrule Chrome Gradient */}
            <linearGradient id="ferruleGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B38728" />
              <stop offset="35%" stopColor="#FBF5B7" />
              <stop offset="70%" stopColor="#DAA520" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>

            {/* Soft Bristles Gradient (Dark root to powder-dusted rose tip) */}
            <linearGradient id="bristlesGrad3" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#2A161C" />
              <stop offset="35%" stopColor="#4A2832" />
              <stop offset="70%" stopColor="#A85768" />
              <stop offset="90%" stopColor="#F4A7B9" />
              <stop offset="100%" stopColor="#FFD4DF" />
            </linearGradient>

            {/* Powder Dust Glow Filter */}
            <filter id="powderGlow3" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Bristles Head (Dense, fluffy, curved blush brush) */}
          <g filter="url(#powderGlow3)">
            <path
              d="M38 78 C32 60, 24 38, 38 16 C48 2, 72 2, 82 16 C96 38, 88 60, 82 78 Z"
              fill="url(#bristlesGrad3)"
            />
            {/* Fluffy fine bristle highlight hairs */}
            <path
              d="M44 76 C40 52, 38 28, 48 12 C54 6, 66 6, 72 12 C82 28, 80 52, 76 76"
              stroke="#FFE1E8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M52 74 C50 48, 52 24, 60 10 C68 24, 70 48, 68 74"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Powder tip dust puff */}
            <ellipse cx="60" cy="14" rx="24" ry="10" fill="#FFC2D1" opacity="0.95" />
            <ellipse cx="60" cy="12" rx="15" ry="6" fill="#FFF0F5" opacity="0.98" />
          </g>

          {/* Gold Ferrule (Polished metal crimp holding the hairs) */}
          <path
            d="M37 76 L83 76 L80 108 L40 108 Z"
            fill="url(#ferruleGrad3)"
            stroke="#D4AF37"
            strokeWidth="0.75"
          />
          {/* Engraved ferrule rings */}
          <line x1="39" y1="84" x2="81" y2="84" stroke="#FFF7C2" strokeWidth="1" opacity="0.9" />
          <line x1="40" y1="96" x2="80" y2="96" stroke="#9A6B1A" strokeWidth="1" opacity="0.9" />

          {/* Luxury Brush Handle (Tapered, sculpted ergonomic rose-gold wood) */}
          <path
            d="M40 108 L80 108 C78 135, 68 165, 60 178 C52 165, 42 135, 40 108 Z"
            fill="url(#handleGrad3)"
            stroke="#B76E79"
            strokeWidth="0.75"
          />
          {/* Handle Light Reflection Accent */}
          <path
            d="M58 110 C58 130, 61 155, 60 175"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>

        {/* Dynamic cosmetic blush powder trail puff behind brush */}
        <div className="absolute top-4 left-6 w-32 h-32 rounded-full bg-gradient-to-tr from-[#FFDF00]/40 via-[#F4A7B9]/60 to-[#FFFFFF]/60 blur-xl pointer-events-none animate-pulse" />
      </div>

      {/* CENTRAL REVEAL CONTAINER: Logo & Durga Beauty Parlour */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        {/* Soft Golden/Blush Glow Aura behind logo */}
        <div
          className={`absolute w-96 h-96 rounded-full transition-all duration-1000 pointer-events-none ${
            stage === 'revealed' || stage === 'complete'
              ? 'opacity-95 scale-125 blur-3xl bg-gradient-to-tr from-[#D4AF37]/55 via-[#F4A7B9]/50 to-[#FFDF00]/45'
              : 'opacity-35 scale-80 blur-2xl bg-[#D4AF37]/30'
          }`}
        />

        {/* LOGO WITH GLOWING MANDALA RING */}
        <div
          className={`relative transition-all duration-700 ease-out transform ${
            stage === 'revealed' || stage === 'complete'
              ? 'animate-logo-grand'
              : 'opacity-50 scale-85 blur-[2px]'
          }`}
        >
          {/* Rotating Sacred Floral Ring */}
          <div className="absolute -inset-5 rounded-full border-2 border-dashed border-[#FFDF00]/65 animate-spin [animation-duration:18s] pointer-events-none" />
          <div className="absolute -inset-2.5 rounded-full border border-[#F4A7B9]/70 animate-pulse pointer-events-none" />

          {/* Logo Badge */}
          <div className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-full overflow-hidden p-1 sm:p-1.5 bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#B76E79] shadow-[0_0_55px_rgba(212,175,55,0.85)]">
            <img
              src="/images/logo.jpg"
              alt="Durga Beauty Parlour Logo"
              className="w-full h-full object-cover rounded-full bg-white transform hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-[#541224]');
                  target.parentElement.innerHTML = '<span class="text-white font-serif font-bold text-2xl sm:text-4xl tracking-widest">DBP</span>';
                }
              }}
            />
          </div>

          {/* Sparkle Flares on Logo */}
          <Sparkles className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-7 h-7 sm:w-9 sm:h-9 text-[#FFDF00] animate-bounce [animation-duration:2s] drop-shadow-[0_0_12px_#FFDF00]" />
          <Sparkles className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-5 h-5 sm:w-7 sm:h-7 text-[#F4A7B9] animate-pulse drop-shadow-[0_0_10px_#F4A7B9]" />
        </div>

        {/* PARLOUR NAME & BRAND TYPOGRAPHY */}
        <div
          className={`mt-5 sm:mt-7 space-y-2 sm:space-y-3 transition-all duration-700 delay-150 transform ${
            stage === 'revealed' || stage === 'complete'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-40 translate-y-4 scale-95 blur-[1px]'
          }`}
        >
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#B76E79]/30 border border-[#D4A5AC]/60 text-[#F8CAD5] text-[10px] sm:text-xs font-semibold tracking-widest uppercase shadow-md backdrop-blur-md">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFDF00]" />
            <span>Luxury Sanctuary for Women</span>
          </div>

          {/* Main Brand Title */}
          <h1 className="font-serif text-3xl min-[400px]:text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF3B0] via-[#FFDF00] to-[#E5C158] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] px-2">
            Durga Beauty Parlour
          </h1>

          {/* Tagline */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#B76E79]" />
            <p className="font-sans text-[10px] min-[380px]:text-xs sm:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#F8CAD5] font-semibold whitespace-nowrap">
              Your Beauty, Our Passion.
            </p>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#B76E79]" />
          </div>

          <p className="text-[11px] sm:text-xs text-[#F8CAD5]/80 tracking-wider pt-0.5 sm:pt-1 font-light italic flex items-center justify-center gap-1.5">
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB3C6] inline fill-current" />
            <span>Jaipur, Rajasthan • Welcome to Royal Pampering</span>
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 opacity-90">
        <span className="text-[11px] tracking-widest uppercase text-[#F8CAD5] font-semibold drop-shadow-sm">
          {stage === 'revealed' || stage === 'complete'
            ? '🌟 Welcome to Durga Beauty Parlour'
            : '✨ Entering in 2s • Tap anywhere to skip'}
        </span>
        <div className="w-36 h-1 rounded-full bg-white/20 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F4A7B9] to-[#FFDF00] transition-all duration-700 rounded-full"
            style={{ width: stage === 'revealed' || stage === 'complete' ? '100%' : '60%' }}
          />
        </div>
      </div>
    </div>
  );
};
