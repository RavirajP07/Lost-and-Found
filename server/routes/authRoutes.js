const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/admin/login', loginAdmin);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
