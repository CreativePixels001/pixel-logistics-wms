const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  dispatchShipment,
  markInTransit,
  deliverShipment,
  uploadPOD,
  getShipmentsBySO,
  createReturnShipment
} = require('../controllers/shippingController');

const { protect, authorize } = require('../middleware/auth');

// Get shipments by SO (specific route first)
router.get('/so/:soId', protect, getShipmentsBySO);

// Workflow routes
router.put('/:id/dispatch', protect, authorize('admin', 'manager'), dispatchShipment);
router.put('/:id/in-transit', protect, authorize('admin', 'manager'), markInTransit);
router.put('/:id/deliver', protect, authorize('admin', 'manager'), deliverShipment);
router.put('/:id/pod', protect, authorize('admin', 'manager'), uploadPOD);
router.post('/:id/return', protect, authorize('admin', 'manager'), createReturnShipment);

// CRUD routes
router.route('/')
  .get(protect, getShipments)
  .post(protect, authorize('admin', 'manager'), createShipment);

router.route('/:id')
  .get(protect, getShipment)
  .put(protect, authorize('admin', 'manager'), updateShipment);

module.exports = router;
