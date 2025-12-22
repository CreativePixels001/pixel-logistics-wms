/**
 * Policies Routes
 * REST API endpoints for policy management
 */

const express = require('express');
const router = express.Router();

const {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  cancelPolicy,
  getPolicyStats,
  getExpiringPolicies,
  renewPolicy,
  getUserPolicies
} = require('../../controllers/pis/policies.controller');

// Policy CRUD routes
router.post('/', createPolicy);
router.get('/', getAllPolicies);
router.get('/stats', getPolicyStats);
router.get('/expiring', getExpiringPolicies);
router.get('/user/:userId', getUserPolicies); // Customer-specific policies
router.get('/:id', getPolicyById);
router.put('/:id', updatePolicy);
router.delete('/:id', cancelPolicy);

// Policy renewal
router.post('/:id/renew', renewPolicy);

module.exports = router;
