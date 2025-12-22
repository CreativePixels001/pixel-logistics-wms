/**
 * Lead Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Contact Information
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
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },

  // Lead Details
  interestType: {
    type: String,
    required: [true, 'Interest type is required'],
    enum: {
      values: ['health', 'motor', 'life', 'property', 'travel', 'other'],
      message: 'Interest type must be one of: health, motor, life, property, travel, other'
    }
  },
  source: {
    type: String,
    required: [true, 'Lead source is required'],
    enum: {
      values: ['website', 'referral', 'social-media', 'direct', 'campaign', 'other'],
      message: 'Invalid lead source'
    }
  },
  budget: {
    type: String,
    enum: ['under-10k', '10k-25k', '25k-50k', '50k-1l', 'above-1l', 'not-disclosed']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Status & Assignment
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'closed-won', 'closed-lost'],
    default: 'new',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  assignedAgentName: {
    type: String,
    trim: true
  },

  // Follow-up & Notes
  followUpDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Activity Timeline
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'status-change']
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Conversion tracking
  convertedToClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  convertedAt: {
    type: Date
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastContactedAt: {
    type: Date
  },
  expectedCloseDate: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });

// Virtual field: Days since created
leadSchema.virtual('daysOld').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual field: Is overdue (if follow-up date passed)
leadSchema.virtual('isOverdue').get(function() {
  return this.followUpDate && this.followUpDate < Date.now();
});

// Pre-save middleware: Update lastContactedAt when status changes
leadSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'new') {
    this.lastContactedAt = Date.now();
  }
  next();
});

// Static method: Get lead statistics
leadSchema.statics.getStatistics = async function(userId = null) {
  const match = userId ? { assignedTo: userId } : {};
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    closedWon: 0,
    closedLost: 0
  };

  stats.forEach(stat => {
    result.total += stat.count;
    switch(stat._id) {
      case 'new': result.new = stat.count; break;
      case 'contacted': result.contacted = stat.count; break;
      case 'qualified': result.qualified = stat.count; break;
      case 'proposal': result.proposal = stat.count; break;
      case 'closed-won': result.closedWon = stat.count; break;
      case 'closed-lost': result.closedLost = stat.count; break;
    }
  });

  return result;
};

// Instance method: Add activity
leadSchema.methods.addActivity = function(type, description, userId) {
  this.activities.push({
    type,
    description,
    performedBy: userId,
    performedAt: new Date()
  });
  return this.save();
};

// Instance method: Convert to client
leadSchema.methods.convertToClient = function(clientId) {
  this.status = 'closed-won';
  this.convertedToClientId = clientId;
  this.convertedAt = new Date();
  return this.save();
};

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
