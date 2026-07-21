import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaBriefcase, FaEnvelopeOpenText, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AuthImage from '../common/AuthImage';

export default function HRDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Mock data for UI presentation
  const mockApplicants = [
    { id: 1, name: 'Alice Smith', role: 'Frontend Developer', status: 'pending', date: '2023-10-25', avatar: null },
    { id: 2, name: 'Bob Johnson', role: 'Backend Engineer', status: 'approved', date: '2023-10-24', avatar: null },
    { id: 3, name: 'Charlie Davis', role: 'UI/UX Designer', status: 'rejected', date: '2023-10-20', avatar: null }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><FaCheckCircle /> SHORTLISTED</span>
      case 'rejected': return <span className="bg-pink-900/30 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><FaTimesCircle /> REJECTED</span>
      default: return <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><FaHourglassHalf /> PENDING</span>
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 transition-colors duration-500">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="glass-card p-8 mb-8 border-[0.5px] border-primary-500/30 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full mix-blend-screen filter blur-[80px]"></div>
          <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center text-accent text-2xl shadow-inner border border-accent/30"><FaUsers /></div>
            <div>
              <h2 className="text-3xl font-extrabold text-textLight tracking-tight">HR Panel</h2>
              <p className="text-primary-300">Welcome, {user?.name || 'HR Manager'}. Here's your recruiting pipeline.</p>
            </div>
          </div>
          <div className="relative z-10 flex border border-primary-800 rounded-xl overflow-hidden bg-primary-900/20">
            <button
              className={`px-6 py-2 font-bold transition-colors ${activeTab === 'overview' ? 'bg-accent text-white shadow-inner' : 'text-primary-300 hover:bg-primary-800/50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-2 font-bold transition-colors border-l border-primary-800 ${activeTab === 'applicants' ? 'bg-accent text-white shadow-inner' : 'text-primary-300 hover:bg-primary-800/50'}`}
              onClick={() => setActiveTab('applicants')}
            >
              Applicants
            </button>
          </div>
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl shadow-lg border-t-2 border-t-accent text-center">
                <div className="text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">Open Positions</div>
                <div className="text-4xl font-extrabold text-textLight">12</div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl shadow-lg border-t-2 border-t-emerald-500 text-center">
                <div className="text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">Total Applications</div>
                <div className="text-4xl font-extrabold text-textLight">156</div>
              </motion.div>
              <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl shadow-lg border-t-2 border-t-pink-500 text-center">
                <div className="text-primary-400 font-semibold mb-2 uppercase tracking-wider text-sm">Action Required</div>
                <div className="text-4xl font-extrabold text-textLight">24</div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl shadow-lg border-[0.5px] border-primary-800">
              <h3 className="text-xl font-bold text-textLight mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-accent rounded-full inline-block"></div> Recent Hiring Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-primary-900/20 rounded-xl border border-primary-800/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><FaBriefcase /></div>
                  <div>
                    <p className="text-textLight font-medium">New job posted: <span className="text-accent font-bold">Senior React Developer</span></p>
                    <p className="text-xs text-primary-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary-900/20 rounded-xl border border-primary-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><FaEnvelopeOpenText /></div>
                  <div>
                    <p className="text-textLight font-medium">5 new applications for <span className="text-accent font-bold">UI/UX Designer</span></p>
                    <p className="text-xs text-primary-400 mt-1">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-primary-900/20 rounded-xl border border-primary-800/50">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center"><FaUsers /></div>
                  <div>
                    <p className="text-textLight font-medium">Interview scheduled with <span className="text-accent font-bold">Bob Johnson</span></p>
                    <p className="text-xs text-primary-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'applicants' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="glass-card p-0 rounded-2xl shadow-lg border-[0.5px] border-primary-800 overflow-hidden">
            <div className="p-6 border-b border-primary-800/50 bg-primary-900/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-textLight">Applicant Pipeline</h3>
              <input type="text" placeholder="Search applicants..." className="bg-primary-900/50 border border-primary-700 rounded-lg px-4 py-2 text-sm text-textLight focus:outline-none focus:border-accent w-64" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary-900/30 text-primary-300 text-sm font-semibold uppercase tracking-wider border-b border-primary-800">
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Applied Role</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-800/50">
                  {mockApplicants.map((applicant) => (
                    <motion.tr variants={itemVariants} key={applicant.id} className="hover:bg-primary-900/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AuthImage src={null} alt={applicant.name} className="w-10 h-10 rounded-full object-cover" fallback={<div className="w-10 h-10 rounded-full bg-primary-800 text-primary-200 flex items-center justify-center font-bold">{applicant.name.charAt(0)}</div>} />
                          <div>
                            <div className="font-bold text-textLight group-hover:text-accent transition-colors">{applicant.name}</div>
                            <div className="text-xs text-primary-400">View Profile</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary-200 font-medium">{applicant.role}</td>
                      <td className="px-6 py-4 text-primary-400 font-mono text-sm">{new Date(applicant.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getStatusBadge(applicant.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-accent hover:text-white border border-accent/50 hover:bg-accent px-4 py-1.5 rounded-lg text-sm font-bold transition-all">Review</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-primary-800/50 bg-primary-900/10 text-center text-primary-400 text-sm">
              Showing mock data for UI demonstration. Connect to backend API for real applicant data.
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}