/**
 * Policies Controller
 * Handles all policy-related operations for PIS
 */

const Policy = require('../../models/pis/Policy');
const Client = require('../../models/pis/Client');
const logger = require('../../config/logger');

/**
 * Create a new policy
 * POST /api/v1/pis/policies
 */
exports.createPolicy = async (req, res) => {
  try {
    const policyData = req.body;

    // Verify client exists and get details
    if (policyData.clientId) {
      const client = await Client.findById(policyData.clientId);
      if (client) {
        policyData.clientName = client.fullName || client.companyName;
        policyData.clientEmail = client.email;
        policyData.clientPhone = client.phone;
        
        // Update client's policy count
        client.totalPolicies += 1;
        client.activePolicies += 1;
        client.totalPremiumPaid += policyData.premium?.totalPremium || 0;
        await client.save();
      }
    }

    // Create policy
    const policy = await Policy.create(policyData);

    logger.info(`New policy issued: ${policy.policyNumber} for client ${policy.clientName}`);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    logger.error('Error creating policy:', error);

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
      message: 'Failed to create policy',
      error: error.message
    });
  }
};

/**
 * Get all policies with pagination and filters
 * GET /api/v1/pis/policies
 */
exports.getAllPolicies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      insuranceType,
      clientId,
      agentId,
      search,
      expiring,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (insuranceType) filter.insuranceType = insuranceType;
    if (clientId) filter.clientId = clientId;
    if (agentId) filter.agentId = agentId;

    // Filter expiring policies
    if (expiring) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(expiring));
      filter.status = 'active';
      filter.endDate = { $gte: today, $lte: futureDate };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { policyNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { insurerName: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const policies = await Policy.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count
    const total = await Policy.countDocuments(filter);

    res.json({
      success: true,
      count: policies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: policies
    });
  } catch (error) {
    logger.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message
    });
  }
};

/**
 * Get single policy by ID
 * GET /api/v1/pis/policies/:id
 */
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('clientId', 'fullName email phone segment');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    logger.error('Error fetching policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy',
      error: error.message
    });
  }
};

/**
 * Update policy
 * PUT /api/v1/pis/policies/:id
 */
exports.updatePolicy = async (req, res) => {
  try {
    const updates = req.body;

    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    await policy.addActivity('note', 'Policy information updated', req.body.updatedBy || 'System');

    logger.info(`Policy updated: ${policy.policyNumber}`);

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    logger.error('Error updating policy:', error);

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
      message: 'Failed to update policy',
      error: error.message
    });
  }
};

/**
 * Cancel policy
 * DELETE /api/v1/pis/policies/:id
 */
exports.cancelPolicy = async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    await policy.cancelPolicy(reason || 'Policy cancelled', cancelledBy || 'System');

    // Update client's active policy count
    if (policy.clientId) {
      const client = await Client.findById(policy.clientId);
      if (client && client.activePolicies > 0) {
        client.activePolicies -= 1;
        await client.save();
      }
    }

    logger.info(`Policy cancelled: ${policy.policyNumber}`);

    res.json({
      success: true,
      message: 'Policy cancelled successfully',
      data: policy
    });
  } catch (error) {
    logger.error('Error cancelling policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel policy',
      error: error.message
    });
  }
};

/**
 * Get policy statistics
 * GET /api/v1/pis/policies/stats
 */
exports.getPolicyStats = async (req, res) => {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          expiredPolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          cancelledPolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalPremium: { $sum: '$premium.totalPremium' },
          totalCoverage: { $sum: '$coverageAmount' },
          totalClaims: { $sum: '$claimsCount' },
          totalClaimsAmount: { $sum: '$totalClaimsAmount' },
          healthPolicies: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'health'] }, 1, 0] }
          },
          motorPolicies: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'motor'] }, 1, 0] }
          },
          lifePolicies: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'life'] }, 1, 0] }
          },
          propertyPolicies: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'property'] }, 1, 0] }
          },
          travelPolicies: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'travel'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalPolicies: 0,
        activePolicies: 0,
        expiredPolicies: 0,
        cancelledPolicies: 0,
        totalPremium: 0,
        totalCoverage: 0,
        totalClaims: 0,
        totalClaimsAmount: 0,
        healthPolicies: 0,
        motorPolicies: 0,
        lifePolicies: 0,
        propertyPolicies: 0,
        travelPolicies: 0
      }
    });
  } catch (error) {
    logger.error('Error fetching policy stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Get expiring policies
 * GET /api/v1/pis/policies/expiring
 */
exports.getExpiringPolicies = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const policies = await Policy.findExpiring(parseInt(days));

    res.json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    logger.error('Error fetching expiring policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring policies',
      error: error.message
    });
  }
};

/**
 * Renew policy
 * POST /api/v1/pis/policies/:id/renew
 */
exports.renewPolicy = async (req, res) => {
  try {
    const oldPolicy = await Policy.findById(req.params.id);

    if (!oldPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Create new policy based on old one
    const newPolicyData = {
      ...oldPolicy.toObject(),
      _id: undefined,
      __v: undefined,
      policyNumber: undefined, // Will be auto-generated
      policyType: 'renewal',
      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate,
      premium: req.body.premium || oldPolicy.premium,
      paymentStatus: 'pending',
      renewedFromPolicy: oldPolicy._id,
      activities: []
    };

    const newPolicy = await Policy.create(newPolicyData);

    // Update old policy
    oldPolicy.renewedToPolicy = newPolicy._id;
    await oldPolicy.save();

    logger.info(`Policy renewed: ${oldPolicy.policyNumber} → ${newPolicy.policyNumber}`);

    res.status(201).json({
      success: true,
      message: 'Policy renewed successfully',
      data: newPolicy
    });
  } catch (error) {
    logger.error('Error renewing policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew policy',
      error: error.message
    });
  }
};

/**
 * Get user-specific policies
 * GET /api/v1/pis/policies/user/:userId
 */
exports.getUserPolicies = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all policies for this user/client
    const policies = await Policy.find({ clientId: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate statistics
    const stats = {
      active: 0,
      expiring: 0,
      totalCoverage: 0,
      pendingRenewal: 0
    };
    
    const today = new Date();
    const in60Days = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000));
    
    // Enrich policies with additional data
    const enrichedPolicies = policies.map(policy => {
      const endDate = new Date(policy.endDate);
      const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      let status = policy.status;
      if (policy.status === 'active') {
        if (daysUntilExpiry < 0) {
          status = 'expired';
          stats.pendingRenewal++;
        } else if (daysUntilExpiry <= 60) {
          status = 'expiring';
          stats.expiring++;
          stats.pendingRenewal++;
        } else {
          stats.active++;
        }
      }
      
      if (status === 'active' || status === 'expiring') {
        stats.totalCoverage += policy.coverageAmount || 0;
      }
      
      return {
        ...policy,
        daysUntilExpiry,
        computedStatus: status,
        eligibleForNCB: policy.claimsMade === 0
      };
    });
    
    res.json({
      success: true,
      count: enrichedPolicies.length,
      stats,
      policies: enrichedPolicies
    });
  } catch (error) {
    logger.error('Error fetching user policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user policies',
      error: error.message
    });
  }
};

