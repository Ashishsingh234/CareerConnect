const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  from: Date,
  to: Date,
  description: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  from: Date,
  to: Date,
  description: String,
});

const candidateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  skills: [String],
  phone: String,
  education: [educationSchema],
  experience: [experienceSchema],
  resumeFileId: { type: mongoose.Schema.Types.ObjectId },
  profileImageId: { type: mongoose.Schema.Types.ObjectId },
  location: String, // Added location field as per profile requirements
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
  },
  certifications: [String],
  jobPreferences: {
    locations: [String],
    isRemote: Boolean,
    expectedSalary: Number
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('CandidateProfile', candidateSchema);