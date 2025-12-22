const express = require('express');
const router = express.Router();
const {
  getGoodsReceipts,
  getGoodsReceipt,
  createGoodsReceipt,
  updateGoodsReceipt,
  inspectGoodsReceipt,
  acceptGoodsReceipt,
  completePutaway,
  getGoodsReceiptsByPO
} = require('../controllers/receivingController');

const { protect, authorize } = require('../middleware/auth');

// Get receipts by PO (specific route first)
router.get('/po/:poId', protect, getGoodsReceiptsByPO);

// Workflow routes
router.put('/:id/inspect', protect, authorize('admin', 'manager'), inspectGoodsReceipt);
router.put('/:id/accept', protect, authorize('admin', 'manager'), acceptGoodsReceipt);
router.put('/:id/putaway', protect, authorize('admin', 'manager'), completePutaway);

// CRUD routes
router.route('/')
  .get(protect, getGoodsReceipts)
  .post(protect, authorize('admin', 'manager'), createGoodsReceipt);

router.route('/:id')
  .get(protect, getGoodsReceipt)
  .put(protect, authorize('admin', 'manager'), updateGoodsReceipt);

module.exports = router;
