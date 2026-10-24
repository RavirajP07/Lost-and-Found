const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const ActivityLog = require('../models/ActivityLog');

async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalItems = await Item.countDocuments();
    const activeItems = await Item.countDocuments({ item_status: 'active' });
    const resolvedItems = await Item.countDocuments({ item_status: { $in: ['resolved', 'claimed'] } });
    const pendingClaims = await Claim.countDocuments({ claim_status: 'pending' });

    res.json({
      totalUsers,
      totalItems,
      activeItems,
      resolvedItems,
      pendingClaims
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
};

async function getRecentLogs(req, res) {
  try {
    const logs = await ActivityLog.find()
      .populate('user_id', 'username email role')
      .sort({ created_at: -1 })
      .limit(50);

    const formattedLogs = logs.map(log => {
      const obj = log.toJSON();
      return {
        ...obj,
        username: obj.user_id?.username,
        email: obj.user_id?.email,
        user_id: obj.user_id?._id || obj.user_id
      };
    });

    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs.', error: error.message });
  }
};

async function getAllUsers(req, res) {
  try {
    const users = await User.find({ role: 'student' }).select('-password_hash').sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

module.exports = { getDashboardStats, getRecentLogs, getAllUsers };
