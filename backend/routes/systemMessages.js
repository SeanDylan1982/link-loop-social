const express = require('express');
const router = express.Router();
const SystemMessage = require('../models/systemMessage');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// CREATE system message
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const msg = new SystemMessage(req.body);
    await msg.save();
    req.io.emit('system:message', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all active system messages
router.get('/active', async (req, res) => {
  const now = new Date();
  const messages = await SystemMessage.find({ isActive: true, $or: [ { expiresAt: null }, { expiresAt: { $gt: now } } ] }).sort({ createdAt: -1 });
  res.json(messages);
});

// DEACTIVATE system message
router.put('/:id/deactivate', auth, isAdmin, async (req, res) => {
  const msg = await SystemMessage.findById(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  msg.isActive = false;
  await msg.save();
  req.io.emit('system:message:deactivate', { id: msg.id });
  res.json(msg);
});

module.exports = router; 