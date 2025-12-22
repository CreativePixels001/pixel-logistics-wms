const express = require('express');
const router = express.Router();
const fleetController = require('../../controllers/tms/fleet.controller');
const { protect } = require('../../middleware/auth');

// Protect all routes
router.use(protect);

/**
 * @route   GET /api/tms/fleet/stats/overview
 * @desc    Get fleet statistics
 * @access  Protected
 */
router.get('/stats/overview', fleetController.getFleetStats);

/**
 * @route   GET /api/tms/fleet/maintenance/due
 * @desc    Get vehicles needing maintenance
 * @access  Protected
 */
router.get('/maintenance/due', fleetController.getMaintenanceDue);

/**
 * @route   GET /api/tms/fleet
 * @desc    Get all vehicles
 * @access  Protected
 */
router.get('/', fleetController.getVehicles);

/**
 * @route   POST /api/tms/fleet
 * @desc    Create new vehicle
 * @access  Protected
 */
router.post('/', fleetController.createVehicle);

/**
 * @route   GET /api/tms/fleet/:id
 * @desc    Get vehicle by ID
 * @access  Protected
 */
router.get('/:id', fleetController.getVehicleById);

/**
 * @route   PUT /api/tms/fleet/:id
 * @desc    Update vehicle
 * @access  Protected
 */
router.put('/:id', fleetController.updateVehicle);

/**
 * @route   DELETE /api/tms/fleet/:id
 * @desc    Delete vehicle
 * @access  Protected
 */
router.delete('/:id', fleetController.deleteVehicle);

/**
 * @route   POST /api/tms/fleet/:id/maintenance
 * @desc    Add maintenance record
 * @access  Protected
 */
router.post('/:id/maintenance', fleetController.addMaintenanceRecord);

/**
 * @route   GET /api/tms/fleet/:id/maintenance
 * @desc    Get maintenance records
 * @access  Protected
 */
router.get('/:id/maintenance', fleetController.getMaintenanceRecords);

/**
 * @route   POST /api/tms/fleet/:id/utilization
 * @desc    Update vehicle utilization
 * @access  Protected
 */
router.post('/:id/utilization', fleetController.updateUtilization);

/**
 * @route   PUT /api/tms/fleet/:id/assign-driver
 * @desc    Assign driver to vehicle
 * @access  Protected
 */
router.put('/:id/assign-driver', fleetController.assignDriver);

/**
 * @route   PUT /api/tms/fleet/:id/location
 * @desc    Update vehicle location
 * @access  Protected
 */
router.put('/:id/location', fleetController.updateLocation);

module.exports = router;
