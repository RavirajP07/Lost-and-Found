const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const defaultCategories = [
  { name: 'Electronics', description: 'Laptops, phones, chargers, etc.' },
  { name: 'Books & Stationery', description: 'Notebooks, textbooks, pens.' },
  { name: 'Clothing & Accessories', description: 'Jackets, hats, sunglasses.' },
  { name: 'Keys & ID Cards', description: 'Hostel keys, student ID cards.' },
  { name: 'Bags & Wallets', description: 'Backpacks, purses, wallets.' },
  { name: 'Miscellaneous', description: 'Anything else.' }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_connect');
    console.log('Connected to MongoDB');

    // Check if categories already exist
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log('Categories already exist. Clearing old categories...');
      await Category.deleteMany({});
    }

    await Category.insertMany(defaultCategories);
    console.log('Default categories seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
};

seedCategories();
