const express = require('express');
const router = express.Router();
const Topic = require('../models/topic');
const Post = require('../models/post');
const auth = require('../middleware/auth');

// CREATE topic
router.post('/', auth, async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all topics
router.get('/', async (req, res) => {
  const topics = await Topic.find().sort({ name: 1 });
  res.json(topics);
});

// READ single topic
router.get('/:id', async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Not found' });
  res.json(topic);
});

// UPDATE topic
router.put('/:id', auth, async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Not found' });
  Object.assign(topic, req.body);
  await topic.save();
  res.json(topic);
});

// DELETE topic
router.delete('/:id', auth, async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Not found' });
  await topic.remove();
  res.json({ success: true });
});

// FILTER topics by name
router.get('/search/:name', async (req, res) => {
  const topics = await Topic.find({ name: new RegExp(req.params.name, 'i') });
  res.json(topics);
});

// GET posts for a topic
router.get('/:id/posts', async (req, res) => {
  const posts = await Post.find({ topic: req.params.id }).populate('author').sort({ createdAt: -1 });
  res.json(posts);
});

module.exports = router; 