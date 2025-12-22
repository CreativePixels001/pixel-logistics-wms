const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getABCAnalysis,
  getProductsByCategory,
  getProductByBarcode,
  getProductBySKU,
  addVariant,
  bulkImportProducts,
  getProductStock,
  updateClassification
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

// Public routes (if any)

// Protected routes
router.use(protect);

// Analytics & Reports
router.get('/alerts/low-stock', getLowStockProducts);
router.get('/analysis/abc', getABCAnalysis);

// Search routes
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/sku/:sku', getProductBySKU);
router.get('/category/:category', getProductsByCategory);

// Stock information
router.get('/:id/stock', getProductStock);

// Bulk operations
router.post('/bulk-import', authorize('admin', 'manager'), bulkImportProducts);

// Variants
router.post('/:id/variants', authorize('admin', 'manager'), addVariant);

// Classification
router.put('/:id/classification', authorize('admin', 'manager'), updateClassification);

// CRUD operations
router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

module.exports = router;
