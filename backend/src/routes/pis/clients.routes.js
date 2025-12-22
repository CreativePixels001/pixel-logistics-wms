/**
 * Clients Routes
 * REST API endpoints for client management
 */

const express = require('express');
const router = express.Router();

const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  addActivity
} = require('../../controllers/pis/clients.controller');

// Client CRUD routes
router.post('/', createClient);
router.get('/', getAllClients);
router.get('/stats', getClientStats);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// Activity management
router.post('/:id/activity', addActivity);

module.exports = router;
