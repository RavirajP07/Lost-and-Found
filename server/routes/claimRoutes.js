const express = require('express');
const router = express.Router();
const { submitClaim, getClaims, processClaim } = require('../controllers/claimController');
const { authenticateToken, requireAdmin, requireStudent } = require('../middleware/auth');

router.post('/', authenticateToken, submitClaim);
router.get('/', authenticateToken, getClaims);
router.put('/:id/process', authenticateToken, requireAdmin, processClaim);

module.exports = router;
