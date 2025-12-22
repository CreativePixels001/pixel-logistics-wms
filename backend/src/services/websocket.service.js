/**
 * WebSocket Service
 * Real-time communication for shipment tracking and updates
 */

const socketIO = require('socket.io');
const logger = require('../config/logger');

let io;
const activeConnections = new Map();
const shipmentSubscriptions = new Map();

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);
    activeConnections.set(socket.id, {
      connectedAt: new Date(),
      subscriptions: []
    });

    // Handle shipment tracking subscription
    socket.on('trackShipment', (shipmentId) => {
      logger.info(`Client ${socket.id} tracking shipment: ${shipmentId}`);
      
      // Join room for this shipment
      socket.join(`shipment:${shipmentId}`);
      
      // Store subscription
      if (!shipmentSubscriptions.has(shipmentId)) {
        shipmentSubscriptions.set(shipmentId, new Set());
      }
      shipmentSubscriptions.get(shipmentId).add(socket.id);
      
      // Add to client's subscriptions
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.subscriptions.push(shipmentId);
      }
      
      // Send confirmation
      socket.emit('trackingStarted', {
        shipmentId,
        message: 'Real-time tracking activated'
      });
    });

    // Handle location updates from drivers
    socket.on('updateLocation', (data) => {
      const { shipmentId, latitude, longitude, speed, heading, timestamp } = data;
      
      logger.info(`Location update for shipment ${shipmentId}: ${latitude}, ${longitude}`);
      
      // Broadcast to all clients tracking this shipment
      io.to(`shipment:${shipmentId}`).emit('locationUpdate', {
        shipmentId,
        location: {
          latitude,
          longitude,
          speed,
          heading,
          timestamp: timestamp || new Date()
        },
        updatedAt: new Date()
      });
      
      // Store in database (async, don't wait)
      storeLocationUpdate(shipmentId, { latitude, longitude, speed, heading, timestamp });
    });

    // Handle status updates
    socket.on('updateStatus', (data) => {
      const { shipmentId, status, location, notes } = data;
      
      logger.info(`Status update for shipment ${shipmentId}: ${status}`);
      
      // Broadcast status change
      io.to(`shipment:${shipmentId}`).emit('statusUpdate', {
        shipmentId,
        status,
        location,
        notes,
        timestamp: new Date()
      });
      
      // Store in database
      storeStatusUpdate(shipmentId, { status, location, notes });
    });

    // Handle driver check-in
    socket.on('driverCheckIn', (data) => {
      const { shipmentId, driverId, location, type } = data;
      
      logger.info(`Driver check-in for shipment ${shipmentId}: ${type}`);
      
      io.to(`shipment:${shipmentId}`).emit('driverEvent', {
        shipmentId,
        event: 'checkIn',
        type, // 'pickup', 'delivery', 'break', 'fuel'
        driverId,
        location,
        timestamp: new Date()
      });
    });

    // Handle ETA updates
    socket.on('updateETA', (data) => {
      const { shipmentId, newETA, reason } = data;
      
      logger.info(`ETA update for shipment ${shipmentId}: ${newETA}`);
      
      io.to(`shipment:${shipmentId}`).emit('etaUpdate', {
        shipmentId,
        newETA,
        reason,
        timestamp: new Date()
      });
    });

    // Handle geofence alerts
    socket.on('geofenceAlert', (data) => {
      const { shipmentId, zone, action, location } = data;
      
      logger.info(`Geofence alert for shipment ${shipmentId}: ${action} ${zone}`);
      
      io.to(`shipment:${shipmentId}`).emit('geofenceAlert', {
        shipmentId,
        zone,
        action, // 'entered', 'exited'
        location,
        timestamp: new Date()
      });
    });

    // Handle route deviation
    socket.on('routeDeviation', (data) => {
      const { shipmentId, deviationDistance, currentLocation, plannedRoute } = data;
      
      logger.warn(`Route deviation for shipment ${shipmentId}: ${deviationDistance} miles`);
      
      io.to(`shipment:${shipmentId}`).emit('routeDeviation', {
        shipmentId,
        deviationDistance,
        currentLocation,
        plannedRoute,
        severity: deviationDistance > 10 ? 'high' : 'medium',
        timestamp: new Date()
      });
    });

    // Stop tracking shipment
    socket.on('untrackShipment', (shipmentId) => {
      logger.info(`Client ${socket.id} stopped tracking shipment: ${shipmentId}`);
      
      socket.leave(`shipment:${shipmentId}`);
      
      // Remove from subscriptions
      if (shipmentSubscriptions.has(shipmentId)) {
        shipmentSubscriptions.get(shipmentId).delete(socket.id);
      }
      
      socket.emit('trackingStopped', { shipmentId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
      
      // Cleanup subscriptions
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.subscriptions.forEach(shipmentId => {
          if (shipmentSubscriptions.has(shipmentId)) {
            shipmentSubscriptions.get(shipmentId).delete(socket.id);
          }
        });
      }
      
      activeConnections.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`WebSocket error for client ${socket.id}:`, error);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

/**
 * Broadcast shipment update to all tracking clients
 */
function broadcastShipmentUpdate(shipmentId, update) {
  if (io) {
    io.to(`shipment:${shipmentId}`).emit('shipmentUpdate', {
      shipmentId,
      update,
      timestamp: new Date()
    });
  }
}

/**
 * Send alert to specific shipment
 */
function sendAlert(shipmentId, alert) {
  if (io) {
    io.to(`shipment:${shipmentId}`).emit('alert', {
      shipmentId,
      alert,
      timestamp: new Date()
    });
  }
}

/**
 * Get active connections count
 */
function getActiveConnectionsCount() {
  return activeConnections.size;
}

/**
 * Get shipment subscribers count
 */
function getShipmentSubscribersCount(shipmentId) {
  return shipmentSubscriptions.has(shipmentId) 
    ? shipmentSubscriptions.get(shipmentId).size 
    : 0;
}

/**
 * Store location update in database
 */
async function storeLocationUpdate(shipmentId, locationData) {
  try {
    const Shipment = require('../models/tms/Shipment');
    
    await Shipment.findByIdAndUpdate(shipmentId, {
      $push: {
        locationHistory: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          speed: locationData.speed,
          heading: locationData.heading,
          timestamp: locationData.timestamp || new Date()
        }
      },
      currentLocation: {
        latitude: locationData.latitude,
        longitude: locationData.longitude
      }
    });
    
    logger.debug(`Stored location update for shipment ${shipmentId}`);
  } catch (error) {
    logger.error(`Failed to store location update: ${error.message}`);
  }
}

/**
 * Store status update in database
 */
async function storeStatusUpdate(shipmentId, statusData) {
  try {
    const Shipment = require('../models/tms/Shipment');
    
    await Shipment.findByIdAndUpdate(shipmentId, {
      status: statusData.status,
      $push: {
        statusHistory: {
          status: statusData.status,
          location: statusData.location,
          notes: statusData.notes,
          timestamp: new Date()
        }
      }
    });
    
    logger.debug(`Stored status update for shipment ${shipmentId}`);
  } catch (error) {
    logger.error(`Failed to store status update: ${error.message}`);
  }
}

module.exports = {
  initializeWebSocket,
  broadcastShipmentUpdate,
  sendAlert,
  getActiveConnectionsCount,
  getShipmentSubscribersCount
};
