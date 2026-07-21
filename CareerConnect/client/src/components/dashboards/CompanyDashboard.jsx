import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/api';
import Loader from '../common/Loader';
import { FaBuilding, FaPlus, FaUsers, FaBriefcase, FaEdit, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);
  const [applicantCount, setApplicantCount] = useState(0);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.companyId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/companies/me');
        const data = res.data;
        setCompany(data);
        setJobCount(data.jobs?.length || 0);
        // Applicant count is mocked as it needs complex API aggregation
        setApplicantCount(data.jobs?.length * 5 || 0);

      } catch (err) {
        console.error("Could not fetch company stats:", err);
      }
      setLoading(false);
    }
    fetchStats();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 px-4 py-8 md:py-12 transition-colors duration-500 font-sans">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="glass-card p-10 mb-12 border border-border shadow-soft rounded-3xl relative overflow-hidden group bg-white">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px] group-hover:bg-brand/10 transition-all duration-700"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full mix-blend-multiply filter blur-[80px] group-hover:bg-accent/10 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-4xl shadow-sm border border-brand/20"><FaBuilding /></div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">{company?.name || user.name || 'Company'}</span> Dashboard
              </h2>
              <p className="text-textMuted text-lg font-medium">Manage your company profile, post jobs, and track hiring progress.</p>
            </div>
          </div>
        </motion.div>

        {loading ? <div className="flex justify-center p-20"><Loader /></div> : (
          <>
            {/* Stats Overview */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand/10 rounded-lg text-brand"><FaChartLine className="text-xl" /></div>
              <h3 className="text-2xl font-bold text-text tracking-tight">Company Overview</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-border outline outline-1 outline-transparent transition-all border-l-4 border-l-brand">
                <div className="w-14 h-14 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-2xl mb-5 border border-brand/20 shadow-sm"><FaBriefcase /></div>
                <div className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Active Jobs</div>
                <div className="text-5xl font-extrabold text-text mt-1">{jobCount}</div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-border outline outline-1 outline-transparent transition-all border-l-4 border-l-emerald-500">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 text-2xl mb-5 border border-emerald-100 shadow-sm"><FaUsers /></div>
                <div className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Total Applicants (Est.)</div>
                <div className="text-5xl font-extrabold text-text mt-1">{applicantCount}</div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-border outline outline-1 outline-transparent transition-all border-l-4 border-l-pink-500">
                <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 text-2xl mb-5 border border-pink-100 shadow-sm"><FaBuilding /></div>
                <div className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">HR Accounts</div>
                <div className="text-5xl font-extrabold text-text mt-1">{company?.hrAccounts?.length || 0}</div>
              </motion.div>
            </div>

            {/* Action Buttons / Navigation */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-brand rounded-full inline-block"></div>
              <h3 className="text-2xl font-bold text-text tracking-tight">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/company-profile')}
                className="bg-white text-text p-8 rounded-2xl shadow-sm border border-border hover:border-brand hover:shadow-md transition-all flex flex-col items-center justify-center h-56 group text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-brand group-hover:text-white transition-colors mb-5 shadow-sm border border-border group-hover:border-transparent relative z-10">
                  <FaEdit className="text-2xl" />
                </div>
                <span className="text-xl font-bold mb-2 relative z-10">Manage Profile</span>
                <span className="text-sm text-textMuted font-medium relative z-10">Update info, logo, and HR accounts</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/jobs/post')}
                className="bg-white text-text p-8 rounded-2xl shadow-sm border border-border hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center justify-center h-56 group text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-5 shadow-sm border border-emerald-100 group-hover:border-transparent relative z-10">
                  <FaPlus className="text-2xl" />
                </div>
                <span className="text-xl font-bold mb-2 relative z-10">Post a New Job</span>
                <span className="text-sm text-textMuted font-medium relative z-10">Create and publish a new job opening</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/dashboard/hr')}
                className="bg-white text-text p-8 rounded-2xl shadow-sm border border-border hover:border-pink-500 hover:shadow-md transition-all flex flex-col items-center justify-center h-56 group text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors mb-5 shadow-sm border border-pink-100 group-hover:border-transparent relative z-10">
                  <FaUsers className="text-2xl" />
                </div>
                <span className="text-xl font-bold mb-2 relative z-10">HR Panel</span>
                <span className="text-sm text-textMuted font-medium relative z-10">Track applications and manage hiring</span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}