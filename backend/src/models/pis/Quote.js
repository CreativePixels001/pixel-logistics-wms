/**
 * Quote Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Quote Identification
  quoteNumber: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },

  // Customer Information
  customerInfo: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 99
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    pincode: String,
    city: String,
    state: String
  },

  // Insurance Details
  insuranceType: {
    type: String,
    required: [true, 'Insurance type is required'],
    enum: ['health', 'motor', 'life', 'property', 'travel', 'business']
  },

  // Coverage Details
  coverageAmount: {
    type: Number,
    required: [true, 'Coverage amount is required'],
    min: 0
  },
  coverageType: {
    type: String,
    enum: ['individual', 'family', 'floater'],
    default: 'individual'
  },
  
  // Family Members (for health insurance)
  familyMembers: [{
    type: String
  }],

  // Medical Information (for health insurance)
  medicalInfo: {
    preExisting: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    },
    conditions: [{
      type: String
    }],
    tobacco: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no'
    }
  },

  // Vehicle Details (for motor insurance)
  vehicleDetails: {
    vehicleType: String,
    manufacturer: String,
    model: String,
    variant: String,
    registrationYear: Number,
    fuelType: String,
    registrationNumber: String
  },

  // Add-ons Selected
  addons: [{
    type: String
  }],

  // Generated Quotes from Multiple Insurers
  insurerQuotes: [{
    insurerId: String,
    insurerName: {
      type: String,
      required: true
    },
    planName: {
      type: String,
      required: true
    },
    premium: {
      basePremium: {
        type: Number,
        required: true,
        min: 0
      },
      addons: {
        type: Number,
        default: 0
      },
      gst: {
        type: Number,
        required: true,
        min: 0
      },
      totalPremium: {
        type: Number,
        required: true,
        min: 0
      }
    },
    features: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    claimSettlement: Number,
    recommended: {
      type: Boolean,
      default: false
    }
  }],

  // Selected Quote (after customer selection)
  selectedQuote: {
    insurerId: String,
    insurerName: String,
    planName: String,
    premium: {
      basePremium: Number,
      addons: Number,
      gst: Number,
      totalPremium: Number
    }
  },

  // Quote Status
  status: {
    type: String,
    enum: ['generated', 'viewed', 'selected', 'expired', 'converted'],
    default: 'generated'
  },

  // Validity
  validUntil: {
    type: Date
  },

  // Source
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'agent', 'partner'],
    default: 'website'
  },

  // Lead Reference (if converted to lead)
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },

  // Deal Reference (if converted to deal)
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },

  // Policy Reference (if converted to policy)
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy'
  },

  // Calculated Fields
  calculatedPremium: {
    type: Number,
    min: 0
  },

  // Metadata
  ipAddress: String,
  userAgent: String,
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  viewedAt: Date,
  selectedAt: Date,
  convertedAt: Date,

  // Notes
  notes: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ 'customerInfo.email': 1 });
quoteSchema.index({ 'customerInfo.phone': 1 });
quoteSchema.index({ insuranceType: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ validUntil: 1 });

// Virtual for days until expiry
quoteSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validUntil) return 0;
  const now = new Date();
  const diff = this.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
quoteSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual for lowest premium quote
quoteSchema.virtual('lowestPremium').get(function() {
  if (!this.insurerQuotes || this.insurerQuotes.length === 0) return 0;
  return Math.min(...this.insurerQuotes.map(q => q.premium.totalPremium));
});

// Virtual for highest premium quote
quoteSchema.virtual('highestPremium').get(function() {
  if (!this.insurerQuotes || this.insurerQuotes.length === 0) return 0;
  return Math.max(...this.insurerQuotes.map(q => q.premium.totalPremium));
});

// Pre-save middleware to generate quote number
quoteSchema.pre('save', async function(next) {
  if (!this.quoteNumber) {
    const prefix = this.insuranceType.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.quoteNumber = `QT${prefix}${timestamp}${random}`;
  }

  // Set validity (7 days from generation)
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Pre-save middleware to mark recommended quote
quoteSchema.pre('save', function(next) {
  if (this.insurerQuotes && this.insurerQuotes.length > 0) {
    // Find the quote with lowest premium
    const lowestPremiumQuote = this.insurerQuotes.reduce((min, quote) => 
      quote.premium.totalPremium < min.premium.totalPremium ? quote : min
    );
    
    // Mark it as recommended
    this.insurerQuotes.forEach(quote => {
      quote.recommended = quote === lowestPremiumQuote;
    });
  }
  next();
});

// Static method to find active quotes
quoteSchema.statics.findActive = function() {
  return this.find({
    validUntil: { $gte: new Date() },
    status: { $in: ['generated', 'viewed', 'selected'] }
  }).sort({ createdAt: -1 });
};

// Static method to find expired quotes
quoteSchema.statics.findExpired = function() {
  return this.find({
    validUntil: { $lt: new Date() },
    status: { $ne: 'converted' }
  }).sort({ createdAt: -1 });
};

// Static method to get quotes by email
quoteSchema.statics.findByEmail = function(email) {
  return this.find({
    'customerInfo.email': email.toLowerCase()
  }).sort({ createdAt: -1 });
};

// Static method to get quotes by phone
quoteSchema.statics.findByPhone = function(phone) {
  return this.find({
    'customerInfo.phone': phone
  }).sort({ createdAt: -1 });
};

// Instance method to mark as viewed
quoteSchema.methods.markAsViewed = function() {
  if (this.status === 'generated') {
    this.status = 'viewed';
    this.viewedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to select a quote
quoteSchema.methods.selectQuote = function(insurerId) {
  const selectedQuote = this.insurerQuotes.find(q => q.insurerId === insurerId);
  if (selectedQuote) {
    this.selectedQuote = {
      insurerId: selectedQuote.insurerId,
      insurerName: selectedQuote.insurerName,
      planName: selectedQuote.planName,
      premium: selectedQuote.premium
    };
    this.status = 'selected';
    this.selectedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Quote not found'));
};

// Instance method to convert to policy
quoteSchema.methods.convertToPolicy = function(policyId) {
  this.policyId = policyId;
  this.status = 'converted';
  this.convertedAt = new Date();
  return this.save();
};

// Static method to get analytics
quoteSchema.statics.getAnalytics = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$insuranceType',
        totalQuotes: { $sum: 1 },
        convertedQuotes: {
          $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
        },
        averagePremium: { $avg: '$calculatedPremium' },
        totalPremiumValue: { $sum: '$calculatedPremium' }
      }
    },
    {
      $project: {
        insuranceType: '$_id',
        totalQuotes: 1,
        convertedQuotes: 1,
        conversionRate: {
          $multiply: [
            { $divide: ['$convertedQuotes', '$totalQuotes'] },
            100
          ]
        },
        averagePremium: { $round: ['$averagePremium', 2] },
        totalPremiumValue: { $round: ['$totalPremiumValue', 2] }
      }
    }
  ]);
};

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;
