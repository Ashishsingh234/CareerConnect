const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Zaroori hai password hashing ke liye

// NEW FUNCTION: Create a new HR user and link them to the company
async function createHRAccount(req, res) {
  const User = mongoose.model('User');
  const Company = mongoose.model('Company');
  const { name, email, password } = req.body;
  const companyId = req.user.company; // Logged-in company user ka company ID

  if (!name || !email || !password || !companyId) return res.status(400).json({ message: 'Missing fields' });
  if (req.user.role !== 'company') return res.status(403).json({ message: 'Only company owners can create HR accounts.' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);

  // 1. Create the new HR user
  const hrUser = await User.create({ name, email, password: hashed, role: 'hr', company: companyId });

  // 2. Link the HR user to the Company profile
  await Company.findByIdAndUpdate(companyId, { $push: { hrAccounts: hrUser._id } });

  res.status(201).json({ id: hrUser._id, name: hrUser.name, email: hrUser.email, role: hrUser.role });
}

// Get company profile by logged-in user id (For /companies/me)
async function getCompanyProfile(req, res) {
  const Company = mongoose.model('Company');
  const userId = req.user._id;

  const company = await Company.findOne({ createdBy: userId })
    .populate('hrAccounts', 'name email')
    .populate('jobs');

  if (!company) return res.status(404).json({ message: 'Company profile not found for this user.' });
  const obj = company.toObject();
  if (obj.logoFileId) obj.logoUrl = `/public-files/${obj.logoFileId}`;
  // If any hrAccounts have profileImageId on the User model, attach profileImageUrl for frontend
  if (obj.hrAccounts && obj.hrAccounts.length) {
    obj.hrAccounts = await Promise.all(obj.hrAccounts.map(async hr => {
      const User = mongoose.model('User');
      const u = await User.findById(hr._id).select('profileImageId').lean();
      if (u && u.profileImageId) hr.profileImageUrl = `/files/${u.profileImageId}`;
      return hr;
    }));
  }
  res.json(obj);
}

// Update company profile by logged-in user id (For /companies/me)
async function updateCompanyProfile(req, res) {
  const Company = mongoose.model('Company');
  const userId = req.user._id;

  const company = await Company.findOne({ createdBy: userId });

  if (!company) return res.status(404).json({ message: 'Company not found' });

  const updatableFields = ['name', 'description', 'website', 'address', 'industry', 'location'];
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      company[field] = req.body[field];
    }
  });

  await company.save();
  res.json(company);
}

// Get company profile by Company ID (for public view)
async function getCompanyProfileById(req, res) {
  const Company = mongoose.model('Company');
  const company = await Company.findById(req.params.id)
    .select('-createdBy -address')
    .populate('hrAccounts', 'name email')
    .populate('jobs');

  if (!company) return res.status(404).json({ message: 'Company not found' });
  const obj = company.toObject();
  if (obj.logoFileId) obj.logoUrl = `/public-files/${obj.logoFileId}`;
  if (obj.hrAccounts && obj.hrAccounts.length) {
    obj.hrAccounts = await Promise.all(obj.hrAccounts.map(async hr => {
      const User = mongoose.model('User');
      const u = await User.findById(hr._id).select('profileImageId').lean();
      if (u && u.profileImageId) hr.profileImageUrl = `/files/${u.profileImageId}`;
      return hr;
    }));
  }
  res.json(obj);
}

async function listAllCompanies(req, res) {
  const Company = mongoose.model('Company');
  const { limit } = req.query;
  try {
    const companies = await Company.find({})
      .limit(limit ? parseInt(limit) : 6)
      .select('name description website location logoFileId');
    // Attach public logoUrl when available
    const withUrls = companies.map(c => {
      const obj = c.toObject();
      if (obj.logoFileId) obj.logoUrl = `/public-files/${obj.logoFileId}`;
      return obj;
    });
    res.json(withUrls);
  } catch (err) {
    console.error("Error listing companies:", err);
    res.status(500).json({ message: 'Failed to retrieve company list.' });
  }
}

// NEW: Analytics endpoint for HR/Company dashboard
async function getCompanyAnalytics(req, res) {
  try {
    const Job = mongoose.model('Job');
    const Application = mongoose.model('Application');
    const companyId = req.user.company;

    if (!companyId) {
      return res.status(403).json({ message: 'User is not linked to a company.' });
    }

    // 1. Total active jobs
    const totalJobs = await Job.countDocuments({ company: companyId });

    // 2. Total applications received for all jobs of this company
    // First, find all jobs for this company
    const jobs = await Job.find({ company: companyId }, '_id');
    const jobIds = jobs.map(j => j._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    // 3. Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format the status counts into an easy-to-use object
    const statusCounts = applicationsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { pending: 0, reviewed: 0, interviewed: 0, hired: 0, rejected: 0 });

    res.json({
      totalJobs,
      totalApplications,
      statusCounts
    });

  } catch (err) {
    console.error("Error fetching company analytics:", err);
    res.status(500).json({ message: 'Failed to fetch company analytics.' });
  }
}

module.exports = { getCompanyProfile, updateCompanyProfile, getCompanyProfileById, listAllCompanies, createHRAccount, getCompanyAnalytics };