/**
 * Inventory Controller
 * Handles inventory management operations
 */

const Inventory = require('../models/Inventory');
const logger = require('../config/logger');
const { AppError } = require('../middleware/error.middleware');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @desc    Get all inventory items with pagination and filters
 * @route   GET /api/v1/inventory
 * @access  Private
 */
exports.getAllInventory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      location,
      zone,
      lowStock,
      expired,
      sortBy = 'itemName',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { itemCode: { [Op.iLike]: `%${search}%` } },
        { itemName: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Location filter
    if (location) {
      where.location = location;
    }

    // Zone filter
    if (zone) {
      where.zone = zone;
    }

    // Low stock filter
    if (lowStock === 'true') {
      where[Op.and] = sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('reorderLevel')
      );
    }

    // Expired items filter
    if (expired === 'true') {
      where.expiryDate = {
        [Op.lt]: new Date()
      };
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.status(200).json({
      success: true,
      data: {
        items: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single inventory item
 * @route   GET /api/v1/inventory/:id
 * @access  Private
 */
exports.getInventoryById = async (req, res, next) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      throw new AppError('Inventory item not found', 404, 'ITEM_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new inventory item
 * @route   POST /api/v1/inventory
 * @access  Private (Admin, Manager)
 */
exports.createInventory = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);

    logger.info(`New inventory item created: ${item.itemCode} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update inventory item
 * @route   PUT /api/v1/inventory/:id
 * @access  Private (Admin, Manager)
 */
exports.updateInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      throw new AppError('Inventory item not found', 404, 'ITEM_NOT_FOUND');
    }

    await item.update(req.body);

    logger.info(`Inventory item updated: ${item.itemCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/v1/inventory/:id
 * @access  Private (Admin)
 */
exports.deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      throw new AppError('Inventory item not found', 404, 'ITEM_NOT_FOUND');
    }

    await item.destroy();

    logger.info(`Inventory item deleted: ${item.itemCode} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Adjust inventory quantity
 * @route   POST /api/v1/inventory/:id/adjust
 * @access  Private (Admin, Manager, Supervisor)
 */
exports.adjustQuantity = async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      throw new AppError('Inventory item not found', 404, 'ITEM_NOT_FOUND');
    }

    const adjustment = await item.adjustQuantity(quantity, reason);

    logger.info(`Inventory adjusted: ${item.itemCode} from ${adjustment.oldQuantity} to ${adjustment.newQuantity} by ${req.user.email}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      data: {
        item,
        adjustment
      },
      message: 'Inventory quantity adjusted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock items
 * @route   GET /api/v1/inventory/reports/low-stock
 * @access  Private
 */
exports.getLowStockItems = async (req, res, next) => {
  try {
    const items = await Inventory.findAll({
      where: sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('reorderLevel')
      ),
      order: [['quantity', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expired items
 * @route   GET /api/v1/inventory/reports/expired
 * @access  Private
 */
exports.getExpiredItems = async (req, res, next) => {
  try {
    const items = await Inventory.findAll({
      where: {
        expiryDate: {
          [Op.lt]: new Date()
        }
      },
      order: [['expiryDate', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory statistics
 * @route   GET /api/v1/inventory/stats
 * @access  Private
 */
exports.getInventoryStats = async (req, res, next) => {
  try {
    const totalItems = await Inventory.count();
    const totalValue = await Inventory.sum('totalValue');
    const totalQuantity = await Inventory.sum('quantity');
    
    const lowStockCount = await Inventory.count({
      where: sequelize.where(
        sequelize.col('quantity'),
        '<=',
        sequelize.col('reorderLevel')
      )
    });

    const expiredCount = await Inventory.count({
      where: {
        expiryDate: {
          [Op.lt]: new Date()
        }
      }
    });

    const statusBreakdown = await Inventory.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalValue: parseFloat(totalValue || 0).toFixed(2),
        totalQuantity: parseInt(totalQuantity || 0),
        lowStockCount,
        expiredCount,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};
