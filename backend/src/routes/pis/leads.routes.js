/**
 * Leads Routes
 * API endpoints for lead management
 */

const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  assignLead,
  addActivity,
  getLeadStats
} = require('../../controllers/pis/leads.controller');

// Middleware (will be added later)
// const { protect, authorize } = require('../../middleware/auth.middleware');

// Public routes (for now - will add auth later)

/**
 * @route   GET /api/v1/pis/leads/stats
 * @desc    Get lead statistics
 * @access  Private
 */
router.get('/stats', getLeadStats);

/**
 * @route   GET /api/v1/pis/leads
 * @desc    Get all leads with filters
 * @access  Private
 */
router.get('/', getLeads);

/**
 * @route   GET /api/v1/pis/leads/:id
 * @desc    Get single lead
 * @access  Private
 */
router.get('/:id', getLead);

/**
 * @route   POST /api/v1/pis/leads
 * @desc    Create new lead
 * @access  Private
 */
router.post('/', createLead);

/**
 * @route   PUT /api/v1/pis/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put('/:id', updateLead);

/**
 * @route   DELETE /api/v1/pis/leads/:id
 * @desc    Delete lead
 * @access  Private
 */
router.delete('/:id', deleteLead);

/**
 * @route   POST /api/v1/pis/leads/:id/convert
 * @desc    Convert lead to client
 * @access  Private
 */
router.post('/:id/convert', convertLead);

/**
 * @route   POST /api/v1/pis/leads/:id/assign
 * @desc    Assign lead to agent
 * @access  Private
 */
router.post('/:id/assign', assignLead);

/**
 * @route   POST /api/v1/pis/leads/:id/activity
 * @desc    Add activity to lead
 * @access  Private
 */
router.post('/:id/activity', addActivity);

module.exports = router;
