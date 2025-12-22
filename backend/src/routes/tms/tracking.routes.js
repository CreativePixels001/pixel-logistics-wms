/**
 * Tracking Routes
 * Real-time shipment tracking endpoints
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../../controllers/tracking.controller');

/**
 * @route   GET /api/v1/tms/tracking/:shipmentId
 * @desc    Get shipment tracking details
 * @access  Public
 */
router.get('/:shipmentId', trackingController.getTrackingDetails);

/**
 * @route   POST /api/v1/tms/tracking/:shipmentId/location
 * @desc    Update shipment location
 * @access  Private (Driver/System)
 */
router.post('/:shipmentId/location', trackingController.updateLocation);

/**
 * @route   GET /api/v1/tms/tracking/:shipmentId/history
 * @desc    Get location history
 * @access  Private
 */
router.get('/:shipmentId/history', trackingController.getLocationHistory);

/**
 * @route   POST /api/v1/tms/tracking/:shipmentId/simulate
 * @desc    Simulate live tracking (demo/testing)
 * @access  Private
 */
router.post('/:shipmentId/simulate', trackingController.simulateTracking);

module.exports = router;
