const mongoose = require('mongoose');
const { Schema } = mongoose;

const topicSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema); 