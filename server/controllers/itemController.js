const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer File Upload Configuration
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed.'));
  }
});

// Controllers
const getItems = async (req, res) => {
  const { name, category_id, location, date_reported, status, type } = req.query;
  
  let sql = 'SELECT * FROM vw_item_details WHERE 1=1';
  const params = [];

  if (name) {
    sql += ' AND (item_name LIKE ? OR description LIKE ?)';
    params.push(`%${name}%`, `%${name}%`);
  }
  if (category_id) {
    sql += ' AND category_id = ?';
    params.push(category_id);
  }
  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }
  if (date_reported) {
    sql += ' AND date_reported = ?';
    params.push(date_reported);
  }
  if (status) {
    sql += ' AND item_status = ?';
    params.push(status);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items.', error: error.message });
  }
};

const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM vw_item_details WHERE item_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const [images] = await db.query('SELECT image_id, image_path FROM ItemImages WHERE item_id = ?', [id]);
    
    res.json({
      ...rows[0],
      images
    });
  } catch (error) {
    console.error('Error fetching item details:', error);
    res.status(500).json({ message: 'Error fetching item details.', error: error.message });
  }
};

const createItem = async (req, res) => {
  const { name, description, category_id, type, location, date_reported } = req.body;

  if (!name || !description || !category_id || !type || !location || !date_reported) {
    // If upload file exists, cleanup uploaded file because request was bad
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const isStudent = req.user.role === 'student';
    const userId = isStudent ? req.user.id : null;
    const adminId = !isStudent ? req.user.id : null;

    // Insert Item record
    const [result] = await db.query(
      'INSERT INTO Items (name, description, category_id, type, location, date_reported, status, user_id, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, category_id, type, location, date_reported, 'active', userId, adminId]
    );

    const itemId = result.insertId;

    // Handle Image upload if file exists
    let imagePath = null;
    if (req.file) {
      // Save relative path for serving
      imagePath = `uploads/${req.file.filename}`;
      await db.query('INSERT INTO ItemImages (item_id, image_path) VALUES (?, ?)', [itemId, imagePath]);
    }

    res.status(201).json({
      message: 'Item reported successfully.',
      itemId,
      imagePath
    });
  } catch (error) {
    console.error('Error creating item:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error creating item.', error: error.message });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, category_id, type, location, date_reported, status } = req.body;

  try {
    // Verify ownership or check if Admin
    const [rows] = await db.query('SELECT user_id, admin_id FROM Items WHERE item_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const item = rows[0];
    const isOwner = req.user.role === 'admin' || 
                    (req.user.role === 'student' && item.user_id === req.user.id);

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to edit this item.' });
    }

    // Update item info
    await db.query(
      'UPDATE Items SET name = ?, description = ?, category_id = ?, type = ?, location = ?, date_reported = ?, status = ? WHERE item_id = ?',
      [name, description, category_id, type, location, date_reported, status, id]
    );

    // Logging edit
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.role, req.user.id, 'ITEM_UPDATED', `Updated item ID: ${id}`]
    );

    res.json({ message: 'Item updated successfully.' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item.', error: error.message });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership or check if Admin
    const [rows] = await db.query('SELECT user_id, admin_id FROM Items WHERE item_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const item = rows[0];
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'student' && item.user_id === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this item.' });
    }

    // Optional: unlink image files from disk
    const [images] = await db.query('SELECT image_path FROM ItemImages WHERE item_id = ?', [id]);
    images.forEach(img => {
      const fullPath = path.join(__dirname, '..', img.image_path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { console.error('Failed to delete file:', fullPath); }
      }
    });

    await db.query('DELETE FROM Items WHERE item_id = ?', [id]);

    // Logging deletion
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      [req.user.role, req.user.id, 'ITEM_DELETED', `Deleted item ID: ${id}`]
    );

    res.json({ message: 'Item and associated images deleted successfully.' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item.', error: error.message });
  }
};

module.exports = {
  upload,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
