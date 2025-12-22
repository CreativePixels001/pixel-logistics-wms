/**
 * Integration Routes
 * WMS-TMS Integration endpoints
 */

const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integration.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/v1/integration/create-shipment
 * @desc    Create TMS shipment from WMS order
 * @access  Private
 */
router.post('/create-shipment', optionalAuth, integrationController.createShipmentFromWMS);

/**
 * @route   GET /api/v1/integration/shipment-status/:wmsOrderId
 * @desc    Get shipment status for WMS order
 * @access  Public
 */
router.get('/shipment-status/:wmsOrderId', integrationController.getShipmentStatus);

/**
 * @route   POST /api/v1/integration/update-wms
 * @desc    Update WMS about shipment status changes
 * @access  Private
 */
router.post('/update-wms', optionalAuth, integrationController.updateWMSStatus);

/**
 * @route   GET /api/v1/integration/dashboard
 * @desc    Get unified dashboard data (WMS + TMS)
 * @access  Public
 */
router.get('/dashboard', integrationController.getUnifiedDashboard);

/**
 * @route   POST /api/v1/integration/bulk-create-shipments
 * @desc    Bulk create shipments from WMS orders
 * @access  Private
 */
router.post('/bulk-create-shipments', optionalAuth, integrationController.bulkCreateShipments);

module.exports = router;
