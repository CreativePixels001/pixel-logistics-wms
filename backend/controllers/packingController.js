const PackingTask = require('../models/PackingTask');
const SalesOrder = require('../models/SalesOrder');
const PickingTask = require('../models/PickingTask');
const asyncHandler = require('express-async-handler');

// @desc    Get all packing tasks
// @route   GET /api/v1/wms/packing
// @access  Private
const getPackingTasks = asyncHandler(async (req, res) => {
  const {
    warehouse,
    status,
    priority,
    assignedTo,
    salesOrder,
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
  if (salesOrder) filter.salesOrder = salesOrder;
  
  if (overdue === 'true') {
    filter.scheduledEndDate = { $lt: new Date() };
    filter.status = { $nin: ['completed', 'cancelled'] };
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const tasks = await PackingTask.find(filter)
    .populate('warehouse', 'name code')
    .populate('salesOrder', 'orderNumber customer totalAmount status')
    .populate('assignedTo', 'name email')
    .populate('items.product', 'name sku')
    .populate('packages.items.product', 'name sku')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await PackingTask.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: tasks.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: tasks
  });
});

// @desc    Get single packing task
// @route   GET /api/v1/wms/packing/:id
// @access  Private
const getPackingTask = asyncHandler(async (req, res) => {
  const task = await PackingTask.findById(req.params.id)
    .populate('warehouse', 'name code address city state country')
    .populate({
      path: 'salesOrder',
      populate: {
        path: 'customer',
        select: 'name email phone'
      }
    })
    .populate('pickingTask', 'taskNumber status')
    .populate('assignedTo', 'name email phone')
    .populate('items.product', 'name sku description category')
    .populate('items.verifiedBy', 'name')
    .populate('packages.items.product', 'name sku')
    .populate('packages.sealedBy', 'name')
    .populate('createdBy', 'name')
    .populate('completedBy', 'name')
    .populate('history.performedBy', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Create new packing task
// @route   POST /api/v1/wms/packing
// @access  Private (Admin, Manager)
const createPackingTask = asyncHandler(async (req, res) => {
  const {
    salesOrderId,
    pickingTaskId,
    warehouseId,
    priority,
    priorityScore,
    packingInstructions,
    specialInstructions
  } = req.body;

  // Validate sales order exists
  const salesOrder = await SalesOrder.findById(salesOrderId).populate('items.product');
  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  // Build items array from sales order
  const packingItems = salesOrder.items.map(item => ({
    product: item.product._id,
    productName: item.product.name,
    productSKU: item.product.sku,
    quantityToPack: item.quantity,
    quantityPacked: 0,
    batchNumber: item.batchNumber,
    lotNumber: item.lotNumber,
    serialNumbers: item.serialNumbers || [],
    expiryDate: item.expiryDate,
    status: 'pending'
  }));

  // Create packing task
  const packingTask = await PackingTask.create({
    warehouse: warehouseId || salesOrder.warehouse,
    salesOrder: salesOrderId,
    pickingTask: pickingTaskId,
    items: packingItems,
    priority: priority || 'normal',
    priorityScore: priorityScore || 5,
    packingInstructions,
    specialInstructions,
    status: 'pending',
    createdBy: req.user ? req.user.id : null
  });

  // Update sales order status
  salesOrder.status = 'packing';
  await salesOrder.save();

  const populatedTask = await PackingTask.findById(packingTask._id)
    .populate('warehouse', 'name code')
    .populate('salesOrder', 'orderNumber customer')
    .populate('items.product', 'name sku');

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Update packing task
// @route   PUT /api/v1/wms/packing/:id
// @access  Private (Admin, Manager)
const updatePackingTask = asyncHandler(async (req, res) => {
  let task = await PackingTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  // Don't allow updates if completed or cancelled
  if (task.status === 'completed' || task.status === 'cancelled') {
    res.status(400);
    throw new Error(`Cannot update ${task.status} packing task`);
  }

  // Add updatedBy
  req.body.updatedBy = req.user ? req.user.id : null;

  task = await PackingTask.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('warehouse salesOrder assignedTo items.product');

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Assign packer to task
// @route   PUT /api/v1/wms/packing/:id/assign
// @access  Private (Admin, Manager)
const assignPacker = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const task = await PackingTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  await task.assignPacker(userId);

  const populatedTask = await PackingTask.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('warehouse', 'name code')
    .populate('salesOrder', 'orderNumber');

  res.status(200).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Start packing task
// @route   PUT /api/v1/wms/packing/:id/start
// @access  Private
const startPacking = asyncHandler(async (req, res) => {
  const task = await PackingTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  if (task.status !== 'assigned' && task.status !== 'pending') {
    res.status(400);
    throw new Error('Task must be in pending or assigned status to start');
  }

  const userId = req.user ? req.user.id : null;
  await task.startPacking(userId);

  const populatedTask = await PackingTask.findById(task._id)
    .populate('warehouse', 'name')
    .populate('items.product', 'name sku')
    .populate('packages.items.product', 'name sku');

  res.status(200).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Pack items and create packages
// @route   PUT /api/v1/wms/packing/:id/pack
// @access  Private
const packItems = asyncHandler(async (req, res) => {
  const { items, packages } = req.body;

  const task = await PackingTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  // Update items with packed quantities
  if (items && items.length > 0) {
    items.forEach(updateItem => {
      const taskItem = task.items.id(updateItem.itemId);
      if (taskItem) {
        if (updateItem.quantityPacked !== undefined) {
          taskItem.quantityPacked = updateItem.quantityPacked;
        }
        if (updateItem.status) {
          taskItem.status = updateItem.status;
        }
        if (updateItem.verified !== undefined) {
          taskItem.verified = updateItem.verified;
          if (updateItem.verified) {
            taskItem.verifiedAt = new Date();
            taskItem.verifiedBy = req.user ? req.user.id : null;
          }
        }
        if (updateItem.scanned !== undefined) {
          taskItem.scanned = updateItem.scanned;
          if (updateItem.scanned) {
            taskItem.scannedAt = new Date();
          }
        }
        if (updateItem.packagedIn) {
          taskItem.packagedIn = updateItem.packagedIn;
        }
        if (updateItem.notes) {
          taskItem.notes = updateItem.notes;
        }
      }
    });
  }

  // Add or update packages
  if (packages && packages.length > 0) {
    packages.forEach(pkg => {
      if (pkg._id) {
        // Update existing package
        const existingPkg = task.packages.id(pkg._id);
        if (existingPkg) {
          Object.assign(existingPkg, pkg);
        }
      } else {
        // Add new package
        task.packages.push(pkg);
      }
    });
  }

  // Update task status
  if (task.status === 'pending' || task.status === 'assigned') {
    task.status = 'packing';
  }

  // Add history entry
  task.history.push({
    action: 'Items Packed',
    status: task.status,
    performedBy: req.user ? req.user.id : null,
    timestamp: new Date(),
    notes: `Packed items into ${packages ? packages.length : 0} package(s)`
  });

  await task.save();

  const populatedTask = await PackingTask.findById(task._id)
    .populate('warehouse', 'name')
    .populate('items.product', 'name sku')
    .populate('packages.items.product', 'name sku');

  res.status(200).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Complete packing task
// @route   PUT /api/v1/wms/packing/:id/complete
// @access  Private
const completePacking = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const task = await PackingTask.findById(req.params.id)
    .populate('salesOrder');

  if (!task) {
    res.status(404);
    throw new Error('Packing task not found');
  }

  const userId = req.user ? req.user.id : null;
  await task.completePacking(userId, notes);

  // Update sales order status to 'packed'
  if (task.salesOrder) {
    task.salesOrder.status = 'packed';
    task.salesOrder.packedDate = new Date();
    await task.salesOrder.save();
  }

  const populatedTask = await PackingTask.findById(task._id)
    .populate('warehouse', 'name')
    .populate('salesOrder', 'orderNumber status')
    .populate('completedBy', 'name email');

  res.status(200).json({
    success: true,
    data: populatedTask
  });
});

// @desc    Get packing tasks by sales order
// @route   GET /api/v1/wms/packing/order/:orderId
// @access  Private
const getPackingTasksByOrder = asyncHandler(async (req, res) => {
  const tasks = await PackingTask.find({
    salesOrder: req.params.orderId,
    isActive: true
  })
    .populate('warehouse', 'name code')
    .populate('assignedTo', 'name email')
    .populate('items.product', 'name sku')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc    Get packing metrics
// @route   GET /api/v1/wms/packing/metrics
// @access  Private
const getPackingMetrics = asyncHandler(async (req, res) => {
  const { warehouse, startDate, endDate } = req.query;

  if (!warehouse) {
    res.status(400);
    throw new Error('Warehouse is required');
  }

  // Default to last 30 days if no date range provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const metrics = await PackingTask.getPackingMetrics(warehouse, start, end);

  res.status(200).json({
    success: true,
    data: metrics[0] || {
      totalTasks: 0,
      totalItems: 0,
      totalPackages: 0,
      avgPackingRate: 0,
      avgAccuracy: 0,
      avgDuration: 0,
      totalExceptions: 0
    }
  });
});

module.exports = {
  getPackingTasks,
  getPackingTask,
  createPackingTask,
  updatePackingTask,
  assignPacker,
  startPacking,
  packItems,
  completePacking,
  getPackingTasksByOrder,
  getPackingMetrics
};
