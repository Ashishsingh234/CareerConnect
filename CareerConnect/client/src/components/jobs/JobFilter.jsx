import React from 'react';
import { FaMapMarkerAlt, FaRedo } from 'react-icons/fa';

const JOB_POSITIONS = ['On Site', 'Remote', 'Hybrid'];
const JOB_TYPES = ['Fulltime', 'Partime', 'Freelance', 'Contract'];
const SALARY_RANGES = [
  { label: '< ₹3L', min: 0, max: 300000 },
  { label: '₹3L – ₹6L', min: 300000, max: 600000 },
  { label: '₹6L – ₹10L', min: 600000, max: 1000000 },
  { label: '₹10L – ₹20L', min: 1000000, max: 2000000 },
  { label: '₹20L+', min: 2000000, max: 9999999 },
];
const JOB_FUNCTIONS = [
  'Product Designer', 'UI/UX Designer', 'Web Designer',
  'Front End Developer', 'Fullstack Developer', 'Data Analyst',
  'Graphic Designer', 'Software Engineer',
];

export default function JobFilter({ filters, setFilters }) {
  const toggle = (field, value) => {
    setFilters(f => {
      const arr = f[field] || [];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const setSalaryRange = (range) => {
    setFilters(f => ({
      ...f,
      salaryRangeLabel: range ? range.label : '',
      salaryMin: range ? range.min : null,
      salaryMax: range ? range.max : null,
      customSalary: false
    }));
  };

  const reset = () => {
    setFilters({
      keyword: '',
      location: '',
      experienceLevel: '',
      salaryMax: null,
      positions: [],
      jobTypes: [],
      salaryRangeLabel: '',
      salaryMin: null,
      functions: [],
      customSalary: false,
    });
  };

  return (
    <div className="flex flex-col gap-0">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-text">Filter</h3>
        <button
          onClick={reset}
          className="text-sm font-semibold text-brand hover:text-brandDark flex items-center gap-1 transition-colors"
        >
          <FaRedo className="text-xs" /> Reset
        </button>
      </div>

      {/* Job Location */}
      <div className="filter-section">
        <div className="filter-title">Job Location</div>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm" />
          <input
            type="text"
            placeholder="City, State or Remote"
            value={filters.location || ''}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none placeholder-textMuted transition-all"
          />
        </div>
      </div>

      {/* Job Position */}
      <div className="filter-section">
        <div className="filter-title">Job Position</div>
        <div className="flex flex-col gap-1">
          {JOB_POSITIONS.map(pos => (
            <label key={pos} className="filter-checkbox">
              <input
                type="checkbox"
                checked={(filters.positions || []).includes(pos)}
                onChange={() => toggle('positions', pos)}
              />
              <span>{pos}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="filter-section">
        <div className="filter-title">Job Type</div>
        <div className="grid grid-cols-2 gap-1">
          {JOB_TYPES.map(type => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={(filters.jobTypes || []).includes(type)}
                onChange={() => toggle('jobTypes', type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="filter-section">
        <div className="filter-title">Salary Range</div>
        <div className="flex flex-wrap gap-2">
          {SALARY_RANGES.map(range => (
            <button
              key={range.label}
              type="button"
              onClick={() => {
                if (filters.salaryRangeLabel === range.label) {
                  setSalaryRange(null);
                } else {
                  setSalaryRange(range);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.salaryRangeLabel === range.label
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-textMuted border-border hover:border-brand/30 hover:text-brand'
                }`}
            >
              {range.label}
            </button>
          ))}
          {/* Custom range toggle */}
          <button
            type="button"
            onClick={() => {
              setFilters(f => ({
                ...f,
                salaryRangeLabel: '',
                customSalary: !f.customSalary,
                salaryMin: !f.customSalary ? 0 : null,
                salaryMax: !f.customSalary ? 5000000 : null
              }));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.customSalary && !filters.salaryRangeLabel
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-textMuted border-border hover:border-brand/30 hover:text-brand'
              }`}
          >
            Custom
          </button>
        </div>

        {filters.customSalary && !filters.salaryRangeLabel && (
          <div className="flex flex-col gap-2 mt-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-textMuted ml-1">Min Salary</span>
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:border-brand outline-none"
                  value={filters.salaryMin === null ? '' : filters.salaryMin}
                  onChange={e => setFilters(f => ({ ...f, salaryMin: e.target.value === '' ? 0 : Number(e.target.value) }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-textMuted ml-1">Max Salary</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full text-xs px-3 py-2 border border-border rounded-xl focus:border-brand outline-none"
                  value={filters.salaryMax === null ? '' : (filters.salaryMax === 9999999 ? '' : filters.salaryMax)}
                  onChange={e => setFilters(f => ({ ...f, salaryMax: e.target.value === '' ? 5000000 : Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Function */}
      <div className="pb-2">
        <div className="filter-title">Job Function</div>
        <div className="flex flex-col gap-1">
          {JOB_FUNCTIONS.map(fn => (
            <label key={fn} className="filter-checkbox">
              <input
                type="checkbox"
                checked={(filters.functions || []).includes(fn)}
                onChange={() => toggle('functions', fn)}
              />
              <span>{fn}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}