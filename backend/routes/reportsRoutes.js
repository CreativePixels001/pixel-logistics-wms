const express = require('express');
const router = express.Router();
const auth = require('../middleware/authSimple');

// Mock data storage
let reportTemplates = [
  {
    id: 1,
    templateName: 'Inventory Valuation Report',
    category: 'inventory',
    description: 'Detailed inventory value by product, category, and warehouse',
    parameters: ['warehouseId', 'category', 'dateRange'],
    outputFormats: ['pdf', 'excel', 'csv'],
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 2,
    templateName: 'Sales Order Performance',
    category: 'sales',
    description: 'Order fulfillment metrics, delivery times, and customer satisfaction',
    parameters: ['dateRange', 'customerId', 'status'],
    outputFormats: ['pdf', 'excel'],
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 3,
    templateName: 'Labor Productivity Analysis',
    category: 'labor',
    description: 'Worker efficiency, task completion rates, and productivity trends',
    parameters: ['dateRange', 'warehouseId', 'employeeId', 'role'],
    outputFormats: ['pdf', 'excel', 'csv'],
    createdAt: new Date('2024-01-01'),
    isActive: true
  }
];

let generatedReports = [
  {
    id: 1,
    reportNumber: 'RPT-001',
    templateId: 1,
    templateName: 'Inventory Valuation Report',
    parameters: {
      warehouseId: 'WH-001',
      dateRange: { from: '2024-01-01', to: '2024-01-31' }
    },
    status: 'completed',
    generatedBy: 'user1',
    generatedAt: new Date('2024-01-15'),
    fileUrl: '/reports/RPT-001.pdf',
    fileSize: '2.4 MB',
    format: 'pdf'
  }
];

let scheduledReports = [
  {
    id: 1,
    scheduleName: 'Weekly Inventory Summary',
    templateId: 1,
    frequency: 'weekly',
    schedule: 'Every Monday at 09:00',
    parameters: {
      warehouseId: 'WH-001'
    },
    recipients: ['manager@company.com', 'supervisor@company.com'],
    format: 'excel',
    isActive: true,
    nextRun: new Date('2024-01-22 09:00:00'),
    lastRun: new Date('2024-01-15 09:00:00'),
    createdAt: new Date('2024-01-01'),
    createdBy: 'user1'
  }
];

let dashboardKPIs = {
  warehouseUtilization: {
    current: 78,
    target: 85,
    trend: 'up',
    change: '+5%'
  },
  orderFulfillmentRate: {
    current: 96.5,
    target: 95,
    trend: 'up',
    change: '+1.2%'
  },
  inventoryAccuracy: {
    current: 99.2,
    target: 99,
    trend: 'stable',
    change: '0%'
  },
  averagePickTime: {
    current: 3.2,
    unit: 'minutes',
    target: 4,
    trend: 'down',
    change: '-0.3 min'
  },
  laborProductivity: {
    current: 92,
    target: 90,
    trend: 'up',
    change: '+3%'
  },
  customerSatisfaction: {
    current: 4.7,
    unit: 'out of 5',
    target: 4.5,
    trend: 'up',
    change: '+0.2'
  }
};

// ==================== REPORT TEMPLATES ====================

// Get all report templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { category, isActive } = req.query;

    let filteredTemplates = [...reportTemplates];

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    if (isActive !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.isActive === (isActive === 'true'));
    }

    res.json({
      success: true,
      data: filteredTemplates,
      total: filteredTemplates.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching report templates', 
      error: error.message 
    });
  }
});

// Get template details
router.get('/templates/:id', auth, async (req, res) => {
  try {
    const template = reportTemplates.find(t => t.id === parseInt(req.params.id));

    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Report template not found' 
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching template details', 
      error: error.message 
    });
  }
});

// Create custom report template
router.post('/templates', auth, async (req, res) => {
  try {
    const { templateName, category, description, parameters, outputFormats } = req.body;

    if (!templateName || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Template name and category are required' 
      });
    }

    const newTemplate = {
      id: reportTemplates.length + 1,
      templateName,
      category,
      description,
      parameters: parameters || [],
      outputFormats: outputFormats || ['pdf'],
      createdAt: new Date(),
      createdBy: req.user.userId,
      isActive: true
    };

    reportTemplates.push(newTemplate);

    res.status(201).json({
      success: true,
      message: 'Report template created successfully',
      data: newTemplate
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating report template', 
      error: error.message 
    });
  }
});

// ==================== REPORT GENERATION ====================

// Generate report
router.post('/generate', auth, async (req, res) => {
  try {
    const { templateId, parameters, format } = req.body;

    if (!templateId) {
      return res.status(400).json({ 
        success: false,
        message: 'Template ID is required' 
      });
    }

    const template = reportTemplates.find(t => t.id === parseInt(templateId));
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Report template not found' 
      });
    }

    // Simulate report generation
    const newReport = {
      id: generatedReports.length + 1,
      reportNumber: `RPT-${String(generatedReports.length + 1).padStart(3, '0')}`,
      templateId: template.id,
      templateName: template.templateName,
      parameters: parameters || {},
      status: 'completed', // pending, processing, completed, failed
      generatedBy: req.user.userId,
      generatedAt: new Date(),
      fileUrl: `/reports/RPT-${String(generatedReports.length + 1).padStart(3, '0')}.${format || 'pdf'}`,
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      format: format || 'pdf'
    };

    generatedReports.push(newReport);

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: newReport
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error generating report', 
      error: error.message 
    });
  }
});

// Get report generation history
router.get('/history', auth, async (req, res) => {
  try {
    const { templateId, status, generatedBy, startDate, endDate } = req.query;

    let filteredReports = [...generatedReports];

    if (templateId) {
      filteredReports = filteredReports.filter(r => r.templateId === parseInt(templateId));
    }
    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status);
    }
    if (generatedBy) {
      filteredReports = filteredReports.filter(r => r.generatedBy === generatedBy);
    }
    if (startDate) {
      filteredReports = filteredReports.filter(r => r.generatedAt >= new Date(startDate));
    }
    if (endDate) {
      filteredReports = filteredReports.filter(r => r.generatedAt <= new Date(endDate));
    }

    // Sort by generation date (newest first)
    filteredReports.sort((a, b) => b.generatedAt - a.generatedAt);

    res.json({
      success: true,
      data: filteredReports,
      total: filteredReports.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching report history', 
      error: error.message 
    });
  }
});

// Get specific report
router.get('/history/:id', auth, async (req, res) => {
  try {
    const report = generatedReports.find(r => r.id === parseInt(req.params.id));

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
    res.status(500).json({ 
      success: false,
      message: 'Error fetching report', 
      error: error.message 
    });
  }
});

// Export report (download)
router.get('/export/:id', auth, async (req, res) => {
  try {
    const report = generatedReports.find(r => r.id === parseInt(req.params.id));

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    // In real implementation, this would stream the actual file
    res.json({
      success: true,
      message: 'Report download initiated',
      data: {
        reportNumber: report.reportNumber,
        downloadUrl: report.fileUrl,
        fileSize: report.fileSize,
        format: report.format
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error exporting report', 
      error: error.message 
    });
  }
});

// ==================== SCHEDULED REPORTS ====================

// Create scheduled report
router.post('/schedule', auth, async (req, res) => {
  try {
    const { scheduleName, templateId, frequency, schedule, parameters, recipients, format } = req.body;

    if (!scheduleName || !templateId || !frequency || !recipients) {
      return res.status(400).json({ 
        success: false,
        message: 'Schedule name, template ID, frequency, and recipients are required' 
      });
    }

    const template = reportTemplates.find(t => t.id === parseInt(templateId));
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: 'Report template not found' 
      });
    }

    const newSchedule = {
      id: scheduledReports.length + 1,
      scheduleName,
      templateId: template.id,
      frequency, // daily, weekly, monthly, quarterly
      schedule,
      parameters: parameters || {},
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      format: format || 'pdf',
      isActive: true,
      nextRun: null, // Will be calculated based on frequency
      lastRun: null,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    scheduledReports.push(newSchedule);

    res.status(201).json({
      success: true,
      message: 'Report scheduled successfully',
      data: newSchedule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error scheduling report', 
      error: error.message 
    });
  }
});

// Get scheduled reports
router.get('/schedule', auth, async (req, res) => {
  try {
    const { isActive, frequency } = req.query;

    let filteredSchedules = [...scheduledReports];

    if (isActive !== undefined) {
      filteredSchedules = filteredSchedules.filter(s => s.isActive === (isActive === 'true'));
    }
    if (frequency) {
      filteredSchedules = filteredSchedules.filter(s => s.frequency === frequency);
    }

    res.json({
      success: true,
      data: filteredSchedules,
      total: filteredSchedules.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching scheduled reports', 
      error: error.message 
    });
  }
});

// Update scheduled report
router.put('/schedule/:id', auth, async (req, res) => {
  try {
    const schedule = scheduledReports.find(s => s.id === parseInt(req.params.id));

    if (!schedule) {
      return res.status(404).json({ 
        success: false,
        message: 'Scheduled report not found' 
      });
    }

    const { scheduleName, frequency, scheduleTime, parameters, recipients, format, isActive } = req.body;

    if (scheduleName) schedule.scheduleName = scheduleName;
    if (frequency) schedule.frequency = frequency;
    if (scheduleTime) schedule.schedule = scheduleTime;
    if (parameters) schedule.parameters = parameters;
    if (recipients) schedule.recipients = recipients;
    if (format) schedule.format = format;
    if (isActive !== undefined) schedule.isActive = isActive;

    schedule.updatedAt = new Date();
    schedule.updatedBy = req.user.userId;

    res.json({
      success: true,
      message: 'Scheduled report updated successfully',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating scheduled report', 
      error: error.message 
    });
  }
});

// Delete scheduled report
router.delete('/schedule/:id', auth, async (req, res) => {
  try {
    const index = scheduledReports.findIndex(s => s.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Scheduled report not found' 
      });
    }

    scheduledReports.splice(index, 1);

    res.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting scheduled report', 
      error: error.message 
    });
  }
});

// ==================== ANALYTICS & DASHBOARDS ====================

// Get dashboard KPIs
router.get('/analytics/dashboard', auth, async (req, res) => {
  try {
    const { warehouseId, dateRange } = req.query;

    // In real implementation, KPIs would be calculated from actual data
    res.json({
      success: true,
      data: {
        ...dashboardKPIs,
        filters: {
          warehouseId: warehouseId || 'All',
          dateRange: dateRange || 'Last 30 days'
        },
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard KPIs', 
      error: error.message 
    });
  }
});

// Get trend analysis
router.get('/analytics/trends', auth, async (req, res) => {
  try {
    const { metric, period } = req.query;

    // Mock trend data
    const trendData = {
      metric: metric || 'orderVolume',
      period: period || 'weekly',
      data: [
        { date: '2024-01-01', value: 245 },
        { date: '2024-01-08', value: 289 },
        { date: '2024-01-15', value: 312 },
        { date: '2024-01-22', value: 298 },
        { date: '2024-01-29', value: 335 }
      ],
      summary: {
        average: 295.8,
        peak: 335,
        low: 245,
        trend: 'increasing',
        percentageChange: '+36.7%'
      }
    };

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching trend analysis', 
      error: error.message 
    });
  }
});

// Get comparative analysis
router.get('/analytics/compare', auth, async (req, res) => {
  try {
    const { metric, compareBy } = req.query;

    // Mock comparative data
    const comparativeData = {
      metric: metric || 'productivity',
      compareBy: compareBy || 'warehouse',
      data: [
        { name: 'Warehouse A', value: 92, change: '+5%' },
        { name: 'Warehouse B', value: 88, change: '+2%' },
        { name: 'Warehouse C', value: 95, change: '+8%' },
        { name: 'Warehouse D', value: 85, change: '-1%' }
      ],
      summary: {
        best: 'Warehouse C',
        worst: 'Warehouse D',
        average: 90,
        standardDeviation: 4.2
      }
    };

    res.json({
      success: true,
      data: comparativeData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching comparative analysis', 
      error: error.message 
    });
  }
});

// Get predictive insights
router.get('/analytics/predictions', auth, async (req, res) => {
  try {
    const { metric, horizon } = req.query;

    // Mock predictive data
    const predictions = {
      metric: metric || 'demand',
      horizon: horizon || '30days',
      predictions: [
        { date: '2024-02-05', predicted: 320, confidence: 85 },
        { date: '2024-02-12', predicted: 345, confidence: 82 },
        { date: '2024-02-19', predicted: 358, confidence: 78 },
        { date: '2024-02-26', predicted: 340, confidence: 75 }
      ],
      insights: [
        'Peak demand expected in week of Feb 19',
        'Recommend increasing labor by 15% during peak',
        'Inventory levels should be maintained above 85%'
      ]
    };

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching predictive insights', 
      error: error.message 
    });
  }
});

// Export analytics data
router.post('/analytics/export', auth, async (req, res) => {
  try {
    const { dataType, format, dateRange } = req.body;

    if (!dataType) {
      return res.status(400).json({ 
        success: false,
        message: 'Data type is required' 
      });
    }

    // Simulate export
    const exportData = {
      exportNumber: `EXP-${String(Date.now()).slice(-6)}`,
      dataType,
      format: format || 'excel',
      dateRange,
      fileUrl: `/exports/${dataType}_${Date.now()}.${format || 'xlsx'}`,
      fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      generatedAt: new Date(),
      generatedBy: req.user.userId
    };

    res.json({
      success: true,
      message: 'Analytics data exported successfully',
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error exporting analytics data', 
      error: error.message 
    });
  }
});

module.exports = router;
