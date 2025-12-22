/**
 * Integration Controller
 * Handles WMS-TMS integration and communication
 * Supports both MongoDB and mock data mode
 */

let Shipment, Carrier;
let useMockData = false;

try {
  Shipment = require('../models/Shipment');
  Carrier = require('../models/Carrier');
} catch (error) {
  console.log('MongoDB models not available, using mock data mode');
  useMockData = true;
}

// Mock data storage (in-memory for demo without MongoDB)
const mockShipments = [];
const mockCarriers = [
  {
    _id: 'carrier1',
    name: 'Express Transport India',
    rating: 4.8,
    onTimePercentage: 94.5,
    dotNumber: 'DOT12345',
    status: 'active'
  },
  {
    _id: 'carrier2',
    name: 'Swift Logistics Solutions',
    rating: 4.6,
    onTimePercentage: 92.0,
    dotNumber: 'DOT23456',
    status: 'active'
  },
  {
    _id: 'carrier3',
    name: 'Southern Express Carriers',
    rating: 4.7,
    onTimePercentage: 93.2,
    dotNumber: 'DOT34567',
    status: 'active'
  }
];

// Generate mock shipment ID
let mockShipmentCounter = 1;
function generateMockShipmentId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `SHP${year}${month}${mockShipmentCounter++.toString().padStart(6, '0')}`;
}

function generateMockTrackingNumber() {
  return `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

/**
 * Create TMS shipment from WMS order
 * POST /api/v1/integration/create-shipment
 */
exports.createShipmentFromWMS = async (req, res) => {
  try {
    const {
      wmsOrderId,
      wmsOrderNumber,
      customerName,
      customerContact,
      customerEmail,
      origin,
      destination,
      cargo,
      pickupDate,
      deliveryDate,
      priority,
      specialInstructions,
      shipmentType,
      totalValue
    } = req.body;

    // Validation
    if (!wmsOrderId || !origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: wmsOrderId, origin, destination'
      });
    }

    // Check if shipment already exists for this WMS order
    const existingShipment = await Shipment.findOne({ 
      'externalSystems.wms.orderId': wmsOrderId,
      isActive: true 
    });

    if (existingShipment) {
      return res.status(409).json({
        success: false,
        message: 'Shipment already exists for this WMS order',
        data: {
          shipmentId: existingShipment.shipmentId,
          trackingNumber: existingShipment.trackingNumber,
          status: existingShipment.status
        }
      });
    }

    // Find best carrier based on route and shipment type
    const carrier = await findBestCarrier(origin, destination, shipmentType);

    // Calculate total weight from cargo
    const totalWeight = cargo?.reduce((sum, item) => sum + (item.weight?.value || 0), 0) || 0;

    // Create shipment
    const shipment = new Shipment({
      wmsOrderId,
      wmsOrderNumber,
      customerName,
      customerContact,
      customerEmail,
      origin: {
        name: origin.name || customerName,
        address: origin.address,
        city: origin.city,
        state: origin.state,
        zipCode: origin.zipCode,
        country: origin.country || 'India',
        contactName: origin.contactName || customerContact,
        contactPhone: origin.contactPhone || customerContact,
        contactEmail: origin.contactEmail || customerEmail
      },
      destination: {
        name: destination.name || 'Delivery Location',
        address: destination.address,
        city: destination.city,
        state: destination.state,
        zipCode: destination.zipCode,
        country: destination.country || 'India',
        contactName: destination.contactName,
        contactPhone: destination.contactPhone,
        contactEmail: destination.contactEmail
      },
      cargo: cargo || [],
      totalWeight: {
        value: totalWeight,
        unit: 'kg'
      },
      totalValue: totalValue ? {
        amount: totalValue,
        currency: 'INR'
      } : undefined,
      pickupDate: pickupDate ? new Date(pickupDate) : new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      estimatedDeliveryDate: deliveryDate ? new Date(deliveryDate) : calculateETA(origin, destination),
      priority: priority || 'Normal',
      specialInstructions,
      shipmentType: shipmentType || 'FTL',
      mode: 'Road',
      status: 'Pending',
      carrier: carrier?._id,
      carrierName: carrier?.name,
      externalSystems: {
        wms: {
          orderId: wmsOrderId,
          orderNumber: wmsOrderNumber,
          syncStatus: 'synced',
          lastSyncAt: new Date()
        }
      },
      trackingUpdates: [{
        status: 'Shipment created from WMS order',
        location: origin.city,
        timestamp: new Date(),
        notes: `Created from WMS Order ${wmsOrderNumber || wmsOrderId}`,
        updatedBy: 'WMS Integration'
      }],
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    });

    await shipment.save();

    // Populate carrier details
    if (carrier) {
      await shipment.populate('carrier', 'name dotNumber rating onTimePercentage');
    }

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully from WMS order',
      data: {
        shipmentId: shipment.shipmentId,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        carrier: carrier ? {
          id: carrier._id,
          name: carrier.name,
          rating: carrier.rating
        } : null,
        pickupDate: shipment.pickupDate,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        origin: shipment.origin,
        destination: shipment.destination,
        wmsOrderId: shipment.wmsOrderId,
        wmsOrderNumber: shipment.wmsOrderNumber
      }
    });

  } catch (error) {
    console.error('Create shipment from WMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

/**
 * Get shipment status for WMS
 * GET /api/v1/integration/shipment-status/:wmsOrderId
 */
exports.getShipmentStatus = async (req, res) => {
  try {
    const { wmsOrderId } = req.params;

    const shipment = await Shipment.findOne({
      'externalSystems.wms.orderId': wmsOrderId,
      isActive: true
    })
    .populate('carrier', 'name rating onTimePercentage')
    .populate('driver', 'name phone');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found for this WMS order'
      });
    }

    res.json({
      success: true,
      data: {
        shipmentId: shipment.shipmentId,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        carrier: shipment.carrier ? {
          name: shipment.carrier.name,
          rating: shipment.carrier.rating,
          onTimePercentage: shipment.carrier.onTimePercentage
        } : null,
        driver: shipment.driver ? {
          name: shipment.driver.name || shipment.driverName,
          phone: shipment.driver.phone || shipment.driverPhone
        } : null,
        currentLocation: shipment.currentLocation,
        pickupDate: shipment.pickupDate,
        actualPickupDate: shipment.actualPickupDate,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        actualDeliveryDate: shipment.actualDeliveryDate,
        trackingUpdates: shipment.trackingUpdates.slice(-5), // Last 5 updates
        pod: shipment.pod,
        wmsOrderId: shipment.wmsOrderId,
        wmsOrderNumber: shipment.wmsOrderNumber
      }
    });

  } catch (error) {
    console.error('Get shipment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shipment status',
      error: error.message
    });
  }
};

/**
 * Update WMS about shipment status changes
 * POST /api/v1/integration/update-wms
 */
exports.updateWMSStatus = async (req, res) => {
  try {
    const { shipmentId, status, location, timestamp } = req.body;

    const shipment = await Shipment.findOne({ shipmentId, isActive: true });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Add tracking update
    await shipment.addTrackingUpdate({
      status,
      location,
      timestamp: timestamp || new Date(),
      notes: 'Status update from TMS',
      updatedBy: 'TMS Integration'
    });

    // Here you would call WMS webhook/API to update the order status
    // For demo, we'll just log it
    console.log(`[Integration] WMS update for order ${shipment.wmsOrderId}:`, {
      status,
      location,
      timestamp
    });

    res.json({
      success: true,
      message: 'WMS status updated successfully',
      data: {
        shipmentId: shipment.shipmentId,
        wmsOrderId: shipment.wmsOrderId,
        status: shipment.status
      }
    });

  } catch (error) {
    console.error('Update WMS status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update WMS status',
      error: error.message
    });
  }
};

/**
 * Get unified dashboard data (WMS + TMS)
 * GET /api/v1/integration/dashboard
 */
exports.getUnifiedDashboard = async (req, res) => {
  try {
    // TMS Metrics
    const totalShipments = await Shipment.countDocuments({ isActive: true });
    const inTransit = await Shipment.countDocuments({ 
      status: 'In Transit', 
      isActive: true 
    });
    const pending = await Shipment.countDocuments({ 
      status: { $in: ['Pending', 'Scheduled', 'Pickup Requested'] },
      isActive: true 
    });
    const delivered = await Shipment.countDocuments({ 
      status: 'Delivered',
      isActive: true,
      actualDeliveryDate: { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      }
    });

    // Recent shipments
    const recentShipments = await Shipment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('shipmentId trackingNumber status origin destination pickupDate estimatedDeliveryDate wmsOrderNumber')
      .lean();

    // Active shipments (in transit)
    const activeShipments = await Shipment.find({ 
      status: { $in: ['In Transit', 'Out for Delivery'] },
      isActive: true 
    })
    .populate('carrier', 'name rating')
    .select('shipmentId trackingNumber status currentLocation estimatedDeliveryDate carrier wmsOrderNumber')
    .limit(20)
    .lean();

    // On-time delivery rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deliveredShipments = await Shipment.find({
      status: 'Delivered',
      actualDeliveryDate: { $gte: thirtyDaysAgo },
      isActive: true
    }).select('estimatedDeliveryDate actualDeliveryDate');

    let onTimeCount = 0;
    deliveredShipments.forEach(shipment => {
      if (shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate) {
        onTimeCount++;
      }
    });

    const onTimePercentage = deliveredShipments.length > 0 
      ? ((onTimeCount / deliveredShipments.length) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        tms: {
          totalShipments,
          inTransit,
          pending,
          delivered: delivered,
          onTimePercentage: parseFloat(onTimePercentage)
        },
        recentShipments,
        activeShipments,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Get unified dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unified dashboard data',
      error: error.message
    });
  }
};

/**
 * Bulk create shipments from WMS orders
 * POST /api/v1/integration/bulk-create-shipments
 */
exports.bulkCreateShipments = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Orders array is required'
      });
    }

    const results = {
      created: [],
      failed: [],
      skipped: []
    };

    for (const order of orders) {
      try {
        // Check if shipment already exists
        const existing = await Shipment.findOne({
          'externalSystems.wms.orderId': order.wmsOrderId,
          isActive: true
        });

        if (existing) {
          results.skipped.push({
            wmsOrderId: order.wmsOrderId,
            reason: 'Shipment already exists',
            shipmentId: existing.shipmentId
          });
          continue;
        }

        // Find carrier
        const carrier = await findBestCarrier(
          order.origin, 
          order.destination, 
          order.shipmentType || 'FTL'
        );

        // Calculate total weight
        const totalWeight = order.cargo?.reduce((sum, item) => 
          sum + (item.weight?.value || 0), 0) || 0;

        // Create shipment
        const shipment = new Shipment({
          wmsOrderId: order.wmsOrderId,
          wmsOrderNumber: order.wmsOrderNumber,
          customerName: order.customerName,
          customerContact: order.customerContact,
          customerEmail: order.customerEmail,
          origin: order.origin,
          destination: order.destination,
          cargo: order.cargo || [],
          totalWeight: { value: totalWeight, unit: 'kg' },
          totalValue: order.totalValue ? { amount: order.totalValue, currency: 'INR' } : undefined,
          pickupDate: order.pickupDate ? new Date(order.pickupDate) : new Date(),
          deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
          estimatedDeliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : 
            calculateETA(order.origin, order.destination),
          priority: order.priority || 'Normal',
          specialInstructions: order.specialInstructions,
          shipmentType: order.shipmentType || 'FTL',
          mode: 'Road',
          status: 'Pending',
          carrier: carrier?._id,
          carrierName: carrier?.name,
          externalSystems: {
            wms: {
              orderId: order.wmsOrderId,
              orderNumber: order.wmsOrderNumber,
              syncStatus: 'synced',
              lastSyncAt: new Date()
            }
          },
          createdBy: req.user?._id,
          updatedBy: req.user?._id
        });

        await shipment.save();

        results.created.push({
          wmsOrderId: order.wmsOrderId,
          shipmentId: shipment.shipmentId,
          trackingNumber: shipment.trackingNumber
        });

      } catch (error) {
        results.failed.push({
          wmsOrderId: order.wmsOrderId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${orders.length} orders`,
      data: {
        summary: {
          total: orders.length,
          created: results.created.length,
          skipped: results.skipped.length,
          failed: results.failed.length
        },
        results
      }
    });

  } catch (error) {
    console.error('Bulk create shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create shipments',
      error: error.message
    });
  }
};

// Helper Functions

/**
 * Find best carrier based on route and shipment type
 */
async function findBestCarrier(origin, destination, shipmentType) {
  try {
    // Find carriers that service this route and shipment type
    const carriers = await Carrier.find({
      status: 'active',
      'services.types': shipmentType,
      // You can add more sophisticated matching here
      isActive: true
    })
    .sort({ rating: -1, onTimePercentage: -1 })
    .limit(1);

    return carriers[0] || null;
  } catch (error) {
    console.error('Find best carrier error:', error);
    return null;
  }
}

/**
 * Calculate estimated delivery date
 */
function calculateETA(origin, destination) {
  // Simple calculation: add 3-5 days based on distance
  // In production, use proper route optimization
  const baseDate = new Date();
  const daysToAdd = 3; // Default 3 days
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  return baseDate;
}

module.exports = {
  createShipmentFromWMS,
  getShipmentStatus,
  updateWMSStatus,
  getUnifiedDashboard,
  bulkCreateShipments
};
