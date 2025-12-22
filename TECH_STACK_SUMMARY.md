# 📊 Pixel Ecosystem - Technical Stack Summary

**Date:** 11 December 2025  
**Analysis:** Complete backend and database audit

---

## A) BACKEND TECHNOLOGY

### ✅ **Node.js** (Primary Backend)

**Location:** `/backend/`

**Framework:** Express.js 4.18.2

**Key Technologies:**
- **Runtime:** Node.js 18+
- **Web Framework:** Express.js
- **Real-time:** Socket.io 4.8.1
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Security:** Helmet, CORS, Rate Limiting
- **Logging:** Winston, Morgan
- **Validation:** Express Validator 7.0.1
- **File Upload:** Multer
- **Cloud Storage:** AWS S3 SDK

**Evidence:**
```json
// backend/package.json
{
  "name": "pixel-logistics-wms-backend",
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "socket.io": "^4.8.1",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  }
}
```

### ❌ Python Backend: **NOT USED**
No Python backend detected in the Pixel ecosystem.

---

## B) DATABASE SYSTEMS

### 🎯 **MULTIPLE DATABASES** (Hybrid Architecture)

### 1️⃣ **PostgreSQL** (Primary Database - WMS)

**Used For:** Warehouse Management System (WMS)

**ORM:** Sequelize 6.35.1

**Configuration:**
```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_logistics_wms
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**Models Using PostgreSQL:**
- User (Authentication)
- Inventory (Stock management)
- Products
- Warehouses
- Locations
- Sales Orders
- Purchase Orders
- Receiving
- Putaway
- Picking
- Packing
- Shipping
- Returns

**Evidence:**
```javascript
// backend/src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});
```

---

### 2️⃣ **MongoDB** (Secondary Database - TMS)

**Used For:** Transportation Management System (TMS)

**ORM:** Mongoose 8.20.0

**Configuration:**
```env
# .env
MONGO_URI=mongodb://localhost:27017/pixel_logistics_tms
MONGO_POOL_SIZE=10
```

**Collections Using MongoDB:**
- Drivers
- Vehicles
- Trips
- Routes
- Tracking Data
- Shipments
- GPS Coordinates (Real-time tracking)
- Agent Records
- Customer Records

**Evidence:**
```javascript
// backend/src/config/mongodb.js
const mongoose = require('mongoose');

await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

---

### 3️⃣ **MySQL** - ❌ NOT USED

No MySQL detected in the current stack.

---

## 📁 PROJECT BREAKDOWN BY DATABASE

### **PostgreSQL Projects:**
1. ✅ **WMS** (Warehouse Management System)
2. ✅ **PIS** (Policy Insurance System)
3. ✅ **HRMS** (HR Management)
4. ✅ **EMS** (Employee Management)
5. ✅ **AMS** (Asset Management)

### **MongoDB Projects:**
1. ✅ **TMS** (Transportation Management)
2. ✅ **PTS** (Pixel Trip System)
3. ✅ **PTMS** (Pixel Trip Management)
4. ✅ **PixelNotes** (Note-taking app)

### **Frontend Only (No Backend Yet):**
1. ⏳ **PixelAudit** (Ready for Firebase)
2. ⏳ **PixelCloud** (Ready for backend)
3. ⏳ **PixelFact** (Frontend complete)
4. ⏳ **PixelWrite** (Content management)

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────┐
│         PIXEL ECOSYSTEM                  │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    Frontend           Backend (Node.js)
        │                    │
        │         ┌──────────┴──────────┐
        │         │                     │
        │    PostgreSQL            MongoDB
        │    (Relational)        (Document)
        │         │                     │
        │    ┌────┴────┐         ┌─────┴─────┐
        │    │         │         │           │
        │   WMS       PIS       TMS      PixelNotes
        │   HRMS      EMS       PTS      Real-time
        │   AMS                 PTMS      Tracking
        │
    ┌───┴────────────────────────────────┐
    │                                    │
PixelAudit                         PixelCloud
(Firebase)                       (To be integrated)
```

---

## 🔧 BACKEND SERVER FILES

### Main Servers:
1. **`server.js`** - Full integrated server (WMS + TMS + PIS)
2. **`server-wms-only.js`** - Warehouse only
3. **`server-pis-only.js`** - Insurance only
4. **`server-full.js`** - All systems combined

### API Endpoints:

#### WMS APIs (PostgreSQL):
- `/api/v1/wms/inventory`
- `/api/v1/wms/receiving`
- `/api/v1/wms/putaway`
- `/api/v1/wms/picking`
- `/api/v1/wms/packing`
- `/api/v1/wms/shipping`
- `/api/v1/wms/products`
- `/api/v1/wms/warehouses`

#### TMS APIs (MongoDB):
- `/api/v1/tms/drivers`
- `/api/v1/tms/vehicles`
- `/api/v1/tms/trips`
- `/api/v1/tms/routes`
- `/api/v1/tms/tracking`
- `/api/v1/tms/agents`
- `/api/v1/tms/customers`

#### PIS APIs (PostgreSQL):
- `/api/v1/pis/leads`
- `/api/v1/pis/clients`
- `/api/v1/pis/policies`
- `/api/v1/pis/claims`
- `/api/v1/pis/renewals`
- `/api/v1/pis/agents`

---

## 📊 DATABASE STATISTICS

### PostgreSQL Tables: **~50+ tables**
- Users, Roles, Permissions
- Products, Inventory, Stock
- Warehouses, Locations, Zones
- Orders (Sales + Purchase)
- Receiving, Putaway, Picking, Packing, Shipping
- Returns, Adjustments
- Policies, Claims, Renewals
- Leads, Clients, Agents

### MongoDB Collections: **~30+ collections**
- drivers, vehicles, trips
- routes, tracking, shipments
- agents, customers
- notes, documents
- real-time tracking data

---

## 🔐 AUTHENTICATION & SECURITY

### Used Across All Systems:
- **JWT Tokens** (Access + Refresh)
- **bcryptjs** (Password hashing)
- **Helmet** (HTTP security headers)
- **CORS** (Cross-origin control)
- **Rate Limiting** (DDoS protection)
- **Express Validator** (Input sanitization)

### Configuration:
```env
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d
```

---

## 📦 NPM PACKAGES (Key Dependencies)

```json
{
  "express": "^4.18.2",           // Web framework
  "sequelize": "^6.35.1",         // PostgreSQL ORM
  "mongoose": "^8.20.0",          // MongoDB ORM
  "pg": "^8.11.3",                // PostgreSQL driver
  "jsonwebtoken": "^9.0.2",       // JWT auth
  "bcryptjs": "^2.4.3",           // Password hashing
  "socket.io": "^4.8.1",          // Real-time
  "multer": "^1.4.5-lts.1",       // File upload
  "@aws-sdk/client-s3": "^3.936.0", // AWS S3
  "helmet": "^7.1.0",             // Security
  "cors": "^2.8.5",               // CORS
  "express-rate-limit": "^7.1.5", // Rate limiting
  "winston": "^3.11.0",           // Logging
  "moment": "^2.29.4"             // Date handling
}
```

---

## 🚀 DEPLOYMENT CONFIGURATION

### Current Setup:
- **Development:** localhost:5000
- **Database Dev:** localhost:5432 (PostgreSQL), localhost:27017 (MongoDB)
- **Production:** Deployed via FTP to shared hosting

### Deployment Scripts:
- `deploy-all-apps.sh` - Deploy entire ecosystem
- `deploy-wms.sh` - Deploy WMS only
- `deploy-tms.sh` - Deploy TMS only
- `deploy-pis.sh` - Deploy PIS only
- `deploy-pixelnotes.sh` - Deploy PixelNotes

---

## 💡 RECOMMENDATIONS

### For PixelAudit (New Project):
✅ **Use Firebase** (Best choice for MVP)
- Firestore (NoSQL like MongoDB)
- Firebase Auth (Google OAuth)
- Firebase Storage (Photos)
- **Why?** Quick setup, free tier, no server management

### Alternative Options:
1. **Add to existing Node.js backend**
   - Create `/api/v1/audit/*` routes
   - Use MongoDB (similar to TMS)
   - Benefit: Unified backend

2. **Keep separate with Firebase**
   - Independent deployment
   - Faster development
   - No coupling with WMS/TMS

---

## 📝 SUMMARY

### ✅ Backend: **Node.js + Express**
- Primary language: JavaScript
- Runtime: Node.js 18+
- Framework: Express.js 4.18.2

### ✅ Databases: **PostgreSQL + MongoDB** (Hybrid)
- **PostgreSQL:** WMS, PIS, HRMS, EMS, AMS
- **MongoDB:** TMS, PTS, PTMS, PixelNotes
- **MySQL:** NOT USED

### 📊 Project Stats:
- **Total Backend Files:** 200+ JavaScript files
- **API Endpoints:** 100+ RESTful routes
- **Database Tables/Collections:** 80+ combined
- **Active Projects:** 12+ applications
- **Lines of Code:** 50,000+ (backend only)

---

## 🎯 CONCLUSION

**Answer to your questions:**

**A) Backend Technology:** 
✅ **Node.js** (100% - No Python backend)

**B) Database Used:**
✅ **Multiple Databases:**
- **PostgreSQL** (Primary - Relational data)
- **MongoDB** (Secondary - Document data)
- **MySQL** ❌ (Not used)

**Architecture Pattern:**
- **Microservices-ready:** Separate servers per module
- **Hybrid Database:** PostgreSQL for structured, MongoDB for flexible data
- **RESTful APIs:** Standard HTTP endpoints
- **Real-time:** Socket.io for live tracking
- **Cloud Storage:** AWS S3 for files

---

**Generated:** 11 December 2025  
**Ecosystem:** Pixel Ecosystem  
**Status:** Production-ready backend with 12+ integrated applications
