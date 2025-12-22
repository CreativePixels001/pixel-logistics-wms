/**
 * Fleet Vehicle Model
 * Mongoose schema for fleet management
 */

const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'tire_change', 'oil_change', 'brake_service', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  mileage: Number,
  vendor: String,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  completedDate: Date,
  notes: String
}, { _id: true });

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Basic Information
  type: {
    type: String,
    enum: ['semi_truck', 'box_truck', 'flatbed', 'refrigerated', 'tanker', 'cargo_van', 'other'],
    required: [true, 'Vehicle type is required']
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  
  // Specifications
  capacity: {
    weight: {
      type: Number, // in pounds
      required: true
    },
    volume: Number, // in cubic feet
    unit: {
      type: String,
      enum: ['lbs', 'kg', 'tons'],
      default: 'lbs'
    }
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'gasoline', 'electric', 'hybrid', 'cng'],
    default: 'diesel'
  },
  
  // Current Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'out_of_service', 'retired'],
    default: 'active',
    required: true
  },
  
  // Assignment
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  homeBase: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  // Utilization Metrics
  utilization: {
    currentRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalMiles: {
      type: Number,
      default: 0
    },
    loadedMiles: {
      type: Number,
      default: 0
    },
    emptyMiles: {
      type: Number,
      default: 0
    },
    hoursInService: {
      type: Number,
      default: 0
    }
  },
  
  // Maintenance
  maintenance: {
    lastServiceDate: Date,
    lastServiceMileage: Number,
    nextServiceDate: Date,
    nextServiceMileage: Number,
    totalMaintenanceCost: {
      type: Number,
      default: 0
    },
    records: [maintenanceRecordSchema]
  },
  
  // Insurance & Registration
  insurance: {
    provider: String,
    policyNumber: String,
    expirationDate: Date,
    coverage: Number
  },
  registration: {
    state: String,
    expirationDate: Date,
    registrationNumber: String
  },
  
  // Inspection & Compliance
  inspection: {
    lastDOTInspection: Date,
    lastSafetyInspection: Date,
    nextInspectionDue: Date,
    complianceScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Financial
  acquisition: {
    date: Date,
    cost: Number,
    method: {
      type: String,
      enum: ['purchase', 'lease', 'rental']
    }
  },
  currentValue: Number,
  
  // Notes & Metadata
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
vehicleSchema.index({ vehicleId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ currentDriver: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ 'maintenance.nextServiceDate': 1 });

// Virtual for utilization percentage
vehicleSchema.virtual('utilizationPercentage').get(function() {
  if (this.utilization.totalMiles === 0) return 0;
  return Math.round((this.utilization.loadedMiles / this.utilization.totalMiles) * 100);
});

// Method to add maintenance record
vehicleSchema.methods.addMaintenanceRecord = function(record) {
  this.maintenance.records.push(record);
  this.maintenance.totalMaintenanceCost += record.cost;
  this.maintenance.lastServiceDate = record.date;
  this.maintenance.lastServiceMileage = record.mileage || this.utilization.totalMiles;
  return this.save();
};

// Method to update utilization
vehicleSchema.methods.updateUtilization = function(miles, loaded = true) {
  this.utilization.totalMiles += miles;
  if (loaded) {
    this.utilization.loadedMiles += miles;
  } else {
    this.utilization.emptyMiles += miles;
  }
  this.utilization.currentRate = this.utilizationPercentage;
  return this.save();
};

// Static method to get fleet statistics
vehicleSchema.statics.getFleetStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        activeVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
        },
        avgUtilization: { $avg: '$utilization.currentRate' },
        totalMiles: { $sum: '$utilization.totalMiles' },
        totalMaintenanceCost: { $sum: '$maintenance.totalMaintenanceCost' }
      }
    }
  ]);

  return stats[0] || {
    totalVehicles: 0,
    activeVehicles: 0,
    inMaintenance: 0,
    avgUtilization: 0,
    totalMiles: 0,
    totalMaintenanceCost: 0
  };
};

// Static method to get vehicles needing maintenance
vehicleSchema.statics.getMaintenanceDue = async function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    'maintenance.nextServiceDate': { $lte: futureDate },
    status: { $ne: 'retired' }
  }).sort({ 'maintenance.nextServiceDate': 1 });
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
