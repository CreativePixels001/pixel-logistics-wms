/**
 * DOT Compliance Model
 * Mongoose schema for DOT compliance tracking
 */

const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  // Identification
  recordId: {
    type: String,
    required: [true, 'Record ID is required'],
    unique: true,
    uppercase: true
  },
  
  // Type of Record
  type: {
    type: String,
    enum: [
      'hos_violation',        // Hours of Service
      'vehicle_inspection',   // Vehicle Inspection
      'driver_inspection',    // Driver Inspection
      'dot_inspection',       // DOT Roadside Inspection
      'drug_test',           // Drug/Alcohol Testing
      'license_renewal',     // License/Certification Renewal
      'medical_cert',        // Medical Certification
      'weight_violation',    // Weight Limit Violation
      'safety_inspection',   // Annual Safety Inspection
      'hazmat_violation',    // Hazmat Violation
      'logbook_violation',   // ELD/Logbook Violation
      'other'
    ],
    required: [true, 'Violation/inspection type is required']
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: [true, 'Severity level is required']
  },
  
  // Related Entity
  entity: {
    entityType: {
      type: String,
      enum: ['vehicle', 'driver', 'carrier', 'both'],
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vehicleId: String,    // For reference if not linked
    driverName: String    // For reference if not linked
  },
  
  // Incident Details
  incidentDate: {
    type: Date,
    required: [true, 'Incident date is required']
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  // Description
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  details: {
    type: String
  },
  
  // Citation/Fine Information
  citation: {
    citationNumber: String,
    issuingOfficer: String,
    issuingAgency: String,
    fineAmount: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  },
  
  // Status & Resolution
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'appealed', 'dismissed'],
    default: 'open',
    required: true
  },
  
  dueDate: Date,
  
  resolution: {
    resolvedDate: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String,
    actionTaken: String,
    cost: Number
  },
  
  // Impact on CSA Scores
  csaImpact: {
    category: {
      type: String,
      enum: [
        'unsafe_driving',
        'hos_compliance',
        'driver_fitness',
        'controlled_substances',
        'vehicle_maintenance',
        'hazmat_compliance',
        'crash_indicator'
      ]
    },
    points: Number,
    severity: Number
  },
  
  // Documentation
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Corrective Actions
  correctiveActions: [{
    action: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    notes: String
  }],
  
  // Metadata
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes
complianceSchema.index({ recordId: 1 });
complianceSchema.index({ type: 1 });
complianceSchema.index({ severity: 1 });
complianceSchema.index({ status: 1 });
complianceSchema.index({ incidentDate: -1 });
complianceSchema.index({ 'entity.vehicle': 1 });
complianceSchema.index({ 'entity.driver': 1 });
complianceSchema.index({ dueDate: 1 });

// Virtual for days until due
complianceSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to resolve violation
complianceSchema.methods.resolve = function(resolvedBy, notes, actionTaken, cost) {
  this.status = 'resolved';
  this.resolution = {
    resolvedDate: new Date(),
    resolvedBy,
    resolutionNotes: notes,
    actionTaken,
    cost
  };
  return this.save();
};

// Method to add corrective action
complianceSchema.methods.addCorrectiveAction = function(action) {
  this.correctiveActions.push(action);
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  return this.save();
};

// Static method to get compliance score
complianceSchema.statics.getComplianceScore = async function(entityId, entityType) {
  const filter = {};
  if (entityType === 'vehicle') {
    filter['entity.vehicle'] = entityId;
  } else if (entityType === 'driver') {
    filter['entity.driver'] = entityId;
  }

  const violations = await this.find(filter);
  const openViolations = violations.filter(v => v.status === 'open').length;
  const totalViolations = violations.length;

  if (totalViolations === 0) return 100;

  const score = Math.max(0, 100 - (openViolations / totalViolations * 100));
  return Math.round(score);
};

// Static method to get overall compliance statistics
complianceSchema.statics.getComplianceStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        openViolations: {
          $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
        },
        resolvedViolations: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        criticalIssues: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        },
        totalFines: { $sum: '$citation.fineAmount' },
        totalPoints: { $sum: '$citation.points' }
      }
    }
  ]);

  const result = stats[0] || {
    totalRecords: 0,
    openViolations: 0,
    resolvedViolations: 0,
    criticalIssues: 0,
    totalFines: 0,
    totalPoints: 0
  };

  // Calculate compliance score
  const complianceScore = result.totalRecords > 0
    ? Math.round(100 - (result.openViolations / result.totalRecords * 100))
    : 100;

  return { ...result, complianceScore };
};

// Static method to get violations by type
complianceSchema.statics.getViolationsByType = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        openCount: {
          $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get critical violations
complianceSchema.statics.getCriticalViolations = async function() {
  return this.find({
    severity: { $in: ['critical', 'high'] },
    status: { $in: ['open', 'in_progress'] }
  })
  .populate('entity.vehicle', 'vehicleId type')
  .populate('entity.driver', 'name email')
  .sort({ incidentDate: -1 });
};

const Compliance = mongoose.model('Compliance', complianceSchema);

module.exports = Compliance;
