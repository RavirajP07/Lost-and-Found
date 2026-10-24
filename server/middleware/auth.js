const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired.' });
    }
    req.user = decoded;
    next();
  });
};

function requireStudent(req, res, next) {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Student access required.' });
  }
}

function requireAdmin(req, res, next) {
  console.log('requireAdmin middleware hit. req.user:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }
};

module.exports = {
  authenticateToken,
  requireStudent,
  requireAdmin
};
