const mongoose = require('mongoose');

const packingTaskSchema = new mongoose.Schema({
  // Task identification
  taskNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // References
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: [true, 'Sales order is required']
  },
  pickingTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickingTask'
  },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },
  
  // Packer assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  
  // Task details
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  priorityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Items to pack
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productSKU: String,
    quantityToPack: {
      type: Number,
      required: true,
      min: 1
    },
    quantityPacked: {
      type: Number,
      default: 0,
      min: 0
    },
    batchNumber: String,
    lotNumber: String,
    serialNumbers: [String],
    expiryDate: Date,
    
    // Packing details per item
    packagedIn: [{
      packageNumber: String,
      quantity: Number
    }],
    
    // Item verification
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    
    // Barcode scanning
    scanned: {
      type: Boolean,
      default: false
    },
    scannedAt: Date,
    
    // Item status
    status: {
      type: String,
      enum: ['pending', 'packing', 'packed', 'damaged', 'cancelled'],
      default: 'pending'
    },
    
    notes: String
  }],
  
  // Packages/Boxes
  packages: [{
    packageNumber: {
      type: String,
      required: true
    },
    packageType: {
      type: String,
      enum: ['box', 'carton', 'crate', 'pallet', 'envelope', 'bag', 'custom'],
      default: 'box'
    },
    
    // Container details
    containerCode: String,
    containerName: String,
    
    // Dimensions
    length: Number,
    width: Number,
    height: Number,
    dimensionUnit: {
      type: String,
      enum: ['cm', 'inch', 'meter'],
      default: 'cm'
    },
    
    // Weight
    weight: Number,
    weightUnit: {
      type: String,
      enum: ['kg', 'lb', 'gram'],
      default: 'kg'
    },
    
    // Volume
    volume: Number,
    volumeUnit: {
      type: String,
      enum: ['cbm', 'cbf', 'liter'],
      default: 'cbm'
    },
    
    // Items in this package
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      productName: String,
      quantity: Number,
      batchNumber: String,
      serialNumbers: [String]
    }],
    
    // Package status
    status: {
      type: String,
      enum: ['open', 'packing', 'sealed', 'labelled', 'shipped'],
      default: 'open'
    },
    
    // Sealing
    sealedAt: Date,
    sealedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sealNumber: String,
    
    // Labelling
    labelGenerated: {
      type: Boolean,
      default: false
    },
    labelGeneratedAt: Date,
    trackingNumber: String,
    shippingLabelUrl: String,
    
    // Packing slip
    packingSlipGenerated: {
      type: Boolean,
      default: false
    },
    packingSlipUrl: String,
    
    // Special handling
    fragile: {
      type: Boolean,
      default: false
    },
    temperatureControlled: {
      type: Boolean,
      default: false
    },
    hazardous: {
      type: Boolean,
      default: false
    },
    
    notes: String
  }],
  
  // Packing materials used
  materials: [{
    materialType: {
      type: String,
      enum: ['box', 'bubble-wrap', 'tape', 'foam', 'paper', 'pallet', 'stretch-wrap', 'label', 'other']
    },
    materialName: String,
    quantity: Number,
    unit: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'packing', 'packed', 'verified', 'completed', 'on-hold', 'cancelled'],
    default: 'pending'
  },
  
  // Time tracking
  scheduledStartDate: Date,
  scheduledEndDate: Date,
  actualStartDate: Date,
  actualEndDate: Date,
  estimatedDuration: Number, // in minutes
  actualDuration: Number, // in minutes
  
  // Performance metrics
  packingRate: Number, // items per hour
  accuracy: Number, // percentage
  
  // Instructions
  packingInstructions: String,
  specialInstructions: String,
  handlingInstructions: String,
  
  // Quality control
  qualityCheck: {
    required: {
      type: Boolean,
      default: false
    },
    performed: {
      type: Boolean,
      default: false
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending']
    },
    notes: String
  },
  
  // Exceptions
  exceptions: [{
    type: {
      type: String,
      enum: ['damaged-item', 'missing-item', 'wrong-item', 'incorrect-quantity', 'packaging-issue', 'label-issue', 'other']
    },
    itemId: mongoose.Schema.Types.ObjectId,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  }],
  
  // Completion
  completionNotes: String,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // On-hold
  onHoldReason: String,
  onHoldAt: Date,
  onHoldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['packing-list', 'shipping-label', 'invoice', 'quality-report', 'photo', 'other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // History/Audit trail
  history: [{
    action: String,
    status: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate task number before saving
packingTaskSchema.pre('save', async function(next) {
  if (!this.taskNumber) {
    const year = new Date().getFullYear();
    const lastTask = await this.constructor.findOne({
      taskNumber: new RegExp(`^PACK-${year}-`)
    }).sort({ taskNumber: -1 });
    
    let sequence = 1;
    if (lastTask && lastTask.taskNumber) {
      const lastSequence = parseInt(lastTask.taskNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.taskNumber = `PACK-${year}-${String(sequence).padStart(6, '0')}`;
  }
  next();
});

// Calculate duration and metrics before saving
packingTaskSchema.pre('save', function(next) {
  // Calculate actual duration
  if (this.actualStartDate && this.actualEndDate) {
    this.actualDuration = Math.round((this.actualEndDate - this.actualStartDate) / 60000); // in minutes
  }
  
  // Calculate packing rate (items per hour)
  if (this.actualDuration && this.actualDuration > 0) {
    const totalPacked = this.items.reduce((sum, item) => sum + (item.quantityPacked || 0), 0);
    this.packingRate = Math.round((totalPacked / this.actualDuration) * 60);
  }
  
  // Calculate accuracy
  const totalToPack = this.items.reduce((sum, item) => sum + item.quantityToPack, 0);
  const totalPacked = this.items.reduce((sum, item) => sum + (item.quantityPacked || 0), 0);
  if (totalToPack > 0) {
    this.accuracy = Math.round((totalPacked / totalToPack) * 100);
  }
  
  // Auto-update status based on items
  if (this.status === 'packing') {
    const allPacked = this.items.every(item => 
      item.status === 'packed' || item.status === 'damaged' || item.status === 'cancelled'
    );
    if (allPacked) {
      this.status = 'packed';
    }
  }
  
  next();
});

// Virtual for total items
packingTaskSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total quantity to pack
packingTaskSchema.virtual('totalQuantityToPack').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantityToPack, 0);
});

// Virtual for total quantity packed
packingTaskSchema.virtual('totalQuantityPacked').get(function() {
  return this.items.reduce((sum, item) => sum + (item.quantityPacked || 0), 0);
});

// Virtual for total packages
packingTaskSchema.virtual('totalPackages').get(function() {
  return this.packages.length;
});

// Virtual for completion percentage
packingTaskSchema.virtual('completionPercentage').get(function() {
  const total = this.totalQuantityToPack;
  const packed = this.totalQuantityPacked;
  return total > 0 ? Math.round((packed / total) * 100) : 0;
});

// Virtual for checking if pending
packingTaskSchema.virtual('isPending').get(function() {
  return this.status === 'pending' || this.status === 'assigned';
});

// Virtual for checking if in progress
packingTaskSchema.virtual('isInProgress').get(function() {
  return this.status === 'in-progress' || this.status === 'packing';
});

// Virtual for checking if completed
packingTaskSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for checking if has exceptions
packingTaskSchema.virtual('hasExceptions').get(function() {
  return this.exceptions && this.exceptions.length > 0;
});

// Virtual for unresolved exceptions count
packingTaskSchema.virtual('unresolvedExceptions').get(function() {
  return this.exceptions ? this.exceptions.filter(e => !e.resolved).length : 0;
});

// Virtual for checking if overdue
packingTaskSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledEndDate || this.isCompleted) return false;
  return new Date() > this.scheduledEndDate;
});

// Virtual for total weight
packingTaskSchema.virtual('totalWeight').get(function() {
  return this.packages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0);
});

// Instance method to assign packer
packingTaskSchema.methods.assignPacker = async function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.status = 'assigned';
  
  this.history.push({
    action: 'Packer Assigned',
    status: 'assigned',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return await this.save();
};

// Instance method to start packing
packingTaskSchema.methods.startPacking = async function(userId) {
  this.status = 'in-progress';
  this.actualStartDate = new Date();
  
  this.history.push({
    action: 'Packing Started',
    status: 'in-progress',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return await this.save();
};

// Instance method to complete packing
packingTaskSchema.methods.completePacking = async function(userId, notes) {
  this.status = 'completed';
  this.actualEndDate = new Date();
  this.completedBy = userId;
  if (notes) this.completionNotes = notes;
  
  this.history.push({
    action: 'Packing Completed',
    status: 'completed',
    performedBy: userId,
    timestamp: new Date(),
    notes: notes
  });
  
  return await this.save();
};

// Instance method to put on hold
packingTaskSchema.methods.putOnHold = async function(userId, reason) {
  this.status = 'on-hold';
  this.onHoldReason = reason;
  this.onHoldAt = new Date();
  this.onHoldBy = userId;
  
  this.history.push({
    action: 'Put On Hold',
    status: 'on-hold',
    performedBy: userId,
    timestamp: new Date(),
    notes: reason
  });
  
  return await this.save();
};

// Instance method to add exception
packingTaskSchema.methods.addException = async function(exceptionData) {
  this.exceptions.push({
    ...exceptionData,
    reportedAt: new Date()
  });
  
  return await this.save();
};

// Static method to get pending tasks
packingTaskSchema.statics.getPendingTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    status: { $in: ['pending', 'assigned'] },
    isActive: true
  }).sort({ priorityScore: -1, scheduledStartDate: 1 });
};

// Static method to get assigned tasks for a packer
packingTaskSchema.statics.getAssignedTasks = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['assigned', 'in-progress', 'packing'] },
    isActive: true
  }).sort({ priority: 1, scheduledStartDate: 1 });
};

// Static method to get overdue tasks
packingTaskSchema.statics.getOverdueTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    scheduledEndDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isActive: true
  }).sort({ scheduledEndDate: 1 });
};

// Static method to get tasks by sales order
packingTaskSchema.statics.getBySalesOrder = function(salesOrderId) {
  return this.find({
    salesOrder: salesOrderId,
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to get packing metrics
packingTaskSchema.statics.getPackingMetrics = function(warehouseId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        warehouse: mongoose.Types.ObjectId(warehouseId),
        status: 'completed',
        actualEndDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        totalItems: { $sum: { $size: '$items' } },
        totalPackages: { $sum: { $size: '$packages' } },
        avgPackingRate: { $avg: '$packingRate' },
        avgAccuracy: { $avg: '$accuracy' },
        avgDuration: { $avg: '$actualDuration' },
        totalExceptions: { $sum: { $size: '$exceptions' } }
      }
    }
  ]);
};

// Indexes
packingTaskSchema.index({ taskNumber: 1 });
packingTaskSchema.index({ warehouse: 1 });
packingTaskSchema.index({ salesOrder: 1 });
packingTaskSchema.index({ pickingTask: 1 });
packingTaskSchema.index({ status: 1 });
packingTaskSchema.index({ assignedTo: 1 });
packingTaskSchema.index({ priority: 1, priorityScore: -1 });
packingTaskSchema.index({ scheduledStartDate: 1 });
packingTaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PackingTask', packingTaskSchema);
