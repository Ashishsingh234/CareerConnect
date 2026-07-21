const mongoose = require('mongoose');

const Reference = require('../models/Reference');

// Create a new reference (only candidate can create)
async function createReference(req, res) {
  try {
    if (!req.user || req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can create references' });
    }
    const { title, description, skills, externalLink } = req.body;
    const ref = new Reference({
      title,
      description,
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      externalLink: externalLink || null,
      author: req.user._id,
    });
    await ref.save();
    // Populate author before returning
    await ref.populate('author', 'name email');
    res.status(201).json(ref);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// List references (only candidates can view the page per requirement)
async function listReferences(req, res) {
  try {
    // Allow any authenticated user to view references; protect middleware ensures req.user exists
    const refs = await Reference.find().populate('author', 'name email').sort({ createdAt: -1 });
    // Map to include applied flag for the current user
    const mapped = refs.map(r => {
      const obj = r.toObject();
      obj.applicantsCount = (r.applicants || []).length;
      obj.applied = req.user ? (r.applicants || []).map(a => a.toString()).includes(req.user._id.toString()) : false;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get a single reference
async function getReference(req, res) {
  try {
    // Allow any authenticated user to view a reference
    const ref = await Reference.findById(req.params.id).populate('author', 'name email');
    if (!ref) return res.status(404).json({ message: 'Reference not found' });
    const obj = ref.toObject();
    obj.applicantsCount = (ref.applicants || []).length;
    obj.applied = req.user ? (ref.applicants || []).map(a => a.toString()).includes(req.user._id.toString()) : false;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Apply to a reference (candidate only)
async function applyReference(req, res) {
  try {
    // Allow any authenticated user to apply to a reference
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const ref = await Reference.findById(req.params.id);
    if (!ref) return res.status(404).json({ message: 'Reference not found' });
    // Author cannot apply to their own reference
    if (ref.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Author cannot apply to their own reference' });
    }
    // Prevent duplicate applications
    if (ref.applicants.map(a => a.toString()).includes(req.user._id.toString())) {
      return res.status(400).json({ message: 'Already applied' });
    }
    ref.applicants.push(req.user._id);
    await ref.save();
    res.json({ message: 'Applied', referenceId: ref._id, applied: true, applicantsCount: (ref.applicants || []).length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  createReference,
  listReferences,
  getReference,
  applyReference,
};
