# Amazon LWA Credentials Setup Guide

## For ONNGEO Client - Step-by-Step Instructions

This guide will help you obtain the necessary **LWA (Login with Amazon)** credentials required for integrating your Amazon Seller account with Pixel Commerce EMS.

---

## 📋 What You'll Need

- Active Amazon Seller Central account
- Admin access to your seller account
- 15-20 minutes to complete the setup

---

## 🔑 Step-by-Step Instructions

### **Step 1: Login to Amazon Seller Central**

1. Go to [https://sellercentral.amazon.in](https://sellercentral.amazon.in) (for India)
   - OR [https://sellercentral.amazon.com](https://sellercentral.amazon.com) (for US/Global)
2. Login with your seller account credentials
3. Ensure you're logged in as the **primary account holder** or have admin permissions

---

### **Step 2: Access Developer Console**

1. From the top menu, hover over **"Apps & Services"**
2. Click on **"Develop Apps"**
3. You'll be redirected to the Amazon Developer Console
4. If prompted, login again with the same credentials

---

### **Step 3: Navigate to LWA (Login with Amazon)**

1. In the Developer Console, look for **"Login with Amazon"** section
2. Click on **"Security Profiles"** or **"Create a New Security Profile"**
3. If you already have an app, you'll see it listed here
4. If not, you'll need to create a new one

---

### **Step 4: Create New Security Profile (If First Time)**

1. Click **"Create a New Security Profile"**
2. Fill in the required details:
   - **Security Profile Name:** `Pixel Commerce Integration`
   - **Security Profile Description:** `Integration for ONNGEO Amazon seller account with Pixel Commerce EMS`
   - **Consent Privacy Notice URL:** `https://yourwebsite.com/privacy` (use your company website)
3. Click **"Save"**

---

### **Step 5: Get Your LWA Credentials**

1. After creating (or selecting existing) Security Profile, click on the **gear icon (⚙️)** or **"Manage"**
2. You'll see a page with multiple tabs:
   - General
   - Web Settings
   - iOS Settings
   - Android Settings
   - TV Settings

3. Stay on the **"General"** tab
4. You'll see:
   - **Client ID** (also called Client Identifier)
   - **Client Secret** (click "Show Secret" to view)

---

### **Step 6: Copy Your Credentials**

**⚠️ IMPORTANT: Keep these credentials secure!**

1. **Client ID / Client Identifier:**
   ```
   Format: amzn1.application-oa2-client.XXXXXXXXXXXXXXXXX
   ```
   - Copy this entire string
   - Save it in a secure location

2. **Client Secret:**
   - Click **"Show Secret"** button
   - Copy the secret (long alphanumeric string)
   - Save it in a secure location
   - **Never share this publicly!**

3. **Note the Rotation Deadline:**
   - Amazon shows when you need to rotate the secret
   - Format: `Rotation Deadline: YYYY-MM-DDTHH:MM:SS.SSSZ`
   - Set a reminder to rotate before this date

---

### **Step 7: Get Your Seller ID**

1. Go back to Amazon Seller Central
2. Click on **"Settings"** (top right corner)
3. Select **"Account Info"**
4. Look for **"Merchant Token"** or **"Seller ID"**
   ```
   Format: A2XXXXXXXXXXXXX (starts with A, followed by numbers/letters)
   ```
5. Copy this ID - you'll need it for the Pixel Commerce onboarding

---

### **Step 8: Prepare Information for Pixel Commerce**

You'll need the following information ready:

#### **Store Details:**
- Store Name: (e.g., "ONNGEO Amazon Store")
- Seller ID: `A2XXXXXXXXXXXXX` (from Step 7)
- Business Name: (Your registered business name)
- GSTIN: (Your GST number)
- Contact Email: (Your business email)
- Contact Phone: (Your business phone)
- Warehouse Pincode: (Your warehouse pincode)
- City: (Your warehouse city)

#### **API Credentials:**
- Client ID: `amzn1.application-oa2-client.XXXXXXXXX` (from Step 6)
- Client Secret: `XXXXXXXXXXXXXXXXX` (from Step 6)

---

## 📧 Send Us This Information

Once you have all the details, send them to your Pixel Commerce integration team via **secure email** or **encrypted communication**.

**Email Template:**

```
Subject: Amazon LWA Credentials for ONNGEO Integration

Hi Team,

Please find my Amazon integration details below:

STORE DETAILS:
- Store Name: ONNGEO Amazon Store
- Seller ID: A2XXXXXXXXXXXXX
- Business Name: [Your Business Name]
- GSTIN: [Your GSTIN]
- Contact Email: [Your Email]
- Contact Phone: [Your Phone]
- Warehouse Location: [City], [Pincode]

API CREDENTIALS:
- Client ID: amzn1.application-oa2-client.XXXXXXXXX
- Client Secret: [Attached separately for security]

Please proceed with the integration.

Thanks,
[Your Name]
```

---

## ✅ Verification Checklist

Before submitting, ensure:
- [ ] Client ID starts with `amzn1.application-oa2-client.`
- [ ] Client Secret is copied correctly (no extra spaces)
- [ ] Seller ID starts with `A2` or `A3`
- [ ] GSTIN is 15 characters (format: 29AABCT1234D1Z5)
- [ ] All contact information is accurate

---

## 🔒 Security Best Practices

1. **Never share credentials publicly** (Slack, email, WhatsApp)
2. **Use secure channels** (encrypted email, password managers)
3. **Rotate secrets regularly** (before Amazon's deadline)
4. **Don't commit to Git** (keep credentials out of code repositories)
5. **Limit access** (only authorized team members should have credentials)

---

## ❓ Troubleshooting

### **Can't find "Develop Apps" in Seller Central?**
- Make sure you're logged in as the primary account holder
- Try accessing directly: [https://developer.amazon.com](https://developer.amazon.com)

### **Don't see "Login with Amazon" option?**
- You might need to register as an Amazon Developer first
- Go to [https://developer.amazon.com](https://developer.amazon.com)
- Click "Sign in" and use your Seller Central credentials
- Accept the Amazon Developer Services Agreement

### **Client Secret not showing?**
- Click the "Show Secret" button
- If you see "Rotate Secret", you need to generate a new one first
- Click "Rotate Secret", confirm, then the new secret will be displayed

### **Need to create a new Security Profile?**
- Go to: [https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html)
- Follow Step 4 above

---

## 📞 Need Help?

Contact your Pixel Commerce integration team:
- Email: support@pixelcommerce.com
- Phone: +91 XXXXXXXXXX
- Support Hours: Monday-Friday, 9 AM - 6 PM IST

---

## 🎯 What Happens Next?

After you provide these credentials:
1. Our team will configure your Amazon integration
2. We'll set up the connection with Amazon SP-API
3. You'll be able to manage orders, products, and inventory from Pixel Commerce
4. Real-time sync will be enabled between Amazon and your EMS

Estimated setup time: **2-3 business days** after receiving credentials.

---

**Last Updated:** November 30, 2025  
**Version:** 1.0  
**For:** ONNGEO - Amazon Integration
