# PixelAudit - Firebase Setup Guide

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it: **PixelAudit**
4. Disable Google Analytics (optional for MVP)
5. Click **"Create project"**

---

### Step 2: Enable Authentication

1. In Firebase Console, click **"Authentication"** in left menu
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable these providers:
   - ✅ **Google** (toggle on, add support email)
   - ✅ **Email/Password** (toggle on)
5. Click **"Save"**

---

### Step 3: Create Firestore Database

1. Click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose location: **asia-south1** (Mumbai) or **us-central1**
5. Click **"Enable"**

---

### Step 4: Setup Firebase Storage

1. Click **"Storage"** in left menu
2. Click **"Get started"**
3. Accept default security rules
4. Choose same location as Firestore
5. Click **"Done"**

---

### Step 5: Get Firebase Config

1. Click **⚙️ Settings** (gear icon) → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click **</> Web** icon
4. Register app name: **PixelAudit Web**
5. **Copy the firebaseConfig object**

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB1x2x3x4x5x6x7x8x9x0",
  authDomain: "pixelaudit-12345.firebaseapp.com",
  projectId: "pixelaudit-12345",
  storageBucket: "pixelaudit-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-ABCD1234EF"
};
```

---

### Step 6: Update PixelAudit Code

1. Open: `assets/js/firebase-config.js`
2. Replace the placeholder config with your actual Firebase config
3. Save the file

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // ...
};
```

**After:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB1x2x3x4x5x6x7x8x9x0",
    authDomain: "pixelaudit-12345.firebaseapp.com",
    projectId: "pixelaudit-12345",
    storageBucket: "pixelaudit-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456",
    measurementId: "G-ABCD1234EF"
};
```

---

### Step 7: Test Locally

1. Open `login.html` in browser
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. Should redirect to `dashboard.html`

✅ **Authentication working!**

---

### Step 8: Add Firestore Security Rules (IMPORTANT!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
    
    // Clients collection
    match /clients/{clientId} {
      allow read, write: if isSignedIn();
    }
    
    // Auditors collection
    match /auditors/{auditorId} {
      allow read, write: if isSignedIn();
    }
    
    // Audits collection
    match /audits/{auditId} {
      allow read, write: if isSignedIn();
    }
    
    // Templates collection
    match /templates/{templateId} {
      allow read: if true; // Public read
      allow write: if isSignedIn();
    }
  }
}
```

3. Click **"Publish"**

---

### Step 9: Add Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. Click **"Publish"**

---

## 🎯 Database Collections

PixelAudit uses these Firestore collections:

### 1. **users** (User profiles)
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "trialStartTime": 1702123456789,
  "plan": "trial", // trial | lifetime | professional | enterprise
  "auditLimit": 9,
  "auditsUsed": 3,
  "createdAt": "timestamp",
  "lastLogin": "timestamp"
}
```

### 2. **clients** (Customer list)
```json
{
  "id": "CLT001",
  "name": "SBI Mumbai",
  "email": "contact@sbi.com",
  "phone": "+91 98765 43210",
  "address": "Mumbai, Maharashtra",
  "gst": "27AAAAA0000A1Z5",
  "totalAudits": 15,
  "createdBy": "user_uid",
  "createdAt": "timestamp"
}
```

### 3. **auditors** (Team members)
```json
{
  "id": "AUD001",
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 98765 43210",
  "whatsapp": "+91 98765 43210",
  "completedAudits": 45,
  "rating": 4.8,
  "status": "active",
  "createdBy": "user_uid",
  "createdAt": "timestamp"
}
```

### 4. **audits** (Audit records)
```json
{
  "id": "AUD1702123456789",
  "templateId": "restaurant-safety",
  "templateName": "Restaurant Safety Audit",
  "client": "SBI Mumbai",
  "location": "Andheri Branch",
  "auditor": "Rajesh Kumar",
  "assignedBy": "user_uid",
  "status": "completed", // pending | in-progress | completed | approved
  "score": 87,
  "responses": {...},
  "photos": [...],
  "notes": {...},
  "assignedAt": "timestamp",
  "startedAt": "timestamp",
  "completedAt": "timestamp",
  "approvedAt": "timestamp"
}
```

### 5. **templates** (Audit templates)
```json
{
  "id": "restaurant-safety",
  "name": "Restaurant Safety Audit",
  "category": "Travel",
  "description": "...",
  "totalItems": 40,
  "estimatedTime": "45 minutes",
  "categories": [...],
  "checklist": [...],
  "isPublic": true,
  "createdBy": "user_uid",
  "createdAt": "timestamp"
}
```

---

## 🌐 Deploy to Netlify

### Option A: Quick Deploy (Drag & Drop)

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub/Google
3. Drag your `PixelAudit` folder to Netlify
4. Wait 30 seconds
5. Your site is live! 🎉

You'll get a URL like: `https://pixelaudit-abc123.netlify.app`

---

### Option B: GitHub Deploy (Recommended)

1. Create GitHub repo: `pixelaudit`
2. Push code:
```bash
cd "/Users/ashishkumar/Documents/Pixel ecosystem/frontend/PixelAudit"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pixelaudit.git
git push -u origin main
```

3. Go to Netlify → **New site from Git**
4. Connect GitHub repo
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
6. Click **Deploy site**

---

### Custom Domain Setup

1. Buy domain: `pixelaudit.com` (₹800/year on GoDaddy/Namecheap)
2. In Netlify: **Domain settings** → **Add custom domain**
3. Add DNS records (Netlify will guide you)
4. SSL certificate auto-configured ✅
5. Your site: `https://pixelaudit.com`

---

## ✅ Testing Checklist

After setup, test these flows:

### 1. Authentication
- [ ] Google login works
- [ ] Email login works
- [ ] New account creation works
- [ ] Redirect to dashboard after login
- [ ] Logout works

### 2. Dashboard
- [ ] Stats load from Firestore
- [ ] Recent audits display
- [ ] Client/auditor counts accurate

### 3. Create Audit
- [ ] Select template
- [ ] Assign to auditor
- [ ] Save to Firestore
- [ ] WhatsApp link generated

### 4. Complete Audit
- [ ] Load template checklist
- [ ] Upload photos to Storage
- [ ] Save responses to Firestore
- [ ] Calculate score
- [ ] Submit successfully

### 5. Reports
- [ ] Load audits from Firestore
- [ ] Filter by date/client/status
- [ ] View audit details
- [ ] Export to PDF

---

## 📞 Support

If you face issues:

1. **Firebase Console Errors**: Check browser console (F12)
2. **Authentication Issues**: Verify Google OAuth is enabled
3. **Database Issues**: Check Firestore rules
4. **Storage Issues**: Check file size < 5MB

---

## 🎉 You're Live!

Once Firebase is configured and deployed to Netlify:

1. Share your live URL: `https://pixelaudit.netlify.app`
2. Users can sign up instantly
3. Data saved in real-time to Firestore
4. Photos uploaded to Firebase Storage
5. Ready for marketing! 🚀

**Estimated time:** 15-30 minutes total
**Cost:** Free (Firebase Spark plan + Netlify free tier)
**Scalability:** Up to 50,000 users on free tier
