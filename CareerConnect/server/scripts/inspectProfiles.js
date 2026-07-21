const { connectDB } = require('../src/config/db');
const mongoose = require('mongoose');

async function run() {
  await connectDB();
  const CandidateProfile = mongoose.model('CandidateProfile');
  const User = mongoose.model('User');
  const profiles = await CandidateProfile.find().populate('user', 'name email');
  console.log('Profiles count:', profiles.length);
  profiles.forEach(p => {
    console.log('---');
    console.log('User:', p.user?.name, p.user?.email, 'userId:', p.user?._id?.toString());
    console.log('profileImageId:', p.profileImageId ? p.profileImageId.toString() : null);
    console.log('resumeFileId:', p.resumeFileId ? p.resumeFileId.toString() : null);
    console.log('location:', p.location);
    console.log('social:', p.socialLinks);
  });
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
