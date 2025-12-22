const express = require('express');
const router = express.Router();
const complianceController = require('../../controllers/tms/compliance.controller');
const { protect } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

/**
 * @route   GET /api/tms/compliance/stats/overview
 * @desc    Get compliance statistics
 * @access  Protected
 */
router.get('/stats/overview', complianceController.getComplianceStats);

/**
 * @route   GET /api/tms/compliance/critical
 * @desc    Get critical violations
 * @access  Protected
 */
router.get('/critical', complianceController.getCriticalViolations);

/**
 * @route   GET /api/tms/compliance/score/:entityType/:entityId
 * @desc    Get compliance score for entity (vehicle/driver)
 * @access  Protected
 */
router.get('/score/:entityType/:entityId', complianceController.getComplianceScore);

/**
 * @route   GET /api/tms/compliance/vehicle/:vehicleId
 * @desc    Get violations by vehicle
 * @access  Protected
 */
router.get('/vehicle/:vehicleId', complianceController.getViolationsByVehicle);

/**
 * @route   GET /api/tms/compliance/driver/:driverId
 * @desc    Get violations by driver
 * @access  Protected
 */
router.get('/driver/:driverId', complianceController.getViolationsByDriver);

/**
 * @route   GET /api/tms/compliance
 * @desc    Get all compliance records
 * @access  Protected
 */
router.get('/', complianceController.getComplianceRecords);

/**
 * @route   POST /api/tms/compliance
 * @desc    Create new compliance record
 * @access  Protected
 */
router.post('/', complianceController.createComplianceRecord);

/**
 * @route   GET /api/tms/compliance/:id
 * @desc    Get compliance record by ID
 * @access  Protected
 */
router.get('/:id', complianceController.getComplianceById);

/**
 * @route   PUT /api/tms/compliance/:id
 * @desc    Update compliance record
 * @access  Protected
 */
router.put('/:id', complianceController.updateComplianceRecord);

/**
 * @route   DELETE /api/tms/compliance/:id
 * @desc    Delete compliance record
 * @access  Protected
 */
router.delete('/:id', complianceController.deleteComplianceRecord);

/**
 * @route   POST /api/tms/compliance/:id/resolve
 * @desc    Resolve violation
 * @access  Protected
 */
router.post('/:id/resolve', complianceController.resolveViolation);

/**
 * @route   POST /api/tms/compliance/:id/corrective-action
 * @desc    Add corrective action
 * @access  Protected
 */
router.post('/:id/corrective-action', complianceController.addCorrectiveAction);

module.exports = router;
