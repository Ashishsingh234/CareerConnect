const mongoose = require('mongoose');

async function applyJob(req, res) {
  const Application = mongoose.model('Application');
  const CandidateProfile = mongoose.model('CandidateProfile'); 
  const { coverLetter } = req.body;
  
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  const resumeFileId = profile?.resumeFileId;
  
  if (!resumeFileId) {
      return res.status(400).json({ message: 'Please upload a resume to your profile before applying.' });
  }

  try {
    const app = await Application.create({
      job: req.params.jobId,
      candidate: req.user._id,
      resumeFileId,
      coverLetter,
      status: 'pending'
    });
    res.json(app);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }
    res.status(500).json({ message: 'Error applying', error: err.message });
  }
}

async function listApplicants(req, res) {
  const Application = mongoose.model('Application');
  const Job = mongoose.model('Job');
  
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  
  const isAuthorized = String(job.company) === String(req.user.company);
  if (!isAuthorized) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view applicants for this job.' });
  }
  
  const applications = await Application.find({ job: req.params.jobId })
    .populate('candidate', 'name email')
    .populate('job', 'title');
    
  res.json(applications);
}

// FINAL FIX: Using Mongoose .equals() for robust ObjectId comparison
async function updateStatus(req, res) {
  try {
    const Application = mongoose.model('Application');
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // 1. Fetch Application and Populate Job/Company for Auth Check
    const app = await Application.findById(req.params.id).populate({
      path: 'job',
      select: 'company'
    });

    if (!app) {
      console.warn(`[updateStatus] Application not found: id=${req.params.id}`);
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Debug info
    console.debug('[updateStatus] user:', { id: req.user._id?.toString(), role: req.user.role, company: req.user.company?.toString?.() });
    console.debug('[updateStatus] application:', { id: app._id?.toString(), jobCompany: app.job?.company?.toString?.() });

    // 2. Authorization Check
    if (req.user.role !== 'company' && req.user.role !== 'hr') {
      console.warn(`[updateStatus] Forbidden role: user=${req.user._id} role=${req.user.role}`);
      return res.status(403).json({ message: 'Forbidden: Only HR or Company roles can update status.' });
    }

    const userCompanyId = req.user.company; // ObjectId from User model
    const jobCompanyId = app.job.company; // ObjectId from Job model
    const Company = mongoose.model('Company');

    if (req.user.role === 'company') {
      if (!userCompanyId || !userCompanyId.equals(jobCompanyId)) {
        console.warn(`[updateStatus] Company mismatch: userCompany=${userCompanyId} jobCompany=${jobCompanyId}`);
        return res.status(403).json({ message: 'Forbidden: Your company is not the owner of this job.' });
      }
    } else if (req.user.role === 'hr') {
      // HR accounts might not have `company` set on the User model.
      // Check the Company document to see if this HR user is listed in hrAccounts
      const companyDoc = await Company.findOne({ _id: jobCompanyId, hrAccounts: req.user._id });
      if (!companyDoc) {
        console.warn(`[updateStatus] HR not part of hrAccounts: user=${req.user._id} jobCompany=${jobCompanyId}`);
        return res.status(403).json({ message: 'Forbidden: HR user is not a member of the job owner\'s company.' });
      }
    }

    // 3. Update Status
    app.status = status;
    await app.save();

    res.json(app);
  } catch (err) {
    console.error('[updateStatus] error:', err);
    res.status(500).json({ message: 'Internal server error updating status', error: err.message });
  }
}

async function viewOwnApplications(req, res) {
  const Application = mongoose.model('Application');
  const apps = await Application.find({ candidate: req.user._id })
    .populate({
      path: 'job',
      select: 'title description company',
      populate: {
        path: 'company',
        select: 'name'
      }
    });
  res.json(apps);
}

module.exports = { applyJob, listApplicants, updateStatus, viewOwnApplications };