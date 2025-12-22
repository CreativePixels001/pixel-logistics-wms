const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const asyncHandler = require('express-async-handler');

// @desc    Get all sales orders
// @route   GET /api/v1/wms/sales-orders
// @access  Private
exports.getSalesOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.customer) query.customer = req.query.customer;
  if (req.query.warehouse) query.warehouse = req.query.warehouse;
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;

  if (req.query.startDate || req.query.endDate) {
    query['dates.orderDate'] = {};
    if (req.query.startDate) query['dates.orderDate'].$gte = new Date(req.query.startDate);
    if (req.query.endDate) query['dates.orderDate'].$lte = new Date(req.query.endDate);
  }

  const salesOrders = await SalesOrder.find(query)
    .populate('customer', 'name code contact')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name email')
    .sort({ 'dates.orderDate': -1 })
    .skip(skip)
    .limit(limit);

  const total = await SalesOrder.countDocuments(query);

  res.status(200).json({
    success: true,
    count: salesOrders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: salesOrders
  });
});

// @desc    Get single sales order
// @route   GET /api/v1/wms/sales-orders/:id
// @access  Private
exports.getSalesOrder = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id)
    .populate('customer')
    .populate('warehouse')
    .populate('items.product')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  res.status(200).json({
    success: true,
    data: salesOrder
  });
});

// @desc    Create sales order
// @route   POST /api/v1/wms/sales-orders
// @access  Private (Admin, Manager)
exports.createSalesOrder = asyncHandler(async (req, res) => {
  const { customer, warehouse, items, dates, shippingAddress, paymentInfo, notes, priority } = req.body;

  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const salesOrder = await SalesOrder.create({
    customer,
    warehouse,
    items,
    dates,
    shippingAddress,
    paymentInfo,
    notes,
    priority: priority || 'normal',
    status: 'draft',
    createdBy: req.user._id
  });

  customerExists.performance.totalOrders += 1;
  if (!customerExists.performance.firstOrderDate) {
    customerExists.performance.firstOrderDate = new Date();
  }
  customerExists.performance.lastOrderDate = new Date();
  await customerExists.save();

  const populatedSO = await SalesOrder.findById(salesOrder._id)
    .populate('customer', 'name code')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku');

  res.status(201).json({
    success: true,
    message: 'Sales order created successfully',
    data: populatedSO
  });
});

// @desc    Update sales order
// @route   PUT /api/v1/wms/sales-orders/:id
// @access  Private (Admin, Manager)
exports.updateSalesOrder = asyncHandler(async (req, res) => {
  let salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (['delivered', 'cancelled', 'closed'].includes(salesOrder.status)) {
    res.status(400);
    throw new Error(`Cannot update ${salesOrder.status} sales order`);
  }

  const { items, dates, shippingAddress, paymentInfo, notes, pricing, priority } = req.body;

  if (items) salesOrder.items = items;
  if (dates) salesOrder.dates = { ...salesOrder.dates, ...dates };
  if (shippingAddress) salesOrder.shippingAddress = shippingAddress;
  if (paymentInfo) salesOrder.paymentInfo = { ...salesOrder.paymentInfo, ...paymentInfo };
  if (notes) salesOrder.notes = notes;
  if (pricing) salesOrder.pricing = { ...salesOrder.pricing, ...pricing };
  if (priority) salesOrder.priority = priority;

  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  const populatedSO = await SalesOrder.findById(salesOrder._id)
    .populate('customer', 'name code')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku');

  res.status(200).json({
    success: true,
    message: 'Sales order updated successfully',
    data: populatedSO
  });
});

// @desc    Cancel sales order
// @route   DELETE /api/v1/wms/sales-orders/:id
// @access  Private (Admin, Manager)
exports.cancelSalesOrder = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (['delivered', 'closed'].includes(salesOrder.status)) {
    res.status(400);
    throw new Error(`Cannot cancel ${salesOrder.status} sales order`);
  }

  // Release allocated inventory
  if (salesOrder.status === 'allocated') {
    for (const item of salesOrder.items) {
      if (item.allocatedQuantity > 0) {
        const inventory = await Inventory.findOne({
          product: item.product,
          warehouse: salesOrder.warehouse
        });
        if (inventory) {
          inventory.quantity.allocated -= item.allocatedQuantity;
          await inventory.save();
        }
      }
    }
  }

  salesOrder.status = 'cancelled';
  salesOrder.dates.cancelDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  // Update customer performance
  const customer = await Customer.findById(salesOrder.customer);
  if (customer) {
    customer.performance.cancelledOrders += 1;
    await customer.save();
  }

  res.status(200).json({
    success: true,
    message: 'Sales order cancelled successfully',
    data: salesOrder
  });
});

// @desc    Confirm sales order
// @route   PUT /api/v1/wms/sales-orders/:id/confirm
// @access  Private (Admin, Manager)
exports.confirmSalesOrder = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'draft') {
    res.status(400);
    throw new Error('Only draft sales orders can be confirmed');
  }

  salesOrder.status = 'confirmed';
  salesOrder.dates.confirmedDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  res.status(200).json({
    success: true,
    message: 'Sales order confirmed successfully',
    data: salesOrder
  });
});

// @desc    Allocate stock for sales order
// @route   PUT /api/v1/wms/sales-orders/:id/allocate
// @access  Private (Admin, Manager)
exports.allocateStock = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id).populate('items.product');

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'confirmed') {
    res.status(400);
    throw new Error('Only confirmed sales orders can be allocated');
  }

  // Check and allocate inventory
  for (const item of salesOrder.items) {
    const inventory = await Inventory.findOne({
      product: item.product._id,
      warehouse: salesOrder.warehouse
    });

    if (!inventory) {
      res.status(404);
      throw new Error(`Inventory not found for product: ${item.product.name}`);
    }

    const freeStock = inventory.quantity.available - inventory.quantity.reserved - inventory.quantity.allocated;
    if (freeStock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.product.name}. Available: ${freeStock}, Required: ${item.quantity}`);
    }

    // Allocate stock
    inventory.quantity.allocated += item.quantity;
    await inventory.save();

    item.allocatedQuantity = item.quantity;
  }

  salesOrder.status = 'allocated';
  salesOrder.dates.allocatedDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  res.status(200).json({
    success: true,
    message: 'Stock allocated successfully',
    data: salesOrder
  });
});

// @desc    Create picking task
// @route   PUT /api/v1/wms/sales-orders/:id/pick
// @access  Private (Admin, Manager)
exports.createPickingTask = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'allocated') {
    res.status(400);
    throw new Error('Only allocated sales orders can be picked');
  }

  // Mark items as picked
  salesOrder.items.forEach(item => {
    item.pickedQuantity = item.allocatedQuantity;
  });

  salesOrder.status = 'picked';
  salesOrder.dates.pickedDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  res.status(200).json({
    success: true,
    message: 'Picking completed successfully',
    data: salesOrder
  });
});

// @desc    Create packing task
// @route   PUT /api/v1/wms/sales-orders/:id/pack
// @access  Private (Admin, Manager)
exports.createPackingTask = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'picked') {
    res.status(400);
    throw new Error('Only picked sales orders can be packed');
  }

  salesOrder.items.forEach(item => {
    item.packedQuantity = item.pickedQuantity;
  });

  salesOrder.status = 'packed';
  salesOrder.dates.packedDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  res.status(200).json({
    success: true,
    message: 'Packing completed successfully',
    data: salesOrder
  });
});

// @desc    Ship sales order
// @route   PUT /api/v1/wms/sales-orders/:id/ship
// @access  Private (Admin, Manager)
exports.shipSalesOrder = asyncHandler(async (req, res) => {
  const { trackingNumber, carrierName, shippingMethod } = req.body;

  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'packed') {
    res.status(400);
    throw new Error('Only packed sales orders can be shipped');
  }

  // Update inventory - reduce allocated, increase shipped
  for (const item of salesOrder.items) {
    const inventory = await Inventory.findOne({
      product: item.product,
      warehouse: salesOrder.warehouse
    });

    if (inventory) {
      inventory.quantity.allocated -= item.packedQuantity;
      inventory.quantity.available -= item.packedQuantity;
      await inventory.save();
    }

    item.shippedQuantity = item.packedQuantity;
  }

  salesOrder.fulfillment.trackingNumber = trackingNumber;
  salesOrder.fulfillment.carrierName = carrierName;
  salesOrder.fulfillment.shippingMethod = shippingMethod;
  salesOrder.status = 'shipped';
  salesOrder.dates.shippedDate = new Date();
  salesOrder.updatedBy = req.user._id;

  await salesOrder.save();

  res.status(200).json({
    success: true,
    message: 'Sales order shipped successfully',
    data: salesOrder
  });
});

// @desc    Mark as delivered
// @route   PUT /api/v1/wms/sales-orders/:id/deliver
// @access  Private (Admin, Manager)
exports.deliverSalesOrder = asyncHandler(async (req, res) => {
  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (!['shipped', 'in-transit'].includes(salesOrder.status)) {
    res.status(400);
    throw new Error('Only shipped/in-transit sales orders can be delivered');
  }

  salesOrder.items.forEach(item => {
    item.deliveredQuantity = item.shippedQuantity;
  });

  salesOrder.status = 'delivered';
  salesOrder.dates.deliveredDate = new Date();
  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  // Update customer performance
  const customer = await Customer.findById(salesOrder.customer);
  if (customer) {
    customer.performance.completedOrders += 1;
    customer.performance.totalSpent += salesOrder.pricing.totalAmount;
    customer.performance.averageOrderValue = 
      customer.performance.totalSpent / customer.performance.completedOrders;
    await customer.save();
  }

  res.status(200).json({
    success: true,
    message: 'Sales order delivered successfully',
    data: salesOrder
  });
});

// @desc    Get sales orders by customer
// @route   GET /api/v1/wms/sales-orders/customer/:customerId
// @access  Private
exports.getSalesOrdersByCustomer = asyncHandler(async (req, res) => {
  const salesOrders = await SalesOrder.getByCustomer(req.params.customerId);

  res.status(200).json({
    success: true,
    count: salesOrders.length,
    data: salesOrders
  });
});

// @desc    Get pending sales orders
// @route   GET /api/v1/wms/sales-orders/pending
// @access  Private
exports.getPendingSalesOrders = asyncHandler(async (req, res) => {
  const salesOrders = await SalesOrder.getPending();

  res.status(200).json({
    success: true,
    count: salesOrders.length,
    data: salesOrders
  });
});

// @desc    Get overdue sales orders
// @route   GET /api/v1/wms/sales-orders/overdue
// @access  Private
exports.getOverdueSalesOrders = asyncHandler(async (req, res) => {
  const salesOrders = await SalesOrder.getOverdue();

  res.status(200).json({
    success: true,
    count: salesOrders.length,
    data: salesOrders
  });
});

// @desc    Process return
// @route   POST /api/v1/wms/sales-orders/:id/return
// @access  Private (Admin, Manager)
exports.processReturn = asyncHandler(async (req, res) => {
  const { items, notes } = req.body;

  const salesOrder = await SalesOrder.findById(req.params.id);

  if (!salesOrder) {
    res.status(404);
    throw new Error('Sales order not found');
  }

  if (salesOrder.status !== 'delivered') {
    res.status(400);
    throw new Error('Only delivered sales orders can be returned');
  }

  let totalRefund = 0;

  // Process return items
  for (const returnItem of items) {
    const orderItem = salesOrder.items.find(
      item => item.product.toString() === returnItem.product
    );

    if (orderItem) {
      orderItem.returnedQuantity = (orderItem.returnedQuantity || 0) + returnItem.quantity;
      totalRefund += returnItem.refundAmount || 0;

      // Add back to inventory
      const inventory = await Inventory.findOne({
        product: returnItem.product,
        warehouse: salesOrder.warehouse
      });

      if (inventory) {
        if (returnItem.condition === 'damaged' || returnItem.condition === 'defective') {
          inventory.quantity.damaged += returnItem.quantity;
        } else {
          inventory.quantity.available += returnItem.quantity;
        }
        await inventory.save();
      }
    }
  }

  salesOrder.returns.push({
    returnDate: new Date(),
    items,
    totalRefund,
    processedBy: req.user._id,
    status: 'completed'
  });

  // Update status
  const totalReturned = salesOrder.items.reduce((sum, item) => sum + (item.returnedQuantity || 0), 0);
  const totalOrdered = salesOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalReturned === totalOrdered) {
    salesOrder.status = 'returned';
  } else if (totalReturned > 0) {
    salesOrder.status = 'partially-returned';
  }

  salesOrder.updatedBy = req.user._id;
  await salesOrder.save();

  // Update customer performance
  const customer = await Customer.findById(salesOrder.customer);
  if (customer) {
    customer.performance.returnedOrders += 1;
    await customer.save();
  }

  res.status(200).json({
    success: true,
    message: 'Return processed successfully',
    data: salesOrder
  });
});

module.exports = exports;
