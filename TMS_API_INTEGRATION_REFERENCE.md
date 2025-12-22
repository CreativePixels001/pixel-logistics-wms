# TMS API Integration - Quick Reference

## ✅ What's Been Completed

### 1. Backend API (Previously Built)
- **Shipment API**: CRUD operations, filtering, tracking
- **Carrier API**: Rankings, search, performance tracking
- **Dashboard API**: KPI stats, alerts, analytics
- **Database Models**: MongoDB schemas for Shipments, Carriers, Routes

### 2. Frontend API Integration (Just Completed)
- **New File**: `frontend/js/tms-api-integration.js` (16KB)
- **Updated**: `frontend/tms-dashboard.html` (added data attributes + script)
- **Status**: ✅ Deployed to server

---

## 📋 Features Implemented

### API Integration Functions

#### Dashboard
```javascript
loadDashboardStats()      // Loads KPIs: active shipments, on-time %, cost, carriers
updateStatCard()          // Updates individual stat cards with animation
updateCarrierRankings()   // Displays top 5 carriers
updateAlerts()            // Shows recent alerts and notifications
```

#### Shipments
```javascript
loadActiveShipments()     // Fetches and displays active shipments
createShipment()          // Creates new shipment via API
updateShipmentStatus()    // Updates shipment status
trackShipment()           // Opens tracking modal with live data
updateShipmentsTable()    // Refreshes shipments table
```

#### Carriers
```javascript
loadCarriers()            // Fetches carrier list
searchCarriers()          // Searches carriers by service type and route
```

#### Utilities
```javascript
apiRequest()              // Generic API caller with error handling
getAuthToken()            // Retrieves auth token
handleAPIError()          // User-friendly error messages
formatETA()               // Formats estimated time
calculateProgress()       // Calculates shipment progress %
```

---

## 🔗 API Endpoints

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://creativepixels.in/api`

### Dashboard
- `GET /tms/dashboard/stats` - Get all KPI statistics
- `GET /tms/dashboard/alerts` - Get recent alerts

### Shipments
- `POST /tms/shipments` - Create new shipment
- `GET /tms/shipments` - List shipments (supports filters)
- `GET /tms/shipments/:id` - Get shipment by ID
- `PUT /tms/shipments/:id` - Update shipment
- `DELETE /tms/shipments/:id` - Delete shipment

### Carriers
- `GET /tms/carriers` - List all carriers
- `GET /tms/carriers/:id` - Get carrier by ID
- `POST /tms/carriers/search` - Search carriers
- `PUT /tms/carriers/:id/performance` - Update carrier performance

---

## 🎨 UI Components Updated

### Stat Cards
Added `data-stat` attributes for API binding:
- `data-stat="active-shipments"`
- `data-stat="ontime-delivery"`
- `data-stat="monthly-cost"`
- `data-stat="pending-deliveries"`

### Carrier Rankings
Added class `carrier-rankings-list` for dynamic updates

### Alerts
Added class `alerts-list` for dynamic updates

### Shipments Table
Added class `shipments-table` for row updates

---

## 🚀 How It Works

### Auto-Load on Page Load
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardStats();     // Load KPIs
  await loadActiveShipments();    // Load shipments table
  
  // Auto-refresh every 30 seconds
  setInterval(async () => {
    await loadDashboardStats();
    await loadActiveShipments();
  }, 30000);
});
```

### Fallback to Mock Data
If API is unavailable:
- Falls back to existing mock data in HTML
- Shows console warning: "Using mock data - API unavailable"
- User sees data but it's static

---

## 🧪 Next Steps to Test

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Verify MongoDB Connection
Check console for: "MongoDB Connected"

### 3. Test API Endpoints
Open: http://localhost:5000/api/tms/dashboard/stats

### 4. Test Frontend Integration
Open: http://68.178.157.215/Projects/WMS/tms-dashboard.html
- Check browser console for API calls
- Verify stat cards animate
- Check network tab for API requests

---

## 📦 Deployment Status

### Files Deployed
✅ `tms-api-integration.js` → `/public_html/Projects/WMS/js/`
✅ `tms-dashboard.html` → `/public_html/Projects/WMS/`
✅ `tms-dashboard.js` → `/public_html/Projects/WMS/js/` (existing)

### Access URLs
- **TMS Dashboard**: http://68.178.157.215/Projects/WMS/tms-dashboard.html
- **WMS Dashboard**: http://68.178.157.215/Projects/WMS/index.html

---

## 🐛 Troubleshooting

### No Data Loading
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab for API call status
4. Confirm MongoDB is connected

### CORS Errors
Add to `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://68.178.157.215', 'https://creativepixels.in'],
  credentials: true
}));
```

### Authentication Issues
API integration includes auth token support:
```javascript
Authorization: Bearer ${getAuthToken()}
```

---

## 📊 Data Flow

```
User Opens Dashboard
       ↓
loadDashboardStats() called
       ↓
API Request to /tms/dashboard/stats
       ↓
Backend fetches from MongoDB
       ↓
Response: { activeShipments: 248, ontimePercentage: 98.4, ... }
       ↓
updateStatCard() updates each KPI with animation
       ↓
updateCarrierRankings() displays top carriers
       ↓
updateAlerts() shows recent alerts
```

---

## 🎯 Success Criteria

✅ **Completed**:
- API integration code written
- Frontend updated with data attributes
- Files deployed to server
- Auto-refresh implemented
- Error handling in place
- Fallback to mock data working

⏳ **Pending**:
- Backend server needs to be running
- MongoDB needs sample data
- API testing from live dashboard
- Performance optimization

---

## 📝 Notes

- **Auto-refresh**: Every 30 seconds
- **Fallback**: Uses mock data if API fails
- **Animations**: Stat cards animate from 0 to value
- **Error handling**: User-friendly toast notifications
- **Global access**: `window.tmsAPI` object available

---

Last Updated: November 20, 2025
Status: ✅ Frontend Integration Complete
Next: Start backend server and test with real data
