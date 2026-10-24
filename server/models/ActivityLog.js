const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_type: { type: String, enum: ['student', 'admin'], required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

activityLogSchema.virtual('log_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
