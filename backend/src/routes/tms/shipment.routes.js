const express = require('express');
const router = express.Router();
const shipmentController = require('../../controllers/tms/shipment.controller');
const { protect } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/tms/shipments
 * @desc    Create a new shipment
 * @access  Private
 */
router.post('/', shipmentController.createShipment);

/**
 * @route   GET /api/tms/shipments
 * @desc    Get all shipments with filters
 * @access  Private
 * @query   status, carrier, priority, startDate, endDate, search, page, limit, sortBy, sortOrder
 */
router.get('/', shipmentController.getShipments);

/**
 * @route   GET /api/tms/shipments/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', shipmentController.getDashboardStats);

/**
 * @route   GET /api/tms/shipments/:id
 * @desc    Get single shipment by ID
 * @access  Private
 */
router.get('/:id', shipmentController.getShipmentById);

/**
 * @route   PATCH /api/tms/shipments/:id
 * @desc    Update shipment
 * @access  Private
 */
router.patch('/:id', shipmentController.updateShipment);

/**
 * @route   DELETE /api/tms/shipments/:id
 * @desc    Delete shipment (soft delete)
 * @access  Private
 */
router.delete('/:id', shipmentController.deleteShipment);

/**
 * @route   POST /api/tms/shipments/:id/tracking
 * @desc    Add tracking event to shipment
 * @access  Private
 */
router.post('/:id/tracking', shipmentController.addTrackingEvent);

/**
 * @route   PATCH /api/tms/shipments/:id/progress
 * @desc    Update shipment progress
 * @access  Private
 */
router.patch('/:id/progress', shipmentController.updateProgress);

module.exports = router;
