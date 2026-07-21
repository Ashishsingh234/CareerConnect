const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  website: String,
  industry: String, // Added missing field
  location: String, // Added missing field
  logoFileId: mongoose.Schema.Types.ObjectId,
  address: String,
  cultureDescription: String,
  benefits: [String],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hrAccounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  // Allows Mongoose to include virtual fields when converting to JSON/Object
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual Property: Link all jobs where the job's 'company' field matches the Company's _id
companySchema.virtual('jobs', {
  ref: 'Job',            // The model to use
  localField: '_id',     // Find jobs where Job.companyId is equal to Company._id
  foreignField: 'company', // The field on the Job model to match
  justOne: false         // Get an array of jobs
});

module.exports = mongoose.model('Company', companySchema);