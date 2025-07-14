const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  topic: { type: Schema.Types.ObjectId, ref: 'Topic' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema); 