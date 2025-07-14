const express = require('express');
const Friendship = require('../models/friendship');
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

// Get friends for user
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const friendships = await Friendship.find({
    $or: [ { user1: userId }, { user2: userId } ],
    status: 'accepted'
  });
  const friendIds = friendships.map(f => f.user1.toString() === userId ? f.user2 : f.user1);
  const friends = await User.find({ _id: { $in: friendIds } }, 'username avatar');
  res.json(friends);
});

// Send friend request
router.post('/request', auth, async (req, res) => {
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: 'Missing friendId' });
  const existing = await Friendship.findOne({
    $or: [
      { user1: req.user.id, user2: friendId },
      { user1: friendId, user2: req.user.id }
    ]
  });
  if (existing) return res.status(409).json({ error: 'Friendship already exists' });
  const friendship = await Friendship.create({ user1: req.user.id, user2: friendId, status: 'pending' });
  res.json(friendship);
});

// Accept/reject friend request
router.post('/:id/respond', auth, async (req, res) => {
  const { id } = req.params;
  const { accept } = req.body;
  const friendship = await Friendship.findById(id);
  if (!friendship) return res.status(404).json({ error: 'Not found' });
  friendship.status = accept ? 'accepted' : 'rejected';
  await friendship.save();
  res.json(friendship);
});

module.exports = router; 