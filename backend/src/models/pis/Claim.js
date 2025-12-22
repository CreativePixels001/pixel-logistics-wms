/**
 * Claim Model - MongoDB Schema
 * Pixel Safe Insurance Portal
 */

const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  // Claim Basic Information
  claimNumber: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Policy & Client Reference
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: [true, 'Policy ID is required']
  },
  policyNumber: {
    type: String,
    required: true
  },
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

  // Claim Details
  claimType: {
    type: String,
    required: [true, 'Claim type is required'],
    enum: {
      values: ['cashless', 'reimbursement', 'death', 'maturity', 'accidental', 'theft', 'damage', 'other'],
      message: 'Invalid claim type'
    }
  },
  insuranceType: {
    type: String,
    required: true,
    enum: ['health', 'motor', 'life', 'property', 'travel', 'marine', 'fire', 'other']
  },
  incidentDate: {
    type: Date,
    required: [true, 'Incident date is required']
  },
  claimDate: {
    type: Date,
    default: Date.now
  },
  intimationDate: {
    type: Date,
    default: Date.now
  },

  // Claim Amount
  claimAmount: {
    type: Number,
    required: [true, 'Claim amount is required'],
    min: [0, 'Claim amount must be positive']
  },
  approvedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deductionAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deductionReason: String,
  settledAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Status & Progress
  status: {
    type: String,
    enum: ['initiated', 'documented', 'under-review', 'investigating', 'approved', 'rejected', 'settled', 'closed'],
    default: 'initiated'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  rejectionReason: String,

  // Health Claim Specifics
  healthClaimDetails: {
    hospitalName: String,
    hospitalCity: String,
    admissionDate: Date,
    dischargeDate: Date,
    diseaseCategory: {
      type: String,
      enum: ['surgery', 'illness', 'accident', 'maternity', 'day-care', 'critical-illness', 'other']
    },
    treatmentType: {
      type: String,
      enum: ['inpatient', 'outpatient', 'day-care', 'domiciliary']
    },
    isCashless: {
      type: Boolean,
      default: false
    },
    preAuthNumber: String,
    finalBillAmount: Number
  },

  // Motor Claim Specifics
  motorClaimDetails: {
    accidentLocation: String,
    accidentCity: String,
    policeReportNumber: String,
    workshopName: String,
    workshopCity: String,
    estimatedRepairCost: Number,
    actualRepairCost: Number,
    surveyorName: String,
    surveyorReport: String,
    thirdPartyInvolved: {
      type: Boolean,
      default: false
    },
    thirdPartyDetails: String
  },

  // Life Claim Specifics
  lifeClaimDetails: {
    causeOfDeath: String,
    deathCertificateNumber: String,
    deathDate: Date,
    nomineeRelationship: String,
    nomineeName: String,
    nomineeAge: Number,
    postMortemDone: {
      type: Boolean,
      default: false
    },
    postMortemReport: String
  },

  // Property Claim Specifics
  propertyClaimDetails: {
    damageType: {
      type: String,
      enum: ['fire', 'flood', 'earthquake', 'theft', 'burglary', 'vandalism', 'other']
    },
    propertyAddress: String,
    damageDescription: String,
    surveyorReport: String,
    estimatedLoss: Number,
    salvageValue: Number
  },

  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: [
        'claim-form', 'policy-copy', 'id-proof', 'address-proof',
        'hospital-bills', 'discharge-summary', 'medical-reports', 'prescriptions',
        'fir-copy', 'police-report', 'rc-copy', 'driving-license', 'repair-estimate',
        'death-certificate', 'postmortem-report', 'nominee-id',
        'property-photos', 'surveyor-report', 'other'
      ]
    },
    documentName: String,
    documentUrl: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Payment Details
  paymentDetails: {
    paymentMode: {
      type: String,
      enum: ['neft', 'rtgs', 'imps', 'cheque', 'demand-draft', 'online']
    },
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,
    utrNumber: String,
    chequeNumber: String,
    paymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'initiated', 'completed', 'failed'],
      default: 'pending'
    }
  },

  // Surveyor/Investigator
  surveyorAssigned: {
    name: String,
    phone: String,
    email: String,
    assignedDate: Date,
    reportSubmittedDate: Date,
    surveyorRemarks: String
  },

  // TPA Details (Third Party Administrator)
  tpaDetails: {
    tpaName: String,
    tpaReferenceNumber: String,
    tpaContactPerson: String,
    tpaContactPhone: String
  },

  // Timeline
  timeline: [{
    status: String,
    updatedBy: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],

  // Agent/Handler
  handledBy: {
    type: String,
    default: 'System'
  },
  assignedTo: String,

  // Additional Information
  description: String,
  internalNotes: String,
  customerRemarks: String,
  
  // Flags
  isResubmission: {
    type: Boolean,
    default: false
  },
  originalClaimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  },
  isFraudulent: {
    type: Boolean,
    default: false
  },
  fraudulentRemarks: String,

  // Tags
  tags: [String]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
claimSchema.index({ claimNumber: 1 });
claimSchema.index({ policyId: 1 });
claimSchema.index({ clientId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ claimDate: -1 });
claimSchema.index({ insuranceType: 1 });

// Auto-generate claim number
claimSchema.pre('save', function(next) {
  if (!this.claimNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const typePrefix = this.insuranceType.substring(0, 2).toUpperCase();
    this.claimNumber = `CLM-${typePrefix}-${timestamp}-${random}`;
  }
  next();
});

// Virtuals
claimSchema.virtual('daysOpen').get(function() {
  if (this.status === 'settled' || this.status === 'closed') {
    return 0;
  }
  const now = new Date();
  const claimDate = this.claimDate || this.createdAt;
  return Math.floor((now - claimDate) / (1000 * 60 * 60 * 24));
});

claimSchema.virtual('deductionPercentage').get(function() {
  if (this.claimAmount === 0) return 0;
  return ((this.deductionAmount / this.claimAmount) * 100).toFixed(2);
});

claimSchema.virtual('settlementRatio').get(function() {
  if (this.claimAmount === 0) return 0;
  return ((this.settledAmount / this.claimAmount) * 100).toFixed(2);
});

claimSchema.virtual('processingTime').get(function() {
  if (!this.paymentDetails?.paymentDate) return null;
  const claimDate = this.claimDate || this.createdAt;
  return Math.floor((this.paymentDetails.paymentDate - claimDate) / (1000 * 60 * 60 * 24));
});

// Methods
claimSchema.methods.addTimeline = function(status, updatedBy, remarks) {
  this.timeline.push({
    status,
    updatedBy,
    remarks,
    updatedAt: new Date()
  });
  return this.save();
};

claimSchema.methods.approve = function(approvedAmount, approvedBy, remarks) {
  this.status = 'approved';
  this.approvedAmount = approvedAmount;
  this.addTimeline('approved', approvedBy, remarks);
  return this.save();
};

claimSchema.methods.reject = function(reason, rejectedBy) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.addTimeline('rejected', rejectedBy, reason);
  return this.save();
};

claimSchema.methods.settle = function(settledAmount, paymentDetails, settledBy) {
  this.status = 'settled';
  this.settledAmount = settledAmount;
  this.paymentDetails = { ...this.paymentDetails, ...paymentDetails };
  this.addTimeline('settled', settledBy, `Settled amount: ₹${settledAmount}`);
  return this.save();
};

// Statics
claimSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('policyId clientId');
};

claimSchema.statics.findPending = function() {
  return this.find({ 
    status: { $in: ['initiated', 'documented', 'under-review', 'investigating'] } 
  }).populate('policyId clientId');
};

claimSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId }).populate('policyId');
};

claimSchema.statics.findByPolicy = function(policyId) {
  return this.find({ policyId }).populate('clientId');
};

claimSchema.statics.getStatsByInsuranceType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$insuranceType',
        totalClaims: { $sum: 1 },
        totalClaimAmount: { $sum: '$claimAmount' },
        totalSettledAmount: { $sum: '$settledAmount' },
        avgClaimAmount: { $avg: '$claimAmount' },
        avgSettlementRatio: { 
          $avg: { 
            $multiply: [
              { $divide: ['$settledAmount', '$claimAmount'] },
              100
            ]
          }
        }
      }
    }
  ]);
};

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
