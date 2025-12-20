# 🚀 Render.com Deployment Guide

## Why Render.com?
- ✅ **FREE** PostgreSQL database included
- ✅ **FREE** SSL certificate
- ✅ **$0/month** free tier (with limitations) or **$7/month** for better performance
- ✅ Auto-deploy from GitHub
- ✅ Custom domain support (`academy.creativepixels.in`)
- ✅ No credit card needed for free tier
- ✅ Much simpler than AWS

---

## Step 1: Create Render Account

1. Go to: https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. **Sign up with GitHub** (easiest - auto-connects repos)
4. Authorize Render to access your GitHub
5. Complete account setup

---

## Step 2: Create PostgreSQL Database (FREE)

1. In Render Dashboard, click **"New +"** button
2. Select **"PostgreSQL"**
3. **Database Configuration:**
   - Name: `pixel-academy-db`
   - Database: `pixel_academy` (auto-generated)
   - User: `pixel_academy_user` (auto-generated)
   - Region: **Singapore** (closest to Mumbai for good performance)
   - Plan: **Free** (no credit card required!)
   
4. Click **"Create Database"**
5. Wait 1-2 minutes for database to provision

6. **SAVE THESE CREDENTIALS** (on the database page):
   ```
   Internal Database URL: postgres://...
   External Database URL: postgres://...
   ```

---

## Step 3: Create Web Service (Backend)

1. Click **"New +"** button
2. Select **"Web Service"**
3. **Connect Repository:**
   - If GitHub connected: Select `pixel-logistics-wms` repo
   - If not: Click "Connect account" and authorize GitHub
   
4. **Configure Service:**
   - Name: `pixel-academy-backend`
   - Region: **Singapore**
   - Branch: `main`
   - Root Directory: `CPX website/Pixel Academy/backend` (or leave blank if backend is at root)
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   
5. **Plan:**
   - Free: $0/month (limited - sleeps after inactivity)
   - Starter: $7/month (always on, better performance) ⭐ **RECOMMENDED**

6. Click **"Advanced"** to add environment variables

---

## Step 4: Add Environment Variables

Click **"Add Environment Variable"** for each:

```bash
NODE_ENV=production
PORT=8080

# Database (copy from your database page)
DB_HOST=<from Render database page>
DB_PORT=5432
DB_NAME=pixel_academy
DB_USER=<from Render database page>
DB_PASSWORD=<from Render database page>

# Or use full connection string:
DATABASE_URL=<External Database URL from Render>

# JWT Secret (generate new one)
JWT_SECRET=<generate 64 char random string>
JWT_EXPIRES_IN=7d

# Google OAuth (you'll add these later)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# Frontend URL (your FTP server)
FRONTEND_URL=http://68.178.157.215

# Admin emails
ADMIN_EMAILS=admin@creativepixels.in,ashish@creativepixels.in

# File uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

7. Click **"Create Web Service"**

---

## Step 5: Wait for Deployment

1. Render will automatically:
   - Clone your GitHub repo
   - Run `npm install`
   - Start the server
   - Assign a URL: `https://pixel-academy-backend.onrender.com`

2. Watch the **Logs** tab for progress
3. Deployment takes 3-5 minutes
4. Status will show **"Live"** when ready

---

## Step 6: Set Up Custom Domain

### A) Update DNS (at your domain registrar)

1. Go to where you manage `creativepixels.in` DNS
2. Add CNAME record:
   ```
   Type: CNAME
   Name: academy
   Value: pixel-academy-backend.onrender.com
   TTL: 3600
   ```

### B) Add Custom Domain in Render

1. Go to your web service in Render
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"**
4. Click **"Add Custom Domain"**
5. Enter: `academy.creativepixels.in`
6. Click **"Verify"**
7. Render will automatically provision **FREE SSL certificate**!

---

## Step 7: Update Backend Code (if needed)

If Render can't find your backend folder:

1. **Option A:** Move backend to repo root
2. **Option B:** Update Root Directory in Render settings

Make sure these files exist in backend folder:
- `package.json` (with `"start": "node server.js"`)
- `server.js`
- All dependencies

---

## Step 8: Test Deployment

1. Get your backend URL: `https://pixel-academy-backend.onrender.com`
2. Test health endpoint:
   ```bash
   curl https://pixel-academy-backend.onrender.com/health
   ```
3. Test courses API:
   ```bash
   curl https://pixel-academy-backend.onrender.com/api/courses
   ```

---

## Step 9: Update Frontend Config

Update `/js/config.js`:
```javascript
const CONFIG = {
  API_URL: 'https://pixel-academy-backend.onrender.com',
  // OR if custom domain is set up:
  // API_URL: 'https://academy.creativepixels.in',
  
  GOOGLE_CLIENT_ID: 'your-actual-client-id.apps.googleusercontent.com'
};
```

---

## Step 10: Set Up Google OAuth

Follow `GOOGLE_OAUTH_SETUP.md` but use these URLs:

**Authorized JavaScript origins:**
```
http://localhost:8000
http://68.178.157.215
https://pixel-academy-backend.onrender.com
https://academy.creativepixels.in
```

**Authorized redirect URIs:**
```
http://localhost:8000/login.html
http://68.178.157.215/login.html
https://academy.creativepixels.in/login.html
```

---

## ✅ Final Checklist

- [ ] Render account created
- [ ] PostgreSQL database created (free)
- [ ] Web service created and deployed
- [ ] Environment variables added
- [ ] Backend shows "Live" status
- [ ] Health endpoint returns {"status":"ok"}
- [ ] Custom domain added (optional)
- [ ] SSL certificate provisioned
- [ ] Frontend config updated with backend URL
- [ ] Google OAuth credentials created
- [ ] Frontend uploaded to FTP
- [ ] Login tested end-to-end

---

## 💰 Cost Breakdown

### Option 1: FREE (For Testing)
- PostgreSQL: **FREE** (limited)
- Web Service: **FREE** (sleeps after 15 min inactivity)
- SSL: **FREE**
- **Total: $0/month** ✅

### Option 2: PAID (Production Ready)
- PostgreSQL: **FREE**
- Web Service: **$7/month** (always on, faster)
- SSL: **FREE**
- **Total: $7/month** ✅

---

## 🔄 Auto-Deploy Feature

Every time you push to GitHub:
- Render automatically detects changes
- Rebuilds and redeploys
- Zero downtime deployment
- View logs in real-time

**To manually redeploy:**
1. Go to web service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 Monitoring

**View Logs:**
- Go to web service
- Click **"Logs"** tab
- See real-time application logs

**Metrics:**
- Click **"Metrics"** tab
- See CPU, memory, bandwidth usage

**Alerts:**
- Set up email alerts for downtime
- Get notified of deployment failures

---

## 🆘 Common Issues

### Issue: "Build failed"
- Check logs for errors
- Verify `package.json` has correct start script
- Check Node version compatibility

### Issue: "Database connection failed"
- Verify DATABASE_URL is correct
- Check database is in same region (or use external URL)
- Verify database is running (green status)

### Issue: "Port already in use"
- Render automatically sets PORT env variable
- Make sure server.js uses `process.env.PORT`

### Issue: "Custom domain not verifying"
- Wait for DNS propagation (up to 24 hours)
- Check CNAME record is correct
- Try with/without www

---

## 🎉 You're Live!

Once everything is set up:

**Your Backend API:** `https://academy.creativepixels.in`  
**Health Check:** `https://academy.creativepixels.in/health`  
**API Base:** `https://academy.creativepixels.in/api`  

**Your Frontend:** `http://68.178.157.215` (via FTP)

---

**Need help?** Check Render docs: https://render.com/docs  
**Support:** https://render.com/support
