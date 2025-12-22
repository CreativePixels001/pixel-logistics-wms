const express = require('express');
const {
  getPackingTasks,
  getPackingTask,
  createPackingTask,
  updatePackingTask,
  assignPacker,
  startPacking,
  packItems,
  completePacking,
  getPackingTasksByOrder,
  getPackingMetrics
} = require('../controllers/packingController');

const router = express.Router();

// Import auth middleware (mock for now, replace with real auth later)
const protect = (req, res, next) => {
  req.user = { id: '507f1f77bcf86cd799439011', role: 'admin' };
  next();
};
const authorize = (...roles) => (req, res, next) => next();

// Special routes (must come before :id routes)
router.get('/order/:orderId', protect, getPackingTasksByOrder);
router.get('/metrics', protect, getPackingMetrics);

// Main CRUD routes
router.route('/')
  .get(protect, getPackingTasks)
  .post(protect, authorize('admin', 'manager'), createPackingTask);

router.route('/:id')
  .get(protect, getPackingTask)
  .put(protect, authorize('admin', 'manager'), updatePackingTask);

// Workflow routes
router.put('/:id/assign', protect, authorize('admin', 'manager'), assignPacker);
router.put('/:id/start', protect, startPacking);
router.put('/:id/pack', protect, packItems);
router.put('/:id/complete', protect, completePacking);

module.exports = router;
