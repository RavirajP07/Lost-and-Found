const db = require('../config/db');

const submitClaim = async (req, res) => {
  const { item_id, description } = req.body;
  const user_id = req.user.id;

  if (!item_id || !description) {
    return res.status(400).json({ message: 'Item ID and description of proof are required.' });
  }

  try {
    // Call stored procedure sp_submit_claim
    await db.query('CALL sp_submit_claim(?, ?, ?)', [item_id, user_id, description]);
    res.status(201).json({ message: 'Claim submitted successfully.' });
  } catch (error) {
    console.error('Error submitting claim via SP:', error);
    res.status(400).json({ message: error.message || 'Failed to submit claim.' });
  }
};

const getClaims = async (req, res) => {
  const { status } = req.query;
  const isStudent = req.user.role === 'student';

  let sql = 'SELECT * FROM vw_claim_details WHERE 1=1';
  const params = [];

  if (isStudent) {
    sql += ' AND claimant_user_id = ?';
    params.push(req.user.id);
  }

  if (status) {
    sql += ' AND claim_status = ?';
    params.push(status);
  }

  sql += ' ORDER BY claimed_at DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Error fetching claims.', error: error.message });
  }
};

const processClaim = async (req, res) => {
  const { id } = req.params; // claim_id
  const { status, remarks } = req.body; // 'approved' or 'rejected', and admin_remarks
  const admin_id = req.user.id;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid claim status (must be approved or rejected).' });
  }

  try {
    // Call stored procedure sp_process_claim
    await db.query('CALL sp_process_claim(?, ?, ?, ?)', [id, admin_id, status, remarks || '']);
    res.json({ message: `Claim successfully ${status}.` });
  } catch (error) {
    console.error('Error processing claim via SP:', error);
    res.status(400).json({ message: error.message || 'Failed to process claim.' });
  }
};

module.exports = {
  submitClaim,
  getClaims,
  processClaim
};
