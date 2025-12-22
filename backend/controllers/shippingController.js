const Shipment = require('../models/Shipment');
const SalesOrder = require('../models/SalesOrder');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');

// @desc    Get all shipments
// @route   GET /api/v1/wms/shipping
// @access  Private
exports.getShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by carrier
    if (req.query.carrier) {
      query['carrier.name'] = req.query.carrier;
    }

    // Filter by warehouse
    if (req.query.warehouse) {
      query.warehouse = req.query.warehouse;
    }

    // Filter by customer
    if (req.query.customer) {
      query.customer = req.query.customer;
    }

    // Filter by shipment type
    if (req.query.shipmentType) {
      query.shipmentType = req.query.shipmentType;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.dispatchDate = {};
      if (req.query.startDate) {
        query.dispatchDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.dispatchDate.$lte = new Date(req.query.endDate);
      }
    }

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('salesOrder', 'soNumber status')
      .populate('customer', 'name code email phone')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku')
      .populate('dispatchedBy', 'name email')
      .sort({ dispatchDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: shipments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
};

// @desc    Get single shipment
// @route   GET /api/v1/wms/shipping/:id
// @access  Private
exports.getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('salesOrder')
      .populate('customer')
      .populate('warehouse')
      .populate('items.product')
      .populate('packingSlip.packedBy', 'name email')
      .populate('dispatchedBy', 'name email')
      .populate('pod.uploadedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

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
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment',
      error: error.message
    });
  }
};

// @desc    Create shipment
// @route   POST /api/v1/wms/shipping
// @access  Private (Admin, Manager)
exports.createShipment = async (req, res) => {
  try {
    const { salesOrder: soId, items, ...otherData } = req.body;

    // Verify Sales Order exists
    const so = await SalesOrder.findById(soId).populate('customer warehouse');
    if (!so) {
      return res.status(404).json({
        success: false,
        message: 'Sales Order not found'
      });
    }

    // Verify SO is in shippable status
    if (!['packed', 'ready-to-ship'].includes(so.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot create shipment for Sales Order in ${so.status} status`
      });
    }

    // Create shipment with SO details
    const shipmentData = {
      ...otherData,
      salesOrder: soId,
      customer: so.customer._id,
      warehouse: so.warehouse._id,
      shippingAddress: so.shippingAddress || so.customer.billingAddress,
      items: items.map(item => ({
        ...item,
        status: 'packed'
      })),
      createdBy: req.user._id
    };

    const shipment = await Shipment.create(shipmentData);

    const populatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: populatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shipment',
      error: error.message
    });
  }
};

// @desc    Update shipment
// @route   PUT /api/v1/wms/shipping/:id
// @access  Private (Admin, Manager)
exports.updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Cannot update if already delivered or cancelled
    if (['delivered', 'cancelled'].includes(shipment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${shipment.status} shipment`
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'carrier', 'trackingNumber', 'awbNumber', 'packages', 
      'shippingCost', 'estimatedPickupDate', 'estimatedDeliveryDate',
      'specialInstructions', 'deliveryInstructions', 'remarks',
      'internalNotes', 'priority', 'insuranceValue', 'isInsured',
      'signatureRequired', 'documents'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        shipment[field] = req.body[field];
      }
    });

    shipment.updatedBy = req.user._id;
    await shipment.save();

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipment',
      error: error.message
    });
  }
};

// @desc    Dispatch shipment
// @route   PUT /api/v1/wms/shipping/:id/dispatch
// @access  Private (Admin, Manager)
exports.dispatchShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const { trackingNumber, actualPickupDate, carrier } = req.body;

    // Update shipment details
    shipment.status = 'dispatched';
    shipment.dispatchDate = new Date();
    shipment.actualPickupDate = actualPickupDate || new Date();
    shipment.dispatchedBy = req.user._id;

    if (trackingNumber) {
      shipment.trackingNumber = trackingNumber;
    }
    if (carrier) {
      shipment.carrier = { ...shipment.carrier, ...carrier };
    }

    // Add tracking update
    shipment.addTrackingUpdate(
      'Dispatched',
      shipment.warehouse.name || 'Warehouse',
      'Shipment dispatched from warehouse',
      req.user.name || 'User'
    );

    // Update all items status
    shipment.items.forEach(item => {
      item.status = 'shipped';
    });

    shipment.updatedBy = req.user._id;
    await shipment.save();

    // Update Sales Order status
    const so = await SalesOrder.findById(shipment.salesOrder);
    if (so) {
      so.status = 'shipped';
      so.shippedDate = new Date();
      so.trackingNumber = trackingNumber;
      so.carrierName = carrier?.name || so.carrierName;
      await so.save();
    }

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Shipment dispatched successfully',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error dispatching shipment',
      error: error.message
    });
  }
};

// @desc    Mark shipment in-transit
// @route   PUT /api/v1/wms/shipping/:id/in-transit
// @access  Private (Admin, Manager)
exports.markInTransit = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const { location, timestamp } = req.body;

    shipment.status = 'in-transit';
    
    // Add tracking update
    shipment.addTrackingUpdate(
      'In Transit',
      location || 'In Transit',
      'Shipment is in transit',
      req.user.name || 'User'
    );

    shipment.updatedBy = req.user._id;
    await shipment.save();

    // Update Sales Order status
    const so = await SalesOrder.findById(shipment.salesOrder);
    if (so && so.status !== 'delivered') {
      so.status = 'in-transit';
      await so.save();
    }

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Shipment marked as in-transit',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipment status',
      error: error.message
    });
  }
};

// @desc    Mark shipment delivered
// @route   PUT /api/v1/wms/shipping/:id/deliver
// @access  Private (Admin, Manager)
exports.deliverShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const { deliveredBy, receiverName, receiverPhone, deliveryNotes } = req.body;

    shipment.status = 'delivered';
    shipment.actualDeliveryDate = new Date();
    shipment.deliveredBy = deliveredBy;

    // Update POD if receiver info provided
    if (receiverName || receiverPhone) {
      shipment.pod.receiverName = receiverName;
      shipment.pod.receiverPhone = receiverPhone;
      shipment.pod.receivedDate = new Date();
    }

    // Add tracking update
    shipment.addTrackingUpdate(
      'Delivered',
      shipment.shippingAddress.city || 'Destination',
      deliveryNotes || 'Shipment delivered successfully',
      deliveredBy || req.user.name || 'Delivery Agent'
    );

    // Update all items status
    shipment.items.forEach(item => {
      item.status = 'delivered';
    });

    shipment.updatedBy = req.user._id;
    await shipment.save();

    // Update Sales Order status
    const so = await SalesOrder.findById(shipment.salesOrder);
    if (so) {
      so.status = 'delivered';
      so.deliveredDate = new Date();
      
      // Update customer performance
      const customer = await Customer.findById(so.customer);
      if (customer) {
        customer.performance.completedOrders += 1;
        customer.performance.totalSpent += so.pricing.totalAmount || 0;
        customer.performance.lastOrderDate = new Date();
        
        // Calculate average order value
        if (customer.performance.completedOrders > 0) {
          customer.performance.averageOrderValue = 
            customer.performance.totalSpent / customer.performance.completedOrders;
        }
        
        await customer.save();
      }
      
      await so.save();
    }

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'Shipment marked as delivered',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking shipment as delivered',
      error: error.message
    });
  }
};

// @desc    Upload Proof of Delivery (POD)
// @route   PUT /api/v1/wms/shipping/:id/pod
// @access  Private (Admin, Manager)
exports.uploadPOD = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const { signatureUrl, photoUrl, receiverName, receiverPhone, verified } = req.body;

    shipment.pod = {
      ...shipment.pod,
      signatureUrl: signatureUrl || shipment.pod.signatureUrl,
      photoUrl: photoUrl || shipment.pod.photoUrl,
      receiverName: receiverName || shipment.pod.receiverName,
      receiverPhone: receiverPhone || shipment.pod.receiverPhone,
      receivedDate: shipment.pod.receivedDate || new Date(),
      uploadedBy: req.user._id,
      uploadDate: new Date(),
      verified: verified || false
    };

    // Add POD document
    if (signatureUrl || photoUrl) {
      shipment.documents.push({
        type: 'pod',
        fileName: 'Proof of Delivery',
        fileUrl: signatureUrl || photoUrl,
        uploadDate: new Date()
      });
    }

    shipment.updatedBy = req.user._id;
    await shipment.save();

    const updatedShipment = await Shipment.findById(shipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('items.product', 'name sku');

    res.status(200).json({
      success: true,
      message: 'POD uploaded successfully',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading POD',
      error: error.message
    });
  }
};

// @desc    Get shipments by sales order
// @route   GET /api/v1/wms/shipping/so/:soId
// @access  Private
exports.getShipmentsBySO = async (req, res) => {
  try {
    const shipments = await Shipment.find({ salesOrder: req.params.soId })
      .populate('customer', 'name code')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku')
      .populate('dispatchedBy', 'name email')
      .sort({ dispatchDate: -1 });

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
};

// @desc    Create return shipment
// @route   POST /api/v1/wms/shipping/:id/return
// @access  Private (Admin, Manager)
exports.createReturnShipment = async (req, res) => {
  try {
    const originalShipment = await Shipment.findById(req.params.id)
      .populate('salesOrder customer warehouse');

    if (!originalShipment) {
      return res.status(404).json({
        success: false,
        message: 'Original shipment not found'
      });
    }

    const { items, returnReason, carrier } = req.body;

    // Create return shipment
    const returnShipmentData = {
      salesOrder: originalShipment.salesOrder._id,
      customer: originalShipment.customer._id,
      warehouse: originalShipment.warehouse._id,
      shipmentType: 'return',
      items: items.map(item => ({
        ...item,
        status: 'pending'
      })),
      shippingAddress: {
        ...originalShipment.warehouse.address,
        contactPerson: 'Returns Department',
        contactPhone: originalShipment.warehouse.phone
      },
      carrier: carrier || originalShipment.carrier,
      isReturn: true,
      returnReason,
      originalShipmentId: originalShipment._id,
      priority: 'normal',
      createdBy: req.user._id
    };

    const returnShipment = await Shipment.create(returnShipmentData);

    const populatedReturn = await Shipment.findById(returnShipment._id)
      .populate('salesOrder', 'soNumber')
      .populate('customer', 'name code')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Return shipment created successfully',
      data: populatedReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating return shipment',
      error: error.message
    });
  }
};
