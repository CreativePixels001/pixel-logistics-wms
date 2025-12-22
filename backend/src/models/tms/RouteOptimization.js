/**
 * Route Optimization Model
 * MongoDB schema for route planning and optimization
 */

const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  sequence: Number,
  stopDuration: Number, // minutes
  arrivalTime: Date,
  departureTime: Date
});

const segmentSchema = new mongoose.Schema({
  from: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  to: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  distance: {
    miles: Number,
    kilometers: Number
  },
  duration: {
    hours: Number,
    minutes: Number
  },
  order: Number
});

const routeOptimizationSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: true,
    unique: true
  },
  origin: {
    name: {
      type: String,
      required: true
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  destination: {
    name: {
      type: String,
      required: true
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  waypoints: [waypointSchema],
  segments: [segmentSchema],
  totalDistance: {
    miles: {
      type: Number,
      required: true
    },
    kilometers: Number
  },
  estimatedDuration: {
    hours: Number,
    minutes: Number,
    totalMinutes: Number
  },
  optimization: {
    method: {
      type: String,
      enum: ['distance', 'time', 'cost', 'fuel'],
      default: 'distance'
    },
    algorithm: {
      type: String,
      default: 'greedy'
    },
    savingsVsUnoptimized: String
  },
  costEstimate: {
    fuelCost: Number,
    laborCost: Number,
    tollCost: Number,
    maintenanceCost: Number,
    overheadCost: Number,
    totalCost: Number,
    costPerMile: Number,
    recommendedRate: Number
  },
  vehicleType: {
    type: String,
    enum: ['standard', 'reefer', 'flatbed', 'box-truck', 'tanker'],
    default: 'standard'
  },
  trafficConsiderations: {
    avoidTolls: Boolean,
    avoidHighways: Boolean,
    preferredTime: String
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  assignedDriver: {
    id: String,
    name: String
  },
  assignedVehicle: {
    id: String,
    vehicleNumber: String
  },
  shipmentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  }],
  actualDistance: {
    miles: Number,
    kilometers: Number
  },
  actualDuration: {
    hours: Number,
    minutes: Number
  },
  variance: {
    distanceVariance: Number, // percentage
    timeVariance: Number // percentage
  },
  notes: String,
  tags: [String],
  createdBy: {
    id: String,
    name: String
  },
  updatedBy: {
    id: String,
    name: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
routeOptimizationSchema.index({ routeNumber: 1 });
routeOptimizationSchema.index({ status: 1 });
routeOptimizationSchema.index({ 'origin.city': 1, 'destination.city': 1 });
routeOptimizationSchema.index({ createdAt: -1 });

// Virtual for route name
routeOptimizationSchema.virtual('routeName').get(function() {
  return `${this.origin.name} → ${this.destination.name}`;
});

// Method to calculate efficiency score
routeOptimizationSchema.methods.calculateEfficiency = function() {
  if (!this.actualDistance || !this.totalDistance) {
    return null;
  }
  
  const distanceEfficiency = (this.totalDistance.miles / this.actualDistance.miles) * 100;
  const timeEfficiency = this.actualDuration ? 
    (this.estimatedDuration.totalMinutes / (this.actualDuration.hours * 60 + this.actualDuration.minutes)) * 100 : 
    null;
  
  return {
    distance: Math.round(distanceEfficiency * 100) / 100,
    time: timeEfficiency ? Math.round(timeEfficiency * 100) / 100 : null
  };
};

// Static method to find routes by region
routeOptimizationSchema.statics.findByRegion = function(state) {
  return this.find({
    $or: [
      { 'origin.state': state },
      { 'destination.state': state }
    ]
  });
};

// Pre-save middleware to generate route number if not provided
routeOptimizationSchema.pre('save', async function(next) {
  if (!this.routeNumber) {
    const count = await this.constructor.countDocuments();
    this.routeNumber = `ROUTE-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate kilometers if not provided
  if (this.totalDistance && this.totalDistance.miles && !this.totalDistance.kilometers) {
    this.totalDistance.kilometers = Math.round(this.totalDistance.miles * 1.60934 * 100) / 100;
  }
  
  next();
});

const RouteOptimization = mongoose.model('RouteOptimization', routeOptimizationSchema);

module.exports = RouteOptimization;
