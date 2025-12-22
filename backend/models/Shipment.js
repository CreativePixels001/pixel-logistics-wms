const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  // Auto-generated Shipment number
  shipmentNumber: {
    type: String,
    unique: true,
    index: true
  },

  // Sales Order Reference
  salesOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder',
    required: [true, 'Sales Order is required'],
    index: true
  },

  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required'],
    index: true
  },

  // Warehouse (Origin)
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required'],
    index: true
  },

  // Shipment Type
  shipmentType: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'same-day', 'economy', 'return'],
    default: 'standard'
  },

  // Items in Shipment
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    shippedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    batchNumber: String,
    serialNumbers: [String],
    
    // Package tracking
    packageNumber: String,
    boxNumber: String,
    
    // Item status
    status: {
      type: String,
      enum: ['pending', 'packed', 'shipped', 'in-transit', 'delivered', 'returned', 'damaged'],
      default: 'pending'
    }
  }],

  // Shipping Address
  shippingAddress: {
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    postalCode: {
      type: String,
      required: true
    },
    contactPerson: String,
    contactPhone: String,
    fullAddress: String
  },

  // Carrier Information
  carrier: {
    name: {
      type: String,
      enum: ['Blue Dart', 'FedEx', 'DHL', 'DTDC', 'Delhivery', 'Ecom Express', 'India Post', 'Self-Delivery', 'Other'],
      default: 'Blue Dart'
    },
    serviceType: String,
    accountNumber: String,
    contactNumber: String
  },

  // Tracking Information
  trackingNumber: {
    type: String,
    index: true
  },
  awbNumber: String, // Air Waybill Number
  
  // Package Details
  packages: [{
    packageNumber: String,
    boxType: {
      type: String,
      enum: ['small-box', 'medium-box', 'large-box', 'pallet', 'envelope', 'custom']
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm'],
        default: 'cm'
      }
    },
    trackingNumber: String,
    items: [String] // Product IDs in this package
  }],

  // Total Weight & Dimensions
  totalWeight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb'],
      default: 'kg'
    }
  },
  totalPackages: {
    type: Number,
    default: 1
  },

  // Shipping Costs
  shippingCost: {
    baseRate: {
      type: Number,
      min: 0,
      default: 0
    },
    fuelSurcharge: {
      type: Number,
      min: 0,
      default: 0
    },
    insurance: {
      type: Number,
      min: 0,
      default: 0
    },
    cod: {
      type: Number,
      min: 0,
      default: 0
    },
    handlingCharges: {
      type: Number,
      min: 0,
      default: 0
    },
    otherCharges: {
      type: Number,
      min: 0,
      default: 0
    },
    totalCost: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  // Payment Details
  paymentMode: {
    type: String,
    enum: ['prepaid', 'cod', 'credit', 'to-pay'],
    default: 'prepaid'
  },
  codAmount: {
    type: Number,
    min: 0,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'ready-to-ship', 'dispatched', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered', 'failed-delivery', 'returned', 'cancelled'],
    default: 'draft',
    index: true
  },

  // Important Dates
  estimatedPickupDate: Date,
  actualPickupDate: Date,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  dispatchDate: {
    type: Date,
    index: true
  },

  // Delivery Attempts
  deliveryAttempts: [{
    attemptNumber: Number,
    attemptDate: Date,
    attemptedBy: String,
    status: {
      type: String,
      enum: ['successful', 'failed', 'rescheduled']
    },
    reason: String,
    notes: String
  }],

  // Proof of Delivery
  pod: {
    signatureUrl: String,
    photoUrl: String,
    receiverName: String,
    receiverPhone: String,
    receivedDate: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['packing-slip', 'shipping-label', 'invoice', 'manifest', 'custom-declaration', 'pod', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Packing Slip Details
  packingSlip: {
    number: String,
    generatedDate: Date,
    packedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Manifest Details
  manifest: {
    number: String,
    generatedDate: Date,
    includedInManifest: {
      type: Boolean,
      default: false
    }
  },

  // Return Information
  isReturn: {
    type: Boolean,
    default: false
  },
  returnReason: String,
  originalShipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },

  // Special Instructions
  specialInstructions: String,
  deliveryInstructions: String,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Insurance
  insuranceValue: {
    type: Number,
    min: 0,
    default: 0
  },
  isInsured: {
    type: Boolean,
    default: false
  },

  // Signature Required
  signatureRequired: {
    type: Boolean,
    default: false
  },

  // Tracking History
  trackingHistory: [{
    status: String,
    location: String,
    timestamp: Date,
    description: String,
    updatedBy: String
  }],

  // Remarks
  remarks: String,
  internalNotes: String,

  // Processed By
  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveredBy: String, // Carrier's delivery person

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

// Pre-save middleware to generate Shipment number
shipmentSchema.pre('save', async function(next) {
  // Generate Shipment number if not exists
  if (!this.shipmentNumber) {
    const currentYear = new Date().getFullYear();
    const lastShipment = await this.constructor.findOne({
      shipmentNumber: new RegExp(`^SHP-${currentYear}-`)
    }).sort({ shipmentNumber: -1 });

    let nextNumber = 1;
    if (lastShipment && lastShipment.shipmentNumber) {
      const lastNumber = parseInt(lastShipment.shipmentNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    this.shipmentNumber = `SHP-${currentYear}-${String(nextNumber).padStart(6, '0')}`;
  }

  // Generate full address
  if (this.shippingAddress) {
    const addr = this.shippingAddress;
    this.shippingAddress.fullAddress = [
      addr.addressLine1,
      addr.addressLine2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country
    ].filter(Boolean).join(', ');
  }

  // Calculate total shipping cost
  if (this.shippingCost) {
    const cost = this.shippingCost;
    this.shippingCost.totalCost = 
      (cost.baseRate || 0) +
      (cost.fuelSurcharge || 0) +
      (cost.insurance || 0) +
      (cost.cod || 0) +
      (cost.handlingCharges || 0) +
      (cost.otherCharges || 0);
  }

  // Update total packages
  if (this.packages && this.packages.length > 0) {
    this.totalPackages = this.packages.length;
  }

  // Auto-generate packing slip number
  if (!this.packingSlip.number && this.packingSlip.packedBy) {
    this.packingSlip.number = `PS-${this.shipmentNumber}`;
    this.packingSlip.generatedDate = new Date();
  }

  next();
});

// Virtual for total items
shipmentSchema.virtual('totalItems').get(function() {
  return this.items.length;
});

// Virtual for total shipped quantity
shipmentSchema.virtual('totalShippedQuantity').get(function() {
  return this.items.reduce((sum, item) => sum + item.shippedQuantity, 0);
});

// Virtual for delivery status
shipmentSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

// Virtual for is delayed
shipmentSchema.virtual('isDelayed').get(function() {
  if (!this.estimatedDeliveryDate || this.status === 'delivered') return false;
  return new Date() > this.estimatedDeliveryDate;
});

// Method to check if overdue
shipmentSchema.methods.isOverdue = function() {
  if (!this.estimatedDeliveryDate || this.status === 'delivered') return false;
  return new Date() > this.estimatedDeliveryDate;
};

// Method to add tracking update
shipmentSchema.methods.addTrackingUpdate = function(status, location, description, updatedBy = 'System') {
  this.trackingHistory.push({
    status,
    location,
    timestamp: new Date(),
    description,
    updatedBy
  });
};

// Static method to get active shipments
shipmentSchema.statics.getActiveShipments = function() {
  return this.find({
    status: { $in: ['ready-to-ship', 'dispatched', 'picked-up', 'in-transit', 'out-for-delivery'] }
  }).sort({ dispatchDate: -1 });
};

// Static method to get overdue shipments
shipmentSchema.statics.getOverdueShipments = function() {
  return this.find({
    estimatedDeliveryDate: { $lt: new Date() },
    status: { $nin: ['delivered', 'cancelled', 'returned'] }
  }).sort({ estimatedDeliveryDate: 1 });
};

// Static method to get shipments by sales order
shipmentSchema.statics.getBySalesOrder = function(soId) {
  return this.find({ salesOrder: soId }).sort({ dispatchDate: -1 });
};

// Static method to get shipments by customer
shipmentSchema.statics.getByCustomer = function(customerId) {
  return this.find({ customer: customerId }).sort({ dispatchDate: -1 });
};

// Indexes for performance
shipmentSchema.index({ shipmentNumber: 1 });
shipmentSchema.index({ salesOrder: 1 });
shipmentSchema.index({ customer: 1 });
shipmentSchema.index({ warehouse: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ dispatchDate: -1 });
shipmentSchema.index({ estimatedDeliveryDate: 1 });
shipmentSchema.index({ 'carrier.name': 1 });

// Enable virtuals in JSON
shipmentSchema.set('toJSON', { virtuals: true });
shipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
