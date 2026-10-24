const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  description: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String, required: true },
  item_status: { type: String, enum: ['active', 'claimed', 'resolved'], default: 'active' },
  reporter_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date_reported: { type: Date, required: true },
  primary_image_path: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

itemSchema.virtual('item_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Item', itemSchema);
