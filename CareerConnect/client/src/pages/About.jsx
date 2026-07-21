import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    FaBriefcase, FaUsers, FaCheckCircle, FaRocket, FaHeart,
    FaGlobe, FaChartLine, FaArrowRight, FaStar, FaLinkedin, FaBuilding
} from 'react-icons/fa';

// ── Scroll-triggered section wrapper ─────────────────────────────
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: 'easeOut' }} className={className}>
            {children}
        </motion.div>
    );
};

const STATS = [
    { icon: <FaBriefcase />, label: 'Jobs Listed', value: '10,000+' },
    { icon: <FaUsers />, label: 'Happy Candidates', value: '50,000+' },
    { icon: <FaBuilding />, label: 'Partner Companies', value: '500+' },
    { icon: <FaGlobe />, label: 'Cities Covered', value: '80+' },
];

const TIMELINE = [
    { year: '2021', title: 'The Beginning', desc: 'CareerConnect was founded with a single mission: make hiring human, fast, and fair for every Indian professional.', side: 'left' },
    { year: '2022', title: 'First 1,000 Users', desc: 'We crossed our first milestone — 1,000 active job seekers and 50 companies using the platform.', side: 'right' },
    { year: '2023', title: 'AI-Powered Matching', desc: 'Launched our intelligent job-matching algorithm connecting candidates with roles that truly fit their skills and values.', side: 'left' },
    { year: '2024', title: 'Expanding Across India', desc: 'Expanded to 80+ cities with 500+ partner companies actively hiring through CareerConnect.', side: 'right' },
    { year: '2025', title: 'Real-Time Chat', desc: 'Introduced direct candidate-recruiter chat, eliminating cold email chains and speeding up hiring by 3×.', side: 'left' },
    { year: '2026', title: 'Today & Beyond', desc: 'Serving 50,000+ job seekers and growing. We\'re building the most trusted career platform in India.', side: 'right' },
];

const VALUES = [
    { icon: <FaHeart />, title: 'People First', desc: 'Every feature we build puts real humans — both candidates and hiring managers — at the center.' },
    { icon: <FaCheckCircle />, title: 'Radical Transparency', desc: 'Honest salary ranges, clear requirements, and no ghost jobs — ever.' },
    { icon: <FaRocket />, title: 'Relentless Speed', desc: 'Apply in seconds, hear back in days, not months. We hate slow hiring as much as you do.' },
    { icon: <FaChartLine />, title: 'Data-Driven', desc: 'Smart matching powered by AI insights to surface the right opportunities at the right time.' },
];

const TEAM = [
    { name: 'Ashish Singh', role: 'Lead Developer', bg: 'from-green-400 to-emerald-600', linkedin: 'https://www.linkedin.com/in/ashish-singh-b499902ba/' },
    { name: 'Shubham Sahu', role: 'Co-Founder', bg: 'from-blue-400 to-indigo-600', linkedin: '#' },
];



export default function About() {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div className="font-sans text-text overflow-x-hidden">
            {/* Progress Bar */}
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-brand origin-left z-50" />

            {/* ── 1. HERO ──────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand via-[#15803d] to-accent overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-white/5 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 translate-x-1/2" />
                </div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <Reveal>
                            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
                                <FaStar className="text-yellow-300" /> Our Story
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                                We're on a mission to fix hiring in India.
                            </h1>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p className="text-white/80 text-lg leading-relaxed mb-8">
                                CareerConnect was built by people who experienced the frustration of bad job searching and slow hiring. We knew there had to be a better way — so we built it.
                            </p>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="flex items-center gap-4">
                                <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-brand font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg">
                                    Explore Jobs <FaArrowRight className="text-xs" />
                                </Link>
                                <Link to="/register" className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
                                    Join Free →
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                    <Reveal delay={0.2} className="hidden lg:block">
                        <img src="/hero.png" alt="CareerConnect Platform" className="w-full rounded-3xl shadow-2xl border border-white/20 opacity-90" />
                    </Reveal>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-white/60 text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                    </motion.div>
                </div>
            </section>

            {/* ── 2. STATS ──────────────────────────────────────── */}
            <section className="py-16 bg-white border-b border-border">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {STATS.map((s, i) => (
                            <Reveal key={s.label} delay={i * 0.1}>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-lg mx-auto mb-3">
                                        {s.icon}
                                    </div>
                                    <div className="text-3xl font-extrabold text-text mb-1">{s.value}</div>
                                    <div className="text-sm text-textMuted font-medium">{s.label}</div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. SCROLLY MISSION ───────────────────────────── */}
            <section className="py-24 bg-gray-50/60 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Reveal>
                        <span className="text-brand font-bold text-sm uppercase tracking-widest mb-3 block">Our Mission</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-8">
                            Making <span className="text-brand">great careers</span> accessible to everyone.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <p className="text-xl text-textMuted leading-relaxed max-w-2xl mx-auto mb-12">
                            We believe that finding the right job shouldn't require connections, luck, or weeks of silence after applying. Technology should make this better — and that's exactly what we built.
                        </p>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <img src="/about.png" alt="Our mission" className="w-full max-w-2xl mx-auto rounded-3xl shadow-xl border border-border" />
                    </Reveal>
                </div>
            </section>

            {/* ── 4. TIMELINE ──────────────────────────────────── */}
            <section className="py-24 bg-white relative">
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal className="text-center mb-16">
                        <span className="text-brand font-bold text-sm uppercase tracking-widest mb-3 block">Our Journey</span>
                        <h2 className="text-4xl font-extrabold text-text">How we got here</h2>
                    </Reveal>

                    {/* Vertical timeline line */}
                    <div className="relative">
                        <div className="hidden md:block absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-border" aria-hidden />

                        <div className="flex flex-col gap-12">
                            {TIMELINE.map((item, i) => (
                                <Reveal key={i} delay={0.1}>
                                    <div className={`flex flex-col md:flex-row items-center gap-6 ${item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                                        <div className={`flex-1 ${item.side === 'right' ? 'md:text-left' : 'md:text-right'}`}>
                                            <div className="inline-block bg-brand/10 text-brand font-bold text-xs px-3 py-1 rounded-full mb-3 uppercase tracking-widest">{item.year}</div>
                                            <h3 className="text-xl font-extrabold text-text mb-2">{item.title}</h3>
                                            <p className="text-textMuted text-sm leading-relaxed max-w-sm">{item.desc}</p>
                                        </div>
                                        {/* Centre node */}
                                        <div className="flex-shrink-0 w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white shadow-lg z-10 border-4 border-white">
                                            <FaCheckCircle className="text-sm" />
                                        </div>
                                        <div className="flex-1 hidden md:block" />
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. OUR VALUES ────────────────────────────────── */}
            <section className="py-24 bg-gray-50/60">
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal className="text-center mb-16">
                        <span className="text-brand font-bold text-sm uppercase tracking-widest mb-3 block">What Drives Us</span>
                        <h2 className="text-4xl font-extrabold text-text">Our core values</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {VALUES.map((v, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="bg-white border border-border rounded-2xl p-7 hover:border-brand/30 hover:shadow-soft transition-all">
                                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-lg mb-5">{v.icon}</div>
                                    <h3 className="font-extrabold text-text text-lg mb-2">{v.title}</h3>
                                    <p className="text-textMuted text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 6. TEAM ──────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal className="text-center mb-16">
                        <span className="text-brand font-bold text-sm uppercase tracking-widest mb-3 block">The People</span>
                        <h2 className="text-4xl font-extrabold text-text">Meet the team</h2>
                        <p className="text-textMuted mt-3 max-w-xl mx-auto text-sm">Passionate builders working every day to make hiring better for everyone.</p>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {TEAM.map((m, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="text-center group">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${m.bg} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-extrabold shadow-md group-hover:scale-105 transition-transform`}>
                                        {m.name.charAt(0)}
                                    </div>
                                    <div className="font-bold text-text text-sm">{m.name}</div>
                                    <div className="text-xs text-textMuted mt-0.5">{m.role}</div>
                                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 text-brand hover:text-brandDark transition-colors inline-block">
                                        <FaLinkedin className="text-base mx-auto" />
                                    </a>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. CTA ───────────────────────────────────────── */}
            <section className="py-24 bg-gradient-to-br from-brand to-accent relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2" />
                    <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white/10 rounded-full translate-y-1/2" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <Reveal>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to take the next step?</h2>
                        <p className="text-white/80 text-lg mb-10">Join 50,000+ professionals and 500+ companies who already trust CareerConnect.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-xl text-sm">
                                <FaRocket /> Get Started Free
                            </Link>
                            <Link to="/jobs" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-sm">
                                Browse Jobs →
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
