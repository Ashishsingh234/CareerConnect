const mongoose = require('mongoose');

async function createJob(req, res) {
  const Job = mongoose.model('Job');
  const {
    title, description, requiredSkills = [], salaryRange = {}, vacancy,
    workMode, jobType, experienceLevel, location, deadline, companyId,
    responsibilities = [], requirements = []
  } = req.body;

  if (!title || !companyId || !req.user?._id) return res.status(400).json({ message: 'Missing required fields or user context' });

  // Authorization check: Ensure user is linked to the company
  if (String(req.user.company) !== String(companyId)) {
    return res.status(403).json({ message: 'Not authorized to post jobs for this company.' });
  }

  try {
    const job = await Job.create({
      company: companyId,
      postedBy: req.user._id,
      title,
      description,
      requiredSkills,
      responsibilities,
      requirements,
      salaryRange,
      vacancy,
      workMode,
      jobType,
      isRemote: workMode === 'Remote',
      experienceLevel,
      location,
      deadline
    });
    res.json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: 'Error creating job', error: err.message });
  }
}

async function listJobs(req, res) {
  const Job = mongoose.model('Job');
  // 1. Filtering and Pagination Logic
  const {
    keyword,
    location,
    experienceLevel,
    workModes, // Array or comma-sep string
    jobTypes,  // Array or comma-sep string
    functions, // Array or comma-sep string
    salaryMin,
    salaryMax,
    page = 1,
    limit = 6
  } = req.query;

  const filter = {};

  const queryPage = Math.max(1, parseInt(page));
  const queryLimit = Math.max(1, parseInt(limit));
  const skip = (queryPage - 1) * queryLimit;

  // --- Filtering Logic ---
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(keyword, 'i')] } }
    ];
  }

  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  // Work Mode filter (replacing isRemote logic)
  if (workModes) {
    const modes = Array.isArray(workModes) ? workModes : workModes.split(',').map(m => m.trim());
    // Map "On Site" to "Onsite" if necessary
    const mappedModes = modes.map(m => m === 'On Site' ? 'Onsite' : m);
    filter.workMode = { $in: mappedModes };
  }

  // Job Type filter
  if (jobTypes) {
    const types = Array.isArray(jobTypes) ? jobTypes : jobTypes.split(',').map(t => t.trim());
    filter.jobType = { $in: types };
  }

  // Functions (Job Category) filter — match against job title OR required skills
  if (functions) {
    const fns = Array.isArray(functions) ? functions : functions.split(',').map(f => f.trim());
    const fnRegexes = fns.map(f => new RegExp(f, 'i'));
    const fnCondition = {
      $or: [
        { title: { $in: fnRegexes } },
        { requiredSkills: { $in: fnRegexes } }
      ]
    };
    // If location already set a $or, wrap both in $and to avoid conflict
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, fnCondition];
      delete filter.$or;
    } else {
      Object.assign(filter, fnCondition);
    }
  }

  // Salary filtering
  if (salaryMin !== undefined && salaryMin !== null && salaryMin !== '' && !isNaN(parseInt(salaryMin))) {
    filter['salaryRange.max'] = { $gte: parseInt(salaryMin) };
  }
  if (salaryMax !== undefined && salaryMax !== null && salaryMax !== '' && !isNaN(parseInt(salaryMax))) {
    filter['salaryRange.min'] = { $lt: parseInt(salaryMax) };
  }

  // Handle Location filtering (Improved: search both Job and Company location)
  if (location) {
    const Company = mongoose.model('Company');
    const locations = location.split(',').map(l => l.trim());
    const locationRegexes = locations.map(l => new RegExp(l, 'i'));

    const matchingCompanies = await Company.find({ location: { $in: locationRegexes } }, '_id');
    const companyIds = matchingCompanies.map(c => c._id);

    filter.$or = [
      { location: { $in: locationRegexes } },
      { company: { $in: companyIds } }
    ];
  }

  // --- End Filtering Logic ---
  console.log('DEBUG: listJobs filter:', JSON.stringify(filter, null, 2));

  try {
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / queryLimit);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryLimit)
      .populate('company', 'name location website logoFileId');

    const jobsWithLogos = jobs.map(j => {
      const obj = j.toObject();
      if (obj.company?.logoFileId) obj.company.logoUrl = `/public-files/${obj.company.logoFileId}`;
      return obj;
    });

    res.json({
      jobs: jobsWithLogos,
      totalJobs,
      totalPages,
      currentPage: queryPage
    });

  } catch (err) {
    console.error("CRITICAL ERROR: Failed to fetch job list", err);
    return res.status(500).json({ message: 'Failed to retrieve jobs.' });
  }
}

// NEW FUNCTION: List jobs specifically for the logged-in HR/Company
async function listCompanyJobs(req, res) {
  const Job = mongoose.model('Job');
  // Ensure the user is linked to a company
  if (!req.user.company) {
    return res.status(403).json({ message: 'User is not linked to a company.' });
  }

  try {
    // Filter jobs by the company ID stored on the user object
    const jobs = await Job.find({ company: req.user.company })
      .populate('company', 'name location website');

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching company jobs:", err);
    res.status(500).json({ message: 'Failed to retrieve jobs for your company.' });
  }
}

async function getJob(req, res) {
  const Job = mongoose.model('Job');

  // Complete Population for Job Details Card
  const job = await Job.findById(req.params.id).populate('company', 'name description logoFileId website');

  if (!job) return res.status(404).json({ message: 'Job not found' });
  const obj = job.toObject();
  if (obj.company?.logoFileId) obj.company.logoUrl = `/public-files/${obj.company.logoFileId}`;
  res.json(obj);
}

async function updateJob(req, res) {
  const Job = mongoose.model('Job');
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  if (String(job.postedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to update this job.' });
  }

  Object.assign(job, req.body);
  await job.save();
  res.json(job);
}

async function deleteJob(req, res) {
  const Job = mongoose.model('Job');
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  if (String(job.postedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to delete this job.' });
  }

  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: 'Job deleted successfully' });
}

async function saveJob(req, res) {
  const CandidateProfile = mongoose.model('CandidateProfile');
  const jobId = req.params.id;

  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Only candidates can save jobs' });
  }

  let profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await CandidateProfile.create({ user: req.user._id, savedJobs: [jobId] });
  } else {
    if (!profile.savedJobs) profile.savedJobs = [];

    // Toggle save/unsave
    const strJobId = String(jobId);
    const index = profile.savedJobs.findIndex(id => String(id) === strJobId);
    if (index > -1) {
      profile.savedJobs.splice(index, 1);
    } else {
      profile.savedJobs.push(jobId);
    }
    await profile.save();
  }
  res.json({ savedJobs: profile.savedJobs });
}

async function getSavedJobs(req, res) {
  const CandidateProfile = mongoose.model('CandidateProfile');
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ message: 'Only candidates have saved jobs' });
  }

  const profile = await CandidateProfile.findOne({ user: req.user._id }).populate({
    path: 'savedJobs',
    populate: { path: 'company', select: 'name location website logoFileId' }
  });

  if (!profile || !profile.savedJobs) return res.json([]);

  const jobsWithLogos = profile.savedJobs.map(j => {
    if (!j) return null;
    const obj = j.toObject ? j.toObject() : j;
    if (obj.company?.logoFileId) obj.company.logoUrl = `/public-files/${obj.company.logoFileId}`;
    return obj;
  }).filter(Boolean);

  res.json(jobsWithLogos);
}

module.exports = { createJob, listJobs, getJob, updateJob, deleteJob, listCompanyJobs, saveJob, getSavedJobs };