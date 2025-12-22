const PutawayTask = require('../models/PutawayTask');
const GoodsReceipt = require('../models/GoodsReceipt');
const Inventory = require('../models/Inventory');
const WarehouseLocation = require('../models/WarehouseLocation');
const asyncHandler = require('express-async-handler');

// @desc    Get all putaway tasks
// @route   GET /api/v1/wms/putaway
// @access  Private
const getPutawayTasks = asyncHandler(async (req, res) => {
  const {
    warehouse,
    status,
    priority,
    assignedTo,
    strategy,
    overdue,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = req.query;

  // Build filter
  const filter = { isActive: true };
  
  if (warehouse) filter.warehouse = warehouse;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (strategy) filter.strategy = strategy;
  
  if (overdue === 'true') {
    filter.scheduledEndDate = { $lt: new Date() };
    filter.status = { $nin: ['completed', 'cancelled'] };
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const tasks = await PutawayTask.find(filter)
    .populate('warehouse', 'name code')
    .populate('goodsReceipt', 'grnNumber status')
    .populate('assignedTo', 'name email')
    .populate('items.product', 'name sku')
    .populate('items.fromLocation', 'code zone aisle rack')
    .populate('items.toLocation', 'code zone aisle rack')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await PutawayTask.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: tasks
  });
});

// @desc    Get single putaway task
// @route   GET /api/v1/wms/putaway/:id
// @access  Private
const getPutawayTask = asyncHandler(async (req, res) => {
  const task = await PutawayTask.findById(req.params.id)
    .populate('warehouse', 'name code address city state country')
    .populate('goodsReceipt', 'grnNumber status receivedDate')
    .populate('purchaseOrder', 'poNumber status')
    .populate('assignedTo', 'name email phone')
    .populate('items.product', 'name sku description category')
    .populate('items.fromLocation', 'code zone aisle rack bin')
    .populate('items.toLocation', 'code zone aisle rack bin capacity utilization')
    .populate('items.verifiedBy', 'name')
    .populate('locationSuggestions.location', 'code zone aisle rack capacity utilization')
    .populate('createdBy', 'name')
    .populate('completedBy', 'name')
    .populate('history.performedBy', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Putaway task not found');
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Create new putaway task
// @route   POST /api/v1/wms/putaway
// @access  Private (Admin, Manager)
const createPutawayTask = asyncHandler(async (req, res) => {
  const {
    goodsReceiptId,
    warehouseId,
    priority,
    priorityScore,
    strategy,
    putawayInstructions,
    specialInstructions
  } = req.body;

  // Validate goods receipt exists
  const goodsReceipt = await GoodsReceipt.findById(goodsReceiptId).populate('items.product');
  if (!goodsReceipt) {
    res.status(404);
    throw new Error('Goods receipt not found');
  }

  // Build items array from goods receipt
  const putawayItems = [];
  
  for (const item of goodsReceipt.items) {
    if (item.quantityAccepted > 0) {
      // Find staging/receiving location (assuming zone 'RECEIVING')
      const fromLocation = await WarehouseLocation.findOne({
        warehouse: warehouseId || goodsReceipt.warehouse,
        zone: 'RECEIVING',
        isActive: true
      });

      // Find optimal storage location based on strategy
      let toLocation = null;
      const locationSuggestions = [];

      if (strategy === 'nearest' || !strategy) {
        // Find nearest available location with capacity
        toLocation = await WarehouseLocation.findOne({
          warehouse: warehouseId || goodsReceipt.warehouse,
          zone: { $ne: 'RECEIVING' },
          status: 'active',
          isActive: true
        }).sort({ zone: 1, aisle: 1, rack: 1 });
      } else if (strategy === 'abc-analysis') {
        // High-value items in easily accessible locations
        const productCategory = item.product.category;
        toLocation = await WarehouseLocation.findOne({
          warehouse: warehouseId || goodsReceipt.warehouse,
          zone: productCategory === 'high-value' ? 'ZONE-A' : 'ZONE-B',
          status: 'active',
          isActive: true
        });
      } else if (strategy === 'fefo') {
        // Items with expiry dates in FEFO locations
        toLocation = await WarehouseLocation.findOne({
          warehouse: warehouseId || goodsReceipt.warehouse,
          zone: 'ZONE-FEFO',
          status: 'active',
          isActive: true
        });
      }

      // Get location suggestions for worker
      const suggestions = await WarehouseLocation.find({
        warehouse: warehouseId || goodsReceipt.warehouse,
        zone: { $ne: 'RECEIVING' },
        status: 'active',
        isActive: true
      }).limit(5);

      suggestions.forEach((loc, index) => {
        locationSuggestions.push({
          location: loc._id,
          locationCode: loc.code,
          score: 100 - (index * 10),
          reason: index === 0 ? 'Optimal location based on strategy' : 'Alternative location',
          availableCapacity: loc.capacity - (loc.utilization || 0),
          utilizationPercentage: loc.utilization ? (loc.utilization / loc.capacity * 100) : 0
        });
      });

      putawayItems.push({
        product: item.product._id,
        productName: item.product.name,
        productSKU: item.product.sku,
        quantityToPutaway: item.quantityAccepted,
        quantityPutaway: 0,
        fromLocation: fromLocation ? fromLocation._id : null,
        fromLocationCode: fromLocation ? fromLocation.code : 'RECEIVING',
        toLocation: toLocation ? toLocation._id : null,
        toLocationCode: toLocation ? toLocation.code : null,
        batchNumber: item.batchNumber,
        lotNumber: item.lotNumber,
        serialNumbers: item.serialNumbers || [],
        expiryDate: item.expiryDate,
        manufacturingDate: item.manufacturingDate,
        status: 'pending',
        putawaySequence: putawayItems.length + 1
      });
    }
  }

  // Create putaway task
  const putawayTask = await PutawayTask.create({
    warehouse: warehouseId || goodsReceipt.warehouse,
    goodsReceipt: goodsReceiptId,
    purchaseOrder: goodsReceipt.purchaseOrder,
    items: putawayItems,
    priority: priority || 'normal',
    priorityScore: priorityScore || 5,
    strategy: strategy || 'nearest',
    putawayInstructions,
    specialInstructions,
    status: 'pending',
    createdBy: req.user ? req.user.id : null
  });

  const populatedTask = await PutawayTask.findById(putawayTask._id)
    .populate('warehouse', 'name code')
    .populate('goodsReceipt', 'grnNumber')
    .populate('items.product', 'name sku')
    .populate('items.fromLocation', 'code zone')
    .populate('items.toLocation', 'code zone');

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Update putaway task
// @route   PUT /api/v1/wms/putaway/:id
// @access  Private (Admin, Manager)
const updatePutawayTask = asyncHandler(async (req, res) => {
  let task = await PutawayTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Putaway task not found');
  }

  // Don't allow updates if completed or cancelled
  if (task.status === 'completed' || task.status === 'cancelled') {
    res.status(400);
    throw new Error(`Cannot update ${task.status} putaway task`);
  }

  // Add updatedBy
  req.body.updatedBy = req.user ? req.user.id : null;

  task = await PutawayTask.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('warehouse goodsReceipt assignedTo items.product items.fromLocation items.toLocation');

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Complete putaway task
// @route   PUT /api/v1/wms/putaway/:id/complete
// @access  Private
const completePutaway = asyncHandler(async (req, res) => {
  const { items, notes } = req.body;

  const task = await PutawayTask.findById(req.params.id)
    .populate('warehouse')
    .populate('items.product')
    .populate('items.toLocation');

  if (!task) {
    res.status(404);
    throw new Error('Putaway task not found');
  }

  const userId = req.user ? req.user.id : null;

  // Update items with putaway quantities and locations
  if (items && items.length > 0) {
    for (const updateItem of items) {
      const taskItem = task.items.id(updateItem.itemId);
      if (taskItem) {
        if (updateItem.quantityPutaway !== undefined) {
          taskItem.quantityPutaway = updateItem.quantityPutaway;
        }
        if (updateItem.toLocation) {
          taskItem.toLocation = updateItem.toLocation;
        }
        if (updateItem.toLocationCode) {
          taskItem.toLocationCode = updateItem.toLocationCode;
        }
        if (updateItem.status) {
          taskItem.status = updateItem.status;
        }
        if (updateItem.verified !== undefined) {
          taskItem.verified = updateItem.verified;
          if (updateItem.verified) {
            taskItem.verifiedAt = new Date();
            taskItem.verifiedBy = userId;
          }
        }
        if (updateItem.scanned !== undefined) {
          taskItem.scanned = updateItem.scanned;
          if (updateItem.scanned) {
            taskItem.scannedAt = new Date();
          }
        }

        // Update inventory and location
        if (taskItem.quantityPutaway > 0 && taskItem.toLocation) {
          // Find or create inventory record
          let inventory = await Inventory.findOne({
            product: taskItem.product._id,
            warehouse: task.warehouse._id,
            location: taskItem.toLocation
          });

          if (inventory) {
            // Update existing inventory
            inventory.availableQuantity += taskItem.quantityPutaway;
            inventory.totalQuantity += taskItem.quantityPutaway;
          } else {
            // Create new inventory record
            inventory = await Inventory.create({
              product: taskItem.product._id,
              warehouse: task.warehouse._id,
              location: taskItem.toLocation,
              availableQuantity: taskItem.quantityPutaway,
              totalQuantity: taskItem.quantityPutaway,
              batchNumber: taskItem.batchNumber,
              lotNumber: taskItem.lotNumber,
              serialNumbers: taskItem.serialNumbers,
              expiryDate: taskItem.expiryDate,
              manufacturingDate: taskItem.manufacturingDate
            });
          }

          // Add movement record
          inventory.movements.push({
            type: 'in',
            quantity: taskItem.quantityPutaway,
            toLocation: taskItem.toLocation,
            reference: task._id,
            referenceModel: 'PutawayTask',
            performedBy: userId,
            notes: `Putaway from task ${task.taskNumber}`
          });

          await inventory.save();

          // Update location utilization
          const location = await WarehouseLocation.findById(taskItem.toLocation);
          if (location) {
            await location.occupySpace(taskItem.quantityPutaway);
          }
        }
      }
    }
  }

  // Complete the task
  await task.completePutaway(userId, notes);

  const populatedTask = await PutawayTask.findById(task._id)
    .populate('warehouse', 'name')
    .populate('goodsReceipt', 'grnNumber status')
    .populate('completedBy', 'name email');

  res.status(200).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Get putaway metrics
// @route   GET /api/v1/wms/putaway/metrics
// @access  Private
const getPutawayMetrics = asyncHandler(async (req, res) => {
  const { warehouse, startDate, endDate } = req.query;

  if (!warehouse) {
    res.status(400);
    throw new Error('Warehouse is required');
  }

  // Default to last 30 days if no date range provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const metrics = await PutawayTask.getPutawayMetrics(warehouse, start, end);

  res.status(200).json({
    success: true,
    data: metrics[0] || {
      totalTasks: 0,
      totalItems: 0,
      avgPutawayRate: 0,
      avgAccuracy: 0,
      avgDuration: 0,
      totalExceptions: 0
    }
  });
});

module.exports = {
  getPutawayTasks,
  getPutawayTask,
  createPutawayTask,
  updatePutawayTask,
  completePutaway,
  getPutawayMetrics
};
