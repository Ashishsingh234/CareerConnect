const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  requiredSkills: [String],
  responsibilities: [String],
  requirements: [String],
  salaryRange: {
    min: Number,
    max: Number
  },
  vacancy: Number,
  isRemote: { type: Boolean, default: false },
  workMode: { type: String, enum: ['Onsite', 'Remote', 'Hybrid'], default: 'Onsite' },
  jobType: { type: String, enum: ['Fulltime', 'Partime', 'Freelance', 'Contract', 'Internship'], default: 'Fulltime' },
  experienceLevel: { type: String, enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager', 'Fresher', 'Mid', 'Senior'], default: 'Fresher' },
  location: String,
  deadline: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
