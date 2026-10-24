const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  roll_number: { type: String },
  phone_number: { type: String },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('user_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('User', userSchema);
