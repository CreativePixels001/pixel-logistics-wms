const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  submitForApproval,
  approvePurchaseOrder,
  getPurchaseOrdersBySupplier,
  getPendingPurchaseOrders,
  getOverduePurchaseOrders
} = require('../controllers/purchaseOrderController');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Filter routes (must be before /:id routes)
router.get('/pending', getPendingPurchaseOrders);
router.get('/overdue', getOverduePurchaseOrders);
router.get('/supplier/:supplierId', getPurchaseOrdersBySupplier);

// Approval routes
router.put('/:id/submit', authorize('admin', 'manager'), submitForApproval);
router.put('/:id/approve', authorize('admin'), approvePurchaseOrder);

// CRUD routes
router.route('/')
  .get(getPurchaseOrders)
  .post(authorize('admin', 'manager'), createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrder)
  .put(authorize('admin', 'manager'), updatePurchaseOrder)
  .delete(authorize('admin'), deletePurchaseOrder);

module.exports = router;
