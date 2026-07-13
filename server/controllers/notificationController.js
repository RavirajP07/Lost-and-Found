const db = require('../config/db');

const getNotifications = async (req, res) => {
  const isStudent = req.user.role === 'student';
  const query = isStudent 
    ? 'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM Notifications WHERE admin_id = ? ORDER BY created_at DESC';
  const param = req.user.id;

  try {
    const [rows] = await db.query(query, [param]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications.', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  const isStudent = req.user.role === 'student';
  
  const query = isStudent
    ? 'UPDATE Notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?'
    : 'UPDATE Notifications SET is_read = TRUE WHERE notification_id = ? AND admin_id = ?';

  try {
    const [result] = await db.query(query, [id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found or unauthorized.' });
    }
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification.', error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  const isStudent = req.user.role === 'student';
  const query = isStudent
    ? 'UPDATE Notifications SET is_read = TRUE WHERE user_id = ?'
    : 'UPDATE Notifications SET is_read = TRUE WHERE admin_id = ?';

  try {
    await db.query(query, [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications.', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
