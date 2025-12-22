const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: String,
  attributes: {
    size: String,
    color: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'meter'],
        default: 'cm'
      }
    }
  },
  barcode: String,
  price: {
    cost: Number,
    selling: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  stock: {
    type: Number,
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics',
      'Clothing',
      'Food & Beverage',
      'Pharmaceuticals',
      'Automotive',
      'Furniture',
      'Books',
      'Toys',
      'Sports',
      'Home & Garden',
      'Industrial',
      'Other'
    ]
  },
  subCategory: String,
  brand: String,
  manufacturer: String,
  
  // Inventory Classification
  classification: {
    abc: {
      type: String,
      enum: ['A', 'B', 'C', 'N/A'],
      default: 'N/A'
    },
    velocity: {
      type: String,
      enum: ['fast', 'medium', 'slow', 'N/A'],
      default: 'N/A'
    }
  },

  // Base SKU (if no variants)
  sku: {
    type: String,
    sparse: true,
    uppercase: true
  },
  barcode: String,
  
  // Variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [variantSchema],

  // Pricing
  price: {
    cost: {
      type: Number,
      required: [true, 'Cost price is required']
    },
    selling: {
      type: Number,
      required: [true, 'Selling price is required']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Physical Properties
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'meter'],
      default: 'cm'
    }
  },

  // Storage Requirements
  storage: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['C', 'F'],
        default: 'C'
      }
    },
    humidity: {
      min: Number,
      max: Number
    },
    specialHandling: {
      type: String,
      enum: ['None', 'Fragile', 'Hazardous', 'Perishable', 'Controlled Temperature'],
      default: 'None'
    }
  },

  // Inventory Settings
  inventory: {
    reorderPoint: {
      type: Number,
      default: 10
    },
    reorderQuantity: {
      type: Number,
      default: 50
    },
    minStock: {
      type: Number,
      default: 5
    },
    maxStock: {
      type: Number,
      default: 1000
    },
    trackSerialNumbers: {
      type: Boolean,
      default: false
    },
    trackLotNumbers: {
      type: Boolean,
      default: false
    }
  },

  // Lot/Batch Tracking
  lotTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    expiryTracking: {
      type: Boolean,
      default: false
    },
    shelfLife: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years']
      }
    }
  },

  // Supplier Information
  suppliers: [{
    supplierId: String,
    supplierName: String,
    leadTime: Number, // in days
    moq: Number, // Minimum Order Quantity
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Images
  images: [{
    url: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out-of-stock'],
    default: 'active'
  },

  // Stock Summary (calculated/cached)
  totalStock: {
    type: Number,
    default: 0
  },
  availableStock: {
    type: Number,
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0
  },

  // Metadata
  tags: [String],
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
  timestamps: true
});

// Indexes for performance
productSchema.index({ productId: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'classification.abc': 1 });
productSchema.index({ 'classification.velocity': 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (!this.price.cost || !this.price.selling) return 0;
  return ((this.price.selling - this.price.cost) / this.price.cost * 100).toFixed(2);
});

// Pre-save middleware to generate productId
productSchema.pre('save', async function(next) {
  if (!this.productId) {
    const count = await mongoose.model('Product').countDocuments();
    this.productId = `PRD${String(count + 1).padStart(6, '0')}`;
  }
  
  // If no variants and SKU not set, generate SKU
  if (!this.hasVariants && !this.sku) {
    this.sku = this.productId;
  }
  
  next();
});

// Method to check if product is low on stock
productSchema.methods.isLowStock = function() {
  return this.totalStock <= this.inventory.reorderPoint;
};

// Method to check if reorder needed
productSchema.methods.needsReorder = function() {
  return this.totalStock < this.inventory.minStock;
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    $expr: { $lte: ['$totalStock', '$inventory.reorderPoint'] },
    status: 'active'
  });
};

// Static method for ABC analysis
productSchema.statics.getABCAnalysis = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$classification.abc',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$totalStock', '$price.selling'] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Product', productSchema);
