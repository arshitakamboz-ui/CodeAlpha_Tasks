const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// LIST notifications for the logged-in user
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.session.userId })
      .sort({ createdAt: -1 });

    // mark all as read once viewed
    await Notification.updateMany(
      { user: req.session.userId, read: false },
      { read: true }
    );

    res.render('notifications', { notifications });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load notifications.');
    res.redirect('/projects');
  }
});

module.exports = router;
