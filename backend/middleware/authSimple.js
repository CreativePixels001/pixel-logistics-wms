/**
 * Simple Authentication Middleware for Testing
 * No JWT verification - just adds a mock user to request
 */

const auth = (req, res, next) => {
  // Mock authenticated user for testing
  req.user = {
    userId: 1,
    username: 'admin',
    email: 'admin@warehouse.com',
    role: 'admin'
  };
  
  next();
};

module.exports = auth;
