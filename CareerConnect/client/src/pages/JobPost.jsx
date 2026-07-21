import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import {
  FaBriefcase, FaMapMarkerAlt, FaUsers,
  FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaArrowLeft,
  FaArrowRight, FaCheck, FaRocket, FaMapPin, FaTools, FaLaptopHouse
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const JobPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workMode: 'Onsite',
    jobType: 'Fulltime',
    location: '',
    experienceLevel: 'Entry Level',
    salaryRange: { min: '', max: '' },
    requiredSkills: '',
    responsibilities: '',
    requirements: '',
    vacancy: 1,
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || (user.role !== 'company' && user.role !== 'hr')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-border rounded-3xl p-10 text-center shadow-soft animate-fade-in">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-3">Unauthorized Access</h2>
          <p className="text-textMuted mb-8">Only companies or HR personnel are authorized to post new job listings.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full py-3">Return to Home</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        companyId: user.companyId,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split('\n').map(s => s.trim()).filter(Boolean),
        salaryRange: {
          min: Number(formData.salaryRange.min) || 0,
          max: Number(formData.salaryRange.max) || 0
        }
      };
      await jobService.createJob(payload);
      setSuccess(true);
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3, 4].map(s => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === s ? 'bg-brand text-white shadow-soft ring-4 ring-brand/5' : step > s ? 'bg-brand/10 text-brand border border-brand/20' : 'bg-gray-50 text-textMuted border border-border'}`}>
              {step > s ? <FaCheck className="text-xs" /> : s}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold absolute -bottom-6 whitespace-nowrap ${step === s ? 'text-brand' : 'text-textMuted'}`}>
              {s === 1 ? 'Info' : s === 2 ? 'Details' : s === 3 ? 'Skills' : 'Post'}
            </span>
          </div>
          {s < 4 && <div className={`w-12 h-0.5 rounded-full transition-all duration-500 ${step > s ? 'bg-brand' : 'bg-gray-100'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-border rounded-3xl p-12 text-center shadow-soft animate-scale-up">
          <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <FaCheck className="text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-3">Job Posted Successfully!</h2>
          <p className="text-textMuted mb-0">Your job listing is now live. Redirecting you to the job board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-text tracking-tight mb-3">Create a New Opportunity</h1>
          <p className="text-textMuted font-medium text-sm">Follow the steps below to post a new job vacancy</p>
        </div>

        <StepIndicator />

        <div className="bg-white border border-border rounded-3xl shadow-soft p-10 mt-12">
          {error && (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm font-semibold animate-shake">
              <FaExclamationTriangle className="text-base" /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={(e) => e.preventDefault()}>
                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="form-label mb-2 block">Job Title</label>
                      <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g. Senior Frontend Developer" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label mb-2 block">Job Type</label>
                        <select name="jobType" value={formData.jobType} onChange={handleChange} className="input-field">
                          <option value="Fulltime">Full-time</option>
                          <option value="Partime">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label mb-2 block">Work Mode</label>
                        <select name="workMode" value={formData.workMode} onChange={handleChange} className="input-field">
                          <option value="Onsite">On-site</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-2 block">Job Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="input-field resize-none" placeholder="Describe the role and company culture..." required />
                    </div>
                  </div>
                )}

                {/* STEP 2: LOCATION & PAY */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="form-label mb-2 block">Location</label>
                      <div className="relative">
                        <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field pl-11" placeholder="City, Country" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label mb-2 block">Experience Level</label>
                        <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field">
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Lead/Manager">Lead / Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label mb-2 block">Vacancies</label>
                        <input type="number" name="vacancy" value={formData.vacancy} onChange={handleChange} min="1" className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-2 block">Annual Salary Range (₹)</label>
                      <div className="flex items-center gap-3">
                        <input type="number" name="salaryRange.min" value={formData.salaryRange.min} onChange={handleChange} className="input-field" placeholder="Min" />
                        <span className="text-textMuted font-bold">—</span>
                        <input type="number" name="salaryRange.max" value={formData.salaryRange.max} onChange={handleChange} className="input-field" placeholder="Max" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: EXPERTISE */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="form-label mb-2 block">Required Skills</label>
                      <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} className="input-field" placeholder="React, Node.js, UI/UX (Comma separated)" />
                    </div>
                    <div>
                      <label className="form-label mb-2 block">Responsibilities <span className="text-textMuted font-normal italic">(One per line)</span></label>
                      <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Develop user-facing features...&#10;Optimize app performance..." />
                    </div>
                    <div>
                      <label className="form-label mb-2 block">Requirements <span className="text-textMuted font-normal italic">(One per line)</span></label>
                      <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Bachelor's in CS...&#10;3+ years of experience..." />
                    </div>
                  </div>
                )}

                {/* STEP 4: FINALIZE */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-border rounded-2xl p-6">
                      <h3 className="text-xs font-extrabold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-brand" /> Final Review
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted font-medium">Job Title</span>
                          <span className="text-text font-bold">{formData.title || 'Untitled'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted font-medium">Type / Mode</span>
                          <span className="text-text font-bold">{formData.jobType} / {formData.workMode}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-textMuted font-medium">Location</span>
                          <span className="text-text font-bold">{formData.location || 'Remote'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-2 block">Deadline to Apply</label>
                      <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="input-field" required />
                    </div>
                    <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl text-xs text-textMuted leading-relaxed flex items-start gap-3">
                      <FaRocket className="text-brand shrink-0 mt-0.5" />
                      <span>Ready to find your next star? By clicking "Publish", your job will be immediately visible to all eligible candidates.</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-10 pt-8 border-t border-border">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`flex items-center gap-2 text-sm font-bold text-textMuted hover:text-text transition-colors ${step === 1 ? 'invisible' : ''}`}
                  >
                    <FaArrowLeft className="text-[10px]" /> Back
                  </button>

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary py-2.5 px-8 text-sm flex items-center gap-2 shadow-soft"
                    >
                      Continue <FaArrowRight className="text-[10px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary py-2.5 px-10 text-sm flex items-center gap-2 shadow-lg shadow-brand/20"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...</>
                      ) : (
                        <><FaCheck className="text-xs" /> Publish Job</>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-[10px] text-textMuted mt-12 font-bold uppercase tracking-widest opacity-40">
          CareerConnect Secure Recruitment
        </p>
      </div>
    </div>
  );
};

export default JobPost;