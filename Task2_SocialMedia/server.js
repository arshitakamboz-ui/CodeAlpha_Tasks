const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');
const Story = require('./models/Story');

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'socialapp',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
    };
  }
});

const upload = multer({ storage });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'social-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Time ago helper
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return date.toLocaleDateString();
}

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.render('register', { error: 'Email or username already taken' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, username, email, password: hashedPassword });
  await user.save();
  res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid email or password' });
  }
  req.session.user = { id: user._id, name: user.name, username: user.username, profilePhoto: user.profilePhoto };
  res.redirect('/');
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

app.get('/', requireLogin, async (req, res) => {
  const currentUser = await User.findById(req.session.user.id);
  const following = [...currentUser.following, currentUser._id];
  const posts = await Post.find({ author: { $in: following } })
    .populate('author')
    .sort({ createdAt: -1 });
  const stories = await Story.find({ author: { $in: following } })
    .populate('author')
    .sort({ createdAt: -1 });
  const notifCount = await Notification.find({ recipient: req.session.user.id, read: false }).countDocuments();
  const suggestedUsers = await User.find({ _id: { $nin: [...following] } }).limit(5);
  res.render('feed', { posts, currentUser, notifCount, stories, suggestedUsers, timeAgo });
});

app.post('/story/create', requireLogin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.redirect('/');
  const story = new Story({
    author: req.session.user.id,
    image: req.file.path
  });
  await story.save();
  res.redirect('/');
});

app.get('/story/:id', requireLogin, async (req, res) => {
  const story = await Story.findById(req.params.id).populate('author');
  if (!story) return res.redirect('/');
  if (!story.viewers.includes(req.session.user.id)) {
    story.viewers.push(req.session.user.id);
    await story.save();
  }
  res.render('story', { story, currentUser: await User.findById(req.session.user.id) });
});

app.post('/story/:id/delete', requireLogin, async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (story && story.author.toString() === req.session.user.id.toString()) {
    await Story.findByIdAndDelete(req.params.id);
  }
  res.redirect('/');
});

app.post('/post/create', requireLogin, upload.single('media'), async (req, res) => {
  let image = null, video = null, mediaType = null;
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    if (isVideo) {
      video = req.file.path;
      mediaType = 'video';
    } else {
      image = req.file.path;
      mediaType = 'image';
    }
  }
  const post = new Post({
    author: req.session.user.id,
    content: req.body.content,
    image, video, mediaType
  });
  await post.save();
  res.redirect('/');
});

app.get('/post/:id', requireLogin, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author');
  if (!post) return res.redirect('/');
  const comments = await Comment.find({ post: req.params.id }).populate('author').sort({ createdAt: -1 });
  const currentUser = await User.findById(req.session.user.id);
  res.render('post', { post, comments, currentUser, timeAgo });
});

app.post('/post/:id/delete', requireLogin, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post && post.author.toString() === req.session.user.id.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
  }
  res.redirect('/');
});

app.post('/post/:id/like', requireLogin, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.session.user.id;
  const liked = post.likes.some(id => id.toString() === userId.toString());
  if (liked) {
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
  } else {
    post.likes.push(userId);
    if (post.author.toString() !== userId.toString()) {
      await new Notification({ recipient: post.author, sender: userId, type: 'like', post: post._id }).save();
    }
  }
  await post.save();
  res.redirect(req.headers.referer || '/');
});

app.post('/post/:id/save', requireLogin, async (req, res) => {
  const currentUser = await User.findById(req.session.user.id);
  const postId = req.params.id;
  const saved = currentUser.savedPosts.some(id => id.toString() === postId.toString());
  if (saved) {
    currentUser.savedPosts = currentUser.savedPosts.filter(id => id.toString() !== postId.toString());
  } else {
    currentUser.savedPosts.push(postId);
  }
  await currentUser.save();
  res.redirect(req.headers.referer || '/');
});

app.get('/bookmarks', requireLogin, async (req, res) => {
  const currentUser = await User.findById(req.session.user.id);
  const savedPosts = await Post.find({ _id: { $in: currentUser.savedPosts } }).populate('author').sort({ createdAt: -1 });
  res.render('bookmarks', { savedPosts, currentUser });
});

app.post('/post/:id/comment', requireLogin, async (req, res) => {
  const comment = new Comment({ post: req.params.id, author: req.session.user.id, content: req.body.content });
  await comment.save();
  const post = await Post.findById(req.params.id);
  if (post.author.toString() !== req.session.user.id.toString()) {
    await new Notification({ recipient: post.author, sender: req.session.user.id, type: 'comment', post: post._id }).save();
  }
  res.redirect('/post/' + req.params.id);
});

app.get('/profile/:username', requireLogin, async (req, res) => {
  const profileUser = await User.findOne({ username: req.params.username });
  if (!profileUser) return res.send('User not found');
  const posts = await Post.find({ author: profileUser._id }).sort({ createdAt: -1 });
  const currentUser = await User.findById(req.session.user.id);
  const isFollowing = currentUser.following.some(id => id.toString() === profileUser._id.toString());
  const isOwnProfile = currentUser._id.toString() === profileUser._id.toString();
  res.render('profile', { profileUser, posts, currentUser, isFollowing, isOwnProfile });
});

app.post('/profile/edit', requireLogin, upload.single('profilePhoto'), async (req, res) => {
  const updates = { name: req.body.name, bio: req.body.bio };
  if (req.file) updates.profilePhoto = req.file.path;
  await User.findByIdAndUpdate(req.session.user.id, updates);
  req.session.user.name = req.body.name;
  const user = await User.findById(req.session.user.id);
  res.redirect('/profile/' + user.username);
});

app.post('/follow/:id', requireLogin, async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.session.user.id);
  const isFollowing = currentUser.following.some(id => id.toString() === targetUser._id.toString());
  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
  } else {
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
    await new Notification({ recipient: targetUser._id, sender: currentUser._id, type: 'follow' }).save();
  }
  await currentUser.save();
  await targetUser.save();
  res.redirect(req.headers.referer || '/');
});

app.get('/hashtag/:tag', requireLogin, async (req, res) => {
  const tag = req.params.tag;
  const posts = await Post.find({ content: { $regex: '#' + tag, $options: 'i' } })
    .populate('author')
    .sort({ createdAt: -1 });
  const currentUser = await User.findById(req.session.user.id);
  res.render('hashtag', { posts, tag, currentUser, timeAgo });
});

app.get('/explore', requireLogin, async (req, res) => {
  const currentUser = await User.findById(req.session.user.id);
  const posts = await Post.find({}).populate('author').sort({ createdAt: -1 }).limit(50);
  res.render('explore', { posts, currentUser });
});

app.get('/search', requireLogin, async (req, res) => {
  const query = req.query.q || '';
  const users = query ? await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } }
    ]
  }) : [];
  res.render('search', { users, query, currentUser: await User.findById(req.session.user.id) });
});

app.get('/notifications', requireLogin, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.session.user.id })
    .populate('sender')
    .populate('post')
    .sort({ createdAt: -1 });
  await Notification.updateMany({ recipient: req.session.user.id }, { read: true });
  res.render('notifications', { notifications, currentUser: await User.findById(req.session.user.id) });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));