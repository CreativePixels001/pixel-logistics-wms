# TMS Backend Setup Guide

## Quick Start

Follow these steps to set up and run the TMS backend with MongoDB integration.

### Prerequisites

- Node.js v16+ installed
- MongoDB installed and running
- PostgreSQL installed and running (for WMS)
- Git

### Step 1: Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh
# You should see MongoDB shell
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `mongoose` v8.0.3 - MongoDB ODM
- All existing dependencies (Express, Sequelize, etc.)

### Step 3: Configure Environment

**Copy the example environment file:**
```bash
cp .env.example .env
```

**Update `.env` with your MongoDB connection:**
```env
# MongoDB Configuration (TMS)
MONGO_URI=mongodb://localhost:27017/pixel_logistics_tms
MONGO_POOL_SIZE=10

# PostgreSQL remains the same for WMS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixel_logistics_wms
DB_USER=postgres
DB_PASSWORD=your_password
```

### Step 4: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected output:**
```
🚀 Pixel Logistics WMS/TMS API Server started
📡 Server running on port 5000
🌍 Environment: development
✅ MongoDB connection established successfully
📊 Connected to database: pixel_logistics_tms
✅ Database connection established successfully
PostgreSQL database synchronized
📦 WMS: PostgreSQL ✅
🚚 TMS: MongoDB ✅
📚 API Docs: http://localhost:5000/api-docs
💚 Health Check: http://localhost:5000/health
```

### Step 5: Verify Setup

**Test health endpoint:**
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Pixel Logistics WMS API is running",
  "timestamp": "2024-01-17T10:30:00.000Z",
  "uptime": 15.234,
  "environment": "development"
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           # General config
│   │   ├── database.js         # PostgreSQL (WMS)
│   │   ├── mongodb.js          # MongoDB (TMS) ✅ NEW
│   │   └── logger.js
│   ├── models/
│   │   ├── Shipment.js         # ✅ NEW - Shipment model
│   │   ├── Carrier.js          # ✅ NEW - Carrier model
│   │   ├── Route.js            # ✅ NEW - Route model
│   │   └── ... (WMS models)
│   ├── controllers/
│   │   ├── tms/
│   │   │   ├── shipment.controller.js    # ✅ NEW
│   │   │   ├── carrier.controller.js     # ✅ NEW
│   │   │   └── dashboard.controller.js   # ✅ NEW
│   │   └── ... (WMS controllers)
│   ├── routes/
│   │   ├── tms/
│   │   │   ├── shipment.routes.js        # ✅ NEW
│   │   │   ├── carrier.routes.js         # ✅ NEW
│   │   │   └── dashboard.routes.js       # ✅ NEW
│   │   └── ... (WMS routes)
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── server.js               # ✅ UPDATED - Dual DB support
├── package.json                # ✅ UPDATED - Added mongoose
├── .env.example               # ✅ UPDATED - MongoDB config
└── README.md
```

---

## API Endpoints

All TMS endpoints are prefixed with `/api/v1/tms`

### Shipment Management
- `POST /shipments` - Create shipment
- `GET /shipments` - List shipments (with filters)
- `GET /shipments/stats` - Dashboard statistics
- `GET /shipments/:id` - Get single shipment
- `PATCH /shipments/:id` - Update shipment
- `DELETE /shipments/:id` - Delete shipment
- `POST /shipments/:id/tracking` - Add tracking event
- `PATCH /shipments/:id/progress` - Update progress

### Carrier Management
- `POST /carriers` - Create carrier
- `GET /carriers` - List carriers (with filters)
- `GET /carriers/top` - Top performers
- `GET /carriers/service-type` - Search by service
- `GET /carriers/:id` - Get single carrier
- `PATCH /carriers/:id` - Update carrier
- `DELETE /carriers/:id` - Delete carrier
- `POST /carriers/:id/rating` - Add rating
- `POST /carriers/:id/performance` - Update performance

### Dashboard
- `GET /dashboard/stats` - Comprehensive stats
- `GET /dashboard/activity` - Recent activity
- `GET /dashboard/analytics` - Analytics data

---

## Testing the API

### 1. Login to Get JWT Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pixellogistics.com",
    "password": "admin123"
  }'
```

**Save the token from response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Create a Carrier

```bash
curl -X POST http://localhost:5000/api/v1/tms/carriers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fast Freight Lines",
    "dotNumber": "1234567",
    "mcNumber": "MC-987654",
    "contact": {
      "email": "dispatch@fastfreight.com",
      "phone": "1-800-555-0100"
    },
    "serviceTypes": ["ftl", "ltl"],
    "operatingRegions": ["national"]
  }'
```

### 3. Create a Shipment

```bash
curl -X POST http://localhost:5000/api/v1/tms/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {
      "name": "ABC Warehouse",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    },
    "destination": {
      "name": "XYZ Distribution",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601"
    },
    "carrier": "CARRIER_ID_FROM_STEP_2",
    "pickupDate": "2024-01-20T08:00:00Z",
    "scheduledDeliveryDate": "2024-01-23T17:00:00Z",
    "freight": {
      "type": "ftl",
      "weight": 42000,
      "quantity": 24,
      "description": "Electronics"
    },
    "priority": "high"
  }'
```

### 4. Get Dashboard Stats

```bash
curl http://localhost:5000/api/v1/tms/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Management

### View MongoDB Data

```bash
mongosh
use pixel_logistics_tms
db.shipments.find().pretty()
db.carriers.find().pretty()
db.routes.find().pretty()
```

### Clear Test Data

```bash
mongosh
use pixel_logistics_tms
db.shipments.deleteMany({})
db.carriers.deleteMany({})
db.routes.deleteMany({})
```

### Create Indexes (if needed)

Indexes are created automatically by Mongoose when models are loaded, but you can verify:

```bash
mongosh
use pixel_logistics_tms
db.shipments.getIndexes()
db.carriers.getIndexes()
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`

**Solution:**
```bash
# Check if MongoDB is running
brew services list

# Restart MongoDB
brew services restart mongodb-community

# Or use mongosh without authentication (local dev)
MONGO_URI=mongodb://localhost:27017/pixel_logistics_tms
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID

# Or use a different port in .env
PORT=5001
```

### Missing Environment Variables

**Error:** `MongoParseError: Invalid connection string`

**Solution:**
- Ensure `.env` file exists in `backend/` directory
- Verify `MONGO_URI` is set correctly
- Don't use quotes around the value

### Authentication Token Issues

**Error:** `401 Unauthorized`

**Solution:**
- Ensure you logged in and got a valid token
- Check token is not expired (default: 7 days)
- Verify `Bearer ` prefix in Authorization header
- Check JWT_SECRET in `.env` matches

---

## Development Workflow

### 1. Start Development Server

```bash
cd backend
npm run dev
```

### 2. Watch Logs

Server logs will show:
- HTTP requests (Morgan)
- Database connections
- Errors and warnings (Winston)

### 3. Test Endpoints

Use Postman, Thunder Client, or cURL to test endpoints

### 4. Check Database

Use MongoDB Compass or mongosh to view data:
```bash
mongosh
use pixel_logistics_tms
db.shipments.find()
```

---

## Next Steps

1. ✅ Backend is ready
2. ⏳ Install dependencies: `npm install`
3. ⏳ Configure `.env` file
4. ⏳ Start server: `npm run dev`
5. ⏳ Test API endpoints
6. ⏳ Integrate with TMS dashboard frontend
7. ⏳ Add sample/seed data for testing

---

## Additional Resources

- [TMS API Documentation](./TMS_API_DOCUMENTATION.md)
- [Development Plan](./DEVELOPMENT_PLAN.md)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express Documentation](https://expressjs.com/)
