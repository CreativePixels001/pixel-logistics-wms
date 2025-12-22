/**
 * Deals Controller
 * Handles sales pipeline and deal management
 */

const Deal = require('../../models/pis/Deal');
const Lead = require('../../models/pis/Lead');
const Client = require('../../models/pis/Client');
const logger = console;

// Create new deal
exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create(req.body);

    logger.info(`Deal created: ${deal.dealNumber}`);

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    logger.error('Error creating deal:', error);
    
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
      message: 'Failed to create deal',
      error: error.message
    });
  }
};

// Get all deals
exports.getAllDeals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      stage, 
      status,
      insuranceType,
      priority,
      assignedTo,
      search 
    } = req.query;

    const query = {};

    if (stage) query.stage = stage;
    if (status) query.status = status;
    if (insuranceType) query.insuranceType = insuranceType;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$or = [
        { dealNumber: new RegExp(search, 'i') },
        { dealTitle: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') }
      ];
    }

    const deals = await Deal.find(query)
      .populate('leadId', 'fullName email phone')
      .populate('clientId', 'fullName email phone')
      .sort({ lastActivityDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Deal.countDocuments(query);

    res.json({
      success: true,
      data: deals,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deals',
      error: error.message
    });
  }
};

// Get deal by ID
exports.getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('leadId')
      .populate('clientId');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    logger.error('Error fetching deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deal',
      error: error.message
    });
  }
};

// Update deal
exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        lastActivityDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    logger.info(`Deal updated: ${deal.dealNumber}`);

    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: deal
    });
  } catch (error) {
    logger.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deal',
      error: error.message
    });
  }
};

// Move deal to different stage
exports.moveStage = async (req, res) => {
  try {
    const { stage, movedBy } = req.body;

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.moveStage(stage, movedBy);

    logger.info(`Deal ${deal.dealNumber} moved to ${stage}`);

    res.json({
      success: true,
      message: `Deal moved to ${stage}`,
      data: deal
    });
  } catch (error) {
    logger.error('Error moving deal stage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move deal',
      error: error.message
    });
  }
};

// Mark deal as won
exports.markWon = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.markWon(req.body);

    logger.info(`Deal won: ${deal.dealNumber}`);

    res.json({
      success: true,
      message: 'Deal marked as won',
      data: deal
    });
  } catch (error) {
    logger.error('Error marking deal as won:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark deal as won',
      error: error.message
    });
  }
};

// Mark deal as lost
exports.markLost = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.markLost(req.body);

    logger.info(`Deal lost: ${deal.dealNumber}`);

    res.json({
      success: true,
      message: 'Deal marked as lost',
      data: deal
    });
  } catch (error) {
    logger.error('Error marking deal as lost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark deal as lost',
      error: error.message
    });
  }
};

// Add follow-up
exports.addFollowUp = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.addFollowUp(req.body);

    res.json({
      success: true,
      message: 'Follow-up added successfully',
      data: deal
    });
  } catch (error) {
    logger.error('Error adding follow-up:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add follow-up',
      error: error.message
    });
  }
};

// Send proposal
exports.sendProposal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.sendProposal(req.body);

    logger.info(`Proposal sent for deal: ${deal.dealNumber}`);

    res.json({
      success: true,
      message: 'Proposal sent successfully',
      data: deal
    });
  } catch (error) {
    logger.error('Error sending proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send proposal',
      error: error.message
    });
  }
};

// Get pipeline statistics
exports.getPipelineStats = async (req, res) => {
  try {
    const stats = await Deal.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalDeals: { $sum: 1 },
                totalValue: { $sum: '$dealValue' },
                activeDeals: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                wonDeals: {
                  $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
                },
                lostDeals: {
                  $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
                },
                avgDealValue: { $avg: '$dealValue' },
                avgProbability: { $avg: '$probability' }
              }
            }
          ],
          byStage: [
            {
              $group: {
                _id: '$stage',
                count: { $sum: 1 },
                totalValue: { $sum: '$dealValue' },
                weightedValue: {
                  $sum: {
                    $multiply: ['$dealValue', { $divide: ['$probability', 100] }]
                  }
                }
              }
            }
          ],
          byInsuranceType: [
            {
              $group: {
                _id: '$insuranceType',
                count: { $sum: 1 },
                totalValue: { $sum: '$dealValue' },
                won: {
                  $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
                },
                lost: {
                  $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
                }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$dealValue' }
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
    logger.error('Error fetching pipeline stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get overdue deals
exports.getOverdueDeals = async (req, res) => {
  try {
    const deals = await Deal.find({
      status: 'active',
      expectedCloseDate: { $lt: new Date() }
    })
      .populate('leadId', 'fullName phone email')
      .populate('clientId', 'fullName phone email')
      .sort({ expectedCloseDate: 1 });

    res.json({
      success: true,
      data: deals,
      count: deals.length
    });
  } catch (error) {
    logger.error('Error fetching overdue deals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue deals',
      error: error.message
    });
  }
};

// Delete deal
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    logger.info(`Deal deleted: ${deal.dealNumber}`);

    res.json({
      success: true,
      message: 'Deal deleted successfully',
      data: deal
    });
  } catch (error) {
    logger.error('Error deleting deal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal',
      error: error.message
    });
  }
};
