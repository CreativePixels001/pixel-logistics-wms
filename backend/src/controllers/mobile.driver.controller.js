/**
 * Driver Mobile API Controller
 * Handles mobile app endpoints for drivers
 */

const Driver = require('../models/tms/Driver');
const Shipment = require('../models/Shipment');
const Document = require('../models/tms/Document');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Driver Login
 * POST /api/v1/mobile/driver/login
 */
exports.driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver by email
    const driver = await Driver.findOne({ email: email.toLowerCase() })
      .select('+passwordHash');

    if (!driver) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if driver is active
    if (driver.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'DRIVER_INACTIVE',
          message: 'Driver account is not active'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, driver.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: driver._id, 
        driverNumber: driver.driverNumber,
        email: driver.email,
        type: 'driver'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    driver.lastLoginAt = new Date();
    await driver.save();

    // Return driver info and token
    res.json({
      success: true,
      data: {
        token,
        driver: {
          id: driver._id,
          driverNumber: driver.driverNumber,
          fullName: driver.fullName,
          email: driver.email,
          phone: driver.phone,
          carrierName: driver.carrierName,
          status: driver.status,
          availabilityStatus: driver.availabilityStatus,
          currentVehicle: driver.currentVehicle,
          currentShipment: driver.currentShipment,
          license: driver.license,
          medicalCertificate: driver.medicalCertificate,
          metrics: driver.metrics
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    logger.error('Driver login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get Driver Profile
 * GET /api/v1/mobile/driver/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id)
      .populate('currentVehicle', 'vehicleNumber make model licensePlate')
      .populate('carrier', 'carrierName email phone');

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver not found'
        }
      });
    }

    res.json({
      success: true,
      data: driver
    });

  } catch (error) {
    logger.error('Get profile error:', error);
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
 * Update Driver Location
 * POST /api/v1/mobile/driver/location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    const driver = await Driver.findById(req.driver.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver not found'
        }
      });
    }

    await driver.updateLocation(latitude, longitude, address);

    // Also update shipment location if driver has active shipment
    if (driver.currentShipment) {
      const shipment = await Shipment.findById(driver.currentShipment);
      if (shipment) {
        await shipment.updateLocation(latitude, longitude, address);
      }
    }

    res.json({
      success: true,
      data: {
        currentLocation: driver.currentLocation
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
 * Get Active Assignment
 * GET /api/v1/mobile/driver/assignment
 */
exports.getActiveAssignment = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id);
    
    if (!driver || !driver.currentShipment) {
      return res.json({
        success: true,
        data: null,
        message: 'No active assignment'
      });
    }

    const shipment = await Shipment.findById(driver.currentShipment)
      .populate('carrier', 'carrierName phone email')
      .populate('vehicle', 'vehicleNumber make model');

    res.json({
      success: true,
      data: shipment
    });

  } catch (error) {
    logger.error('Get assignment error:', error);
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
 * Update Assignment Status
 * POST /api/v1/mobile/driver/assignment/status
 */
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { shipmentId, status, notes, latitude, longitude } = req.body;

    const driver = await Driver.findById(req.driver.id);
    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHIPMENT_NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    // Update shipment status
    await shipment.updateStatus(status, notes, driver.fullName);

    // Update location if provided
    if (latitude && longitude) {
      await shipment.updateLocation(latitude, longitude);
    }

    // Update driver availability if delivered
    if (status === 'delivered') {
      await driver.completeDelivery();
    }

    res.json({
      success: true,
      data: shipment,
      message: `Shipment status updated to ${status}`
    });

  } catch (error) {
    logger.error('Update status error:', error);
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
 * Upload Proof of Delivery
 * POST /api/v1/mobile/driver/pod
 */
exports.uploadPOD = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No POD file uploaded'
        }
      });
    }

    const { shipmentId, signedBy, notes } = req.body;

    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHIPMENT_NOT_FOUND',
          message: 'Shipment not found'
        }
      });
    }

    // Create document record
    const document = new Document({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType: 'pod',
      category: 'shipment',
      relatedEntity: {
        entityType: 'shipment',
        entityId: shipmentId,
        entityName: shipment.shipmentNumber
      },
      storage: {
        provider: 'local',
        path: req.file.path,
        url: `/uploads/shipment/${req.file.filename}`
      },
      uploadedBy: {
        id: req.driver.id,
        name: req.driver.fullName || 'Driver',
        email: req.driver.email
      },
      notes
    });

    await document.save();

    // Update shipment POD
    shipment.pod = {
      signedBy,
      photo: document.storage.url,
      notes,
      timestamp: new Date()
    };

    if (!shipment.documents) {
      shipment.documents = [];
    }
    shipment.documents.push(document._id);

    await shipment.save();

    res.json({
      success: true,
      data: {
        document,
        shipment
      },
      message: 'POD uploaded successfully'
    });

  } catch (error) {
    logger.error('POD upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Get Driver History
 * GET /api/v1/mobile/driver/history
 */
exports.getDeliveryHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const driver = await Driver.findById(req.driver.id);
    
    const query = { driver: driver._id };
    if (status) {
      query.status = status;
    }

    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('shipmentNumber origin destination status pickupDate deliveryDate totalValue');

    const count = await Shipment.countDocuments(query);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Get history error:', error);
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
 * Update Availability Status
 * POST /api/v1/mobile/driver/availability
 */
exports.updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    const validStatuses = ['available', 'on-duty', 'off-duty', 'sleeper-berth', 'driving'];
    if (!validStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid availability status'
        }
      });
    }

    const driver = await Driver.findById(req.driver.id);
    driver.availabilityStatus = availabilityStatus;
    await driver.save();

    res.json({
      success: true,
      data: {
        availabilityStatus: driver.availabilityStatus
      },
      message: 'Availability updated successfully'
    });

  } catch (error) {
    logger.error('Update availability error:', error);
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
 * Get Driver Documents
 * GET /api/v1/mobile/driver/documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).populate('documents');

    res.json({
      success: true,
      data: driver.documents || []
    });

  } catch (error) {
    logger.error('Get documents error:', error);
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
 * Register Device Token (for push notifications)
 * POST /api/v1/mobile/driver/device-token
 */
exports.registerDeviceToken = async (req, res) => {
  try {
    const { deviceToken, appVersion } = req.body;

    const driver = await Driver.findById(req.driver.id);
    driver.deviceToken = deviceToken;
    if (appVersion) {
      driver.appVersion = appVersion;
    }
    await driver.save();

    res.json({
      success: true,
      message: 'Device token registered successfully'
    });

  } catch (error) {
    logger.error('Register device token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;
