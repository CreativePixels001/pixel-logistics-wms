const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  getZones,
  getCapacityReport,
  getUtilizationReport,
  transferLocation,
  auditLocation,
  getDueCycleCounts,
  findOptimalLocation
} = require('../controllers/warehouseController');

// Protect all routes (assuming auth middleware exists)
// const { protect, authorize } = require('../middleware/auth');
// router.use(protect);

// Location management routes
router.route('/locations')
  .get(getLocations)
  .post(createLocation); // authorize('admin', 'manager')

router.route('/locations/:id')
  .get(getLocation)
  .put(updateLocation); // authorize('admin', 'manager')

// Zone management
router.get('/zones', getZones);

// Reports
router.get('/capacity', getCapacityReport);
router.get('/utilization', getUtilizationReport);
router.get('/cycle-counts', getDueCycleCounts);

// Operations
router.post('/locations/transfer', transferLocation); // authorize('admin', 'manager')
router.post('/locations/audit', auditLocation); // authorize('admin', 'manager')
router.post('/locations/find-optimal', findOptimalLocation);

module.exports = router;
