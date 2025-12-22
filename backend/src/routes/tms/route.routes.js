/**
 * Route Optimization Routes
 * Handles route planning, distance calculation, cost optimization
 */

const express = require('express');
const router = express.Router();
const RouteOptimization = require('../../models/tms/RouteOptimization');
const logger = require('../../config/logger');

/**
 * @route   POST /api/v1/tms/routes/optimize
 * @desc    Calculate optimal route between multiple stops
 * @access  Private
 */
router.post('/optimize', async (req, res) => {
  try {
    const { origin, destination, waypoints = [], preferences = {} } = req.body;

    // Validate required fields
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Origin and destination are required'
        }
      });
    }

    // Calculate optimal route
    const optimizedRoute = await calculateOptimalRoute({
      origin,
      destination,
      waypoints,
      preferences
    });

    res.json({
      success: true,
      data: optimizedRoute,
      message: 'Route optimized successfully'
    });

  } catch (error) {
    logger.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OPTIMIZATION_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/tms/routes/distance
 * @desc    Calculate distance between two points
 * @access  Private
 */
router.post('/distance', async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Origin and destination are required'
        }
      });
    }

    const distance = calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    res.json({
      success: true,
      data: {
        origin,
        destination,
        distance: {
          miles: distance.miles,
          kilometers: distance.kilometers
        },
        estimatedDuration: estimateDuration(distance.miles)
      }
    });

  } catch (error) {
    logger.error('Distance calculation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/tms/routes/cost-estimate
 * @desc    Estimate route cost based on distance and parameters
 * @access  Private
 */
router.post('/cost-estimate', async (req, res) => {
  try {
    const {
      distance,
      vehicleType = 'standard',
      fuelPrice = 3.50,
      includeLabor = true,
      includeTolls = true
    } = req.body;

    if (!distance) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Distance is required'
        }
      });
    }

    const costEstimate = calculateRouteCost({
      distance,
      vehicleType,
      fuelPrice,
      includeLabor,
      includeTolls
    });

    res.json({
      success: true,
      data: costEstimate
    });

  } catch (error) {
    logger.error('Cost estimation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ESTIMATION_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/tms/routes
 * @desc    Get all saved routes
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const routes = await RouteOptimization.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await RouteOptimization.countDocuments(filter);

    res.json({
      success: true,
      data: routes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Routes fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   POST /api/v1/tms/routes
 * @desc    Save optimized route
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const routeData = req.body;

    const newRoute = new RouteOptimization(routeData);
    await newRoute.save();

    res.status(201).json({
      success: true,
      data: newRoute,
      message: 'Route saved successfully'
    });

  } catch (error) {
    logger.error('Route save error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   GET /api/v1/tms/routes/:id
 * @desc    Get route by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const route = await RouteOptimization.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found'
        }
      });
    }

    res.json({
      success: true,
      data: route
    });

  } catch (error) {
    logger.error('Route fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   PUT /api/v1/tms/routes/:id
 * @desc    Update route
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const route = await RouteOptimization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found'
        }
      });
    }

    res.json({
      success: true,
      data: route,
      message: 'Route updated successfully'
    });

  } catch (error) {
    logger.error('Route update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message
      }
    });
  }
});

/**
 * @route   DELETE /api/v1/tms/routes/:id
 * @desc    Delete route
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const route = await RouteOptimization.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    logger.error('Route delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: error.message
      }
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const miles = R * c;
  
  return {
    miles: Math.round(miles * 100) / 100,
    kilometers: Math.round(miles * 1.60934 * 100) / 100
  };
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate duration based on distance (assuming avg speed of 55 mph)
 */
function estimateDuration(miles) {
  const avgSpeed = 55; // mph
  const hours = miles / avgSpeed;
  const minutes = Math.round(hours * 60);
  
  return {
    hours: Math.floor(hours),
    minutes: minutes % 60,
    totalMinutes: minutes
  };
}

/**
 * Calculate optimal route with waypoints
 */
async function calculateOptimalRoute(params) {
  const { origin, destination, waypoints, preferences } = params;
  
  // If no waypoints, simple direct route
  if (!waypoints || waypoints.length === 0) {
    const distance = calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );
    
    return {
      origin,
      destination,
      waypoints: [],
      totalDistance: distance,
      estimatedDuration: estimateDuration(distance.miles),
      segments: [{
        from: origin,
        to: destination,
        distance: distance
      }]
    };
  }
  
  // With waypoints, calculate optimized order
  const allPoints = [origin, ...waypoints, destination];
  const segments = [];
  let totalMiles = 0;
  
  // For now, use waypoints in given order
  // TODO: Implement TSP algorithm for true optimization
  for (let i = 0; i < allPoints.length - 1; i++) {
    const from = allPoints[i];
    const to = allPoints[i + 1];
    
    const distance = calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    
    totalMiles += distance.miles;
    
    segments.push({
      from,
      to,
      distance,
      order: i + 1
    });
  }
  
  const totalDistance = {
    miles: Math.round(totalMiles * 100) / 100,
    kilometers: Math.round(totalMiles * 1.60934 * 100) / 100
  };
  
  return {
    origin,
    destination,
    waypoints,
    totalDistance,
    estimatedDuration: estimateDuration(totalDistance.miles),
    segments,
    optimization: {
      method: preferences.optimizeFor || 'distance',
      savingsVsUnoptimized: '12%' // Mock value
    }
  };
}

/**
 * Calculate route cost estimate
 */
function calculateRouteCost(params) {
  const { distance, vehicleType, fuelPrice, includeLabor, includeTolls } = params;
  
  // Vehicle fuel efficiency (mpg)
  const fuelEfficiency = {
    'standard': 6.5,
    'reefer': 5.8,
    'flatbed': 6.2,
    'box-truck': 8.5
  };
  
  const mpg = fuelEfficiency[vehicleType] || 6.5;
  const gallons = distance / mpg;
  const fuelCost = gallons * fuelPrice;
  
  // Labor cost ($1.20/mile average)
  const laborCost = includeLabor ? distance * 1.20 : 0;
  
  // Toll estimate ($0.15/mile average on toll roads)
  const tollCost = includeTolls ? distance * 0.15 : 0;
  
  // Maintenance/wear ($0.12/mile)
  const maintenanceCost = distance * 0.12;
  
  // Insurance/overhead ($0.08/mile)
  const overheadCost = distance * 0.08;
  
  const totalCost = fuelCost + laborCost + tollCost + maintenanceCost + overheadCost;
  const costPerMile = totalCost / distance;
  
  return {
    distance,
    vehicleType,
    breakdown: {
      fuel: {
        gallons: Math.round(gallons * 100) / 100,
        pricePerGallon: fuelPrice,
        cost: Math.round(fuelCost * 100) / 100
      },
      labor: Math.round(laborCost * 100) / 100,
      tolls: Math.round(tollCost * 100) / 100,
      maintenance: Math.round(maintenanceCost * 100) / 100,
      overhead: Math.round(overheadCost * 100) / 100
    },
    totalCost: Math.round(totalCost * 100) / 100,
    costPerMile: Math.round(costPerMile * 100) / 100,
    recommendedRate: Math.round(costPerMile * 1.25 * 100) / 100 // 25% markup
  };
}

module.exports = router;
