/**
 * Request Validation Middleware
 * Validates request data using express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }

  next();
};

module.exports = { validate };
