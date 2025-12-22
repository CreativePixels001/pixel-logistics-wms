# TMS API Documentation

## Overview
The Transportation Management System (TMS) API provides comprehensive endpoints for managing shipments, carriers, routes, and transportation analytics. Built with Node.js, Express, and MongoDB.

## Base URL
```
http://localhost:5000/api/v1/tms
```

## Authentication
All TMS endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Shipment Endpoints

### 1. Create Shipment
**POST** `/shipments`

Creates a new shipment with origin, destination, carrier, and freight details.

**Request Body:**
```json
{
  "origin": {
    "name": "ABC Warehouse",
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA",
    "contact": {
      "name": "John Doe",
      "phone": "555-0100",
      "email": "john@abc.com"
    },
    "coordinates": {
      "latitude": 34.0522,
      "longitude": -118.2437
    }
  },
  "destination": {
    "name": "XYZ Distribution Center",
    "address": "456 Oak Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "country": "USA",
    "contact": {
      "name": "Jane Smith",
      "phone": "555-0200",
      "email": "jane@xyz.com"
    },
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "carrier": "64f5a1b2c3d4e5f6a7b8c9d0",
  "pickupDate": "2024-01-15T08:00:00Z",
  "scheduledDeliveryDate": "2024-01-18T17:00:00Z",
  "freight": {
    "type": "ftl",
    "weight": 42000,
    "dimensions": {
      "length": 48,
      "width": 40,
      "height": 53,
      "unit": "inches"
    },
    "quantity": 24,
    "description": "Electronics - 24 pallets",
    "declaredValue": 150000
  },
  "priority": "high",
  "specialInstructions": "Handle with care. Temperature sensitive items.",
  "referenceNumbers": {
    "purchaseOrder": "PO-2024-001",
    "billOfLading": "BOL-2024-001"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "shipmentId": "SH-2024-0001",
    "formattedId": "#SH-2024-0001",
    "status": "pending",
    "progress": 0,
    "carrier": {
      "name": "Fast Freight Lines",
      "dotNumber": "1234567",
      "rating": 4.5
    },
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

---

### 2. Get All Shipments
**GET** `/shipments`

Retrieves shipments with filtering, pagination, and sorting.

**Query Parameters:**
- `status` - Filter by status (pending, picked_up, in_transit, delivered, delayed, cancelled)
- `carrier` - Filter by carrier ID
- `priority` - Filter by priority (low, normal, high, urgent)
- `startDate` - Filter shipments from this pickup date
- `endDate` - Filter shipments until this pickup date
- `search` - Search in shipment ID, tracking number, carrier name, origin/destination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc or desc (default: desc)

**Example Request:**
```
GET /api/v1/tms/shipments?status=in_transit&priority=high&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "shipmentId": "SH-2024-0001",
      "status": "in_transit",
      "progress": 65,
      "origin": { "city": "Los Angeles", "state": "CA" },
      "destination": { "city": "Chicago", "state": "IL" },
      "carrier": {
        "name": "Fast Freight Lines",
        "rating": 4.5
      },
      "pickupDate": "2024-01-15T08:00:00Z",
      "estimatedDeliveryDate": "2024-01-18T17:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 248,
    "pages": 25
  }
}
```

---

### 3. Get Single Shipment
**GET** `/shipments/:id`

Retrieves detailed information about a specific shipment.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "shipmentId": "SH-2024-0001",
    "status": "in_transit",
    "progress": 65,
    "origin": { /* full origin details */ },
    "destination": { /* full destination details */ },
    "carrier": { /* full carrier details */ },
    "trackingEvents": [
      {
        "timestamp": "2024-01-15T08:30:00Z",
        "status": "picked_up",
        "location": "Los Angeles, CA",
        "notes": "Package picked up successfully"
      },
      {
        "timestamp": "2024-01-16T14:20:00Z",
        "status": "in_transit",
        "location": "Phoenix, AZ",
        "notes": "In transit - on schedule"
      }
    ],
    "currentLocation": {
      "city": "Albuquerque",
      "state": "NM",
      "coordinates": { "latitude": 35.0844, "longitude": -106.6504 },
      "lastUpdated": "2024-01-17T09:15:00Z"
    },
    "cost": {
      "baseCost": 2500,
      "fuelSurcharge": 375,
      "accessorialCharges": 150,
      "taxes": 248,
      "totalCost": 3273
    }
  }
}
```

---

### 4. Update Shipment
**PATCH** `/shipments/:id`

Updates shipment details.

**Request Body:**
```json
{
  "status": "in_transit",
  "estimatedDeliveryDate": "2024-01-19T14:00:00Z",
  "specialInstructions": "Updated delivery instructions"
}
```

---

### 5. Delete Shipment
**DELETE** `/shipments/:id`

Soft deletes a shipment (sets isActive to false).

**Response (200):**
```json
{
  "success": true,
  "message": "Shipment deleted successfully"
}
```

---

### 6. Add Tracking Event
**POST** `/shipments/:id/tracking`

Adds a tracking event and updates shipment location/status.

**Request Body:**
```json
{
  "status": "in_transit",
  "location": {
    "address": "I-40 West, Mile Marker 150",
    "city": "Albuquerque",
    "state": "NM",
    "coordinates": {
      "latitude": 35.0844,
      "longitude": -106.6504
    }
  },
  "notes": "On schedule. Next stop: Flagstaff, AZ"
}
```

---

### 7. Update Progress
**PATCH** `/shipments/:id/progress`

Updates shipment progress (0-100%). Automatically sets status to delivered at 100%.

**Request Body:**
```json
{
  "progress": 75
}
```

---

### 8. Get Dashboard Stats
**GET** `/shipments/stats`

Retrieves aggregated statistics for the dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activeShipments": 248,
    "deliveredThisMonth": 1342,
    "onTimePercentage": 98.4,
    "totalCost": 542750
  }
}
```

---

## Carrier Endpoints

### 1. Create Carrier
**POST** `/carriers`

Creates a new carrier with DOT/MC numbers and compliance info.

**Request Body:**
```json
{
  "name": "Fast Freight Lines",
  "dotNumber": "1234567",
  "mcNumber": "MC-987654",
  "contact": {
    "email": "dispatch@fastfreight.com",
    "phone": "1-800-555-0100",
    "website": "https://fastfreight.com",
    "address": {
      "street": "789 Logistics Blvd",
      "city": "Dallas",
      "state": "TX",
      "zipCode": "75201",
      "country": "USA"
    }
  },
  "businessType": "carrier",
  "serviceTypes": ["ftl", "ltl", "expedited"],
  "operatingRegions": ["national"],
  "fleet": {
    "totalVehicles": 150,
    "tractors": 75,
    "trailers": 150,
    "drivers": 120
  },
  "insurance": {
    "cargoInsurance": {
      "provider": "ABC Insurance",
      "policyNumber": "POL-12345",
      "coverage": 1000000,
      "expirationDate": "2025-12-31"
    },
    "liabilityInsurance": {
      "provider": "ABC Insurance",
      "policyNumber": "POL-12346",
      "coverage": 5000000,
      "expirationDate": "2025-12-31"
    }
  },
  "pricing": {
    "baseRatePerMile": 2.50,
    "fuelSurchargePercent": 15,
    "minimumCharge": 500
  }
}
```

---

### 2. Get Top Carriers
**GET** `/carriers/top`

Retrieves top-performing carriers ranked by on-time percentage and rating.

**Query Parameters:**
- `limit` - Number of carriers to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Fast Freight Lines",
      "dotNumber": "1234567",
      "rating": 4.8,
      "onTimePercentage": 99.2,
      "totalShipments": 1542
    }
  ]
}
```

---

### 3. Get Carriers by Service Type
**GET** `/carriers/service-type`

Searches carriers by service type and operating region.

**Query Parameters:**
- `serviceType` - Required. One of: ltl, ftl, parcel, expedited, refrigerated, hazmat, flatbed, intermodal
- `region` - Optional. One of: local, regional, national, international

---

### 4. Add Rating
**POST** `/carriers/:id/rating`

Adds a rating to a carrier (0-5 stars). Automatically calculates average.

**Request Body:**
```json
{
  "rating": 4.5
}
```

---

### 5. Update Performance
**POST** `/carriers/:id/performance`

Updates carrier performance metrics based on shipment completion.

**Request Body:**
```json
{
  "status": "delivered",
  "isOnTime": true,
  "cost": 3500
}
```

---

## Dashboard Endpoints

### 1. Get Dashboard Stats
**GET** `/dashboard/stats`

Comprehensive dashboard statistics including shipments, carriers, routes, and alerts.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeShipments": 248,
      "onTimePercentage": 98.4,
      "totalCost": 542750,
      "deliveredThisMonth": 1342,
      "activeRoutes": 87
    },
    "topCarriers": [
      {
        "rank": 1,
        "name": "Fast Freight Lines",
        "rating": 4.8,
        "onTimePercentage": 99.2,
        "totalShipments": 1542
      }
    ],
    "alerts": [
      {
        "type": "warning",
        "title": "Delayed Shipment",
        "message": "Shipment #SH-2024-0042 is delayed",
        "timestamp": "2024-01-17T14:30:00Z"
      }
    ]
  }
}
```

---

### 2. Get Recent Activity
**GET** `/dashboard/activity`

Recent shipments and route updates.

**Query Parameters:**
- `limit` - Number of items to return (default: 10)

---

### 3. Get Analytics
**GET** `/dashboard/analytics`

Detailed analytics with trends, charts, and performance metrics.

**Query Parameters:**
- `startDate` - Start date for analytics period
- `endDate` - End date for analytics period

**Response (200):**
```json
{
  "success": true,
  "data": {
    "shipmentTrend": [ /* daily shipment counts */ ],
    "shipmentByStatus": [ /* breakdown by status */ ],
    "costTrend": [ /* monthly cost trends */ ],
    "carrierPerformance": [ /* top 10 carriers with metrics */ ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "DOT number is required",
    "Origin coordinates are invalid"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Not authorized to access this route"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Shipment not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create shipment",
  "error": "Database connection error"
}
```

---

## Testing the API

### 1. Start MongoDB
```bash
mongod --dbpath /path/to/data
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update:
```env
MONGO_URI=mongodb://localhost:27017/pixel_logistics_tms
```

### 4. Start Server
```bash
npm run dev
```

### 5. Test with cURL

**Login to get token:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pixellogistics.com","password":"admin123"}'
```

**Create a shipment:**
```bash
curl -X POST http://localhost:5000/api/v1/tms/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @shipment.json
```

**Get dashboard stats:**
```bash
curl http://localhost:5000/api/v1/tms/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

Update `tms-dashboard.html` to fetch real data:

```javascript
// Get dashboard stats
async function loadDashboardStats() {
  try {
    const response = await fetch('/api/v1/tms/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const { data } = await response.json();
    
    // Update UI
    document.getElementById('active-shipments').textContent = data.stats.activeShipments;
    document.getElementById('on-time-percentage').textContent = `${data.stats.onTimePercentage}%`;
    document.getElementById('total-cost').textContent = `$${(data.stats.totalCost / 1000).toFixed(1)}K`;
    
    // Update carrier rankings
    updateCarrierRankings(data.topCarriers);
    
    // Update alerts
    updateAlerts(data.alerts);
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
  }
}
```

---

## Next Steps

1. ✅ Install mongoose: `npm install mongoose`
2. ✅ Configure MongoDB connection in `.env`
3. ⏳ Start server and test endpoints
4. ⏳ Integrate with TMS dashboard frontend
5. ⏳ Add sample data for testing
6. ⏳ Implement real-time updates with Socket.io
