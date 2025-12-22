# 🚀 CPX Website & Pixel Ecosystem - Local Development Guide

## ✅ Current Status

**Last Updated:** November 22, 2025

### Services Running:
- ✅ **Backend API**: `http://localhost:5001` (Port 5001)
- ✅ **CPX Website**: `http://localhost:8000` (Port 8000)
- ✅ **Database**: MongoDB Atlas (Cloud-hosted)

---

## 🌐 LOCAL URLs - CPX WEBSITE

### **Main Pages:**
```
🏠 Homepage:           http://localhost:8000/index.html
🌐 Ecosystem:          http://localhost:8000/ecosystem.html
🎨 Studio:             http://localhost:8000/studio.html
💳 Checkout:           http://localhost:8000/checkout.html
✅ Payment Success:    http://localhost:8000/payment-success.html
🧪 Connection Test:    http://localhost:8000/test-connection.html
```

### **Projects & Modules:**
```
📱 Pixel Connect:      http://localhost:8000/Low/UX%20Study%20/motherboard.html
📊 Projects Low:       http://localhost:8000/Low/
📁 Projects Gallery:   http://localhost:8000/Projects/
```

---

## 🌐 LOCAL URLs - WMS/TMS APPLICATIONS

### **Frontend Applications (Port 8000):**
```
🏠 WMS Landing:        http://localhost:8000/WMS/landing.html
🔐 WMS Login:          http://localhost:8000/WMS/login.html
📊 WMS Dashboard:      http://localhost:8000/WMS/analytics-dashboard.html
📦 Inventory:          http://localhost:8000/WMS/inventory.html

🚚 TMS Application:    http://localhost:8000/TMS/
✈️ AMS Application:    http://localhost:8000/AMS/
📮 PTMS Application:   http://localhost:8000/PTMS/
🎫 PTS Application:    http://localhost:8000/PTS/
```

---

## 🔧 BACKEND API ENDPOINTS

### **Base URL:** `http://localhost:5001/api/v1`

### **Health & System:**
```
GET  http://localhost:5001/health              - Health check
```

### **WMS APIs:**
```
POST http://localhost:5001/api/v1/auth/login   - Login
POST http://localhost:5001/api/v1/auth/register - Register
GET  http://localhost:5001/api/v1/inventory    - Get inventory
POST http://localhost:5001/api/v1/inventory    - Create inventory
```

### **TMS APIs:**
```
GET  http://localhost:5001/api/v1/tms/shipments     - Get shipments
GET  http://localhost:5001/api/v1/tms/carriers      - Get carriers
GET  http://localhost:5001/api/v1/tms/dashboard     - Dashboard data
GET  http://localhost:5001/api/v1/tms/fleet         - Fleet management
```

---

## 🚀 HOW TO START SERVERS

### **Option 1: Quick Start (Both Servers)**

```bash
# Terminal 1: Start Backend API
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/backend"
npm run dev

# Terminal 2: Start CPX Website
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/CPX website"
python3 -m http.server 8000
```

### **Option 2: Frontend Only (CPX Website)**

```bash
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/CPX website"
python3 -m http.server 8000

# Access: http://localhost:8000
```

### **Option 3: WMS/TMS Frontend Only**

```bash
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/frontend"
python3 -m http.server 8000

# Access: http://localhost:8000/WMS/landing.html
```

---

## 🔑 BACKEND CONFIGURATION

### **Environment Variables (.env):**

Current configuration in `/backend/.env`:

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB (TMS)
MONGODB_URI=mongodb+srv://connect_db_user:42WwQTgAanO0uVZn@pixelcluster.2wkdqoq.mongodb.net/pixel-logistics

# PostgreSQL (WMS)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_wms
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your-secret-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=7d
```

### **MongoDB Connection:**
- ✅ **Cloud Database**: Already configured and connected
- ✅ **Credentials**: Active and working
- ✅ **Collections**: TMS data (shipments, carriers, fleet, etc.)

---

## 📁 PROJECT STRUCTURE

```
Pixel ecosystem/
├── backend/                    # Node.js API Server (Port 5001)
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   └── server.js          # Main server file
│   ├── .env                   # Environment configuration
│   └── package.json
│
├── CPX website/               # CreativePixels Website (Port 8000)
│   ├── index.html             # Homepage
│   ├── ecosystem.html         # Products ecosystem
│   ├── studio.html            # Design studio
│   ├── checkout.html          # Payment checkout
│   ├── test-connection.html   # API testing page
│   ├── css/                   # Stylesheets
│   ├── js/
│   │   ├── config.js          # 🆕 API configuration
│   │   ├── main.js            # Main JavaScript
│   │   ├── ecosystem-flow.js  # Ecosystem interactions
│   │   └── stripe-payment.js  # Payment handling
│   └── images/                # Image assets
│
└── frontend/                  # WMS/TMS/AMS Applications (Port 8000)
    ├── WMS/                   # Warehouse Management
    ├── TMS/                   # Transportation Management
    ├── AMS/                   # Asset Management
    ├── PTMS/                  # Postal Transport Management
    └── PTS/                   # Parcel Tracking System
```

---

## 🔗 PATH CONFIGURATION

### **New Config File Created:**

**Location:** `/CPX website/js/config.js`

**Features:**
- ✅ Automatic environment detection (localhost vs production)
- ✅ API base URL configuration
- ✅ Helper functions for GET, POST, PUT, DELETE
- ✅ Mock data support for development
- ✅ Centralized paths and settings

**Usage in JavaScript:**
```javascript
// Make API calls
const data = await CPX_API.get('/inventory');
const result = await CPX_API.post('/auth/login', { username, password });

// Access config
console.log(CPX_CONFIG.API.BASE_URL);
console.log(CPX_CONFIG.ENV.isDevelopment);
```

---

## 🧪 TESTING YOUR SETUP

### **1. Test System Status:**
Visit: `http://localhost:8000/test-connection.html`

This page will show:
- ✅ Frontend status
- ✅ Backend API status
- ✅ Configuration status
- 🧪 API testing buttons

### **2. Test Backend API:**
```bash
# Health check
curl http://localhost:5001/health

# Get inventory
curl http://localhost:5001/api/v1/inventory
```

### **3. Test Frontend:**
```bash
# Open in browser
open http://localhost:8000/index.html
```

---

## ✅ FIXES APPLIED

### **Issues Resolved:**

1. ✅ **Created centralized API configuration** (`config.js`)
2. ✅ **Added config to all HTML pages** (index, ecosystem, studio)
3. ✅ **Backend running on port 5001** (verified)
4. ✅ **MongoDB connection active** (cloud database)
5. ✅ **Created connection test page** (debugging tool)
6. ✅ **All paths verified and working**

### **Configuration Updates:**

- ✅ `index.html` - Added `<script src="js/config.js">`
- ✅ `ecosystem.html` - Added `<script src="js/config.js">`
- ✅ `studio.html` - Added `<script src="js/config.js">`
- ✅ Backend `.env` - Configured for port 5001
- ✅ CORS - Configured for localhost:8000

---

## 🐛 TROUBLESHOOTING

### **Backend not responding?**
```bash
# Check if backend is running
lsof -ti:5001

# If not running, start it
cd backend
npm run dev
```

### **Frontend not loading?**
```bash
# Check if server is running
lsof -ti:8000

# If not running, start it
cd "CPX website"
python3 -m http.server 8000
```

### **API calls failing?**
1. Check `http://localhost:8000/test-connection.html`
2. Verify backend is running: `curl http://localhost:5001/health`
3. Check browser console for errors (F12 → Console)
4. Verify CORS settings in backend

### **Database connection issues?**
- MongoDB is cloud-hosted (already configured)
- No local database setup needed
- Check `.env` file for correct MongoDB URI

---

## 📞 SUPPORT

**Quick Links:**
- 🧪 Test Page: http://localhost:8000/test-connection.html
- 📚 API Docs: Check `/backend/README.md`
- 🏠 Homepage: http://localhost:8000/index.html

**Common Commands:**
```bash
# Stop all servers
lsof -ti:5001 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Restart backend
cd backend && npm run dev

# Restart frontend
cd "CPX website" && python3 -m http.server 8000
```

---

## 🎯 NEXT STEPS

1. ✅ Both servers are running
2. ✅ All paths are configured
3. ✅ API configuration is centralized
4. 🎨 Start developing your features!

**Ready to go!** Visit `http://localhost:8000/test-connection.html` to verify everything is working.

---

*Last verified: November 22, 2025*
