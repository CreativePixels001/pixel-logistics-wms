/**
 * Driver Model
 * MongoDB schema for driver management
 */

const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  state: String,
  class: { type: String, enum: ['A', 'B', 'C'], required: true },
  endorsements: [String], // H - Hazmat, N - Tank, T - Double/Triple, P - Passenger
  issueDate: Date,
  expiryDate: Date,
  status: { type: String, enum: ['valid', 'expired', 'suspended', 'revoked'], default: 'valid' }
}, { _id: false });

const medicalCertificateSchema = new mongoose.Schema({
  certificateNumber: String,
  issueDate: Date,
  expiryDate: Date,
  examinerName: String,
  restrictions: [String]
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  phone: String,
  email: String
}, { _id: false });

const driverSchema = new mongoose.Schema({
  driverNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  
  dateOfBirth: Date,
  ssn: String, // Encrypted in production
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  
  // Employment
  carrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier'
  },
  
  carrierName: String,
  
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'owner-operator'],
    default: 'full-time'
  },
  
  hireDate: Date,
  terminationDate: Date,
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated', 'on-leave'],
    default: 'active'
  },
  
  // License & Certifications
  license: licenseSchema,
  medicalCertificate: medicalCertificateSchema,
  
  // Experience
  yearsOfExperience: Number,
  totalMilesDriven: { type: Number, default: 0 },
  
  // Current Assignment
  currentVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  currentShipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  },
  
  availabilityStatus: {
    type: String,
    enum: ['available', 'on-duty', 'off-duty', 'sleeper-berth', 'driving'],
    default: 'available'
  },
  
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdate: Date
  },
  
  // Mobile App
  deviceToken: String, // For push notifications
  appVersion: String,
  lastLoginAt: Date,
  
  // Authentication (for mobile app login)
  passwordHash: String,
  refreshToken: String,
  
  // Performance Metrics
  metrics: {
    onTimeDeliveryRate: { type: Number, default: 100 },
    averageRating: { type: Number, default: 5.0 },
    totalDeliveries: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 100 },
    fuelEfficiencyScore: { type: Number, default: 0 }
  },
  
  // Violations & Incidents
  violations: [{
    date: Date,
    type: String,
    description: String,
    location: String,
    severity: { type: String, enum: ['minor', 'major', 'critical'] },
    resolved: { type: Boolean, default: false }
  }],
  
  incidents: [{
    date: Date,
    type: String,
    description: String,
    location: String,
    injuriesReported: { type: Boolean, default: false },
    damageAmount: Number
  }],
  
  // Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Emergency Contact
  emergencyContact: emergencyContactSchema,
  
  // Preferences
  preferences: {
    preferredRoutes: [String],
    maxDrivingHours: { type: Number, default: 11 },
    preferredStartTime: String,
    homeBase: {
      city: String,
      state: String
    }
  },
  
  // Notes
  notes: String,
  
  // Audit
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

// Indexes
driverSchema.index({ driverNumber: 1 });
driverSchema.index({ email: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ carrier: 1 });
driverSchema.index({ availabilityStatus: 1 });

// Virtuals
driverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

driverSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

driverSchema.virtual('licenseExpired').get(function() {
  if (!this.license || !this.license.expiryDate) return false;
  return new Date() > new Date(this.license.expiryDate);
});

driverSchema.virtual('medicalExpired').get(function() {
  if (!this.medicalCertificate || !this.medicalCertificate.expiryDate) return false;
  return new Date() > new Date(this.medicalCertificate.expiryDate);
});

// Pre-save: Generate driver number
driverSchema.pre('save', async function(next) {
  if (!this.driverNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      driverNumber: new RegExp(`^DRV-${year}-`)
    });
    this.driverNumber = `DRV-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Methods

/**
 * Update driver location
 */
driverSchema.methods.updateLocation = function(latitude, longitude, address = null) {
  this.currentLocation = {
    latitude,
    longitude,
    address,
    lastUpdate: new Date()
  };
  return this.save();
};

/**
 * Assign vehicle to driver
 */
driverSchema.methods.assignVehicle = function(vehicleId) {
  this.currentVehicle = vehicleId;
  return this.save();
};

/**
 * Assign shipment to driver
 */
driverSchema.methods.assignShipment = function(shipmentId) {
  this.currentShipment = shipmentId;
  this.availabilityStatus = 'on-duty';
  return this.save();
};

/**
 * Complete delivery
 */
driverSchema.methods.completeDelivery = function() {
  this.currentShipment = null;
  this.availabilityStatus = 'available';
  this.metrics.totalDeliveries += 1;
  return this.save();
};

/**
 * Update performance metrics
 */
driverSchema.methods.updateMetrics = function(metrics) {
  Object.assign(this.metrics, metrics);
  return this.save();
};

/**
 * Check if driver is compliant
 */
driverSchema.methods.isCompliant = function() {
  const licenseValid = this.license && !this.licenseExpired && this.license.status === 'valid';
  const medicalValid = this.medicalCertificate && !this.medicalExpired;
  const statusActive = this.status === 'active';
  
  return licenseValid && medicalValid && statusActive;
};

// Static Methods

/**
 * Find available drivers
 */
driverSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    availabilityStatus: 'available'
  });
};

/**
 * Find drivers by carrier
 */
driverSchema.statics.findByCarrier = function(carrierId) {
  return this.find({ carrier: carrierId, status: { $ne: 'terminated' } });
};

/**
 * Find drivers with expiring licenses
 */
driverSchema.statics.findExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'license.expiryDate': {
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

/**
 * Find drivers with expiring medical certificates
 */
driverSchema.statics.findExpiringMedical = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'medicalCertificate.expiryDate': {
      $gte: new Date(),
      $lte: futureDate
    }
  });
};

/**
 * Get driver statistics
 */
driverSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ status: 'active' });
  const available = await this.countDocuments({ 
    status: 'active', 
    availabilityStatus: 'available' 
  });
  const onDuty = await this.countDocuments({ availabilityStatus: 'on-duty' });
  
  return { total, active, available, onDuty };
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
