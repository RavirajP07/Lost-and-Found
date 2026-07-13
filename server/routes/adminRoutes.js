const express = require('express');
const router = express.Router();
const { getStats, getActivityLogs, getUsers, deleteUser } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/logs', authenticateToken, requireAdmin, getActivityLogs);
router.get('/users', authenticateToken, requireAdmin, getUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
