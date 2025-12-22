const PickingTask = require('../models/PickingTask');
const SalesOrder = require('../models/SalesOrder');
const Inventory = require('../models/Inventory');
const WarehouseLocation = require('../models/WarehouseLocation');

// @desc    Get all picking tasks
// @route   GET /api/v1/wms/picking
// @access  Private
exports.getPickingTasks = async (req, res) => {
  try {
    const {
      warehouse,
      status,
      pickingType,
      priority,
      assignedTo,
      salesOrder,
      waveId,
      batchId,
      overdue,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (warehouse) query.warehouse = warehouse;
    if (status) query.status = status;
    if (pickingType) query.pickingType = pickingType;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (salesOrder) query.salesOrders = salesOrder;
    if (waveId) query.waveId = waveId;
    if (batchId) query.batchId = batchId;

    // Filter by overdue
    if (overdue === 'true') {
      query.scheduledEndDate = { $lt: new Date() };
      query.status = { $nin: ['completed', 'cancelled'] };
    }

    // Date range filter
    if (startDate || endDate) {
      query.scheduledStartDate = {};
      if (startDate) query.scheduledStartDate.$gte = new Date(startDate);
      if (endDate) query.scheduledStartDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const tasks = await PickingTask.find(query)
      .populate('warehouse', 'name code city')
      .populate('salesOrders', 'orderNumber customerName totalAmount')
      .populate('assignedTo', 'name email')
      .populate('items.product', 'name sku')
      .populate('items.pickFromLocation', 'locationCode fullLocation')
      .sort({ priorityScore: -1, scheduledStartDate: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PickingTask.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching picking tasks',
      error: error.message
    });
  }
};

// @desc    Get single picking task
// @route   GET /api/v1/wms/picking/:id
// @access  Private
exports.getPickingTask = async (req, res) => {
  try {
    const task = await PickingTask.findById(req.params.id)
      .populate('warehouse', 'name code address city state')
      .populate('salesOrders', 'orderNumber customerName shippingAddress totalAmount status')
      .populate('assignedTo', 'name email phone')
      .populate('items.product', 'name sku category brand weight dimensions')
      .populate('items.pickFromLocation', 'locationCode fullLocation zone aisle rack')
      .populate('items.substitutedWith', 'name sku')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('history.performedBy', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Picking task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching picking task',
      error: error.message
    });
  }
};

// @desc    Create picking task
// @route   POST /api/v1/wms/picking
// @access  Private (Admin/Manager)
exports.createPickingTask = async (req, res) => {
  try {
    const {
      salesOrderIds,
      warehouseId,
      pickingType,
      priority,
      strategy
    } = req.body;

    if (!salesOrderIds || salesOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one sales order is required'
      });
    }

    // Get sales orders
    const salesOrders = await SalesOrder.find({
      _id: { $in: salesOrderIds }
    }).populate('items.product');

    if (salesOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sales orders not found'
      });
    }

    // Build picking items
    const pickingItems = [];
    
    for (const order of salesOrders) {
      for (const item of order.items) {
        // Find inventory with available stock
        const inventory = await Inventory.findOne({
          product: item.product._id,
          warehouse: warehouseId || order.warehouse,
          availableQuantity: { $gte: item.quantity }
        }).populate('location');

        pickingItems.push({
          product: item.product._id,
          salesOrderId: order._id,
          quantityToPick: item.quantity - (item.pickedQuantity || 0),
          pickFromLocation: inventory ? inventory.location : null,
          pickFromLocationCode: inventory && inventory.location ? inventory.location.locationCode : null,
          batchNumber: inventory ? inventory.batchNumber : null,
          lotNumber: inventory ? inventory.lotNumber : null,
          expiryDate: inventory ? inventory.expiryDate : null,
          pickSequence: pickingItems.length + 1,
          status: 'pending'
        });
      }
    }

    // Create picking task
    const taskData = {
      ...req.body,
      salesOrders: salesOrderIds,
      warehouse: warehouseId || salesOrders[0].warehouse,
      items: pickingItems,
      pickingType: pickingType || 'single-order',
      priority: priority || 'normal',
      priorityScore: priority === 'urgent' ? 10 : priority === 'high' ? 7 : priority === 'low' ? 3 : 5,
      strategy: strategy || 'fifo',
      status: 'pending',
      createdBy: req.user ? req.user.id : null
    };

    const task = await PickingTask.create(taskData);

    const populatedTask = await PickingTask.findById(task._id)
      .populate('warehouse', 'name code')
      .populate('salesOrders', 'orderNumber customerName')
      .populate('items.product', 'name sku')
      .populate('items.pickFromLocation', 'locationCode fullLocation');

    // Update sales order status
    await SalesOrder.updateMany(
      { _id: { $in: salesOrderIds } },
      { status: 'picking' }
    );

    res.status(201).json({
      success: true,
      message: 'Picking task created successfully',
      data: populatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating picking task',
      error: error.message
    });
  }
};

// @desc    Update picking task
// @route   PUT /api/v1/wms/picking/:id
// @access  Private (Admin/Manager)
exports.updatePickingTask = async (req, res) => {
  try {
    let task = await PickingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Picking task not found'
      });
    }

    // Prevent updating if completed or cancelled
    if (task.status === 'completed' || task.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled picking task'
      });
    }

    // Add updater
    req.body.updatedBy = req.user ? req.user.id : null;

    task = await PickingTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('warehouse', 'name code')
     .populate('salesOrders', 'orderNumber customerName')
     .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Picking task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating picking task',
      error: error.message
    });
  }
};

// @desc    Assign picker to task
// @route   PUT /api/v1/wms/picking/:id/assign
// @access  Private (Admin/Manager)
exports.assignPicker = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const task = await PickingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Picking task not found'
      });
    }

    await task.assignPicker(userId);

    const updatedTask = await PickingTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('warehouse', 'name code')
      .populate('salesOrders', 'orderNumber');

    res.status(200).json({
      success: true,
      message: 'Picker assigned successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error assigning picker',
      error: error.message
    });
  }
};

// @desc    Start picking
// @route   PUT /api/v1/wms/picking/:id/start
// @access  Private
exports.startPicking = async (req, res) => {
  try {
    const task = await PickingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Picking task not found'
      });
    }

    if (task.status !== 'assigned' && task.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Task must be assigned or pending to start'
      });
    }

    await task.startPicking(req.user ? req.user.id : task.assignedTo);

    const updatedTask = await PickingTask.findById(task._id)
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku')
      .populate('items.pickFromLocation', 'locationCode fullLocation');

    res.status(200).json({
      success: true,
      message: 'Picking started successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error starting picking',
      error: error.message
    });
  }
};

// @desc    Complete picking
// @route   PUT /api/v1/wms/picking/:id/complete
// @access  Private
exports.completePicking = async (req, res) => {
  try {
    const { items, notes } = req.body;

    const task = await PickingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Picking task not found'
      });
    }

    // Update picked quantities
    if (items && items.length > 0) {
      items.forEach(pickedItem => {
        const taskItem = task.items.id(pickedItem.itemId);
        if (taskItem) {
          taskItem.quantityPicked = pickedItem.quantityPicked || 0;
          taskItem.quantityShort = taskItem.quantityToPick - taskItem.quantityPicked;
          taskItem.status = taskItem.quantityPicked >= taskItem.quantityToPick ? 'picked' : 'short';
          taskItem.pickedAt = new Date();
          taskItem.verified = pickedItem.verified || false;
          taskItem.scanned = pickedItem.scanned || false;
          taskItem.notes = pickedItem.notes;
        }
      });
    }

    await task.completePicking(req.user ? req.user.id : task.assignedTo, notes);

    // Update inventory - reduce available quantity
    for (const item of task.items) {
      if (item.quantityPicked > 0 && item.pickFromLocation) {
        const inventory = await Inventory.findOne({
          product: item.product,
          warehouse: task.warehouse,
          location: item.pickFromLocation
        });

        if (inventory) {
          inventory.availableQuantity -= item.quantityPicked;
          inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - item.quantityPicked);
          
          // Add movement record
          inventory.movements.push({
            type: 'out',
            quantity: item.quantityPicked,
            fromLocation: item.pickFromLocation,
            date: new Date(),
            reference: `Picked for ${task.taskNumber}`,
            performedBy: req.user ? req.user.id : null
          });

          await inventory.save();
        }

        // Update location utilization
        const location = await WarehouseLocation.findById(item.pickFromLocation);
        if (location) {
          await location.releaseSpace(item.quantityPicked, 0, 0, 0);
        }
      }
    }

    // Update sales order status
    await SalesOrder.updateMany(
      { _id: { $in: task.salesOrders } },
      { status: 'picked', pickedDate: new Date() }
    );

    const updatedTask = await PickingTask.findById(task._id)
      .populate('warehouse', 'name code')
      .populate('salesOrders', 'orderNumber status')
      .populate('items.product', 'name sku')
      .populate('completedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Picking completed successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error completing picking',
      error: error.message
    });
  }
};

// @desc    Create batch picking task
// @route   POST /api/v1/wms/picking/batch
// @access  Private (Admin/Manager)
exports.createBatchPicking = async (req, res) => {
  try {
    const {
      salesOrderIds,
      warehouseId,
      batchName,
      priority
    } = req.body;

    if (!salesOrderIds || salesOrderIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 sales orders are required for batch picking'
      });
    }

    // Generate batch ID
    const batchId = `BATCH-${Date.now()}`;

    // Get all sales orders
    const salesOrders = await SalesOrder.find({
      _id: { $in: salesOrderIds }
    }).populate('items.product');

    // Group items by product
    const productMap = new Map();
    
    for (const order of salesOrders) {
      for (const item of order.items) {
        const productId = item.product._id.toString();
        
        if (productMap.has(productId)) {
          const existing = productMap.get(productId);
          existing.totalQuantity += item.quantity;
          existing.orders.push({
            orderId: order._id,
            quantity: item.quantity
          });
        } else {
          productMap.set(productId, {
            product: item.product._id,
            totalQuantity: item.quantity,
            orders: [{
              orderId: order._id,
              quantity: item.quantity
            }]
          });
        }
      }
    }

    // Build picking items
    const pickingItems = [];
    let sequence = 1;

    for (const [productId, data] of productMap) {
      // Find inventory
      const inventory = await Inventory.findOne({
        product: productId,
        warehouse: warehouseId || salesOrders[0].warehouse,
        availableQuantity: { $gte: data.totalQuantity }
      }).populate('location');

      pickingItems.push({
        product: productId,
        quantityToPick: data.totalQuantity,
        pickFromLocation: inventory ? inventory.location : null,
        pickFromLocationCode: inventory && inventory.location ? inventory.location.locationCode : null,
        batchNumber: inventory ? inventory.batchNumber : null,
        pickSequence: sequence++,
        status: 'pending'
      });
    }

    // Create picking task
    const task = await PickingTask.create({
      salesOrders: salesOrderIds,
      warehouse: warehouseId || salesOrders[0].warehouse,
      pickingType: 'batch',
      batchId,
      batchName: batchName || `Batch ${new Date().toISOString().split('T')[0]}`,
      items: pickingItems,
      priority: priority || 'normal',
      priorityScore: priority === 'urgent' ? 10 : priority === 'high' ? 7 : 5,
      status: 'pending',
      createdBy: req.user ? req.user.id : null
    });

    const populatedTask = await PickingTask.findById(task._id)
      .populate('warehouse', 'name code')
      .populate('salesOrders', 'orderNumber customerName')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Batch picking task created successfully',
      data: populatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating batch picking task',
      error: error.message
    });
  }
};

// @desc    Get picking tasks by sales order
// @route   GET /api/v1/wms/picking/order/:orderId
// @access  Private
exports.getPickingTasksByOrder = async (req, res) => {
  try {
    const tasks = await PickingTask.find({
      salesOrders: req.params.orderId,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching picking tasks',
      error: error.message
    });
  }
};

// @desc    Get picking metrics
// @route   GET /api/v1/wms/picking/metrics
// @access  Private
exports.getPickingMetrics = async (req, res) => {
  try {
    const { warehouse, startDate, endDate } = req.query;

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const metrics = await PickingTask.getPickingMetrics(warehouse, start, end);

    res.status(200).json({
      success: true,
      data: metrics[0] || {
        totalTasks: 0,
        totalItems: 0,
        avgPickRate: 0,
        avgAccuracy: 0,
        avgDuration: 0,
        totalExceptions: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching picking metrics',
      error: error.message
    });
  }
};
