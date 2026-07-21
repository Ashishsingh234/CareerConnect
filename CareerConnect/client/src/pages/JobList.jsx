import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../services/jobService';
import JobCard from '../components/jobs/JobCard';
import JobFilter from '../components/jobs/JobFilter';
import Loader from '../components/common/Loader';
import applicationService from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import {
  FaSearch, FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign,
  FaCheckCircle, FaPaperPlane, FaCheck, FaBookmark, FaRegBookmark,
  FaComments, FaExclamationTriangle, FaTimes, FaArrowRight
} from 'react-icons/fa';
import AuthImage from '../components/common/AuthImage';

const JobList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    keyword: '', location: '', experienceLevel: '',
    salaryMax: null, positions: [], jobTypes: [], salaryRangeLabel: '',
    salaryMin: null, functions: [],
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyStatus, setApplyStatus] = useState(null);
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [applyError, setApplyError] = useState(null);

  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Debounce search → keyword filter
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => ({ ...f, keyword: searchTerm }));
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const resetPage = () => setPage(1);

  // Fetch jobs
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 6,
          keyword: filters.keyword,
          location: filters.location,
          experienceLevel: filters.experienceLevel,
          workModes: filters.positions.join(','),
          jobTypes: filters.jobTypes.join(','),
          functions: filters.functions.join(','),
        };

        if (filters.salaryMin !== null) params.salaryMin = filters.salaryMin;
        if (filters.salaryMax !== null) params.salaryMax = filters.salaryMax;
        const response = await jobService.getJobs(params);
        // Backend now returns { jobs, totalJobs, totalPages, currentPage }
        const jobData = response.jobs || [];
        setJobs(jobData);
        setTotalJobs(response.totalJobs || 0);
        setTotalPages(response.totalPages || 1);

        if (jobData.length && (!selectedJob || !jobData.find(j => j._id === selectedJob._id))) {
          setSelectedJob(jobData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
      }
      setLoading(false);
    }
    fetchJobs();
  }, [page, filters]);

  // When selected job changes, check apply/save status
  useEffect(() => {
    if (!selectedJob || user?.role !== 'candidate') return;
    (async () => {
      try {
        const apps = await applicationService.viewOwnApplications();
        setApplyStatus(apps.some(a => a.job?._id === selectedJob._id) ? 'applied' : 'not_applied');
        const saved = await jobService.getSavedJobs();
        setIsSaved(saved.some(j => j._id === selectedJob._id));
      } catch {
        setApplyStatus('not_applied');
        setIsSaved(false);
      }
    })();
  }, [selectedJob, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyStatus('applying');
    setApplyError(null);
    try {
      await applicationService.applyToJob(selectedJob._id, { coverLetter });
      setApplyStatus('applied');
      setApplyModal(false);
      setCoverLetter('');
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to apply. Ensure your profile has a resume.');
      setApplyStatus('not_applied');
    }
  };

  const handleSave = async () => {
    try {
      const res = await jobService.saveJob(selectedJob._id);
      setIsSaved(res.savedJobs.includes(selectedJob._id));
    } catch { }
  };

  // ── Helpers
  const formatSalary = (val) => {
    if (!val && val !== 0) return null;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
    return `₹${val}`;
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-8 pb-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2.5 rounded-xl border border-border text-textMuted hover:text-brand hover:border-brand/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;
          // Simple pagination logic: show current, first, last, and neighbors
          if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
            if (p === 2 || p === totalPages - 1) return <span key={p} className="text-textMuted">...</span>;
            return null;
          }
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-brand text-white shadow-soft' : 'text-textMuted hover:bg-gray-50 hover:text-text border border-transparent'}`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2.5 rounded-xl border border-border text-textMuted hover:text-brand hover:border-brand/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    );
  };

  const DetailPanel = ({ job }) => {
    if (!job) return (
      <div className="hidden lg:flex items-center justify-center h-full text-textMuted text-sm border border-dashed border-border rounded-2xl p-8">
        Select a job to view details
      </div>
    );

    const companyName = job.company?.name || job.companyName || 'Company';
    const employmentType = job.employmentType || job.jobType || 'Fulltime';
    const workMode = job.isRemote ? 'Remote' : (job.workMode || 'Onsite');
    const salaryDisplay = job.salaryRange?.min
      ? `${formatSalary(job.salaryRange.min)} – ${formatSalary(job.salaryRange.max)}`
      : job.salary ? formatSalary(job.salary) : 'Negotiable';
    const isCandidate = user?.role === 'candidate';

    return (
      <div className="bg-white border border-border rounded-2xl overflow-y-auto max-h-[calc(100vh-120px)] animate-slide-in shadow-soft">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gray-50/30">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {job.company?.logoUrl || job.companyLogoUrl ? (
                <AuthImage src={job.company?.logoUrl || job.companyLogoUrl} alt={companyName} className="w-full h-full object-contain p-1"
                  fallback={<span className="text-xl font-extrabold text-brand">{companyName.charAt(0)}</span>}
                />
              ) : (
                <span className="text-xl font-extrabold text-brand">{companyName.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-text leading-tight">{job.title}</h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mt-1">
                <FaCheckCircle className="text-[10px]" /> {companyName}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: <FaMapMarkerAlt />, label: 'Job Location', value: job.location || 'Not specified' },
              { icon: <FaBriefcase />, label: 'Job Position', value: workMode },
              { icon: <FaClock />, label: 'Job Type', value: employmentType },
              { icon: <FaDollarSign />, label: 'Salary Range', value: salaryDisplay },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl px-3 py-2.5 border border-border">
                <div className="flex items-center gap-1 text-[10px] font-bold text-textMuted uppercase tracking-wide mb-1">
                  <span className="text-brand text-[10px]">{m.icon}</span> {m.label}
                </div>
                <div className="text-xs font-bold text-text">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Posted */}
          {job.createdAt && (
            <p className="text-[11px] text-textMuted mb-4 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-textMuted rounded-full" />
              Posted {Math.floor((Date.now() - new Date(job.createdAt)) / 86400000)} days ago
              {job.company?._id && (
                <button onClick={() => navigate(`/companies/${job.company._id}`)} className="ml-1 text-brand font-semibold hover:underline">
                  • View Company
                </button>
              )}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2">
            {isCandidate ? (
              <>
                {applyStatus === 'applied' ? (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl font-bold text-sm">
                    <FaCheck className="text-xs" /> Applied!
                  </div>
                ) : (
                  <button onClick={() => setApplyModal(true)} className="flex-1 btn-primary py-2.5 text-sm">
                    <FaPaperPlane className="text-xs" /> Apply quickly now
                  </button>
                )}
                <button onClick={handleSave} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${isSaved ? 'border-brand bg-brand/10 text-brand' : 'border-border text-textMuted hover:text-brand hover:border-brand/30'}`}>
                  {isSaved ? <FaBookmark className="text-xs" /> : <FaRegBookmark className="text-xs" />}
                </button>
              </>
            ) : !user ? (
              <button onClick={() => navigate('/login', { state: { from: window.location.pathname + window.location.search } })} className="flex-1 btn-primary py-2.5 text-sm shadow-soft">Login to Apply</button>
            ) : (
              <div className="text-xs text-textMuted bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-center w-full font-medium">
                Only candidates can apply.
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {job.description && (
            <div>
              <h3 className="text-sm font-extrabold text-text mb-2">Description</h3>
              <p className="text-xs text-textMuted leading-relaxed line-clamp-6">{job.description}</p>
              {job.description.length > 300 && (
                <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-xs text-brand font-semibold mt-1 hover:underline">
                  Read more...
                </button>
              )}
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-text mb-2">Responsibilities</h3>
              <ul className="space-y-2">
                {job.responsibilities.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-textMuted">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-text mb-2">Requirement</h3>
              <ul className="space-y-2">
                {job.requirements.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-textMuted">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.requiredSkills?.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-text mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s, i) => <span key={i} className="badge-green text-[11px] px-2.5 py-1">{s}</span>)}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-brand border border-brand/30 rounded-xl py-2.5 hover:bg-brand hover:text-white transition-all shadow-sm"
          >
            View Full Details <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
      {/* Search bar */}
      <div className="bg-white border-b border-border px-6 py-6 sticky top-16 z-40">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3 bg-white border border-border rounded-2xl px-5 py-3 shadow-soft focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/5 transition-all">
            <FaSearch className="text-textMuted text-lg" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, skill..."
              className="flex-1 bg-transparent text-sm font-medium text-text outline-none placeholder-textMuted"
            />
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="max-w-[1440px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr_380px] gap-6">

        {/* LEFT: Filter sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white border border-border rounded-2xl p-6 sticky top-44 shadow-soft">
            <JobFilter filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} />
          </div>
        </aside>

        {/* CENTER: Job Grid */}
        <main>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-text tracking-tight">
              {totalJobs} <span className="text-textMuted font-semibold text-base">Jobs Found</span>
            </h2>
            <div className="text-xs font-bold text-textMuted uppercase tracking-widest">
              Page {page} of {totalPages}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-white border border-border rounded-3xl shadow-soft">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
                <FaSearch className="text-2xl text-gray-300" />
              </div>
              <p className="font-extrabold text-text text-lg">No jobs match your criteria.</p>
              <p className="text-sm text-textMuted mt-1">Try adjusting filters or search terms.</p>
              <button
                onClick={() => { setSearchTerm(''); setFilters({ keyword: '', location: '', positions: [], jobTypes: [] }); setPage(1); }}
                className="mt-6 text-brand font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={setSelectedJob}
                    isSelected={selectedJob?._id === job._id}
                  />
                ))}
              </div>
              <Pagination />
            </>
          )}
        </main>

        {/* RIGHT: Detail panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-44">
            <DetailPanel job={selectedJob} />
          </div>
        </aside>
      </div>

      {/* Mobile filter & detail (simplified) */}
      <div className="lg:hidden px-4 pb-6">
        <div className="bg-white border border-border rounded-2xl p-5 mb-4">
          <JobFilter filters={filters} setFilters={setFilters} />
        </div>
        {selectedJob && (
          <div className="bg-white border border-brand/30 rounded-2xl p-5">
            <h3 className="font-extrabold text-text mb-1">{selectedJob.title}</h3>
            <p className="text-xs text-brand font-semibold mb-3">{selectedJob.company?.name || selectedJob.companyName}</p>
            <button onClick={() => navigate(`/jobs/${selectedJob._id}`)} className="btn-primary text-sm w-full justify-center">
              View Full Details <FaArrowRight className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-border shadow-xl p-8 relative">
            <button onClick={() => { setApplyModal(false); setApplyError(null); }} className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border flex items-center justify-center text-textMuted hover:text-text transition-colors">
              <FaTimes className="text-xs" />
            </button>
            <h2 className="text-xl font-extrabold text-text mb-1">Apply for <span className="text-brand">{selectedJob.title}</span></h2>
            <p className="text-sm text-textMuted mb-5">Your resume from your profile will be attached automatically.</p>
            {applyError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm font-medium">
                <FaExclamationTriangle /> {applyError}
              </div>
            )}
            <form onSubmit={handleApply}>
              <label className="form-label">Cover Letter <span className="text-textMuted font-normal">(Optional)</span></label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} className="input-field mb-5 resize-none" placeholder="Highlight why you're a great fit..." />
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => { setApplyModal(false); setApplyError(null); }} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm"><FaPaperPlane className="text-xs" /> Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;