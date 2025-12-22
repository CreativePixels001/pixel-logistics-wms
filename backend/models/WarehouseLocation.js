const mongoose = require('mongoose');

const warehouseLocationSchema = new mongoose.Schema({
  locationCode: {
    type: String,
    required: [true, 'Location code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  
  // Location hierarchy
  zone: {
    type: String,
    required: [true, 'Zone is required'],
    enum: ['receiving', 'storage', 'picking', 'packing', 'dispatch', 'quarantine', 'returns', 'bulk-storage', 'fast-moving', 'slow-moving', 'staging', 'inspection'],
    lowercase: true
  },
  
  aisle: {
    type: String,
    required: [true, 'Aisle is required'],
    trim: true,
    uppercase: true
  },
  
  rack: {
    type: String,
    required: [true, 'Rack is required'],
    trim: true,
    uppercase: true
  },
  
  shelf: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  bin: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  level: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  
  // Full location path (auto-generated)
  fullLocation: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Location type
  locationType: {
    type: String,
    enum: ['bin', 'rack', 'shelf', 'pallet', 'floor', 'bulk', 'hanging', 'cage', 'drawer', 'tank'],
    default: 'bin',
    lowercase: true
  },
  
  // Capacity
  capacity: {
    maxWeight: {
      type: Number,
      default: 0
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'ton'],
      default: 'kg'
    },
    maxVolume: {
      type: Number,
      default: 0
    },
    volumeUnit: {
      type: String,
      enum: ['m3', 'cm3', 'ft3', 'liter'],
      default: 'm3'
    },
    maxPallets: {
      type: Number,
      default: 0
    },
    maxItems: {
      type: Number,
      default: 0
    }
  },
  
  // Current utilization
  currentUtilization: {
    currentWeight: {
      type: Number,
      default: 0
    },
    currentVolume: {
      type: Number,
      default: 0
    },
    currentPallets: {
      type: Number,
      default: 0
    },
    currentItems: {
      type: Number,
      default: 0
    }
  },
  
  // Dimensions
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['m', 'cm', 'ft', 'in'],
      default: 'm'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'full', 'reserved', 'damaged', 'blocked'],
    default: 'active',
    lowercase: true
  },
  
  // Temperature control
  temperatureControlled: {
    type: Boolean,
    default: false
  },
  
  temperatureRange: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    }
  },
  
  // Special conditions
  conditions: {
    humidityControlled: {
      type: Boolean,
      default: false
    },
    hazardousMaterial: {
      type: Boolean,
      default: false
    },
    secureStorage: {
      type: Boolean,
      default: false
    },
    fragileItems: {
      type: Boolean,
      default: false
    },
    refrigerated: {
      type: Boolean,
      default: false
    },
    frozen: {
      type: Boolean,
      default: false
    }
  },
  
  // Access
  accessibility: {
    forkliftAccessible: {
      type: Boolean,
      default: true
    },
    manualPickingOnly: {
      type: Boolean,
      default: false
    },
    requiresLadder: {
      type: Boolean,
      default: false
    },
    requiresScissorLift: {
      type: Boolean,
      default: false
    }
  },
  
  // Assignment rules
  assignmentRules: {
    autoAssign: {
      type: Boolean,
      default: true
    },
    allowMixedProducts: {
      type: Boolean,
      default: true
    },
    allowMixedBatches: {
      type: Boolean,
      default: false
    },
    fifoEnforced: {
      type: Boolean,
      default: true
    },
    lifoEnforced: {
      type: Boolean,
      default: false
    },
    fefoEnforced: {
      type: Boolean,
      default: false
    }
  },
  
  // Priority
  pickingPriority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  putawayPriority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Current inventory
  currentInventory: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    batchNumber: String,
    quantity: Number,
    reservedQuantity: {
      type: Number,
      default: 0
    }
  }],
  
  // Restrictions
  restrictions: {
    allowedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    blockedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    allowedCategories: [String],
    blockedCategories: [String]
  },
  
  // Audit information
  lastAuditDate: Date,
  lastAuditBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAuditStatus: {
    type: String,
    enum: ['passed', 'failed', 'discrepancy', 'pending'],
    lowercase: true
  },
  
  // Cycle count
  cycleCountFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual', 'on-demand'],
    default: 'monthly',
    lowercase: true
  },
  
  lastCycleCount: Date,
  nextCycleCount: Date,
  
  // Location coordinates (for warehouse map)
  coordinates: {
    x: Number,
    y: Number,
    z: Number
  },
  
  // Barcode
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  // QR code
  qrCode: {
    type: String,
    trim: true
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  
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
warehouseLocationSchema.index({ locationCode: 1 });
warehouseLocationSchema.index({ warehouse: 1 });
warehouseLocationSchema.index({ zone: 1 });
warehouseLocationSchema.index({ status: 1 });
warehouseLocationSchema.index({ warehouse: 1, zone: 1 });
warehouseLocationSchema.index({ warehouse: 1, aisle: 1, rack: 1 });
warehouseLocationSchema.index({ barcode: 1 });
warehouseLocationSchema.index({ fullLocation: 1 });
warehouseLocationSchema.index({ 'currentInventory.product': 1 });
warehouseLocationSchema.index({ lastCycleCount: 1, nextCycleCount: 1 });

// Pre-save middleware
warehouseLocationSchema.pre('save', async function(next) {
  // Generate full location path
  let parts = [this.warehouse.toString().substring(0, 4).toUpperCase()];
  
  if (this.zone) parts.push(this.zone.toUpperCase());
  if (this.aisle) parts.push(this.aisle);
  if (this.rack) parts.push(this.rack);
  if (this.shelf) parts.push(this.shelf);
  if (this.bin) parts.push(this.bin);
  
  this.fullLocation = parts.join('-');
  
  // Auto-generate location code if not provided
  if (!this.locationCode) {
    this.locationCode = this.fullLocation;
  }
  
  // Set next cycle count date
  if (!this.nextCycleCount && this.cycleCountFrequency) {
    const now = new Date();
    switch (this.cycleCountFrequency) {
      case 'daily':
        this.nextCycleCount = new Date(now.setDate(now.getDate() + 1));
        break;
      case 'weekly':
        this.nextCycleCount = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'bi-weekly':
        this.nextCycleCount = new Date(now.setDate(now.getDate() + 14));
        break;
      case 'monthly':
        this.nextCycleCount = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'quarterly':
        this.nextCycleCount = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'annual':
        this.nextCycleCount = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
    }
  }
  
  // Update status based on utilization
  if (this.capacity.maxItems > 0 && this.currentUtilization.currentItems >= this.capacity.maxItems) {
    this.status = 'full';
  }
  
  next();
});

// Virtual properties
warehouseLocationSchema.virtual('utilizationPercentage').get(function() {
  if (this.capacity.maxItems > 0) {
    return ((this.currentUtilization.currentItems / this.capacity.maxItems) * 100).toFixed(2);
  }
  return 0;
});

warehouseLocationSchema.virtual('availableCapacity').get(function() {
  return {
    items: Math.max(0, (this.capacity.maxItems || 0) - (this.currentUtilization.currentItems || 0)),
    weight: Math.max(0, (this.capacity.maxWeight || 0) - (this.currentUtilization.currentWeight || 0)),
    volume: Math.max(0, (this.capacity.maxVolume || 0) - (this.currentUtilization.currentVolume || 0)),
    pallets: Math.max(0, (this.capacity.maxPallets || 0) - (this.currentUtilization.currentPallets || 0))
  };
});

warehouseLocationSchema.virtual('isFull').get(function() {
  if (this.capacity.maxItems > 0 && this.currentUtilization.currentItems >= this.capacity.maxItems) {
    return true;
  }
  if (this.capacity.maxWeight > 0 && this.currentUtilization.currentWeight >= this.capacity.maxWeight) {
    return true;
  }
  return false;
});

warehouseLocationSchema.virtual('isEmpty').get(function() {
  return this.currentUtilization.currentItems === 0;
});

warehouseLocationSchema.virtual('needsCycleCount').get(function() {
  if (!this.nextCycleCount) return false;
  return new Date() >= this.nextCycleCount;
});

// Instance methods
warehouseLocationSchema.methods.canAccommodate = function(weight, volume, items, pallets) {
  const available = this.availableCapacity;
  
  if (weight && available.weight < weight) return false;
  if (volume && available.volume < volume) return false;
  if (items && available.items < items) return false;
  if (pallets && available.pallets < pallets) return false;
  
  return true;
};

warehouseLocationSchema.methods.isProductAllowed = function(productId) {
  // Check if product is blocked
  if (this.restrictions.blockedProducts && this.restrictions.blockedProducts.includes(productId)) {
    return false;
  }
  
  // Check if only specific products are allowed
  if (this.restrictions.allowedProducts && this.restrictions.allowedProducts.length > 0) {
    return this.restrictions.allowedProducts.includes(productId);
  }
  
  return true;
};

warehouseLocationSchema.methods.reserveSpace = function(items, weight, volume, pallets) {
  this.currentUtilization.currentItems += items || 0;
  this.currentUtilization.currentWeight += weight || 0;
  this.currentUtilization.currentVolume += volume || 0;
  this.currentUtilization.currentPallets += pallets || 0;
  
  if (this.isFull) {
    this.status = 'full';
  }
  
  return this.save();
};

warehouseLocationSchema.methods.releaseSpace = function(items, weight, volume, pallets) {
  this.currentUtilization.currentItems = Math.max(0, this.currentUtilization.currentItems - (items || 0));
  this.currentUtilization.currentWeight = Math.max(0, this.currentUtilization.currentWeight - (weight || 0));
  this.currentUtilization.currentVolume = Math.max(0, this.currentUtilization.currentVolume - (volume || 0));
  this.currentUtilization.currentPallets = Math.max(0, this.currentUtilization.currentPallets - (pallets || 0));
  
  if (this.status === 'full' && !this.isFull) {
    this.status = 'active';
  }
  
  return this.save();
};

// Static methods
warehouseLocationSchema.statics.getAvailableLocations = function(warehouseId, zone) {
  const query = {
    warehouse: warehouseId,
    status: { $in: ['active', 'reserved'] },
    isActive: true
  };
  
  if (zone) {
    query.zone = zone;
  }
  
  return this.find(query).sort({ pickingPriority: -1, zone: 1, aisle: 1, rack: 1 });
};

warehouseLocationSchema.statics.findOptimalLocation = function(warehouseId, zone, requiredItems, requiredWeight, requiredVolume) {
  return this.findOne({
    warehouse: warehouseId,
    zone: zone,
    status: 'active',
    isActive: true,
    'capacity.maxItems': { $gte: requiredItems },
    'capacity.maxWeight': { $gte: requiredWeight },
    'capacity.maxVolume': { $gte: requiredVolume }
  }).sort({ utilizationPercentage: 1, pickingPriority: -1 });
};

warehouseLocationSchema.statics.getLocationsByZone = function(warehouseId, zone) {
  return this.find({
    warehouse: warehouseId,
    zone: zone,
    isActive: true
  }).sort({ aisle: 1, rack: 1, shelf: 1, bin: 1 });
};

warehouseLocationSchema.statics.getDueCycleCounts = function(warehouseId) {
  return this.find({
    warehouse: warehouseId,
    nextCycleCount: { $lte: new Date() },
    isActive: true
  }).sort({ nextCycleCount: 1 });
};

warehouseLocationSchema.statics.getUtilizationReport = function(warehouseId) {
  return this.aggregate([
    { $match: { warehouse: mongoose.Types.ObjectId(warehouseId), isActive: true } },
    {
      $group: {
        _id: '$zone',
        totalLocations: { $sum: 1 },
        activeLocations: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        fullLocations: {
          $sum: { $cond: [{ $eq: ['$status', 'full'] }, 1, 0] }
        },
        totalCapacity: { $sum: '$capacity.maxItems' },
        totalUtilization: { $sum: '$currentUtilization.currentItems' }
      }
    },
    {
      $project: {
        zone: '$_id',
        totalLocations: 1,
        activeLocations: 1,
        fullLocations: 1,
        totalCapacity: 1,
        totalUtilization: 1,
        utilizationPercentage: {
          $multiply: [
            { $divide: ['$totalUtilization', '$totalCapacity'] },
            100
          ]
        }
      }
    },
    { $sort: { zone: 1 } }
  ]);
};

module.exports = mongoose.model('WarehouseLocation', warehouseLocationSchema);
