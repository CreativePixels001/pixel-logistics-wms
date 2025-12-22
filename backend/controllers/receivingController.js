const GoodsReceipt = require('../models/GoodsReceipt');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

// @desc    Get all goods receipts
// @route   GET /api/v1/wms/receiving
// @access  Private
exports.getGoodsReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by inspection status
    if (req.query.inspectionStatus) {
      query.overallInspectionStatus = req.query.inspectionStatus;
    }

    // Filter by warehouse
    if (req.query.warehouse) {
      query.warehouse = req.query.warehouse;
    }

    // Filter by supplier
    if (req.query.supplier) {
      query.supplier = req.query.supplier;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.receiptDate = {};
      if (req.query.startDate) {
        query.receiptDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.receiptDate.$lte = new Date(req.query.endDate);
      }
    }

    const total = await GoodsReceipt.countDocuments(query);
    const receipts = await GoodsReceipt.find(query)
      .populate('purchaseOrder', 'poNumber status')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('receivedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('items.product', 'name sku')
      .sort({ receiptDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: receipts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: receipts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goods receipts',
      error: error.message
    });
  }
};

// @desc    Get single goods receipt
// @route   GET /api/v1/wms/receiving/:id
// @access  Private
exports.getGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id)
      .populate('purchaseOrder')
      .populate('warehouse')
      .populate('supplier')
      .populate('receivedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('items.product')
      .populate('items.inspectedBy', 'name email')
      .populate('items.putawayBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goods receipt',
      error: error.message
    });
  }
};

// @desc    Create goods receipt
// @route   POST /api/v1/wms/receiving
// @access  Private (Admin, Manager)
exports.createGoodsReceipt = async (req, res) => {
  try {
    const { purchaseOrder: poId, warehouse, items, ...otherData } = req.body;

    // Verify Purchase Order exists
    const po = await PurchaseOrder.findById(poId).populate('supplier');
    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    // Create receipt with PO details
    const receiptData = {
      ...otherData,
      purchaseOrder: poId,
      warehouse,
      supplier: po.supplier._id,
      expectedDate: po.expectedDeliveryDate,
      receivedBy: req.user._id,
      createdBy: req.user._id,
      items: items.map(item => ({
        ...item,
        status: 'received'
      }))
    };

    const receipt = await GoodsReceipt.create(receiptData);

    // Update PO received quantities
    for (const item of items) {
      const poItem = po.items.find(pi => pi.product.toString() === item.product.toString());
      if (poItem) {
        poItem.receivedQuantity = (poItem.receivedQuantity || 0) + item.receivedQuantity;
      }
    }

    // Update PO status
    const totalOrdered = po.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = po.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
    
    if (totalReceived >= totalOrdered) {
      po.status = 'received';
    } else if (totalReceived > 0) {
      po.status = 'partial';
    }

    await po.save();

    const populatedReceipt = await GoodsReceipt.findById(receipt._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Goods receipt created successfully',
      data: populatedReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating goods receipt',
      error: error.message
    });
  }
};

// @desc    Update goods receipt
// @route   PUT /api/v1/wms/receiving/:id
// @access  Private (Admin, Manager)
exports.updateGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    // Cannot update if already closed
    if (receipt.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update closed goods receipt'
      });
    }

    // Update fields
    const allowedUpdates = ['remarks', 'internalNotes', 'documents', 'vehicleNumber', 'driverName', 'driverPhone', 'transporterName', 'lrNumber', 'freightCharges', 'invoiceNumber', 'invoiceDate', 'invoiceAmount'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        receipt[field] = req.body[field];
      }
    });

    receipt.updatedBy = req.user._id;
    await receipt.save();

    const updatedReceipt = await GoodsReceipt.findById(receipt._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Goods receipt updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating goods receipt',
      error: error.message
    });
  }
};

// @desc    Quality inspection of goods receipt
// @route   PUT /api/v1/wms/receiving/:id/inspect
// @access  Private (Admin, Manager)
exports.inspectGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    const { items: inspectionItems, qualityScore, qualityChecklistId } = req.body;

    // Update each item's inspection details
    inspectionItems.forEach(inspectionItem => {
      const item = receipt.items.id(inspectionItem.itemId);
      if (item) {
        item.inspectionStatus = inspectionItem.inspectionStatus;
        item.inspectionNotes = inspectionItem.inspectionNotes;
        item.inspectedBy = req.user._id;
        item.inspectionDate = new Date();
        
        // Update accepted/rejected quantities
        if (inspectionItem.acceptedQuantity !== undefined) {
          item.acceptedQuantity = inspectionItem.acceptedQuantity;
        }
        if (inspectionItem.rejectedQuantity !== undefined) {
          item.rejectedQuantity = inspectionItem.rejectedQuantity;
        }
        if (inspectionItem.damagedQuantity !== undefined) {
          item.damagedQuantity = inspectionItem.damagedQuantity;
        }
        if (inspectionItem.rejectionReason) {
          item.rejectionReason = inspectionItem.rejectionReason;
        }
        if (inspectionItem.damageReason) {
          item.damageReason = inspectionItem.damageReason;
        }
      }
    });

    if (qualityScore !== undefined) {
      receipt.qualityScore = qualityScore;
    }
    if (qualityChecklistId) {
      receipt.qualityChecklistId = qualityChecklistId;
    }

    receipt.updatedBy = req.user._id;
    await receipt.save();

    const updatedReceipt = await GoodsReceipt.findById(receipt._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Inspection completed successfully',
      data: updatedReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error inspecting goods receipt',
      error: error.message
    });
  }
};

// @desc    Accept items and update inventory
// @route   PUT /api/v1/wms/receiving/:id/accept
// @access  Private (Admin, Manager)
exports.acceptGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    // Update inventory for accepted items
    for (const item of receipt.items) {
      if (item.acceptedQuantity > 0 && item.inspectionStatus === 'passed') {
        // Find or create inventory record
        let inventory = await Inventory.findOne({
          product: item.product,
          warehouse: receipt.warehouse
        });

        if (inventory) {
          // Update existing inventory
          inventory.quantity.available += item.acceptedQuantity;
          inventory.quantity.total += item.acceptedQuantity;

          // Add movement record
          inventory.movements.push({
            type: 'in',
            quantity: item.acceptedQuantity,
            reference: 'goods-receipt',
            referenceId: receipt._id,
            notes: `GRN: ${receipt.grnNumber}`,
            performedBy: req.user._id
          });

          // Update batch info if provided
          if (item.batchNumber) {
            inventory.batchNumber = item.batchNumber;
          }
          if (item.expiryDate) {
            inventory.expiryDate = item.expiryDate;
          }

          await inventory.save();
        } else {
          // Create new inventory record
          inventory = await Inventory.create({
            product: item.product,
            warehouse: receipt.warehouse,
            quantity: {
              available: item.acceptedQuantity,
              total: item.acceptedQuantity,
              allocated: 0,
              reserved: 0,
              damaged: item.damagedQuantity || 0,
              onHold: 0,
              inTransit: 0
            },
            binLocation: item.binLocation,
            rackNumber: item.rackNumber,
            shelfNumber: item.shelfNumber,
            batchNumber: item.batchNumber,
            lotNumber: item.lotNumber,
            expiryDate: item.expiryDate,
            movements: [{
              type: 'in',
              quantity: item.acceptedQuantity,
              reference: 'goods-receipt',
              referenceId: receipt._id,
              notes: `Initial stock from GRN: ${receipt.grnNumber}`,
              performedBy: req.user._id
            }],
            createdBy: req.user._id
          });
        }

        // Update damaged inventory separately if any
        if (item.damagedQuantity > 0) {
          inventory.quantity.damaged += item.damagedQuantity;
          inventory.quantity.total += item.damagedQuantity;
          
          inventory.movements.push({
            type: 'damage',
            quantity: item.damagedQuantity,
            reference: 'goods-receipt',
            referenceId: receipt._id,
            notes: `Damaged items from GRN: ${receipt.grnNumber}. Reason: ${item.damageReason || 'Not specified'}`,
            performedBy: req.user._id
          });

          await inventory.save();
        }
      }
    }

    receipt.verifiedBy = req.user._id;
    receipt.verificationDate = new Date();
    receipt.updatedBy = req.user._id;
    await receipt.save();

    // Update supplier performance
    const supplier = await Supplier.findById(receipt.supplier);
    if (supplier) {
      supplier.performance.completedOrders += 1;
      
      // Check if delivery was on time
      if (!receipt.isDelayed()) {
        supplier.performance.onTimeDeliveries += 1;
      }
      
      // Update rejected items count
      const totalRejected = receipt.items.reduce((sum, item) => sum + item.rejectedQuantity, 0);
      supplier.performance.rejectedItems += totalRejected;
      
      await supplier.save();
    }

    const updatedReceipt = await GoodsReceipt.findById(receipt._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Goods accepted and inventory updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting goods receipt',
      error: error.message
    });
  }
};

// @desc    Mark put-away completed
// @route   PUT /api/v1/wms/receiving/:id/putaway
// @access  Private (Admin, Manager)
exports.completePutaway = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    const { items: putawayItems } = req.body;

    // Update each item's put-away details
    putawayItems.forEach(putawayItem => {
      const item = receipt.items.id(putawayItem.itemId);
      if (item) {
        item.putawayStatus = 'completed';
        item.putawayDate = new Date();
        item.putawayBy = req.user._id;
        
        // Update storage location if provided
        if (putawayItem.binLocation) {
          item.binLocation = putawayItem.binLocation;
        }
        if (putawayItem.rackNumber) {
          item.rackNumber = putawayItem.rackNumber;
        }
        if (putawayItem.shelfNumber) {
          item.shelfNumber = putawayItem.shelfNumber;
        }
      }
    });

    receipt.updatedBy = req.user._id;
    await receipt.save();

    const updatedReceipt = await GoodsReceipt.findById(receipt._id)
      .populate('purchaseOrder', 'poNumber')
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Put-away completed successfully',
      data: updatedReceipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing put-away',
      error: error.message
    });
  }
};

// @desc    Get goods receipts by purchase order
// @route   GET /api/v1/wms/receiving/po/:poId
// @access  Private
exports.getGoodsReceiptsByPO = async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find({ purchaseOrder: req.params.poId })
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .populate('receivedBy', 'name email')
      .populate('items.product', 'name sku')
      .sort({ receiptDate: -1 });

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching goods receipts',
      error: error.message
    });
  }
};
