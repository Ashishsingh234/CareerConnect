const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createReference,
  listReferences,
  getReference,
  applyReference,
} = require('../controllers/referenceController');

// All routes are protected and candidate-only by controller checks
router.post('/', protect, createReference);
router.get('/', protect, listReferences);
router.get('/:id', protect, getReference);
router.post('/:id/apply', protect, applyReference);

module.exports = router;
