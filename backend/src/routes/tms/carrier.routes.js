const express = require('express');
const router = express.Router();
const carrierController = require('../../controllers/tms/carrier.controller');
const { protect } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/tms/carriers
 * @desc    Create a new carrier
 * @access  Private
 */
router.post('/', carrierController.createCarrier);

/**
 * @route   GET /api/tms/carriers
 * @desc    Get all carriers with filters
 * @access  Private
 * @query   status, serviceType, region, isPreferred, search, page, limit, sortBy, sortOrder
 */
router.get('/', carrierController.getCarriers);

/**
 * @route   GET /api/tms/carriers/top
 * @desc    Get top carriers ranked by performance
 * @access  Private
 * @query   limit
 */
router.get('/top', carrierController.getTopCarriers);

/**
 * @route   GET /api/tms/carriers/service-type
 * @desc    Get carriers by service type
 * @access  Private
 * @query   serviceType, region
 */
router.get('/service-type', carrierController.getCarriersByServiceType);

/**
 * @route   GET /api/tms/carriers/:id
 * @desc    Get single carrier by ID
 * @access  Private
 */
router.get('/:id', carrierController.getCarrierById);

/**
 * @route   PATCH /api/tms/carriers/:id
 * @desc    Update carrier
 * @access  Private
 */
router.patch('/:id', carrierController.updateCarrier);

/**
 * @route   DELETE /api/tms/carriers/:id
 * @desc    Delete carrier
 * @access  Private
 */
router.delete('/:id', carrierController.deleteCarrier);

/**
 * @route   POST /api/tms/carriers/:id/rating
 * @desc    Add rating to carrier
 * @access  Private
 */
router.post('/:id/rating', carrierController.addRating);

/**
 * @route   POST /api/tms/carriers/:id/performance
 * @desc    Update carrier performance
 * @access  Private
 */
router.post('/:id/performance', carrierController.updatePerformance);

module.exports = router;
