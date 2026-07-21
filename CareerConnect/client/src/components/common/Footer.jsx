import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBriefcase, FaLinkedin, FaGithub, FaTwitter,
  FaInstagram, FaMapMarkerAlt, FaEnvelope, FaPhone,
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa';

const NAV = [
  { heading: 'Platform', links: [{ to: '/jobs', label: 'Browse Jobs' }, { to: '/posts', label: 'Community Posts' }, { to: '/references', label: 'References' }] },
  { heading: 'Company', links: [{ to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }, { to: '/register', label: 'Post a Job' }] },
  { heading: 'Candidates', links: [{ to: '/register', label: 'Create Profile' }, { to: '/login', label: 'Sign In' }, { to: '/jobs', label: 'Find Jobs' }] },
];

const SOCIALS = [
  { icon: <FaLinkedin />, href: 'https://www.linkedin.com/in/ashish-singh-b499902ba/', label: 'LinkedIn' },
  { icon: <FaGithub />, href: 'https://github.com/Ashishsingh234', label: 'GitHub' },
  { icon: <FaTwitter />, href: 'https://x.com/Ashishsingh8108', label: 'X' },
  { icon: <FaInstagram />, href: 'https://www.instagram.com/ashishsingh_015/', label: 'Instagram' },
];

const PERKS = ['250+ Jobs Added Daily', '500+ Verified Companies', '100% Free for Candidates'];

export default function Footer() {
  return (
    <footer className="bg-[#0f1f0f] text-white font-sans">
      {/* ── Top CTA strip ─────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Ready to find your next opportunity?</h3>
            <div className="flex flex-wrap gap-4 mt-3">
              {PERKS.map(p => (
                <div key={p} className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
                  <FaCheckCircle className="text-brand text-xs" /> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/jobs"
              className="flex items-center gap-2 bg-brand hover:bg-brandDark text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              Browse Jobs <FaArrowRight className="text-xs" />
            </Link>
            <Link to="/register"
              className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main footer ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        {/* Brand column */}
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm">
              <FaBriefcase className="text-white text-sm" />
            </div>
            <span className="text-lg font-extrabold">Career<span className="text-brand">Connect</span></span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
            India's fastest growing career platform connecting top talent with verified companies. Build your career the right way.
          </p>
          {/* Contact */}
          <div className="space-y-3">
            {[
              { icon: <FaMapMarkerAlt />, text: 'Mumbai, India' },
              { icon: <FaEnvelope />, text: 'ashishsingh81084726@gmail.com' },
              { icon: <FaPhone />, text: '+91 73041 42358' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-white/60">
                <span className="text-brand text-xs">{icon}</span> {text}
              </div>
            ))}
          </div>
          {/* Socials */}
          <div className="flex gap-3 mt-6">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-brand hover:bg-brand/20 transition-all text-sm">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV.map(col => (
          <div key={col.heading}>
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">{col.heading}</div>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/70 hover:text-white transition-colors font-medium">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <span>© {new Date().getFullYear()} CareerConnect. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}