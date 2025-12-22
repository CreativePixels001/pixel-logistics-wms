const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseId: {
    type: String,
    unique: true,
    // Auto-generated: WH000001, WH000002, etc.
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['main', 'regional', 'distribution', 'transit', 'cold-storage', 'hazmat'],
    default: 'main'
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    landmark: String,
    fullAddress: String
  },
  contact: {
    managerName: String,
    phone: String,
    email: String,
    alternatePhone: String
  },
  capacity: {
    totalArea: Number, // in sq ft
    usableArea: Number,
    storageCapacity: Number, // in units
    utilizationPercentage: Number
  },
  zones: [{
    zoneName: String,
    zoneCode: String,
    type: {
      type: String,
      enum: ['storage', 'receiving', 'shipping', 'quarantine', 'returns']
    },
    aisles: [{
      aisleCode: String,
      racks: [{
        rackCode: String,
        shelves: [{
          shelfCode: String,
          bins: [String]
        }]
      }]
    }]
  }],
  facilities: {
    coldStorage: Boolean,
    hazmatHandling: Boolean,
    securitySystem: Boolean,
    fireSupression: Boolean,
    loadingDocks: Number,
    forklifts: Number,
    palletsRacks: Number
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },
  gstNumber: String,
  panNumber: String,
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

// Auto-generate warehouseId
warehouseSchema.pre('save', async function(next) {
  if (!this.warehouseId) {
    const count = await this.constructor.countDocuments();
    this.warehouseId = `WH${String(count + 1).padStart(6, '0')}`;
  }
  
  // Generate full address
  if (this.address.street || this.address.city) {
    const parts = [
      this.address.street,
      this.address.landmark,
      this.address.city,
      this.address.state,
      this.address.pincode,
      this.address.country
    ].filter(p => p);
    this.address.fullAddress = parts.join(', ');
  }
  
  next();
});

// Indexes
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ status: 1 });
warehouseSchema.index({ type: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
