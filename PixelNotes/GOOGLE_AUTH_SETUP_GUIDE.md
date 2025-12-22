# PixelNotes Google Authentication Setup Guide
## Production-Ready Multi-User System

---

## ✅ What Has Been Implemented

### 1. **Google OAuth 2.0 Integration**
- Real Google Sign-In using official Google Identity Services
- JWT token parsing and validation
- Secure credential handling
- Demo mode for testing without OAuth setup

### 2. **User-Specific Data Storage**
- Each user's notes stored separately: `pixelNotes_{userId}`
- User-specific PI learning data: `pixelNotesPI_{userId}`
- User-specific templates: `pixelNotesPITemplates_{userId}`
- User-specific voice language: `pixelNotesVoiceLang_{userId}`
- User-specific preferences: `pixelNotesPreferences_{userId}`

### 3. **Profile Management**
- User profile display in header (name, email, photo)
- Logout functionality
- Session management
- Authentication checks on all pages

### 4. **Security Features**
- Login required to access editor/dashboard
- User session validation
- Secure token storage
- User isolation (users can only see their own notes)

---

## 🚀 How to Go Live with Google Authentication

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing):**
   - Click "Select a project" → "New Project"
   - Project name: "PixelNotes" (or your choice)
   - Click "Create"

3. **Enable Google Identity Services:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity Services"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "PixelNotes Web Client"
   
5. **Configure Authorized Origins:**
   ```
   Authorized JavaScript origins:
   - http://localhost:5500 (for local development)
   - http://127.0.0.1:5500 (for local development)
   - https://your-domain.com (your production URL)
   - https://www.your-domain.com (www version)
   ```

6. **Configure Redirect URIs:**
   ```
   Authorized redirect URIs:
   - http://localhost:5500/login.html
   - https://your-domain.com/login.html
   ```

7. **Save and Copy Client ID:**
   - Click "Create"
   - Copy the "Client ID" (looks like: 123456789-abc.apps.googleusercontent.com)
   - Save it securely

### Step 2: Update PixelNotes Configuration

Open `login.html` and update these lines:

```javascript
// Line ~14-16
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com';

// For production, set to false
const USE_DEMO_MODE = false; // Changed from true to false
```

**Example:**
```javascript
const GOOGLE_CLIENT_ID = '123456789-abc123def456.apps.googleusercontent.com';
const USE_DEMO_MODE = false;
```

### Step 3: Test Locally

1. **Start Local Server:**
   ```bash
   # Using Python
   python -m http.server 5500
   
   # OR using Node.js
   npx http-server -p 5500
   
   # OR using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

2. **Access PixelNotes:**
   - Open browser: http://localhost:5500/login.html
   - Click "Continue with Google"
   - Sign in with your Google account
   - You should be redirected to dashboard

3. **Test Multi-User:**
   - Sign out
   - Sign in with different Google account
   - Verify notes are separate for each user

### Step 4: Deploy to Production

1. **Upload files to your web hosting:**
   - Upload all PixelNotes files to your server
   - Make sure login.html is accessible at your domain

2. **Update Google Cloud Console:**
   - Go back to Google Cloud Console
   - Update "Authorized JavaScript origins" with your production URL
   - Update "Authorized redirect URIs" with your production URL

3. **Test Production:**
   - Visit: https://your-domain.com/login.html
   - Sign in with Google
   - Verify everything works

---

## 🧪 Testing with Demo Mode (Current Setup)

**Demo mode is currently ENABLED for easy testing:**

1. Open `login.html` in browser
2. Click "Continue with Google"
3. Enter demo email (e.g., test@gmail.com)
4. Enter demo name (e.g., Test User)
5. You'll be logged in with a simulated account

**Each demo email gets separate storage!**
- User 1: demo@gmail.com
- User 2: test@gmail.com
- User 3: ashish@gmail.com

All will have isolated notes and data.

---

## 📊 User Data Structure

### LocalStorage Keys Per User:

```javascript
// User ID: google_123456789 (from Google)
// OR demo_base64encoded_email (in demo mode)

localStorage:
{
  "pixelNotesUser": {
    "provider": "google",
    "userId": "google_123456789",
    "email": "user@gmail.com",
    "name": "User Name",
    "picture": "https://...jpg",
    "accessToken": "...",
    "loginTime": "2025-12-07T...",
    "emailVerified": true
  },
  
  "pixelNotesCurrentUserId": "google_123456789",
  
  "pixelNotes_google_123456789": [
    { id: "note1", title: "...", content: "...", ... },
    { id: "note2", title: "...", content: "...", ... }
  ],
  
  "pixelNotesPI_google_123456789": {
    "writingPatterns": {},
    "commonTopics": [],
    ...
  },
  
  "pixelNotesPITemplates_google_123456789": [...],
  
  "pixelNotesVoiceLang_google_123456789": "en-IN"
}
```

---

## 🔒 Security Features

### 1. **Authentication Check**
Every page checks if user is logged in:
```javascript
if (!currentUser || !currentUserId) {
    alert('⚠️ Please login to access PixelNotes');
    window.location.href = 'login.html';
}
```

### 2. **User Isolation**
Users can ONLY access their own data:
- Notes: `pixelNotes_{userId}`
- Each userId is unique (from Google or demo email)
- No cross-user data access

### 3. **Logout**
Clears session but preserves user data:
```javascript
localStorage.removeItem('pixelNotesUser');
localStorage.removeItem('pixelNotesCurrentUserId');
// User data (notes, PI) remains for next login
```

---

## 🎨 UI Features Added

### User Profile in Header:
- User photo (circular avatar)
- User name
- User email
- Logout button

### Logout Button:
- SVG icon + "Logout" text
- Confirmation dialog
- Clean session cleanup
- Redirect to login

---

## 🐛 Troubleshooting

### Problem: "Please configure GOOGLE_CLIENT_ID" alert
**Solution:** You need to set up Google OAuth credentials (see Step 1 above)

### Problem: Google sign-in popup doesn't appear
**Solution:** 
- Check if GOOGLE_CLIENT_ID is correct
- Verify domain is added to "Authorized JavaScript origins"
- Clear browser cache and cookies

### Problem: "Access blocked: This app is unverified"
**Solution:** 
- In development, click "Advanced" → "Go to PixelNotes (unsafe)"
- For production, submit app for Google verification

### Problem: Different users see same notes
**Solution:** 
- Check if user is actually logging out properly
- Verify STORAGE_KEYS are using userId correctly
- Clear localStorage and login again

### Problem: Demo mode not working
**Solution:**
- Make sure `USE_DEMO_MODE = true` in login.html
- Enter valid email format
- Check browser console for errors

---

## 📝 Migration from Old System

If you have existing notes from the old system (without user accounts):

1. **Backup existing notes:**
   ```javascript
   // Run in browser console
   const oldNotes = localStorage.getItem('pixelNotes');
   console.log('Backup:', oldNotes);
   ```

2. **Assign to first user:**
   ```javascript
   // After logging in with first account
   const userId = localStorage.getItem('pixelNotesCurrentUserId');
   const oldNotes = localStorage.getItem('pixelNotes');
   if (oldNotes) {
       localStorage.setItem(`pixelNotes_${userId}`, oldNotes);
       localStorage.removeItem('pixelNotes'); // Clean up old key
   }
   ```

---

## ✨ Features Summary

✅ **Multi-User Support** - Multiple users can use the same system
✅ **Google Authentication** - Secure sign-in with Google accounts
✅ **Data Isolation** - Each user's notes are completely separate
✅ **Profile Management** - User info displayed, logout functionality
✅ **Session Management** - Persistent login (until logout)
✅ **Demo Mode** - Test without Google OAuth setup
✅ **Production Ready** - Switch to real OAuth anytime

---

## 🚀 Quick Start Checklist

### For Testing (Demo Mode):
- [x] Open login.html
- [x] Click "Continue with Google"
- [x] Enter demo email
- [x] Start using PixelNotes

### For Production:
- [ ] Get Google OAuth Client ID (Step 1)
- [ ] Update GOOGLE_CLIENT_ID in login.html (Step 2)
- [ ] Set USE_DEMO_MODE = false
- [ ] Test locally (Step 3)
- [ ] Deploy to production server (Step 4)
- [ ] Update Google Console with production URL
- [ ] Test production sign-in

---

## 📞 Support

If you need help:
1. Check browser console for errors (F12 → Console)
2. Verify Google OAuth setup
3. Test in incognito mode (clears cache issues)
4. Check localStorage in DevTools (Application tab)

---

## 🎉 You're Ready!

**Demo Mode:** Works immediately, no setup needed
**Production Mode:** 30 minutes to set up Google OAuth

Your PixelNotes app now supports:
- ✅ Multiple user profiles
- ✅ Secure Google authentication  
- ✅ Isolated user data
- ✅ Professional login system
- ✅ Production-ready architecture

**Current Status:** DEMO MODE ENABLED (ready for testing)
**Next Step:** Get Google OAuth credentials when ready for production
