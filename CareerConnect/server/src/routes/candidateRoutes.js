const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getCandidateProfile, updateCandidateProfile, getCandidateProfileById } = require('../controllers/candidateController');

router.get('/me', protect, getCandidateProfile);
router.put('/me', protect, updateCandidateProfile);
// View other candidate profile by id (protected to ensure only authenticated users can view)
router.get('/:id', protect, getCandidateProfileById);

module.exports = router;