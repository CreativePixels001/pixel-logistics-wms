/**
 * Document Model
 * MongoDB schema for file uploads and document management
 */

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentNumber: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'insurance',
      'w9',
      'authority',
      'certificate',
      'license',
      'medical',
      'background',
      'registration',
      'inspection',
      'pod',
      'bol',
      'invoice',
      'photo',
      'dot-inspection',
      'safety-rating',
      'violation',
      'other'
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['carrier', 'driver', 'vehicle', 'shipment', 'compliance'],
    required: true
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['carrier', 'driver', 'vehicle', 'shipment', 'compliance']
    },
    entityId: String,
    entityName: String
  },
  storage: {
    provider: {
      type: String,
      enum: ['local', 's3', 'azure', 'gcp'],
      default: 'local'
    },
    path: String,
    bucket: String,
    key: String,
    url: String,
    publicUrl: String
  },
  metadata: {
    expiryDate: Date,
    issueDate: Date,
    issuingAuthority: String,
    documentId: String,
    state: String,
    country: String,
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending', 'rejected', 'archived'],
    default: 'active'
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      id: String,
      name: String
    },
    verifiedAt: Date,
    notes: String
  },
  access: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowedRoles: [String],
    allowedUsers: [String]
  },
  thumbnail: {
    path: String,
    url: String
  },
  versions: [{
    version: Number,
    fileName: String,
    uploadedAt: Date,
    uploadedBy: {
      id: String,
      name: String
    },
    changes: String
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: Date,
  uploadedBy: {
    id: String,
    name: String,
    email: String
  },
  updatedBy: {
    id: String,
    name: String
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ documentNumber: 1 });
documentSchema.index({ category: 1, documentType: 1 });
documentSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ 'metadata.expiryDate': 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for expiry status
documentSchema.virtual('isExpired').get(function() {
  if (!this.metadata.expiryDate) return false;
  return new Date() > new Date(this.metadata.expiryDate);
});

// Virtual for days until expiry
documentSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.metadata.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.metadata.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if document needs renewal
documentSchema.methods.needsRenewal = function(daysThreshold = 30) {
  const daysLeft = this.daysUntilExpiry;
  return daysLeft !== null && daysLeft <= daysThreshold && daysLeft > 0;
};

// Method to increment download count
documentSchema.methods.recordDownload = async function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  await this.save();
};

// Static method to find expiring documents
documentSchema.statics.findExpiring = function(daysThreshold = 30) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    'metadata.expiryDate': {
      $gte: new Date(),
      $lte: thresholdDate
    },
    status: 'active'
  });
};

// Static method to find expired documents
documentSchema.statics.findExpired = function() {
  return this.find({
    'metadata.expiryDate': { $lt: new Date() },
    status: 'active'
  });
};

// Pre-save middleware to auto-update status based on expiry
documentSchema.pre('save', function(next) {
  if (this.metadata.expiryDate && new Date() > new Date(this.metadata.expiryDate)) {
    if (this.status === 'active') {
      this.status = 'expired';
    }
  }
  next();
});

// Pre-save middleware to generate document number
documentSchema.pre('save', async function(next) {
  if (!this.documentNumber) {
    const count = await this.constructor.countDocuments();
    const typePrefix = this.documentType.toUpperCase().substring(0, 3);
    this.documentNumber = `DOC-${typePrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
