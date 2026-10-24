const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimant_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claim_proof: { type: String, required: true },
  claim_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  admin_remarks: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

claimSchema.virtual('claim_id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Claim', claimSchema);
