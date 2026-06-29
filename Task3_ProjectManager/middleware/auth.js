module.exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/login');
  }
  next();
};

// Makes current user + flash messages available in every view automatically
module.exports.setCurrentUser = async (req, res, next) => {
  const User = require('../models/User');
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      res.locals.currentUser = user;
    } catch (err) {
      res.locals.currentUser = null;
    }
  }

  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
};
