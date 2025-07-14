const express = require('express');
const Conversation = require('../models/conversation');
const User = require('../models/user');
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

// Get all conversations for user
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'username avatar')
    .sort({ updatedAt: -1 });
  res.json(conversations);
});

// Create conversation
router.post('/', auth, async (req, res) => {
  const { participantIds, title, isGroup } = req.body;
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
    return res.status(400).json({ error: 'At least two participants required' });
  }
  const conversation = await Conversation.create({
    title: title || null,
    isGroup: !!isGroup,
    participants: participantIds,
  });
  res.json(conversation);
});

// Get conversation by id
router.get('/:id', auth, async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'username avatar');
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  res.json(conversation);
});

module.exports = router; 