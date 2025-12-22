const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    unique: true,
    // Auto-generated: INV000001, INV000002, etc.
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required'],
    index: true
  },
  location: {
    zone: String,
    aisle: String,
    rack: String,
    shelf: String,
    bin: String,
    fullLocation: String // Auto-generated: ZONE-A-R01-S03-B05
  },
  quantity: {
    available: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    allocated: {
      type: Number,
      default: 0,
      min: 0
    },
    damaged: {
      type: Number,
      default: 0,
      min: 0
    },
    onHold: {
      type: Number,
      default: 0,
      min: 0
    },
    inTransit: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  lotInfo: {
    lotNumber: String,
    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: Date,
    shelfLife: Number, // in days
    daysToExpiry: Number
  },
  serialNumbers: [{
    serialNumber: String,
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'damaged', 'returned'],
      default: 'available'
    },
    assignedTo: String,
    assignedDate: Date
  }],
  valuation: {
    costPerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    valuationMethod: {
      type: String,
      enum: ['FIFO', 'LIFO', 'WAC', 'Standard'],
      default: 'FIFO'
    },
    totalValue: Number,
    lastUpdated: Date
  },
  lastMovement: {
    type: {
      type: String,
      enum: ['receipt', 'sale', 'transfer', 'adjustment', 'return', 'damage', 'cycle-count']
    },
    date: Date,
    quantity: Number,
    reference: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  cycleCount: {
    lastCountDate: Date,
    lastCountedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    countedQuantity: Number,
    variance: Number,
    nextCountDue: Date,
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
      default: 'monthly'
    }
  },
  aging: {
    receivedDate: Date,
    daysInStock: Number,
    agingCategory: {
      type: String,
      enum: ['0-30', '31-60', '61-90', '91-180', '180+'],
      default: '0-30'
    }
  },
  status: {
    type: String,
    enum: ['active', 'low-stock', 'out-of-stock', 'overstocked', 'expired', 'damaged', 'quarantine'],
    default: 'active',
    index: true
  },
  alerts: [{
    type: {
      type: String,
      enum: ['low-stock', 'expiry-warning', 'overstock', 'no-movement', 'variance']
    },
    message: String,
    createdAt: Date,
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
inventorySchema.index({ product: 1, warehouse: 1 });
inventorySchema.index({ product: 1, 'location.fullLocation': 1 });
inventorySchema.index({ 'lotInfo.lotNumber': 1 });
inventorySchema.index({ 'lotInfo.expiryDate': 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'quantity.available': 1 });

// Auto-generate inventoryId
inventorySchema.pre('save', async function(next) {
  if (!this.inventoryId) {
    const count = await this.constructor.countDocuments();
    this.inventoryId = `INV${String(count + 1).padStart(6, '0')}`;
  }
  
  // Generate full location string
  if (this.location.zone || this.location.aisle || this.location.rack || this.location.shelf || this.location.bin) {
    const parts = [
      this.location.zone,
      this.location.aisle,
      this.location.rack,
      this.location.shelf,
      this.location.bin
    ].filter(p => p);
    this.location.fullLocation = parts.join('-');
  }
  
  // Calculate total quantity
  this.quantity.total = 
    this.quantity.available + 
    this.quantity.reserved + 
    this.quantity.allocated + 
    this.quantity.damaged + 
    this.quantity.onHold + 
    this.quantity.inTransit;
  
  // Calculate total value
  if (this.valuation.costPerUnit) {
    this.valuation.totalValue = this.quantity.total * this.valuation.costPerUnit;
    this.valuation.lastUpdated = new Date();
  }
  
  // Calculate days in stock
  if (this.aging.receivedDate) {
    const now = new Date();
    const received = new Date(this.aging.receivedDate);
    this.aging.daysInStock = Math.floor((now - received) / (1000 * 60 * 60 * 24));
    
    // Set aging category
    if (this.aging.daysInStock <= 30) this.aging.agingCategory = '0-30';
    else if (this.aging.daysInStock <= 60) this.aging.agingCategory = '31-60';
    else if (this.aging.daysInStock <= 90) this.aging.agingCategory = '61-90';
    else if (this.aging.daysInStock <= 180) this.aging.agingCategory = '91-180';
    else this.aging.agingCategory = '180+';
  }
  
  // Calculate days to expiry
  if (this.lotInfo.expiryDate) {
    const now = new Date();
    const expiry = new Date(this.lotInfo.expiryDate);
    this.lotInfo.daysToExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  }
  
  next();
});

// Virtual for free stock (available - reserved - allocated)
inventorySchema.virtual('freeStock').get(function() {
  return this.quantity.available - this.quantity.reserved - this.quantity.allocated;
});

// Virtual for blocked stock
inventorySchema.virtual('blockedStock').get(function() {
  return this.quantity.damaged + this.quantity.onHold;
});

// Method to check if stock is low
inventorySchema.methods.isLowStock = async function() {
  const product = await mongoose.model('Product').findById(this.product);
  if (!product) return false;
  return this.quantity.available <= product.inventory.reorderPoint;
};

// Method to check if expired
inventorySchema.methods.isExpired = function() {
  if (!this.lotInfo.expiryDate) return false;
  return new Date() > new Date(this.lotInfo.expiryDate);
};

// Method to check if near expiry (within 30 days)
inventorySchema.methods.isNearExpiry = function() {
  if (!this.lotInfo.expiryDate) return false;
  const daysToExpiry = this.lotInfo.daysToExpiry || 0;
  return daysToExpiry > 0 && daysToExpiry <= 30;
};

// Static method to get inventory by product
inventorySchema.statics.getByProduct = async function(productId) {
  return this.find({ product: productId })
    .populate('product', 'name sku')
    .populate('warehouse', 'name code')
    .sort({ 'quantity.available': -1 });
};

// Static method to get inventory by warehouse
inventorySchema.statics.getByWarehouse = async function(warehouseId) {
  return this.find({ warehouse: warehouseId })
    .populate('product', 'name sku category')
    .populate('warehouse', 'name code')
    .sort({ 'location.fullLocation': 1 });
};

// Static method to get low stock items
inventorySchema.statics.getLowStock = async function() {
  const inventory = await this.find({ status: 'low-stock' })
    .populate('product', 'name sku inventory.reorderPoint inventory.reorderQuantity')
    .populate('warehouse', 'name code');
  return inventory;
};

// Static method to get expiring items
inventorySchema.statics.getExpiring = async function(days = 30) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  return this.find({
    'lotInfo.expiryDate': { 
      $lte: targetDate,
      $gte: new Date()
    }
  })
  .populate('product', 'name sku')
  .populate('warehouse', 'name code')
  .sort({ 'lotInfo.expiryDate': 1 });
};

// Static method to get aging report
inventorySchema.statics.getAgingReport = async function(warehouseId = null) {
  const match = warehouseId ? { warehouse: mongoose.Types.ObjectId(warehouseId) } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$aging.agingCategory',
        totalQuantity: { $sum: '$quantity.total' },
        totalValue: { $sum: '$valuation.totalValue' },
        itemCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get inventory valuation
inventorySchema.statics.getValuation = async function(warehouseId = null) {
  const match = warehouseId ? { warehouse: mongoose.Types.ObjectId(warehouseId) } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$warehouse',
        totalQuantity: { $sum: '$quantity.total' },
        totalValue: { $sum: '$valuation.totalValue' },
        averageCost: { $avg: '$valuation.costPerUnit' }
      }
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: '_id',
        foreignField: '_id',
        as: 'warehouseInfo'
      }
    }
  ]);
};

module.exports = mongoose.model('Inventory', inventorySchema);
