const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSettingsSchema = new Schema({
  siteName: { type: String, default: 'Link Loop Social' },
  maintenanceMode: { type: Boolean, default: false },
  moderation: {
    allowPosts: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: true },
    bannedWords: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema); 