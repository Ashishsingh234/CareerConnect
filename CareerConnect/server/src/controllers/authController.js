const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

async function registerCandidate(req, res) {
  const User = mongoose.model('User');
  const CandidateProfile = mongoose.model('CandidateProfile');
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  // Accept and normalize profile fields early so we can validate before creating a user
  let { skills, location, phone, socialLinks, education, experience, profileImageId, resumeFileId } = req.body;
  if (!skills) skills = [];
  else if (typeof skills === 'string') skills = skills.split(',').map(s => s.trim()).filter(s => s);
  if (!Array.isArray(education)) education = [];
  if (!Array.isArray(experience)) experience = [];
  socialLinks = socialLinks || { linkedin: '', github: '', portfolio: '' };

  // Enforce mandatory candidate fields at registration
  if (!skills.length || !location) return res.status(400).json({ message: 'Skills and location are required for candidate registration' });
  if (!phone) return res.status(400).json({ message: 'Phone is required for candidate registration' });
  // Normalize phone to digits only and enforce exactly 10 digits
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) return res.status(400).json({ message: 'Phone must be numeric and exactly 10 digits' });
  phone = digits;
  if (!education.length) return res.status(400).json({ message: 'Highest Degree is required for candidate registration' });
  if (!experience.length) return res.status(400).json({ message: 'Latest Job Title is required for candidate registration' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'candidate' });

  await CandidateProfile.create({ user: user._id, skills, location, phone, socialLinks, education, experience, profileImageId, resumeFileId });

  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
}

async function registerCompany(req, res) {
  const User = mongoose.model('User');
  const Company = mongoose.model('Company');
  const { name, email, password, companyName, website, description, industry, location } = req.body; 
  if (!name || !email || !password || !companyName) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'company' });
  
  // Create Company with all fields from registration
  const company = await Company.create({ 
    name: companyName, 
    createdBy: user._id,
    website,
    description,
    industry,
    location
  });
  
  user.company = company._id;
  await user.save();
  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  
  // Send back companyId and companyName for front-end state
  res.json({ 
    user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: company._id, companyName: company.name }, 
    accessToken, 
    refreshToken 
  });
}

async function login(req, res) {
  const User = mongoose.model('User');
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  // Populate company field during login to get companyName/companyId
  const user = await User.findOne({ email }).populate('company');
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  
  const userResponse = { 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role, 
    companyId: user.company?._id,
    companyName: user.company?.name // Added company name for Navbar/Dashboard
  };
  res.json({ user: userResponse, accessToken, refreshToken });
}

module.exports = { registerCandidate, registerCompany, login };

// Refresh token endpoint
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ id: decoded.id });
    // Optionally rotate refresh token
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token invalid', error: err.message });
  }
}

module.exports = { registerCandidate, registerCompany, login, refreshToken };