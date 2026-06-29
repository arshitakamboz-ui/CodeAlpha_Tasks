const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET register page
router.get('/register', (req, res) => {
  res.render('register');
});

// POST register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    req.session.userId = newUser._id;
    req.flash('success', `Welcome, ${newUser.name}!`);
    res.redirect('/projects');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong during registration.');
    res.redirect('/register');
  }
});

// GET login page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/projects');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong during login.');
    res.redirect('/login');
  }
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
