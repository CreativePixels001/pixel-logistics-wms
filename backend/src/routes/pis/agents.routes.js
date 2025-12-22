/**
 * Agents Routes
 * Pixel Safe Insurance Portal
 */

const express = require('express');
const router = express.Router();

const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentStats,
  getAgentPerformance,
  updatePerformance,
  loginAgent,
  getExpiringLicenses,
  getAgentTeam,
  changePassword
} = require('../../controllers/pis/agents.controller');

// Auth routes
router.post('/login', loginAgent);

// CRUD routes
router.post('/', createAgent);
router.get('/', getAllAgents);
router.get('/stats', getAgentStats);
router.get('/expiring-licenses', getExpiringLicenses);
router.get('/:id', getAgentById);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

// Performance routes
router.get('/:id/performance', getAgentPerformance);
router.put('/:id/performance', updatePerformance);

// Team routes
router.get('/:id/team', getAgentTeam);

// Password routes
router.post('/:id/change-password', changePassword);

module.exports = router;
