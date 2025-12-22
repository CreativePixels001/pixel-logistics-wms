/**
 * Leads Controller
 * Handles all lead management operations
 */

const Lead = require('../../models/pis/Lead');
const logger = require('../../config/logger');

/**
 * @desc    Get all leads with filters, pagination, and sorting
 * @route   GET /api/v1/pis/leads
 * @access  Private
 */
exports.getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      interestType,
      source,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (interestType) filter.interestType = interestType;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email')
        .lean(),
      Lead.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads
    });

  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/v1/pis/leads/:id
 * @access  Private
 */
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('convertedToClientId', 'fullName email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

/**
 * @desc    Create new lead
 * @route   POST /api/v1/pis/leads
 * @access  Private
 */
exports.createLead = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      interestType,
      source,
      budget,
      priority,
      assignedTo,
      followUpDate,
      notes
    } = req.body;

    // Check for duplicate email or phone
    const existingLead = await Lead.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this email or phone already exists',
        existingLead: {
          id: existingLead._id,
          fullName: existingLead.fullName,
          status: existingLead.status
        }
      });
    }

    // Create new lead
    const lead = await Lead.create({
      fullName,
      email,
      phone,
      company,
      interestType,
      source,
      budget,
      priority: priority || 'medium',
      assignedTo,
      followUpDate,
      notes,
      createdBy: req.user?.id, // From JWT middleware
      status: 'new'
    });

    // Add initial activity
    await lead.addActivity(
      'note',
      'Lead created',
      req.user?.id
    );

    logger.info(`New lead created: ${lead.fullName} (${lead._id})`);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });

  } catch (error) {
    logger.error('Error creating lead:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

/**
 * @desc    Update lead
 * @route   PUT /api/v1/pis/leads/:id
 * @access  Private
 */
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Track status change for activity log
    const oldStatus = lead.status;
    const newStatus = req.body.status;

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Add activity if status changed
    if (newStatus && oldStatus !== newStatus) {
      await updatedLead.addActivity(
        'status-change',
        `Status changed from ${oldStatus} to ${newStatus}`,
        req.user?.id
      );
    }

    logger.info(`Lead updated: ${updatedLead._id}`);

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });

  } catch (error) {
    logger.error('Error updating lead:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

/**
 * @desc    Delete lead
 * @route   DELETE /api/v1/pis/leads/:id
 * @access  Private
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.deleteOne();

    logger.info(`Lead deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

/**
 * @desc    Convert lead to client
 * @route   POST /api/v1/pis/leads/:id/convert
 * @access  Private
 */
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.status === 'closed-won') {
      return res.status(400).json({
        success: false,
        message: 'Lead already converted'
      });
    }

    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }

    await lead.convertToClient(clientId);
    await lead.addActivity(
      'status-change',
      'Lead converted to client',
      req.user?.id
    );

    logger.info(`Lead converted: ${lead._id} -> Client: ${clientId}`);

    res.status(200).json({
      success: true,
      message: 'Lead converted to client successfully',
      data: lead
    });

  } catch (error) {
    logger.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting lead',
      error: error.message
    });
  }
};

/**
 * @desc    Assign lead to agent
 * @route   POST /api/v1/pis/leads/:id/assign
 * @access  Private
 */
exports.assignLead = async (req, res) => {
  try {
    const { agentId, agentName } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: agentId,
        assignedAgentName: agentName
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.addActivity(
      'note',
      `Lead assigned to ${agentName}`,
      req.user?.id
    );

    logger.info(`Lead assigned: ${lead._id} -> Agent: ${agentName}`);

    res.status(200).json({
      success: true,
      message: 'Lead assigned successfully',
      data: lead
    });

  } catch (error) {
    logger.error('Error assigning lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning lead',
      error: error.message
    });
  }
};

/**
 * @desc    Add activity to lead
 * @route   POST /api/v1/pis/leads/:id/activity
 * @access  Private
 */
exports.addActivity = async (req, res) => {
  try {
    const { type, description } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.addActivity(type, description, req.user?.id);

    res.status(200).json({
      success: true,
      message: 'Activity added successfully',
      data: lead
    });

  } catch (error) {
    logger.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding activity',
      error: error.message
    });
  }
};

/**
 * @desc    Get lead statistics
 * @route   GET /api/v1/pis/leads/stats
 * @access  Private
 */
exports.getLeadStats = async (req, res) => {
  try {
    const { userId } = req.query;

    const stats = await Lead.getStatistics(userId || null);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching lead statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
