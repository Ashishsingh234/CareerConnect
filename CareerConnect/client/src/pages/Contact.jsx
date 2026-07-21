import React, { useState } from 'react';
import contactService from '../services/contactService';
import { FaPaperPlane, FaUser, FaEnvelope, FaCommentAlt } from 'react-icons/fa';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [serverMessage, setServerMessage] = useState('');
  const [mailPreview, setMailPreview] = useState({ owner: null, confirmation: null });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    // client-side mobile validation (required and must be 10 digits)
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) {
      setStatus('error');
      setLoading(false);
      return;
    }
    try {
      const res = await contactService.sendMessage(form);
      setStatus('success');
      setServerMessage(res.message || 'Message sent successfully');
      setMailPreview({ owner: res.mail?.owner?.previewUrl || null, confirmation: res.mail?.confirmation?.previewUrl || null });
      setForm({ name: '', email: '', message: '', mobile: '' });
    } catch (err) {
      setStatus('error');
      setServerMessage(err.response?.data?.message || 'Failed to send your message. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/40 py-16 px-4 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-soft border border-border relative overflow-hidden group animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px] transition-all duration-700"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full mix-blend-multiply filter blur-[80px] transition-all duration-700"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 mx-auto bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-4xl shadow-sm border border-brand/20 mb-6"><FaPaperPlane /></div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight mb-3">Get in Touch</h2>
          <p className="text-textMuted font-medium text-lg">We'd love to hear from you. Send us a message!</p>
        </div>

        {status === 'success' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-5 rounded-2xl mb-8 shadow-sm relative z-10 animate-fade-in">
            <p className="font-extrabold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Success</p>
            <p className="mt-1 text-sm font-medium">{serverMessage}</p>
            {mailPreview.owner && (
              <p className="mt-3 text-sm font-bold"><a className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1" href={mailPreview.owner} target="_blank" rel="noreferrer">View owner email preview</a></p>
            )}
            {mailPreview.confirmation && (
              <p className="mt-2 text-sm font-bold"><a className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1" href={mailPreview.confirmation} target="_blank" rel="noreferrer">View your email preview</a></p>
            )}
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl mb-8 shadow-sm relative z-10 animate-fade-in">
            <p className="font-extrabold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Error</p>
            <p className="mt-1 text-sm font-medium">{serverMessage || 'Failed to send your message. Please try again later.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaUser className="text-brand" /> Full Name</label>
              <input name="name" type="text" placeholder="John Doe" className="input-field" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="mobile" className="text-text font-bold mb-2 flex items-center gap-2 text-sm">Mobile</label>
              <input name="mobile" type="tel" placeholder="10-digit number" className="input-field" value={form.mobile || ''} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setForm(f => ({ ...f, mobile: v })); }} pattern="\d{10}" maxLength={10} required />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaEnvelope className="text-brand" /> Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" className="input-field" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="message" className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaCommentAlt className="text-brand" /> Your Message</label>
            <textarea name="message" placeholder="How can we help you?" className="input-field resize-none" rows={5} value={form.message} onChange={handleChange} required></textarea>
          </div>

          <button type="submit" className="w-full btn-primary py-4 text-lg font-extrabold mt-4 shadow-sm" disabled={loading}>
            {loading ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Contact;