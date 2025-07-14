const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  title: String,
  isGroup: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', ConversationSchema); 