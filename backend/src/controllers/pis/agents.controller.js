/**
 * Agents Controller
 * Pixel Safe Insurance Portal
 */

const Agent = require('../../models/pis/Agent');
const bcrypt = require('bcryptjs');

// Create new agent
exports.createAgent = async (req, res) => {
  try {
    // Hash password before saving
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const agent = await Agent.create(req.body);
    
    // Don't return password in response
    agent.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create agent',
      error: error.message
    });
  }
};

// Get all agents
exports.getAllAgents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      role, 
      department,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (role) query.role = role;
    if (department) query.department = department;

    const skip = (page - 1) * limit;

    const agents = await Agent.find(query)
      .select('-password')
      .populate('reportingManager', 'firstName lastName agentId')
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Agent.countDocuments(query);

    res.json({
      success: true,
      data: agents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: error.message
    });
  }
};

// Get agent by ID
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .select('-password')
      .populate('reportingManager', 'firstName lastName agentId email');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent details',
      error: error.message
    });
  }
};

// Update agent
exports.updateAgent = async (req, res) => {
  try {
    // Don't allow password update through this endpoint
    delete req.body.password;
    delete req.body.agentId; // Don't allow changing agent ID

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update agent',
      error: error.message
    });
  }
};

// Delete agent (soft delete)
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { status: 'terminated' },
      { new: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Agent deactivated successfully',
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent',
      error: error.message
    });
  }
};

// Get agent statistics
exports.getAgentStats = async (req, res) => {
  try {
    const stats = await Agent.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byRole: [
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ],
          byDepartment: [
            { $group: { _id: '$department', count: { $sum: 1 } } }
          ],
          performance: [
            {
              $group: {
                _id: null,
                totalAgents: { $sum: 1 },
                activeAgents: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                totalPolicies: { $sum: '$performance.totalPoliciesIssued' },
                totalPremium: { $sum: '$performance.totalPremiumCollected' },
                totalCommission: { $sum: '$performance.totalCommissionEarned' },
                avgConversionRate: { $avg: '$performance.conversionRate' }
              }
            }
          ],
          topPerformers: [
            { $match: { status: 'active' } },
            { $sort: { 'performance.totalPremiumCollected': -1 } },
            { $limit: 5 },
            {
              $project: {
                fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                agentId: 1,
                totalPremium: '$performance.totalPremiumCollected',
                totalPolicies: '$performance.totalPoliciesIssued',
                conversionRate: '$performance.conversionRate'
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get agent performance dashboard
exports.getAgentPerformance = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Calculate target achievement percentages
    const targetProgress = {
      leads: agent.monthlyTargets.leads > 0 
        ? ((agent.performance.totalLeads / agent.monthlyTargets.leads) * 100).toFixed(2)
        : 0,
      policies: agent.monthlyTargets.policies > 0
        ? ((agent.performance.totalPoliciesIssued / agent.monthlyTargets.policies) * 100).toFixed(2)
        : 0,
      premium: agent.monthlyTargets.premium > 0
        ? ((agent.performance.totalPremiumCollected / agent.monthlyTargets.premium) * 100).toFixed(2)
        : 0,
      clients: agent.monthlyTargets.clients > 0
        ? ((agent.performance.totalClients / agent.monthlyTargets.clients) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          name: agent.fullName,
          agentId: agent.agentId,
          role: agent.role,
          department: agent.department
        },
        performance: agent.performance,
        targets: agent.monthlyTargets,
        targetProgress,
        licenseStatus: agent.licenseStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: error.message
    });
  }
};

// Update agent performance metrics
exports.updatePerformance = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.updatePerformance(req.body);

    res.json({
      success: true,
      message: 'Performance metrics updated successfully',
      data: agent.performance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update performance',
      error: error.message
    });
  }
};

// Login agent
exports.loginAgent = async (req, res) => {
  try {
    const { agentId, email, password } = req.body;

    // Find agent by agentId or email
    const agent = await Agent.findOne({
      $or: [
        { agentId: agentId?.toUpperCase() },
        { email: email?.toLowerCase() }
      ]
    }).select('+password');

    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if agent is active
    if (agent.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${agent.status}. Please contact administrator.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, agent.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Record login
    await agent.recordLogin(
      req.ip,
      req.headers['user-agent'],
      req.headers['x-forwarded-for'] || req.connection.remoteAddress
    );

    // Remove password from response
    agent.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        agent,
        session: {
          agentId: agent.agentId,
          role: agent.role,
          permissions: agent.permissions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get expiring licenses
exports.getExpiringLicenses = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const agents = await Agent.getExpiringLicenses(parseInt(days));

    res.json({
      success: true,
      data: agents.map(agent => ({
        id: agent._id,
        name: agent.fullName,
        agentId: agent.agentId,
        email: agent.email,
        licenseNumber: agent.licenseNumber,
        licenseExpiryDate: agent.licenseExpiryDate,
        daysToExpiry: Math.ceil((new Date(agent.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring licenses',
      error: error.message
    });
  }
};

// Get agent team (subordinates)
exports.getAgentTeam = async (req, res) => {
  try {
    const team = await Agent.find({ reportingManager: req.params.id })
      .select('-password')
      .sort('firstName');

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const agent = await Agent.findById(req.params.id).select('+password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, agent.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    agent.password = await bcrypt.hash(newPassword, salt);
    agent.lastPasswordChange = new Date();

    await agent.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

module.exports = exports;
