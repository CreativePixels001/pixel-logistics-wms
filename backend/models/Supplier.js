const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    unique: true,
    // Auto-generated: SUP000001, SUP000002, etc.
  },
  code: {
    type: String,
    required: [true, 'Supplier code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['manufacturer', 'wholesaler', 'distributor', 'importer', 'other'],
    default: 'wholesaler'
  },
  contact: {
    primaryContact: String,
    phone: String,
    email: {
      type: String,
      lowercase: true
    },
    alternatePhone: String,
    alternateEmail: String
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
    fullAddress: String
  },
  businessInfo: {
    gstNumber: String,
    panNumber: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    website: String
  },
  paymentTerms: {
    creditDays: {
      type: Number,
      default: 30
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'credit'],
      default: 'bank-transfer'
    },
    advancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  rating: {
    overallRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    qualityRating: Number,
    deliveryRating: Number,
    priceRating: Number,
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  performance: {
    totalOrders: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    onTimeDeliveries: {
      type: Number,
      default: 0
    },
    rejectedItems: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'pending-approval'],
    default: 'active'
  },
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

// Auto-generate supplierId
supplierSchema.pre('save', async function(next) {
  if (!this.supplierId) {
    const count = await this.constructor.countDocuments();
    this.supplierId = `SUP${String(count + 1).padStart(6, '0')}`;
  }
  
  // Generate full address
  if (this.address.street || this.address.city) {
    const parts = [
      this.address.street,
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
supplierSchema.index({ code: 1 });
supplierSchema.index({ name: 'text' });
supplierSchema.index({ status: 1 });
supplierSchema.index({ category: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
