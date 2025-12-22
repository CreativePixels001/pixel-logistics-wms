const mongoose = require('mongoose');

const putawayTaskSchema = new mongoose.Schema({
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
  goodsReceipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoodsReceipt'
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  
  // Worker assignment
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
  
  // Put-away strategy
  strategy: {
    type: String,
    enum: ['nearest', 'fastest', 'fefo', 'abc-analysis', 'zone-based', 'capacity-optimized'],
    default: 'nearest'
  },
  
  // Items to put away
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productSKU: String,
    quantityToPutaway: {
      type: Number,
      required: true,
      min: 1
    },
    quantityPutaway: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Source location (receiving/staging area)
    fromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
    },
    fromLocationCode: String,
    
    // Destination location (storage)
    toLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
    },
    toLocationCode: String,
    
    // Storage details
    batchNumber: String,
    lotNumber: String,
    serialNumbers: [String],
    expiryDate: Date,
    manufacturingDate: Date,
    
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
      enum: ['pending', 'in-transit', 'putaway', 'damaged', 'cancelled'],
      default: 'pending'
    },
    
    // Sequence for optimization
    putawaySequence: Number,
    
    notes: String
  }],
  
  // Location optimization data
  locationSuggestions: [{
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
    },
    locationCode: String,
    score: Number, // Optimization score
    reason: String, // Why this location was suggested
    distance: Number, // Distance from source
    availableCapacity: Number,
    utilizationPercentage: Number
  }],
  
  // Equipment needed
  equipment: [{
    type: {
      type: String,
      enum: ['forklift', 'pallet-jack', 'reach-truck', 'order-picker', 'hand-truck', 'cart', 'ladder', 'other']
    },
    equipmentId: String,
    name: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'on-hold', 'cancelled'],
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
  putawayRate: Number, // items per hour
  accuracy: Number, // percentage
  
  // Instructions
  putawayInstructions: String,
  specialInstructions: String,
  safetyInstructions: String,
  
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
      enum: ['location-full', 'location-blocked', 'damaged-item', 'wrong-location', 'equipment-failure', 'other']
    },
    itemId: mongoose.Schema.Types.ObjectId,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WarehouseLocation'
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
      enum: ['putaway-list', 'location-map', 'quality-report', 'photo', 'other']
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
putawayTaskSchema.pre('save', async function(next) {
  if (!this.taskNumber) {
    const year = new Date().getFullYear();
    const lastTask = await this.constructor.findOne({
      taskNumber: new RegExp(`^PTWY-${year}-`)
    }).sort({ taskNumber: -1 });
    
    let sequence = 1;
    if (lastTask && lastTask.taskNumber) {
      const lastSequence = parseInt(lastTask.taskNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.taskNumber = `PTWY-${year}-${String(sequence).padStart(6, '0')}`;
  }
  next();
});

// Calculate duration and metrics before saving
putawayTaskSchema.pre('save', function(next) {
  // Calculate actual duration
  if (this.actualStartDate && this.actualEndDate) {
    this.actualDuration = Math.round((this.actualEndDate - this.actualStartDate) / 60000); // in minutes
  }
  
  // Calculate putaway rate (items per hour)
  if (this.actualDuration && this.actualDuration > 0) {
    const totalPutaway = this.items.reduce((sum, item) => sum + (item.quantityPutaway || 0), 0);
    this.putawayRate = Math.round((totalPutaway / this.actualDuration) * 60);
  }
  
  // Calculate accuracy
  const totalToPutaway = this.items.reduce((sum, item) => sum + item.quantityToPutaway, 0);
  const totalPutaway = this.items.reduce((sum, item) => sum + (item.quantityPutaway || 0), 0);
  if (totalToPutaway > 0) {
    this.accuracy = Math.round((totalPutaway / totalToPutaway) * 100);
  }
  
  // Auto-update status based on items
  if (this.status === 'in-progress') {
    const allPutaway = this.items.every(item => 
      item.status === 'putaway' || item.status === 'damaged' || item.status === 'cancelled'
    );
    if (allPutaway) {
      this.status = 'completed';
    }
  }
  
  next();
});

// Virtual for total items
putawayTaskSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total quantity to putaway
putawayTaskSchema.virtual('totalQuantityToPutaway').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantityToPutaway, 0);
});

// Virtual for total quantity putaway
putawayTaskSchema.virtual('totalQuantityPutaway').get(function() {
  return this.items.reduce((sum, item) => sum + (item.quantityPutaway || 0), 0);
});

// Virtual for completion percentage
putawayTaskSchema.virtual('completionPercentage').get(function() {
  const total = this.totalQuantityToPutaway;
  const putaway = this.totalQuantityPutaway;
  return total > 0 ? Math.round((putaway / total) * 100) : 0;
});

// Virtual for checking if pending
putawayTaskSchema.virtual('isPending').get(function() {
  return this.status === 'pending' || this.status === 'assigned';
});

// Virtual for checking if in progress
putawayTaskSchema.virtual('isInProgress').get(function() {
  return this.status === 'in-progress';
});

// Virtual for checking if completed
putawayTaskSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for checking if has exceptions
putawayTaskSchema.virtual('hasExceptions').get(function() {
  return this.exceptions && this.exceptions.length > 0;
});

// Virtual for unresolved exceptions count
putawayTaskSchema.virtual('unresolvedExceptions').get(function() {
  return this.exceptions ? this.exceptions.filter(e => !e.resolved).length : 0;
});

// Virtual for checking if overdue
putawayTaskSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledEndDate || this.isCompleted) return false;
  return new Date() > this.scheduledEndDate;
});

// Instance method to assign worker
putawayTaskSchema.methods.assignWorker = async function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.status = 'assigned';
  
  this.history.push({
    action: 'Worker Assigned',
    status: 'assigned',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return await this.save();
};

// Instance method to start putaway
putawayTaskSchema.methods.startPutaway = async function(userId) {
  this.status = 'in-progress';
  this.actualStartDate = new Date();
  
  this.history.push({
    action: 'Putaway Started',
    status: 'in-progress',
    performedBy: userId,
    timestamp: new Date()
  });
  
  return await this.save();
};

// Instance method to complete putaway
putawayTaskSchema.methods.completePutaway = async function(userId, notes) {
  this.status = 'completed';
  this.actualEndDate = new Date();
  this.completedBy = userId;
  if (notes) this.completionNotes = notes;
  
  this.history.push({
    action: 'Putaway Completed',
    status: 'completed',
    performedBy: userId,
    timestamp: new Date(),
    notes: notes
  });
  
  return await this.save();
};

// Instance method to put on hold
putawayTaskSchema.methods.putOnHold = async function(userId, reason) {
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
putawayTaskSchema.methods.addException = async function(exceptionData) {
  this.exceptions.push({
    ...exceptionData,
    reportedAt: new Date()
  });
  
  return await this.save();
};

// Static method to get pending tasks
putawayTaskSchema.statics.getPendingTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    status: { $in: ['pending', 'assigned'] },
    isActive: true
  }).sort({ priorityScore: -1, scheduledStartDate: 1 });
};

// Static method to get assigned tasks for a worker
putawayTaskSchema.statics.getAssignedTasks = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['assigned', 'in-progress'] },
    isActive: true
  }).sort({ priority: 1, scheduledStartDate: 1 });
};

// Static method to get overdue tasks
putawayTaskSchema.statics.getOverdueTasks = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    scheduledEndDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isActive: true
  }).sort({ scheduledEndDate: 1 });
};

// Static method to get putaway metrics
putawayTaskSchema.statics.getPutawayMetrics = function(warehouseId, startDate, endDate) {
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
        avgPutawayRate: { $avg: '$putawayRate' },
        avgAccuracy: { $avg: '$accuracy' },
        avgDuration: { $avg: '$actualDuration' },
        totalExceptions: { $sum: { $size: '$exceptions' } }
      }
    }
  ]);
};

// Indexes
putawayTaskSchema.index({ taskNumber: 1 });
putawayTaskSchema.index({ warehouse: 1 });
putawayTaskSchema.index({ goodsReceipt: 1 });
putawayTaskSchema.index({ purchaseOrder: 1 });
putawayTaskSchema.index({ status: 1 });
putawayTaskSchema.index({ assignedTo: 1 });
putawayTaskSchema.index({ priority: 1, priorityScore: -1 });
putawayTaskSchema.index({ scheduledStartDate: 1 });
putawayTaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PutawayTask', putawayTaskSchema);
