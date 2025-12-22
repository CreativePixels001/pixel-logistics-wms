/**
 * Claims Routes
 */

const express = require('express');
const router = express.Router();

const {
  createClaim,
  getAllClaims,
  getClaimById,
  updateClaim,
  approveClaim,
  rejectClaim,
  settleClaim,
  getClaimStats,
  getPendingClaims,
  deleteClaim
} = require('../../controllers/pis/claims.controller');

// Routes
router.post('/', createClaim);
router.get('/', getAllClaims);
router.get('/stats', getClaimStats);
router.get('/pending', getPendingClaims);
router.get('/:id', getClaimById);
router.put('/:id', updateClaim);
router.post('/:id/approve', approveClaim);
router.post('/:id/reject', rejectClaim);
router.post('/:id/settle', settleClaim);
router.delete('/:id', deleteClaim);

module.exports = router;
