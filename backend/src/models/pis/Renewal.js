/**
 * Renewal Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 * Manages policy renewal reminders and tracking
 */

const mongoose = require('mongoose');

const renewalSchema = new mongoose.Schema({
  // Core References
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: [true, 'Policy reference is required'],
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required'],
    index: true
  },
  policyNumber: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // Renewal Details
  renewalNumber: {
    type: String,
    unique: true,
    trim: true
  },
  currentExpiryDate: {
    type: Date,
    required: [true, 'Current expiry date is required'],
    index: true
  },
  renewalDueDate: {
    type: Date,
    required: true
  },
  gracePeriodEndDate: {
    type: Date
  },
  
  // Policy Information
  insuranceType: {
    type: String,
    required: true,
    enum: ['health', 'motor', 'life', 'property', 'travel'],
    index: true
  },
  policyType: {
    type: String,
    required: true
  },
  currentPremium: {
    type: Number,
    required: true,
    min: 0
  },
  proposedPremium: {
    type: Number,
    min: 0
  },
  premiumChangePercentage: {
    type: Number,
    default: 0
  },

  // Status & Priority
  status: {
    type: String,
    enum: ['pending', 'notified', 'interested', 'not-interested', 'renewed', 'lapsed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Notification Tracking
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'call', 'letter'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipientEmail: String,
    recipientPhone: String,
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'opened', 'clicked'],
      default: 'sent'
    },
    deliveryStatus: String,
    errorMessage: String,
    templateUsed: String
  }],

  // Customer Response
  customerResponse: {
    interestedInRenewal: Boolean,
    responseDate: Date,
    responseMethod: {
      type: String,
      enum: ['phone', 'email', 'portal', 'agent', 'whatsapp']
    },
    comments: String,
    requestedChanges: [{
      field: String,
      currentValue: String,
      requestedValue: String
    }]
  },

  // Renewal Processing
  renewalQuote: {
    quoteNumber: String,
    quotedPremium: Number,
    quotedDate: Date,
    validUntil: Date,
    insurerName: String,
    additionalBenefits: [String],
    discountsApplied: [{
      type: String,
      amount: Number,
      percentage: Number
    }]
  },

  renewedPolicy: {
    newPolicyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    newPolicyNumber: String,
    renewedAt: Date,
    newExpiryDate: Date,
    finalPremium: Number,
    paymentMethod: String,
    paymentStatus: String
  },

  // Assignment & Follow-up
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  assignedAgentName: String,
  followUps: [{
    followUpDate: Date,
    followUpType: {
      type: String,
      enum: ['call', 'email', 'meeting', 'whatsapp']
    },
    notes: String,
    outcome: String,
    nextFollowUpDate: Date,
    completedAt: Date,
    completedBy: String
  }],

  // Reminder Schedule
  reminderSchedule: {
    firstReminder: {
      daysBeforeExpiry: { type: Number, default: 60 },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    secondReminder: {
      daysBeforeExpiry: { type: Number, default: 30 },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    thirdReminder: {
      daysBeforeExpiry: { type: Number, default: 15 },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    finalReminder: {
      daysBeforeExpiry: { type: Number, default: 7 },
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },

  // Additional Information
  notes: String,
  tags: [String],
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
renewalSchema.index({ currentExpiryDate: 1, status: 1 });
renewalSchema.index({ clientId: 1, status: 1 });
renewalSchema.index({ assignedTo: 1, status: 1 });
renewalSchema.index({ renewalDueDate: 1 });
renewalSchema.index({ 'renewedPolicy.renewedAt': 1 });

// Virtual Fields
renewalSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.currentExpiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.currentExpiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

renewalSchema.virtual('isOverdue').get(function() {
  return this.daysUntilExpiry < 0;
});

renewalSchema.virtual('isUrgent').get(function() {
  return this.daysUntilExpiry <= 7 && this.daysUntilExpiry >= 0;
});

renewalSchema.virtual('notificationCount').get(function() {
  return this.notifications ? this.notifications.length : 0;
});

renewalSchema.virtual('lastNotificationDate').get(function() {
  if (!this.notifications || this.notifications.length === 0) return null;
  const sortedNotifications = [...this.notifications].sort((a, b) => b.sentAt - a.sentAt);
  return sortedNotifications[0].sentAt;
});

renewalSchema.virtual('premiumChange').get(function() {
  if (!this.proposedPremium || !this.currentPremium) return 0;
  return this.proposedPremium - this.currentPremium;
});

// Pre-save Middleware
renewalSchema.pre('save', async function(next) {
  // Generate renewal number
  if (!this.renewalNumber) {
    const typePrefix = this.insuranceType ? this.insuranceType.substring(0, 2).toUpperCase() : 'RN';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000);
    this.renewalNumber = `REN-${typePrefix}-${timestamp}-${random}`;
  }

  // Calculate premium change percentage
  if (this.proposedPremium && this.currentPremium) {
    this.premiumChangePercentage = ((this.proposedPremium - this.currentPremium) / this.currentPremium) * 100;
  }

  // Set renewal due date (typically 30 days before expiry)
  if (!this.renewalDueDate && this.currentExpiryDate) {
    const dueDate = new Date(this.currentExpiryDate);
    dueDate.setDate(dueDate.getDate() - 30);
    this.renewalDueDate = dueDate;
  }

  // Set grace period end date (typically 30 days after expiry)
  if (!this.gracePeriodEndDate && this.currentExpiryDate) {
    const graceEnd = new Date(this.currentExpiryDate);
    graceEnd.setDate(graceEnd.getDate() + 30);
    this.gracePeriodEndDate = graceEnd;
  }

  // Auto-update priority based on days until expiry
  const days = this.daysUntilExpiry;
  if (days !== null) {
    if (days < 0) {
      this.priority = 'urgent';
      if (this.status === 'pending' || this.status === 'notified') {
        this.status = 'lapsed';
      }
    } else if (days <= 7) {
      this.priority = 'urgent';
    } else if (days <= 15) {
      this.priority = 'high';
    } else if (days <= 30) {
      this.priority = 'medium';
    }
  }

  next();
});

// Instance Methods
renewalSchema.methods.addNotification = function(notificationData) {
  this.notifications.push(notificationData);
  if (this.status === 'pending') {
    this.status = 'notified';
  }
  return this.save();
};

renewalSchema.methods.recordResponse = function(responseData) {
  this.customerResponse = {
    ...this.customerResponse,
    ...responseData,
    responseDate: new Date()
  };
  
  if (responseData.interestedInRenewal === true) {
    this.status = 'interested';
  } else if (responseData.interestedInRenewal === false) {
    this.status = 'not-interested';
  }
  
  return this.save();
};

renewalSchema.methods.markRenewed = function(renewalData) {
  this.status = 'renewed';
  this.renewedPolicy = {
    ...renewalData,
    renewedAt: new Date()
  };
  return this.save();
};

renewalSchema.methods.addFollowUp = function(followUpData) {
  this.followUps.push({
    ...followUpData,
    followUpDate: followUpData.followUpDate || new Date()
  });
  return this.save();
};

renewalSchema.methods.markReminderSent = function(reminderType) {
  if (this.reminderSchedule[reminderType]) {
    this.reminderSchedule[reminderType].sent = true;
    this.reminderSchedule[reminderType].sentAt = new Date();
  }
  return this.save();
};

// Static Methods
renewalSchema.statics.findDueForReminder = function(daysBeforeExpiry) {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + daysBeforeExpiry);
  
  return this.find({
    currentExpiryDate: {
      $gte: targetDate,
      $lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
    },
    status: { $in: ['pending', 'notified'] }
  }).populate('clientId policyId');
};

renewalSchema.statics.findPending = function() {
  return this.find({ 
    status: { $in: ['pending', 'notified', 'interested'] },
    currentExpiryDate: { $gte: new Date() }
  })
  .sort({ currentExpiryDate: 1 })
  .populate('clientId policyId assignedTo');
};

renewalSchema.statics.findOverdue = function() {
  return this.find({
    currentExpiryDate: { $lt: new Date() },
    status: { $in: ['pending', 'notified', 'interested'] }
  })
  .sort({ currentExpiryDate: 1 })
  .populate('clientId policyId');
};

renewalSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId })
    .sort({ currentExpiryDate: -1 })
    .populate('policyId renewedPolicy.newPolicyId');
};

renewalSchema.statics.getStatsByStatus = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCurrentPremium: { $sum: '$currentPremium' },
        totalProposedPremium: { $sum: '$proposedPremium' },
        avgPremium: { $avg: '$currentPremium' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

renewalSchema.statics.getUpcomingRenewals = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    currentExpiryDate: { $gte: today, $lte: futureDate },
    status: { $in: ['pending', 'notified', 'interested'] }
  })
  .sort({ currentExpiryDate: 1 })
  .populate('clientId policyId assignedTo');
};

const Renewal = mongoose.model('Renewal', renewalSchema);

module.exports = Renewal;
