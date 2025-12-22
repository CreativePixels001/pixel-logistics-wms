/**
 * Deals Routes
 */

const express = require('express');
const router = express.Router();

const {
  createDeal,
  getAllDeals,
  getDealById,
  updateDeal,
  moveStage,
  markWon,
  markLost,
  addFollowUp,
  sendProposal,
  getPipelineStats,
  getOverdueDeals,
  deleteDeal
} = require('../../controllers/pis/deals.controller');

// Routes
router.post('/', createDeal);
router.get('/', getAllDeals);
router.get('/stats', getPipelineStats);
router.get('/overdue', getOverdueDeals);
router.get('/:id', getDealById);
router.put('/:id', updateDeal);
router.post('/:id/move-stage', moveStage);
router.post('/:id/won', markWon);
router.post('/:id/lost', markLost);
router.post('/:id/follow-up', addFollowUp);
router.post('/:id/send-proposal', sendProposal);
router.delete('/:id', deleteDeal);

module.exports = router;
