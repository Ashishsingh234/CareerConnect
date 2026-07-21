const mongoose = require('mongoose');

// Get candidate profile by logged-in user id
async function getCandidateProfile(req, res) {
  const CandidateProfile = mongoose.model('CandidateProfile');
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile) {
    // If profile doesn't exist, create an empty one 
    const newProfile = await CandidateProfile.create({ user: req.user._id });
    return res.json(newProfile);
  }
  // Attach public URLs for profile image and resume if available
  const p = profile.toObject();
  if (p.resumeFileId) p.resumeUrl = `/files/${p.resumeFileId}`;
  if (p.profileImageId) p.profileImageUrl = `/files/${p.profileImageId}`;
  res.json(p);
}

// Update candidate profile
async function updateCandidateProfile(req, res) {
  const CandidateProfile = mongoose.model('CandidateProfile');
  const User = mongoose.model('User');
  const { name, skills, location, education, experience, socialLinks, phone } = req.body;
  
  // Update name in User model
  if (name && name !== req.user.name) {
    await User.findByIdAndUpdate(req.user._id, { name });
  }

  // Normalize incoming fields to expected types to be resilient to client mistakes
  let normalizedSkills = skills;
  if (!normalizedSkills) normalizedSkills = [];
  else if (typeof normalizedSkills === 'string') {
    // Allow clients to send comma-separated string as well
    normalizedSkills = normalizedSkills.split(',').map(s => s.trim()).filter(s => s);
  }

  // Validate phone presence and format (exactly 10 digits)
  if (!phone) return res.status(400).json({ message: 'Phone is required' });
  const phoneDigits = String(phone).replace(/\D/g, '');
  if (phoneDigits.length !== 10) return res.status(400).json({ message: 'Phone must be numeric and exactly 10 digits' });

  // ensure that's what we store
  const finalPhone = phoneDigits;

  const normalizedEducation = Array.isArray(education) ? education : [];
  const normalizedExperience = Array.isArray(experience) ? experience : [];
  const normalizedSocial = socialLinks || { linkedin: '', github: '', portfolio: '' };

  // Update CandidateProfile (ensure we return the updated document)
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { skills: normalizedSkills, location, education: normalizedEducation, experience: normalizedExperience, socialLinks: normalizedSocial, phone: finalPhone } },
    { new: true, upsert: true }
  ).lean();

  // Attach public/protected URLs before returning so client receives consistent shape
  if (profile) {
    if (profile.resumeFileId) profile.resumeUrl = `/files/${profile.resumeFileId}`;
    if (profile.profileImageId) profile.profileImageUrl = `/files/${profile.profileImageId}`;
  }

  res.json(profile);
}


// Public: Get candidate profile by user ID (for viewing another user's profile)
async function getCandidateProfileById(req, res) {
  const CandidateProfile = mongoose.model('CandidateProfile');
  const User = mongoose.model('User');
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid user id' });

  let profile = await CandidateProfile.findOne({ user: userId }).populate('user', 'name email').lean();
  if (!profile) {
    // Fall back to basic user info so viewers can still see a public profile
    const User = mongoose.model('User');
    const userObj = await User.findById(userId).select('name email role company').lean();
    if (!userObj) return res.status(404).json({ message: 'Profile not found' });
    profile = {
      user: { _id: userObj._id, name: userObj.name, email: userObj.email },
      skills: [],
      location: '',
      education: [],
      experience: [],
      socialLinks: {},
      references: []
    };
  }

  // Attach public/protected URLs
  if (profile.resumeFileId) profile.resumeUrl = `/files/${profile.resumeFileId}`;
  if (profile.profileImageId) profile.profileImageUrl = `/files/${profile.profileImageId}`;

  // Attach references authored by this user (if Reference model exists)
  try {
    const Reference = mongoose.model('Reference');
    const refs = await Reference.find({ author: userId }).select('title description skills externalLink createdAt').lean();
    profile.references = refs || [];
  } catch (e) { profile.references = profile.references || []; }

  res.json(profile);
}

module.exports = { getCandidateProfile, updateCandidateProfile, getCandidateProfileById };