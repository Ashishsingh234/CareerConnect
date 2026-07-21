const express = require('express');
const router = express.Router();
const { registerCandidate, registerCompany, login, refreshToken } = require('../controllers/authController');

router.post('/register/candidate', registerCandidate);
router.post('/register/company', registerCompany);
router.post('/login', login);
router.post('/refresh', refreshToken);

module.exports = router;
