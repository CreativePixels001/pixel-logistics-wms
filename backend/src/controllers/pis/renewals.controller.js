/**
 * Renewals Controller
 * Pixel Safe Insurance Portal
 * Handles renewal reminder and tracking operations
 */

const Renewal = require('../../models/pis/Renewal');
const Policy = require('../../models/pis/Policy');
const Client = require('../../models/pis/Client');

/**
 * Create a new renewal reminder
 */
exports.createRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.create(req.body);
    
    await renewal.populate('clientId policyId');
    
    res.status(201).json({
      success: true,
      message: 'Renewal reminder created successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Create renewal error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create renewal reminder',
      errors: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
};

/**
 * Get all renewals with filters
 */
exports.getAllRenewals = async (req, res) => {
  try {
    const {
      status,
      priority,
      insuranceType,
      clientId,
      policyId,
      assignedTo,
      startDate,
      endDate,
      daysRange
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (insuranceType) filters.insuranceType = insuranceType;
    if (clientId) filters.clientId = clientId;
    if (policyId) filters.policyId = policyId;
    if (assignedTo) filters.assignedTo = assignedTo;

    // Date range for expiry
    if (startDate || endDate) {
      filters.currentExpiryDate = {};
      if (startDate) filters.currentExpiryDate.$gte = new Date(startDate);
      if (endDate) filters.currentExpiryDate.$lte = new Date(endDate);
    }

    // Days range (upcoming renewals)
    if (daysRange) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(daysRange));
      filters.currentExpiryDate = { $gte: today, $lte: futureDate };
    }

    const renewals = await Renewal.find(filters)
      .populate('clientId', 'name email phone')
      .populate('policyId', 'policyNumber insuranceType policyType')
      .populate('assignedTo', 'name email')
      .populate('renewedPolicy.newPolicyId', 'policyNumber')
      .sort({ currentExpiryDate: 1 });

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals
    });
  } catch (error) {
    console.error('Get renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve renewals',
      error: error.message
    });
  }
};

/**
 * Get renewal by ID
 */
exports.getRenewalById = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id)
      .populate('clientId')
      .populate('policyId')
      .populate('assignedTo', 'name email phone')
      .populate('renewedPolicy.newPolicyId');

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: renewal
    });
  } catch (error) {
    console.error('Get renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve renewal',
      error: error.message
    });
  }
};

/**
 * Update renewal
 */
exports.updateRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.userId },
      { new: true, runValidators: true }
    ).populate('clientId policyId assignedTo');

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Renewal updated successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Update renewal error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update renewal',
      error: error.message
    });
  }
};

/**
 * Send renewal notification
 */
exports.sendNotification = async (req, res) => {
  try {
    const { type, recipientEmail, recipientPhone, subject, message, templateUsed } = req.body;

    const renewal = await Renewal.findById(req.params.id);
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    await renewal.addNotification({
      type,
      recipientEmail,
      recipientPhone,
      subject,
      message,
      templateUsed,
      status: 'sent'
    });

    await renewal.populate('clientId policyId');

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Record customer response
 */
exports.recordResponse = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    await renewal.recordResponse(req.body);
    await renewal.populate('clientId policyId');

    res.status(200).json({
      success: true,
      message: 'Customer response recorded successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Record response error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to record response',
      error: error.message
    });
  }
};

/**
 * Mark as renewed
 */
exports.markRenewed = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    await renewal.markRenewed(req.body);
    await renewal.populate('clientId policyId renewedPolicy.newPolicyId');

    res.status(200).json({
      success: true,
      message: 'Renewal marked as completed successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Mark renewed error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark renewal as completed',
      error: error.message
    });
  }
};

/**
 * Add follow-up
 */
exports.addFollowUp = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);
    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    await renewal.addFollowUp(req.body);
    await renewal.populate('clientId policyId');

    res.status(200).json({
      success: true,
      message: 'Follow-up added successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Add follow-up error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add follow-up',
      error: error.message
    });
  }
};

/**
 * Send bulk reminders
 */
exports.sendBulkReminders = async (req, res) => {
  try {
    const { daysBeforeExpiry, reminderType } = req.body;

    const renewals = await Renewal.findDueForReminder(daysBeforeExpiry);

    const results = {
      total: renewals.length,
      sent: 0,
      failed: 0,
      details: []
    };

    for (const renewal of renewals) {
      try {
        // Check if reminder already sent
        const reminderKey = reminderType || 'firstReminder';
        if (renewal.reminderSchedule[reminderKey]?.sent) {
          results.details.push({
            renewalId: renewal._id,
            status: 'skipped',
            reason: 'Already sent'
          });
          continue;
        }

        // Add notification
        await renewal.addNotification({
          type: 'email',
          recipientEmail: renewal.clientId.email,
          subject: `Policy Renewal Reminder - ${renewal.policyNumber}`,
          message: `Your policy is expiring in ${daysBeforeExpiry} days. Please renew to avoid interruption.`,
          templateUsed: 'renewal-reminder'
        });

        // Mark reminder as sent
        await renewal.markReminderSent(reminderKey);

        results.sent++;
        results.details.push({
          renewalId: renewal._id,
          status: 'sent',
          clientEmail: renewal.clientId.email
        });
      } catch (err) {
        results.failed++;
        results.details.push({
          renewalId: renewal._id,
          status: 'failed',
          error: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk reminders sent: ${results.sent} sent, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error('Send bulk reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk reminders',
      error: error.message
    });
  }
};

/**
 * Get renewal statistics
 */
exports.getRenewalStats = async (req, res) => {
  try {
    const [
      totalRenewals,
      statusStats,
      upcoming30Days,
      overdueRenewals,
      renewedCount,
      lapsedCount
    ] = await Promise.all([
      Renewal.countDocuments(),
      Renewal.getStatsByStatus(),
      Renewal.getUpcomingRenewals(30),
      Renewal.findOverdue(),
      Renewal.countDocuments({ status: 'renewed' }),
      Renewal.countDocuments({ status: 'lapsed' })
    ]);

    // Calculate renewal rate
    const totalProcessed = renewedCount + lapsedCount;
    const renewalRate = totalProcessed > 0 ? ((renewedCount / totalProcessed) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRenewals,
        renewedCount,
        lapsedCount,
        renewalRate: parseFloat(renewalRate),
        upcoming30Days: upcoming30Days.length,
        overdueCount: overdueRenewals.length,
        statusBreakdown: statusStats,
        upcomingRenewals: upcoming30Days.slice(0, 10) // Top 10
      }
    });
  } catch (error) {
    console.error('Get renewal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve renewal statistics',
      error: error.message
    });
  }
};

/**
 * Get pending renewals
 */
exports.getPendingRenewals = async (req, res) => {
  try {
    const renewals = await Renewal.findPending();

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals
    });
  } catch (error) {
    console.error('Get pending renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending renewals',
      error: error.message
    });
  }
};

/**
 * Get overdue renewals
 */
exports.getOverdueRenewals = async (req, res) => {
  try {
    const renewals = await Renewal.findOverdue();

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals
    });
  } catch (error) {
    console.error('Get overdue renewals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve overdue renewals',
      error: error.message
    });
  }
};

/**
 * Delete renewal
 */
exports.deleteRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: 'Renewal not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Renewal cancelled successfully',
      data: renewal
    });
  } catch (error) {
    console.error('Delete renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel renewal',
      error: error.message
    });
  }
};
