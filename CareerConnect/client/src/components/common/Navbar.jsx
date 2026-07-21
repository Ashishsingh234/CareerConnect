import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaBell, FaBuilding, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AuthImage from './AuthImage';
import { roleRedirect } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getUserName = () => {
    if (!user) return null;
    if (user.role === 'company' && user.companyName) return user.companyName;
    if (user.role === 'hr' && user.companyName) return `${user.name}`;
    return user.name;
  };

  const getProfileLink = () => {
    if (user.role === 'candidate') return '/profile';
    if (user.role === 'company' || user.role === 'hr') return '/company-profile';
    return '/profile';
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-sm">
            <FaBriefcase className="text-white text-base" />
          </div>
          <span className="text-xl font-extrabold text-text tracking-tight">
            Career<span className="text-brand">Connect</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/jobs" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">Find Jobs</Link>
          <Link to="/posts" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">Posts</Link>
          {user?.role === 'company' || user?.role === 'hr' ? (
            <Link to="/jobs/post" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">Post a Job</Link>
          ) : null}
          {user?.role === 'candidate' && (
            <Link to="/references" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">References</Link>
          )}
          <Link to="/about" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-semibold text-textMuted hover:text-brand transition-colors">Contact</Link>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Bell Icon */}
              <button className="relative w-9 h-9 rounded-full border border-border flex items-center justify-center text-textMuted hover:text-brand hover:border-brand/30 transition-colors">
                <FaBell className="text-sm" />
                {/* Notification dot hidden by default until integrated with real data */}
                {/* <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" /> */}
              </button>

              {/* User Avatar + Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-border hover:border-brand/30 hover:bg-gray-50 transition-all"
                >
                  {(user.role === 'company' || user.role === 'hr') && user.companyLogoUrl ? (
                    <AuthImage src={user.companyLogoUrl} alt="logo" className="w-8 h-8 rounded-full object-cover" fallback={<div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center"><FaBuilding className="text-brand text-xs" /></div>} />
                  ) : user.profileImageUrl ? (
                    <AuthImage src={user.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" fallback={<div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center"><FaUserCircle className="text-brand" /></div>} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                      <FaUserCircle className="text-brand" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-text max-w-[120px] truncate">{getUserName()}</span>
                  <svg className={`w-3.5 h-3.5 text-textMuted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 bg-white border border-border rounded-2xl shadow-glass w-52 z-50 overflow-hidden"
                    >
                      <Link to={roleRedirect(user.role)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text hover:bg-primary-50 hover:text-brand border-b border-border transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <FaBriefcase className="text-brand" /> Dashboard
                      </Link>
                      <Link to={getProfileLink()} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text hover:bg-primary-50 hover:text-brand transition-colors" onClick={() => setUserMenuOpen(false)}>
                        {user.role === 'company' ? <FaBuilding className="text-brand" /> : <FaUserCircle className="text-brand" />} Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-t border-border transition-colors">
                        <FaSignOutAlt /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm px-5 py-2">Log In / Sign Up</Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-xl text-textMuted hover:text-brand transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white border-t border-border px-6 pb-4"
          >
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/jobs" className="text-sm font-semibold text-text hover:text-brand py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Find Jobs</Link>
              <Link to="/posts" className="text-sm font-semibold text-text hover:text-brand py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Posts</Link>
              <Link to="/contact" className="text-sm font-semibold text-text hover:text-brand py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Community</Link>
              {user ? (
                <>
                  <Link to={roleRedirect(user.role)} className="text-sm font-semibold text-text hover:text-brand py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm font-semibold text-red-500 text-left py-2">Logout</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm text-center mt-2" onClick={() => setMenuOpen(false)}>Log In / Sign Up</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}