const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
// Multer instance should be imported as 'upload'
const { upload } = require('../middlewares/uploadMiddleware'); 
const { uploadResume, uploadLogo, uploadProfileImage, uploadJobImage } = require('../controllers/uploadController');

// Resume Upload: POST /upload/resume
router.post('/resume', protect, upload.single('resume'), uploadResume);

// Company Logo Upload: POST /upload/company/:id/logo
router.post('/company/:id/logo', protect, upload.single('logo'), uploadLogo);

// Profile Image Upload: POST /upload/profile-image
router.post('/profile-image', protect, upload.single('profileImage'), uploadProfileImage);

// Job Image Upload: POST /upload/job-image
router.post('/job-image', protect, upload.single('jobImage'), uploadJobImage);

// Note: The /files/:fileId route for downloading resumes is handled in src/index.js

module.exports = router;