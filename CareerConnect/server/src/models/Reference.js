const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  skills: [String],
  externalLink: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reference', referenceSchema);
