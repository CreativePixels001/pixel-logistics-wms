# PTMS Development - Complete Implementation Plan

**System**: People Transport Management System (PTMS)  
**Date**: November 23, 2025  
**Status**: IN PROGRESS - Dashboard Created ✅

---

## 🎯 System Overview

PTMS is an **Employee Transportation Management System** designed for HR Managers to:
- Plan optimized routes for employee pickup/drop
- Allocate employees to vehicles
- Create daily trip manifestations
- Track vehicles in real-time
- Manage fleet, drivers, and vendors
- Ensure compliance and safety

**Target Users**: HR Managers, Transport Coordinators, Fleet Managers

---

## 📋 Pages Created

### ✅ 1. Dashboard (dashboard.html) - COMPLETE
**Purpose**: Real-time overview of transport operations

**Features**:
- 4 KPI Cards: Active Trips (32), Employees (2,847), On-Time % (94.8%), Cost (₹28.5L)
- Live trip tracking map (Google Maps placeholder)
- Today's schedule with 4 shifts
- Vehicle utilization chart
- Recent alerts (delays, check-ins, completions)
- Top routes performance table

**Tech Stack**:
- Purple gradient theme (matching TMS)
- Responsive cards and tables
- Real-time status indicators
- Chart.js ready for analytics

---

## 📦 Pages To Create (Priority Order)

### ⏳ 2. Route Planning (route-planning.html)
**Purpose**: Create and optimize employee transport routes

**Features Needed**:
- Interactive map for route visualization
- Drag-drop pickup points
- Employee assignment to routes
- AI route optimization button
- Distance/time calculation
- Multi-shift support (Morning, Evening, Night)
- Route templates library
- Cost estimation per route

**Oracle Integration**: Oracle Spatial for route optimization

**UI Components**:
- Map canvas (Google Maps)
- Left panel: Pickup points list
- Right panel: Assigned employees
- Bottom panel: Route statistics

---

### ⏳ 3. Employee Roster (employee-roster.html)
**Purpose**: Manage employee transport bookings

**Features Needed**:
- Employee list with search/filter
- Department-wise grouping
- Shift-wise categorization
- Pickup/drop location management
- Bulk upload (CSV/Excel)
- Transport subscription status
- Emergency contact details
- Route assignment

**Data Fields**:
```javascript
{
  employeeId: "EMP001",
  name: "Rajesh Kumar",
  department: "Engineering",
  shift: "Morning (9 AM - 6 PM)",
  pickupPoint: "Marathahalli Junction",
  dropPoint: "Tech Park 1",
  phoneNumber: "+91 98765 43210",
  emergencyContact: "+91 98765 43211",
  routeAssigned: "Route TP1-M",
  subscriptionStatus: "Active"
}
```

**Actions**:
- Add/Edit/Delete employees
- Assign to routes
- Temporary route change
- Leave marking (skip pickup)

---

### ⏳ 4. Trip Manifest (trip-manifest.html)
**Purpose**: Create daily trip sheets for drivers

**Features Needed**:
- Date and shift selector
- Route selection dropdown
- Vehicle/driver assignment
- Employee checklist
- Pickup sequence
- Print manifest sheet
- Send to driver's mobile app
- Trip status tracking

**Manifest Document**:
```
TRIP MANIFEST #TM-2025-1123-001
Date: November 23, 2025
Shift: Morning (7:00 AM - 9:30 AM)
Route: Tech Park 1 - Morning
Vehicle: Bus MH-12-AB-1234 (45 seater)
Driver: Rajesh Kumar (DL: MH1234567890)

PICKUP SCHEDULE:
1. 07:00 AM - Marathahalli Junction (12 employees)
2. 07:15 AM - Sarjapur Road (8 employees)
3. 07:30 AM - HSR Layout (15 employees)
...

DROP POINT:
09:30 AM - Tech Park 1 Main Gate

Total: 45 employees
Estimated Distance: 24.5 km
Estimated Time: 1hr 30mins
```

---

### ⏳ 5. Live Tracking (live-tracking.html)
**Purpose**: Real-time vehicle tracking and monitoring

**Features Needed**:
- Full-screen Google Maps
- Vehicle markers with status colors
- Route polyline overlay
- Live ETA calculation
- Speed monitoring
- Geofence alerts
- Employee pickup status
- Driver communication panel
- SOS alert button
- Trip playback (history)

**Vehicle Status Colors**:
- 🟢 Green: On schedule
- 🟡 Yellow: Minor delay (< 10 mins)
- 🔴 Red: Major delay (> 10 mins)
- 🔵 Blue: Completed
- ⚫ Black: Inactive

**Real-time Updates**: WebSocket or polling every 30 seconds

---

### ⏳ 6. Vehicle Management (vehicle-management.html)
**Purpose**: Fleet management

**Features Needed**:
- Vehicle list with details
- Registration, insurance, fitness tracking
- Maintenance schedule
- Fuel consumption logs
- GPS device status
- Vehicle photos
- Capacity management
- Vendor assignment
- Service history

**Vehicle Types**:
- 🚌 Bus (45-seater, 52-seater)
- 🚐 Mini Bus (17-seater, 25-seater)
- 🚗 Sedan (4-seater)
- 🚙 SUV (7-seater)

**Documents Tracking**:
- Registration Certificate (RC)
- Insurance Policy
- Fitness Certificate
- Pollution Certificate
- Permit
- Tax

---

### ⏳ 7. Driver Management (driver-management.html)
**Purpose**: Driver profiles and scheduling

**Features Needed**:
- Driver list with photos
- License verification
- Contact details
- Shift assignments
- Performance ratings
- Attendance tracking
- Leave management
- Training records
- Background verification status

**Driver Data**:
```javascript
{
  driverId: "DRV001",
  name: "Rajesh Kumar",
  photo: "url",
  phoneNumber: "+91 98765 43210",
  licenseNumber: "MH1234567890",
  licenseExpiry: "2026-05-15",
  experienceYears: 8,
  rating: 4.8,
  shift: "Morning",
  vehicleAssigned: "MH-12-AB-1234",
  status: "Active"
}
```

---

### ⏳ 8. Vendor Management (vendors.html)
**Purpose**: Manage cab service providers

**Features Needed**:
- Vendor list (Ola Corporate, Uber Business, Local vendors)
- Contract details
- Rate cards
- Performance metrics
- Invoice management
- Vehicle allocation per vendor
- SLA tracking
- Payment terms

**Vendor Types**:
- Own Fleet
- Contracted Vendors
- On-Demand Services

---

### ⏳ 9. Reports & Analytics (reports.html)
**Purpose**: Business intelligence and reporting

**Reports Needed**:
1. **Utilization Report**
   - Vehicle occupancy trends
   - Route-wise employee distribution
   - Peak hour analysis

2. **Cost Analysis**
   - Cost per trip
   - Cost per employee
   - Vendor-wise expenses
   - Fuel consumption

3. **Performance Report**
   - On-time performance
   - Driver ratings
   - Delay analysis
   - Route efficiency

4. **Compliance Report**
   - Vehicle document expiry
   - Driver license expiry
   - Insurance renewals
   - Safety incidents

5. **Employee Report**
   - Active subscriptions
   - Department-wise breakdown
   - Attendance tracking

**Export Formats**: PDF, Excel, CSV

---

### ⏳ 10. Compliance & Safety (compliance.html)
**Purpose**: Safety management and regulatory compliance

**Features Needed**:
- Document expiry alerts
- Safety checklist
- Incident reporting
- Emergency contact list
- SOS alert history
- First aid kit tracking
- Fire extinguisher checks
- CCTV footage access
- Driver background verification
- Insurance claims

**Compliance Checklist**:
- ✅ All vehicles have valid insurance
- ✅ Drivers have valid licenses
- ✅ GPS devices functioning
- ✅ First aid kits available
- ✅ Fire extinguishers checked
- ✅ Emergency exits marked
- ✅ Speed governors installed
- ✅ CCTV cameras working

---

## 🗄️ Backend API Structure

### Collections/Tables Needed:

**1. Employees**
```javascript
{
  employeeId, name, email, phone,
  department, designation, shift,
  pickupPoint: {location, address, coordinates},
  dropPoint: {location, address, coordinates},
  emergencyContact: {name, phone, relationship},
  subscriptionStatus, routeAssigned
}
```

**2. Routes**
```javascript
{
  routeId, routeName, zone, shift,
  pickupPoints: [{sequence, location, time, employees[]}],
  dropPoint: {location, time},
  distance, estimatedDuration,
  vehiclesAssigned: [],
  status
}
```

**3. Vehicles**
```javascript
{
  vehicleId, registrationNumber, type, capacity,
  vendor, make, model, year,
  gpsDevice: {deviceId, status},
  documents: {rc, insurance, fitness, pollution, permit},
  maintenanceSchedule: [],
  status
}
```

**4. Drivers**
```javascript
{
  driverId, name, phone, email,
  licenseNumber, licenseExpiry,
  photo, address, emergencyContact,
  shift, vehicleAssigned,
  rating, experienceYears,
  backgroundVerified, status
}
```

**5. TripManifests**
```javascript
{
  manifestId, date, shift,
  route: {routeId, routeName},
  vehicle: {vehicleId, registrationNumber},
  driver: {driverId, name},
  employees: [{empId, pickupPoint, pickupTime, status}],
  startTime, endTime,
  actualDistance, actualDuration,
  status
}
```

**6. LiveTrips**
```javascript
{
  tripId, manifestId,
  currentLocation: {lat, lng, timestamp},
  speed, heading,
  nextPickupPoint, eta,
  employeesBoarded: [],
  employeesPending: [],
  delays: [],
  alerts: [],
  status
}
```

**7. Vendors**
```javascript
{
  vendorId, name, contactPerson, phone, email,
  contractStartDate, contractEndDate,
  rateCard: {perKm, perHour, monthly},
  vehiclesProvided: [],
  performanceMetrics: {onTime%, rating},
  status
}
```

---

## 🔗 API Endpoints Required

### Employee Management
```
GET    /api/v1/ptms/employees
POST   /api/v1/ptms/employees
GET    /api/v1/ptms/employees/:id
PUT    /api/v1/ptms/employees/:id
DELETE /api/v1/ptms/employees/:id
GET    /api/v1/ptms/employees/by-department/:dept
GET    /api/v1/ptms/employees/by-shift/:shift
POST   /api/v1/ptms/employees/bulk-upload
```

### Route Management
```
GET    /api/v1/ptms/routes
POST   /api/v1/ptms/routes
GET    /api/v1/ptms/routes/:id
PUT    /api/v1/ptms/routes/:id
DELETE /api/v1/ptms/routes/:id
POST   /api/v1/ptms/routes/optimize
GET    /api/v1/ptms/routes/by-shift/:shift
```

### Trip Management
```
GET    /api/v1/ptms/manifests
POST   /api/v1/ptms/manifests
GET    /api/v1/ptms/manifests/:id
PUT    /api/v1/ptms/manifests/:id
GET    /api/v1/ptms/manifests/by-date/:date
POST   /api/v1/ptms/manifests/:id/print
POST   /api/v1/ptms/manifests/:id/send-to-driver
```

### Live Tracking
```
GET    /api/v1/ptms/trips/live
GET    /api/v1/ptms/trips/:id/location
POST   /api/v1/ptms/trips/:id/update-location
GET    /api/v1/ptms/trips/:id/eta
POST   /api/v1/ptms/trips/:id/employee-boarded
POST   /api/v1/ptms/trips/:id/alert
```

### Vehicle Management
```
GET    /api/v1/ptms/vehicles
POST   /api/v1/ptms/vehicles
GET    /api/v1/ptms/vehicles/:id
PUT    /api/v1/ptms/vehicles/:id
DELETE /api/v1/ptms/vehicles/:id
GET    /api/v1/ptms/vehicles/available
GET    /api/v1/ptms/vehicles/maintenance-due
```

### Driver Management
```
GET    /api/v1/ptms/drivers
POST   /api/v1/ptms/drivers
GET    /api/v1/ptms/drivers/:id
PUT    /api/v1/ptms/drivers/:id
GET    /api/v1/ptms/drivers/available
GET    /api/v1/ptms/drivers/by-shift/:shift
```

### Vendor Management
```
GET    /api/v1/ptms/vendors
POST   /api/v1/ptms/vendors
GET    /api/v1/ptms/vendors/:id
PUT    /api/v1/ptms/vendors/:id
GET    /api/v1/ptms/vendors/:id/vehicles
```

### Reports
```
GET    /api/v1/ptms/reports/utilization
GET    /api/v1/ptms/reports/cost-analysis
GET    /api/v1/ptms/reports/performance
GET    /api/v1/ptms/reports/compliance
GET    /api/v1/ptms/reports/employee-attendance
POST   /api/v1/ptms/reports/export
```

---

## 🎨 Design System

**Colors** (Matching TMS):
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

**Typography**:
- Font: Inter, system-ui
- Headings: 600-700 weight
- Body: 400 weight

**Components**:
- Cards with subtle shadows
- Purple gradient buttons
- Hover effects with transitions
- Status badges with colors
- Progress bars
- Data tables with sorting
- Modal dialogs
- Side panels

---

## 📱 Mobile App Features (Future)

### Driver App
- Login with verification
- View today's manifest
- Start trip
- Navigate to pickup points
- Mark employee boarded
- Report delays/issues
- SOS button
- End trip with odometer reading

### Employee App
- View assigned route
- Track vehicle location
- Get ETA notifications
- Report absence
- Emergency contact
- Feedback/rating
- Trip history

---

## 🚀 Implementation Timeline

### Week 1: Frontend Pages (Nov 23-29)
- ✅ Day 1: Dashboard complete
- Day 2: Route Planning + Employee Roster
- Day 3: Trip Manifest + Live Tracking
- Day 4: Vehicle + Driver Management
- Day 5: Vendors + Reports
- Day 6: Compliance + Polish
- Day 7: Testing and bug fixes

### Week 2: Backend API (Nov 30 - Dec 6)
- Day 1: Employee & Route APIs
- Day 2: Trip & Manifest APIs
- Day 3: Live Tracking API (WebSocket)
- Day 4: Vehicle & Driver APIs
- Day 5: Vendor & Reports APIs
- Day 6: Integration testing
- Day 7: Performance optimization

### Week 3: Integration & Demo (Dec 7-13)
- Day 1-3: Frontend-Backend integration
- Day 4-5: Google Maps integration
- Day 6: Mahindra demo data creation
- Day 7: Client presentation ready

---

## 🎯 Mahindra Logistics Demo Scenario

**Context**: Mahindra has 50,000+ employees across India needing transport

**Demo Data**:
- 15 office locations (matching WMS warehouses)
- 2,847 employees (sample)
- 45 vehicles (buses + cabs)
- 32 active routes
- 3 shifts (Morning, Evening, Night)
- 5 cab vendors

**Demo Flow**:
1. **Dashboard**: Show live stats for Bangalore office
2. **Route Planning**: Create new route for Tech Park
3. **Employee Roster**: Assign 50 employees to route
4. **Manifest**: Generate morning shift manifest
5. **Live Tracking**: Show 32 vehicles moving in real-time
6. **Reports**: Cost analysis showing ₹28.5L monthly expense

**Key Selling Points**:
- AI route optimization (20% fuel savings)
- Real-time safety tracking
- Employee satisfaction (96% on-time)
- Compliance automation
- Vendor performance tracking
- Cost reduction (15% vs current solution)

---

## ✅ Next Immediate Steps

1. **Create Route Planning page** with map interface
2. **Create Employee Roster page** with 2,847 sample employees
3. **Create Trip Manifest page** with print functionality
4. **Create Live Tracking page** with Google Maps
5. **Build backend API structure** (models + routes)
6. **Create seed script** with Mahindra data
7. **Integrate Google Maps API**
8. **Test complete workflow**

---

## 📞 Support & Resources

- Oracle Transportation Intelligence docs
- Google Maps JavaScript API
- Chart.js for analytics
- WebSocket for real-time updates
- Node.js + Express backend
- MongoDB for data storage

---

**Status**: Dashboard ✅ | 9 Pages Pending ⏳ | Backend Pending ⏳

**Next Session**: Create remaining 9 pages + Backend API
