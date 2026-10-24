const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

function formatClaimResponse(claim) {
  const obj = claim.toJSON ? claim.toJSON() : claim;
  return {
    ...obj,
    item_name: obj.item_id?.item_name,
    claimant_username: obj.claimant_user_id?.username,
    claimant_email: obj.claimant_user_id?.email,
    item_id: obj.item_id?._id?.toString() || obj.item_id?.toString(),
    claimant_user_id: obj.claimant_user_id?._id?.toString() || obj.claimant_user_id?.toString()
  };
};

async function getClaims(req, res) {
  try {
    const isStudent = req.user.role === 'student';
    let query = {};
    if (isStudent) query.claimant_user_id = req.user.id;

    const claims = await Claim.find(query)
      .populate('item_id')
      .populate('claimant_user_id')
      .sort({ created_at: -1 });

    res.json(claims.map(formatClaimResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims.', error: error.message });
  }
};

async function submitClaim(req, res) {
  try {
    const { item_id, description } = req.body;
    if (!item_id || !description) return res.status(400).json({ message: 'Item ID and description are required.' });

    const existingClaim = await Claim.findOne({ item_id, claimant_user_id: req.user.id, claim_status: 'pending' });
    if (existingClaim) return res.status(400).json({ message: 'You already have a pending claim for this item.' });

    const item = await Item.findById(item_id);
    if (!item || item.item_status !== 'active') {
      return res.status(400).json({ message: 'Item is not eligible for claiming (must be active).' });
    }

    const newClaim = await Claim.create({
      item_id,
      claimant_user_id: req.user.id,
      claim_proof: description,
      claim_status: 'pending'
    });

    await ActivityLog.create({
      user_type: 'student',
      user_id: req.user.id,
      action: 'CLAIM_SUBMITTED',
      details: `Submitted claim for item ID: ${item_id}`
    });

    res.status(201).json({ message: 'Claim submitted successfully.', claimId: newClaim._id });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting claim.', error: error.message });
  }
};

async function processClaim(req, res) {
  try {
    const { id } = req.params;
    const { action, status, remarks } = req.body; 
    const claimAction = action || status;

    if (claimAction !== 'approved' && claimAction !== 'rejected') {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const claim = await Claim.findById(id).populate('item_id');
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });

    claim.claim_status = claimAction;
    claim.admin_remarks = remarks || null;
    claim.updated_at = Date.now();
    await claim.save();

    if (claimAction === 'approved') {
      await Item.findByIdAndUpdate(claim.item_id._id, { item_status: 'claimed' });
      await Claim.updateMany(
        { item_id: claim.item_id._id, _id: { $ne: claim._id } },
        { claim_status: 'rejected', admin_remarks: 'Item was claimed by another user.' }
      );
    }

    await Notification.create({
      user_id: claim.claimant_user_id,
      title: `Claim ${claimAction === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your claim for "${claim.item_id.item_name}" has been ${claimAction}. ${remarks ? `Remarks: ${remarks}` : ''}`
    });

    await ActivityLog.create({
      user_type: 'admin',
      user_id: req.user.id,
      action: `CLAIM_${claimAction.toUpperCase()}`,
      details: `Processed claim ID: ${id} as ${claimAction}`
    });

    res.json({ message: `Claim has been ${claimAction} successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Error processing claim.', error: error.message });
  }
};

module.exports = { getClaims, submitClaim, processClaim };
