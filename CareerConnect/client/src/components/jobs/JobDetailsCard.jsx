import React from 'react';
import AuthImage from '../common/AuthImage';
import { FaMapMarkerAlt, FaToolbox, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

export default function JobDetailsCard({ job }) {
  return (
    <div className="bg-white p-10 mb-8 border border-border shadow-sm hover:shadow-md transition-shadow rounded-3xl relative overflow-hidden group">
      {/* Background glowing orb */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px] group-hover:bg-brand/10 transition-all duration-700"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center mb-10 relative z-10 border-b border-border pb-8">
        <div className="relative mb-6 md:mb-0 mr-8">
          <AuthImage
            src={job.company?.logoUrl || '/default-logo.png'}
            alt={job.company?.name}
            className="relative h-28 w-28 rounded-2xl object-cover border border-border bg-gray-50 p-2 shadow-sm"
            fallback={<img src="/default-logo.png" alt={job.company?.name} className="relative h-28 w-28 rounded-2xl object-cover border border-border p-2 shadow-sm bg-gray-50" />}
          />
        </div>
        <div>
          <h1 className="font-extrabold text-4xl text-text tracking-tight mb-2">{job.title}</h1>
          <div className="text-xl text-textMuted font-semibold">{job.company?.name || job.companyName}</div>
          {job.location && (
            <div className="text-md text-emerald-600 font-bold flex items-center gap-1.5 mt-3 bg-emerald-50 w-max px-3 py-1 rounded-lg border border-emerald-100"><FaMapMarkerAlt /> {job.location}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        <div className="bg-gray-50 p-6 rounded-2xl border border-border flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-4 text-2xl shadow-sm border border-brand/20"><FaToolbox /></div>
          <span className="text-textMuted text-xs font-bold uppercase tracking-widest mb-2">Required Skills</span>
          <span className="text-text font-semibold">{job.requiredSkills?.join(', ') || 'Not specified'}</span>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/30 to-transparent"></div>
          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 text-2xl shadow-sm border border-emerald-200 relative z-10"><FaMoneyBillWave /></div>
          <span className="text-emerald-700/70 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Compensation</span>
          <span className="text-emerald-700 font-extrabold text-xl relative z-10">₹{job.salaryRange?.min} - ₹{job.salaryRange?.max}</span>
        </div>

        <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-100/30 to-transparent"></div>
          <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-4 text-2xl shadow-sm border border-pink-200 relative z-10"><FaCalendarAlt /></div>
          <span className="text-pink-600/70 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Deadline</span>
          <span className="text-text font-semibold relative z-10">{job.deadline ? new Date(job.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Continuous'}</span>
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2 border-b border-border pb-3 w-max">Job Description</h3>
        <div className="text-textMuted leading-relaxed whitespace-pre-wrap font-medium text-lg">{job.description}</div>
      </div>
    </div>
  );
}