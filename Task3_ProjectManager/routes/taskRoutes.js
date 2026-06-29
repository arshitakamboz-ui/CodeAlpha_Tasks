const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// CREATE a new task on a project board
router.post('/projects/:projectId/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, assignee } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!title) {
      req.flash('error', 'Task title is required.');
      return res.redirect(`/projects/${project._id}`);
    }

    const task = await Task.create({
      title,
      description,
      project: project._id,
      assignee: assignee || null,
      createdBy: req.session.userId
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    // Broadcast to everyone viewing this project's board right now
    const io = req.app.get('io');
    io.to(`project_${project._id}`).emit('taskCreated', populatedTask);

    // If someone was assigned, notify them directly
    if (assignee) {
      const notif = await Notification.create({
        user: assignee,
        message: `You were assigned a new task: "${task.title}"`,
        link: `/projects/${project._id}`
      });
      io.to(`user_${assignee}`).emit('newNotification', {
        message: notif.message,
        link: notif.link
      });
    }

    req.flash('success', 'Task created!');
    res.redirect(`/projects/${project._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not create task.');
    res.redirect(`/projects/${req.params.projectId}`);
  }
});

// UPDATE task status (used by the drag/drop or dropdown on the board)
router.post('/tasks/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignee', 'name email');

    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('taskUpdated', task);

    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Could not update task status.' });
  }
});

// DELETE a task
router.post('/tasks/:id/delete', requireAuth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.to(`project_${task.project}`).emit('taskDeleted', { taskId: task._id });

    req.flash('success', 'Task deleted.');
    res.redirect(`/projects/${task.project}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete task.');
    res.redirect('/projects');
  }
});

module.exports = router;
