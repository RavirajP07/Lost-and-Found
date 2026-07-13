const db = require('../config/db');

const getStats = async (req, res) => {
  try {
    // Call stored procedure sp_get_admin_stats
    const [results] = await db.query('CALL sp_get_admin_stats()');
    
    // results[0] -> Category counts
    // results[1] -> Claim status counts
    // results[2] -> General stats
    res.json({
      categoryStats: results[0] || [],
      claimStats: results[1] || [],
      generalStats: results[2] ? results[2][0] : {}
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ActivityLogs ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Error fetching activity logs.', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, roll_number, phone_number, created_at FROM Users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ message: 'Error fetching users list.', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM Users WHERE user_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log deletion
    await db.query(
      'INSERT INTO ActivityLogs (user_type, user_id, action, details) VALUES (?, ?, ?, ?)',
      ['admin', req.user.id, 'USER_DELETED', `Deleted student user ID: ${id}`]
    );

    res.json({ message: 'Student user account removed successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student.', error: error.message });
  }
};

module.exports = {
  getStats,
  getActivityLogs,
  getUsers,
  deleteUser
};
