const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Cashfree Configuration
const CASHFREE_CONFIG = {
    mode: 'sandbox', // Change to 'production' for live
    appId: 'TEST107328179fd1ccba5f18b064316771823701',
    secretKey: 'cfsk_ma_test_6dde3c093228c3cf91aa517446453538_3761870a',
    apiUrl: 'https://sandbox.cashfree.com/pg' // Use https://api.cashfree.com/pg for production
};

/**
 * Create Order - Generate payment session
 * POST /api/payment/create-order
 */
router.post('/create-order', async (req, res) => {
    try {
        const {
            amount,
            currency = 'INR',
            customerName,
            customerEmail,
            customerPhone,
            plan,
            companyName
        } = req.body;

        // Validate required fields
        if (!amount || !customerName || !customerEmail || !customerPhone || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Generate unique order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Prepare order request
        const orderRequest = {
            order_id: orderId,
            order_amount: amount,
            order_currency: currency,
            customer_details: {
                customer_id: `CUST_${Date.now()}`,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: `${req.protocol}://${req.get('host')}/payment-success.html?order_id=${orderId}`,
                notify_url: `${req.protocol}://${req.get('host')}/api/payment/webhook`,
                payment_methods: '' // Empty means all payment methods
            },
            order_note: `Subscription: ${plan} - ${companyName}`
        };

        // Call Cashfree Create Order API
        const response = await axios.post(
            `${CASHFREE_CONFIG.apiUrl}/orders`,
            orderRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-id': CASHFREE_CONFIG.appId,
                    'x-client-secret': CASHFREE_CONFIG.secretKey,
                    'x-api-version': '2023-08-01'
                }
            }
        );

        // Save order to database (implement your DB logic)
        await saveOrderToDatabase({
            orderId,
            amount,
            customerName,
            customerEmail,
            customerPhone,
            plan,
            companyName,
            status: 'PENDING',
            paymentSessionId: response.data.payment_session_id,
            createdAt: new Date()
        });

        // Return payment session to frontend
        res.json({
            success: true,
            order_id: orderId,
            payment_session_id: response.data.payment_session_id,
            order_status: response.data.order_status
        });

    } catch (error) {
        console.error('Create Order Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
});

/**
 * Verify Payment - Check payment status
 * POST /api/payment/verify
 */
router.post('/verify', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Get order details from Cashfree
        const response = await axios.get(
            `${CASHFREE_CONFIG.apiUrl}/orders/${orderId}`,
            {
                headers: {
                    'x-client-id': CASHFREE_CONFIG.appId,
                    'x-client-secret': CASHFREE_CONFIG.secretKey,
                    'x-api-version': '2023-08-01'
                }
            }
        );

        const orderData = response.data;

        // Update order status in database
        await updateOrderStatus(orderId, orderData.order_status);

        if (orderData.order_status === 'PAID') {
            // Payment successful - activate subscription
            await activateSubscription(orderId);
            
            res.json({
                success: true,
                status: 'PAID',
                order: orderData
            });
        } else {
            res.json({
                success: false,
                status: orderData.order_status,
                message: 'Payment not completed'
            });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
});

/**
 * Webhook Handler - Receive payment notifications from Cashfree
 * POST /api/payment/webhook
 */
router.post('/webhook', async (req, res) => {
    try {
        const webhookData = req.body;
        
        // Verify webhook signature for security
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        
        if (!verifyWebhookSignature(webhookData, signature, timestamp)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        // Process webhook event
        const { type, data } = webhookData;

        switch (type) {
            case 'PAYMENT_SUCCESS_WEBHOOK':
                await handlePaymentSuccess(data);
                break;
            
            case 'PAYMENT_FAILED_WEBHOOK':
                await handlePaymentFailure(data);
                break;
            
            case 'REFUND_STATUS_WEBHOOK':
                await handleRefund(data);
                break;
            
            default:
                console.log('Unknown webhook type:', type);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ success: false });
    }
});

/**
 * Get Payment Methods
 * GET /api/payment/methods
 */
router.get('/methods', (req, res) => {
    res.json({
        success: true,
        methods: [
            { id: 'upi', name: 'UPI', icon: '📱' },
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
            { id: 'wallet', name: 'Wallets', icon: '👛' }
        ]
    });
});

/**
 * Get Plans
 * GET /api/payment/plans
 */
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        plans: [
            {
                id: 'wms-basic',
                name: 'WMS Basic',
                price: 4999,
                features: [
                    'Warehouse Management System',
                    'Inventory Management',
                    'Order Processing',
                    'Basic Analytics',
                    '5 User Licenses',
                    'Email Support'
                ]
            },
            {
                id: 'wms-pro',
                name: 'WMS Professional',
                price: 9999,
                features: [
                    'All Basic Features',
                    'Advanced Analytics',
                    'Mobile App Access',
                    'API Integration',
                    '15 User Licenses',
                    'Priority Support'
                ]
            },
            {
                id: 'combo',
                name: 'WMS + TMS Combo',
                price: 14999,
                popular: true,
                features: [
                    'Complete WMS Professional',
                    'Transportation Management',
                    'Real-time Tracking',
                    'Route Optimization',
                    'Unlimited Users',
                    '24/7 Support'
                ]
            },
            {
                id: 'tms-only',
                name: 'TMS Only',
                price: 7999,
                features: [
                    'Transportation Management',
                    'Live Shipment Tracking',
                    'Fleet Management',
                    'Route Optimization',
                    '10 User Licenses',
                    'Email & Chat Support'
                ]
            }
        ]
    });
});

// Helper Functions

function verifyWebhookSignature(data, signature, timestamp) {
    // Verify webhook signature using Cashfree's method
    const signatureData = `${timestamp}${JSON.stringify(data)}`;
    const expectedSignature = crypto
        .createHmac('sha256', CASHFREE_CONFIG.secretKey)
        .update(signatureData)
        .digest('base64');
    
    return expectedSignature === signature;
}

async function handlePaymentSuccess(data) {
    const { order_id, payment } = data;
    
    // Update order status to PAID
    await updateOrderStatus(order_id, 'PAID', payment);
    
    // Activate subscription
    await activateSubscription(order_id);
    
    // Send confirmation email
    await sendConfirmationEmail(order_id);
    
    // Generate credentials
    await generateUserCredentials(order_id);
    
    console.log(`Payment successful for order: ${order_id}`);
}

async function handlePaymentFailure(data) {
    const { order_id } = data;
    
    // Update order status to FAILED
    await updateOrderStatus(order_id, 'FAILED');
    
    // Send failure notification
    console.log(`Payment failed for order: ${order_id}`);
}

async function handleRefund(data) {
    const { order_id, refund } = data;
    
    // Process refund
    console.log(`Refund processed for order: ${order_id}`);
}

async function saveOrderToDatabase(orderData) {
    // TODO: Implement database save
    console.log('Saving order to database:', orderData);
}

async function updateOrderStatus(orderId, status, paymentData = null) {
    // TODO: Implement database update
    console.log(`Updating order ${orderId} status to ${status}`);
}

async function activateSubscription(orderId) {
    // TODO: Implement subscription activation
    // - Create user account
    // - Assign license
    // - Set expiry date
    console.log(`Activating subscription for order: ${orderId}`);
}

async function sendConfirmationEmail(orderId) {
    // TODO: Implement email sending
    console.log(`Sending confirmation email for order: ${orderId}`);
}

async function generateUserCredentials(orderId) {
    // TODO: Generate and save user credentials
    console.log(`Generating credentials for order: ${orderId}`);
}

module.exports = router;
