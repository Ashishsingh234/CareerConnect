import React, { useState, useEffect } from 'react';
import { FaImage, FaChevronRight, FaChevronLeft, FaCheck, FaBullhorn, FaRocket, FaTrophy, FaEdit } from 'react-icons/fa';
import postService from '../../services/postService';
import uploadService from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';
import AuthImage from './AuthImage';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'General', label: 'Update', icon: <FaEdit />, desc: 'Share a general status update', color: 'bg-blue-500' },
  { id: 'Announcement', label: 'Announcement', icon: <FaBullhorn />, desc: 'Important news or broadcast', color: 'bg-purple-500' },
  { id: 'Hiring', label: 'Hiring', icon: <FaRocket />, desc: 'Spread the word about open roles', color: 'bg-emerald-500' },
  { id: 'Milestone', label: 'Milestone', icon: <FaTrophy />, desc: 'Celebrate a big win or achievement', color: 'bg-amber-500' },
];

export default function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    category: 'General',
    file: null,
    preview: null,
  });

  useEffect(() => {
    if (formData.file) {
      const url = URL.createObjectURL(formData.file);
      setFormData(prev => ({ ...prev, preview: url }));
      return () => URL.revokeObjectURL(url);
    } else {
      setFormData(prev => ({ ...prev, preview: null }));
    }
  }, [formData.file]);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const submit = async () => {
    setLoading(true);
    try {
      let imageId = null;
      if (formData.file) {
        const res = await uploadService.uploadPostImage(formData.file);
        imageId = res.id || null;
      }
      await postService.create({
        content: formData.content.trim(),
        category: formData.category,
        imageFileId: imageId
      });
      setFormData({ content: '', category: 'General', file: null, preview: null });
      setStep(1);
      onPosted?.();
    } catch (err) {
      console.error('Post failed', err);
      alert('Failed to create post');
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-text mb-4">What kind of post is this?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setFormData(prev => ({ ...prev, category: cat.id })); nextStep(); }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${formData.category === cat.id ? 'border-brand bg-brand/5' : 'border-border bg-white hover:border-gray-300'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-sm ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div>
                    <div className="font-bold text-text group-hover:text-brand transition-colors">{cat.label}</div>
                    <div className="text-xs text-textMuted font-medium leading-snug">{cat.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-text mb-2">Write your message</h3>
            <textarea
              rows={5}
              className="w-full p-4 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand bg-gray-50/50 text-text font-medium placeholder-textMuted transition-all h-40"
              placeholder="What's on your mind? Share your updates, news, or achievements..."
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              autoFocus
            />
            <div className="flex justify-between items-center text-xs text-textMuted font-bold uppercase tracking-wider">
              <span>Selected: {formData.category}</span>
              <span>{formData.content.length} characters</span>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-text mb-2">Add a visual (Optional)</h3>
            <div className="relative group min-h-[200px] border-2 border-dashed border-border rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center p-6 transition-all hover:bg-gray-50">
              {formData.preview ? (
                <div className="w-full">
                  <img src={formData.preview} alt="preview" className="max-w-full h-auto max-h-[300px] rounded-xl object-contain mx-auto shadow-md" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <input type="file" accept="image/*" className="hidden" onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))} />
                  <div className="w-16 h-16 bg-white rounded-2xl border border-border flex items-center justify-center text-brand text-3xl mb-4 shadow-soft group-hover:scale-110 transition-transform">
                    <FaImage />
                  </div>
                  <span className="text-lg font-bold text-text mb-1">Upload Photo</span>
                  <span className="text-sm text-textMuted font-medium">PNG, JPG up to 10MB</span>
                </label>
              )}
            </div>
          </motion.div>
        );
      case 4:
        const selectedCat = CATEGORIES.find(c => c.id === formData.category);
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-text mb-2">Final Review</h3>
            <div className="bg-white border border-border rounded-2xl p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-sm ${selectedCat.color}`}>
                  {selectedCat.icon}
                </div>
                <span className="text-sm font-extrabold uppercase tracking-widest text-textMuted">{selectedCat.label}</span>
              </div>
              <p className="text-text font-medium leading-relaxed italic border-l-4 border-brand/20 pl-4">
                {formData.content || '[No message entered]'}
              </p>
              {formData.preview && (
                <div className="relative h-40 w-full rounded-xl overflow-hidden animate-pulse-slow">
                  <img src={formData.preview} alt="preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xs uppercase tracking-widest">Image Attached</div>
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-border overflow-hidden mb-8 animate-fade-in-up">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-100 flex">
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className={`h-full transition-all duration-500 ease-out ${idx <= step ? 'bg-brand flex-1' : 'w-0'}`}
          />
        ))}
      </div>

      <div className="p-6 md:p-8">
        <div className="flex gap-6">
          <div className="hidden md:block w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-border shadow-sm flex-shrink-0">
            {user?.profileImageUrl ? (
              <AuthImage src={user.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : user?.companyLogoUrl ? (
              <AuthImage src={user.companyLogoUrl} alt="company" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-textMuted font-extrabold text-2xl">{user?.name?.[0] || 'U'}</div>
            )}
          </div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <div key={step}>
                {renderStep()}
              </div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-textMuted hover:text-text hover:bg-gray-100 transition-all border border-transparent hover:border-border"
                  >
                    <FaChevronLeft className="text-xs" /> Back
                  </button>
                )}
                <span className="text-xs font-bold text-textMuted uppercase tracking-widest ml-4">Step {step} of 4</span>
              </div>
              <div>
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={step === 2 && !formData.content.trim()}
                    className="btn-primary py-2.5 px-8 shadow-sm flex items-center gap-2 text-sm disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    Next <FaChevronRight className="text-xs" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={loading || !formData.content.trim()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-extrabold transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Posting...</span>
                    ) : (
                      <span className="flex items-center gap-2"><FaCheck /> Publish Update</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
