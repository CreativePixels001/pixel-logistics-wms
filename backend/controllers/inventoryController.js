const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all inventory
// @route   GET /api/v1/wms/inventory
// @access  Private
exports.getInventory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by warehouse
  if (req.query.warehouse) {
    query.warehouse = req.query.warehouse;
  }

  // Filter by product
  if (req.query.product) {
    query.product = req.query.product;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by location
  if (req.query.location) {
    query['location.fullLocation'] = new RegExp(req.query.location, 'i');
  }

  // Filter by lot number
  if (req.query.lotNumber) {
    query['lotInfo.lotNumber'] = req.query.lotNumber;
  }

  // Filter low stock
  if (req.query.lowStock === 'true') {
    query.status = 'low-stock';
  }

  const inventory = await Inventory.find(query)
    .populate('product', 'name sku category brand')
    .populate('warehouse', 'name code')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Inventory.countDocuments(query);

  res.status(200).json({
    success: true,
    count: inventory.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: inventory
  });
});

// @desc    Get single inventory item
// @route   GET /api/v1/wms/inventory/:id
// @access  Private
exports.getInventoryItem = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)
    .populate('product')
    .populate('warehouse')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  res.status(200).json({
    success: true,
    data: inventory
  });
});

// @desc    Get inventory by product
// @route   GET /api/v1/wms/inventory/product/:productId
// @access  Private
exports.getInventoryByProduct = asyncHandler(async (req, res) => {
  const inventory = await Inventory.getByProduct(req.params.productId);

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory
  });
});

// @desc    Get inventory by warehouse
// @route   GET /api/v1/wms/inventory/warehouse/:warehouseId
// @access  Private
exports.getInventoryByWarehouse = asyncHandler(async (req, res) => {
  const inventory = await Inventory.getByWarehouse(req.params.warehouseId);

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory
  });
});

// @desc    Get inventory by location
// @route   GET /api/v1/wms/inventory/location/:location
// @access  Private
exports.getInventoryByLocation = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({
    'location.fullLocation': new RegExp(req.params.location, 'i')
  })
    .populate('product', 'name sku')
    .populate('warehouse', 'name code')
    .sort({ 'location.fullLocation': 1 });

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory
  });
});

// @desc    Adjust inventory stock
// @route   POST /api/v1/wms/inventory/adjust
// @access  Private (Admin, Manager)
exports.adjustStock = asyncHandler(async (req, res) => {
  const { inventoryId, adjustmentType, quantity, reason, notes } = req.body;

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const adjustmentQty = parseInt(quantity);

  // Handle different adjustment types
  switch (adjustmentType) {
    case 'add':
      inventory.quantity.available += adjustmentQty;
      break;
    case 'remove':
      inventory.quantity.available -= adjustmentQty;
      break;
    case 'damage':
      inventory.quantity.available -= adjustmentQty;
      inventory.quantity.damaged += adjustmentQty;
      break;
    case 'repair':
      inventory.quantity.damaged -= adjustmentQty;
      inventory.quantity.available += adjustmentQty;
      break;
    default:
      res.status(400);
      throw new Error('Invalid adjustment type');
  }

  // Update last movement
  inventory.lastMovement = {
    type: 'adjustment',
    date: new Date(),
    quantity: adjustmentQty,
    reference: reason,
    user: req.user._id
  };

  inventory.notes = notes;
  inventory.updatedBy = req.user._id;

  await inventory.save();

  res.status(200).json({
    success: true,
    message: `Stock ${adjustmentType} successful`,
    data: inventory
  });
});

// @desc    Transfer inventory between locations
// @route   POST /api/v1/wms/inventory/transfer
// @access  Private (Admin, Manager)
exports.transferStock = asyncHandler(async (req, res) => {
  const { fromInventoryId, toLocation, quantity, warehouseId } = req.body;

  const fromInventory = await Inventory.findById(fromInventoryId);
  if (!fromInventory) {
    res.status(404);
    throw new Error('Source inventory not found');
  }

  if (fromInventory.quantity.available < quantity) {
    res.status(400);
    throw new Error('Insufficient stock for transfer');
  }

  // Reduce from source
  fromInventory.quantity.available -= quantity;
  fromInventory.quantity.inTransit += quantity;
  fromInventory.lastMovement = {
    type: 'transfer',
    date: new Date(),
    quantity: -quantity,
    reference: `Transfer to ${toLocation.fullLocation}`,
    user: req.user._id
  };
  fromInventory.updatedBy = req.user._id;
  await fromInventory.save();

  // Find or create destination inventory
  let toInventory = await Inventory.findOne({
    product: fromInventory.product,
    warehouse: warehouseId,
    'location.fullLocation': toLocation.fullLocation
  });

  if (!toInventory) {
    toInventory = await Inventory.create({
      product: fromInventory.product,
      warehouse: warehouseId,
      location: toLocation,
      quantity: {
        available: quantity,
        inTransit: 0
      },
      valuation: fromInventory.valuation,
      lotInfo: fromInventory.lotInfo,
      aging: {
        receivedDate: new Date()
      },
      createdBy: req.user._id
    });
  } else {
    toInventory.quantity.available += quantity;
    toInventory.lastMovement = {
      type: 'transfer',
      date: new Date(),
      quantity: quantity,
      reference: `Transfer from ${fromInventory.location.fullLocation}`,
      user: req.user._id
    };
    toInventory.updatedBy = req.user._id;
    await toInventory.save();
  }

  // Clear in-transit
  fromInventory.quantity.inTransit -= quantity;
  await fromInventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock transferred successfully',
    data: {
      from: fromInventory,
      to: toInventory
    }
  });
});

// @desc    Reserve inventory stock
// @route   POST /api/v1/wms/inventory/reserve
// @access  Private
exports.reserveStock = asyncHandler(async (req, res) => {
  const { inventoryId, quantity, reference } = req.body;

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const freeStock = inventory.quantity.available - inventory.quantity.reserved - inventory.quantity.allocated;
  if (freeStock < quantity) {
    res.status(400);
    throw new Error(`Insufficient free stock. Available: ${freeStock}`);
  }

  inventory.quantity.reserved += quantity;
  inventory.lastMovement = {
    type: 'sale',
    date: new Date(),
    quantity: -quantity,
    reference: reference || 'Stock reservation',
    user: req.user._id
  };
  inventory.updatedBy = req.user._id;

  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock reserved successfully',
    data: inventory
  });
});

// @desc    Allocate inventory stock
// @route   POST /api/v1/wms/inventory/allocate
// @access  Private
exports.allocateStock = asyncHandler(async (req, res) => {
  const { inventoryId, quantity, reference } = req.body;

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  if (inventory.quantity.reserved < quantity) {
    res.status(400);
    throw new Error('Insufficient reserved stock');
  }

  inventory.quantity.reserved -= quantity;
  inventory.quantity.allocated += quantity;
  inventory.lastMovement = {
    type: 'sale',
    date: new Date(),
    quantity: quantity,
    reference: reference || 'Stock allocation',
    user: req.user._id
  };
  inventory.updatedBy = req.user._id;

  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock allocated successfully',
    data: inventory
  });
});

// @desc    Release reserved stock
// @route   POST /api/v1/wms/inventory/release
// @access  Private
exports.releaseStock = asyncHandler(async (req, res) => {
  const { inventoryId, quantity, type } = req.body;

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  if (type === 'reserved') {
    if (inventory.quantity.reserved < quantity) {
      res.status(400);
      throw new Error('Insufficient reserved stock');
    }
    inventory.quantity.reserved -= quantity;
  } else if (type === 'allocated') {
    if (inventory.quantity.allocated < quantity) {
      res.status(400);
      throw new Error('Insufficient allocated stock');
    }
    inventory.quantity.allocated -= quantity;
  }

  inventory.updatedBy = req.user._id;
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Stock released successfully',
    data: inventory
  });
});

// @desc    Perform cycle count
// @route   POST /api/v1/wms/inventory/cycle-count
// @access  Private (Admin, Manager)
exports.cycleCount = asyncHandler(async (req, res) => {
  const { inventoryId, countedQuantity, notes } = req.body;

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const variance = countedQuantity - inventory.quantity.available;

  inventory.cycleCount = {
    lastCountDate: new Date(),
    lastCountedBy: req.user._id,
    countedQuantity,
    variance,
    nextCountDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };

  // If there's variance, add alert
  if (Math.abs(variance) > 0) {
    inventory.alerts.push({
      type: 'variance',
      message: `Cycle count variance: ${variance > 0 ? '+' : ''}${variance}`,
      createdAt: new Date()
    });

    // Adjust stock to match count
    inventory.quantity.available = countedQuantity;
  }

  inventory.notes = notes;
  inventory.updatedBy = req.user._id;
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Cycle count completed',
    data: inventory
  });
});

// @desc    Get low stock items
// @route   GET /api/v1/wms/inventory/alerts/low-stock
// @access  Private
exports.getLowStock = asyncHandler(async (req, res) => {
  const inventory = await Inventory.getLowStock();

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory
  });
});

// @desc    Get expiring items
// @route   GET /api/v1/wms/inventory/alerts/expiring
// @access  Private
exports.getExpiring = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const inventory = await Inventory.getExpiring(days);

  res.status(200).json({
    success: true,
    count: inventory.length,
    days,
    data: inventory
  });
});

// @desc    Get inventory aging report
// @route   GET /api/v1/wms/inventory/reports/aging
// @access  Private
exports.getAgingReport = asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouse || null;
  const report = await Inventory.getAgingReport(warehouseId);

  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Get inventory valuation
// @route   GET /api/v1/wms/inventory/reports/valuation
// @access  Private
exports.getValuation = asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouse || null;
  const valuation = await Inventory.getValuation(warehouseId);

  res.status(200).json({
    success: true,
    data: valuation
  });
});

// @desc    Add serial numbers to inventory
// @route   POST /api/v1/wms/inventory/:id/serial-numbers
// @access  Private (Admin, Manager)
exports.addSerialNumbers = asyncHandler(async (req, res) => {
  const { serialNumbers } = req.body;

  const inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  serialNumbers.forEach(sn => {
    inventory.serialNumbers.push({
      serialNumber: sn,
      status: 'available'
    });
  });

  inventory.updatedBy = req.user._id;
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Serial numbers added',
    data: inventory
  });
});

// @desc    Update serial number status
// @route   PUT /api/v1/wms/inventory/:id/serial-numbers/:serialNumber
// @access  Private (Admin, Manager)
exports.updateSerialNumber = asyncHandler(async (req, res) => {
  const { status, assignedTo } = req.body;

  const inventory = await Inventory.findById(req.params.id);
  if (!inventory) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const serial = inventory.serialNumbers.find(
    sn => sn.serialNumber === req.params.serialNumber
  );

  if (!serial) {
    res.status(404);
    throw new Error('Serial number not found');
  }

  serial.status = status;
  if (assignedTo) {
    serial.assignedTo = assignedTo;
    serial.assignedDate = new Date();
  }

  inventory.updatedBy = req.user._id;
  await inventory.save();

  res.status(200).json({
    success: true,
    message: 'Serial number updated',
    data: inventory
  });
});

// @desc    Get stock summary
// @route   GET /api/v1/wms/inventory/summary
// @access  Private
exports.getStockSummary = asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouse;

  const match = warehouseId ? { warehouse: warehouseId } : {};

  const summary = await Inventory.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity.total' },
        availableQuantity: { $sum: '$quantity.available' },
        reservedQuantity: { $sum: '$quantity.reserved' },
        allocatedQuantity: { $sum: '$quantity.allocated' },
        damagedQuantity: { $sum: '$quantity.damaged' },
        totalValue: { $sum: '$valuation.totalValue' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: summary[0] || {
      totalItems: 0,
      totalQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      allocatedQuantity: 0,
      damagedQuantity: 0,
      totalValue: 0
    }
  });
});

// @desc    Bulk import inventory
// @route   POST /api/v1/wms/inventory/bulk-import
// @access  Private (Admin, Manager)
exports.bulkImport = asyncHandler(async (req, res) => {
  const { inventoryItems } = req.body;

  if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of inventory items');
  }

  // Add created by to each item
  const items = inventoryItems.map(item => ({
    ...item,
    createdBy: req.user._id
  }));

  const result = await Inventory.insertMany(items, { ordered: false });

  res.status(201).json({
    success: true,
    message: `${result.length} inventory items imported`,
    data: result
  });
});

module.exports = exports;
