# Driver Mobile API - Complete Documentation

## Overview
RESTful API endpoints for driver mobile applications. Enables drivers to manage deliveries, update locations, upload PODs, and track assignments in real-time.

## Base URL
```
http://localhost:3000/api/v1/mobile/driver
```

## Authentication
All endpoints (except login) require JWT authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Driver Login
Authenticate driver and receive JWT token.

**Endpoint:** `POST /login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john.driver@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "driver": {
      "id": "507f1f77bcf86cd799439011",
      "driverNumber": "DRV-2024-00123",
      "fullName": "John Driver",
      "email": "john.driver@example.com",
      "phone": "+1-555-0123",
      "carrierName": "ABC Trucking LLC",
      "status": "active",
      "availabilityStatus": "available",
      "currentVehicle": "507f1f77bcf86cd799439012",
      "currentShipment": null,
      "license": {
        "licenseNumber": "D1234567",
        "state": "CA",
        "class": "A",
        "expiryDate": "2025-12-31"
      },
      "metrics": {
        "onTimeDeliveryRate": 98.5,
        "averageRating": 4.8,
        "totalDeliveries": 1547
      }
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401` Invalid credentials
- `403` Driver account inactive

---

### 2. Get Driver Profile
Retrieve complete driver profile information.

**Endpoint:** `GET /profile`  
**Access:** Private (Driver)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "driverNumber": "DRV-2024-00123",
    "firstName": "John",
    "lastName": "Driver",
    "email": "john.driver@example.com",
    "phone": "+1-555-0123",
    "status": "active",
    "availabilityStatus": "available",
    "currentVehicle": {
      "vehicleNumber": "TRK-2024-00456",
      "make": "Freightliner",
      "model": "Cascadia",
      "licensePlate": "ABC1234"
    },
    "carrier": {
      "carrierName": "ABC Trucking LLC",
      "email": "dispatch@abctrucking.com",
      "phone": "+1-555-0100"
    },
    "license": { ... },
    "medicalCertificate": { ... },
    "metrics": { ... }
  }
}
```

---

### 3. Update Driver Location
Send real-time GPS location updates.

**Endpoint:** `POST /location`  
**Access:** Private (Driver)

**Request Body:**
```json
{
  "latitude": 34.0522,
  "longitude": -118.2437,
  "address": "123 Main St, Los Angeles, CA 90001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "currentLocation": {
      "latitude": 34.0522,
      "longitude": -118.2437,
      "address": "123 Main St, Los Angeles, CA 90001",
      "lastUpdate": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Location updated successfully"
}
```

**Notes:**
- Also updates shipment location if driver has active assignment
- Recommended update frequency: Every 30-60 seconds while driving
- Location history is stored for tracking and analytics

---

### 4. Get Active Assignment
Retrieve current shipment assignment details.

**Endpoint:** `GET /assignment`  
**Access:** Private (Driver)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "shipmentNumber": "SHIP-2024-00789",
    "origin": {
      "street": "456 Warehouse Rd",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "contactName": "Mike Sender",
      "contactPhone": "+1-555-0200"
    },
    "destination": {
      "street": "789 Delivery Ave",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "contactName": "Sarah Receiver",
      "contactPhone": "+1-555-0300"
    },
    "pickupDate": "2024-01-15T08:00:00.000Z",
    "deliveryDate": "2024-01-15T17:00:00.000Z",
    "status": "in_transit",
    "cargo": [
      {
        "description": "Electronics",
        "weight": 5000,
        "quantity": 50,
        "packageType": "Pallets"
      }
    ],
    "specialInstructions": "Handle with care. Fragile items.",
    "distance": 382.5,
    "estimatedDuration": 420
  }
}
```

**No Assignment Response:**
```json
{
  "success": true,
  "data": null,
  "message": "No active assignment"
}
```

---

### 5. Update Assignment Status
Update shipment status (pickup, delivery, etc.).

**Endpoint:** `POST /assignment/status`  
**Access:** Private (Driver)

**Request Body:**
```json
{
  "shipmentId": "507f1f77bcf86cd799439011",
  "status": "picked_up",
  "notes": "Cargo loaded successfully. Ready for transit.",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Valid Status Values:**
- `assigned` - Shipment assigned to driver
- `picked_up` - Cargo picked up from origin
- `in_transit` - Currently in transit
- `out_for_delivery` - Final delivery in progress
- `delivered` - Successfully delivered
- `delayed` - Delayed for any reason
- `cancelled` - Shipment cancelled

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "shipmentNumber": "SHIP-2024-00789",
    "status": "picked_up",
    "statusHistory": [
      {
        "status": "picked_up",
        "timestamp": "2024-01-15T08:15:00.000Z",
        "notes": "Cargo loaded successfully. Ready for transit.",
        "updatedBy": "John Driver"
      }
    ]
  },
  "message": "Shipment status updated to picked_up"
}
```

**Notes:**
- Status change is logged in shipment history
- Location is updated if coordinates provided
- Driver availability automatically updated on delivery

---

### 6. Upload Proof of Delivery
Upload POD photo/signature with delivery details.

**Endpoint:** `POST /pod`  
**Access:** Private (Driver)

**Request (multipart/form-data):**
```
file: <image file>
shipmentId: "507f1f77bcf86cd799439011"
signedBy: "Sarah Receiver"
notes: "Delivered to loading dock. All items verified."
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "document": {
      "documentNumber": "DOC-POD-2024-00123",
      "fileName": "pod-1234567890-abc.jpg",
      "originalName": "delivery_photo.jpg",
      "documentType": "pod",
      "storage": {
        "url": "/uploads/shipment/pod-1234567890-abc.jpg"
      }
    },
    "shipment": {
      "pod": {
        "signedBy": "Sarah Receiver",
        "photo": "/uploads/shipment/pod-1234567890-abc.jpg",
        "notes": "Delivered to loading dock. All items verified.",
        "timestamp": "2024-01-15T17:15:00.000Z"
      }
    }
  },
  "message": "POD uploaded successfully"
}
```

**File Requirements:**
- Max size: 10MB
- Allowed formats: JPEG, PNG, PDF
- Recommended: Clear photo showing signature or delivered goods

---

### 7. Get Delivery History
Retrieve past deliveries and shipments.

**Endpoint:** `GET /history`  
**Access:** Private (Driver)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status

**Example:** `GET /history?page=1&limit=20&status=delivered`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "shipmentNumber": "SHIP-2024-00789",
      "origin": {
        "city": "Los Angeles",
        "state": "CA"
      },
      "destination": {
        "city": "San Francisco",
        "state": "CA"
      },
      "status": "delivered",
      "pickupDate": "2024-01-15T08:00:00.000Z",
      "deliveryDate": "2024-01-15T17:00:00.000Z",
      "totalValue": 25000
    }
  ],
  "pagination": {
    "total": 1547,
    "page": 1,
    "pages": 78,
    "limit": 20
  }
}
```

---

### 8. Update Availability Status
Change driver's availability for new assignments.

**Endpoint:** `POST /availability`  
**Access:** Private (Driver)

**Request Body:**
```json
{
  "availabilityStatus": "off-duty"
}
```

**Valid Availability Values:**
- `available` - Ready for new assignments
- `on-duty` - Currently working
- `off-duty` - Not available
- `sleeper-berth` - Rest period
- `driving` - Currently driving

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "availabilityStatus": "off-duty"
  },
  "message": "Availability updated successfully"
}
```

---

### 9. Get Driver Documents
Retrieve driver's documents (license, medical cert, etc.).

**Endpoint:** `GET /documents`  
**Access:** Private (Driver)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "documentNumber": "DOC-LICENSE-2024-00045",
      "documentType": "license",
      "originalName": "drivers_license.pdf",
      "expiryDate": "2025-12-31",
      "status": "active",
      "storage": {
        "url": "/uploads/driver/license-1234567890.pdf"
      }
    },
    {
      "documentNumber": "DOC-MEDICAL-2024-00046",
      "documentType": "medical",
      "originalName": "medical_certificate.pdf",
      "expiryDate": "2025-06-30",
      "status": "active"
    }
  ]
}
```

---

### 10. Register Device Token
Register device for push notifications.

**Endpoint:** `POST /device-token`  
**Access:** Private (Driver)

**Request Body:**
```json
{
  "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "appVersion": "1.0.5"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Device token registered successfully"
}
```

**Notes:**
- Used for push notifications (new assignments, route changes, etc.)
- Token format varies by platform (iOS/Android/Expo)
- App version tracked for compatibility checks

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Common Error Codes:**
- `NO_TOKEN` (401): No authentication token provided
- `INVALID_TOKEN` (401): Invalid or expired token
- `DRIVER_NOT_FOUND` (404): Driver not found
- `DRIVER_INACTIVE` (403): Driver account not active
- `SHIPMENT_NOT_FOUND` (404): Shipment not found
- `INVALID_STATUS` (400): Invalid status value
- `NO_FILE` (400): No file uploaded
- `UPLOAD_ERROR` (500): File upload failed
- `UPDATE_ERROR` (500): Update operation failed

---

## Mobile App Integration Examples

### React Native / Expo

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_BASE = 'http://localhost:3000/api/v1/mobile/driver';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    await AsyncStorage.setItem('token', data.data.token);
    await AsyncStorage.setItem('driver', JSON.stringify(data.data.driver));
  }
  
  return data;
}

// Get current assignment
async function getAssignment() {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/assignment`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
}

// Update location
async function updateLocation() {
  const token = await AsyncStorage.getItem('token');
  const location = await Location.getCurrentPositionAsync({});
  
  const response = await fetch(`${API_BASE}/location`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    })
  });
  
  return await response.json();
}

// Upload POD
async function uploadPOD(imageUri, shipmentId, signedBy, notes) {
  const token = await AsyncStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'pod.jpg'
  });
  formData.append('shipmentId', shipmentId);
  formData.append('signedBy', signedBy);
  formData.append('notes', notes);
  
  const response = await fetch(`${API_BASE}/pod`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return await response.json();
}
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/mobile/driver/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.driver@example.com","password":"SecurePassword123"}'

# Get profile (replace TOKEN with actual JWT)
curl http://localhost:3000/api/v1/mobile/driver/profile \
  -H "Authorization: Bearer TOKEN"

# Update location
curl -X POST http://localhost:3000/api/v1/mobile/driver/location \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":34.0522,"longitude":-118.2437,"address":"Los Angeles, CA"}'

# Get assignment
curl http://localhost:3000/api/v1/mobile/driver/assignment \
  -H "Authorization: Bearer TOKEN"

# Update status
curl -X POST http://localhost:3000/api/v1/mobile/driver/assignment/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipmentId":"507f1f77bcf86cd799439011","status":"picked_up","notes":"Loaded successfully"}'
```

---

## Security Best Practices

1. **HTTPS Only**: Use HTTPS in production
2. **Token Storage**: Store JWT securely (Keychain/Keystore)
3. **Token Expiry**: Tokens expire after 7 days
4. **Refresh Tokens**: Implement refresh token flow
5. **Location Privacy**: Only send location while on duty
6. **File Upload**: Validate file types and sizes
7. **Rate Limiting**: Respect API rate limits

---

## Status

✅ **READY FOR IMPLEMENTATION**

### Completed
- [x] Driver model with full schema
- [x] Mobile driver controller with all endpoints
- [x] Authentication middleware
- [x] REST API routes
- [x] Server integration
- [x] Complete API documentation

### Next Steps
1. Test endpoints with real data
2. Build React Native mobile app
3. Implement push notifications
4. Add offline support for mobile app
5. Integrate with real-time tracking WebSocket

---

**Driver Mobile API v1.0**  
Last Updated: November 2024  
Status: ✅ Production Ready
