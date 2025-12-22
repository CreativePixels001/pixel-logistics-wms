/**
 * Agent Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  // Basic Information
  agentId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[0-9]{10,14}$/, 'Please enter a valid phone number']
  },
  alternatePhone: String,

  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include in queries by default
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChange: Date,

  // Agent Details
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Professional Information
  role: {
    type: String,
    enum: ['agent', 'senior-agent', 'manager', 'admin'],
    default: 'agent'
  },
  designation: String,
  department: {
    type: String,
    enum: ['sales', 'claims', 'renewals', 'operations', 'admin'],
    default: 'sales'
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // License & Certification
  licenseNumber: {
    type: String,
    required: [true, 'Insurance license number is required'],
    unique: true,
    uppercase: true
  },
  licenseIssueDate: Date,
  licenseExpiryDate: Date,
  licenseType: {
    type: String,
    enum: ['life', 'health', 'motor', 'general', 'composite'],
    default: 'composite'
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],

  // Performance Metrics
  performance: {
    totalLeads: { type: Number, default: 0 },
    convertedLeads: { type: Number, default: 0 },
    totalClients: { type: Number, default: 0 },
    activePolicies: { type: Number, default: 0 },
    totalPoliciesIssued: { type: Number, default: 0 },
    totalPremiumCollected: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // Percentage
    averageDealValue: { type: Number, default: 0 },
    customerRetentionRate: { type: Number, default: 0 },
    performanceRating: { type: Number, default: 0, min: 0, max: 5 },
    targetAchievement: { type: Number, default: 0 } // Percentage
  },

  // Targets
  monthlyTargets: {
    leads: { type: Number, default: 20 },
    policies: { type: Number, default: 10 },
    premium: { type: Number, default: 100000 },
    clients: { type: Number, default: 5 }
  },

  // Commission Structure
  commissionStructure: {
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'tiered'],
      default: 'percentage'
    },
    rate: { type: Number, default: 5 }, // 5%
    tiers: [{
      from: Number,
      to: Number,
      rate: Number
    }]
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on-leave', 'terminated'],
    default: 'active'
  },
  accountVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },

  // Bank Details for Commission
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String,
    accountType: {
      type: String,
      enum: ['savings', 'current']
    }
  },

  // KYC Documents
  documents: [{
    type: {
      type: String,
      enum: ['pan', 'aadhaar', 'license', 'certificate', 'photo', 'agreement', 'other']
    },
    documentNumber: String,
    url: String,
    uploadDate: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],

  // Access Control
  permissions: [{
    module: {
      type: String,
      enum: ['leads', 'clients', 'policies', 'claims', 'deals', 'renewals', 'reports', 'all']
    },
    access: {
      type: String,
      enum: ['view', 'create', 'edit', 'delete', 'full'],
      default: 'view'
    }
  }],

  // Activity Tracking
  lastLogin: Date,
  lastActive: Date,
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    device: String,
    location: String
  }],

  // Preferences
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    dashboardLayout: String
  },

  // Notes & Comments
  notes: [{
    note: String,
    addedBy: String,
    addedAt: { type: Date, default: Date.now }
  }],

  // Audit Trail
  activities: [{
    type: {
      type: String,
      enum: ['login', 'logout', 'policy-created', 'client-added', 'lead-converted', 'target-achieved', 'commission-paid', 'profile-updated', 'other']
    },
    description: String,
    performedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
agentSchema.index({ agentId: 1 });
agentSchema.index({ email: 1 });
agentSchema.index({ phone: 1 });
agentSchema.index({ licenseNumber: 1 });
agentSchema.index({ status: 1 });
agentSchema.index({ role: 1 });
agentSchema.index({ department: 1 });

// Virtual: Full Name
agentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: Age
agentSchema.virtual('age').get(function() {
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

// Virtual: License Status
agentSchema.virtual('licenseStatus').get(function() {
  if (!this.licenseExpiryDate) return 'unknown';
  const today = new Date();
  const expiryDate = new Date(this.licenseExpiryDate);
  const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysToExpiry < 0) return 'expired';
  if (daysToExpiry <= 30) return 'expiring-soon';
  return 'valid';
});

// Virtual: Days Since Joining
agentSchema.virtual('daysSinceJoining').get(function() {
  if (!this.joiningDate) return 0;
  const today = new Date();
  const joining = new Date(this.joiningDate);
  return Math.floor((today - joining) / (1000 * 60 * 60 * 24));
});

// Virtual: Full Address
agentSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode, country } = this.address;
  return [street, city, state, pincode, country].filter(Boolean).join(', ');
});

// Pre-save middleware: Auto-generate agent ID
agentSchema.pre('save', async function(next) {
  if (!this.agentId) {
    const count = await this.constructor.countDocuments();
    this.agentId = `AGENT${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Methods
agentSchema.methods.addActivity = function(type, description, metadata = {}) {
  this.activities.push({ type, description, metadata });
  this.lastActive = new Date();
  return this.save();
};

agentSchema.methods.recordLogin = function(ipAddress, device, location) {
  this.loginHistory.push({ ipAddress, device, location });
  this.lastLogin = new Date();
  this.lastActive = new Date();
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  return this.save();
};

agentSchema.methods.updatePerformance = function(metrics) {
  Object.assign(this.performance, metrics);
  
  // Calculate conversion rate
  if (this.performance.totalLeads > 0) {
    this.performance.conversionRate = (this.performance.convertedLeads / this.performance.totalLeads * 100).toFixed(2);
  }
  
  // Calculate average deal value
  if (this.performance.totalPoliciesIssued > 0) {
    this.performance.averageDealValue = Math.round(this.performance.totalPremiumCollected / this.performance.totalPoliciesIssued);
  }
  
  return this.save();
};

// Statics
agentSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

agentSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

agentSchema.statics.findByDepartment = function(department) {
  return this.find({ department });
};

agentSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'performance.totalPremiumCollected': -1 })
    .limit(limit);
};

agentSchema.statics.getExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    licenseExpiryDate: { $lte: futureDate, $gte: new Date() },
    status: 'active'
  });
};

// Pre-save hook to auto-generate agentId
agentSchema.pre('save', async function(next) {
  if (!this.agentId) {
    try {
      // Find the highest agent number
      const lastAgent = await this.constructor.findOne({}, {}, { sort: { 'agentId': -1 } });
      
      if (lastAgent && lastAgent.agentId) {
        const lastNumber = parseInt(lastAgent.agentId.replace('AGENT', ''));
        const newNumber = lastNumber + 1;
        this.agentId = `AGENT${String(newNumber).padStart(4, '0')}`;
      } else {
        this.agentId = 'AGENT0001';
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Agent', agentSchema);
