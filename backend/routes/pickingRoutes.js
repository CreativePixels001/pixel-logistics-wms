const express = require('express');
const router = express.Router();
const {
  getPickingTasks,
  getPickingTask,
  createPickingTask,
  updatePickingTask,
  assignPicker,
  startPicking,
  completePicking,
  createBatchPicking,
  getPickingTasksByOrder,
  getPickingMetrics
} = require('../controllers/pickingController');

// Protect all routes (assuming auth middleware exists)
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);

// Special routes (must come before :id routes)
router.post('/batch', createBatchPicking); // authorize('admin', 'manager')
router.get('/order/:orderId', getPickingTasksByOrder);
router.get('/metrics', getPickingMetrics);

// Task management routes
router.route('/')
  .get(getPickingTasks)
  .post(createPickingTask); // authorize('admin', 'manager')

router.route('/:id')
  .get(getPickingTask)
  .put(updatePickingTask); // authorize('admin', 'manager')

// Workflow routes
router.put('/:id/assign', assignPicker); // authorize('admin', 'manager')
router.put('/:id/start', startPicking);
router.put('/:id/complete', completePicking);

module.exports = router;
