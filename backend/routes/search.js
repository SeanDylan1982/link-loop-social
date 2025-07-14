const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Topic = require('../models/topic');
const User = require('../models/user');

router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json({ posts: [], topics: [], users: [] });
  }

  const posts = await Post.find({ $text: { $search: query } }).populate('author');
  const topics = await Topic.find({ $text: { $search: query } });
  const users = await User.find({ $text: { $search: query } });

  res.json({ posts, topics, users });
});

module.exports = router;
