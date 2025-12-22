const mongoose = require('mongoose');

const pickingTaskSchema = new mongoose.Schema({
  taskNumber: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Type of picking
  pickingType: {
    type: String,
    enum: ['single-order', 'batch', 'wave', 'zone', 'cluster'],
    default: 'single-order',
    lowercase: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    lowercase: true
  },
  
  priorityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Related orders
  salesOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  }],
  
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  
  // Assigned picker
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  assignedAt: Date,
  
  // Items to pick
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder'
    },
    
    // Quantities
    quantityToPick: {
      type: Number,
      required: true,
      min: 0
    },
    quantityPicked: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityShort: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Location info
    pickFromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
    },
    pickFromLocationCode: String,
    
    // Batch/Serial tracking
    batchNumber: String,
    lotNumber: String,
    serialNumbers: [String],
    expiryDate: Date,
    
    // Picking details
    pickedAt: Date,
    pickSequence: Number,
    
    // Status per item
    status: {
      type: String,
      enum: ['pending', 'picking', 'picked', 'short', 'substituted', 'damaged', 'cancelled'],
      default: 'pending',
      lowercase: true
    },
    
    // Substitution
    substitutedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    substitutionReason: String,
    
    // Verification
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
    
    notes: String
  }],
  
  // Picking strategy
  strategy: {
    type: String,
    enum: ['fifo', 'lifo', 'fefo', 'nearest', 'fastest'],
    default: 'fifo',
    lowercase: true
  },
  
  // Zone-based picking
  zones: [String],
  
  // Wave information (for wave picking)
  waveId: String,
  waveName: String,
  
  // Batch information
  batchId: String,
  batchName: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'assigned', 'in-progress', 'picking', 'picked', 'verified', 'completed', 'on-hold', 'cancelled'],
    default: 'draft',
    lowercase: true
  },
  
  // Dates
  scheduledStartDate: Date,
  scheduledEndDate: Date,
  actualStartDate: Date,
  actualEndDate: Date,
  
  // Time tracking
  estimatedDuration: Number, // in minutes
  actualDuration: Number, // in minutes
  
  // Performance metrics
  pickRate: Number, // items per hour
  accuracy: Number, // percentage
  
  // Equipment
  equipment: [{
    type: {
      type: String,
      enum: ['forklift', 'pallet-jack', 'cart', 'scanner', 'tablet', 'headset', 'ladder', 'other']
    },
    equipmentId: String,
    name: String
  }],
  
  // Instructions
  pickingInstructions: {
    type: String,
    trim: true
  },
  
  specialInstructions: {
    type: String,
    trim: true
  },
  
  // Packing instructions
  packingInstructions: String,
  
  // Picking path/route
  pickingPath: [{
    sequence: Number,
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
    },
    locationCode: String,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    picked: {
      type: Boolean,
      default: false
    },
    pickedAt: Date
  }],
  
  // Exceptions
  exceptions: [{
    type: {
      type: String,
      enum: ['short-pick', 'damaged-item', 'wrong-item', 'location-empty', 'location-mismatch', 'barcode-mismatch', 'expired-item', 'other']
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
  
  // Quality checks
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
  
  // Completion
  completionNotes: String,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Holds
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
      enum: ['pick-list', 'packing-list', 'shipping-label', 'quality-report', 'photo', 'other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit trail
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

// Indexes
pickingTaskSchema.index({ taskNumber: 1 });
pickingTaskSchema.index({ warehouse: 1 });
pickingTaskSchema.index({ status: 1 });
pickingTaskSchema.index({ assignedTo: 1 });
pickingTaskSchema.index({ pickingType: 1 });
pickingTaskSchema.index({ priority: 1, priorityScore: -1 });
pickingTaskSchema.index({ salesOrders: 1 });
pickingTaskSchema.index({ waveId: 1 });
pickingTaskSchema.index({ batchId: 1 });
pickingTaskSchema.index({ scheduledStartDate: 1 });
pickingTaskSchema.index({ createdAt: -1 });

// Pre-save middleware
pickingTaskSchema.pre('save', async function(next) {
  // Generate task number
  if (!this.taskNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const prefix = 'PICK';
    
    // Find last task number for this year
    const lastTask = await this.constructor.findOne({
      taskNumber: new RegExp(`^${prefix}-${year}-`)
    }).sort({ taskNumber: -1 });
    
    let sequence = 1;
    if (lastTask && lastTask.taskNumber) {
      const lastSequence = parseInt(lastTask.taskNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.taskNumber = `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
  }
  
  // Calculate actual duration if completed
  if (this.status === 'completed' && this.actualStartDate && this.actualEndDate) {
    this.actualDuration = Math.round((this.actualEndDate - this.actualStartDate) / (1000 * 60));
  }
  
  // Calculate pick rate
  if (this.actualDuration > 0) {
    const totalPicked = this.items.reduce((sum, item) => sum + item.quantityPicked, 0);
    this.pickRate = Math.round((totalPicked / this.actualDuration) * 60); // items per hour
  }
  
  // Calculate accuracy
  const totalToPick = this.items.reduce((sum, item) => sum + item.quantityToPick, 0);
  const totalPicked = this.items.reduce((sum, item) => sum + item.quantityPicked, 0);
  if (totalToPick > 0) {
    this.accuracy = ((totalPicked / totalToPick) * 100).toFixed(2);
  }
  
  // Update overall status based on items
  if (this.items.length > 0) {
    const allPicked = this.items.every(item => 
      item.status === 'picked' || item.status === 'short' || item.status === 'substituted'
    );
    
    if (allPicked && this.status === 'picking') {
      this.status = 'picked';
    }
  }
  
  next();
});

// Virtual properties
pickingTaskSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

pickingTaskSchema.virtual('totalQuantityToPick').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantityToPick, 0);
});

pickingTaskSchema.virtual('totalQuantityPicked').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantityPicked, 0);
});

pickingTaskSchema.virtual('totalQuantityShort').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantityShort, 0);
});

pickingTaskSchema.virtual('completionPercentage').get(function() {
  if (this.totalQuantityToPick === 0) return 0;
  return ((this.totalQuantityPicked / this.totalQuantityToPick) * 100).toFixed(2);
});

pickingTaskSchema.virtual('isPending').get(function() {
  return this.status === 'pending' || this.status === 'draft';
});

pickingTaskSchema.virtual('isInProgress').get(function() {
  return this.status === 'in-progress' || this.status === 'picking';
});

pickingTaskSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

pickingTaskSchema.virtual('hasExceptions').get(function() {
  return this.exceptions.length > 0;
});

pickingTaskSchema.virtual('unresolvedExceptions').get(function() {
  return this.exceptions.filter(e => !e.resolved).length;
});

pickingTaskSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledEndDate || this.isCompleted) return false;
  return new Date() > this.scheduledEndDate;
});

// Instance methods
pickingTaskSchema.methods.assignPicker = function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.status = 'assigned';
  
  this.history.push({
    action: 'assigned',
    status: 'assigned',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return this.save();
};

pickingTaskSchema.methods.startPicking = function(userId) {
  this.status = 'in-progress';
  this.actualStartDate = new Date();
  
  this.history.push({
    action: 'started',
    status: 'in-progress',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return this.save();
};

pickingTaskSchema.methods.completePicking = function(userId, notes) {
  this.status = 'completed';
  this.actualEndDate = new Date();
  this.completedBy = userId;
  this.completionNotes = notes;
  
  this.history.push({
    action: 'completed',
    status: 'completed',
    performedBy: userId,
    timestamp: new Date(),
    notes
  });
  
  return this.save();
};

pickingTaskSchema.methods.putOnHold = function(userId, reason) {
  this.status = 'on-hold';
  this.onHoldReason = reason;
  this.onHoldAt = new Date();
  this.onHoldBy = userId;
  
  this.history.push({
    action: 'put-on-hold',
    status: 'on-hold',
    performedBy: userId,
    timestamp: new Date(),
    notes: reason
  });
  
  return this.save();
};

pickingTaskSchema.methods.addException = function(exceptionData) {
  this.exceptions.push({
    ...exceptionData,
    reportedAt: new Date()
  });
  
  return this.save();
};

// Static methods
pickingTaskSchema.statics.getPendingTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    status: { $in: ['pending', 'draft'] },
    isActive: true
  }).sort({ priorityScore: -1, scheduledStartDate: 1 });
};

pickingTaskSchema.statics.getAssignedTasks = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['assigned', 'in-progress', 'picking'] },
    isActive: true
  }).sort({ priorityScore: -1, scheduledStartDate: 1 });
};

pickingTaskSchema.statics.getOverdueTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    scheduledEndDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isActive: true
  }).sort({ scheduledEndDate: 1 });
};

pickingTaskSchema.statics.getBySalesOrder = function(salesOrderId) {
  return this.find({
    salesOrders: salesOrderId,
    isActive: true
  }).sort({ createdAt: -1 });
};

pickingTaskSchema.statics.getByWave = function(waveId) {
  return this.find({
    waveId,
    isActive: true
  }).sort({ pickingPath: 1 });
};

pickingTaskSchema.statics.getByBatch = function(batchId) {
  return this.find({
    batchId,
    isActive: true
  }).sort({ createdAt: -1 });
};

pickingTaskSchema.statics.getPickingMetrics = function(warehouseId, startDate, endDate) {
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
        avgPickRate: { $avg: '$pickRate' },
        avgAccuracy: { $avg: '$accuracy' },
        avgDuration: { $avg: '$actualDuration' },
        totalExceptions: { $sum: { $size: '$exceptions' } }
      }
    }
  ]);
};

module.exports = mongoose.model('PickingTask', pickingTaskSchema);
