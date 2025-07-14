const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const { updateReputation } = require('../lib/reputation');

const auth = require('../middleware/auth');

// CREATE comment
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({ ...req.body, author: req.user.id });
    await comment.save();
    // Add comment to post
    await Post.findByIdAndUpdate(comment.post, { $push: { comments: comment._id } });
    await updateReputation(req.user.id, 'comment_create');
    req.io.emit('comment:new', comment);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all comments for a post
router.get('/post/:postId', async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate('author').sort({ createdAt: 1 });
  res.json(comments);
});

// READ single comment
router.get('/:id', async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate('author');
  if (!comment) return res.status(404).json({ error: 'Not found' });
  res.json(comment);
});

// UPDATE comment
router.put('/:id', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(comment, req.body);
  await comment.save();
  req.io.emit('comment:update', comment);
  res.json(comment);
});

// DELETE comment
router.delete('/:id', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await comment.remove();
  req.io.emit('comment:delete', { id: req.params.id });
  res.json({ success: true });
});

// UPVOTE comment
router.post('/:id/upvote', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (!comment.upvotes.includes(req.user.id)) comment.upvotes.push(req.user.id);
  comment.downvotes = comment.downvotes.filter(u => u.toString() !== req.user.id);
  await comment.save();
  await updateReputation(comment.author, 'comment_upvote');
  req.io.emit('comment:vote', { id: comment.id, upvotes: comment.upvotes.length, downvotes: comment.downvotes.length });
  res.json(comment);
});

// DOWNVOTE comment
router.post('/:id/downvote', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (!comment.downvotes.includes(req.user.id)) comment.downvotes.push(req.user.id);
  comment.upvotes = comment.upvotes.filter(u => u.toString() !== req.user.id);
  await comment.save();
  await updateReputation(comment.author, 'comment_downvote');
  req.io.emit('comment:vote', { id: comment.id, upvotes: comment.upvotes.length, downvotes: comment.downvotes.length });
  res.json(comment);
});

module.exports = router; 