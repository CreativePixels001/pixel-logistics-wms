/**
 * Policy Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  // Policy Basic Information
  policyNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  policyType: {
    type: String,
    required: [true, 'Policy type is required'],
    enum: {
      values: ['new', 'renewal', 'portability'],
      message: 'Policy type must be new, renewal, or portability'
    }
  },
  insuranceType: {
    type: String,
    required: [true, 'Insurance type is required'],
    enum: {
      values: ['health', 'motor', 'life', 'property', 'travel', 'marine', 'fire', 'other'],
      message: 'Invalid insurance type'
    }
  },

  // Client Reference
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required']
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: String,
  clientPhone: String,

  // Policy Details
  insurerName: {
    type: String,
    required: [true, 'Insurer name is required'],
    trim: true
  },
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  coverageAmount: {
    type: Number,
    required: [true, 'Coverage amount is required'],
    min: [0, 'Coverage amount must be positive']
  },
  
  // Premium Information
  premium: {
    basePremium: {
      type: Number,
      required: true,
      min: 0
    },
    gst: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceTax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPremium: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Policy Period
  startDate: {
    type: Date,
    required: [true, 'Policy start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Policy end date is required']
  },
  tenure: {
    type: Number, // in years
    default: 1
  },

  // Payment Details
  paymentMode: {
    type: String,
    enum: ['annual', 'semi-annual', 'quarterly', 'monthly'],
    default: 'annual'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'online', 'upi', 'card', 'netbanking']
  },
  transactionId: String,

  // Policy Status
  status: {
    type: String,
    enum: {
      values: ['active', 'expired', 'cancelled', 'lapsed', 'pending', 'suspended'],
      message: 'Invalid policy status'
    },
    default: 'pending'
  },

  // Nominee Details
  nominee: {
    name: String,
    relationship: String,
    dateOfBirth: Date,
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  },

  // Additional Nominees (for multiple)
  additionalNominees: [{
    name: String,
    relationship: String,
    dateOfBirth: Date,
    percentage: Number
  }],

  // Motor Insurance Specific (if applicable)
  vehicleDetails: {
    registrationNumber: String,
    make: String,
    model: String,
    year: Number,
    engineNumber: String,
    chassisNumber: String,
    fuelType: String,
    vehicleType: String
  },

  // Health Insurance Specific (if applicable)
  healthDetails: {
    preExistingDiseases: [String],
    coverageType: {
      type: String,
      enum: ['individual', 'family-floater', 'senior-citizen', 'critical-illness']
    },
    numberOfMembers: Number,
    members: [{
      name: String,
      relationship: String,
      age: Number,
      sumInsured: Number
    }]
  },

  // Property Insurance Specific
  propertyDetails: {
    propertyType: String,
    address: String,
    builtUpArea: Number,
    yearBuilt: Number,
    constructionType: String
  },

  // Commission and Agent Details
  agentId: String,
  agentName: String,
  commission: {
    percentage: Number,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    paidDate: Date
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['policy_document', 'proposal_form', 'kyc', 'vehicle_rc', 'health_card', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Renewal Information
  isRenewable: {
    type: Boolean,
    default: true
  },
  renewalDate: Date,
  renewalReminders: [{
    sentDate: Date,
    method: String, // email, sms, whatsapp
    status: String
  }],
  renewedFromPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy'
  },
  renewedToPolicy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy'
  },

  // Claims History
  claimsCount: {
    type: Number,
    default: 0
  },
  totalClaimsAmount: {
    type: Number,
    default: 0
  },

  // Notes and Tags
  notes: String,
  tags: [String],
  
  // ========== SYNC-READY FIELDS (for provider integration) ==========
  // Data Source Tracking
  dataSource: {
    type: String,
    enum: ['manual', 'synced', 'imported'],
    default: 'manual',
    required: true
  },
  
  // Provider Integration Fields
  providerName: {
    type: String,
    trim: true
    // e.g., 'Star Health API', 'ICICI Lombard API', 'Care Health Portal'
  },
  providerPolicyId: {
    type: String,
    trim: true,
    // Original policy ID from the provider's system
    // e.g., 'STAR-HLT-2024-123456', 'ICICI-MTR-2024-789012'
  },
  
  // Sync Status
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed', 'conflict', 'not_applicable'],
    default: 'not_applicable'
  },
  lastSyncDate: {
    type: Date
  },
  syncErrors: [{
    errorCode: String,
    errorMessage: String,
    occurredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Provider Metadata (store raw provider data for reconciliation)
  providerMetadata: {
    type: mongoose.Schema.Types.Mixed,
    // Store original API response or imported data
    // Useful for debugging and data reconciliation
  },
  
  // Conflict Resolution
  conflictStatus: {
    type: String,
    enum: ['none', 'detected', 'resolved'],
    default: 'none'
  },
  conflictDetails: {
    type: mongoose.Schema.Types.Mixed,
    // Store details about data conflicts between systems
  },
  
  // Sync Configuration
  autoSync: {
    type: Boolean,
    default: false
    // Whether to automatically sync updates from provider
  },
  syncFrequency: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
    default: 'manual'
  },
  
  // Activity Log
  activities: [{
    type: {
      type: String,
      enum: ['created', 'renewed', 'cancelled', 'claim_filed', 'payment_received', 'document_uploaded', 'note', 'synced', 'sync_failed', 'conflict_detected', 'conflict_resolved']
    },
    description: String,
    performedBy: String,
    performedAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
policySchema.index({ policyNumber: 1 });
policySchema.index({ clientId: 1 });
policySchema.index({ insuranceType: 1, status: 1 });
policySchema.index({ startDate: 1, endDate: 1 });
policySchema.index({ status: 1 });
policySchema.index({ agentId: 1 });
policySchema.index({ createdAt: -1 });
// Sync-ready indexes
policySchema.index({ dataSource: 1 });
policySchema.index({ providerPolicyId: 1 });
policySchema.index({ syncStatus: 1 });
policySchema.index({ providerName: 1, providerPolicyId: 1 });
policySchema.index({ conflictStatus: 1 });

// Virtual: Days Until Expiry
policySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  const expiry = new Date(this.endDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Is Expiring Soon (within 30 days)
policySchema.virtual('isExpiringSoon').get(function() {
  const days = this.daysUntilExpiry;
  return days !== null && days > 0 && days <= 30;
});

// Virtual: Is Expired
policySchema.virtual('isExpired').get(function() {
  return this.daysUntilExpiry !== null && this.daysUntilExpiry < 0;
});

// Virtual: Policy Duration (in days)
policySchema.virtual('policyDuration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diffTime = new Date(this.endDate) - new Date(this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
policySchema.pre('save', function(next) {
  // Generate policy number if not exists
  if (!this.policyNumber) {
    const prefix = this.insuranceType.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.policyNumber = `PS-${prefix}-${timestamp}-${random}`;
  }

  // Calculate renewal date (30 days before expiry)
  if (this.endDate && !this.renewalDate) {
    const renewal = new Date(this.endDate);
    renewal.setDate(renewal.getDate() - 30);
    this.renewalDate = renewal;
  }

  // Add activity log on creation
  if (this.isNew) {
    this.activities.push({
      type: 'created',
      description: 'Policy created',
      performedBy: this.agentName || 'System'
    });
  }

  // Auto-update status based on dates
  const today = new Date();
  if (this.endDate < today && this.status === 'active') {
    this.status = 'expired';
  }

  next();
});

// Instance methods
policySchema.methods.addActivity = function(type, description, performedBy = 'System') {
  this.activities.push({
    type,
    description,
    performedBy,
    performedAt: new Date()
  });
  return this.save();
};

policySchema.methods.cancelPolicy = function(reason, performedBy = 'System') {
  this.status = 'cancelled';
  return this.addActivity('cancelled', reason, performedBy);
};

policySchema.methods.recordClaim = function(claimAmount) {
  this.claimsCount += 1;
  this.totalClaimsAmount += claimAmount;
  return this.save();
};

// ========== SYNC-READY INSTANCE METHODS ==========
policySchema.methods.markSynced = function(providerData) {
  this.syncStatus = 'synced';
  this.lastSyncDate = new Date();
  if (providerData) {
    this.providerMetadata = providerData;
  }
  return this.addActivity('synced', 'Policy synced from provider', 'System');
};

policySchema.methods.markSyncFailed = function(errorMessage, errorCode) {
  this.syncStatus = 'failed';
  this.syncErrors.push({
    errorCode,
    errorMessage,
    occurredAt: new Date()
  });
  return this.addActivity('sync_failed', errorMessage, 'System');
};

policySchema.methods.detectConflict = function(conflictData) {
  this.conflictStatus = 'detected';
  this.conflictDetails = conflictData;
  return this.addActivity('conflict_detected', 'Data conflict detected with provider', 'System');
};

policySchema.methods.resolveConflict = function(resolution, performedBy = 'Admin') {
  this.conflictStatus = 'resolved';
  this.conflictDetails = {
    ...this.conflictDetails,
    resolution,
    resolvedAt: new Date(),
    resolvedBy: performedBy
  };
  return this.addActivity('conflict_resolved', resolution, performedBy);
};

policySchema.methods.updateFromProvider = async function(providerData) {
  // Check for conflicts
  const conflicts = [];
  
  if (this.premium?.totalPremium !== providerData.premium?.totalPremium) {
    conflicts.push({
      field: 'premium',
      localValue: this.premium?.totalPremium,
      providerValue: providerData.premium?.totalPremium
    });
  }
  
  if (this.status !== providerData.status) {
    conflicts.push({
      field: 'status',
      localValue: this.status,
      providerValue: providerData.status
    });
  }
  
  // If conflicts exist, mark them
  if (conflicts.length > 0) {
    await this.detectConflict({
      detectedAt: new Date(),
      conflicts,
      providerData
    });
    return { updated: false, conflicts };
  }
  
  // No conflicts - update the policy
  Object.keys(providerData).forEach(key => {
    if (key !== '_id' && key !== 'policyNumber') {
      this[key] = providerData[key];
    }
  });
  
  await this.markSynced(providerData);
  return { updated: true, conflicts: [] };
};

// Static methods
policySchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

policySchema.statics.findExpiring = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: { $gte: today, $lte: futureDate }
  });
};

policySchema.statics.findByClient = function(clientId) {
  return this.find({ clientId });
};

policySchema.statics.findByInsuranceType = function(type) {
  return this.find({ insuranceType: type });
};

// ========== SYNC-READY STATIC METHODS ==========
policySchema.statics.findSynced = function() {
  return this.find({ dataSource: 'synced' });
};

policySchema.statics.findManual = function() {
  return this.find({ dataSource: 'manual' });
};

policySchema.statics.findByProvider = function(providerName) {
  return this.find({ providerName });
};

policySchema.statics.findConflicts = function() {
  return this.find({ conflictStatus: 'detected' });
};

policySchema.statics.findSyncPending = function() {
  return this.find({ syncStatus: 'pending' });
};

policySchema.statics.findSyncFailed = function() {
  return this.find({ syncStatus: 'failed' });
};

policySchema.statics.findByProviderPolicyId = function(providerPolicyId) {
  return this.findOne({ providerPolicyId });
};

// Find or create for sync operations
policySchema.statics.findOrCreateFromProvider = async function(providerData) {
  const existing = await this.findOne({ 
    providerName: providerData.providerName,
    providerPolicyId: providerData.providerPolicyId 
  });
  
  if (existing) {
    return { policy: existing, created: false };
  }
  
  const policy = await this.create({
    ...providerData,
    dataSource: 'synced',
    syncStatus: 'synced',
    lastSyncDate: new Date()
  });
  
  return { policy, created: true };
};

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
