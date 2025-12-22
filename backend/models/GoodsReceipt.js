const mongoose = require('mongoose');

const goodsReceiptSchema = new mongoose.Schema({
  // Auto-generated GRN number
  grnNumber: {
    type: String,
    unique: true,
    index: true
  },

  // Purchase Order Reference
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: [true, 'Purchase Order is required'],
    index: true
  },

  // Warehouse where goods are received
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required'],
    index: true
  },

  // Supplier Information
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required'],
    index: true
  },

  // Receipt Date
  receiptDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Expected Delivery Date (from PO)
  expectedDate: {
    type: Date
  },

  // Items Received
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    
    // Quantities
    orderedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    receivedQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    acceptedQuantity: {
      type: Number,
      min: 0,
      default: 0
    },
    rejectedQuantity: {
      type: Number,
      min: 0,
      default: 0
    },
    damagedQuantity: {
      type: Number,
      min: 0,
      default: 0
    },

    // Variance
    variance: {
      type: Number,
      default: 0
    },
    varianceReason: {
      type: String,
      enum: ['none', 'short-supply', 'excess-supply', 'damaged', 'quality-issue', 'wrong-item', 'other'],
      default: 'none'
    },

    // Quality Inspection
    inspectionStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'partial', 'not-required'],
      default: 'pending'
    },
    inspectionNotes: String,
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspectionDate: Date,

    // Batch/Lot Information
    batchNumber: String,
    lotNumber: String,
    serialNumbers: [String],
    
    // Expiry Information
    manufacturingDate: Date,
    expiryDate: Date,

    // Storage Location
    binLocation: String,
    rackNumber: String,
    shelfNumber: String,

    // Put-away Status
    putawayStatus: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    putawayDate: Date,
    putawayBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Unit Cost
    unitCost: {
      type: Number,
      min: 0
    },
    totalCost: {
      type: Number,
      min: 0
    },

    // Rejection/Damage Details
    rejectionReason: String,
    damageReason: String,
    damageImages: [String],

    // Item Notes
    notes: String,

    // Status
    status: {
      type: String,
      enum: ['pending', 'received', 'inspected', 'accepted', 'rejected', 'partially-accepted', 'put-away'],
      default: 'pending'
    }
  }],

  // Overall Receipt Status
  status: {
    type: String,
    enum: ['draft', 'pending-inspection', 'inspecting', 'completed', 'partially-received', 'rejected', 'closed'],
    default: 'draft',
    index: true
  },

  // Quality Inspection
  overallInspectionStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'passed', 'failed', 'partial'],
    default: 'pending'
  },
  qualityChecklistId: String,
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['invoice', 'packing-list', 'delivery-note', 'quality-certificate', 'test-report', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Invoice Details
  invoiceNumber: String,
  invoiceDate: Date,
  invoiceAmount: Number,

  // Transport Details
  vehicleNumber: String,
  driverName: String,
  driverPhone: String,
  transporterName: String,
  lrNumber: String, // Lorry Receipt Number
  freightCharges: {
    type: Number,
    min: 0,
    default: 0
  },

  // Received By
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Verified By
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,

  // Put-away Task
  putawayTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PutawayTask'
  },

  // Remarks
  remarks: String,
  internalNotes: String,

  // Timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate GRN number
goodsReceiptSchema.pre('save', async function(next) {
  // Generate GRN number if not exists
  if (!this.grnNumber) {
    const currentYear = new Date().getFullYear();
    const lastReceipt = await this.constructor.findOne({
      grnNumber: new RegExp(`^GRN-${currentYear}-`)
    }).sort({ grnNumber: -1 });

    let nextNumber = 1;
    if (lastReceipt && lastReceipt.grnNumber) {
      const lastNumber = parseInt(lastReceipt.grnNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    this.grnNumber = `GRN-${currentYear}-${String(nextNumber).padStart(6, '0')}`;
  }

  // Calculate variances and totals for each item
  this.items.forEach(item => {
    // Calculate variance
    item.variance = item.receivedQuantity - item.orderedQuantity;
    
    // Set variance reason if there's a variance
    if (item.variance !== 0 && item.varianceReason === 'none') {
      if (item.variance > 0) {
        item.varianceReason = 'excess-supply';
      } else {
        item.varianceReason = 'short-supply';
      }
    }

    // Calculate total cost
    if (item.unitCost) {
      item.totalCost = item.acceptedQuantity * item.unitCost;
    }

    // Update item status based on quantities
    if (item.receivedQuantity === 0) {
      item.status = 'pending';
    } else if (item.acceptedQuantity === 0 && item.rejectedQuantity === item.receivedQuantity) {
      item.status = 'rejected';
    } else if (item.acceptedQuantity === item.receivedQuantity) {
      if (item.putawayStatus === 'completed') {
        item.status = 'put-away';
      } else if (item.inspectionStatus === 'passed') {
        item.status = 'accepted';
      } else {
        item.status = 'inspected';
      }
    } else if (item.acceptedQuantity > 0 && item.rejectedQuantity > 0) {
      item.status = 'partially-accepted';
    } else if (item.receivedQuantity > 0) {
      item.status = 'received';
    }
  });

  // Update overall status
  const totalItems = this.items.length;
  const receivedItems = this.items.filter(item => item.receivedQuantity > 0).length;
  const inspectedItems = this.items.filter(item => item.inspectionStatus !== 'pending').length;
  const putawayItems = this.items.filter(item => item.putawayStatus === 'completed').length;

  if (putawayItems === totalItems && totalItems > 0) {
    this.status = 'closed';
  } else if (inspectedItems === totalItems && totalItems > 0) {
    this.status = 'completed';
  } else if (inspectedItems > 0) {
    this.status = 'inspecting';
  } else if (receivedItems > 0) {
    this.status = 'pending-inspection';
  }

  // Update overall inspection status
  const passedItems = this.items.filter(item => item.inspectionStatus === 'passed').length;
  const failedItems = this.items.filter(item => item.inspectionStatus === 'failed').length;
  
  if (inspectedItems === 0) {
    this.overallInspectionStatus = 'pending';
  } else if (inspectedItems < totalItems) {
    this.overallInspectionStatus = 'in-progress';
  } else if (passedItems === totalItems) {
    this.overallInspectionStatus = 'passed';
  } else if (failedItems === totalItems) {
    this.overallInspectionStatus = 'failed';
  } else {
    this.overallInspectionStatus = 'partial';
  }

  next();
});

// Virtual for total items
goodsReceiptSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total received quantity
goodsReceiptSchema.virtual('totalReceivedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
});

// Virtual for total accepted quantity
goodsReceiptSchema.virtual('totalAcceptedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.acceptedQuantity, 0);
});

// Virtual for total rejected quantity
goodsReceiptSchema.virtual('totalRejectedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.rejectedQuantity, 0);
});

// Virtual for total cost
goodsReceiptSchema.virtual('totalCost').get(function() {
  return this.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
});

// Virtual for receipt percentage
goodsReceiptSchema.virtual('receiptPercentage').get(function() {
  const totalOrdered = this.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  return totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
});

// Virtual for acceptance percentage
goodsReceiptSchema.virtual('acceptancePercentage').get(function() {
  const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const totalAccepted = this.items.reduce((sum, item) => sum + item.acceptedQuantity, 0);
  return totalReceived > 0 ? Math.round((totalAccepted / totalReceived) * 100) : 0;
});

// Method to check if receipt is delayed
goodsReceiptSchema.methods.isDelayed = function() {
  if (!this.expectedDate) return false;
  return this.receiptDate > this.expectedDate;
};

// Static method to get pending inspections
goodsReceiptSchema.statics.getPendingInspections = function() {
  return this.find({
    overallInspectionStatus: { $in: ['pending', 'in-progress'] }
  }).sort({ receiptDate: 1 });
};

// Static method to get receipts by PO
goodsReceiptSchema.statics.getByPurchaseOrder = function(poId) {
  return this.find({ purchaseOrder: poId }).sort({ receiptDate: -1 });
};

// Static method to get receipts by supplier
goodsReceiptSchema.statics.getBySupplier = function(supplierId) {
  return this.find({ supplier: supplierId }).sort({ receiptDate: -1 });
};

// Indexes for performance
goodsReceiptSchema.index({ grnNumber: 1 });
goodsReceiptSchema.index({ purchaseOrder: 1 });
goodsReceiptSchema.index({ warehouse: 1 });
goodsReceiptSchema.index({ supplier: 1 });
goodsReceiptSchema.index({ status: 1 });
goodsReceiptSchema.index({ receiptDate: -1 });
goodsReceiptSchema.index({ overallInspectionStatus: 1 });

// Enable virtuals in JSON
goodsReceiptSchema.set('toJSON', { virtuals: true });
goodsReceiptSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GoodsReceipt', goodsReceiptSchema);
