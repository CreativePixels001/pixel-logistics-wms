import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator (can be enhanced with user ID)
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
});

// Stricter rate limit for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      statusCode: 429,
    },
  },
});

export default rateLimiter;
