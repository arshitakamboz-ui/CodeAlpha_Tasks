const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// ADD a comment to a task
router.post('/tasks/:taskId/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!text || !text.trim()) {
      return res.redirect(`/projects/${task.project}`);
    }

    const comment = await Comment.create({
      text,
      task: task._id,
      author: req.session.userId
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email');

    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('commentAdded', {
      taskId: task._id,
      comment: populatedComment
    });

    // Notify the task's assignee (if it's not the commenter themselves)
    if (task.assignee && task.assignee.toString() !== req.session.userId.toString()) {
      const notif = await Notification.create({
        user: task.assignee,
        message: `New comment on task "${task.title}"`,
        link: `/projects/${task.project}`
      });
      io.to(`user_${task.assignee}`).emit('newNotification', {
        message: notif.message,
        link: notif.link
      });
    }

    req.flash('success', 'Comment added.');
    res.redirect(`/projects/${task.project}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add comment.');
    res.redirect('/projects');
  }
});

// GET comments for a task (used to load comments via fetch on the board page)
router.get('/tasks/:taskId/comments', requireAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not load comments.' });
  }
});

module.exports = router;
