const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');

async function sendOtp(req, res) {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate any older OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase().trim() });

    // Store new OTP in MongoDB (expires in 5 minutes via TTL index)
    await Otp.create({
      email: email.toLowerCase().trim(),
      otp,
    });

    // Send email via nodemailer or log to console
    await sendOtpEmail(email, otp);

    const isDev = !process.env.EMAIL_USER;
    res.json({
      message: 'Verification code sent to ' + email,
      devOtp: isDev ? otp : undefined,
      note: isDev ? 'Email service not configured in .env; check server console or use devOtp.' : undefined
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to generate verification code.', error: error.message });
  }
};

async function register(req, res) {
  const { username, email, password, role, roll_number, phone_number, otp } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (!otp) {
    return res.status(400).json({ message: 'Verification code (OTP) is required to register.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Verify OTP from database
    const validOtp = await Otp.findOne({ email: normalizedEmail, otp: otp.trim() });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password_hash,
      role: role || 'student',
      roll_number,
      phone_number
    });

    // Cleanup used OTP
    await Otp.deleteMany({ email: normalizedEmail });

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ message: 'Error fetching profile.', error: error.message });
  }
};

module.exports = {
  sendOtp,
  register,
  login,
  getProfile
};
