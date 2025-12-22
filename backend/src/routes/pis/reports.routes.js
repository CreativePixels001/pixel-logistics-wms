/**
 * Reports Routes
 */

const express = require('express');
const router = express.Router();

const {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport,
  scheduleReport,
  getReportStats
} = require('../../controllers/pis/reports.controller');

// Routes
router.post('/', generateReport);
router.get('/', getAllReports);
router.get('/stats', getReportStats);
router.post('/schedule', scheduleReport);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
