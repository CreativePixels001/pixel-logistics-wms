/**
 * DOT Compliance Controller
 * Handles all compliance and violation operations
 */

const Compliance = require('../models/Compliance');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @desc    Get all compliance records
 * @route   GET /api/tms/compliance
 * @access  Protected
 */
exports.getComplianceRecords = async (req, res) => {
  try {
    const { type, severity, status, entityType, search, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (entityType) filter['entity.entityType'] = entityType;
    if (search) {
      filter.$or = [
        { recordId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'entity.vehicleId': { $regex: search, $options: 'i' } },
        { 'entity.driverName': { $regex: search, $options: 'i' } }
      ];
    }

    const records = await Compliance.find(filter)
      .populate('entity.vehicle', 'vehicleId type')
      .populate('entity.driver', 'name email')
      .populate('reportedBy', 'name email')
      .sort({ incidentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Compliance.countDocuments(filter);

    successResponse(res, {
      records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }, 'Compliance records retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get compliance record by ID
 * @route   GET /api/tms/compliance/:id
 * @access  Protected
 */
exports.getComplianceById = async (req, res) => {
  try {
    const record = await Compliance.findById(req.params.id)
      .populate('entity.vehicle', 'vehicleId type make model')
      .populate('entity.driver', 'name email phone')
      .populate('reportedBy', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .populate('correctiveActions.assignedTo', 'name email');

    if (!record) {
      return errorResponse(res, 'Compliance record not found', 404);
    }

    successResponse(res, record, 'Compliance record retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new compliance record
 * @route   POST /api/tms/compliance
 * @access  Protected
 */
exports.createComplianceRecord = async (req, res) => {
  try {
    const recordData = {
      ...req.body,
      reportedBy: req.user?._id || new mongoose.Types.ObjectId()
    };

    const record = await Compliance.create(recordData);

    successResponse(res, record, 'Compliance record created successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'Record ID already exists', 400);
    }
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Update compliance record
 * @route   PUT /api/tms/compliance/:id
 * @access  Protected
 */
exports.updateComplianceRecord = async (req, res) => {
  try {
    const record = await Compliance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('entity.vehicle', 'vehicleId type')
    .populate('entity.driver', 'name email');

    if (!record) {
      return errorResponse(res, 'Compliance record not found', 404);
    }

    successResponse(res, record, 'Compliance record updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Delete compliance record
 * @route   DELETE /api/tms/compliance/:id
 * @access  Protected
 */
exports.deleteComplianceRecord = async (req, res) => {
  try {
    const record = await Compliance.findByIdAndDelete(req.params.id);

    if (!record) {
      return errorResponse(res, 'Compliance record not found', 404);
    }

    successResponse(res, null, 'Compliance record deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get compliance statistics
 * @route   GET /api/tms/compliance/stats/overview
 * @access  Protected
 */
exports.getComplianceStats = async (req, res) => {
  try {
    const stats = await Compliance.getComplianceStats();
    const violationsByType = await Compliance.getViolationsByType();

    successResponse(res, {
      overview: stats,
      byType: violationsByType
    }, 'Compliance statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Resolve violation
 * @route   POST /api/tms/compliance/:id/resolve
 * @access  Protected
 */
exports.resolveViolation = async (req, res) => {
  try {
    const { notes, actionTaken, cost } = req.body;

    const record = await Compliance.findById(req.params.id);

    if (!record) {
      return errorResponse(res, 'Compliance record not found', 404);
    }

    await record.resolve(req.user?._id, notes, actionTaken, cost);

    successResponse(res, record, 'Violation resolved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Add corrective action
 * @route   POST /api/tms/compliance/:id/corrective-action
 * @access  Protected
 */
exports.addCorrectiveAction = async (req, res) => {
  try {
    const record = await Compliance.findById(req.params.id);

    if (!record) {
      return errorResponse(res, 'Compliance record not found', 404);
    }

    await record.addCorrectiveAction(req.body);

    successResponse(res, record, 'Corrective action added successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Get critical violations
 * @route   GET /api/tms/compliance/critical
 * @access  Protected
 */
exports.getCriticalViolations = async (req, res) => {
  try {
    const violations = await Compliance.getCriticalViolations();

    successResponse(res, {
      count: violations.length,
      violations
    }, 'Critical violations retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get compliance score for entity
 * @route   GET /api/tms/compliance/score/:entityType/:entityId
 * @access  Protected
 */
exports.getComplianceScore = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!['vehicle', 'driver'].includes(entityType)) {
      return errorResponse(res, 'Invalid entity type. Must be vehicle or driver', 400);
    }

    const score = await Compliance.getComplianceScore(entityId, entityType);

    successResponse(res, {
      entityType,
      entityId,
      complianceScore: score
    }, 'Compliance score calculated successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get violations by vehicle
 * @route   GET /api/tms/compliance/vehicle/:vehicleId
 * @access  Protected
 */
exports.getViolationsByVehicle = async (req, res) => {
  try {
    const violations = await Compliance.find({
      'entity.vehicle': req.params.vehicleId
    })
    .populate('reportedBy', 'name email')
    .sort({ incidentDate: -1 });

    successResponse(res, {
      vehicleId: req.params.vehicleId,
      count: violations.length,
      violations
    }, 'Vehicle violations retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get violations by driver
 * @route   GET /api/tms/compliance/driver/:driverId
 * @access  Protected
 */
exports.getViolationsByDriver = async (req, res) => {
  try {
    const violations = await Compliance.find({
      'entity.driver': req.params.driverId
    })
    .populate('entity.vehicle', 'vehicleId type')
    .populate('reportedBy', 'name email')
    .sort({ incidentDate: -1 });

    successResponse(res, {
      driverId: req.params.driverId,
      count: violations.length,
      violations
    }, 'Driver violations retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
