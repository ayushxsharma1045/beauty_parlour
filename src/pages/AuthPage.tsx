import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Home,
  ShieldCheck,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email and password are required.', 'error');
      return;
    }

    if (mode === 'register' && !name) {
      showToast('Name is required for registration.', 'error');
      return;
    }

    setIsSubmitting(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload =
      mode === 'login'
        ? { email, password }
        : { name, email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        showToast(
          mode === 'login'
            ? `Welcome back, ${data.user.name}!`
            : 'Account registered successfully! Welcome to Durga Beauty Parlour.',
          'success'
        );

        if (data.user.role === 'admin' || data.user.role === 'staff') {
          navigate('/admin');
        } else {
          navigate('/portal');
        }
      } else {
        showToast(data.error || 'Authentication failed.', 'error');
      }
    } catch (err) {
      showToast('Network error during authentication.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 bg-[#FDFBF7]">
      {/* Top Navigation Bar with Back & Home Buttons */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#541224] bg-white border border-[#D4A5AC]/50 shadow-xs hover:bg-[#FCE7EC]/50 hover:border-[#B76E79] transition-all cursor-pointer group"
          id="auth-back-button"
        >
          <ArrowLeft className="w-4 h-4 text-[#B76E79] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Previous Page</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-[#541224] bg-white border border-gray-200 shadow-xs hover:bg-[#FCE7EC]/30 transition-all"
          id="auth-home-button"
        >
          <Home className="w-3.5 h-3.5 text-[#B76E79]" />
          <span>Salon Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D4A5AC]/40 overflow-hidden relative">
        {/* Top Header */}
        <div className="px-8 pt-8 pb-6 bg-[#541224] text-white text-center space-y-2 relative">
          {/* Quick Corner Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#F8CAD5] hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Back</span>
          </button>

          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto border-2 border-[#D4A5AC] p-0.5 shadow-md bg-white">
            <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-wide">
            Durga Beauty Parlour
          </h2>
          <p className="text-xs text-[#F8CAD5]">
            {mode === 'login' ? 'Sign in to access your appointments & orders' : 'Create an account for personalized care'}
          </p>
        </div>

        {/* Admin Login Quick Switch Banner */}
        <div className="bg-[#FDF2F4] px-6 py-2.5 border-b border-[#D4A5AC]/30 flex items-center justify-between text-[11px]">
          <span className="text-gray-600 font-medium">Salon Administrator or Staff?</span>
          <Link
            to="/admin"
            className="font-bold text-[#541224] hover:text-[#B76E79] flex items-center gap-1 hover:underline"
          >
            <span>Admin Login Portal →</span>
          </Link>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-gray-100 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-[#541224] text-[#541224] font-bold bg-[#FDF2F4]/30'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-[#541224] text-[#541224] font-bold bg-[#FDF2F4]/30'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="p-8 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <span>{isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Administrator Portal Link & Return to Salon */}
        <div className="px-8 py-5 border-t border-gray-100 bg-[#FDFBF7] space-y-3 text-center">
          <p className="text-xs text-gray-500">
            Salon Staff or Administrator?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-[#541224] font-bold hover:underline cursor-pointer"
            >
              Sign in to Administrator Portal →
            </button>
          </p>

          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#541224] font-medium transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>Return to Durga Beauty Parlour</span>
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="text-[11px] text-[#B76E79] hover:underline cursor-pointer font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
