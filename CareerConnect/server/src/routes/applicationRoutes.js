const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { applyJob, listApplicants, updateStatus, viewOwnApplications } = require('../controllers/applicationController');

router.post('/jobs/:jobId/apply', protect, applyJob);
router.get('/jobs/:jobId/applications', protect, listApplicants);
// Mounted at /applications -> final path: /applications/:id/status
router.patch('/:id/status', protect, updateStatus);
router.get('/users/me/applications', protect, viewOwnApplications);

module.exports = router;