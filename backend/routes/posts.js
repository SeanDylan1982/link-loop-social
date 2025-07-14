const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });
const User = require('../models/user');
// const Comment = require('../models/comment'); // to be created
// const Topic = require('../models/topic'); // to be created
const { updateReputation } = require('../lib/reputation');

// Middleware for authentication (assume exists)
const auth = require('../middleware/auth');

// CREATE post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, topic } = req.body;
    const post = new Post({
      title,
      content,
      topic,
      author: req.user.id,
      image: req.file ? req.file.path : null,
    });
    await post.save();
    await updateReputation(req.user.id, 'post_create');
    req.io.emit('post:new', post);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all posts (feed)
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author').populate('topic').sort({ createdAt: -1 });
  res.json(posts);
});

// READ single post
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author').populate('topic');
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// UPDATE post
router.put('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(post, req.body);
  await post.save();
  req.io.emit('post:update', post);
  res.json(post);
});

// DELETE post
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await post.remove();
  req.io.emit('post:delete', { id: req.params.id });
  res.json({ success: true });
});

// UPVOTE post
router.post('/:id/upvote', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (!post.upvotes.includes(req.user.id)) post.upvotes.push(req.user.id);
  post.downvotes = post.downvotes.filter(u => u.toString() !== req.user.id);
  await post.save();
  await updateReputation(post.author, 'post_upvote');
  req.io.emit('post:vote', { id: post.id, upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  res.json(post);
});

// DOWNVOTE post
router.post('/:id/downvote', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (!post.downvotes.includes(req.user.id)) post.downvotes.push(req.user.id);
  post.upvotes = post.upvotes.filter(u => u.toString() !== req.user.id);
  await post.save();
  await updateReputation(post.author, 'post_downvote');
  req.io.emit('post:vote', { id: post.id, upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  res.json(post);
});

// GET posts by user
router.get('/user/:userId', async (req, res) => {
  const posts = await Post.find({ author: req.params.userId }).populate('author').populate('topic').sort({ createdAt: -1 });
  res.json(posts);
});

module.exports = router; 