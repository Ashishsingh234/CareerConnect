const { uploadToGridFS } = require('../middlewares/uploadMiddleware');
const mongoose = require('mongoose');
const { getGfsBucket } = require('../config/db'); // GridFS bucket ke liye zaroori
const { ObjectId } = require('mongodb'); // MongoDB ID handling ke liye zaroori

// --- File Upload Functions ---

async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  const file = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
  
  const CandidateProfile = mongoose.model('CandidateProfile');
  await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { resumeFileId: file._id },
    { upsert: true, new: true, setDefaultsOnInsert: true } 
  );
  res.json({ fileId: file._id, message: 'Resume uploaded and linked successfully' });
}

async function uploadLogo(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const file = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
  const Company = mongoose.model('Company');
  await Company.findByIdAndUpdate(req.params.id, { logoFileId: file._id }); 
  res.json({ fileId: file._id });
}

async function uploadProfileImage(req, res) {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const file = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    // If the uploader is a candidate, save on CandidateProfile. If HR/company user, save on User.
    const CandidateProfile = mongoose.model('CandidateProfile');
    const User = mongoose.model('User');
    if (req.user.role === 'candidate') {
        await CandidateProfile.findOneAndUpdate(
            { user: req.user._id },
            { profileImageId: file._id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } else {
        // For company/hr accounts, store profile image directly on User so company HR avatars are available
        await User.findByIdAndUpdate(req.user._id, { profileImageId: file._id });
    }
    res.json({ id: file._id, message: 'Profile image uploaded' });
}

async function uploadJobImage(req, res) {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const file = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    // Return the file id so frontend can attach to job payload
    res.json({ id: file._id, message: 'Job image uploaded' });
}

// --- File Download/Serve Function (GridFS & Authorization) ---

async function getFile(req, res) {
    const fileId = req.params.fileId;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'Invalid file ID format.' });
    }
    
    const Application = mongoose.model('Application');
    const CandidateProfile = mongoose.model('CandidateProfile');
    const Post = mongoose.model('Post');
    const Company = mongoose.model('Company');
    const bucket = getGfsBucket(); 

    try {
        const objectId = new mongoose.Types.ObjectId(fileId);
        console.debug('[getFile] requested fileId=', fileId, 'for user=', req.user?._id);
        
        // 1. Authorization Check 
        // By default, only allow access to the file owner (candidate resume/profile) or
        // authorized company/hr users viewing applications. Additionally allow files
        // that are referenced by a Post (post images) or Company logo to be served
        // to authenticated users so frontend can display them in the feed.
        let isAuthorized = false;

        // a) Handle candidate files:
        // - resumeFileId should remain protected: only owner (or authorized company/hr via application) can access
        // - profileImageId (avatar) is not sensitive: allow any authenticated user to view candidate profile images
        const profileImageRef = await CandidateProfile.findOne({ profileImageId: objectId }).lean();
        if (profileImageRef) {
            // Any authenticated user may view profile images
            isAuthorized = true;
        } else {
            // Check if this is the resume file of the requesting user (owner)
            const ownerByResume = await CandidateProfile.findOne({ user: req.user._id, resumeFileId: objectId });
            if (ownerByResume) isAuthorized = true;
        }

        // Also check if this is a User profileImageId (for HR/company users) and allow any authenticated user to view
        if (!isAuthorized) {
            const User = mongoose.model('User');
            const userRef = await User.findOne({ profileImageId: objectId }).lean();
            if (userRef) isAuthorized = true;
        }

        // b) Check if the user is HR/Company viewing an application linked to their job
        if (!isAuthorized && (req.user.role === 'company' || req.user.role === 'hr')) {
            const application = await Application.findOne({ resumeFileId: objectId })
                .populate({ path: 'job', select: 'company' });

            if (application && application.job) {
                // Company users: check user.company matches the job's company
                if (req.user.role === 'company') {
                    if (String(req.user.company) === String(application.job.company)) {
                        isAuthorized = true;
                    }
                } else if (req.user.role === 'hr') {
                    // HR users may not have user.company populated. Check the Company.hrAccounts array
                    const Company = mongoose.model('Company');
                    const companyDoc = await Company.findOne({ _id: application.job.company, hrAccounts: req.user._id }).lean();
                    if (companyDoc) isAuthorized = true;
                }
            }
        }

        // c) Allow post images to be fetched by any authenticated user (posts are visible to authenticated users)
        if (!isAuthorized) {
            const postRef = await Post.findOne({ imageFileId: objectId });
            if (postRef) isAuthorized = true;
        }

        // d) Allow company logos to be fetched (so company pages can display logos)
        if (!isAuthorized) {
            const companyRef = await Company.findOne({ logoFileId: objectId });
            if (companyRef) isAuthorized = true;
        }

        if (!isAuthorized) {
            console.debug('[getFile] access denied for fileId=', fileId, 'user=', req.user?._id);
            return res.status(403).json({ message: 'Access denied to this file.' });
        }

        // 2. Stream the file from GridFS
        const files = await bucket.find({ _id: objectId }).toArray();
        const file = files[0];
        
        if (!file) {
            return res.status(404).json({ message: 'File not found in GridFS.' });
        }

    console.debug('[getFile] streaming file', file.filename, 'contentType=', file.contentType);
    res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
        
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

    } catch (error) {
        console.error("GridFS download error:", error);
        res.status(500).json({ message: 'Error retrieving file.' });
    }
}


// --- FINAL EXPORTS: Includes all three necessary functions ---
module.exports = { uploadResume, uploadLogo, uploadProfileImage, uploadJobImage, getFile, getPublicFile };

// Public file access for non-sensitive assets (company logos, post/job images)
async function getPublicFile(req, res) {
    const fileId = req.params.fileId;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'Invalid file ID format.' });
    }

    const Post = mongoose.model('Post');
    const Company = mongoose.model('Company');
    const bucket = getGfsBucket();

    try {
        console.debug('[getPublicFile] requested public fileId=', fileId);
        const objectId = new mongoose.Types.ObjectId(fileId);

        // Allow public access only if this file is referenced as a company logo or a post image
        const isLogo = await Company.findOne({ logoFileId: objectId }).lean();
        const isPostImage = await Post.findOne({ imageFileId: objectId }).lean();

        console.debug('[getPublicFile] isLogo=', !!isLogo, 'isPostImage=', !!isPostImage);
        if (!isLogo && !isPostImage) {
            console.debug('[getPublicFile] file is not public, denying access for fileId=', fileId);
            return res.status(403).json({ message: 'File is not public.' });
        }

        const files = await bucket.find({ _id: objectId }).toArray();
        const file = files[0];
        console.debug('[getPublicFile] gridfs file found=', !!file);
        if (!file) return res.status(404).json({ message: 'File not found in GridFS.' });

        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Public GridFS download error:', error);
        res.status(500).json({ message: 'Error retrieving file.' });
    }
}