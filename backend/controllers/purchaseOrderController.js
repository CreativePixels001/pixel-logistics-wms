const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const asyncHandler = require('express-async-handler');

// @desc    Get all purchase orders
// @route   GET /api/v1/wms/purchase-orders
// @access  Private
exports.getPurchaseOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by supplier
  if (req.query.supplier) {
    query.supplier = req.query.supplier;
  }

  // Filter by warehouse
  if (req.query.warehouse) {
    query.warehouse = req.query.warehouse;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query['dates.orderDate'] = {};
    if (req.query.startDate) {
      query['dates.orderDate'].$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query['dates.orderDate'].$lte = new Date(req.query.endDate);
    }
  }

  const purchaseOrders = await PurchaseOrder.find(query)
    .populate('supplier', 'name code contact')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name email')
    .populate('approval.approvedBy', 'name email')
    .sort({ 'dates.orderDate': -1 })
    .skip(skip)
    .limit(limit);

  const total = await PurchaseOrder.countDocuments(query);

  res.status(200).json({
    success: true,
    count: purchaseOrders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: purchaseOrders
  });
});

// @desc    Get single purchase order
// @route   GET /api/v1/wms/purchase-orders/:id
// @access  Private
exports.getPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id)
    .populate('supplier')
    .populate('warehouse')
    .populate('items.product')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approval.approvedBy', 'name email')
    .populate('approval.rejectedBy', 'name email');

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Purchase order not found');
  }

  res.status(200).json({
    success: true,
    data: purchaseOrder
  });
});

// @desc    Create purchase order
// @route   POST /api/v1/wms/purchase-orders
// @access  Private (Admin, Manager)
exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier, warehouse, items, dates, paymentTerms, notes, status } = req.body;

  // Validate supplier
  const supplierExists = await Supplier.findById(supplier);
  if (!supplierExists) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  // Set default payment terms from supplier if not provided
  const poPaymentTerms = paymentTerms || {
    creditDays: supplierExists.paymentTerms.creditDays,
    paymentMode: supplierExists.paymentTerms.paymentMode,
    advancePercentage: supplierExists.paymentTerms.advancePercentage
  };

  const purchaseOrder = await PurchaseOrder.create({
    supplier,
    warehouse,
    items,
    dates,
    paymentTerms: poPaymentTerms,
    notes,
    status: status || 'draft',
    createdBy: req.user._id
  });

  // Update supplier performance
  supplierExists.performance.totalOrders += 1;
  await supplierExists.save();

  const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
    .populate('supplier', 'name code')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku');

  res.status(201).json({
    success: true,
    message: 'Purchase order created successfully',
    data: populatedPO
  });
});

// @desc    Update purchase order
// @route   PUT /api/v1/wms/purchase-orders/:id
// @access  Private (Admin, Manager)
exports.updatePurchaseOrder = asyncHandler(async (req, res) => {
  let purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Purchase order not found');
  }

  // Check if PO can be updated
  if (['received', 'cancelled', 'closed'].includes(purchaseOrder.status)) {
    res.status(400);
    throw new Error(`Cannot update ${purchaseOrder.status} purchase order`);
  }

  const { items, dates, paymentTerms, notes, pricing } = req.body;

  if (items) purchaseOrder.items = items;
  if (dates) purchaseOrder.dates = { ...purchaseOrder.dates, ...dates };
  if (paymentTerms) purchaseOrder.paymentTerms = { ...purchaseOrder.paymentTerms, ...paymentTerms };
  if (notes) purchaseOrder.notes = notes;
  if (pricing) purchaseOrder.pricing = { ...purchaseOrder.pricing, ...pricing };

  purchaseOrder.updatedBy = req.user._id;

  await purchaseOrder.save();

  const populatedPO = await PurchaseOrder.findById(purchaseOrder._id)
    .populate('supplier', 'name code')
    .populate('warehouse', 'name code')
    .populate('items.product', 'name sku');

  res.status(200).json({
    success: true,
    message: 'Purchase order updated successfully',
    data: populatedPO
  });
});

// @desc    Delete/Cancel purchase order
// @route   DELETE /api/v1/wms/purchase-orders/:id
// @access  Private (Admin)
exports.deletePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Purchase order not found');
  }

  // Check if PO can be cancelled
  if (['received', 'closed'].includes(purchaseOrder.status)) {
    res.status(400);
    throw new Error(`Cannot cancel ${purchaseOrder.status} purchase order`);
  }

  purchaseOrder.status = 'cancelled';
  purchaseOrder.dates.cancelDate = new Date();
  purchaseOrder.updatedBy = req.user._id;

  await purchaseOrder.save();

  res.status(200).json({
    success: true,
    message: 'Purchase order cancelled successfully',
    data: purchaseOrder
  });
});

// @desc    Submit PO for approval
// @route   PUT /api/v1/wms/purchase-orders/:id/submit
// @access  Private (Admin, Manager)
exports.submitForApproval = asyncHandler(async (req, res) => {
  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Purchase order not found');
  }

  if (purchaseOrder.status !== 'draft') {
    res.status(400);
    throw new Error('Only draft purchase orders can be submitted for approval');
  }

  purchaseOrder.status = 'pending-approval';
  purchaseOrder.updatedBy = req.user._id;

  await purchaseOrder.save();

  res.status(200).json({
    success: true,
    message: 'Purchase order submitted for approval',
    data: purchaseOrder
  });
});

// @desc    Approve purchase order
// @route   PUT /api/v1/wms/purchase-orders/:id/approve
// @access  Private (Admin)
exports.approvePurchaseOrder = asyncHandler(async (req, res) => {
  const { approvalNotes } = req.body;

  const purchaseOrder = await PurchaseOrder.findById(req.params.id);

  if (!purchaseOrder) {
    res.status(404);
    throw new Error('Purchase order not found');
  }

  if (purchaseOrder.status !== 'pending-approval') {
    res.status(400);
    throw new Error('Only pending purchase orders can be approved');
  }

  purchaseOrder.status = 'approved';
  purchaseOrder.approval.approvedBy = req.user._id;
  purchaseOrder.approval.approvalDate = new Date();
  purchaseOrder.approval.approvalNotes = approvalNotes;
  purchaseOrder.dates.approvalDate = new Date();
  purchaseOrder.updatedBy = req.user._id;

  await purchaseOrder.save();

  res.status(200).json({
    success: true,
    message: 'Purchase order approved successfully',
    data: purchaseOrder
  });
});

// @desc    Get POs by supplier
// @route   GET /api/v1/wms/purchase-orders/supplier/:supplierId
// @access  Private
exports.getPurchaseOrdersBySupplier = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.getBySupplier(req.params.supplierId);

  res.status(200).json({
    success: true,
    count: purchaseOrders.length,
    data: purchaseOrders
  });
});

// @desc    Get pending purchase orders
// @route   GET /api/v1/wms/purchase-orders/pending
// @access  Private
exports.getPendingPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.getPending();

  res.status(200).json({
    success: true,
    count: purchaseOrders.length,
    data: purchaseOrders
  });
});

// @desc    Get overdue purchase orders
// @route   GET /api/v1/wms/purchase-orders/overdue
// @access  Private
exports.getOverduePurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.getOverdue();

  res.status(200).json({
    success: true,
    count: purchaseOrders.length,
    data: purchaseOrders
  });
});

module.exports = exports;
