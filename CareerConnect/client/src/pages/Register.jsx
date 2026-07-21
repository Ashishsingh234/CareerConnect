import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { FaUser, FaBuilding, FaLock, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaEye, FaEyeSlash, FaCheckCircle, FaBriefcase } from 'react-icons/fa';
import uploadService from '../services/uploadService';
import { motion, AnimatePresence } from 'framer-motion';

const pwStrength = pw => {
  if (!pw) return { label: '', color: '' };
  if (pw.length < 6) return { label: 'Weak', color: 'text-red-500' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 8) return { label: 'Strong', color: 'text-brand' };
  return { label: 'Medium', color: 'text-yellow-500' };
};

const inputCls = "w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none placeholder-textMuted transition-all";
const Label = ({ children }) => <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">{children}</label>;

export default function Register() {
  const [tab, setTab] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', website: '', description: '', industry: '', location: '' });
  const [extras, setExtras] = useState({ skills: '', phone: '', highestDegree: '', latestJobTitle: '', socialLinks: { linkedin: '', github: '', portfolio: '' } });
  const [profileFile, setProfileFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (tab === 'company' && !form.companyName) { setError('Company Name is required.'); return; }

    setLoading(true);
    try {
      let uploadedProfile = null;
      if (profileFile) {
        try { uploadedProfile = await uploadService.uploadProfileImage(profileFile); } catch { }
      }

      let userData;
      if (tab === 'company') {
        userData = await authService.registerCompany({
          name: form.name, email: form.email, password: form.password,
          companyName: form.companyName, website: form.website,
          description: form.description, industry: form.industry,
          location: form.location, profileImageId: uploadedProfile?.id
        });
      } else {
        userData = await authService.registerCandidate({
          name: form.name, email: form.email, password: form.password,
          profileImageId: uploadedProfile?.id,
          skills: extras.skills, location: form.location, phone: extras.phone,
          socialLinks: extras.socialLinks,
          education: extras.highestDegree ? [{ degree: extras.highestDegree }] : [],
          experience: extras.latestJobTitle ? [{ title: extras.latestJobTitle }] : []
        });
      }
      login(userData); // Log in automatically after register
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  }

  const str = pwStrength(form.password);

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* ── Left: Form ───────────────────────────────────── */}
      <div className="w-full lg:w-[60%] flex flex-col justify-start px-8 sm:px-14 lg:px-20 py-10 relative overflow-y-auto max-h-screen">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm">
            <FaBriefcase className="text-white text-sm" />
          </div>
          <span className="text-lg font-extrabold text-text">Career<span className="text-brand">Connect</span></span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-xl">
          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-1">Create your account</h1>
          <p className="text-textMuted text-sm mb-8">Join thousands of professionals and companies on CareerConnect.</p>

          {/* Role Tabs */}
          <div className="flex gap-3 mb-8 p-1.5 bg-gray-50 border border-border rounded-2xl">
            {[
              { key: 'candidate', label: 'I\'m a Candidate', icon: <FaUser />, color: 'text-brand' },
              { key: 'company', label: 'I\'m a Company', icon: <FaBuilding />, color: 'text-brand' },
            ].map(t => (
              <button key={t.key} type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all
                  ${tab === t.key ? 'bg-white border border-border shadow-sm text-brand' : 'text-textMuted hover:text-text'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Photo */}
            <div className="flex items-center gap-4 mb-2">
              <div onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-border hover:border-brand cursor-pointer flex items-center justify-center overflow-hidden transition-colors group relative">
                {profileFile
                  ? <img src={URL.createObjectURL(profileFile)} alt="preview" className="w-full h-full object-cover" />
                  : <FaUser className="text-gray-300 text-xl group-hover:text-brand transition-colors" />}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setProfileFile(e.target.files[0])} />
              <div>
                <div className="text-sm font-semibold text-text">Profile photo</div>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-brand font-semibold hover:underline mt-0.5">
                  {profileFile ? 'Change photo' : 'Upload photo (optional)'}
                </button>
              </div>
            </div>

            {/* Base fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label>Full Name *</Label>
                <input name="name" value={form.name} onChange={set} className={inputCls} placeholder="John Doe" required />
              </div>
              <div>
                <Label>Email Address *</Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                  <input name="email" type="email" value={form.email} onChange={set} className={`${inputCls} pl-10`} placeholder="you@email.com" required />
                </div>
              </div>
            </div>

            <div>
              <Label>Password *</Label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set}
                  className={`${inputCls} pl-10 pr-12`} placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-brand">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded transition-all ${str.label === 'Strong' ? 'w-full bg-brand' : str.label === 'Medium' ? 'w-2/3 bg-yellow-400' : 'w-1/3 bg-red-400'}`} />
                  </div>
                  <span className={`text-xs font-bold ${str.color}`}>{str.label}</span>
                </div>
              )}
            </div>

            {/* Company-specific fields */}
            <AnimatePresence mode="wait">
              {tab === 'company' && (
                <motion.div key="company" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pt-4 border-t border-border">
                  <div className="text-sm font-bold text-text flex items-center gap-2"><FaBuilding className="text-brand" /> Company Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Company Name *</Label>
                      <input name="companyName" value={form.companyName} onChange={set} className={inputCls} placeholder="Acme Corp" required />
                    </div>
                    <div>
                      <Label>Industry</Label>
                      <input name="industry" value={form.industry} onChange={set} className={inputCls} placeholder="Technology, Finance..." />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <div className="relative"><FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                        <input name="website" value={form.website} onChange={set} className={`${inputCls} pl-10`} placeholder="https://company.com" /></div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="relative"><FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                        <input name="location" value={form.location} onChange={set} className={`${inputCls} pl-10`} placeholder="Mumbai, India" /></div>
                    </div>
                  </div>
                  <div>
                    <Label>Company Description</Label>
                    <textarea name="description" value={form.description} onChange={set} className={`${inputCls} resize-none`} rows={3} placeholder="What does your company do?" />
                  </div>
                </motion.div>
              )}

              {tab === 'candidate' && (
                <motion.div key="candidate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5 pt-4 border-t border-border">
                  <div className="text-sm font-bold text-text flex items-center gap-2"><FaUser className="text-brand" /> Professional Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Skills (comma separated)</Label>
                      <input value={extras.skills} onChange={e => setExtras(p => ({ ...p, skills: e.target.value }))} className={inputCls} placeholder="React, Node.js, Python" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="relative"><FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
                        <input name="location" value={form.location} onChange={set} className={`${inputCls} pl-10`} placeholder="Bangalore, India" /></div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <input value={extras.phone} onChange={e => setExtras(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className={inputCls} placeholder="10-digit number" inputMode="numeric" />
                    </div>
                    <div>
                      <Label>Highest Degree</Label>
                      <input value={extras.highestDegree} onChange={e => setExtras(p => ({ ...p, highestDegree: e.target.value }))} className={inputCls} placeholder="B.Tech in CS" />
                    </div>
                  </div>
                  <div>
                    <Label>Current / Latest Job Title</Label>
                    <input value={extras.latestJobTitle} onChange={e => setExtras(p => ({ ...p, latestJobTitle: e.target.value }))} className={inputCls} placeholder="Frontend Developer" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-sm justify-center mt-3">
              {loading ? <Loader /> : <><FaCheckCircle className="text-xs" /> Create Account & Get Started</>}
            </button>
          </form>

          <p className="text-center text-sm text-textMuted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-bold hover:text-brandDark">Sign In →</Link>
          </p>
        </motion.div>
      </div>

      {/* ── Right: Green Panel ───────────────────────────── */}
      <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-brand via-brandDark to-accent flex-col justify-center p-12 relative overflow-hidden sticky top-0 h-screen">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-4">
                {tab === 'company' ? 'Find extraordinary talent, fast.' : 'Unlock your career potential.'}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                {tab === 'company'
                  ? 'Post jobs, manage applications, and hire the right people with powerful dashboard tools.'
                  : 'Browse top companies, apply with one click, and chat directly with recruiters.'}
              </p>
            </motion.div>
          </AnimatePresence>
          <img src="/about.png" alt="illustration" className="w-full rounded-2xl opacity-80 border border-white/20" />
        </div>
      </div>
    </div>
  );
}