/**
 * Fleet Vehicle Controller
 * Handles all fleet management operations
 */

const Vehicle = require('../../models/Vehicle');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * @desc    Get all vehicles
 * @route   GET /api/tms/fleet
 * @access  Protected
 */
exports.getVehicles = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .populate('currentDriver', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vehicle.countDocuments(filter);

    successResponse(res, {
      vehicles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }, 'Vehicles retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get vehicle by ID
 * @route   GET /api/tms/fleet/:id
 * @access  Protected
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentDriver', 'name email phone')
      .populate('createdBy', 'name email');

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    successResponse(res, vehicle, 'Vehicle retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create new vehicle
 * @route   POST /api/tms/fleet
 * @access  Protected
 */
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      createdBy: req.user?._id || new mongoose.Types.ObjectId()
    };

    const vehicle = await Vehicle.create(vehicleData);

    successResponse(res, vehicle, 'Vehicle created successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'Vehicle ID or VIN already exists', 400);
    }
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Update vehicle
 * @route   PUT /api/tms/fleet/:id
 * @access  Protected
 */
exports.updateVehicle = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user?._id
    };

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('currentDriver', 'name email');

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    successResponse(res, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/tms/fleet/:id
 * @access  Protected
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    successResponse(res, null, 'Vehicle deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get fleet statistics
 * @route   GET /api/tms/fleet/stats/overview
 * @access  Protected
 */
exports.getFleetStats = async (req, res) => {
  try {
    const stats = await Vehicle.getFleetStats();

    // Get vehicles by type
    const vehiclesByType = await Vehicle.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get maintenance due soon
    const maintenanceDue = await Vehicle.getMaintenanceDue(30);

    successResponse(res, {
      overview: stats,
      vehiclesByType,
      maintenanceDueSoon: maintenanceDue.length
    }, 'Fleet statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Add maintenance record
 * @route   POST /api/tms/fleet/:id/maintenance
 * @access  Protected
 */
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    await vehicle.addMaintenanceRecord(req.body);

    successResponse(res, vehicle, 'Maintenance record added successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Get maintenance records
 * @route   GET /api/tms/fleet/:id/maintenance
 * @access  Protected
 */
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    const records = vehicle.maintenance.records.sort((a, b) => b.date - a.date);

    successResponse(res, {
      vehicleId: vehicle.vehicleId,
      totalRecords: records.length,
      totalCost: vehicle.maintenance.totalMaintenanceCost,
      records
    }, 'Maintenance records retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update vehicle utilization
 * @route   POST /api/tms/fleet/:id/utilization
 * @access  Protected
 */
exports.updateUtilization = async (req, res) => {
  try {
    const { miles, loaded = true } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    await vehicle.updateUtilization(miles, loaded);

    successResponse(res, vehicle, 'Utilization updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Assign driver to vehicle
 * @route   PUT /api/tms/fleet/:id/assign-driver
 * @access  Protected
 */
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { currentDriver: driverId },
      { new: true }
    ).populate('currentDriver', 'name email phone');

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    successResponse(res, vehicle, 'Driver assigned successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * @desc    Get vehicles needing maintenance
 * @route   GET /api/tms/fleet/maintenance/due
 * @access  Protected
 */
exports.getMaintenanceDue = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const vehicles = await Vehicle.getMaintenanceDue(parseInt(days));

    successResponse(res, {
      count: vehicles.length,
      vehicles
    }, 'Maintenance due list retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update vehicle location
 * @route   PUT /api/tms/fleet/:id/location
 * @access  Protected
 */
exports.updateLocation = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { currentLocation: req.body },
      { new: true }
    );

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', 404);
    }

    successResponse(res, vehicle, 'Location updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};
