import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import AuthImage from '../common/AuthImage';

export default function JobCard({ job, onClick, isSelected }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(job);
    } else {
      navigate(`/jobs/${job._id}`);
    }
  };

  const employmentType = job.employmentType || job.jobType || 'Fulltime';
  const workMode = job.isRemote ? 'Remote' : (job.workMode || 'Onsite');
  const companyName = job.company?.name || job.companyName || 'Company';

  const formatSalary = (val) => {
    if (!val && val !== 0) return null;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  const salaryDisplay = job.salaryRange?.min
    ? `${formatSalary(job.salaryRange.min)} – ${formatSalary(job.salaryRange.max)}`
    : job.salary
      ? formatSalary(job.salary)
      : null;

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-200 flex flex-col gap-3 group
        ${isSelected
          ? 'border-brand shadow-md ring-1 ring-brand/20'
          : 'border-border hover:border-brand/30 hover:shadow-soft hover:-translate-y-0.5'}`}
    >
      {/* Top row: Logo + Bookmark */}
      <div className="flex items-start justify-between">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl border border-border bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {job.company?.logoUrl || job.companyLogoUrl ? (
            <AuthImage
              src={job.company?.logoUrl || job.companyLogoUrl}
              alt={companyName}
              className="w-full h-full object-contain p-1"
              fallback={<span className="text-xl font-extrabold text-brand">{companyName.charAt(0)}</span>}
            />
          ) : (
            <span className="text-xl font-extrabold text-brand">{companyName.charAt(0)}</span>
          )}
        </div>
        <button
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-textMuted hover:text-brand hover:border-brand/30 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <FaBookmark className="text-xs" />
        </button>
      </div>

      {/* Company name + verified */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-text">{companyName}</span>
        <FaCheckCircle className="text-brand text-xs shrink-0" />
      </div>

      {/* Job title */}
      <div className="font-semibold text-textMuted text-sm leading-snug group-hover:text-brand transition-colors">
        {job.title}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="badge-gray">{workMode}</span>
        <span className="badge-gray">{employmentType}</span>
        {job.experienceLevel && <span className="badge-green">{job.experienceLevel}</span>}
      </div>

      {/* Salary + Location + CTA */}
      <div className="flex flex-wrap items-end justify-between gap-3 mt-1 pt-3 border-t border-border">
        <div className="min-w-0">
          {salaryDisplay && (
            <div className="text-sm font-bold text-text truncate">{salaryDisplay}</div>
          )}
          {job.location && (
            <div className="text-xs text-textMuted flex items-center gap-1 mt-0.5 truncate">
              <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
              {job.location}
            </div>
          )}
        </div>
        <button
          className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-brand text-brand hover:bg-brand hover:text-white transition-all duration-200 shrink-0"
          onClick={handleClick}
        >
          Details
        </button>
      </div>
    </div>
  );
}