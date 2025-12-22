/**
 * TMS Demo Data Seed Script
 * Populates MongoDB with realistic demo data for Tuesday presentation
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Shipment = require('./src/models/Shipment');
const Carrier = require('./src/models/Carrier');
const Driver = require('./src/models/tms/Driver');
const RouteOptimization = require('./src/models/tms/RouteOptimization');

// Demo company name
const DEMO_COMPANY = 'ABC Logistics';

// Indian cities for realistic routes
const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 }
];

async function seedTMSData() {
  try {
    console.log('🌱 Starting TMS demo data seeding...\n');

    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pixel_logistics_tms';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Shipment.deleteMany({});
    await Carrier.deleteMany({});
    await Driver.deleteMany({});
    await RouteOptimization.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // 1. Create Carriers
    console.log('📦 Creating carriers...');
    const carriers = await createCarriers();
    console.log(`✅ Created ${carriers.length} carriers\n`);

    // 2. Create Drivers
    console.log('👨‍✈️ Creating drivers...');
    const drivers = await createDrivers();
    console.log(`✅ Created ${drivers.length} drivers\n`);

    // 3. Create Shipments
    console.log('🚚 Creating shipments...');
    const shipments = await createShipments(carriers, drivers);
    console.log(`✅ Created ${shipments.length} shipments\n`);

    // 4. Create Routes
    console.log('🗺️  Creating routes...');
    const routes = await createRoutes();
    console.log(`✅ Created ${routes.length} routes\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TMS DEMO DATA SEEDING COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   Carriers: ${carriers.length}`);
    console.log(`   Drivers: ${drivers.length}`);
    console.log(`   Shipments: ${shipments.length}`);
    console.log(`   Routes: ${routes.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Create carriers
async function createCarriers() {
  const carrierData = [
    {
      name: 'Express Transport India',
      dotNumber: 'DOT12345',
      mcNumber: 'MC678910',
      contact: {
        email: 'contact@expresstransport.in',
        phone: '+91-9876543210',
        website: 'www.expresstransport.in'
      },
      address: {
        street: '123 Transport Nagar',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      status: 'active',
      rating: 4.8,
      onTimePercentage: 94.5,
      services: {
        types: ['FTL', 'LTL', 'Express'],
        regions: ['Western India', 'Northern India']
      }
    },
    {
      name: 'Swift Logistics Solutions',
      dotNumber: 'DOT23456',
      mcNumber: 'MC789011',
      contact: {
        email: 'info@swiftlogistics.in',
        phone: '+91-9876543211',
        website: 'www.swiftlogistics.in'
      },
      address: {
        street: '456 Logistics Hub',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      },
      status: 'active',
      rating: 4.6,
      onTimePercentage: 92.0,
      services: {
        types: ['FTL', 'Parcel', 'Intermodal'],
        regions: ['Northern India', 'Eastern India']
      }
    },
    {
      name: 'Southern Express Carriers',
      dotNumber: 'DOT34567',
      mcNumber: 'MC890112',
      contact: {
        email: 'support@southernexpress.in',
        phone: '+91-9876543212',
        website: 'www.southernexpress.in'
      },
      address: {
        street: '789 Freight Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      },
      status: 'active',
      rating: 4.7,
      onTimePercentage: 93.2,
      services: {
        types: ['FTL', 'LTL', 'Express'],
        regions: ['Southern India']
      }
    },
    {
      name: 'Pan India Freight Services',
      dotNumber: 'DOT45678',
      mcNumber: 'MC901213',
      contact: {
        email: 'contact@panindiafreight.in',
        phone: '+91-9876543213',
        website: 'www.panindiafreight.in'
      },
      address: {
        street: '321 Cargo Street',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        country: 'India'
      },
      status: 'active',
      rating: 4.5,
      onTimePercentage: 91.0,
      services: {
        types: ['FTL', 'LTL'],
        regions: ['Pan India']
      }
    },
    {
      name: 'Gujarat Transport Co.',
      dotNumber: 'DOT56789',
      mcNumber: 'MC012314',
      contact: {
        email: 'info@gujarattransport.in',
        phone: '+91-9876543214',
        website: 'www.gujarattransport.in'
      },
      address: {
        street: '654 Industrial Area',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        country: 'India'
      },
      status: 'active',
      rating: 4.4,
      onTimePercentage: 89.5,
      services: {
        types: ['FTL', 'LTL', 'Parcel'],
        regions: ['Western India']
      }
    }
  ];

  const carriers = await Carrier.insertMany(carrierData);
  return carriers;
}

// Create drivers
async function createDrivers() {
  const driverData = [
    {
      name: 'Rajesh Kumar',
      phone: '+91-9876501001',
      email: 'rajesh.kumar@driver.in',
      licenseNumber: 'DL-001234567',
      licenseExpiry: new Date('2026-12-31'),
      status: 'available',
      rating: 4.8
    },
    {
      name: 'Amit Sharma',
      phone: '+91-9876501002',
      email: 'amit.sharma@driver.in',
      licenseNumber: 'DL-002345678',
      licenseExpiry: new Date('2027-06-30'),
      status: 'on-trip',
      rating: 4.7
    },
    {
      name: 'Suresh Patel',
      phone: '+91-9876501003',
      email: 'suresh.patel@driver.in',
      licenseNumber: 'DL-003456789',
      licenseExpiry: new Date('2026-09-30'),
      status: 'available',
      rating: 4.9
    },
    {
      name: 'Vijay Singh',
      phone: '+91-9876501004',
      email: 'vijay.singh@driver.in',
      licenseNumber: 'DL-004567890',
      licenseExpiry: new Date('2027-03-31'),
      status: 'on-trip',
      rating: 4.6
    },
    {
      name: 'Mohammed Ali',
      phone: '+91-9876501005',
      email: 'mohammed.ali@driver.in',
      licenseNumber: 'DL-005678901',
      licenseExpiry: new Date('2026-11-30'),
      status: 'available',
      rating: 4.8
    }
  ];

  const drivers = await Driver.insertMany(driverData);
  return drivers;
}

// Create shipments
async function createShipments(carriers, drivers) {
  const statuses = ['Pending', 'Scheduled', 'In Transit', 'Out for Delivery', 'Delivered'];
  const priorities = ['Low', 'Normal', 'High', 'Urgent'];
  const shipmentTypes = ['FTL', 'LTL', 'Parcel', 'Express'];

  const shipments = [];

  // Create 50 shipments
  for (let i = 0; i < 50; i++) {
    const origin = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    let destination = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    while (destination.name === origin.name) {
      destination = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    }

    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const shipmentType = shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)];

    const pickupDate = new Date(Date.now() + (Math.random() - 0.5) * 10 * 24 * 60 * 60 * 1000);
    const estimatedDeliveryDate = new Date(pickupDate.getTime() + (Math.random() * 5 + 2) * 24 * 60 * 60 * 1000);

    const shipment = {
      wmsOrderId: `WMS-ORD-${1000 + i}`,
      wmsOrderNumber: `SO-2025-${1000 + i}`,
      customerName: `${DEMO_COMPANY} - Customer ${i + 1}`,
      customerContact: `+91-98765${10000 + i}`,
      customerEmail: `customer${i + 1}@abclogistics.com`,
      origin: {
        name: `${origin.name} Warehouse`,
        address: `${i + 100} Warehouse Complex`,
        city: origin.name,
        state: origin.state,
        zipCode: `${400000 + i}`,
        country: 'India',
        latitude: origin.lat,
        longitude: origin.lng,
        contactName: 'Warehouse Manager',
        contactPhone: '+91-9876543210'
      },
      destination: {
        name: `${destination.name} Distribution Center`,
        address: `${i + 200} Delivery Street`,
        city: destination.name,
        state: destination.state,
        zipCode: `${500000 + i}`,
        country: 'India',
        latitude: destination.lat,
        longitude: destination.lng,
        contactName: `Receiver ${i + 1}`,
        contactPhone: `+91-98765${20000 + i}`
      },
      cargo: [
        {
          description: `Electronics - SKU-${1000 + i}`,
          quantity: Math.floor(Math.random() * 50) + 10,
          weight: { value: Math.floor(Math.random() * 500) + 100, unit: 'kg' },
          dimensions: { length: 120, width: 80, height: 100, unit: 'cm' },
          value: { amount: Math.floor(Math.random() * 500000) + 50000, currency: 'INR' },
          fragile: Math.random() > 0.5
        }
      ],
      totalWeight: { value: Math.floor(Math.random() * 1000) + 200, unit: 'kg' },
      totalValue: { amount: Math.floor(Math.random() * 1000000) + 100000, currency: 'INR' },
      pickupDate,
      estimatedDeliveryDate,
      priority,
      shipmentType,
      mode: 'Road',
      status,
      carrier: carrier._id,
      carrierName: carrier.name,
      driver: status === 'In Transit' || status === 'Out for Delivery' ? driver._id : undefined,
      driverName: status === 'In Transit' || status === 'Out for Delivery' ? driver.name : undefined,
      driverPhone: status === 'In Transit' || status === 'Out for Delivery' ? driver.phone : undefined,
      vehiclePlate: `MH-${Math.floor(Math.random() * 50) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000) + 1000}`,
      actualPickupDate: status !== 'Pending' && status !== 'Scheduled' ? pickupDate : undefined,
      actualDeliveryDate: status === 'Delivered' ? estimatedDeliveryDate : undefined,
      specialInstructions: Math.random() > 0.5 ? 'Handle with care - fragile items' : undefined,
      cost: {
        baseRate: Math.floor(Math.random() * 50000) + 10000,
        fuelSurcharge: Math.floor(Math.random() * 5000) + 1000,
        tolls: Math.floor(Math.random() * 2000) + 500,
        accessorials: Math.floor(Math.random() * 3000),
        total: 0,
        currency: 'INR'
      },
      trackingUpdates: generateTrackingUpdates(status, origin, destination),
      externalSystems: {
        wms: {
          orderId: `WMS-ORD-${1000 + i}`,
          orderNumber: `SO-2025-${1000 + i}`,
          syncStatus: 'synced',
          lastSyncAt: new Date()
        }
      }
    };

    // Calculate total cost
    shipment.cost.total = 
      shipment.cost.baseRate + 
      shipment.cost.fuelSurcharge + 
      shipment.cost.tolls + 
      shipment.cost.accessorials;

    shipments.push(shipment);
  }

  const createdShipments = await Shipment.insertMany(shipments);
  return createdShipments;
}

// Generate tracking updates based on status
function generateTrackingUpdates(status, origin, destination) {
  const updates = [];
  const now = new Date();

  updates.push({
    status: 'Shipment created',
    location: origin.name,
    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Shipment created from WMS order',
    updatedBy: 'System'
  });

  if (status !== 'Pending') {
    updates.push({
      status: 'Scheduled for pickup',
      location: origin.name,
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      notes: 'Carrier assigned and pickup scheduled',
      updatedBy: 'Dispatcher'
    });
  }

  if (status === 'In Transit' || status === 'Out for Delivery' || status === 'Delivered') {
    updates.push({
      status: 'Picked up',
      location: origin.name,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Shipment picked up from origin',
      updatedBy: 'Driver'
    });

    updates.push({
      status: 'In Transit',
      location: 'Highway checkpoint',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Shipment in transit',
      updatedBy: 'Driver'
    });
  }

  if (status === 'Out for Delivery' || status === 'Delivered') {
    updates.push({
      status: 'At destination hub',
      location: destination.name,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Arrived at destination hub',
      updatedBy: 'Hub Manager'
    });

    updates.push({
      status: 'Out for Delivery',
      location: destination.name,
      timestamp: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000),
      notes: 'Out for final delivery',
      updatedBy: 'Driver'
    });
  }

  if (status === 'Delivered') {
    updates.push({
      status: 'Delivered',
      location: destination.name,
      timestamp: now,
      notes: 'Shipment delivered successfully',
      updatedBy: 'Driver'
    });
  }

  return updates;
}

// Create routes
async function createRoutes() {
  const routes = [];

  for (let i = 0; i < 10; i++) {
    const origin = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const destination = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];

    routes.push({
      name: `${origin.name} to ${destination.name} Route`,
      status: 'active',
      origin: {
        name: origin.name,
        latitude: origin.lat,
        longitude: origin.lng
      },
      destination: {
        name: destination.name,
        latitude: destination.lat,
        longitude: destination.lng
      },
      distance: {
        miles: Math.floor(Math.random() * 500) + 100,
        kilometers: Math.floor(Math.random() * 800) + 160
      },
      estimatedDuration: {
        hours: Math.floor(Math.random() * 20) + 5,
        minutes: Math.floor(Math.random() * 60)
      }
    });
  }

  const createdRoutes = await RouteOptimization.insertMany(routes);
  return createdRoutes;
}

// Run the seed script
seedTMSData();
