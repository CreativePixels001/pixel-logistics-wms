const mongoose = require('mongoose');

const renewalSchema = new mongoose.Schema({
  // Policy Reference
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer Information
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  
  // Policy Details
  planName: {
    type: String,
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  
  // Pricing
  basePremium: {
    type: Number,
    required: true
  },
  eligibleForNCB: {
    type: Boolean,
    default: false
  },
  ncbDiscount: {
    type: Number,
    default: 0
  },
  renewalPremium: {
    type: Number,
    required: true
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['active', 'due-soon', 'contacted', 'renewed', 'overdue', 'cancelled'],
    default: 'active'
  },
  daysUntilExpiry: {
    type: Number
  },
  
  // Reminder Tracking
  remindersSent: [{
    date: Date,
    type: {
      type: String,
      enum: ['email', 'sms', 'both']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  
  // Renewal Processing
  renewedDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  transactionId: String,
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
renewalSchema.index({ policyNumber: 1 });
renewalSchema.index({ clientId: 1 });
renewalSchema.index({ expiryDate: 1 });
renewalSchema.index({ status: 1 });
renewalSchema.index({ eligibleForNCB: 1 });

// Virtual for calculating days until expiry (real-time)
renewalSchema.virtual('currentDaysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
});

// Method to update status based on expiry date
renewalSchema.methods.updateStatus = function() {
  const daysLeft = this.currentDaysUntilExpiry;
  
  if (this.status === 'renewed') {
    return this.status;
  }
  
  if (daysLeft < 0) {
    this.status = 'overdue';
  } else if (daysLeft <= 60) {
    if (this.status !== 'contacted') {
      this.status = 'due-soon';
    }
  } else {
    this.status = 'active';
  }
  
  this.daysUntilExpiry = daysLeft;
  this.lastUpdated = new Date();
  
  return this.status;
};

// Static method to create renewal from policy
renewalSchema.statics.createFromPolicy = async function(policy) {
  // Calculate days until expiry
  const today = new Date();
  const expiryDate = new Date(policy.endDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  // Determine status
  let status = 'active';
  if (daysUntilExpiry < 0) {
    status = 'overdue';
  } else if (daysUntilExpiry <= 60) {
    status = 'due-soon';
  }
  
  // Check NCB eligibility (no claims during policy period)
  const eligibleForNCB = policy.claimsMade === 0;
  
  // Calculate renewal premium
  let renewalPremium = policy.premium.basePremium;
  let ncbDiscount = 0;
  
  if (eligibleForNCB) {
    ncbDiscount = Math.round(renewalPremium * 0.20);
    renewalPremium = renewalPremium - ncbDiscount;
  }
  
  return new this({
    policyId: policy._id,
    policyNumber: policy.policyNumber,
    clientId: policy.clientId,
    customerName: policy.customerName || 'Unknown',
    planName: policy.planName,
    coverageAmount: policy.coverageAmount,
    expiryDate: policy.endDate,
    basePremium: policy.premium.basePremium,
    eligibleForNCB,
    ncbDiscount,
    renewalPremium,
    status,
    daysUntilExpiry,
    remindersSent: []
  });
};

module.exports = mongoose.model('Renewal', renewalSchema);
