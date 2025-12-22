/**
 * Payment Routes
 * Cashfree payment gateway integration for policies and renewals
 */

const express = require('express');
const router = express.Router();

const {
  createRenewalPayment,
  createPolicyPayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus
} = require('../../controllers/pis/payments.controller');

// Create payment orders
router.post('/renewal/create', createRenewalPayment);
router.post('/policy/create', createPolicyPayment);

// Verify payment
router.get('/verify/:orderId', verifyPayment);
router.get('/status/:orderId', getPaymentStatus);

// Webhook for payment status updates
router.post('/webhook', handleWebhook);

module.exports = router;
