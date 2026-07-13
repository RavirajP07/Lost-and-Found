const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerStudent = async (req, res) => {
  const { username, email, password, roll_number, phone_number } = req.body;

  if (!username || !email || !password || !roll_number || !phone_number) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query(
      'SELECT username, email FROM Users WHERE username = ? OR email = ? OR roll_number = ?',
      [username, email, roll_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username, email, or roll number already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert student
    const [result] = await db.query(
      'INSERT INTO Users (username, email, password_hash, roll_number, phone_number) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, roll_number, phone_number]
    );

    const studentId = result.insertId;

    // Generate JWT
    const token = jwt.sign(
      { id: studentId, username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Activity Log
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['student', studentId, 'REGISTER', `Student registered: ${username}`]
    );

    res.status(201).json({
      message: 'Student registered successfully.',
      token,
      user: { id: studentId, username, email, roll_number, phone_number, role: 'student' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

const loginStudent = async (req, res) => {
  const { identifier, password } = req.body; // Can be email or username

  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [users] = await db.query(
      'SELECT * FROM Users WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Activity Log
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['student', user.user_id, 'LOGIN', `Student logged in: ${user.username}`]
    );

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        roll_number: user.roll_number,
        phone_number: user.phone_number,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [admins] = await db.query(
      'SELECT * FROM Admins WHERE email = ? OR username = ?',
      [identifier, identifier]
    );

    if (admins.length === 0) {
      return res.status(400).json({ message: 'Invalid admin credentials.' });
    }

    const admin = admins[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.admin_id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Activity Log
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['admin', admin.admin_id, 'LOGIN', `Admin logged in: ${admin.username}`]
    );

    res.json({
      message: 'Admin logged in successfully.',
      token,
      user: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login.', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const [users] = await db.query(
        'SELECT user_id AS id, username, email, roll_number, phone_number, created_at FROM Users WHERE user_id = ?',
        [req.user.id]
      );
      if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
      return res.json({ ...users[0], role: 'student' });
    } else if (req.user.role === 'admin') {
      const [admins] = await db.query(
        'SELECT admin_id AS id, username, email, created_at FROM Admins WHERE admin_id = ?',
        [req.user.id]
      );
      if (admins.length === 0) return res.status(404).json({ message: 'Admin not found.' });
      return res.json({ ...admins[0], role: 'admin' });
    } else {
      res.status(400).json({ message: 'Invalid role.' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.', error: error.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getProfile
};
