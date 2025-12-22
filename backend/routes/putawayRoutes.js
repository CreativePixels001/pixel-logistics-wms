const express = require('express');
const {
  getPutawayTasks,
  getPutawayTask,
  createPutawayTask,
  updatePutawayTask,
  completePutaway,
  getPutawayMetrics
} = require('../controllers/putawayController');

const router = express.Router();

// Import auth middleware (mock for now, replace with real auth later)
const protect = (req, res, next) => {
  req.user = { id: '507f1f77bcf86cd799439011', role: 'admin' };
  next();
};
const authorize = (...roles) => (req, res, next) => next();

// Special routes (must come before :id routes)
router.get('/metrics', protect, getPutawayMetrics);

// Main CRUD routes
router.route('/')
  .get(protect, getPutawayTasks)
  .post(protect, authorize('admin', 'manager'), createPutawayTask);

router.route('/:id')
  .get(protect, getPutawayTask)
  .put(protect, authorize('admin', 'manager'), updatePutawayTask);

// Workflow routes
router.put('/:id/complete', protect, completePutaway);

module.exports = router;
