/**
 * Renewals Routes
 * Pixel Safe Insurance Portal
 */

const express = require('express');
const router = express.Router();
const renewalsController = require('../../controllers/pis/renewals.controller');

// CRUD Operations
router.post('/', renewalsController.createRenewal);
router.get('/', renewalsController.getAllRenewals);
router.get('/stats', renewalsController.getRenewalStats);
router.get('/pending', renewalsController.getPendingRenewals);
router.get('/overdue', renewalsController.getOverdueRenewals);
router.get('/:id', renewalsController.getRenewalById);
router.put('/:id', renewalsController.updateRenewal);
router.delete('/:id', renewalsController.deleteRenewal);

// Renewal Operations
router.post('/:id/notify', renewalsController.sendNotification);
router.post('/:id/response', renewalsController.recordResponse);
router.post('/:id/renewed', renewalsController.markRenewed);
router.post('/:id/follow-up', renewalsController.addFollowUp);
router.post('/bulk/reminders', renewalsController.sendBulkReminders);

module.exports = router;
