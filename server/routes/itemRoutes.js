const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem, updateItem, deleteItem, upload } = require('../controllers/itemController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', authenticateToken, upload.single('image'), createItem);
router.put('/:id', authenticateToken, updateItem);
router.delete('/:id', authenticateToken, deleteItem);

module.exports = router;
