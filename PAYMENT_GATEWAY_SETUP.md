# Payment Gateway Integration Guide

## Cashfree Payment Gateway Setup

### Prerequisites
- Cashfree account (Sign up at https://www.cashfree.com/)
- App ID and Secret Key from Cashfree dashboard
- Node.js backend running

### Step 1: Install Cashfree SDK

```bash
cd backend
npm install cashfree-pg
```

### Step 2: Configure Environment Variables

Add to `.env` file:

```bash
# Cashfree Payment Gateway
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here

# URLs
FRONTEND_URL=http://localhost:8000/PIS
BACKEND_URL=http://localhost:5001
```

### Step 3: Get Cashfree Credentials

#### For Testing (Sandbox):
1. Go to https://merchant.cashfree.com/merchants/login
2. Sign up for a test account
3. Navigate to **Developers** → **API Keys**
4. Copy **App ID** and **Secret Key**

#### For Production:
1. Complete KYC verification
2. Activate your account
3. Get production credentials from the same location

### Step 4: API Endpoints

#### Create Renewal Payment Order
```http
POST /api/v1/pis/payments/renewal/create
Content-Type: application/json

{
  "policyNumber": "PS-HE-12345678-001",
  "amount": 14160,
  "customerDetails": {
    "customerId": "CUST_001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  },
  "renewalData": {
    "basePremium": 12000,
    "ncbDiscount": 3000,
    "gst": 2160
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "REN_1732293456_abc123",
    "paymentSessionId": "session_xxxxxxxxxxxxx",
    "paymentUrl": "https://payments.cashfree.com/...",
    "amount": 14160
  }
}
```

#### Verify Payment
```http
GET /api/v1/pis/payments/verify/REN_1732293456_abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "REN_1732293456_abc123",
    "status": "PAID",
    "paymentMethod": "UPI",
    "amount": 14160,
    "transactionId": "cf_payment_xxxxx"
  }
}
```

### Step 5: Frontend Integration

#### Update `renewal-payment.js`:

```javascript
// Process Payment
async function processPayment() {
    if (!validatePaymentDetails()) return;
    
    const button = event.target;
    button.textContent = 'Processing...';
    button.disabled = true;
    
    try {
        // Create payment order
        const response = await fetch(`${API_BASE}/payments/renewal/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                policyNumber: renewalData.policyNumber,
                amount: renewalData.totalAmount,
                customerDetails: {
                    name: document.getElementById('cardName').value,
                    email: 'customer@example.com', // Get from session
                    phone: '+919876543210' // Get from session
                },
                renewalData: {
                    basePremium: renewalData.premium,
                    ncbDiscount: renewalData.eligibleForNCB ? renewalData.premium * 0.20 : 0,
                    gst: Math.round(renewalData.premium * 0.18)
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to Cashfree payment page
            window.location.href = data.data.paymentUrl;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
        button.textContent = 'Pay Now';
        button.disabled = false;
    }
}
```

### Step 6: Handle Payment Success

#### Update `renewal-success.js`:

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
        // Verify payment with backend
        const response = await fetch(`${API_BASE}/payments/verify/${orderId}`);
        const data = await response.json();
        
        if (data.success && data.data.status === 'PAID') {
            // Display success
            displaySuccessDetails({
                transactionId: data.data.transactionId,
                amount: data.data.amount,
                ...otherDetails
            });
        } else {
            // Handle failed payment
            window.location.href = 'payment-failed.html';
        }
    } else {
        // Load from sessionStorage (for demo)
        loadSuccessData();
    }
});
```

### Step 7: Webhook Configuration

1. In Cashfree Dashboard, go to **Developers** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/v1/pis/payments/webhook`
3. Select events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`
4. Save and copy the webhook secret

Update `.env`:
```bash
CASHFREE_WEBHOOK_SECRET=your_webhook_secret
```

### Step 8: Testing

#### Test Payment Flow:
1. Create a renewal payment order
2. Use Cashfree test cards:
   - **Success:** `4111 1111 1111 1111`
   - **CVV:** `123`
   - **Expiry:** Any future date
   - **OTP:** `1234`

3. Verify payment status
4. Check webhook is received

#### Test UPI:
- UPI ID: `success@upi` (test mode)

### Payment Status Flow

```
1. Customer clicks "Pay Now"
   ↓
2. Frontend calls POST /payments/renewal/create
   ↓
3. Backend creates Cashfree order
   ↓
4. Cashfree returns payment URL
   ↓
5. Frontend redirects to Cashfree page
   ↓
6. Customer completes payment
   ↓
7. Cashfree sends webhook to backend
   ↓
8. Backend updates policy/renewal
   ↓
9. Customer redirected to success page
   ↓
10. Frontend verifies payment via API
```

### Security Best Practices

1. **Verify Webhook Signature:**
```javascript
const isValid = Cashfree.PGVerifyWebhookSignature(
  req.headers['x-webhook-signature'],
  req.rawBody,
  req.headers['x-webhook-timestamp']
);

if (!isValid) {
  return res.status(400).json({ success: false });
}
```

2. **Store Payment Records:**
Create a Payment model to track all transactions

3. **Use HTTPS in Production:**
All payment URLs must use HTTPS

4. **Validate Amount:**
Always verify payment amount matches order amount

5. **Idempotency:**
Handle duplicate webhooks gracefully

### Error Handling

```javascript
try {
  const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);
} catch (error) {
  if (error.response?.status === 401) {
    // Invalid credentials
  } else if (error.response?.status === 400) {
    // Validation error
  }
}
```

### Common Issues

**Issue:** Payment URL not generated
- **Solution:** Check App ID and Secret Key are correct

**Issue:** Webhook not received
- **Solution:** Ensure webhook URL is publicly accessible (use ngrok for local testing)

**Issue:** Payment stuck in pending
- **Solution:** Check Cashfree dashboard for payment status

### Production Checklist

- [ ] Get production credentials from Cashfree
- [ ] Update environment variables
- [ ] Set up webhook URL with HTTPS
- [ ] Implement webhook signature verification
- [ ] Add payment logging
- [ ] Set up payment monitoring/alerts
- [ ] Test full payment flow
- [ ] Configure payment failure notifications
- [ ] Set up reconciliation process

### Support

- **Cashfree Docs:** https://docs.cashfree.com/
- **Support:** support@cashfree.com
- **Test Mode:** https://sandbox.cashfree.com/

---

## Alternative: Razorpay Integration

If you prefer Razorpay instead:

### Install Razorpay SDK
```bash
npm install razorpay
```

### Initialize
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

### Create Order
```javascript
const order = await razorpay.orders.create({
  amount: amount * 100, // Amount in paise
  currency: 'INR',
  receipt: orderId,
  payment_capture: 1
});
```

The integration flow is similar to Cashfree.

---

**Ready to integrate!** Choose your preferred payment gateway and follow the steps above.
