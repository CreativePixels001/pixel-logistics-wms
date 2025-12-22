/**
 * Clients Controller
 * Handles all client-related operations for PIS
 */

const Client = require('../../models/pis/Client');
const logger = require('../../config/logger');

/**
 * Create a new client
 * POST /api/v1/pis/clients
 */
exports.createClient = async (req, res) => {
  try {
    const clientData = req.body;

    // Create client
    const client = await Client.create(clientData);

    logger.info(`New client created: ${client.fullName} (${client._id})`);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    logger.error('Error creating client:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A client with this email already exists',
        errors: ['Email address is already registered']
      });
    }

    // Handle validation errors
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
      message: 'Failed to create client',
      error: error.message
    });
  }
};

/**
 * Get all clients with pagination and filters
 * GET /api/v1/pis/clients
 */
exports.getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      segment,
      kycStatus,
      assignedAgent,
      search,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (segment) filter.segment = segment;
    if (kycStatus) filter.kycStatus = kycStatus;
    if (assignedAgent) filter.assignedAgent = assignedAgent;

    // Add search functionality
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const clients = await Client.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count
    const total = await Client.countDocuments(filter);

    res.json({
      success: true,
      count: clients.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: clients
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

/**
 * Get single client by ID
 * GET /api/v1/pis/clients/:id
 */
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
};

/**
 * Update client
 * PUT /api/v1/pis/clients/:id
 */
exports.updateClient = async (req, res) => {
  try {
    const updates = req.body;

    // Find and update client
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Add activity log
    await client.addActivity('note', 'Client information updated', req.body.updatedBy || 'System');

    logger.info(`Client updated: ${client.fullName} (${client._id})`);

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    logger.error('Error updating client:', error);

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
      message: 'Failed to update client',
      error: error.message
    });
  }
};

/**
 * Delete client (soft delete - change status to inactive)
 * DELETE /api/v1/pis/clients/:id
 */
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.addActivity('note', 'Client deactivated', req.body.deletedBy || 'System');

    logger.info(`Client deactivated: ${client.fullName} (${client._id})`);

    res.json({
      success: true,
      message: 'Client deactivated successfully',
      data: client
    });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
};

/**
 * Get client statistics
 * GET /api/v1/pis/clients/stats
 */
exports.getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          verifiedKYC: {
            $sum: { $cond: [{ $eq: ['$kycStatus', 'verified'] }, 1, 0] }
          },
          totalPremium: { $sum: '$totalPremiumPaid' },
          individualClients: {
            $sum: { $cond: [{ $eq: ['$segment', 'individual'] }, 1, 0] }
          },
          familyClients: {
            $sum: { $cond: [{ $eq: ['$segment', 'family'] }, 1, 0] }
          },
          corporateClients: {
            $sum: { $cond: [{ $eq: ['$segment', 'corporate'] }, 1, 0] }
          },
          smeClients: {
            $sum: { $cond: [{ $eq: ['$segment', 'sme'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalClients: 0,
        activeClients: 0,
        verifiedKYC: 0,
        totalPremium: 0,
        individualClients: 0,
        familyClients: 0,
        corporateClients: 0,
        smeClients: 0
      }
    });
  } catch (error) {
    logger.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Add activity to client
 * POST /api/v1/pis/clients/:id/activity
 */
exports.addActivity = async (req, res) => {
  try {
    const { type, description, performedBy } = req.body;
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.addActivity(type, description, performedBy);

    res.json({
      success: true,
      message: 'Activity added successfully',
      data: client
    });
  } catch (error) {
    logger.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add activity',
      error: error.message
    });
  }
};
