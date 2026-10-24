const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual('category_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Category', categorySchema);
