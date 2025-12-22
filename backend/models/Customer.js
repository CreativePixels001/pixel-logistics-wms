const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    // Auto-generated: CUS000001, CUS000002, etc.
  },
  code: {
    type: String,
    required: [true, 'Customer code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['individual', 'business', 'retailer', 'distributor', 'wholesaler'],
    default: 'individual'
  },
  contact: {
    primaryContact: String,
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      required: true
    },
    alternatePhone: String,
    alternateEmail: String
  },
  billingAddress: {
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
  shippingAddresses: [{
    label: String, // Home, Office, Warehouse, etc.
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    fullAddress: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  businessInfo: {
    companyName: String,
    gstNumber: String,
    panNumber: String,
    website: String
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  creditUsed: {
    type: Number,
    default: 0
  },
  creditAvailable: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    creditDays: {
      type: Number,
      default: 0
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'cheque', 'bank-transfer', 'upi', 'cod', 'credit-card'],
      default: 'bank-transfer'
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0
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
    cancelledOrders: {
      type: Number,
      default: 0
    },
    returnedOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    firstOrderDate: Date
  },
  rating: {
    overallRating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5
    },
    paymentRating: Number,
    returnRate: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'vip'],
    default: 'active'
  },
  notes: String,
  tags: [String],
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

// Auto-generate customerId
customerSchema.pre('save', async function(next) {
  if (!this.customerId) {
    const count = await this.constructor.countDocuments();
    this.customerId = `CUS${String(count + 1).padStart(6, '0')}`;
  }
  
  // Generate full billing address
  if (this.billingAddress.street || this.billingAddress.city) {
    const parts = [
      this.billingAddress.street,
      this.billingAddress.city,
      this.billingAddress.state,
      this.billingAddress.pincode,
      this.billingAddress.country
    ].filter(p => p);
    this.billingAddress.fullAddress = parts.join(', ');
  }
  
  // Generate full shipping addresses
  this.shippingAddresses.forEach(addr => {
    if (addr.street || addr.city) {
      const parts = [
        addr.street,
        addr.city,
        addr.state,
        addr.pincode,
        addr.country
      ].filter(p => p);
      addr.fullAddress = parts.join(', ');
    }
  });
  
  // Calculate credit available
  this.creditAvailable = this.creditLimit - this.creditUsed;
  
  next();
});

// Indexes
customerSchema.index({ code: 1 });
customerSchema.index({ name: 'text', 'contact.email': 'text' });
customerSchema.index({ status: 1 });
customerSchema.index({ type: 1 });

module.exports = mongoose.model('Customer', customerSchema);
