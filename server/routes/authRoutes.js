const express = require('express');
const router = express.Router();
const { register, login, getProfile, sendOtp } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
// In the simplified setup, admin and student login uses the same endpoint
router.post('/admin/login', login); 
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
