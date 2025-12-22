const Carrier = require('../../models/Carrier');

/**
 * Create a new carrier
 */
exports.createCarrier = async (req, res) => {
  try {
    const carrierData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };
    
    const carrier = new Carrier(carrierData);
    await carrier.save();
    
    res.status(201).json({
      success: true,
      message: 'Carrier created successfully',
      data: carrier
    });
  } catch (error) {
    console.error('Create carrier error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'DOT number already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create carrier',
      error: error.message
    });
  }
};

/**
 * Get all carriers with filters
 */
exports.getCarriers = async (req, res) => {
  try {
    const {
      status,
      serviceType,
      region,
      isPreferred,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Build filter object
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (serviceType) {
      filters.serviceTypes = serviceType;
    }
    
    if (region) {
      filters.operatingRegions = region;
    }
    
    if (isPreferred !== undefined) {
      filters.isPreferred = isPreferred === 'true';
    }
    
    // Search in name, DOT number, MC number
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { dotNumber: { $regex: search, $options: 'i' } },
        { mcNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    // Execute query
    const carriers = await Carrier.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Carrier.countDocuments(filters);
    
    res.status(200).json({
      success: true,
      data: carriers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get carriers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve carriers',
      error: error.message
    });
  }
};

/**
 * Get top carriers ranked by performance
 */
exports.getTopCarriers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const carriers = await Carrier.getTopCarriers(limit);
    
    res.status(200).json({
      success: true,
      data: carriers
    });
  } catch (error) {
    console.error('Get top carriers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve top carriers',
      error: error.message
    });
  }
};

/**
 * Get carriers by service type
 */
exports.getCarriersByServiceType = async (req, res) => {
  try {
    const { serviceType, region } = req.query;
    
    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Service type is required'
      });
    }
    
    const carriers = await Carrier.findByServiceType(serviceType, region);
    
    res.status(200).json({
      success: true,
      data: carriers
    });
  } catch (error) {
    console.error('Get carriers by service type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve carriers',
      error: error.message
    });
  }
};

/**
 * Get single carrier by ID
 */
exports.getCarrierById = async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: 'Carrier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: carrier
    });
  } catch (error) {
    console.error('Get carrier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve carrier',
      error: error.message
    });
  }
};

/**
 * Update carrier
 */
exports.updateCarrier = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    const carrier = await Carrier.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: 'Carrier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Carrier updated successfully',
      data: carrier
    });
  } catch (error) {
    console.error('Update carrier error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update carrier',
      error: error.message
    });
  }
};

/**
 * Delete carrier
 */
exports.deleteCarrier = async (req, res) => {
  try {
    const carrier = await Carrier.findByIdAndDelete(req.params.id);
    
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: 'Carrier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Carrier deleted successfully'
    });
  } catch (error) {
    console.error('Delete carrier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete carrier',
      error: error.message
    });
  }
};

/**
 * Add rating to carrier
 */
exports.addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }
    
    const carrier = await Carrier.findById(req.params.id);
    
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: 'Carrier not found'
      });
    }
    
    await carrier.addRating(rating);
    
    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rating: carrier.rating,
        totalRatings: carrier.totalRatings
      }
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: error.message
    });
  }
};

/**
 * Update carrier performance
 */
exports.updatePerformance = async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    
    if (!carrier) {
      return res.status(404).json({
        success: false,
        message: 'Carrier not found'
      });
    }
    
    await carrier.updatePerformance(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Performance updated successfully',
      data: carrier
    });
  } catch (error) {
    console.error('Update performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update performance',
      error: error.message
    });
  }
};
