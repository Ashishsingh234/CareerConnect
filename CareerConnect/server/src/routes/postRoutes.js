const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createPost, listPosts, toggleLike, addComment } = require('../controllers/postController');

router.post('/', protect, createPost);
router.get('/', protect, listPosts);

// Like/unlike a post
router.post('/:postId/like', protect, toggleLike);

// Add a comment
router.post('/:postId/comment', protect, addComment);

module.exports = router;
