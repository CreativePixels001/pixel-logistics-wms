/**
 * Report Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Report Basic Info
  reportName: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['sales', 'claims', 'renewals', 'commission', 'performance', 'financial', 'custom']
  },
  description: String,

  // Report Period
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // Filters Applied
  filters: {
    insuranceType: [String],
    clientSegment: [String],
    agentId: mongoose.Schema.Types.ObjectId,
    status: [String],
    minAmount: Number,
    maxAmount: Number
  },

  // Report Data
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  summary: {
    totalRecords: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    metrics: mongoose.Schema.Types.Mixed
  },

  // Generation Details
  generatedBy: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },

  // File Storage
  fileUrl: String,
  fileSize: Number,

  // Status
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'expired'],
    default: 'generating'
  },
  error: String,

  // Access Control
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [String],
  expiresAt: Date,

  // Scheduling
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  nextRunDate: Date

}, {
  timestamps: true
});

// Indexes
reportSchema.index({ reportType: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ expiresAt: 1 });

// Virtual: isExpired
reportSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static Methods
reportSchema.statics.findByType = function(reportType) {
  return this.find({ reportType, status: 'completed' }).sort({ createdAt: -1 });
};

reportSchema.statics.findByUser = function(userId) {
  return this.find({ generatedBy: userId }).sort({ createdAt: -1 });
};

reportSchema.statics.findScheduled = function() {
  return this.find({ 
    isScheduled: true, 
    nextRunDate: { $lte: new Date() }
  });
};

reportSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ 
    expiresAt: { $lt: new Date() }
  });
};

// Instance Methods
reportSchema.methods.markCompleted = function(fileUrl, fileSize) {
  this.status = 'completed';
  this.fileUrl = fileUrl;
  this.fileSize = fileSize;
  return this.save();
};

reportSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  return this.save();
};

reportSchema.methods.updateSchedule = function() {
  if (!this.isScheduled || !this.scheduleFrequency) return;

  const now = new Date();
  switch (this.scheduleFrequency) {
    case 'daily':
      this.nextRunDate = new Date(now.setDate(now.getDate() + 1));
      break;
    case 'weekly':
      this.nextRunDate = new Date(now.setDate(now.getDate() + 7));
      break;
    case 'monthly':
      this.nextRunDate = new Date(now.setMonth(now.getMonth() + 1));
      break;
    case 'quarterly':
      this.nextRunDate = new Date(now.setMonth(now.getMonth() + 3));
      break;
    case 'yearly':
      this.nextRunDate = new Date(now.setFullYear(now.getFullYear() + 1));
      break;
  }
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
