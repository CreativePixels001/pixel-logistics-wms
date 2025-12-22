/**
 * Driver Mobile API Routes
 * REST endpoints for driver mobile application
 */

const express = require('express');
const router = express.Router();
const mobileDriverController = require('../../controllers/mobile.driver.controller');
const { uploadSingle } = require('../../middleware/upload.middleware');
const { authenticateDriver } = require('../../middleware/auth.middleware');

/**
 * @route   POST /api/v1/mobile/driver/login
 * @desc    Driver login
 * @access  Public
 */
router.post('/login', mobileDriverController.driverLogin);

// All routes below require authentication
router.use(authenticateDriver);

/**
 * @route   GET /api/v1/mobile/driver/profile
 * @desc    Get driver profile
 * @access  Private (Driver)
 */
router.get('/profile', mobileDriverController.getProfile);

/**
 * @route   POST /api/v1/mobile/driver/location
 * @desc    Update driver location
 * @access  Private (Driver)
 */
router.post('/location', mobileDriverController.updateLocation);

/**
 * @route   GET /api/v1/mobile/driver/assignment
 * @desc    Get active assignment
 * @access  Private (Driver)
 */
router.get('/assignment', mobileDriverController.getActiveAssignment);

/**
 * @route   POST /api/v1/mobile/driver/assignment/status
 * @desc    Update assignment status
 * @access  Private (Driver)
 */
router.post('/assignment/status', mobileDriverController.updateAssignmentStatus);

/**
 * @route   POST /api/v1/mobile/driver/pod
 * @desc    Upload proof of delivery
 * @access  Private (Driver)
 */
router.post('/pod', uploadSingle, mobileDriverController.uploadPOD);

/**
 * @route   GET /api/v1/mobile/driver/history
 * @desc    Get delivery history
 * @access  Private (Driver)
 */
router.get('/history', mobileDriverController.getDeliveryHistory);

/**
 * @route   POST /api/v1/mobile/driver/availability
 * @desc    Update availability status
 * @access  Private (Driver)
 */
router.post('/availability', mobileDriverController.updateAvailability);

/**
 * @route   GET /api/v1/mobile/driver/documents
 * @desc    Get driver documents
 * @access  Private (Driver)
 */
router.get('/documents', mobileDriverController.getDocuments);

/**
 * @route   POST /api/v1/mobile/driver/device-token
 * @desc    Register device token for push notifications
 * @access  Private (Driver)
 */
router.post('/device-token', mobileDriverController.registerDeviceToken);

module.exports = router;
