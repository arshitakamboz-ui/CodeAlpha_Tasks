const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb+srv://a4155361_db_user:nHcxglrqTbay6MeO@cluster0.ut9jfrv.mongodb.net/?appName=Cluster0')
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany([
      { name: 'T-Shirt', price: 499, image: '/images/tshirt.jpg' },
      { name: 'Sneakers', price: 1999, image: '/images/sneakers.jpg' },
      { name: 'Backpack', price: 1299, image: '/images/backpack.jpg' },
      { name: 'Wrist Watch', price: 2499, image: '/images/wristwatch.jpg' },
      { name: 'Sunglasses', price: 899, image: '/images/sunglasses.jpg' },
      { name: 'Cap', price: 349, image: '/images/cap.jpg' },
      { name: 'Headphones', price: 1799, image: '/images/headphones.jpg' },
      { name: 'Wallet', price: 699, image: '/images/wallet.jpg' },
      { name: 'Jacket', price: 2999, image: '/images/jacket.jpg' }
    ]);
    console.log('Products seeded!');

  })
  .catch(err => console.log(err));