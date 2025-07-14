const mongoose = require('mongoose');
const { Schema } = mongoose;

const systemMessageSchema = new Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('SystemMessage', systemMessageSchema); 