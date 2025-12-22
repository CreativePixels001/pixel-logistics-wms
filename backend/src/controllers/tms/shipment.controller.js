const Shipment = require('../../models/Shipment');
const Carrier = require('../../models/Carrier');

/**
 * Create a new shipment
 */
exports.createShipment = async (req, res) => {
  try {
    const shipmentData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };
    
    // If carrier is provided, get carrier name for denormalization
    if (shipmentData.carrier) {
      const carrier = await Carrier.findById(shipmentData.carrier);
      if (!carrier) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }
      shipmentData.carrierName = carrier.name;
    }
    
    const shipment = new Shipment(shipmentData);
    await shipment.save();
    
    // Populate carrier and user details
    await shipment.populate('carrier', 'name dotNumber mcNumber rating onTimePercentage');
    await shipment.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

/**
 * Get all shipments with filters and pagination
 */
exports.getShipments = async (req, res) => {
  try {
    const {
      status,
      carrier,
      priority,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filters = { isActive: true };
    
    if (status) {
      filters.status = status;
    }
    
    if (carrier) {
      filters.carrier = carrier;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (startDate || endDate) {
      filters.pickupDate = {};
      if (startDate) filters.pickupDate.$gte = new Date(startDate);
      if (endDate) filters.pickupDate.$lte = new Date(endDate);
    }
    
    // Search in shipment ID, tracking number, origin/destination
    if (search) {
      filters.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'origin.city': { $regex: search, $options: 'i' } },
        { 'destination.city': { $regex: search, $options: 'i' } },
        { carrierName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    // Execute query
    const shipments = await Shipment.find(filters)
      .populate('carrier', 'name dotNumber mcNumber rating onTimePercentage')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Shipment.countDocuments(filters);
    
    res.status(200).json({
      success: true,
      data: shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipments',
      error: error.message
    });
  }
};

/**
 * Get single shipment by ID
 */
exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('carrier', 'name dotNumber mcNumber rating onTimePercentage contact')
      .populate('route')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('trackingEvents.updatedBy', 'firstName lastName');
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipment',
      error: error.message
    });
  }
};

/**
 * Update shipment
 */
exports.updateShipment = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    // If carrier is being updated, get new carrier name
    if (updates.carrier) {
      const carrier = await Carrier.findById(updates.carrier);
      if (!carrier) {
        return res.status(404).json({
          success: false,
          message: 'Carrier not found'
        });
      }
      updates.carrierName = carrier.name;
    }
    
    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    )
      .populate('carrier', 'name dotNumber mcNumber rating onTimePercentage')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update shipment',
      error: error.message
    });
  }
};

/**
 * Delete shipment (soft delete)
 */
exports.deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { 
        isActive: false,
        updatedBy: req.user._id
      },
      { new: true }
    );
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shipment',
      error: error.message
    });
  }
};

/**
 * Add tracking event to shipment
 */
exports.addTrackingEvent = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      isActive: true
    });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    const eventData = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    await shipment.addTrackingEvent(eventData);
    
    // Populate for response
    await shipment.populate('trackingEvents.updatedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Tracking event added successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Add tracking event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add tracking event',
      error: error.message
    });
  }
};

/**
 * Update shipment progress
 */
exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }
    
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      isActive: true
    });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    shipment.updatedBy = req.user._id;
    await shipment.updateProgress(progress);
    
    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: shipment.progress,
        status: shipment.status
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Shipment.getDashboardStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};
