const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  sequence: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['origin', 'destination', 'stop', 'fuel', 'rest'],
    required: true
  },
  location: {
    name: String,
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
  estimatedArrival: Date,
  actualArrival: Date,
  estimatedDeparture: Date,
  actualDeparture: Date,
  distanceFromPrevious: Number, // miles
  durationFromPrevious: Number, // minutes
  status: {
    type: String,
    enum: ['pending', 'arrived', 'departed', 'skipped'],
    default: 'pending'
  },
  notes: String
}, { _id: false });

const routeSchema = new mongoose.Schema({
  // Route Identification
  routeId: {
    type: String,
    unique: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Associated Shipments
  shipments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  }],
  
  // Carrier Assignment
  carrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    index: true
  },
  
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming drivers are users
  },
  
  vehicle: {
    vehicleId: String,
    type: {
      type: String,
      enum: ['truck', 'van', 'trailer', 'flatbed', 'refrigerated']
    },
    licensePlate: String,
    capacity: Number // in pounds or cubic feet
  },
  
  // Route Details
  waypoints: [waypointSchema],
  
  // Distance & Time
  totalDistance: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: 'miles' }
  },
  
  totalDuration: {
    value: { type: Number, default: 0 },
    unit: { type: String, default: 'hours' }
  },
  
  // Schedule
  scheduledStartTime: Date,
  actualStartTime: Date,
  scheduledEndTime: Date,
  actualEndTime: Date,
  estimatedEndTime: Date,
  
  // Status
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'delayed'],
    default: 'planned',
    index: true
  },
  
  currentWaypointIndex: {
    type: Number,
    default: 0
  },
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Optimization Details
  isOptimized: {
    type: Boolean,
    default: false
  },
  
  optimizationStrategy: {
    type: String,
    enum: ['shortest_distance', 'fastest_time', 'fuel_efficient', 'multi_stop', 'traffic_aware'],
    default: 'fastest_time'
  },
  
  optimizationSavings: {
    distanceSaved: { type: Number, default: 0 }, // miles
    timeSaved: { type: Number, default: 0 }, // hours
    costSaved: { type: Number, default: 0 } // dollars
  },
  
  // Cost Breakdown
  cost: {
    baseCost: { type: Number, default: 0 },
    fuelCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    tollCost: { type: Number, default: 0 },
    otherCosts: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Fuel Consumption
  fuelConsumption: {
    estimatedGallons: Number,
    actualGallons: Number,
    averageMPG: Number,
    fuelType: {
      type: String,
      enum: ['diesel', 'gasoline', 'electric', 'hybrid']
    }
  },
  
  // Traffic & Weather
  trafficConditions: {
    type: String,
    enum: ['light', 'moderate', 'heavy', 'severe'],
    default: 'moderate'
  },
  
  weatherConditions: {
    type: String,
    enum: ['clear', 'rain', 'snow', 'fog', 'storm'],
    default: 'clear'
  },
  
  delays: [{
    reason: String,
    location: String,
    duration: Number, // minutes
    timestamp: Date
  }],
  
  // Special Requirements
  requiresRefrigeration: {
    type: Boolean,
    default: false
  },
  
  requiresHazmatCertification: {
    type: Boolean,
    default: false
  },
  
  specialInstructions: String,
  
  // Notes & Communication
  notes: String,
  
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
routeSchema.index({ status: 1, scheduledStartTime: -1 });
routeSchema.index({ carrier: 1, status: 1 });
routeSchema.index({ driver: 1, status: 1 });
routeSchema.index({ createdAt: -1 });

// Virtual for formatted route ID
routeSchema.virtual('formattedId').get(function() {
  return `#${this.routeId}`;
});

// Virtual for completion status
routeSchema.virtual('completionStatus').get(function() {
  if (this.status === 'completed') {
    const onTime = this.actualEndTime <= this.scheduledEndTime;
    return onTime ? 'completed_on_time' : 'completed_late';
  }
  
  if (this.status === 'cancelled') {
    return 'cancelled';
  }
  
  if (this.status === 'in_progress') {
    const now = new Date();
    if (this.estimatedEndTime && now > this.estimatedEndTime) {
      return 'running_late';
    }
    return 'on_track';
  }
  
  return 'pending';
});

// Virtual for current waypoint
routeSchema.virtual('currentWaypoint').get(function() {
  if (this.waypoints && this.currentWaypointIndex < this.waypoints.length) {
    return this.waypoints[this.currentWaypointIndex];
  }
  return null;
});

// Pre-save middleware to auto-generate route ID
routeSchema.pre('save', function(next) {
  if (!this.routeId) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.routeId = `RT-${year}-${random}`;
  }
  
  // Calculate total cost
  if (this.cost) {
    this.cost.totalCost = 
      (this.cost.baseCost || 0) + 
      (this.cost.fuelCost || 0) + 
      (this.cost.laborCost || 0) + 
      (this.cost.tollCost || 0) + 
      (this.cost.otherCosts || 0);
  }
  
  next();
});

// Method to add waypoint
routeSchema.methods.addWaypoint = function(waypointData) {
  const sequence = this.waypoints.length + 1;
  this.waypoints.push({
    ...waypointData,
    sequence
  });
  
  return this.save();
};

// Method to update waypoint status
routeSchema.methods.updateWaypointStatus = function(sequence, status, actualTime) {
  const waypoint = this.waypoints.find(w => w.sequence === sequence);
  
  if (!waypoint) {
    throw new Error('Waypoint not found');
  }
  
  waypoint.status = status;
  
  if (status === 'arrived') {
    waypoint.actualArrival = actualTime || new Date();
  } else if (status === 'departed') {
    waypoint.actualDeparture = actualTime || new Date();
    
    // Move to next waypoint
    if (sequence === this.currentWaypointIndex + 1) {
      this.currentWaypointIndex = sequence;
      
      // Calculate progress
      this.progress = Math.round((sequence / this.waypoints.length) * 100);
      
      // If this was the last waypoint, mark route as completed
      if (sequence === this.waypoints.length) {
        this.status = 'completed';
        this.actualEndTime = actualTime || new Date();
        this.progress = 100;
      }
    }
  }
  
  return this.save();
};

// Method to optimize route
routeSchema.methods.optimizeRoute = function(strategy = 'fastest_time') {
  // This is a placeholder - in production, integrate with Google Maps API
  // or route optimization service
  
  this.isOptimized = true;
  this.optimizationStrategy = strategy;
  
  // Simulate optimization savings
  const currentDistance = this.totalDistance.value;
  const currentTime = this.totalDuration.value;
  
  // Typical optimization saves 10-20% depending on strategy
  let savingsPercent = 0.15;
  
  switch (strategy) {
    case 'shortest_distance':
      savingsPercent = 0.18;
      break;
    case 'fastest_time':
      savingsPercent = 0.15;
      break;
    case 'fuel_efficient':
      savingsPercent = 0.20;
      break;
    case 'multi_stop':
      savingsPercent = 0.12;
      break;
    case 'traffic_aware':
      savingsPercent = 0.10;
      break;
  }
  
  this.optimizationSavings.distanceSaved = currentDistance * savingsPercent;
  this.optimizationSavings.timeSaved = currentTime * savingsPercent;
  this.optimizationSavings.costSaved = (this.cost.totalCost || 0) * savingsPercent;
  
  // Update total distance and time
  this.totalDistance.value = currentDistance * (1 - savingsPercent);
  this.totalDuration.value = currentTime * (1 - savingsPercent);
  
  return this.save();
};

// Method to add delay
routeSchema.methods.addDelay = function(reason, location, duration) {
  this.delays.push({
    reason,
    location,
    duration,
    timestamp: new Date()
  });
  
  // Update estimated end time
  if (this.estimatedEndTime) {
    this.estimatedEndTime = new Date(this.estimatedEndTime.getTime() + (duration * 60000));
  }
  
  // Update status to delayed if not already
  if (this.status === 'in_progress') {
    this.status = 'delayed';
  }
  
  return this.save();
};

// Static method to get active routes
routeSchema.statics.getActiveRoutes = function(filters = {}) {
  const query = {
    status: { $in: ['in_progress', 'delayed'] },
    ...filters
  };
  
  return this.find(query)
    .populate('carrier', 'name dotNumber rating')
    .populate('driver', 'firstName lastName email')
    .populate('shipments', 'shipmentId trackingNumber status')
    .sort({ scheduledStartTime: -1 });
};

// Static method to get route analytics
routeSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRoutes: { $sum: 1 },
        completedRoutes: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalDistance: { $sum: '$totalDistance.value' },
        totalDistanceSaved: { $sum: '$optimizationSavings.distanceSaved' },
        totalTimeSaved: { $sum: '$optimizationSavings.timeSaved' },
        totalCostSaved: { $sum: '$optimizationSavings.costSaved' },
        totalCost: { $sum: '$cost.totalCost' },
        optimizedRoutes: {
          $sum: { $cond: ['$isOptimized', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalRoutes: 1,
        completedRoutes: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedRoutes', '$totalRoutes'] },
            100
          ]
        },
        totalDistance: { $round: ['$totalDistance', 2] },
        totalDistanceSaved: { $round: ['$totalDistanceSaved', 2] },
        totalTimeSaved: { $round: ['$totalTimeSaved', 2] },
        totalCostSaved: { $round: ['$totalCostSaved', 2] },
        totalCost: { $round: ['$totalCost', 2] },
        optimizedRoutes: 1,
        optimizationRate: {
          $multiply: [
            { $divide: ['$optimizedRoutes', '$totalRoutes'] },
            100
          ]
        }
      }
    }
  ]);
};

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
