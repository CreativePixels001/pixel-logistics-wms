/**
 * Deal Model - MongoDB Schema
 * Pixel Safe Insurance Portal - Sales Pipeline Management
 */

const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Deal Basic Information
  dealNumber: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Client/Lead Reference
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  customerEmail: String,
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required']
  },

  // Deal Details
  dealTitle: {
    type: String,
    required: [true, 'Deal title is required']
  },
  insuranceType: {
    type: String,
    required: true,
    enum: ['health', 'motor', 'life', 'property', 'travel', 'marine', 'fire', 'other']
  },
  proposedInsurer: String,
  proposedPlan: String,
  proposedCoverage: {
    type: Number,
    min: 0
  },
  proposedPremium: {
    type: Number,
    min: 0
  },

  // Deal Value & Stage
  dealValue: {
    type: Number,
    required: [true, 'Deal value is required'],
    min: 0
  },
  stage: {
    type: String,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'prospecting'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  
  // Timeline
  expectedCloseDate: Date,
  actualCloseDate: Date,
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'on-hold', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Loss/Win Details
  lostReason: {
    type: String,
    enum: [
      'price-too-high', 'competitor', 'no-budget', 'timing', 
      'requirements-changed', 'no-response', 'other'
    ]
  },
  lostRemarks: String,
  wonRemarks: String,
  competitorName: String,

  // Proposal Details
  proposalSent: {
    type: Boolean,
    default: false
  },
  proposalSentDate: Date,
  proposalDocument: String,
  proposalNotes: String,

  // Quotations (Multiple quotes comparison)
  quotations: [{
    insurerName: String,
    planName: String,
    coverageAmount: Number,
    premium: Number,
    benefits: [String],
    quotationDate: {
      type: Date,
      default: Date.now
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  }],

  // Follow-ups & Activities
  followUps: [{
    date: Date,
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'whatsapp', 'site-visit', 'other']
    },
    notes: String,
    performedBy: String,
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'no-response']
    },
    nextAction: String,
    nextFollowUpDate: Date
  }],

  // Documents
  documents: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Commission Details
  commission: {
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid'],
      default: 'pending'
    }
  },

  // Agent/Owner
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  createdBy: {
    type: String,
    default: 'System'
  },

  // Additional Info
  source: {
    type: String,
    enum: ['website', 'referral', 'call', 'walk-in', 'social-media', 'campaign', 'partner', 'other'],
    default: 'website'
  },
  description: String,
  internalNotes: String,
  tags: [String]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
dealSchema.index({ dealNumber: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ insuranceType: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ assignedTo: 1 });

// Auto-generate deal number
dealSchema.pre('save', function(next) {
  if (!this.dealNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const typePrefix = this.insuranceType.substring(0, 2).toUpperCase();
    this.dealNumber = `DEAL-${typePrefix}-${timestamp}-${random}`;
  }
  next();
});

// Virtuals
dealSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  return Math.floor((now - this.createdDate) / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('daysToClose').get(function() {
  if (!this.expectedCloseDate) return null;
  const now = new Date();
  return Math.floor((this.expectedCloseDate - now) / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('isOverdue').get(function() {
  if (!this.expectedCloseDate || this.status !== 'active') return false;
  return new Date() > this.expectedCloseDate;
});

dealSchema.virtual('followUpCount').get(function() {
  return this.followUps ? this.followUps.length : 0;
});

dealSchema.virtual('stageProgress').get(function() {
  const stageMap = {
    'prospecting': 20,
    'qualification': 40,
    'proposal': 60,
    'negotiation': 80,
    'closed-won': 100,
    'closed-lost': 0
  };
  return stageMap[this.stage] || 0;
});

// Methods
dealSchema.methods.addFollowUp = function(followUpData) {
  this.followUps.push(followUpData);
  this.lastActivityDate = new Date();
  return this.save();
};

dealSchema.methods.moveStage = function(newStage, movedBy) {
  const previousStage = this.stage;
  this.stage = newStage;
  this.lastActivityDate = new Date();
  
  // Update probability based on stage
  const probabilityMap = {
    'prospecting': 10,
    'qualification': 25,
    'proposal': 50,
    'negotiation': 75,
    'closed-won': 100,
    'closed-lost': 0
  };
  this.probability = probabilityMap[newStage] || this.probability;

  this.followUps.push({
    date: new Date(),
    type: 'other',
    notes: `Stage changed from ${previousStage} to ${newStage}`,
    performedBy: movedBy || 'System'
  });

  return this.save();
};

dealSchema.methods.markWon = function(wonData) {
  this.status = 'won';
  this.stage = 'closed-won';
  this.probability = 100;
  this.actualCloseDate = new Date();
  this.wonRemarks = wonData.remarks;
  
  if (wonData.commissionPercentage) {
    this.commission.percentage = wonData.commissionPercentage;
    this.commission.amount = (this.dealValue * wonData.commissionPercentage) / 100;
  }

  return this.save();
};

dealSchema.methods.markLost = function(lostData) {
  this.status = 'lost';
  this.stage = 'closed-lost';
  this.probability = 0;
  this.actualCloseDate = new Date();
  this.lostReason = lostData.reason;
  this.lostRemarks = lostData.remarks;
  this.competitorName = lostData.competitor;

  return this.save();
};

dealSchema.methods.sendProposal = function(proposalData) {
  this.proposalSent = true;
  this.proposalSentDate = new Date();
  this.proposalDocument = proposalData.documentUrl;
  this.proposalNotes = proposalData.notes;
  this.stage = 'proposal';
  this.probability = 50;

  return this.save();
};

// Statics
dealSchema.statics.findByStage = function(stage) {
  return this.find({ stage, status: 'active' }).populate('leadId clientId');
};

dealSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('leadId clientId');
};

dealSchema.statics.findOverdue = function() {
  return this.find({
    status: 'active',
    expectedCloseDate: { $lt: new Date() }
  });
};

dealSchema.statics.getPipelineStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalValue: { $sum: '$dealValue' },
        avgProbability: { $avg: '$probability' },
        weightedValue: {
          $sum: {
            $multiply: ['$dealValue', { $divide: ['$probability', 100] }]
          }
        }
      }
    }
  ]);
};

dealSchema.statics.getStatsByInsuranceType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$insuranceType',
        totalDeals: { $sum: 1 },
        totalValue: { $sum: '$dealValue' },
        won: {
          $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
        },
        lost: {
          $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
        },
        winRate: {
          $avg: {
            $cond: [
              { $in: ['$status', ['won', 'lost']] },
              { $cond: [{ $eq: ['$status', 'won'] }, 100, 0] },
              null
            ]
          }
        }
      }
    }
  ]);
};

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
