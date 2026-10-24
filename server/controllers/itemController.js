const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    if (filetypes.test(file.mimetype) && filetypes.test(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed.'));
  }
});

function formatItemResponse(item) {
  const obj = item.toJSON ? item.toJSON() : item;
  return {
    ...obj,
    category_name: obj.category_id?.name,
    category_id: obj.category_id?._id?.toString() || obj.category_id?.toString(),
    reporter_username: obj.reporter_user_id?.username,
    reporter_email: obj.reporter_user_id?.email,
    reporter_user_id: obj.reporter_user_id?._id?.toString() || obj.reporter_user_id?.toString()
  };
};

async function getItems(req, res) {
  try {
    const { name, category_id, location, date_reported, status, type } = req.query;
    let query = {};
    
    if (name) query.$or = [{ item_name: new RegExp(name, 'i') }, { description: new RegExp(name, 'i') }];
    if (category_id) query.category_id = category_id;
    if (location) query.location = new RegExp(location, 'i');
    if (date_reported && !isNaN(new Date(date_reported).getTime())) {
      const startOfDay = new Date(date_reported);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date_reported);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date_reported = { $gte: startOfDay, $lte: endOfDay };
    }
    if (status) query.item_status = status;
    if (type) query.type = type;

    const items = await Item.find(query)
      .populate('category_id')
      .populate('reporter_user_id')
      .sort({ created_at: -1 });

    res.json(items.map(formatItemResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items.', error: error.message });
  }
};

async function getItemById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Item not found (invalid ID).' });
    }

    const item = await Item.findById(req.params.id)
      .populate('category_id')
      .populate('reporter_user_id');
      
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(formatItemResponse(item));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item.', error: error.message });
  }
};

async function createItem(req, res) {
  try {
    const { name, item_name, description, category_id, type, location, date_reported } = req.body;
    let imagePath = null;
    if (req.file) imagePath = `uploads/${req.file.filename}`;

    const dateVal = date_reported && !isNaN(new Date(date_reported).getTime()) 
      ? new Date(date_reported) 
      : new Date();

    const newItem = await Item.create({
      item_name: name || item_name,
      description,
      category_id,
      type: type || 'found',
      location,
      date_reported: dateVal,
      reporter_user_id: req.user.id,
      primary_image_path: imagePath
    });

    res.status(201).json({ message: 'Item reported successfully.', itemId: newItem._id, imagePath });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error creating item.', error: error.message });
  }
};

async function updateItem(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Item not found (invalid ID).' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const isOwner = req.user.role === 'admin' || (item.reporter_user_id && item.reporter_user_id.toString() === req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Not authorized.' });

    const { name, description, category_id, type, location, date_reported, status } = req.body;
    await Item.findByIdAndUpdate(req.params.id, {
      item_name: name,
      description,
      category_id,
      type,
      location,
      date_reported: date_reported ? new Date(date_reported) : item.date_reported,
      item_status: status,
      updated_at: Date.now()
    });

    await ActivityLog.create({
      user_type: req.user.role,
      user_id: req.user.id,
      action: 'ITEM_UPDATED',
      details: `Updated item ID: ${req.params.id}`
    });

    res.json({ message: 'Item updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating item.', error: error.message });
  }
};

async function deleteItem(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Item not found (invalid ID).' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const isAuthorized = req.user.role === 'admin' || (item.reporter_user_id && item.reporter_user_id.toString() === req.user.id);
    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized.' });

    if (item.primary_image_path) {
      const fullPath = path.join(__dirname, '..', item.primary_image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await Item.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user_type: req.user.role,
      user_id: req.user.id,
      action: 'ITEM_DELETED',
      details: `Deleted item ID: ${req.params.id}`
    });

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item.', error: error.message });
  }
};

module.exports = { upload, getItems, getItemById, createItem, updateItem, deleteItem };
