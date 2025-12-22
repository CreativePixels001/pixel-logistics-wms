/**
 * Reports Controller
 * Handles report generation and management
 */

const Report = require('../../models/pis/Report');
const Policy = require('../../models/pis/Policy');
const Claim = require('../../models/pis/Claim');
const Client = require('../../models/pis/Client');
const logger = console;

// Generate Report
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, filters = {} } = req.body;

    // Create report record
    const report = await Report.create({
      reportName: req.body.reportName || `${reportType} Report`,
      reportType,
      description: req.body.description,
      startDate,
      endDate,
      filters,
      generatedBy: req.body.generatedBy || 'System',
      format: req.body.format || 'pdf',
      expiresAt: req.body.expiresAt
    });

    // Generate report data based on type
    let data, summary;
    
    switch (reportType) {
      case 'sales':
        ({ data, summary } = await generateSalesReport(startDate, endDate, filters));
        break;
      case 'claims':
        ({ data, summary } = await generateClaimsReport(startDate, endDate, filters));
        break;
      case 'renewals':
        ({ data, summary } = await generateRenewalsReport(startDate, endDate, filters));
        break;
      case 'performance':
        ({ data, summary } = await generatePerformanceReport(startDate, endDate, filters));
        break;
      default:
        ({ data, summary } = await generateCustomReport(startDate, endDate, filters));
    }

    // Update report with data
    report.data = data;
    report.summary = summary;
    report.status = 'completed';
    await report.save();

    logger.info(`Report generated: ${report._id}`);

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Get All Reports
exports.getAllReports = async (req, res) => {
  try {
    const { reportType, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (reportType) query.reportType = reportType;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get Report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Schedule Report
exports.scheduleReport = async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      isScheduled: true,
      status: 'completed'
    });

    await report.updateSchedule();

    res.status(201).json({
      success: true,
      message: 'Report scheduled successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: error.message
    });
  }
};

// Get Report Statistics
exports.getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalReports = await Report.countDocuments();
    const scheduledReports = await Report.countDocuments({ isScheduled: true });

    res.json({
      success: true,
      data: {
        totalReports,
        scheduledReports,
        byType: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching report stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Helper Functions for Report Generation

async function generateSalesReport(startDate, endDate, filters) {
  const query = {
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: 'active'
  };
  
  if (filters.insuranceType) query.insuranceType = { $in: filters.insuranceType };

  const policies = await Policy.find(query).populate('clientId', 'fullName email');

  const summary = {
    totalRecords: policies.length,
    totalAmount: policies.reduce((sum, p) => sum + (p.premium?.totalPremium || 0), 0),
    metrics: {
      avgPremium: policies.length > 0 ? 
        policies.reduce((sum, p) => sum + (p.premium?.totalPremium || 0), 0) / policies.length : 0
    }
  };

  return { data: policies, summary };
}

async function generateClaimsReport(startDate, endDate, filters) {
  const query = {
    claimDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };
  
  if (filters.status) query.status = { $in: filters.status };

  const claims = await Claim.find(query)
    .populate('policyId', 'policyNumber insuranceType')
    .populate('clientId', 'fullName email');

  const summary = {
    totalRecords: claims.length,
    totalAmount: claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
    metrics: {
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      pending: claims.filter(c => c.status === 'pending').length
    }
  };

  return { data: claims, summary };
}

async function generateRenewalsReport(startDate, endDate, filters) {
  const query = {
    endDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: 'active'
  };

  const policies = await Policy.find(query).populate('clientId', 'fullName email phone');

  const summary = {
    totalRecords: policies.length,
    totalAmount: policies.reduce((sum, p) => sum + (p.premium?.totalPremium || 0), 0),
    metrics: {
      expiringSoon: policies.filter(p => p.isExpiringSoon).length
    }
  };

  return { data: policies, summary };
}

async function generatePerformanceReport(startDate, endDate, filters) {
  const policies = await Policy.countDocuments({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const claims = await Claim.countDocuments({
    claimDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const clients = await Client.countDocuments({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const data = { policies, claims, clients };
  const summary = {
    totalRecords: policies + claims + clients,
    metrics: data
  };

  return { data, summary };
}

async function generateCustomReport(startDate, endDate, filters) {
  return {
    data: { message: 'Custom report data' },
    summary: { totalRecords: 0 }
  };
}

module.exports = exports;
