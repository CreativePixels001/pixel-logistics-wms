/**
 * Claims Controller
 * Handles all claim-related operations
 */

const Claim = require('../../models/pis/Claim');
const Policy = require('../../models/pis/Policy');
const Client = require('../../models/pis/Client');
const logger = console;

// Create new claim
exports.createClaim = async (req, res) => {
  try {
    const claimData = req.body;

    // Verify policy exists
    const policy = await Policy.findById(claimData.policyId);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Auto-populate from policy if not provided
    if (!claimData.policyNumber) claimData.policyNumber = policy.policyNumber;
    if (!claimData.clientId) claimData.clientId = policy.clientId;
    if (!claimData.clientName) claimData.clientName = policy.clientName;
    if (!claimData.clientEmail) claimData.clientEmail = policy.clientEmail;
    if (!claimData.clientPhone) claimData.clientPhone = policy.clientPhone;
    if (!claimData.insuranceType) claimData.insuranceType = policy.insuranceType;

    // Create claim
    const claim = await Claim.create(claimData);

    // Update policy claim count
    await Policy.findByIdAndUpdate(claimData.policyId, {
      $inc: { 
        claimsCount: 1,
        totalClaimsAmount: claim.claimAmount 
      },
      $push: {
        activities: {
          type: 'claim-filed',
          description: `Claim filed: ${claim.claimNumber}`,
          performedBy: req.body.handledBy || 'System'
        }
      }
    });

    // Update client stats
    await Client.findByIdAndUpdate(claimData.clientId, {
      $inc: { 
        totalClaims: 1,
        totalClaimAmount: claim.claimAmount 
      }
    });

    logger.info(`Claim created: ${claim.claimNumber}`);

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: claim
    });
  } catch (error) {
    logger.error('Error creating claim:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create claim',
      error: error.message
    });
  }
};

// Get all claims
exports.getAllClaims = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      insuranceType, 
      claimType,
      priority,
      clientId,
      policyId,
      startDate,
      endDate,
      search 
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (insuranceType) query.insuranceType = insuranceType;
    if (claimType) query.claimType = claimType;
    if (priority) query.priority = priority;
    if (clientId) query.clientId = clientId;
    if (policyId) query.policyId = policyId;

    if (startDate || endDate) {
      query.claimDate = {};
      if (startDate) query.claimDate.$gte = new Date(startDate);
      if (endDate) query.claimDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { claimNumber: new RegExp(search, 'i') },
        { policyNumber: new RegExp(search, 'i') },
        { clientName: new RegExp(search, 'i') }
      ];
    }

    const claims = await Claim.find(query)
      .populate('policyId', 'policyNumber planName coverageAmount')
      .populate('clientId', 'fullName email phone')
      .sort({ claimDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Claim.countDocuments(query);

    res.json({
      success: true,
      data: claims,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message
    });
  }
};

// Get claim by ID
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('policyId')
      .populate('clientId');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.json({
      success: true,
      data: claim
    });
  } catch (error) {
    logger.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim',
      error: error.message
    });
  }
};

// Update claim
exports.updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        $push: {
          timeline: {
            status: req.body.status || 'updated',
            updatedBy: req.body.handledBy || 'System',
            remarks: req.body.updateRemarks || 'Claim updated'
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    logger.info(`Claim updated: ${claim.claimNumber}`);

    res.json({
      success: true,
      message: 'Claim updated successfully',
      data: claim
    });
  } catch (error) {
    logger.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim',
      error: error.message
    });
  }
};

// Approve claim
exports.approveClaim = async (req, res) => {
  try {
    const { approvedAmount, approvedBy, remarks } = req.body;

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.status = 'approved';
    claim.approvedAmount = approvedAmount;
    claim.deductionAmount = claim.claimAmount - approvedAmount;
    claim.timeline.push({
      status: 'approved',
      updatedBy: approvedBy || 'System',
      remarks: remarks || `Approved for ₹${approvedAmount}`
    });

    await claim.save();

    logger.info(`Claim approved: ${claim.claimNumber}`);

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: claim
    });
  } catch (error) {
    logger.error('Error approving claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve claim',
      error: error.message
    });
  }
};

// Reject claim
exports.rejectClaim = async (req, res) => {
  try {
    const { rejectionReason, rejectedBy } = req.body;

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.status = 'rejected';
    claim.rejectionReason = rejectionReason;
    claim.timeline.push({
      status: 'rejected',
      updatedBy: rejectedBy || 'System',
      remarks: rejectionReason
    });

    await claim.save();

    logger.info(`Claim rejected: ${claim.claimNumber}`);

    res.json({
      success: true,
      message: 'Claim rejected',
      data: claim
    });
  } catch (error) {
    logger.error('Error rejecting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject claim',
      error: error.message
    });
  }
};

// Settle claim
exports.settleClaim = async (req, res) => {
  try {
    const { settledAmount, paymentDetails, settledBy } = req.body;

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.status = 'settled';
    claim.settledAmount = settledAmount;
    claim.paymentDetails = { ...claim.paymentDetails, ...paymentDetails };
    claim.timeline.push({
      status: 'settled',
      updatedBy: settledBy || 'System',
      remarks: `Settled for ₹${settledAmount}`
    });

    await claim.save();

    // Update policy settled claims
    await Policy.findByIdAndUpdate(claim.policyId, {
      $inc: { totalClaimsSettled: settledAmount }
    });

    logger.info(`Claim settled: ${claim.claimNumber}`);

    res.json({
      success: true,
      message: 'Claim settled successfully',
      data: claim
    });
  } catch (error) {
    logger.error('Error settling claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to settle claim',
      error: error.message
    });
  }
};

// Get claims statistics
exports.getClaimStats = async (req, res) => {
  try {
    const stats = await Claim.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalClaims: { $sum: 1 },
                totalClaimAmount: { $sum: '$claimAmount' },
                totalApprovedAmount: { $sum: '$approvedAmount' },
                totalSettledAmount: { $sum: '$settledAmount' },
                avgClaimAmount: { $avg: '$claimAmount' },
                avgProcessingTime: { $avg: '$processingTime' }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$claimAmount' }
              }
            }
          ],
          byInsuranceType: [
            {
              $group: {
                _id: '$insuranceType',
                count: { $sum: 1 },
                totalClaimAmount: { $sum: '$claimAmount' },
                totalSettledAmount: { $sum: '$settledAmount' },
                avgSettlementRatio: {
                  $avg: {
                    $cond: [
                      { $eq: ['$claimAmount', 0] },
                      0,
                      { $multiply: [{ $divide: ['$settledAmount', '$claimAmount'] }, 100] }
                    ]
                  }
                }
              }
            }
          ],
          byClaimType: [
            {
              $group: {
                _id: '$claimType',
                count: { $sum: 1 },
                totalAmount: { $sum: '$claimAmount' }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    logger.error('Error fetching claim stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get pending claims
exports.getPendingClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      status: { $in: ['initiated', 'documented', 'under-review', 'investigating'] }
    })
      .populate('policyId', 'policyNumber planName')
      .populate('clientId', 'fullName phone email')
      .sort({ priority: -1, claimDate: 1 });

    res.json({
      success: true,
      data: claims,
      count: claims.length
    });
  } catch (error) {
    logger.error('Error fetching pending claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending claims',
      error: error.message
    });
  }
};

// Delete claim (soft delete)
exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'closed',
        $push: {
          timeline: {
            status: 'closed',
            updatedBy: 'System',
            remarks: 'Claim deleted/closed'
          }
        }
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    logger.info(`Claim deleted: ${claim.claimNumber}`);

    res.json({
      success: true,
      message: 'Claim deleted successfully',
      data: claim
    });
  } catch (error) {
    logger.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete claim',
      error: error.message
    });
  }
};
