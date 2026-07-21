require('dotenv').config();
const express = require('express');
const cors = require('cors');
// ObjectId is now handled inside the controller, so we only need mongoose for connectDB
const { connectDB } = require('./config/db');
const mongoose = require('mongoose');

// Ensure models are registered before routes/controllers use them
require('./models/Job');
require('./models/User');
require('./models/Company');
require('./models/CandidateProfile');
require('./models/Application');
require('./models/Chat');
require('./models/ContactMessage');
require('./models/Post');

const authRoutes = require('./routes/authRoutes');
const { getFile, getPublicFile } = require('./controllers/uploadController'); // <-- NEW: Import getFile and getPublicFile

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.get('/', (req, res) => res.json({ ok: true, msg: 'CareerConnect API' }));

    // Protected and Public Routes
    const { protect } = require('./middlewares/authMiddleware');

    // Auth Routes
    app.use('/auth', authRoutes);

    // --- File Download Routes ---
    // Protected files (resumes/profile images) - requires auth
    app.get('/files/:fileId', protect, getFile);
    // Public files (company logos and post/job images) - no auth required
    app.get('/public-files/:fileId', getPublicFile);
    // --- End File Download Routes ---

    const uploadRoutes = require('./routes/uploadRoutes');
    app.use('/upload', uploadRoutes); // File upload routes (POST)

    const jobRoutes = require('./routes/jobRoutes');
    app.use('/jobs', jobRoutes);

    const companyRoutes = require('./routes/companyRoutes');
    app.use('/companies', companyRoutes);

    const applicationRoutes = require('./routes/applicationRoutes');
    app.use('/applications', applicationRoutes);

    const chatRoutes = require('./routes/chatRoutes');
    app.use('/chat', chatRoutes);

    const contactRoutes = require('./routes/contactRoutes');
    app.use('/contact', contactRoutes);

    const notificationRoutes = require('./routes/notificationRoutes');
    app.use('/notifications', notificationRoutes);

    const postRoutes = require('./routes/postRoutes');
    app.use('/posts', postRoutes);

    const referenceRoutes = require('./routes/referenceRoutes');
    app.use('/references', referenceRoutes);

    const candidateRoutes = require('./routes/candidateRoutes');
    app.use('/profiles', candidateRoutes); // Candidate Profile CRUD via /profiles/me

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });