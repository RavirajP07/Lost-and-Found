const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_connect');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@campusconnect.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    await User.create({
      username: 'System Admin',
      email: adminEmail,
      password_hash: password_hash,
      role: 'admin',
      roll_number: 'ADMIN001'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@campusconnect.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
