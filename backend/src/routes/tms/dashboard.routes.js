const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/tms/dashboard.controller');
const { protect } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/tms/dashboard/stats
 * @desc    Get comprehensive dashboard statistics
 * @access  Private
 */
router.get('/stats', dashboardController.getDashboardStats);

/**
 * @route   GET /api/tms/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 * @query   limit
 */
router.get('/activity', dashboardController.getRecentActivity);

/**
 * @route   GET /api/tms/dashboard/analytics
 * @desc    Get analytics data for charts
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;
