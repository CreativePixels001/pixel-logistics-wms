const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  getInventoryByProduct,
  getInventoryByWarehouse,
  getInventoryByLocation,
  adjustStock,
  transferStock,
  reserveStock,
  allocateStock,
  releaseStock,
  cycleCount,
  getLowStock,
  getExpiring,
  getAgingReport,
  getValuation,
  addSerialNumbers,
  updateSerialNumber,
  getStockSummary,
  bulkImport
} = require('../controllers/inventoryController');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Alert routes
router.get('/alerts/low-stock', getLowStock);
router.get('/alerts/expiring', getExpiring);

// Report routes
router.get('/reports/aging', getAgingReport);
router.get('/reports/valuation', getValuation);
router.get('/summary', getStockSummary);

// Stock operations (Manager/Admin only)
router.post('/adjust', authorize('admin', 'manager'), adjustStock);
router.post('/transfer', authorize('admin', 'manager'), transferStock);
router.post('/reserve', reserveStock);
router.post('/allocate', allocateStock);
router.post('/release', releaseStock);
router.post('/cycle-count', authorize('admin', 'manager'), cycleCount);

// Bulk operations
router.post('/bulk-import', authorize('admin', 'manager'), bulkImport);

// Serial number management
router.post('/:id/serial-numbers', authorize('admin', 'manager'), addSerialNumbers);
router.put('/:id/serial-numbers/:serialNumber', authorize('admin', 'manager'), updateSerialNumber);

// Filter routes
router.get('/product/:productId', getInventoryByProduct);
router.get('/warehouse/:warehouseId', getInventoryByWarehouse);
router.get('/location/:location', getInventoryByLocation);

// CRUD routes
router.get('/', getInventory);
router.get('/:id', getInventoryItem);

module.exports = router;
