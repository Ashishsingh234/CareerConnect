const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getCompanyProfile, updateCompanyProfile, getCompanyProfileById, listAllCompanies, createHRAccount, getCompanyAnalytics } = require('../controllers/companyController');

// Public listing route (GET /companies)
router.get('/', listAllCompanies);

// Logged-in Company's own profile management
router.get('/me', protect, getCompanyProfile);
router.put('/me', protect, updateCompanyProfile);

// NEW: Route to create HR account under this company
router.post('/hr', protect, createHRAccount); // POST /companies/hr

// NEW: Route for company analytics
router.get('/analytics', protect, getCompanyAnalytics);

// Public/Generic Company Profile by ID
router.get('/:id', getCompanyProfileById);

module.exports = router;