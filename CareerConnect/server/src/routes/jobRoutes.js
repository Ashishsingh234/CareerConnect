const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createJob, listJobs, getJob, updateJob, deleteJob, listCompanyJobs, saveJob, getSavedJobs } = require('../controllers/jobController');

router.post('/', protect, createJob);
router.get('/', listJobs);
router.get('/mine', protect, listCompanyJobs); // NEW ROUTE: /jobs/mine
router.get('/saved', protect, getSavedJobs); // NEW ROUTE: Get saved jobs
router.post('/:id/save', protect, saveJob);  // NEW ROUTE: Toggle save job
router.get('/:id', getJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;