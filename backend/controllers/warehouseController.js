const WarehouseLocation = require('../models/WarehouseLocation');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');

// @desc    Get all warehouse locations
// @route   GET /api/v1/wms/warehouse/locations
// @access  Private
exports.getLocations = async (req, res) => {
  try {
    const {
      warehouse,
      zone,
      status,
      locationType,
      aisle,
      rack,
      available,
      needsCycleCount,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (warehouse) query.warehouse = warehouse;
    if (zone) query.zone = zone;
    if (status) query.status = status;
    if (locationType) query.locationType = locationType;
    if (aisle) query.aisle = aisle;
    if (rack) query.rack = rack;

    // Filter by availability
    if (available === 'true') {
      query.status = { $in: ['active', 'reserved'] };
    }

    // Filter by cycle count needed
    if (needsCycleCount === 'true') {
      query.nextCycleCount = { $lte: new Date() };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const locations = await WarehouseLocation.find(query)
      .populate('warehouse', 'name code city')
      .populate('currentInventory.product', 'name sku')
      .populate('createdBy', 'name email')
      .sort({ zone: 1, aisle: 1, rack: 1, shelf: 1, bin: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await WarehouseLocation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: locations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse locations',
      error: error.message
    });
  }
};

// @desc    Get single warehouse location
// @route   GET /api/v1/wms/warehouse/locations/:id
// @access  Private
exports.getLocation = async (req, res) => {
  try {
    const location = await WarehouseLocation.findById(req.params.id)
      .populate('warehouse', 'name code address city state country')
      .populate('currentInventory.product', 'name sku category brand')
      .populate('restrictions.allowedProducts', 'name sku')
      .populate('restrictions.blockedProducts', 'name sku')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('lastAuditBy', 'name email');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse location not found'
      });
    }

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse location',
      error: error.message
    });
  }
};

// @desc    Create warehouse location
// @route   POST /api/v1/wms/warehouse/locations
// @access  Private (Admin/Manager)
exports.createLocation = async (req, res) => {
  try {
    // Verify warehouse exists
    const warehouse = await Warehouse.findById(req.body.warehouse);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Add creator
    req.body.createdBy = req.user ? req.user.id : null;

    const location = await WarehouseLocation.create(req.body);

    const populatedLocation = await WarehouseLocation.findById(location._id)
      .populate('warehouse', 'name code city')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Warehouse location created successfully',
      data: populatedLocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating warehouse location',
      error: error.message
    });
  }
};

// @desc    Update warehouse location
// @route   PUT /api/v1/wms/warehouse/locations/:id
// @access  Private (Admin/Manager)
exports.updateLocation = async (req, res) => {
  try {
    let location = await WarehouseLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse location not found'
      });
    }

    // Prevent updating if location has inventory and changing critical fields
    if (location.currentInventory.length > 0) {
      const criticalFields = ['warehouse', 'zone', 'locationType'];
      const hasChanges = criticalFields.some(field => req.body[field] && req.body[field] !== location[field]);
      
      if (hasChanges) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change critical fields when location has inventory'
        });
      }
    }

    // Add updater
    req.body.updatedBy = req.user ? req.user.id : null;

    location = await WarehouseLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('warehouse', 'name code city')
     .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Warehouse location updated successfully',
      data: location
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating warehouse location',
      error: error.message
    });
  }
};

// @desc    Get warehouse zones
// @route   GET /api/v1/wms/warehouse/zones
// @access  Private
exports.getZones = async (req, res) => {
  try {
    const { warehouse } = req.query;

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }

    const zones = await WarehouseLocation.aggregate([
      {
        $match: {
          warehouse: require('mongoose').Types.ObjectId(warehouse),
          isActive: true
        }
      },
      {
        $group: {
          _id: '$zone',
          totalLocations: { $sum: 1 },
          activeLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          fullLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'full'] }, 1, 0] }
          },
          totalCapacityItems: { $sum: '$capacity.maxItems' },
          currentItems: { $sum: '$currentUtilization.currentItems' },
          totalCapacityWeight: { $sum: '$capacity.maxWeight' },
          currentWeight: { $sum: '$currentUtilization.currentWeight' }
        }
      },
      {
        $project: {
          zone: '$_id',
          totalLocations: 1,
          activeLocations: 1,
          fullLocations: 1,
          totalCapacityItems: 1,
          currentItems: 1,
          totalCapacityWeight: 1,
          currentWeight: 1,
          itemUtilization: {
            $cond: [
              { $gt: ['$totalCapacityItems', 0] },
              { $multiply: [{ $divide: ['$currentItems', '$totalCapacityItems'] }, 100] },
              0
            ]
          },
          weightUtilization: {
            $cond: [
              { $gt: ['$totalCapacityWeight', 0] },
              { $multiply: [{ $divide: ['$currentWeight', '$totalCapacityWeight'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { zone: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouse zones',
      error: error.message
    });
  }
};

// @desc    Get warehouse capacity report
// @route   GET /api/v1/wms/warehouse/capacity
// @access  Private
exports.getCapacityReport = async (req, res) => {
  try {
    const { warehouse } = req.query;

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }

    const report = await WarehouseLocation.aggregate([
      {
        $match: {
          warehouse: require('mongoose').Types.ObjectId(warehouse),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalLocations: { $sum: 1 },
          activeLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          fullLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'full'] }, 1, 0] }
          },
          inactiveLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          maintenanceLocations: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          totalCapacityItems: { $sum: '$capacity.maxItems' },
          currentItems: { $sum: '$currentUtilization.currentItems' },
          totalCapacityWeight: { $sum: '$capacity.maxWeight' },
          currentWeight: { $sum: '$currentUtilization.currentWeight' },
          totalCapacityVolume: { $sum: '$capacity.maxVolume' },
          currentVolume: { $sum: '$currentUtilization.currentVolume' },
          totalCapacityPallets: { $sum: '$capacity.maxPallets' },
          currentPallets: { $sum: '$currentUtilization.currentPallets' }
        }
      },
      {
        $project: {
          _id: 0,
          totalLocations: 1,
          activeLocations: 1,
          fullLocations: 1,
          inactiveLocations: 1,
          maintenanceLocations: 1,
          availableLocations: { $subtract: ['$activeLocations', '$fullLocations'] },
          totalCapacityItems: 1,
          currentItems: 1,
          availableItems: { $subtract: ['$totalCapacityItems', '$currentItems'] },
          itemUtilization: {
            $cond: [
              { $gt: ['$totalCapacityItems', 0] },
              { $multiply: [{ $divide: ['$currentItems', '$totalCapacityItems'] }, 100] },
              0
            ]
          },
          totalCapacityWeight: 1,
          currentWeight: 1,
          availableWeight: { $subtract: ['$totalCapacityWeight', '$currentWeight'] },
          weightUtilization: {
            $cond: [
              { $gt: ['$totalCapacityWeight', 0] },
              { $multiply: [{ $divide: ['$currentWeight', '$totalCapacityWeight'] }, 100] },
              0
            ]
          },
          totalCapacityVolume: 1,
          currentVolume: 1,
          availableVolume: { $subtract: ['$totalCapacityVolume', '$currentVolume'] },
          volumeUtilization: {
            $cond: [
              { $gt: ['$totalCapacityVolume', 0] },
              { $multiply: [{ $divide: ['$currentVolume', '$totalCapacityVolume'] }, 100] },
              0
            ]
          },
          totalCapacityPallets: 1,
          currentPallets: 1,
          availablePallets: { $subtract: ['$totalCapacityPallets', '$currentPallets'] },
          palletUtilization: {
            $cond: [
              { $gt: ['$totalCapacityPallets', 0] },
              { $multiply: [{ $divide: ['$currentPallets', '$totalCapacityPallets'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    // Get zone-wise breakdown
    const zoneBreakdown = await WarehouseLocation.getUtilizationReport(warehouse);

    res.status(200).json({
      success: true,
      data: {
        overall: report[0] || {},
        byZone: zoneBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating capacity report',
      error: error.message
    });
  }
};

// @desc    Get space utilization report
// @route   GET /api/v1/wms/warehouse/utilization
// @access  Private
exports.getUtilizationReport = async (req, res) => {
  try {
    const { warehouse, zone } = req.query;

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }

    const matchQuery = {
      warehouse: require('mongoose').Types.ObjectId(warehouse),
      isActive: true
    };

    if (zone) {
      matchQuery.zone = zone;
    }

    // Overall utilization
    const overallStats = await WarehouseLocation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalLocations: { $sum: 1 },
          emptyLocations: {
            $sum: { $cond: [{ $eq: ['$currentUtilization.currentItems', 0] }, 1, 0] }
          },
          partiallyFilledLocations: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$currentUtilization.currentItems', 0] },
                    { $lt: ['$currentUtilization.currentItems', '$capacity.maxItems'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          fullLocations: {
            $sum: { $cond: [{ $gte: ['$currentUtilization.currentItems', '$capacity.maxItems'] }, 1, 0] }
          },
          avgUtilization: {
            $avg: {
              $cond: [
                { $gt: ['$capacity.maxItems', 0] },
                { $multiply: [{ $divide: ['$currentUtilization.currentItems', '$capacity.maxItems'] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]);

    // Utilization by zone
    const zoneStats = await WarehouseLocation.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$zone',
          locations: { $sum: 1 },
          avgUtilization: {
            $avg: {
              $cond: [
                { $gt: ['$capacity.maxItems', 0] },
                { $multiply: [{ $divide: ['$currentUtilization.currentItems', '$capacity.maxItems'] }, 100] },
                0
              ]
            }
          },
          totalCapacity: { $sum: '$capacity.maxItems' },
          totalUsed: { $sum: '$currentUtilization.currentItems' }
        }
      },
      { $sort: { avgUtilization: -1 } }
    ]);

    // Top 10 most utilized locations
    const topUtilized = await WarehouseLocation.find(matchQuery)
      .select('locationCode fullLocation zone status capacity currentUtilization')
      .populate('warehouse', 'name code')
      .sort({ 'currentUtilization.currentItems': -1 })
      .limit(10);

    // Locations needing attention (underutilized)
    const underUtilized = await WarehouseLocation.find({
      ...matchQuery,
      'capacity.maxItems': { $gt: 0 }
    })
      .select('locationCode fullLocation zone status capacity currentUtilization')
      .populate('warehouse', 'name code')
      .sort({ 'currentUtilization.currentItems': 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || {},
        byZone: zoneStats,
        topUtilized,
        underUtilized
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating utilization report',
      error: error.message
    });
  }
};

// @desc    Transfer inventory between locations
// @route   POST /api/v1/wms/warehouse/locations/transfer
// @access  Private (Admin/Manager)
exports.transferLocation = async (req, res) => {
  try {
    const {
      fromLocationId,
      toLocationId,
      productId,
      quantity,
      batchNumber,
      reason,
      notes
    } = req.body;

    // Validate required fields
    if (!fromLocationId || !toLocationId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'From location, to location, product, and quantity are required'
      });
    }

    // Get both locations
    const fromLocation = await WarehouseLocation.findById(fromLocationId);
    const toLocation = await WarehouseLocation.findById(toLocationId);

    if (!fromLocation || !toLocation) {
      return res.status(404).json({
        success: false,
        message: 'One or both locations not found'
      });
    }

    // Check if from location has the product
    const inventoryItem = fromLocation.currentInventory.find(
      item => item.product.toString() === productId && 
              (!batchNumber || item.batchNumber === batchNumber)
    );

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity in source location'
      });
    }

    // Check if to location can accommodate
    if (!toLocation.canAccommodate(0, 0, quantity, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Destination location does not have sufficient capacity'
      });
    }

    // Check if product is allowed in destination
    if (!toLocation.isProductAllowed(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product is not allowed in destination location'
      });
    }

    // Remove from source location
    inventoryItem.quantity -= quantity;
    if (inventoryItem.quantity === 0) {
      fromLocation.currentInventory.pull(inventoryItem);
    }
    fromLocation.currentUtilization.currentItems -= quantity;

    // Add to destination location
    const toInventoryItem = toLocation.currentInventory.find(
      item => item.product.toString() === productId && 
              (!batchNumber || item.batchNumber === batchNumber)
    );

    if (toInventoryItem) {
      toInventoryItem.quantity += quantity;
    } else {
      toLocation.currentInventory.push({
        product: productId,
        batchNumber,
        quantity
      });
    }
    toLocation.currentUtilization.currentItems += quantity;

    // Update inventory records
    const inventory = await Inventory.findOne({
      product: productId,
      warehouse: fromLocation.warehouse,
      ...(batchNumber && { batchNumber })
    });

    if (inventory) {
      // Add movement record
      inventory.movements.push({
        type: 'transfer',
        quantity,
        fromLocation: fromLocationId,
        toLocation: toLocationId,
        date: new Date(),
        reference: `Transfer: ${reason || 'Location optimization'}`,
        notes,
        performedBy: req.user ? req.user.id : null
      });

      await inventory.save();
    }

    // Save both locations
    await fromLocation.save();
    await toLocation.save();

    res.status(200).json({
      success: true,
      message: 'Inventory transferred successfully',
      data: {
        from: fromLocation,
        to: toLocation,
        transferDetails: {
          product: productId,
          quantity,
          batchNumber,
          reason,
          date: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error transferring inventory',
      error: error.message
    });
  }
};

// @desc    Perform location audit
// @route   POST /api/v1/wms/warehouse/locations/audit
// @access  Private (Admin/Manager)
exports.auditLocation = async (req, res) => {
  try {
    const {
      locationId,
      physicalCount,
      notes,
      discrepancies
    } = req.body;

    if (!locationId || !physicalCount) {
      return res.status(400).json({
        success: false,
        message: 'Location ID and physical count are required'
      });
    }

    const location = await WarehouseLocation.findById(locationId)
      .populate('currentInventory.product', 'name sku');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Calculate discrepancies
    const auditResults = {
      systemCount: location.currentInventory,
      physicalCount,
      discrepancies: [],
      status: 'passed'
    };

    // Compare system count vs physical count
    physicalCount.forEach(physical => {
      const system = location.currentInventory.find(
        item => item.product._id.toString() === physical.productId
      );

      if (!system || system.quantity !== physical.quantity) {
        auditResults.discrepancies.push({
          product: physical.productId,
          systemQuantity: system ? system.quantity : 0,
          physicalQuantity: physical.quantity,
          difference: physical.quantity - (system ? system.quantity : 0)
        });
        auditResults.status = 'discrepancy';
      }
    });

    // Update location audit info
    location.lastAuditDate = new Date();
    location.lastAuditBy = req.user ? req.user.id : null;
    location.lastAuditStatus = auditResults.status;

    // Set next cycle count date
    const now = new Date();
    switch (location.cycleCountFrequency) {
      case 'daily':
        location.nextCycleCount = new Date(now.setDate(now.getDate() + 1));
        break;
      case 'weekly':
        location.nextCycleCount = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'bi-weekly':
        location.nextCycleCount = new Date(now.setDate(now.getDate() + 14));
        break;
      case 'monthly':
        location.nextCycleCount = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'quarterly':
        location.nextCycleCount = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'annual':
        location.nextCycleCount = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
    }

    await location.save();

    res.status(200).json({
      success: true,
      message: `Location audit completed - ${auditResults.status}`,
      data: {
        location: location.locationCode,
        auditResults,
        nextCycleCount: location.nextCycleCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing location audit',
      error: error.message
    });
  }
};

// @desc    Get locations due for cycle count
// @route   GET /api/v1/wms/warehouse/cycle-counts
// @access  Private
exports.getDueCycleCounts = async (req, res) => {
  try {
    const { warehouse } = req.query;

    if (!warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }

    const dueLocations = await WarehouseLocation.getDueCycleCounts(warehouse);

    res.status(200).json({
      success: true,
      count: dueLocations.length,
      data: dueLocations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching due cycle counts',
      error: error.message
    });
  }
};

// @desc    Find optimal location for storage
// @route   POST /api/v1/wms/warehouse/locations/find-optimal
// @access  Private
exports.findOptimalLocation = async (req, res) => {
  try {
    const {
      warehouseId,
      zone,
      requiredItems,
      requiredWeight,
      requiredVolume,
      productId
    } = req.body;

    if (!warehouseId || !zone) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID and zone are required'
      });
    }

    // Find optimal location
    const location = await WarehouseLocation.findOptimalLocation(
      warehouseId,
      zone,
      requiredItems || 1,
      requiredWeight || 0,
      requiredVolume || 0
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No suitable location found'
      });
    }

    // Check product restrictions if productId provided
    if (productId && !location.isProductAllowed(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product is not allowed in the optimal location found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Optimal location found',
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding optimal location',
      error: error.message
    });
  }
};
