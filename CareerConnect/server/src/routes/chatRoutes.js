const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createChat, getChats, getMessages, sendMessage } = require('../controllers/chatController');

// All chat routes should be protected
// POST /chats - Create a new chat
router.post('/', protect, createChat); 

// GET /chats - Get list of chats for the logged-in user
router.get('/', protect, getChats);

// GET /chats/:chatId/messages - Get messages for a specific chat
router.get('/:chatId/messages', protect, getMessages);

// POST /chats/:chatId/messages - Send a message to a specific chat
router.post('/:chatId/messages', protect, sendMessage);

module.exports = router;