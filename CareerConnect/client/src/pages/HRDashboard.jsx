import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import Loader from '../components/common/Loader';
import uploadService from '../services/uploadService';
import applicationService from '../services/applicationService';
import chatService from '../services/chatService';
import { FaBriefcase, FaUsers, FaComments, FaCheck, FaTimes, FaHourglassHalf, FaFilePdf, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [applicants, setApplicants] = useState({});

  useEffect(() => {
    async function fetchHRJobs() {
      setLoading(true);
      setError(null);
      try {
        // Fetch jobs posted by the company/HR
        const res = await axios.get('/jobs/mine');
        setJobs(res.data);
      } catch (err) {
        setError('Failed to fetch job list. Ensure your account is linked to a company.');
        setJobs([]);
      }
      setLoading(false);
    }
    fetchHRJobs();
  }, []);

  const fetchApplicants = async (jobId) => {
    setLoading(true);
    setActiveJob(jobId);
    setApplicants({});
    setError(null);
    try {
      const res = await axios.get(`/applications/jobs/${jobId}/applications`);
      const grouped = res.data.reduce((acc, app) => {
        acc[app.status] = acc[app.status] || [];
        acc[app.status].push(app);
        return acc;
      }, { pending: [], approved: [], rejected: [] });
      setApplicants(grouped);
    } catch (err) {
      console.error("Applicant fetch error:", err);
      setError('Failed to fetch applicants for this job.');
      setApplicants({ pending: [], approved: [], rejected: [] });
    }
    setLoading(false);
  };

  const updateApplicantStatus = async (appId, newStatus) => {
    try {
      console.debug('[HRDashboard] updateApplicantStatus called', { appId, newStatus });
      await applicationService.updateApplicationStatus(appId, newStatus);
      fetchApplicants(activeJob);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
      setError('Failed to update status.');
    }
  };

  const initiateChat = async (candidateId, jobId) => {
    try {
      console.debug('[HRDashboard] initiateChat called', { candidateId, jobId });
      // POST /chat - Create or get existing chat session
      const res = await chatService.createChat({ jobId: jobId, partnerId: candidateId });
      // Redirect to a dedicated chat page (uses the new /chats/:chatId route)
      navigate(`/chats/${res._id}`);
    } catch (err) {
      // Show server-provided message when available
      const serverMsg = err?.response?.data?.message;
      console.error('Chat initiation error', err);
      alert(serverMsg || err.message || 'Failed to start chat. Chat may already exist or an error occurred.');
    }
  };


  const renderApplicantCard = (app) => (
    <div key={app._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 className="font-bold text-lg">{app.candidate?.name || 'N/A'}</h4>
      <p className="text-sm text-gray-600 mb-2">{app.candidate?.email}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {/* FIX 1: Correct Resume Link to the backend endpoint, avoiding React Router interception */}
        {app.resumeFileId ? (
          <button
            onClick={async () => {
              // open a blank window synchronously to avoid popup blockers
              const win = window.open('', '_blank');
              try {
                const blob = await uploadService.downloadFile(app.resumeFileId);
                const url = window.URL.createObjectURL(blob);
                if (win) {
                  win.location.href = url;
                } else {
                  // popup was blocked, fallback to opening directly
                  window.open(url, '_blank');
                }
              } catch (err) {
                if (win) win.close();
                alert('Failed to download resume.');
                console.error('Resume download error:', err);
              }
            }}
            className="text-blue-600 hover:underline text-sm flex items-center gap-1 font-semibold"
          >
            <FaFilePdf /> View Resume
          </button>
        ) : (
          <span className="text-red-500 text-sm flex items-center gap-1"><FaExclamationTriangle /> Resume Missing</span>
        )}

        {/* FIX 2: Chat Initiation Logic */}
        <button
          onClick={() => initiateChat(app.candidate._id, app.job?._id)}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1 font-semibold ml-4"
          disabled={!app.candidate?._id || !app.job} // Disable if data is missing
        >
          <FaComments /> Chat
        </button>
      </div>

      {app.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => updateApplicantStatus(app._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-600">
            <FaCheck /> Approve
          </button>
          <button onClick={() => updateApplicantStatus(app._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-red-600">
            <FaTimes /> Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Left Column: Job List */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-card p-6 border border-border shadow-soft h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-text flex items-center gap-3 border-b border-border pb-4"><FaBriefcase className="text-brand" /> Manage Jobs</h2>
          {loading ? <div className="py-10 flex justify-center"><Loader /></div> : error ? <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3 text-sm font-medium"><FaExclamationTriangle className="text-lg" /> {error}</div> : (
            <div className="flex flex-col gap-4 flex-grow">
              <button onClick={() => navigate('/jobs/post')} className="btn-primary w-full py-3 mb-2 shadow-sm">Post a New Job</button>
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {jobs.map(job => (
                  <div key={job._id} className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all border ${activeJob === job._id ? 'bg-brand/5 border-brand border-l-4' : 'bg-gray-50 border-gray-100 hover:border-gray-300 hover:bg-gray-100 hover:shadow-md'}`} onClick={() => fetchApplicants(job._id)}>
                    <div className={`font-bold text-lg mb-1 leading-tight ${activeJob === job._id ? 'text-brand' : 'text-text'}`}>{job.title}</div>
                    <span className="block text-sm text-textMuted font-medium">{job.company?.name || 'N/A'}</span>
                  </div>
                ))}
                {jobs.length === 0 && <div className="text-textMuted text-sm font-medium p-8 bg-gray-50 rounded-xl border-2 border-dashed border-border text-center">No jobs posted yet.<br />Start by posting a new opportunity!</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Applicant Management */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card p-6 md:p-8 border border-border shadow-soft min-h-[600px] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-text flex items-center gap-3 border-b border-border pb-4"><FaUsers className="text-brand" /> Applicants Review</h2>

          {activeJob ? (
            <div className="flex flex-col gap-8 flex-grow">
              <div className="bg-gray-50 p-5 rounded-2xl border border-border">
                <span className="text-sm font-bold text-textMuted tracking-wider uppercase">Showing Applicants For:</span>
                <h3 className="text-2xl font-extrabold text-brand mt-1">{jobs.find(j => j._id === activeJob)?.title}</h3>
              </div>

              {loading ? <div className="py-20 flex justify-center h-full items-center"><Loader /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                  {['pending', 'approved', 'rejected'].map(status => (
                    <div key={status} className="flex flex-col bg-gray-50/50 rounded-2xl overflow-hidden border border-border shadow-inner">
                      <div className={`font-bold text-white px-4 py-3 flex items-center justify-between shadow-sm`}
                        style={{ backgroundColor: status === 'pending' ? '#eab308' : status === 'approved' ? '#10b981' : '#f43f5e' }}>
                        <span className="flex items-center gap-2"><FaHourglassHalf className={status === 'pending' ? 'block' : 'hidden'} /> <FaCheck className={status === 'approved' ? 'block' : 'hidden'} /> <FaTimes className={status === 'rejected' ? 'block' : 'hidden'} /> {status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">{applicants[status]?.length || 0}</span>
                      </div>
                      <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-grow min-h-[300px]">
                        {applicants[status]?.length ? (
                          applicants[status].map(renderApplicantCard)
                        ) : (
                          <div className="text-textMuted text-sm font-medium p-6 bg-white rounded-xl border border-dashed border-border text-center shadow-sm h-full flex items-center justify-center italic">No {status} applicants.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-grow p-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-border text-center text-textMuted">
              <div>
                <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-lg">Select a job from the left menu to view its applicants.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default HRDashboard;