const express = require('express');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  res.json(messages);
});

// Send a message
router.post('/', auth, async (req, res) => {
  const { conversationId, content, receiverId } = req.body;
  if (!conversationId || !content) return res.status(400).json({ error: 'Missing fields' });
  const message = await Message.create({
    conversationId,
    senderId: req.user.id,
    receiverId: receiverId || null,
    content,
    read: false,
  });
  // Optionally update conversation updatedAt
  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
  // Emit real-time event (if Socket.IO is available)
  if (req.app.get('io')) {
    req.app.get('io').to(conversationId).emit('new-message', message);
  }
  res.json(message);
});

module.exports = router; 