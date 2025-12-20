# 🎯 Google OAuth Setup Guide for Production

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
**URL:** https://console.cloud.google.com

### 2. Create New Project
1. Click "Select a project" dropdown at top
2. Click "NEW PROJECT"
3. **Project Details:**
   - Project name: `Pixel Academy`
   - Organization: `creativepixels.in` (if available)
   - Location: No organization (or select your org)
4. Click "CREATE"
5. Wait for project to be created (10-20 seconds)
6. Select the new project from dropdown

---

### 3. Enable Google+ API
1. In left sidebar, go to **APIs & Services** → **Library**
2. Search for: `Google+ API`
3. Click on it
4. Click **ENABLE**
5. Wait for API to be enabled

---

### 4. Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have Google Workspace)
3. Click **CREATE**

**App Information:**
- App name: `Pixel Academy`
- User support email: `ashish@creativepixels.in`
- App logo: (upload your logo if available)

**App Domain:**
- Application home page: `https://your-domain.com` (or FTP URL)
- Application privacy policy: `https://your-domain.com/privacy.html`
- Application terms of service: `https://your-domain.com/terms.html`

**Authorized Domains:**
- Add: `creativepixels.in` (if using subdomain)
- Or your FTP domain if different

**Developer Contact:**
- Email: `ashish@creativepixels.in`

4. Click **SAVE AND CONTINUE**

**Scopes:**
- Click **ADD OR REMOVE SCOPES**
- Select:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
  - `openid`
- Click **UPDATE**
- Click **SAVE AND CONTINUE**

**Test Users (for development):**
- Add your email: `ashish@creativepixels.in`
- Add any test emails
- Click **SAVE AND CONTINUE**

5. Review and click **BACK TO DASHBOARD**

---

### 5. Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type:** Web application
4. **Name:** `Pixel Academy Web Client`

**Authorized JavaScript origins:**
Add all URLs where your app will run:
```
http://localhost:8000
http://68.178.157.215
https://your-production-domain.com
https://academy.creativepixels.in
```

**Authorized redirect URIs:**
Add login callback URLs:
```
http://localhost:8000/login.html
http://68.178.157.215/login.html
https://your-production-domain.com/login.html
https://academy.creativepixels.in/login.html
```

5. Click **CREATE**

---

### 6. Save Your Credentials
You'll see a popup with:

```
Your Client ID
xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

Your Client Secret
GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** 
- ✅ Copy **Client ID** - paste in frontend
- ✅ Copy **Client Secret** - paste in backend .env
- ✅ Download JSON (optional, for backup)

---

### 7. Update Backend .env

Open `/var/www/pixel-academy-backend/.env` and add:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret
```

---

### 8. Update Frontend Files

Find this in your login.html and other pages:

```javascript
// OLD (development)
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';

// NEW (production)
const GOOGLE_CLIENT_ID = 'xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';
```

**Files to update:**
- `login.html`
- `student/dashboard.html`
- `admin/dashboard.html`
- `js/auth.js` (if exists)
- `js/api-client.js` (if exists)

---

## 🔍 Testing OAuth Setup

### Test in Development (localhost):
1. Open: `http://localhost:8000/login.html`
2. Click "Sign in with Google"
3. Choose your account
4. Grant permissions
5. Should redirect to dashboard

### Test in Production:
1. Open: `https://your-domain.com/login.html`
2. Click "Sign in with Google"
3. Choose your account
4. Grant permissions
5. Should redirect to dashboard

---

## 🚨 Common Issues & Fixes

### Issue 1: "Error 400: redirect_uri_mismatch"
**Solution:** Add the exact URL to Authorized redirect URIs in Google Console

### Issue 2: "Access blocked: This app's request is invalid"
**Solution:** Complete OAuth consent screen configuration

### Issue 3: "Invalid client ID"
**Solution:** Check Client ID matches exactly in frontend (no extra spaces)

### Issue 4: "Access denied"
**Solution:** User needs to be added to test users (if app not published)

### Issue 5: "API not enabled"
**Solution:** Enable Google+ API in APIs & Services → Library

---

## 📋 Verification Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test users added (if needed)
- [ ] OAuth credentials created
- [ ] All origins added (localhost + production)
- [ ] All redirect URIs added
- [ ] Client ID copied to frontend
- [ ] Client Secret copied to backend .env
- [ ] Backend restarted (pm2 restart all)
- [ ] Login tested in browser
- [ ] User data stored in database

---

## 🎉 Publishing Your App (Optional)

**For public access without "unverified app" warning:**

1. Go to **OAuth consent screen**
2. Click **PUBLISH APP**
3. Submit for verification (if needed)
4. Wait for Google review (1-6 weeks)

**For now:** Keep in Testing mode, works fine for limited users

---

## 📝 Credentials Reference

Save this information securely:

```yaml
Google Cloud Project:
  Name: Pixel Academy
  Project ID: pixel-academy-xxxxxx
  Project Number: xxxxxxxxxxxx

OAuth Client:
  Client ID: xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
  Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
  
Authorized Origins:
  - http://localhost:8000
  - http://68.178.157.215
  - https://your-domain.com
  
Redirect URIs:
  - http://localhost:8000/login.html
  - http://68.178.157.215/login.html
  - https://your-domain.com/login.html
```

---

## 🔐 Security Best Practices

1. ✅ Never commit Client Secret to Git
2. ✅ Keep .env file secure (not in version control)
3. ✅ Use HTTPS in production
4. ✅ Restrict origins to your domains only
5. ✅ Regularly rotate Client Secret
6. ✅ Monitor OAuth usage in Google Console
7. ✅ Enable 2FA on Google account
8. ✅ Review access logs periodically

---

## 📞 Support

**Google OAuth Help:**
- Docs: https://developers.google.com/identity/protocols/oauth2
- Console: https://console.cloud.google.com
- Support: https://support.google.com/cloud

**Issues?** Check:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs: `pm2 logs backend`
4. Google Cloud Console → IAM & Admin → Quotas

---

**Next:** Once OAuth is set up, test the login flow end-to-end before deploying to production!
