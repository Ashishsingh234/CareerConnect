import React, { useEffect, useState } from 'react';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import {
  FaPaperPlane, FaTimes, FaCheck, FaComments, FaExclamationTriangle,
  FaBookmark, FaRegBookmark, FaMapMarkerAlt, FaBriefcase, FaClock,
  FaDollarSign, FaCheckCircle, FaBuilding, FaArrowLeft
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import AuthImage from '../components/common/AuthImage';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const jobData = await jobService.getJobById(id);
      setJob(jobData);
      if (user?.role === 'candidate' && user.id) {
        const applications = await applicationService.viewOwnApplications();
        const hasApplied = applications.some(app => app.job?._id === id);
        setApplyStatus(hasApplied ? 'applied' : 'not_applied');
        const savedJobs = await jobService.getSavedJobs();
        setIsSaved(savedJobs.some(j => j._id === id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job not found.');
      setJob(null);
    }
    setLoading(false);
  };

  useEffect(() => { if (id) fetchJob(); }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyStatus('applying');
    setError(null);
    try {
      await applicationService.applyToJob(id, { coverLetter });
      setApplyStatus('applied');
      setApplyModalOpen(false);
      setCoverLetter('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply. Ensure your profile has a resume.');
      setApplyStatus('not_applied');
    }
  };

  const handleSaveJob = async () => {
    try {
      const result = await jobService.saveJob(id);
      setIsSaved(result.savedJobs.includes(id));
    } catch { }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader /></div>;
  if (error || !job) return (
    <div className="max-w-2xl mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium flex items-center gap-3">
      <FaExclamationTriangle /> {error || 'Job not found.'}
    </div>
  );

  const isCandidate = user?.role === 'candidate';
  const companyName = job.company?.name || job.companyName || 'Company';
  const employmentType = job.employmentType || job.jobType || 'Fulltime';
  const workMode = job.isRemote ? 'Remote' : (job.workMode || 'Onsite');

  const formatSalary = (val) => {
    if (!val && val !== 0) return null;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
    return `₹${val}`;
  };
  const salaryDisplay = job.salaryRange?.min
    ? `${formatSalary(job.salaryRange.min)} – ${formatSalary(job.salaryRange.max)}/yr`
    : job.salary ? formatSalary(job.salary) : null;

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto animate-fade-in-up">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-textMuted hover:text-brand transition-colors mb-6"
        >
          <FaArrowLeft className="text-xs" /> Back to Jobs
        </button>

        {/* ── Header Card ───────────────────────────────── */}
        <div className="bg-white border border-border rounded-3xl p-7 mb-5 shadow-card">
          <div className="flex items-start gap-5 mb-6">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl border border-border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {job.company?.logoUrl || job.companyLogoUrl ? (
                <AuthImage src={job.company?.logoUrl || job.companyLogoUrl} alt={companyName} className="w-full h-full object-contain p-1"
                  fallback={<span className="text-2xl font-extrabold text-brand">{companyName.charAt(0)}</span>}
                />
              ) : (
                <span className="text-2xl font-extrabold text-brand">{companyName.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-extrabold text-text truncate leading-snug">{job.title}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-brand">
                <FaCheckCircle className="text-xs" />
                {companyName}
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { icon: <FaMapMarkerAlt />, label: 'Job Location', value: job.location || 'Not specified' },
              { icon: <FaBriefcase />, label: 'Job Position', value: workMode },
              { icon: <FaClock />, label: 'Job Type', value: employmentType },
              { icon: <FaDollarSign />, label: 'Salary Range', value: salaryDisplay || 'Negotiable' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-3.5 border border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-textMuted mb-1.5">
                  <span className="text-brand text-[11px]">{m.icon}</span> {m.label}
                </div>
                <div className="text-sm font-bold text-text">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Posted date */}
          {job.createdAt && (
            <p className="text-xs text-textMuted mb-5">
              Posted {Math.floor((Date.now() - new Date(job.createdAt)) / 86400000)} days ago
              {job.company?._id && (
                <button onClick={() => navigate(`/companies/${job.company._id}`)} className="ml-2 text-brand hover:underline font-semibold">
                  Other job vacancies from this company →
                </button>
              )}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            {isCandidate && (
              <>
                {applyStatus === 'applied' ? (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl font-bold text-sm">
                    <FaCheck /> Applied!
                  </div>
                ) : applyStatus === 'applying' ? (
                  <div className="flex-1 flex justify-center"><Loader /></div>
                ) : (
                  <button onClick={() => setApplyModalOpen(true)} className="flex-1 btn-primary py-3 text-sm">
                    <FaPaperPlane className="text-xs" /> Apply quickly now
                  </button>
                )}
                <button
                  onClick={handleSaveJob}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${isSaved ? 'border-brand bg-brand/10 text-brand' : 'border-border text-textMuted hover:border-brand/30 hover:text-brand'}`}
                >
                  {isSaved ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
                </button>
                <button className="w-11 h-11 rounded-xl border border-border text-textMuted hover:text-brand hover:border-brand/30 flex items-center justify-center transition-all">
                  <FaComments className="text-sm" />
                </button>
              </>
            )}
            {!isCandidate && user && (
              <div className="text-textMuted text-sm px-5 py-3 border border-border rounded-xl bg-gray-50 w-full text-center font-medium">
                Only candidates can apply.
              </div>
            )}
            {!user && (
              <button onClick={() => navigate('/login', { state: { from: window.location.pathname } })} className="flex-1 btn-primary py-3 text-sm">
                Login to Apply
              </button>
            )}
          </div>
        </div>

        {/* ── Description ───────────────────────────────── */}
        <div className="bg-white border border-border rounded-3xl p-7 mb-5 shadow-card space-y-7">
          {job.description && (
            <div>
              <h2 className="text-base font-extrabold text-text mb-3">Description</h2>
              <p className="text-sm text-textMuted leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-text mb-3">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-textMuted">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-text mb-3">Requirement</h2>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-textMuted">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requiredSkills?.length > 0 && (
            <div>
              <h2 className="text-base font-extrabold text-text mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s, i) => (
                  <span key={i} className="badge-green">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Applied success banner */}
        {isCandidate && applyStatus === 'applied' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
            <div>
              <h4 className="font-bold text-emerald-700 flex items-center gap-2"><FaComments /> Application Submitted</h4>
              <p className="text-sm text-emerald-600 mt-0.5">Chat with the recruiter from your dashboard.</p>
            </div>
            <button onClick={() => navigate('/dashboard/candidate')} className="btn-primary text-sm whitespace-nowrap">
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* ── Apply Modal ──────────────────────────────────── */}
      {applyModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-border shadow-xl p-8 relative">
            <button
              onClick={() => { setApplyModalOpen(false); setError(null); }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border flex items-center justify-center text-textMuted hover:text-text transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>

            <h2 className="text-2xl font-extrabold text-text mb-1">Apply for <span className="text-brand">{job.title}</span></h2>
            <p className="text-sm text-textMuted mb-6">Your resume from your profile will be automatically attached.</p>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm font-medium">
                <FaExclamationTriangle /> {error}
              </div>
            )}

            <form onSubmit={handleApply}>
              <label className="form-label">Cover Letter <span className="text-textMuted font-normal">(Optional)</span></label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                className="input-field mb-6 resize-none"
                placeholder="Why are you a great fit for this role?"
              />
              <div className="flex justify-end gap-3 pt-5 border-t border-border">
                <button type="button" onClick={() => { setApplyModalOpen(false); setError(null); }} className="btn-secondary text-sm px-5">Cancel</button>
                <button type="submit" className="btn-primary text-sm px-6"><FaPaperPlane className="text-xs" /> Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;