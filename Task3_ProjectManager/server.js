require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { setCurrentUser } = require('./middleware/auth');
const initSockets = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Make io accessible inside route files via req.app.get('io')
app.set('io', io);

// ---- DATABASE ----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---- VIEW ENGINE ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- MIDDLEWARE ----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallbackSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use(flash());
app.use(setCurrentUser);

// ---- ROUTES ----
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/projects');
  res.redirect('/login');
});

app.use('/', authRoutes);
app.use('/', projectRoutes);
app.use('/', taskRoutes);
app.use('/', commentRoutes);
app.use('/', notificationRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ---- SOCKET.IO ----
initSockets(io);

// ---- START SERVER ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
