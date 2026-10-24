const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentLogs, getAllUsers } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/logs', authenticateToken, requireAdmin, getRecentLogs);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

// Mock delete user since we just simplified it
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    res.json({ message: 'Delete mocked' });
});

module.exports = router;
