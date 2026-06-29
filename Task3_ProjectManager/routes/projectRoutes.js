const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// LIST all projects the user owns or is a member of
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    }).populate('owner', 'name email');

    res.render('projects/index', { projects });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load projects.');
    res.redirect('/');
  }
});

// FORM to create a new project
router.get('/projects/new', requireAuth, (req, res) => {
  res.render('projects/new');
});

// CREATE a new project
router.post('/projects', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      req.flash('error', 'Project title is required.');
      return res.redirect('/projects/new');
    }

    const project = await Project.create({
      title,
      description,
      owner: req.session.userId,
      members: [req.session.userId] // owner is automatically a member
    });

    req.flash('success', 'Project created!');
    res.redirect(`/projects/${project._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not create project.');
    res.redirect('/projects/new');
  }
});

// VIEW single project -> the task board
router.get('/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      req.flash('error', 'Project not found.');
      return res.redirect('/projects');
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    // All users, so we can show a dropdown to add new members
    const allUsers = await User.find({}, 'name email');

    res.render('projects/show', {
      project,
      todoTasks,
      inProgressTasks,
      doneTasks,
      allUsers
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load project.');
    res.redirect('/projects');
  }
});

// ADD a member to a project
router.post('/projects/:id/members', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      req.flash('error', 'No user found with that email.');
      return res.redirect(`/projects/${project._id}`);
    }

    if (project.members.includes(userToAdd._id)) {
      req.flash('error', 'That user is already a member.');
      return res.redirect(`/projects/${project._id}`);
    }

    project.members.push(userToAdd._id);
    await project.save();

    // Notify the added user, live, via socket
    const notif = await Notification.create({
      user: userToAdd._id,
      message: `You were added to project "${project.title}"`,
      link: `/projects/${project._id}`
    });

    const io = req.app.get('io');
    io.to(`user_${userToAdd._id}`).emit('newNotification', {
      message: notif.message,
      link: notif.link
    });

    req.flash('success', `${userToAdd.name} added to the project.`);
    res.redirect(`/projects/${project._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not add member.');
    res.redirect(`/projects/${req.params.id}`);
  }
});

// DELETE a project (only the owner can do this)
router.post('/projects/:id/delete', requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      req.flash('error', 'Project not found.');
      return res.redirect('/projects');
    }

    // Only the owner is allowed to delete the project
    if (project.owner.toString() !== req.session.userId.toString()) {
      req.flash('error', 'Only the project owner can delete this project.');
      return res.redirect(`/projects/${project._id}`);
    }

    // Clean up everything that belongs to this project so nothing is left behind
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map(t => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    req.flash('success', `Project "${project.title}" was deleted.`);
    res.redirect('/projects');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete project.');
    res.redirect('/projects');
  }
});

module.exports = router;
