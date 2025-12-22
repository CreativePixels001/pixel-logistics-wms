/**
 * Inventory Routes
 * Routes for inventory management
 */

const express = require('express');
const { body, param } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private
 */
router.get('/stats', inventoryController.getInventoryStats);

/**
 * @route   GET /api/v1/inventory/reports/low-stock
 * @desc    Get low stock items
 * @access  Private
 */
router.get('/reports/low-stock', inventoryController.getLowStockItems);

/**
 * @route   GET /api/v1/inventory/reports/expired
 * @desc    Get expired items
 * @access  Private
 */
router.get('/reports/expired', inventoryController.getExpiredItems);

/**
 * @route   GET /api/v1/inventory
 * @desc    Get all inventory items
 * @access  Private
 */
router.get('/', inventoryController.getAllInventory);

/**
 * @route   GET /api/v1/inventory/:id
 * @desc    Get single inventory item
 * @access  Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid inventory ID'),
    validate
  ],
  inventoryController.getInventoryById
);

/**
 * @route   POST /api/v1/inventory
 * @desc    Create new inventory item
 * @access  Private (Admin, Manager)
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('itemCode')
      .trim()
      .notEmpty().withMessage('Item code is required')
      .isLength({ min: 3, max: 50 }).withMessage('Item code must be between 3-50 characters'),
    body('itemName')
      .trim()
      .notEmpty().withMessage('Item name is required')
      .isLength({ min: 2, max: 200 }).withMessage('Item name must be between 2-200 characters'),
    body('category')
      .trim()
      .notEmpty().withMessage('Category is required'),
    body('uom')
      .trim()
      .notEmpty().withMessage('Unit of measure is required'),
    body('quantity')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('reorderLevel')
      .optional()
      .isInt({ min: 0 }).withMessage('Reorder level must be a positive number'),
    body('unitPrice')
      .optional()
      .isDecimal().withMessage('Unit price must be a decimal number'),
    validate
  ],
  inventoryController.createInventory
);

/**
 * @route   PUT /api/v1/inventory/:id
 * @desc    Update inventory item
 * @access  Private (Admin, Manager)
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    param('id').isUUID().withMessage('Invalid inventory ID'),
    validate
  ],
  inventoryController.updateInventory
);

/**
 * @route   POST /api/v1/inventory/:id/adjust
 * @desc    Adjust inventory quantity
 * @access  Private (Admin, Manager, Supervisor)
 */
router.post(
  '/:id/adjust',
  authorize('admin', 'manager', 'supervisor'),
  [
    param('id').isUUID().withMessage('Invalid inventory ID'),
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('reason')
      .trim()
      .notEmpty().withMessage('Reason is required'),
    validate
  ],
  inventoryController.adjustQuantity
);

/**
 * @route   DELETE /api/v1/inventory/:id
 * @desc    Delete inventory item
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Invalid inventory ID'),
    validate
  ],
  inventoryController.deleteInventory
);

module.exports = router;
