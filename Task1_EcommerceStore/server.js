const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const app = express();
const PORT = 3000;

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function getCartCount(req) {
  const cart = req.session.cart || [];
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

mongoose.connect('mongodb+srv://a4155361_db_user:nHcxglrqTbay6MeO@cluster0.ut9jfrv.mongodb.net/?appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products: products, session: req.session, cartCount: getCartCount(req) });
});

app.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.send('Product not found');
  res.render('product', { product: product, session: req.session, cartCount: getCartCount(req) });
});

app.post('/cart/add/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const qty = parseInt(req.body.quantity) || 1;

  if (!req.session.cart) req.session.cart = [];

  const existing = req.session.cart.find(item => item._id === product._id.toString());
  if (existing) {
    existing.quantity += qty;
  } else {
    req.session.cart.push({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty
    });
  }

  const backTo = req.get('Referrer') || '/';
  const separator = backTo.includes('?') ? '&' : '?';
  res.redirect(backTo + separator + 'added=' + encodeURIComponent(product.name));
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.render('cart', { cart: cart, total: total, session: req.session, cartCount: getCartCount(req) });
});

app.post('/cart/increase/:index', (req, res) => {
  if (req.session.cart && req.session.cart[req.params.index]) {
    req.session.cart[req.params.index].quantity += 1;
  }
  res.redirect('/cart');
});

app.post('/cart/decrease/:index', (req, res) => {
  if (req.session.cart && req.session.cart[req.params.index]) {
    req.session.cart[req.params.index].quantity -= 1;
    if (req.session.cart[req.params.index].quantity <= 0) {
      req.session.cart.splice(req.params.index, 1);
    }
  }
  res.redirect('/cart');
});

app.post('/cart/remove/:index', (req, res) => {
  req.session.cart.splice(req.params.index, 1);
  res.redirect('/cart');
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.render('register', { error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/checkout', requireLogin, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  res.render('checkout', { cart: cart, total: total });
});

app.post('/checkout', requireLogin, async (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = new Order({
    userId: req.session.user.id,
    items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
    total: total
  });

  await order.save();

  req.session.cart = [];

  res.render('order-success', { order: order });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});