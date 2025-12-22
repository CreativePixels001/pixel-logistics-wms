const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authSimple');

// Mock database
let qualityInspections = [];
let qcCriteria = [];
let defects = [];

/**
 * @route   POST /api/quality/inspections
 * @desc    Create new quality inspection
 * @access  Private
 */
router.post('/inspections',
  auth,
  [
    body('receiptId').notEmpty().withMessage('Receipt ID required'),
    body('productId').notEmpty().withMessage('Product ID required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('inspectionType').isIn(['receiving', 'random', 'full', 'sampling']).withMessage('Invalid inspection type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { receiptId, productId, quantity, inspectionType, batchNumber, lotNumber } = req.body;

      const inspection = {
        id: `QI-${Date.now()}`,
        receiptId,
        productId,
        quantity,
        inspectionType,
        batchNumber,
        lotNumber,
        status: 'pending',
        inspectedBy: null,
        inspectedQuantity: 0,
        passedQuantity: 0,
        failedQuantity: 0,
        defects: [],
        notes: '',
        createdAt: new Date(),
        createdBy: req.user.username
      };

      qualityInspections.push(inspection);

      res.status(201).json({
        message: 'Inspection created successfully',
        inspection
      });

    } catch (error) {
      console.error('Create inspection error:', error);
      res.status(500).json({ message: 'Server error creating inspection' });
    }
  }
);

/**
 * @route   GET /api/quality/inspections
 * @desc    Get all inspections with filters
 * @access  Private
 */
router.get('/inspections', auth, async (req, res) => {
  try {
    const { status, inspectionType, productId, startDate, endDate } = req.query;

    let filtered = [...qualityInspections];

    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }
    if (inspectionType) {
      filtered = filtered.filter(i => i.inspectionType === inspectionType);
    }
    if (productId) {
      filtered = filtered.filter(i => i.productId === productId);
    }
    if (startDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) <= new Date(endDate));
    }

    res.json({
      total: filtered.length,
      inspections: filtered
    });

  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({ message: 'Server error fetching inspections' });
  }
});

/**
 * @route   GET /api/quality/inspections/:id
 * @desc    Get inspection by ID
 * @access  Private
 */
router.get('/inspections/:id', auth, async (req, res) => {
  try {
    const inspection = qualityInspections.find(i => i.id === req.params.id);

    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }

    res.json(inspection);

  } catch (error) {
    console.error('Get inspection error:', error);
    res.status(500).json({ message: 'Server error fetching inspection' });
  }
});

/**
 * @route   PUT /api/quality/inspections/:id/perform
 * @desc    Perform quality inspection
 * @access  Private
 */
router.put('/inspections/:id/perform',
  auth,
  [
    body('inspectedQuantity').isNumeric().withMessage('Inspected quantity required'),
    body('passedQuantity').isNumeric().withMessage('Passed quantity required'),
    body('failedQuantity').isNumeric().withMessage('Failed quantity required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const index = qualityInspections.findIndex(i => i.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ message: 'Inspection not found' });
      }

      const { inspectedQuantity, passedQuantity, failedQuantity, defects, notes, photos } = req.body;

      // Validate quantities
      if (passedQuantity + failedQuantity !== inspectedQuantity) {
        return res.status(400).json({ message: 'Passed + Failed must equal Inspected quantity' });
      }

      qualityInspections[index].inspectedQuantity = inspectedQuantity;
      qualityInspections[index].passedQuantity = passedQuantity;
      qualityInspections[index].failedQuantity = failedQuantity;
      qualityInspections[index].defects = defects || [];
      qualityInspections[index].notes = notes || '';
      qualityInspections[index].photos = photos || [];
      qualityInspections[index].status = failedQuantity > 0 ? 'failed' : 'passed';
      qualityInspections[index].inspectedBy = req.user.username;
      qualityInspections[index].inspectedAt = new Date();

      res.json({
        message: 'Inspection completed successfully',
        inspection: qualityInspections[index]
      });

    } catch (error) {
      console.error('Perform inspection error:', error);
      res.status(500).json({ message: 'Server error performing inspection' });
    }
  }
);

/**
 * @route   POST /api/quality/criteria
 * @desc    Create QC criteria
 * @access  Private (Manager/Admin)
 */
router.post('/criteria',
  auth,
  [
    body('productId').notEmpty().withMessage('Product ID required'),
    body('criteriaName').notEmpty().withMessage('Criteria name required'),
    body('inspectionPoints').isArray().withMessage('Inspection points must be array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, criteriaName, inspectionPoints, sampleSize, toleranceLevel } = req.body;

      const criteria = {
        id: `QC-${Date.now()}`,
        productId,
        criteriaName,
        inspectionPoints, // Array of {name, description, acceptanceCriteria, critical}
        sampleSize,
        toleranceLevel,
        active: true,
        createdAt: new Date(),
        createdBy: req.user.username
      };

      qcCriteria.push(criteria);

      res.status(201).json({
        message: 'QC criteria created successfully',
        criteria
      });

    } catch (error) {
      console.error('Create criteria error:', error);
      res.status(500).json({ message: 'Server error creating criteria' });
    }
  }
);

/**
 * @route   GET /api/quality/criteria
 * @desc    Get all QC criteria
 * @access  Private
 */
router.get('/criteria', auth, async (req, res) => {
  try {
    const { productId, active } = req.query;

    let filtered = [...qcCriteria];

    if (productId) {
      filtered = filtered.filter(c => c.productId === productId);
    }
    if (active !== undefined) {
      filtered = filtered.filter(c => c.active === (active === 'true'));
    }

    res.json({
      total: filtered.length,
      criteria: filtered
    });

  } catch (error) {
    console.error('Get criteria error:', error);
    res.status(500).json({ message: 'Server error fetching criteria' });
  }
});

/**
 * @route   POST /api/quality/defects
 * @desc    Log defect
 * @access  Private
 */
router.post('/defects',
  auth,
  [
    body('inspectionId').notEmpty().withMessage('Inspection ID required'),
    body('defectType').notEmpty().withMessage('Defect type required'),
    body('severity').isIn(['critical', 'major', 'minor']).withMessage('Invalid severity')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { inspectionId, defectType, severity, description, quantity, photo } = req.body;

      const defect = {
        id: `DEF-${Date.now()}`,
        inspectionId,
        defectType,
        severity,
        description,
        quantity,
        photo,
        status: 'open',
        reportedBy: req.user.username,
        reportedAt: new Date()
      };

      defects.push(defect);

      res.status(201).json({
        message: 'Defect logged successfully',
        defect
      });

    } catch (error) {
      console.error('Log defect error:', error);
      res.status(500).json({ message: 'Server error logging defect' });
    }
  }
);

/**
 * @route   GET /api/quality/defects
 * @desc    Get all defects
 * @access  Private
 */
router.get('/defects', auth, async (req, res) => {
  try {
    const { severity, status, startDate, endDate } = req.query;

    let filtered = [...defects];

    if (severity) {
      filtered = filtered.filter(d => d.severity === severity);
    }
    if (status) {
      filtered = filtered.filter(d => d.status === status);
    }
    if (startDate) {
      filtered = filtered.filter(d => new Date(d.reportedAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(d => new Date(d.reportedAt) <= new Date(endDate));
    }

    res.json({
      total: filtered.length,
      defects: filtered
    });

  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ message: 'Server error fetching defects' });
  }
});

/**
 * @route   GET /api/quality/reports/summary
 * @desc    Get quality summary report
 * @access  Private
 */
router.get('/reports/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filtered = [...qualityInspections];

    if (startDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(i => new Date(i.createdAt) <= new Date(endDate));
    }

    const summary = {
      totalInspections: filtered.length,
      passed: filtered.filter(i => i.status === 'passed').length,
      failed: filtered.filter(i => i.status === 'failed').length,
      pending: filtered.filter(i => i.status === 'pending').length,
      totalInspectedQuantity: filtered.reduce((sum, i) => sum + i.inspectedQuantity, 0),
      totalPassedQuantity: filtered.reduce((sum, i) => sum + i.passedQuantity, 0),
      totalFailedQuantity: filtered.reduce((sum, i) => sum + i.failedQuantity, 0),
      passRate: filtered.length > 0 
        ? ((filtered.filter(i => i.status === 'passed').length / filtered.length) * 100).toFixed(2) 
        : 0,
      defectsByType: {},
      defectsBySeverity: {
        critical: defects.filter(d => d.severity === 'critical').length,
        major: defects.filter(d => d.severity === 'major').length,
        minor: defects.filter(d => d.severity === 'minor').length
      }
    };

    res.json(summary);

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error generating summary' });
  }
});

module.exports = router;
