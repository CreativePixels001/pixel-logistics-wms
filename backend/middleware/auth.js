const asyncHandler = require('express-async-handler');

// Simple protect middleware for testing
exports.protect = asyncHandler(async (req, res, next) => {
  // For testing purposes, create a mock user
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@dlt.com',
    role: 'admin'
  };
  
  next();
});

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
