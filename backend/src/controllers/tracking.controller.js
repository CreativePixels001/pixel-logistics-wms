/**
 * Tracking Controller
 * Handles real-time shipment tracking operations
 */

const Shipment = require('../models/Shipment');
const logger = require('../config/logger');
const { broadcastShipmentUpdate, sendAlert } = require('../services/websocket.service');

/**
 * Get shipment tracking details
 */
exports.getTrackingDetails = async (req, res) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await Shipment.findById(shipmentId)
      .select('shipmentNumber origin destination currentLocation status estimatedDelivery locationHistory statusHistory driver vehicle');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    // Calculate current progress
    const progress = calculateProgress(shipment);

    res.json({
      success: true,
      data: {
        shipment,
        progress,
        lastUpdate: shipment.locationHistory && shipment.locationHistory.length > 0
          ? shipment.locationHistory[shipment.locationHistory.length - 1].timestamp
          : null
      }
    });

  } catch (error) {
    logger.error('Get tracking details error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRACKING_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Update shipment location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { latitude, longitude, speed, heading } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Latitude and longitude are required'
        }
      });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      shipmentId,
      {
        $push: {
          locationHistory: {
            latitude,
            longitude,
            speed,
            heading,
            timestamp: new Date()
          }
        },
        currentLocation: { latitude, longitude }
      },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    // Broadcast to WebSocket clients
    broadcastShipmentUpdate(shipmentId, {
      type: 'location',
      location: { latitude, longitude, speed, heading }
    });

    // Check for route deviation
    const deviation = checkRouteDeviation(shipment);
    if (deviation.isDeviated) {
      sendAlert(shipmentId, {
        type: 'route_deviation',
        severity: 'medium',
        message: `Vehicle is ${deviation.distance} miles off route`,
        deviationDistance: deviation.distance
      });
    }

    // Update ETA if needed
    const updatedETA = recalculateETA(shipment);
    if (updatedETA) {
      shipment.estimatedDelivery = updatedETA;
      await shipment.save();
      
      broadcastShipmentUpdate(shipmentId, {
        type: 'eta',
        newETA: updatedETA
      });
    }

    res.json({
      success: true,
      data: {
        shipment,
        deviation,
        updatedETA
      },
      message: 'Location updated successfully'
    });

  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get location history
 */
exports.getLocationHistory = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { limit = 100 } = req.query;

    const shipment = await Shipment.findById(shipmentId)
      .select('locationHistory');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    const history = shipment.locationHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      data: {
        shipmentId,
        history,
        count: history.length
      }
    });

  } catch (error) {
    logger.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Simulate live tracking (for demo/testing)
 */
exports.simulateTracking = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { duration = 60 } = req.body; // Duration in seconds

    const shipment = await Shipment.findById(shipmentId);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    // Start simulation
    simulateLiveTracking(shipmentId, shipment, duration);

    res.json({
      success: true,
      message: `Tracking simulation started for ${duration} seconds`,
      data: {
        shipmentId,
        duration
      }
    });

  } catch (error) {
    logger.error('Simulate tracking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SIMULATION_ERROR',
        message: error.message
      }
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate shipment progress percentage
 */
function calculateProgress(shipment) {
  if (!shipment.origin || !shipment.destination || !shipment.currentLocation) {
    return 0;
  }

  const totalDistance = calculateDistance(
    shipment.origin.latitude,
    shipment.origin.longitude,
    shipment.destination.latitude,
    shipment.destination.longitude
  );

  const distanceFromOrigin = calculateDistance(
    shipment.origin.latitude,
    shipment.origin.longitude,
    shipment.currentLocation.latitude,
    shipment.currentLocation.longitude
  );

  const progress = Math.min(100, Math.round((distanceFromOrigin / totalDistance) * 100));
  return progress;
}

/**
 * Calculate distance using Haversine formula
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
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check for route deviation
 */
function checkRouteDeviation(shipment) {
  // Simplified deviation check
  // In production, use actual route polyline
  
  if (!shipment.currentLocation || !shipment.origin || !shipment.destination) {
    return { isDeviated: false, distance: 0 };
  }

  // Calculate if current location is significantly off the direct path
  // This is a simplified calculation
  const directDistance = calculateDistance(
    shipment.origin.latitude,
    shipment.origin.longitude,
    shipment.destination.latitude,
    shipment.destination.longitude
  );

  const totalActualDistance = 
    calculateDistance(
      shipment.origin.latitude,
      shipment.origin.longitude,
      shipment.currentLocation.latitude,
      shipment.currentLocation.longitude
    ) +
    calculateDistance(
      shipment.currentLocation.latitude,
      shipment.currentLocation.longitude,
      shipment.destination.latitude,
      shipment.destination.longitude
    );

  const deviation = totalActualDistance - directDistance;
  const isDeviated = deviation > 10; // More than 10 miles off

  return {
    isDeviated,
    distance: Math.round(deviation * 10) / 10
  };
}

/**
 * Recalculate ETA based on current location and speed
 */
function recalculateETA(shipment) {
  if (!shipment.currentLocation || !shipment.destination) {
    return null;
  }

  const remainingDistance = calculateDistance(
    shipment.currentLocation.latitude,
    shipment.currentLocation.longitude,
    shipment.destination.latitude,
    shipment.destination.longitude
  );

  // Get average speed from recent location history
  const recentLocations = shipment.locationHistory.slice(-5);
  let avgSpeed = 55; // Default 55 mph

  if (recentLocations.length >= 2) {
    const speeds = recentLocations
      .filter(loc => loc.speed && loc.speed > 0)
      .map(loc => loc.speed);
    
    if (speeds.length > 0) {
      avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }
  }

  // Calculate hours to destination
  const hoursRemaining = remainingDistance / avgSpeed;
  const newETA = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);

  // Only return if ETA changed significantly (more than 30 minutes)
  if (shipment.estimatedDelivery) {
    const timeDiff = Math.abs(newETA - shipment.estimatedDelivery) / (1000 * 60);
    if (timeDiff < 30) {
      return null; // ETA hasn't changed significantly
    }
  }

  return newETA;
}

/**
 * Simulate live tracking for demo purposes
 */
function simulateLiveTracking(shipmentId, shipment, duration) {
  const startLat = shipment.origin.latitude;
  const startLon = shipment.origin.longitude;
  const endLat = shipment.destination.latitude;
  const endLon = shipment.destination.longitude;

  const updateInterval = 2000; // Update every 2 seconds
  const totalUpdates = Math.floor(duration / (updateInterval / 1000));
  
  let currentUpdate = 0;

  const interval = setInterval(() => {
    if (currentUpdate >= totalUpdates) {
      clearInterval(interval);
      logger.info(`Simulation ended for shipment ${shipmentId}`);
      return;
    }

    const progress = currentUpdate / totalUpdates;
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLon = startLon + (endLon - startLon) * progress;
    
    // Add some random variation
    const latVariation = (Math.random() - 0.5) * 0.01;
    const lonVariation = (Math.random() - 0.5) * 0.01;
    
    const location = {
      latitude: currentLat + latVariation,
      longitude: currentLon + lonVariation,
      speed: 55 + (Math.random() - 0.5) * 10, // 50-60 mph
      heading: Math.random() * 360
    };

    // Broadcast location update
    broadcastShipmentUpdate(shipmentId, {
      type: 'location',
      location,
      progress: Math.round(progress * 100)
    });

    currentUpdate++;
  }, updateInterval);
}

module.exports = exports;
