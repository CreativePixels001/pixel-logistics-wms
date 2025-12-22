const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  cancelSalesOrder,
  confirmSalesOrder,
  allocateStock,
  createPickingTask,
  createPackingTask,
  shipSalesOrder,
  deliverSalesOrder,
  getSalesOrdersByCustomer,
  getPendingSalesOrders,
  getOverdueSalesOrders,
  processReturn
} = require('../controllers/salesOrderController');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Filter routes (must be before /:id routes)
router.get('/pending', getPendingSalesOrders);
router.get('/overdue', getOverdueSalesOrders);
router.get('/customer/:customerId', getSalesOrdersByCustomer);

// Fulfillment workflow routes
router.put('/:id/confirm', authorize('admin', 'manager'), confirmSalesOrder);
router.put('/:id/allocate', authorize('admin', 'manager'), allocateStock);
router.put('/:id/pick', authorize('admin', 'manager'), createPickingTask);
router.put('/:id/pack', authorize('admin', 'manager'), createPackingTask);
router.put('/:id/ship', authorize('admin', 'manager'), shipSalesOrder);
router.put('/:id/deliver', authorize('admin', 'manager'), deliverSalesOrder);

// Return handling
router.post('/:id/return', authorize('admin', 'manager'), processReturn);

// CRUD routes
router.route('/')
  .get(getSalesOrders)
  .post(authorize('admin', 'manager'), createSalesOrder);

router.route('/:id')
  .get(getSalesOrder)
  .put(authorize('admin', 'manager'), updateSalesOrder)
  .delete(authorize('admin', 'manager'), cancelSalesOrder);

module.exports = router;
