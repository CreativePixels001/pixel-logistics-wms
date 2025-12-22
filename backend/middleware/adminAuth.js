const auth = require('./authSimple');

/**
 * Admin Authorization Middleware
 * Ensures user has admin role
 */
module.exports = function(req, res, next) {
  // First authenticate
  auth(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  });
};
