import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import Loader from '../components/common/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/common/PostCard';
import JobCard from '../components/jobs/JobCard';
import { FaEdit, FaCheck, FaTimes, FaGlobe, FaMapMarkerAlt, FaBuilding, FaInfoCircle, FaUpload, FaUsers, FaUserPlus, FaEnvelope, FaLock } from 'react-icons/fa';
import uploadService from '../services/uploadService';
import AuthImage from '../components/common/AuthImage';

const CompanyProfile = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', website: '', industry: '', location: '' });
  const [error, setError] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [companyPosts, setCompanyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'jobs'
  const navigate = useNavigate();

  const normalizeUrl = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  // HR Modal State
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [hrForm, setHrForm] = useState({ name: '', email: '', password: '' });
  const [hrError, setHrError] = useState(null);
  const [hrSuccess, setHrSuccess] = useState(null);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = id ? `/companies/${id}` : '/companies/me';
      const res = await axios.get(url);
      const data = res.data;
      setCompany(data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        website: data.website || '',
        industry: data.industry || '',
        location: data.location || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch company profile.');
      setCompany(null);
    }
    setLoading(false);
  };

  const loadCompanyPosts = async (companyId) => {
    try {
      const posts = await import('../services/postService').then(m => m.default.list({ companyId }));
      setCompanyPosts(posts || []);
    } catch (err) { console.error('Failed to load company posts', err); setCompanyPosts([]); }
  };

  useEffect(() => {
    // Fetch company when the route id or user changes
    fetchCompany();
  }, [user, id]);

  // Load company posts whenever the company data is available/changes
  useEffect(() => {
    if (company && company._id) loadCompanyPosts(company._id);
  }, [company]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleHrChange = e => setHrForm({ ...hrForm, [e.target.name]: e.target.value });

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setError(null);
    try {
      await uploadService.uploadLogo(logoFile, company._id);
      await fetchCompany();
    } catch (err) {
      setError('Failed to upload logo.');
    }
    setLogoFile(null);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await axios.put('/companies/me', form);
      setEditMode(false);
      // Re-fetch company profile to get the new logo URL
      fetchCompany();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    }
  };

  const handleCreateHR = async (e) => {
    e.preventDefault();
    setHrError(null);
    setHrSuccess(null);
    try {
      // API call to POST /companies/hr
      const res = await axios.post('/companies/hr', hrForm);
      setHrSuccess(`HR account for ${res.data.name} created successfully!`);
      setHrForm({ name: '', email: '', password: '' });
      setIsHrModalOpen(false);
      fetchCompany(); // Re-fetch to update HR list
    } catch (err) {
      setHrError(err.response?.data?.message || 'Failed to create HR account.');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50/40 flex justify-center items-center font-sans"><Loader /></div>;
  if (error && !company) return <div className="min-h-screen bg-gray-50/40 p-8 text-red-600 text-center font-bold">{error}</div>;
  if (!company) return <div className="min-h-screen bg-gray-50/40 p-8 text-textMuted text-center font-bold">Company profile not found.</div>;

  // Determine if the current logged-in user is the owner of this company profile
  const isCompanyOwner = Boolean(
    company && user && user.role === 'company' && (!id || user.company === company._id)
  );

  return (
    <div className="min-h-screen bg-gray-50/40 px-4 py-12 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white p-6 md:p-8 border border-border rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px]"></div>

          <div className="relative z-10 flex items-center gap-6 mb-6 md:mb-0">
            <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-border shadow-sm flex-shrink-0 p-1">
              <AuthImage src={company.logoUrl || '/default-logo.png'} alt={company.name} className="w-full h-full object-cover rounded-xl" fallback={<img src="/default-logo.png" alt={company.name} className="w-full h-full object-cover rounded-xl" />} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight mb-1">{company.name}</h2>
              <div className="text-brand font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand"></div> {company.industry}</div>
            </div>
          </div>

          {isCompanyOwner && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${editMode ? 'bg-gray-100 text-text border border-border hover:bg-gray-200' : 'btn-primary'}`}
            >
              <FaEdit /> {editMode ? 'View Profile' : 'Edit Profile'}
            </button>
          )}
        </div>

        {error && <div className="text-red-600 p-4 border border-red-200 bg-red-50 rounded-xl font-bold text-sm shadow-sm">{error}</div>}
        {hrSuccess && <div className="text-emerald-700 p-4 border border-emerald-200 bg-emerald-50 rounded-xl font-bold text-sm shadow-sm">{hrSuccess}</div>}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {editMode ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-soft relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full filter blur-[40px]"></div>
                <h3 className="text-xl font-bold mb-6 text-text flex items-center gap-2 relative z-10 tracking-tight"><div className="w-1.5 h-6 bg-blue-500 rounded-full"></div> Edit Details</h3>

                <div className="relative z-10 space-y-5">
                  <div className="flex flex-col">
                    <label className="text-textMuted text-xs font-bold uppercase tracking-widest mb-2 block">Company Logo</label>
                    <input type="file" onChange={e => setLogoFile(e.target.files[0])} className="w-full text-sm text-textMuted file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-border file:shadow-sm file:text-sm file:font-bold file:bg-white file:text-text hover:file:bg-gray-50 transition-colors cursor-pointer mb-3" />
                    <button onClick={handleLogoUpload} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!logoFile}>
                      <FaUpload /> Upload Logo
                    </button>
                  </div>

                  <input name="name" value={form.name} onChange={handleChange} placeholder="Company Name" className="input-field" />
                  <input name="website" value={form.website} onChange={handleChange} placeholder="Website URL" className="input-field" />
                  <input name="industry" value={form.industry} onChange={handleChange} placeholder="Industry" className="input-field" />
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="input-field" />
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input-field resize-none" rows="6" />

                  <div className="flex flex-col gap-3 pt-4 border-t border-border mt-2">
                    <button onClick={handleSave} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-extrabold transition-all shadow-sm w-full"><FaCheck /> Save Changes</button>
                    <button onClick={() => { setEditMode(false); setForm({ name: company.name, description: company.description, website: company.website, industry: company.industry, location: company.location }); }} className="flex items-center justify-center gap-2 bg-gray-50 border border-border text-text p-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-sm w-full"><FaTimes /> Cancel Editing</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-soft relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 rounded-full filter blur-[40px]"></div>
                <h3 className="text-xl font-bold mb-6 text-text flex items-center gap-2 relative z-10 tracking-tight"><div className="w-1.5 h-6 bg-brand rounded-full"></div> Company Overview</h3>
                <div className="space-y-4 pt-2 relative z-10">
                  <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand shadow-sm border border-border"><FaGlobe /></div> <div className="flex-1"><div className="text-xs text-textMuted font-bold mb-1 uppercase tracking-widest">Website</div><a href={normalizeUrl(company.website)} className="text-brand hover:underline transition-colors font-semibold truncate block w-full" target="_blank" rel="noopener noreferrer">{company.website || 'N/A'}</a></div></div>
                  <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand shadow-sm border border-border"><FaBuilding /></div> <div className="flex-1"><div className="text-xs text-textMuted font-bold mb-1 uppercase tracking-widest">Industry</div><span className="font-semibold text-text">{company.industry || 'N/A'}</span></div></div>
                  <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand shadow-sm border border-border"><FaMapMarkerAlt /></div> <div className="flex-1"><div className="text-xs text-textMuted font-bold mb-1 uppercase tracking-widest">Location</div><span className="font-semibold text-text">{company.location || 'N/A'}</span></div></div>
                </div>
                <div className="mt-8 border-t border-border pt-6 relative z-10">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-brand mt-1 flex-shrink-0 text-xl" />
                    <div>
                      <div className="text-xs text-textMuted font-bold mb-2 uppercase tracking-widest">About Us</div>
                      <p className="text-textMuted whitespace-pre-wrap font-medium leading-relaxed">{company.description || 'No description provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Right Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft">
              <h3 className="text-2xl font-bold mb-6 text-text flex items-center justify-between border-b border-border pb-5 tracking-tight">
                <div className="flex items-center gap-3"><div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500"><FaUsers /></div> HR Accounts ({company.hrAccounts?.length || 0})</div>
                {isCompanyOwner && (
                  <button onClick={() => { setIsHrModalOpen(true); setHrError(null); setHrSuccess(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 text-sm">
                    <FaUserPlus /> <span className="hidden sm:inline">Add HR</span>
                  </button>
                )}
              </h3>

              <div className="mt-6">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.hrAccounts?.length ? company.hrAccounts.map(hr => (
                    <li key={hr._id} className="bg-gray-50 p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-border hover:bg-white transition-colors">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-border flex items-center justify-center text-2xl text-gray-400 font-bold shadow-sm">
                        {hr.profileImageUrl ? <AuthImage src={hr.profileImageUrl} alt={hr.name} className="w-full h-full object-cover" /> : (hr.name?.[0]?.toUpperCase() || 'H')}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-extrabold text-text truncate">{hr.name}</div>
                        <div className="text-sm font-medium text-textMuted truncate">{hr.email}</div>
                      </div>
                    </li>
                  )) : (
                    <li className="col-span-full p-8 text-center text-textMuted font-medium bg-gray-50 border border-border border-dashed rounded-2xl">No HR accounts found. Click 'Add HR' to create one.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden flex flex-col h-full">
              <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab('posts')} className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'posts' ? 'bg-white text-text border border-border' : 'bg-transparent text-textMuted hover:text-text hover:bg-gray-100'}`}>
                    Company Posts ({companyPosts?.length || 0})
                  </button>
                  <button onClick={() => setActiveTab('jobs')} className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'jobs' ? 'bg-white text-text border border-border' : 'bg-transparent text-textMuted hover:text-text hover:bg-gray-100'}`}>
                    Company Jobs ({company.jobs?.length || 0})
                  </button>
                </div>
                {isCompanyOwner && activeTab === 'posts' && (
                  <button onClick={() => navigate('/jobs/post')} className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand/90 transition-all shadow-sm mr-2 text-sm">Post Job / Update</button>
                )}
              </div>

              <div className="p-6 md:p-8 flex-1 bg-white">
                {activeTab === 'posts' ? (
                  <div className="grid grid-cols-1 gap-6">
                    {companyPosts?.length ? companyPosts.map(p => <PostCard key={p._id} post={p} onUpdated={() => loadCompanyPosts(company._id)} />) : (
                      <div className="text-center p-10 bg-gray-50 border border-border border-dashed rounded-2xl shadow-sm">
                        <div className="text-4xl text-gray-300 mb-3 flex justify-center"><FaEdit /></div>
                        <p className="text-text font-bold text-lg">No company posts yet.</p>
                        <p className="text-sm text-textMuted mt-1 font-medium">Share news and updates with your followers.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {company.jobs?.length ? company.jobs.map(job => <JobCard key={job._id} job={job} />) : (
                      <div className="text-center p-10 bg-gray-50 border border-border border-dashed rounded-2xl shadow-sm">
                        <div className="text-4xl text-gray-300 mb-3 flex justify-center"><FaBuilding /></div>
                        <p className="text-text font-bold text-lg">No job postings yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* HR Creation Modal */}
        {isHrModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-border relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full filter blur-[40px]"></div>

              <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-4 text-text relative z-10 tracking-tight">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <FaUserPlus />
                </div>
                Create HR
              </h2>

              {hrError && <div className="text-red-600 p-4 border border-red-200 bg-red-50 rounded-xl mb-6 font-bold text-sm text-center shadow-sm relative z-10">{hrError}</div>}

              <form onSubmit={handleCreateHR} className="relative z-10 space-y-5">
                <div>
                  <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaUserPlus className="text-emerald-500" /> HR Full Name</label>
                  <input name="name" type="text" placeholder="John Doe" className="input-field" value={hrForm.name} onChange={handleHrChange} required />
                </div>
                <div>
                  <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaEnvelope className="text-emerald-500" /> Email Address</label>
                  <input name="email" type="email" placeholder="hr@company.com" className="input-field" value={hrForm.email} onChange={handleHrChange} required />
                </div>
                <div>
                  <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaLock className="text-emerald-500" /> Password</label>
                  <input name="password" type="password" placeholder="••••••••" className="input-field" value={hrForm.password} onChange={handleHrChange} required />
                </div>

                <div className="flex gap-4 pt-4 border-t border-border mt-2">
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-extrabold transition-all shadow-sm flex items-center justify-center gap-2">
                    <FaCheck /> Create
                  </button>
                  <button type="button" onClick={() => setIsHrModalOpen(false)} className="flex-1 bg-gray-50 border border-border text-text p-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;