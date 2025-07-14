const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/adminSettings');
const auth = require('../middleware/auth');
// Assume isAdmin middleware exists
const isAdmin = require('../middleware/isAdmin');

// GET admin settings
router.get('/', auth, isAdmin, async (req, res) => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});
  res.json(settings);
});

// UPDATE admin settings
router.put('/', auth, isAdmin, async (req, res) => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});
  Object.assign(settings, req.body, { updatedAt: new Date() });
  await settings.save();
  res.json(settings);
});

module.exports = router; 