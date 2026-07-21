import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../services/api';
import JobCard from '../components/jobs/JobCard';
import Loader from '../components/common/Loader';
import { motion, useInView } from 'framer-motion';
import {
  FaSearch, FaArrowRight, FaBriefcase, FaBuilding,
  FaUsers, FaCheckCircle, FaLaptopHouse, FaMobileAlt,
  FaChartLine, FaRegBookmark, FaComments, FaBolt
} from 'react-icons/fa';

// Animated stat counter
const CountUp = ({ end, suffix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
};

const STATS = [
  { icon: <FaBriefcase />, label: 'Active Jobs', end: 10243, suffix: '+' },
  { icon: <FaBuilding />, label: 'Companies', end: 500, suffix: '+' },
  { icon: <FaUsers />, label: 'Hired This Month', end: 3280, suffix: '+' },
  { icon: <FaCheckCircle />, label: 'Success Rate', end: 92, suffix: '%' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: <FaUsers />, title: 'Create Profile', desc: 'Sign up in 60 seconds and build your professional profile that stands out to recruiters.' },
  { step: '02', icon: <FaSearch />, title: 'Discover Roles', desc: 'Use smart filters to find remote, hybrid, or on-site opportunities that match your skills.' },
  { step: '03', icon: <FaBolt />, title: 'Apply Instantly', desc: 'One-click applications with your saved profile. No repetitive form filling.' },
  { step: '04', icon: <FaComments />, title: 'Chat & Confirm', desc: 'Message recruiters directly in real time and get offer updates without the silence.' },
];

const FEATURES = [
  { icon: <FaLaptopHouse />, title: 'Remote-First Jobs', desc: 'Browse hundreds of verified remote and hybrid positions with real salary ranges.' },
  { icon: <FaRegBookmark />, title: 'Save & Track Jobs', desc: 'Bookmark your favourites and track every application from a single dashboard.' },
  { icon: <FaMobileAlt />, title: 'Mobile-Ready', desc: 'Apply from anywhere. CareerConnect is fully responsive on any device.' },
  { icon: <FaChartLine />, title: 'Career Insights', desc: 'Get personalised skill gap analysis and market demand reports for your field.' },
];

const CATEGORIES = [
  { label: 'Engineering', count: '3,200+ jobs', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Design', count: '1,100+ jobs', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Marketing', count: '890+ jobs', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Finance', count: '760+ jobs', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { label: 'Data Science', count: '2,100+ jobs', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'Product', count: '540+ jobs', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: 'DevOps', count: '670+ jobs', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'Healthcare', count: '320+ jobs', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const TESTIMONIALS = [
  { name: 'Ritika Gupta', title: 'Software Engineer @ TechNova', quote: 'Found my dream remote role in 3 days. The filter sidebar made it incredibly easy to narrow down what I actually wanted.', avatar: 'R' },
  { name: 'Sameer Khan', title: 'Product Designer @ DesignHub', quote: 'CareerConnect had more design roles than any other platform I tried. Got 5 interviews in a week!', avatar: 'S' },
  { name: 'Anjali Mehra', title: 'Data Analyst @ FinCore', quote: 'The real-time chat with recruiters is a game changer. No more applying into a black hole.', avatar: 'A' },
];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [jr, cr] = await Promise.all([axios.get('/jobs?limit=6'), axios.get('/companies?limit=8')]);
        setJobs(jr.data.jobs || jr.data);
        setCompanies(cr.data.companies || cr.data);
      } catch { setJobs([]); setCompanies([]); }
      setLoading(false);
    })();
  }, []);

  const handleSearch = e => { e.preventDefault(); navigate(searchQuery.trim() ? `/jobs?keyword=${searchQuery}` : '/jobs'); };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-[#15803d] to-accent py-20 md:py-28 px-4">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-white/5" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              ⚡ 250+ new jobs added today
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Your next big<br />career move<br /><span className="text-yellow-300">starts here.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}
              className="text-white/80 text-lg mb-8 max-w-md leading-relaxed">
              Browse 10,000+ verified jobs from 500+ leading companies across India. Filter, apply, and get hired faster.
            </motion.p>

            {/* Search bar */}
            <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-3 bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <FaSearch className="text-textMuted shrink-0" />
                <input value={searchQuery} onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text outline-none placeholder-textMuted font-medium"
                  placeholder="Job title, company, or skill..." />
              </div>
              <button type="submit" className="bg-brand hover:bg-brandDark text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0">
                Search <FaArrowRight className="text-xs" />
              </button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-2 mt-5">
              {['React', 'Product Manager', 'Data Science', 'Remote', 'DevOps'].map(tag => (
                <button key={tag} onClick={() => navigate(`/jobs?keyword=${tag}`)}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 text-white/90 px-3 py-1.5 rounded-full transition-colors">
                  {tag}
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden lg:block">
            <img src="/hero.png" alt="CareerConnect" className="w-full rounded-3xl shadow-2xl border border-white/20 opacity-90" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-border py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <div className="w-11 h-11 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-base mx-auto mb-3">{s.icon}</div>
                <div className="text-2xl font-extrabold text-text">
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-xs text-textMuted font-semibold mt-0.5">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── JOB CATEGORIES ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="text-brand font-bold text-xs uppercase tracking-widest mb-2 block">Browse by Category</span>
            <h2 className="text-3xl font-extrabold text-text">Find jobs in your field</h2>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <button onClick={() => navigate(`/jobs?keyword=${c.label}`)}
                  className={`border rounded-2xl px-4 py-4 text-left hover:scale-105 transition-all w-full ${c.color}`}>
                  <div className="font-extrabold text-sm mb-0.5">{c.label}</div>
                  <div className="text-xs font-medium opacity-75">{c.count}</div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST JOBS ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="flex items-end justify-between mb-8">
            <div>
              <span className="text-brand font-bold text-xs uppercase tracking-widest mb-2 block">Fresh Listings</span>
              <h2 className="text-3xl font-extrabold text-text">Latest Opportunities</h2>
            </div>
            <Link to="/jobs" className="flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brandDark transition-colors">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </Reveal>
          {loading ? (
            <div className="flex justify-center py-12"><Loader /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job, i) => (
                <Reveal key={job._id} delay={i * 0.07}>
                  <JobCard job={job} onClick={() => navigate(`/jobs/${job._id}`)} />
                </Reveal>
              ))}
            </div>
          )}
          <Reveal className="text-center mt-10">
            <Link to="/jobs" className="btn-primary text-sm px-8 py-3 inline-flex items-center gap-2">
              Browse All Jobs <FaArrowRight className="text-xs" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-brand font-bold text-xs uppercase tracking-widest mb-2 block">How It Works</span>
            <h2 className="text-3xl font-extrabold text-text">Get hired in 4 simple steps</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white border border-border rounded-2xl p-6 relative hover:border-brand/30 hover:shadow-soft transition-all">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow-md">{h.step}</div>
                  <div className="w-11 h-11 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-base mb-4 mt-2">{h.icon}</div>
                  <h3 className="font-extrabold text-text text-sm mb-2">{h.title}</h3>
                  <p className="text-textMuted text-xs leading-relaxed">{h.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-brand font-bold text-xs uppercase tracking-widest mb-2 block">Why CareerConnect</span>
            <h2 className="text-3xl font-extrabold text-text">Everything you need to succeed</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="border border-border rounded-2xl p-6 flex items-start gap-5 hover:border-brand/30 hover:shadow-soft transition-all">
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-lg shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-text mb-1.5">{f.title}</h3>
                    <p className="text-textMuted text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-brand font-bold text-xs uppercase tracking-widest mb-2 block">Testimonials</span>
            <h2 className="text-3xl font-extrabold text-text">What our users say</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white border border-border rounded-2xl p-6 hover:border-brand/30 hover:shadow-soft transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-xl flex items-center justify-center text-white font-extrabold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-text text-sm">{t.name}</div>
                      <div className="text-xs text-textMuted">{t.title}</div>
                    </div>
                  </div>
                  <p className="text-textMuted text-sm leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex gap-0.5 mt-4">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANIES ─────────────────────────────────────────── */}
      {companies.length > 0 && (
        <section className="py-14 px-4 bg-white border-t border-border">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-8">
              <h2 className="text-sm font-bold text-textMuted uppercase tracking-widest">Trusted by leading companies</h2>
            </Reveal>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {companies.slice(0, 8).map((c, i) => (
                <Reveal key={c._id} delay={i * 0.05}>
                  <div className="border border-border rounded-xl px-5 py-3 text-sm font-bold text-text hover:border-brand/30 hover:bg-brand/5 transition-all cursor-pointer">
                    {c.name}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand to-accent relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white/10 rounded-full translate-y-1/2" />
        </div>
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5">Ready to find your dream job?</h2>
          <p className="text-white/80 mb-8 text-base">Join 50,000+ professionals already building their careers on CareerConnect.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary bg-white text-brand hover:bg-gray-50 shadow-xl font-bold px-8 py-3.5 inline-flex items-center gap-2 text-sm rounded-xl">
              <FaUsers /> Create Free Account
            </Link>
            <Link to="/jobs" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm inline-flex items-center gap-2">
              Browse All Jobs <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}