const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['created', 'picked_up', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered', 'delayed', 'cancelled']
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Origin Information
  origin: {
    name: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    contactName: String,
    contactPhone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Destination Information
  destination: {
    name: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    contactName: String,
    contactPhone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Carrier Information
  carrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true
  },
  carrierName: String, // Denormalized for quick access
  
  // Shipment Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'delayed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Dates & Times
  pickupDate: {
    type: Date,
    required: true
  },
  scheduledDeliveryDate: {
    type: Date,
    required: true
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  // Progress
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Freight Details
  freight: {
    type: {
      type: String,
      enum: ['ltl', 'ftl', 'parcel', 'expedited', 'refrigerated', 'hazmat'],
      default: 'ltl'
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'lbs' }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'in' }
    },
    quantity: {
      type: Number,
      default: 1
    },
    description: String,
    declaredValue: Number
  },
  
  // Route Information
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  distance: {
    value: Number,
    unit: { type: String, default: 'miles' }
  },
  estimatedDuration: {
    value: Number,
    unit: { type: String, default: 'hours' }
  },
  
  // Cost Information
  cost: {
    baseCost: { type: Number, required: true },
    fuelSurcharge: { type: Number, default: 0 },
    accessorialCharges: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalCost: Number,
    currency: { type: String, default: 'USD' }
  },
  
  // Tracking
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  trackingEvents: [trackingEventSchema],
  currentLocation: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    lastUpdated: Date
  },
  
  // Additional Information
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  temperature: {
    required: Boolean,
    min: Number,
    max: Number,
    unit: { type: String, default: 'F' }
  },
  specialInstructions: String,
  proofOfDelivery: {
    signature: String,
    signedBy: String,
    timestamp: Date,
    photo: String
  },
  
  // References
  referenceNumbers: {
    purchaseOrder: String,
    billOfLading: String,
    customerReference: String,
    proNumber: String
  },
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes for performance
shipmentSchema.index({ status: 1, pickupDate: -1 });
shipmentSchema.index({ carrier: 1, status: 1 });
shipmentSchema.index({ 'origin.city': 1, 'destination.city': 1 });
shipmentSchema.index({ createdAt: -1 });

// Virtual for formatted shipment ID
shipmentSchema.virtual('formattedId').get(function() {
  return `#${this.shipmentId}`;
});

// Virtual for delivery status
shipmentSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'delivered';
  if (this.status === 'cancelled') return 'cancelled';
  if (this.actualDeliveryDate) return 'delivered';
  
  const now = new Date();
  const eta = this.estimatedDeliveryDate || this.scheduledDeliveryDate;
  
  if (eta < now) return 'delayed';
  if (this.status === 'in_transit') return 'on_track';
  return 'pending';
});

// Pre-save middleware to calculate total cost
shipmentSchema.pre('save', function(next) {
  if (this.cost && this.cost.baseCost !== undefined) {
    this.cost.totalCost = 
      (this.cost.baseCost || 0) + 
      (this.cost.fuelSurcharge || 0) + 
      (this.cost.accessorialCharges || 0) + 
      (this.cost.taxes || 0);
  }
  
  // Auto-generate shipment ID if not provided
  if (!this.shipmentId) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.shipmentId = `SH-${year}-${random}`;
  }
  
  next();
});

// Method to add tracking event
shipmentSchema.methods.addTrackingEvent = function(eventData) {
  this.trackingEvents.push(eventData);
  
  // Update current location if provided
  if (eventData.location) {
    this.currentLocation = {
      ...eventData.location,
      lastUpdated: eventData.timestamp || new Date()
    };
  }
  
  // Update status if provided
  if (eventData.status) {
    this.status = eventData.status;
  }
  
  return this.save();
};

// Method to update progress
shipmentSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  
  // Auto-update status based on progress
  if (progress === 100 && this.status !== 'delivered') {
    this.status = 'delivered';
    this.actualDeliveryDate = new Date();
  } else if (progress > 0 && progress < 100 && this.status === 'pending') {
    this.status = 'in_transit';
  }
  
  return this.save();
};

// Static method to get active shipments with filters
shipmentSchema.statics.getActiveShipments = function(filters = {}) {
  const query = { isActive: true };
  
  if (filters.status) query.status = filters.status;
  if (filters.carrier) query.carrier = filters.carrier;
  if (filters.priority) query.priority = filters.priority;
  
  if (filters.startDate || filters.endDate) {
    query.pickupDate = {};
    if (filters.startDate) query.pickupDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.pickupDate.$lte = new Date(filters.endDate);
  }
  
  return this.find(query)
    .populate('carrier', 'name dotNumber onTimePercentage rating')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get dashboard stats
shipmentSchema.statics.getDashboardStats = async function() {
  const activeShipments = await this.countDocuments({ 
    isActive: true, 
    status: { $in: ['picked_up', 'in_transit', 'pending'] } 
  });
  
  const deliveredThisMonth = await this.countDocuments({
    status: 'delivered',
    actualDeliveryDate: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });
  
  const onTimeDeliveries = await this.countDocuments({
    status: 'delivered',
    actualDeliveryDate: { $lte: mongoose.model('Shipment').estimatedDeliveryDate }
  });
  
  const totalCost = await this.aggregate([
    {
      $match: {
        status: { $in: ['picked_up', 'in_transit', 'delivered'] },
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$cost.totalCost' }
      }
    }
  ]);
  
  return {
    activeShipments,
    deliveredThisMonth,
    onTimePercentage: deliveredThisMonth > 0 
      ? ((onTimeDeliveries / deliveredThisMonth) * 100).toFixed(1) 
      : 0,
    totalCost: totalCost[0]?.total || 0
  };
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
