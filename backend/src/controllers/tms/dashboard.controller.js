const Shipment = require('../../models/Shipment');
const Carrier = require('../../models/Carrier');
const Route = require('../../models/Route');

/**
 * Get comprehensive dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get shipment stats
    const shipmentStats = await Shipment.getDashboardStats();
    
    // Get top carriers
    const topCarriers = await Carrier.getTopCarriers(5);
    
    // Get active routes count
    const activeRoutes = await Route.countDocuments({
      status: { $in: ['in_progress', 'delayed'] }
    });
    
    // Get recent alerts (delayed shipments, insurance expirations)
    const alerts = [];
    
    // Find delayed shipments
    const delayedShipments = await Shipment.find({
      status: 'delayed',
      isActive: true
    })
      .limit(5)
      .select('shipmentId carrierName estimatedDeliveryDate')
      .sort({ estimatedDeliveryDate: 1 });
    
    delayedShipments.forEach(shipment => {
      alerts.push({
        type: 'warning',
        title: 'Delayed Shipment',
        message: `Shipment ${shipment.formattedId} is delayed`,
        timestamp: new Date(),
        data: {
          shipmentId: shipment._id,
          carrier: shipment.carrierName
        }
      });
    });
    
    // Find carriers with expiring insurance (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const carriersWithExpiringInsurance = await Carrier.find({
      $or: [
        { 'insurance.cargoInsurance.expirationDate': { $lte: thirtyDaysFromNow } },
        { 'insurance.liabilityInsurance.expirationDate': { $lte: thirtyDaysFromNow } }
      ],
      status: 'active'
    })
      .limit(3)
      .select('name insurance');
    
    carriersWithExpiringInsurance.forEach(carrier => {
      alerts.push({
        type: 'error',
        title: 'Insurance Expiring',
        message: `${carrier.name}'s insurance expires soon`,
        timestamp: new Date(),
        data: {
          carrierId: carrier._id,
          carrier: carrier.name
        }
      });
    });
    
    // Compile response
    const dashboardData = {
      stats: {
        activeShipments: shipmentStats.activeShipments || 0,
        onTimePercentage: shipmentStats.onTimePercentage || 0,
        totalCost: shipmentStats.totalCost || 0,
        deliveredThisMonth: shipmentStats.deliveredThisMonth || 0,
        activeRoutes
      },
      topCarriers: topCarriers.map((carrier, index) => ({
        rank: index + 1,
        name: carrier.name,
        dotNumber: carrier.dotNumber,
        rating: carrier.rating,
        onTimePercentage: carrier.onTimePercentage,
        totalShipments: carrier.totalShipments
      })),
      alerts: alerts.slice(0, 5) // Limit to 5 most important alerts
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
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

/**
 * Get recent activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent shipments
    const recentShipments = await Shipment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('shipmentId status carrierName origin destination createdAt')
      .populate('createdBy', 'firstName lastName');
    
    // Get recent route updates
    const recentRoutes = await Route.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('routeId status totalDistance updatedAt')
      .populate('carrier', 'name');
    
    res.status(200).json({
      success: true,
      data: {
        shipments: recentShipments,
        routes: recentRoutes
      }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activity',
      error: error.message
    });
  }
};

/**
 * Get analytics data for charts
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate ? new Date(endDate) : new Date();
    
    // Shipment trend by day
    const shipmentTrend = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    // Shipment by status
    const shipmentByStatus = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Cost trend
    const costTrend = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalCost: { $sum: '$cost.totalCost' },
          shipments: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          totalCost: { $round: ['$totalCost', 2] },
          averageCost: { $round: [{ $divide: ['$totalCost', '$shipments'] }, 2] },
          shipments: 1
        }
      }
    ]);
    
    // Carrier performance
    const carrierPerformance = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true,
          carrier: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$carrier',
          totalShipments: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalCost: { $sum: '$cost.totalCost' }
        }
      },
      {
        $lookup: {
          from: 'carriers',
          localField: '_id',
          foreignField: '_id',
          as: 'carrier'
        }
      },
      {
        $unwind: '$carrier'
      },
      {
        $project: {
          _id: 0,
          carrierId: '$_id',
          name: '$carrier.name',
          totalShipments: 1,
          delivered: 1,
          onTimePercentage: '$carrier.onTimePercentage',
          totalCost: { $round: ['$totalCost', 2] }
        }
      },
      {
        $sort: { totalShipments: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        shipmentTrend,
        shipmentByStatus,
        costTrend,
        carrierPerformance
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};
