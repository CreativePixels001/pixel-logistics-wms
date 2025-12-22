const express = require('express');
const router = express.Router();
const auth = require('../middleware/authSimple');

// Mock data storage
let kittingOrders = [
  {
    id: 1,
    kitNumber: 'KIT-001',
    kitName: 'Welcome Kit - Premium',
    customerOrderId: 'SO-2024-001',
    status: 'in-progress',
    components: [
      { productId: 'PROD-101', productName: 'T-Shirt', quantity: 1, picked: 1 },
      { productId: 'PROD-102', productName: 'Water Bottle', quantity: 1, picked: 1 },
      { productId: 'PROD-103', productName: 'Notebook', quantity: 2, picked: 1 }
    ],
    assignedTo: 'EMP-001',
    startedAt: new Date(),
    completedAt: null,
    location: 'Zone-A-L1-R05',
    notes: 'Handle with care',
    createdAt: new Date('2024-01-15'),
    createdBy: 'user1'
  }
];

let labelingJobs = [
  {
    id: 1,
    jobNumber: 'LBL-001',
    type: 'barcode',
    productId: 'PROD-201',
    productName: 'Electronics Bundle',
    quantity: 500,
    labelTemplate: 'Template-Barcode-Standard',
    labelData: {
      barcode: '1234567890123',
      productName: 'Electronics Bundle',
      sku: 'PROD-201',
      price: 'INR 2,999',
      mfgDate: '2024-01-01',
      expiryDate: '2025-01-01'
    },
    status: 'pending',
    assignedTo: null,
    completedQuantity: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user1'
  }
];

let crossDockOperations = [
  {
    id: 1,
    operationNumber: 'XD-001',
    receiptId: 'REC-001',
    shipmentId: 'SHIP-001',
    productId: 'PROD-301',
    productName: 'Fresh Vegetables',
    quantity: 100,
    fromDock: 'DOCK-001',
    toDock: 'DOCK-005',
    status: 'in-progress',
    receivedAt: new Date(),
    shippedAt: null,
    dwellTime: null,
    assignedTo: 'EMP-002',
    notes: 'Perishable - expedite',
    createdAt: new Date(),
    createdBy: 'user1'
  }
];

let returns = [
  {
    id: 1,
    returnNumber: 'RET-001',
    customerOrderId: 'SO-2024-050',
    customerId: 'CUST-001',
    customerName: 'Amit Patel',
    returnType: 'customer-return',
    reason: 'defective',
    items: [
      {
        productId: 'PROD-401',
        productName: 'Smart Watch',
        quantity: 1,
        returnReason: 'Screen not working',
        condition: 'damaged',
        disposition: null
      }
    ],
    status: 'received',
    receivedDate: new Date(),
    inspectedBy: null,
    inspectionDate: null,
    disposition: null,
    refundAmount: null,
    notes: 'Customer reported screen issue after 3 days',
    createdAt: new Date('2024-01-14'),
    createdBy: 'user1'
  }
];

let packagingServices = [
  {
    id: 1,
    serviceNumber: 'PKG-001',
    type: 'gift-wrap',
    orderId: 'SO-2024-075',
    productId: 'PROD-501',
    productName: 'Anniversary Gift Set',
    quantity: 1,
    packagingType: 'premium-gift-box',
    giftMessage: 'Happy Anniversary!',
    specialInstructions: 'Add ribbon and greeting card',
    status: 'pending',
    assignedTo: null,
    completedAt: null,
    charges: 150,
    createdAt: new Date('2024-01-15'),
    createdBy: 'user1'
  }
];

// ==================== KITTING OPERATIONS ====================

// Create kitting order
router.post('/kitting', auth, async (req, res) => {
  try {
    const { kitName, customerOrderId, components, location, notes } = req.body;

    if (!kitName || !components || components.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Kit name and components are required' 
      });
    }

    const newKit = {
      id: kittingOrders.length + 1,
      kitNumber: `KIT-${String(kittingOrders.length + 1).padStart(3, '0')}`,
      kitName,
      customerOrderId,
      status: 'pending', // pending, in-progress, completed, cancelled
      components: components.map(c => ({
        productId: c.productId,
        productName: c.productName,
        quantity: c.quantity,
        picked: 0
      })),
      assignedTo: null,
      startedAt: null,
      completedAt: null,
      location,
      notes,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    kittingOrders.push(newKit);

    res.status(201).json({
      success: true,
      message: 'Kitting order created successfully',
      data: newKit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating kitting order', 
      error: error.message 
    });
  }
});

// Get kitting orders
router.get('/kitting', auth, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;

    let filteredKits = [...kittingOrders];

    if (status) {
      filteredKits = filteredKits.filter(k => k.status === status);
    }
    if (assignedTo) {
      filteredKits = filteredKits.filter(k => k.assignedTo === assignedTo);
    }

    res.json({
      success: true,
      data: filteredKits,
      total: filteredKits.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching kitting orders', 
      error: error.message 
    });
  }
});

// Get kit details
router.get('/kitting/:id', auth, async (req, res) => {
  try {
    const kit = kittingOrders.find(k => k.id === parseInt(req.params.id));

    if (!kit) {
      return res.status(404).json({ 
        success: false,
        message: 'Kitting order not found' 
      });
    }

    res.json({
      success: true,
      data: kit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching kit details', 
      error: error.message 
    });
  }
});

// Update kit progress
router.put('/kitting/:id/progress', auth, async (req, res) => {
  try {
    const { componentId, pickedQuantity } = req.body;
    const kit = kittingOrders.find(k => k.id === parseInt(req.params.id));

    if (!kit) {
      return res.status(404).json({ 
        success: false,
        message: 'Kitting order not found' 
      });
    }

    const component = kit.components.find(c => c.productId === componentId);
    if (!component) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found in kit' 
      });
    }

    component.picked = Math.min(pickedQuantity, component.quantity);

    // Check if all components are picked
    const allPicked = kit.components.every(c => c.picked >= c.quantity);
    if (allPicked) {
      kit.status = 'completed';
      kit.completedAt = new Date();
    } else if (kit.status === 'pending') {
      kit.status = 'in-progress';
      kit.startedAt = new Date();
    }

    res.json({
      success: true,
      message: 'Kit progress updated',
      data: kit
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating kit progress', 
      error: error.message 
    });
  }
});

// ==================== LABELING SERVICES ====================

// Create labeling job
router.post('/labeling', auth, async (req, res) => {
  try {
    const { type, productId, productName, quantity, labelTemplate, labelData } = req.body;

    if (!type || !productId || !quantity || !labelTemplate) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }

    const newJob = {
      id: labelingJobs.length + 1,
      jobNumber: `LBL-${String(labelingJobs.length + 1).padStart(3, '0')}`,
      type, // barcode, qr-code, rfid, price-tag, shipping-label, custom
      productId,
      productName,
      quantity,
      labelTemplate,
      labelData,
      status: 'pending', // pending, in-progress, completed, cancelled
      assignedTo: null,
      completedQuantity: 0,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    labelingJobs.push(newJob);

    res.status(201).json({
      success: true,
      message: 'Labeling job created successfully',
      data: newJob
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating labeling job', 
      error: error.message 
    });
  }
});

// Get labeling jobs
router.get('/labeling', auth, async (req, res) => {
  try {
    const { status, type, assignedTo } = req.query;

    let filteredJobs = [...labelingJobs];

    if (status) {
      filteredJobs = filteredJobs.filter(j => j.status === status);
    }
    if (type) {
      filteredJobs = filteredJobs.filter(j => j.type === type);
    }
    if (assignedTo) {
      filteredJobs = filteredJobs.filter(j => j.assignedTo === assignedTo);
    }

    res.json({
      success: true,
      data: filteredJobs,
      total: filteredJobs.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching labeling jobs', 
      error: error.message 
    });
  }
});

// Update labeling job progress
router.put('/labeling/:id/progress', auth, async (req, res) => {
  try {
    const { completedQuantity } = req.body;
    const job = labelingJobs.find(j => j.id === parseInt(req.params.id));

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Labeling job not found' 
      });
    }

    job.completedQuantity = Math.min(completedQuantity, job.quantity);

    if (job.completedQuantity >= job.quantity) {
      job.status = 'completed';
      job.completedAt = new Date();
    } else if (job.status === 'pending') {
      job.status = 'in-progress';
      job.startedAt = new Date();
    }

    res.json({
      success: true,
      message: 'Labeling job progress updated',
      data: job
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating labeling job', 
      error: error.message 
    });
  }
});

// ==================== CROSS-DOCKING OPERATIONS ====================

// Create cross-dock operation
router.post('/crossdock', auth, async (req, res) => {
  try {
    const { receiptId, shipmentId, productId, productName, quantity, fromDock, toDock, notes } = req.body;

    if (!receiptId || !shipmentId || !productId || !quantity || !fromDock || !toDock) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }

    const newOperation = {
      id: crossDockOperations.length + 1,
      operationNumber: `XD-${String(crossDockOperations.length + 1).padStart(3, '0')}`,
      receiptId,
      shipmentId,
      productId,
      productName,
      quantity,
      fromDock,
      toDock,
      status: 'pending', // pending, in-progress, completed
      receivedAt: new Date(),
      shippedAt: null,
      dwellTime: null, // time in minutes
      assignedTo: null,
      notes,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    crossDockOperations.push(newOperation);

    res.status(201).json({
      success: true,
      message: 'Cross-dock operation created successfully',
      data: newOperation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating cross-dock operation', 
      error: error.message 
    });
  }
});

// Get cross-dock operations
router.get('/crossdock', auth, async (req, res) => {
  try {
    const { status, fromDock, toDock } = req.query;

    let filteredOps = [...crossDockOperations];

    if (status) {
      filteredOps = filteredOps.filter(op => op.status === status);
    }
    if (fromDock) {
      filteredOps = filteredOps.filter(op => op.fromDock === fromDock);
    }
    if (toDock) {
      filteredOps = filteredOps.filter(op => op.toDock === toDock);
    }

    res.json({
      success: true,
      data: filteredOps,
      total: filteredOps.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cross-dock operations', 
      error: error.message 
    });
  }
});

// Complete cross-dock operation
router.put('/crossdock/:id/complete', auth, async (req, res) => {
  try {
    const operation = crossDockOperations.find(op => op.id === parseInt(req.params.id));

    if (!operation) {
      return res.status(404).json({ 
        success: false,
        message: 'Cross-dock operation not found' 
      });
    }

    operation.status = 'completed';
    operation.shippedAt = new Date();
    operation.dwellTime = Math.floor((operation.shippedAt - operation.receivedAt) / 60000); // minutes

    res.json({
      success: true,
      message: 'Cross-dock operation completed',
      data: operation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error completing cross-dock operation', 
      error: error.message 
    });
  }
});

// ==================== RETURNS PROCESSING ====================

// Create return
router.post('/returns', auth, async (req, res) => {
  try {
    const { customerOrderId, customerId, customerName, returnType, reason, items, notes } = req.body;

    if (!customerOrderId || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Customer order ID and items are required' 
      });
    }

    const newReturn = {
      id: returns.length + 1,
      returnNumber: `RET-${String(returns.length + 1).padStart(3, '0')}`,
      customerOrderId,
      customerId,
      customerName,
      returnType: returnType || 'customer-return', // customer-return, warranty, defective, damage-in-transit
      reason,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        returnReason: item.returnReason,
        condition: item.condition, // new, opened, damaged, defective
        disposition: null // will be set during inspection
      })),
      status: 'pending', // pending, received, inspecting, approved, rejected, completed
      receivedDate: null,
      inspectedBy: null,
      inspectionDate: null,
      disposition: null,
      refundAmount: null,
      notes,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    returns.push(newReturn);

    res.status(201).json({
      success: true,
      message: 'Return created successfully',
      data: newReturn
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating return', 
      error: error.message 
    });
  }
});

// Get returns
router.get('/returns', auth, async (req, res) => {
  try {
    const { status, returnType, customerId } = req.query;

    let filteredReturns = [...returns];

    if (status) {
      filteredReturns = filteredReturns.filter(r => r.status === status);
    }
    if (returnType) {
      filteredReturns = filteredReturns.filter(r => r.returnType === returnType);
    }
    if (customerId) {
      filteredReturns = filteredReturns.filter(r => r.customerId === customerId);
    }

    res.json({
      success: true,
      data: filteredReturns,
      total: filteredReturns.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching returns', 
      error: error.message 
    });
  }
});

// Get return details
router.get('/returns/:id', auth, async (req, res) => {
  try {
    const returnItem = returns.find(r => r.id === parseInt(req.params.id));

    if (!returnItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Return not found' 
      });
    }

    res.json({
      success: true,
      data: returnItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching return details', 
      error: error.message 
    });
  }
});

// Update return status (receive)
router.put('/returns/:id/receive', auth, async (req, res) => {
  try {
    const returnItem = returns.find(r => r.id === parseInt(req.params.id));

    if (!returnItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Return not found' 
      });
    }

    returnItem.status = 'received';
    returnItem.receivedDate = new Date();

    res.json({
      success: true,
      message: 'Return received successfully',
      data: returnItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error receiving return', 
      error: error.message 
    });
  }
});

// Set return disposition (after inspection)
router.put('/returns/:id/disposition', auth, async (req, res) => {
  try {
    const { itemIndex, disposition, refundAmount } = req.body;
    const returnItem = returns.find(r => r.id === parseInt(req.params.id));

    if (!returnItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Return not found' 
      });
    }

    if (!disposition) {
      return res.status(400).json({ 
        success: false,
        message: 'Disposition is required' 
      });
    }

    // disposition options: restock, scrap, return-to-vendor, refurbish, donate
    if (itemIndex !== undefined && returnItem.items[itemIndex]) {
      returnItem.items[itemIndex].disposition = disposition;
    } else {
      // Apply to all items
      returnItem.items.forEach(item => {
        item.disposition = disposition;
      });
    }

    returnItem.status = 'approved';
    returnItem.inspectedBy = req.user.userId;
    returnItem.inspectionDate = new Date();
    returnItem.refundAmount = refundAmount;

    res.json({
      success: true,
      message: 'Return disposition set successfully',
      data: returnItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error setting return disposition', 
      error: error.message 
    });
  }
});

// Complete return processing
router.put('/returns/:id/complete', auth, async (req, res) => {
  try {
    const returnItem = returns.find(r => r.id === parseInt(req.params.id));

    if (!returnItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Return not found' 
      });
    }

    returnItem.status = 'completed';
    returnItem.completedAt = new Date();

    res.json({
      success: true,
      message: 'Return processing completed',
      data: returnItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error completing return', 
      error: error.message 
    });
  }
});

// ==================== PACKAGING SERVICES ====================

// Create packaging service
router.post('/packaging', auth, async (req, res) => {
  try {
    const { type, orderId, productId, productName, quantity, packagingType, giftMessage, specialInstructions, charges } = req.body;

    if (!type || !orderId || !productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Type, order ID, and product ID are required' 
      });
    }

    const newService = {
      id: packagingServices.length + 1,
      serviceNumber: `PKG-${String(packagingServices.length + 1).padStart(3, '0')}`,
      type, // gift-wrap, bubble-wrap, custom-box, fragile-packing, export-packing
      orderId,
      productId,
      productName,
      quantity: quantity || 1,
      packagingType,
      giftMessage,
      specialInstructions,
      status: 'pending', // pending, in-progress, completed
      assignedTo: null,
      completedAt: null,
      charges: charges || 0,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    packagingServices.push(newService);

    res.status(201).json({
      success: true,
      message: 'Packaging service created successfully',
      data: newService
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating packaging service', 
      error: error.message 
    });
  }
});

// Get packaging services
router.get('/packaging', auth, async (req, res) => {
  try {
    const { status, type, orderId } = req.query;

    let filteredServices = [...packagingServices];

    if (status) {
      filteredServices = filteredServices.filter(s => s.status === status);
    }
    if (type) {
      filteredServices = filteredServices.filter(s => s.type === type);
    }
    if (orderId) {
      filteredServices = filteredServices.filter(s => s.orderId === orderId);
    }

    res.json({
      success: true,
      data: filteredServices,
      total: filteredServices.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching packaging services', 
      error: error.message 
    });
  }
});

// Complete packaging service
router.put('/packaging/:id/complete', auth, async (req, res) => {
  try {
    const service = packagingServices.find(s => s.id === parseInt(req.params.id));

    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Packaging service not found' 
      });
    }

    service.status = 'completed';
    service.completedAt = new Date();

    res.json({
      success: true,
      message: 'Packaging service completed',
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error completing packaging service', 
      error: error.message 
    });
  }
});

module.exports = router;
