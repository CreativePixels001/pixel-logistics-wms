const mongoose = require('mongoose');

const performanceMetricsSchema = new mongoose.Schema({
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  totalShipments: { type: Number, default: 0 },
  onTimeDeliveries: { type: Number, default: 0 },
  lateDeliveries: { type: Number, default: 0 },
  averageDelay: { type: Number, default: 0 }, // in hours
  cancelledShipments: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 }
}, { _id: false });

const carrierSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Carrier name is required'],
    trim: true,
    index: true
  },
  
  // DOT & MC Numbers (Required for US carriers)
  dotNumber: {
    type: String,
    required: [true, 'DOT number is required'],
    unique: true,
    trim: true,
    index: true
  },
  mcNumber: {
    type: String,
    trim: true,
    index: true
  },
  
  // Contact Information
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    }
  },
  
  // Business Details
  businessType: {
    type: String,
    enum: ['carrier', 'broker', 'freight_forwarder', '3pl'],
    default: 'carrier'
  },
  serviceTypes: [{
    type: String,
    enum: ['ltl', 'ftl', 'parcel', 'expedited', 'refrigerated', 'hazmat', 'flatbed', 'intermodal']
  }],
  operatingRegions: [{
    type: String,
    enum: ['local', 'regional', 'national', 'international']
  }],
  
  // Fleet Information
  fleet: {
    totalVehicles: { type: Number, default: 0 },
    tractors: { type: Number, default: 0 },
    trailers: { type: Number, default: 0 },
    drivers: { type: Number, default: 0 }
  },
  
  // Insurance Information
  insurance: {
    cargoInsurance: {
      provider: String,
      policyNumber: String,
      coverage: Number,
      expirationDate: Date
    },
    liabilityInsurance: {
      provider: String,
      policyNumber: String,
      coverage: Number,
      expirationDate: Date
    }
  },
  
  // Performance Metrics
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  onTimePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalShipments: {
    type: Number,
    default: 0
  },
  completedShipments: {
    type: Number,
    default: 0
  },
  
  // Monthly Performance History
  performanceHistory: [performanceMetricsSchema],
  
  // Pricing
  pricing: {
    baseRatePerMile: Number,
    fuelSurchargePercent: { type: Number, default: 0 },
    minimumCharge: Number,
    currency: { type: String, default: 'USD' }
  },
  
  // Compliance & Certifications
  certifications: [{
    name: String,
    number: String,
    issuedBy: String,
    issuedDate: Date,
    expirationDate: Date,
    document: String // URL to document
  }],
  
  safetyRating: {
    type: String,
    enum: ['satisfactory', 'conditional', 'unsatisfactory', 'not_rated'],
    default: 'not_rated'
  },
  
  // Status & Availability
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_approval'],
    default: 'pending_approval',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  
  // Contract Information
  contractStartDate: Date,
  contractEndDate: Date,
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'cod'],
    default: 'net_30'
  },
  
  // Notes & Special Instructions
  notes: String,
  specialRequirements: [String],
  
  // System Fields
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
carrierSchema.index({ status: 1, onTimePercentage: -1 });
carrierSchema.index({ rating: -1 });
carrierSchema.index({ isPreferred: 1, status: 1 });

// Virtual for formatted DOT number
carrierSchema.virtual('formattedDotNumber').get(function() {
  return `DOT-${this.dotNumber}`;
});

// Virtual for overall performance score (0-100)
carrierSchema.virtual('performanceScore').get(function() {
  const ratingScore = (this.rating / 5) * 40; // 40 points max
  const onTimeScore = (this.onTimePercentage / 100) * 40; // 40 points max
  const experienceScore = Math.min(20, (this.totalShipments / 100) * 20); // 20 points max
  
  return Math.round(ratingScore + onTimeScore + experienceScore);
});

// Method to add rating
carrierSchema.methods.addRating = function(newRating) {
  const totalRatings = this.totalRatings || 0;
  const currentRating = this.rating || 0;
  
  this.totalRatings = totalRatings + 1;
  this.rating = ((currentRating * totalRatings) + newRating) / this.totalRatings;
  
  return this.save();
};

// Method to update performance metrics
carrierSchema.methods.updatePerformance = function(shipmentData) {
  // Update overall stats
  this.totalShipments = (this.totalShipments || 0) + 1;
  
  if (shipmentData.status === 'delivered') {
    this.completedShipments = (this.completedShipments || 0) + 1;
    
    // Calculate on-time percentage
    const onTimeDeliveries = shipmentData.isOnTime 
      ? (this.onTimePercentage * (this.completedShipments - 1) / 100) + 1
      : (this.onTimePercentage * (this.completedShipments - 1) / 100);
    
    this.onTimePercentage = (onTimeDeliveries / this.completedShipments) * 100;
  }
  
  // Update monthly performance
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  let monthlyMetrics = this.performanceHistory.find(
    m => m.month === currentMonth && m.year === currentYear
  );
  
  if (!monthlyMetrics) {
    monthlyMetrics = {
      month: currentMonth,
      year: currentYear,
      totalShipments: 0,
      onTimeDeliveries: 0,
      lateDeliveries: 0,
      averageDelay: 0,
      cancelledShipments: 0,
      totalRevenue: 0
    };
    this.performanceHistory.push(monthlyMetrics);
  }
  
  monthlyMetrics.totalShipments += 1;
  
  if (shipmentData.status === 'delivered') {
    if (shipmentData.isOnTime) {
      monthlyMetrics.onTimeDeliveries += 1;
    } else {
      monthlyMetrics.lateDeliveries += 1;
      if (shipmentData.delayHours) {
        monthlyMetrics.averageDelay = 
          ((monthlyMetrics.averageDelay * (monthlyMetrics.lateDeliveries - 1)) + shipmentData.delayHours) 
          / monthlyMetrics.lateDeliveries;
      }
    }
  }
  
  if (shipmentData.status === 'cancelled') {
    monthlyMetrics.cancelledShipments += 1;
  }
  
  if (shipmentData.cost) {
    monthlyMetrics.totalRevenue += shipmentData.cost;
  }
  
  return this.save();
};

// Static method to get top carriers
carrierSchema.statics.getTopCarriers = function(limit = 10) {
  return this.find({ 
    status: 'active',
    totalShipments: { $gte: 5 } // Minimum shipments to be ranked
  })
    .sort({ 
      onTimePercentage: -1, 
      rating: -1,
      totalShipments: -1
    })
    .limit(limit)
    .select('name dotNumber mcNumber rating onTimePercentage totalShipments completedShipments');
};

// Static method to search carriers by service type
carrierSchema.statics.findByServiceType = function(serviceType, region = null) {
  const query = {
    status: 'active',
    serviceTypes: serviceType
  };
  
  if (region) {
    query.operatingRegions = region;
  }
  
  return this.find(query)
    .sort({ rating: -1, onTimePercentage: -1 });
};

// Pre-save middleware to validate insurance
carrierSchema.pre('save', function(next) {
  const now = new Date();
  
  // Check insurance expiration
  if (this.insurance?.cargoInsurance?.expirationDate) {
    if (this.insurance.cargoInsurance.expirationDate < now) {
      this.status = 'suspended';
    }
  }
  
  if (this.insurance?.liabilityInsurance?.expirationDate) {
    if (this.insurance.liabilityInsurance.expirationDate < now) {
      this.status = 'suspended';
    }
  }
  
  next();
});

const Carrier = mongoose.model('Carrier', carrierSchema);

module.exports = Carrier;
