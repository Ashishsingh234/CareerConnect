import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaBriefcase } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FEATURES = [
  'Browse 250+ verified job listings',
  'Apply directly with one click',
  'Chat with recruiters in real time',
  'Get matched by AI-powered recommendations',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Support redirect-after-login: if user was sent here from /jobs to apply
  const from = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    try {
      const userData = await authService.login({ email, password });
      login(userData); // update AuthContext
      // Navigate to where they came from (or home)
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* ── Left: Form ───────────────────────────────────── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm">
            <FaBriefcase className="text-white text-sm" />
          </div>
          <span className="text-lg font-extrabold text-text">Career<span className="text-brand">Connect</span></span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-2">Welcome back 👋</h1>
          <p className="text-textMuted mb-8 text-sm">Sign in to your CareerConnect account to continue.</p>

          {/* Alert: redirected from apply */}
          {location.state?.from && (
            <div className="flex items-center gap-2.5 bg-brand/5 border border-brand/20 text-brand rounded-xl px-4 py-3 mb-6 text-sm font-semibold">
              🔐 Please sign in to apply for this job.
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  placeholder="your@email.com" required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-brand transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3.5 text-sm justify-center mt-2">
              {loading ? <Loader /> : 'Sign In to CareerConnect'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-textMuted font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-textMuted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-bold hover:text-brandDark transition-colors">Create one free →</Link>
          </p>
        </motion.div>
      </div>

      {/* ── Right: Green Panel ───────────────────────────── */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-brand to-accent flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-widest">For Job Seekers & Companies</div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-6">
            India's fastest growing career platform
          </h2>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
                <span className="text-white/90 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <img src="/hero.png" alt="CareerConnect" className="w-full rounded-2xl opacity-90 shadow-2xl border border-white/20" />
        </div>
      </div>
    </div>
  );
}