const User = require('../models/user');

// Action types: post_create, post_upvote, post_downvote, comment_create, comment_upvote, comment_downvote
const REPUTATION_POINTS = {
  post_create: 5,
  post_upvote: 2,
  post_downvote: -1,
  comment_create: 2,
  comment_upvote: 1,
  comment_downvote: -1,
};

async function updateReputation(userId, action) {
  const points = REPUTATION_POINTS[action] || 0;
  if (!points) return;
  await User.findByIdAndUpdate(userId, { $inc: { reputation: points } });
}

module.exports = { updateReputation }; 