/**
 * Payment Controller - Cashfree Integration
 * Handles payment processing for policy purchases and renewals
 */

const { Cashfree } = require('cashfree-pg');
const Policy = require('../models/pis/Policy');
const Renewal = require('../models/pis/Renewal');
const logger = require('../config/logger');

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_APP_ID || '';
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || '';
Cashfree.XEnvironment = process.env.NODE_ENV === 'production' 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX;

/**
 * Create payment order for renewal
 * POST /api/v1/pis/payments/renewal/create
 */
exports.createRenewalPayment = async (req, res) => {
  try {
    const {
      policyNumber,
      amount,
      customerDetails,
      renewalData
    } = req.body;

    // Validate required fields
    if (!policyNumber || !amount || !customerDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: policyNumber, amount, customerDetails'
      });
    }

    // Generate unique order ID
    const orderId = `REN_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Cashfree order
    const orderRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerDetails.customerId || `CUST_${Date.now()}`,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/renewal-success.html?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/v1/pis/payments/webhook`,
        payment_methods: 'cc,dc,upi,nb'
      },
      order_note: `Renewal payment for policy ${policyNumber}`
    };

    // Create order with Cashfree
    const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);

    // Store payment details in database
    const paymentRecord = {
      orderId,
      policyNumber,
      amount,
      status: 'pending',
      customerDetails,
      renewalData,
      cashfreeOrderId: response.data?.order_id,
      paymentSessionId: response.data?.payment_session_id,
      createdAt: new Date()
    };

    // You can store this in a Payment collection
    // await Payment.create(paymentRecord);

    logger.info(`Renewal payment order created: ${orderId} for policy ${policyNumber}`);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId,
        paymentSessionId: response.data?.payment_session_id,
        cashfreeOrderId: response.data?.order_id,
        paymentUrl: response.data?.payment_link,
        amount
      }
    });
  } catch (error) {
    logger.error('Error creating renewal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Create payment order for new policy
 * POST /api/v1/pis/payments/policy/create
 */
exports.createPolicyPayment = async (req, res) => {
  try {
    const {
      policyData,
      amount,
      customerDetails
    } = req.body;

    const orderId = `POL_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const orderRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerDetails.customerId || `CUST_${Date.now()}`,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/success-health.html?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/v1/pis/payments/webhook`,
        payment_methods: 'cc,dc,upi,nb'
      },
      order_note: `New policy payment for ${policyData.planName}`
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);

    logger.info(`Policy payment order created: ${orderId}`);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId,
        paymentSessionId: response.data?.payment_session_id,
        paymentUrl: response.data?.payment_link,
        amount
      }
    });
  } catch (error) {
    logger.error('Error creating policy payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify payment status
 * GET /api/v1/pis/payments/verify/:orderId
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch order status from Cashfree
    const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId);

    const paymentStatus = response.data?.[0]?.payment_status || 'PENDING';
    const paymentMethod = response.data?.[0]?.payment_group || 'unknown';

    logger.info(`Payment verification for ${orderId}: ${paymentStatus}`);

    res.json({
      success: true,
      data: {
        orderId,
        status: paymentStatus,
        paymentMethod,
        amount: response.data?.[0]?.payment_amount,
        transactionId: response.data?.[0]?.cf_payment_id
      }
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * Handle Cashfree webhook
 * POST /api/v1/pis/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const { orderId, orderAmount, orderStatus, transactionId } = webhookData.data || {};

    logger.info(`Webhook received for order: ${orderId}, status: ${orderStatus}`);

    // Verify webhook signature (important for production)
    // const isValid = Cashfree.PGVerifyWebhookSignature(
    //   req.headers['x-webhook-signature'],
    //   req.rawBody,
    //   req.headers['x-webhook-timestamp']
    // );
    
    // if (!isValid) {
    //   return res.status(400).json({ success: false, message: 'Invalid signature' });
    // }

    if (orderStatus === 'PAID') {
      // Handle successful payment
      if (orderId.startsWith('REN_')) {
        // Renewal payment
        await handleRenewalPaymentSuccess(orderId, orderAmount, transactionId);
      } else if (orderId.startsWith('POL_')) {
        // New policy payment
        await handlePolicyPaymentSuccess(orderId, orderAmount, transactionId);
      }
    } else if (orderStatus === 'FAILED') {
      // Handle failed payment
      logger.warn(`Payment failed for order: ${orderId}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

/**
 * Handle successful renewal payment
 */
async function handleRenewalPaymentSuccess(orderId, amount, transactionId) {
  try {
    // Find the renewal record (you'll need to store this with orderId)
    // For now, this is a placeholder

    logger.info(`Processing renewal payment success: ${orderId}`);

    // Update policy expiry date
    // Mark renewal as complete
    // Send confirmation email/SMS

    return true;
  } catch (error) {
    logger.error('Error handling renewal payment success:', error);
    throw error;
  }
}

/**
 * Handle successful policy payment
 */
async function handlePolicyPaymentSuccess(orderId, amount, transactionId) {
  try {
    logger.info(`Processing policy payment success: ${orderId}`);

    // Create policy record
    // Mark payment as complete
    // Send policy documents
    // Send confirmation email/SMS

    return true;
  } catch (error) {
    logger.error('Error handling policy payment success:', error);
    throw error;
  }
}

/**
 * Get payment status by order ID
 * GET /api/v1/pis/payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await Cashfree.PGOrderFetchPayment('2023-08-01', orderId);

    res.json({
      success: true,
      data: {
        orderId,
        status: response.data?.order_status,
        amount: response.data?.order_amount,
        paymentDetails: response.data
      }
    });
  } catch (error) {
    logger.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
};

module.exports = exports;
