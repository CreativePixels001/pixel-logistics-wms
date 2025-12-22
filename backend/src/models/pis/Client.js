/**
 * Client Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number']
  },
  alternatePhone: {
    type: String,
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Gender must be male, female, or other'
    }
  },

  // Address Information
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Pincode must be 6 digits']
    },
    country: {
      type: String,
      default: 'India'
    }
  },

  // KYC Information
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format']
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    match: [/^\d{12}$/, 'Aadhaar number must be 12 digits']
  },
  kycStatus: {
    type: String,
    enum: {
      values: ['pending', 'verified', 'rejected', 'expired'],
      message: 'Invalid KYC status'
    },
    default: 'pending'
  },
  kycVerifiedAt: Date,

  // Client Segment
  segment: {
    type: String,
    required: [true, 'Client segment is required'],
    enum: {
      values: ['individual', 'family', 'corporate', 'sme'],
      message: 'Segment must be individual, family, corporate, or sme'
    },
    default: 'individual'
  },
  
  // Corporate Details (if applicable)
  companyName: String,
  companyGSTIN: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
  },

  // Client Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Status must be active, inactive, or suspended'
    },
    default: 'active'
  },

  // Policies Reference
  totalPolicies: {
    type: Number,
    default: 0
  },
  activePolicies: {
    type: Number,
    default: 0
  },
  totalPremiumPaid: {
    type: Number,
    default: 0
  },

  // Claims Reference
  totalClaims: {
    type: Number,
    default: 0
  },
  totalClaimAmount: {
    type: Number,
    default: 0
  },

  // Bank Details
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },

  // Nominee Information
  nominee: {
    name: String,
    relationship: String,
    dateOfBirth: Date,
    phone: String
  },

  // Notes and Tags
  notes: String,
  tags: [String],

  // Agent Assignment
  assignedAgent: {
    type: String,
    default: 'Unassigned'
  },

  // Lead Source (if converted from lead)
  leadSource: String,
  convertedFromLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },

  // Activity Log
  activities: [{
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'policy_issued', 'claim_filed', 'kyc_update']
    },
    description: String,
    performedBy: String,
    performedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['pan', 'aadhaar', 'photo', 'address_proof', 'bank_statement', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
clientSchema.index({ email: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ panNumber: 1 });
clientSchema.index({ segment: 1, status: 1 });
clientSchema.index({ assignedAgent: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual: Age
clientSchema.virtual('age').get(function() {
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

// Virtual: Full Address
clientSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode, country } = this.address;
  return `${street ? street + ', ' : ''}${city}, ${state} ${pincode}, ${country}`;
});

// Virtual: Display Name
clientSchema.virtual('displayName').get(function() {
  return this.companyName || this.fullName;
});

// Pre-save middleware
clientSchema.pre('save', function(next) {
  // Add activity log on creation
  if (this.isNew) {
    this.activities.push({
      type: 'note',
      description: 'Client profile created',
      performedBy: this.assignedAgent || 'System'
    });
  }
  next();
});

// Instance method: Add activity
clientSchema.methods.addActivity = function(type, description, performedBy = 'System') {
  this.activities.push({
    type,
    description,
    performedBy,
    performedAt: new Date()
  });
  return this.save();
};

// Static method: Find active clients
clientSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method: Find by segment
clientSchema.statics.findBySegment = function(segment) {
  return this.find({ segment });
};

// Static method: Search clients
clientSchema.statics.searchClients = function(searchTerm) {
  return this.find({
    $or: [
      { fullName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } },
      { companyName: { $regex: searchTerm, $options: 'i' } }
    ]
  });
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
