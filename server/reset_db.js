const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Category = require('./models/Category');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');
const bcrypt = require('bcryptjs');

const defaultCategories = [
  { name: 'Electronics', description: 'Laptops, phones, chargers, etc.' },
  { name: 'Books & Stationery', description: 'Notebooks, textbooks, pens.' },
  { name: 'Clothing & Accessories', description: 'Jackets, hats, sunglasses.' },
  { name: 'Keys & ID Cards', description: 'Hostel keys, student ID cards.' },
  { name: 'Bags & Wallets', description: 'Backpacks, purses, wallets.' },
  { name: 'Miscellaneous', description: 'Anything else.' }
];

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found');
    console.log('Connected to MongoDB');

    // 1. Wipe all collections
    console.log('Wiping all data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('All collections cleared!');

    // 2. Seed Admin User
    console.log('Seeding fresh Admin account...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);
    await User.create({
      username: 'System Admin',
      email: 'admin@lostandfound.com',
      password_hash: password_hash,
      role: 'admin',
      roll_number: 'ADMIN001'
    });
    console.log('Admin account created!');

    // 3. Seed Categories
    console.log('Seeding default categories...');
    await Category.insertMany(defaultCategories);
    console.log('Categories seeded!');

    console.log('Database reset complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting database:', err);
    process.exit(1);
  }
};

resetDatabase();
