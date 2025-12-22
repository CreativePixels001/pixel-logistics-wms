/* ===================================
   Database Seed Script
   Populates MongoDB with sample data
   =================================== */

require('dotenv').config();
const mongoose = require('mongoose');
const Shipment = require('./src/models/Shipment');
const Carrier = require('./src/models/Carrier');
const Route = require('./src/models/Route');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixel-logistics';

// Sample Carriers
const sampleCarriers = [
  {
    name: 'Swift Freight LLC',
    dotNumber: 'DOT-2847561',
    mcNumber: 'MC-931248',
    serviceTypes: ['ltl', 'ftl', 'expedited'],
    operatingRegions: ['national'],
    contact: {
      email: 'dispatch@swiftfreight.com',
      phone: '+1-800-555-0101',
      address: {
        street: '2450 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      }
    },
    insurance: {
      cargoInsurance: {
        provider: 'Progressive Commercial',
        policyNumber: 'PC-1001',
        coverage: 1000000,
        expirationDate: new Date('2026-12-31')
      },
      liabilityInsurance: {
        provider: 'State Farm Business',
        policyNumber: 'SF-2001',
        coverage: 5000000,
        expirationDate: new Date('2026-12-31')
      }
    },
    rating: 4.9,
    totalRatings: 1247,
    onTimePercentage: 98.5,
    totalShipments: 1247,
    completedShipments: 1228,
    safetyRating: 'satisfactory',
    isActive: true
  },
  {
    name: 'National Express',
    dotNumber: 'DOT-3192847',
    mcNumber: 'MC-842156',
    serviceTypes: ['ftl', 'refrigerated', 'hazmat'],
    operatingRegions: ['national', 'international'],
    contact: {
      email: 'ops@nationalexpress.com',
      phone: '+1-800-555-0202',
      address: {
        street: '1875 Logistics Way',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA'
      }
    },
    insurance: {
      cargoInsurance: {
        provider: 'Liberty Mutual',
        policyNumber: 'LM-3001',
        coverage: 1500000,
        expirationDate: new Date('2026-11-30')
      },
      liabilityInsurance: {
        provider: 'Travelers',
        policyNumber: 'TR-4001',
        coverage: 10000000,
        expirationDate: new Date('2026-11-30')
      }
    },
    rating: 4.8,
    totalRatings: 1089,
    onTimePercentage: 97.8,
    totalShipments: 1089,
    completedShipments: 1065,
    safetyRating: 'satisfactory',
    isActive: true
  },
  {
    name: 'Rapid Logistics',
    dotNumber: 'DOT-2756391',
    mcNumber: 'MC-715823',
    serviceTypes: ['expedited', 'ltl', 'parcel'],
    operatingRegions: ['regional', 'national'],
    contact: {
      email: 'support@rapidlogistics.com',
      phone: '+1-800-555-0303',
      address: {
        street: '3100 Commerce Dr',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30303',
        country: 'USA'
      }
    },
    insurance: {
      cargoInsurance: {
        provider: 'Nationwide',
        policyNumber: 'NW-5001',
        coverage: 750000,
        expirationDate: new Date('2026-08-15')
      },
      liabilityInsurance: {
        provider: 'Allstate Business',
        policyNumber: 'AS-6001',
        coverage: 3000000,
        expirationDate: new Date('2026-08-15')
      }
    },
    rating: 4.7,
    totalRatings: 892,
    onTimePercentage: 96.2,
    totalShipments: 892,
    completedShipments: 858,
    safetyRating: 'satisfactory',
    isActive: true
  },
  {
    name: 'QuickHaul Inc',
    dotNumber: 'DOT-3847562',
    mcNumber: 'MC-928374',
    serviceTypes: ['ltl', 'ftl', 'flatbed'],
    operatingRegions: ['national'],
    contact: {
      email: 'dispatch@quickhaul.com',
      phone: '+1-800-555-0404',
      address: {
        street: '4567 Transport Ave',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
        country: 'USA'
      }
    },
    insurance: {
      cargoInsurance: {
        provider: 'Farmers Insurance',
        policyNumber: 'FM-7001',
        coverage: 500000,
        expirationDate: new Date('2026-06-30')
      },
      liabilityInsurance: {
        provider: 'USAA',
        policyNumber: 'US-8001',
        coverage: 2000000,
        expirationDate: new Date('2026-06-30')
      }
    },
    rating: 4.6,
    totalRatings: 734,
    onTimePercentage: 95.5,
    totalShipments: 734,
    completedShipments: 701,
    safetyRating: 'satisfactory',
    isActive: true
  },
  {
    name: 'Metro Transport',
    dotNumber: 'DOT-2918374',
    mcNumber: 'MC-637291',
    serviceTypes: ['ltl', 'parcel'],
    operatingRegions: ['local', 'regional'],
    contact: {
      email: 'info@metrotransport.com',
      phone: '+1-800-555-0505',
      address: {
        street: '789 Metro Circle',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      }
    },
    insurance: {
      cargoInsurance: {
        provider: 'Hartford Business',
        policyNumber: 'HB-9001',
        coverage: 250000,
        expirationDate: new Date('2026-05-31')
      },
      liabilityInsurance: {
        provider: 'Chubb',
        policyNumber: 'CH-1001',
        coverage: 1000000,
        expirationDate: new Date('2026-05-31')
      }
    },
    rating: 4.5,
    totalRatings: 1456,
    onTimePercentage: 94.8,
    totalShipments: 1456,
    completedShipments: 1380,
    safetyRating: 'satisfactory',
    isActive: true
  }
];

// Sample locations for shipments
const sampleLocations = [
  { city: 'New York', state: 'NY', zip: '10001', coords: { lat: 40.7128, lng: -74.0060 } },
  { city: 'Los Angeles', state: 'CA', zip: '90001', coords: { lat: 34.0522, lng: -118.2437 } },
  { city: 'Chicago', state: 'IL', zip: '60601', coords: { lat: 41.8781, lng: -87.6298 } },
  { city: 'Houston', state: 'TX', zip: '77001', coords: { lat: 29.7604, lng: -95.3698 } },
  { city: 'Phoenix', state: 'AZ', zip: '85001', coords: { lat: 33.4484, lng: -112.0740 } },
  { city: 'Philadelphia', state: 'PA', zip: '19019', coords: { lat: 39.9526, lng: -75.1652 } },
  { city: 'San Antonio', state: 'TX', zip: '78201', coords: { lat: 29.4241, lng: -98.4936 } },
  { city: 'San Diego', state: 'CA', zip: '92101', coords: { lat: 32.7157, lng: -117.1611 } },
  { city: 'Dallas', state: 'TX', zip: '75201', coords: { lat: 32.7767, lng: -96.7970 } },
  { city: 'Miami', state: 'FL', zip: '33101', coords: { lat: 25.7617, lng: -80.1918 } },
  { city: 'Atlanta', state: 'GA', zip: '30303', coords: { lat: 33.7490, lng: -84.3880 } },
  { city: 'Denver', state: 'CO', zip: '80201', coords: { lat: 39.7392, lng: -104.9903 } },
  { city: 'Seattle', state: 'WA', zip: '98101', coords: { lat: 47.6062, lng: -122.3321 } },
  { city: 'Boston', state: 'MA', zip: '02101', coords: { lat: 42.3601, lng: -71.0589 } }
];

// Cargo types
const cargoTypes = [
  'Electronics', 'Furniture', 'Automotive Parts', 'Machinery', 'Consumer Goods',
  'Food & Beverage', 'Pharmaceuticals', 'Industrial Equipment', 'Textiles', 'Building Materials'
];

// Generate tracking number
function generateTrackingNumber(index) {
  const year = 2024;
  const number = (1800 + index).toString().padStart(4, '0');
  return `SH-${year}-${number}`;
}

// Generate random date in range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Create sample shipments
async function createSampleShipments(carriers) {
  const shipments = [];
  const statuses = ['pending', 'picked_up', 'in_transit', 'in_transit', 'delivered'];
  
  // Create a dummy user ID for createdBy field
  const dummyUserId = new mongoose.Types.ObjectId();
  
  for (let i = 0; i < 50; i++) {
    const origin = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    let destination = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    
    // Ensure origin and destination are different
    while (destination.city === origin.city) {
      destination = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    }
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    const pickupDate = randomDate(new Date('2024-11-01'), new Date('2024-11-20'));
    const scheduledDelivery = new Date(pickupDate.getTime() + (2 + Math.random() * 5) * 24 * 60 * 60 * 1000);
    const baseCost = Math.round(500 + Math.random() * 2000);
    const fuelSurcharge = Math.round(baseCost * 0.15);
    
    const shipment = {
      shipmentId: `SH-2024-${(1847 + i).toString().padStart(4, '0')}`,
      trackingNumber: generateTrackingNumber(i + 1847),
      origin: {
        address: `${1000 + i} Business St`,
        city: origin.city,
        state: origin.state,
        zipCode: origin.zip,
        country: 'USA',
        coordinates: {
          latitude: origin.coords.lat,
          longitude: origin.coords.lng
        }
      },
      destination: {
        address: `${2000 + i} Commerce Ave`,
        city: destination.city,
        state: destination.state,
        zipCode: destination.zip,
        country: 'USA',
        coordinates: {
          latitude: destination.coords.lat,
          longitude: destination.coords.lng
        }
      },
      carrier: carrier._id,
      carrierName: carrier.name,
      status: status,
      pickupDate: pickupDate,
      scheduledDeliveryDate: scheduledDelivery,
      estimatedDeliveryDate: scheduledDelivery,
      actualDeliveryDate: status === 'delivered' ? new Date(scheduledDelivery.getTime() - Math.random() * 12 * 60 * 60 * 1000) : null,
      freight: {
        type: ['ltl', 'ftl', 'parcel'][Math.floor(Math.random() * 3)],
        weight: {
          value: Math.round(500 + Math.random() * 15000),
          unit: 'lbs'
        },
        dimensions: {
          length: Math.round(40 + Math.random() * 100),
          width: Math.round(40 + Math.random() * 100),
          height: Math.round(40 + Math.random() * 100),
          unit: 'in'
        },
        quantity: Math.floor(1 + Math.random() * 10),
        description: cargoTypes[Math.floor(Math.random() * cargoTypes.length)],
        declaredValue: Math.round(5000 + Math.random() * 95000)
      },
      cost: {
        baseCost: baseCost,
        fuelSurcharge: fuelSurcharge,
        accessorialCharges: Math.round(Math.random() * 150),
        taxes: Math.round((baseCost + fuelSurcharge) * 0.08),
        totalCost: 0, // Will be calculated
        currency: 'USD'
      },
      progress: status === 'delivered' ? 100 : status === 'in_transit' ? Math.round(30 + Math.random() * 60) : status === 'picked_up' ? 10 : 0,
      priority: ['normal', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)],
      createdBy: dummyUserId,
      trackingEvents: []
    };
    
    // Calculate total cost
    shipment.cost.totalCost = shipment.cost.baseCost + shipment.cost.fuelSurcharge + shipment.cost.accessorialCharges + shipment.cost.taxes;
    
    // Add tracking events based on status
    if (status !== 'pending') {
      shipment.trackingEvents.push({
        timestamp: pickupDate,
        status: 'picked_up',
        location: {
          city: origin.city,
          state: origin.state,
          zipCode: origin.zip,
          coordinates: {
            latitude: origin.coords.lat,
            longitude: origin.coords.lng
          }
        },
        notes: 'Shipment picked up from origin'
      });
    }
    
    if (status === 'in_transit') {
      const transitTime = new Date().getTime() - pickupDate.getTime();
      const numEvents = Math.floor(transitTime / (12 * 60 * 60 * 1000)) + 1;
      
      for (let j = 0; j < Math.min(numEvents, 3); j++) {
        const eventTime = new Date(pickupDate.getTime() + (j + 1) * 12 * 60 * 60 * 1000);
        const randomLoc = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
        
        shipment.trackingEvents.push({
          timestamp: eventTime,
          status: 'in_transit',
          location: {
            city: randomLoc.city,
            state: randomLoc.state,
            zipCode: randomLoc.zip,
            coordinates: {
              latitude: randomLoc.coords.lat,
              longitude: randomLoc.coords.lng
            }
          },
          notes: 'In transit - arrived at distribution center'
        });
      }
    }
    
    if (status === 'delivered') {
      shipment.trackingEvents.push({
        timestamp: shipment.actualDeliveryDate,
        status: 'delivered',
        location: {
          city: destination.city,
          state: destination.state,
          zipCode: destination.zip,
          coordinates: {
            latitude: destination.coords.lat,
            longitude: destination.coords.lng
          }
        },
        notes: 'Delivered successfully'
      });
    }
    
    shipments.push(shipment);
  }
  
  return shipments;
}

// Create sample routes
async function createSampleRoutes(carriers) {
  const routes = [];
  
  for (let i = 0; i < 10; i++) {
    const origin = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    const destination = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    
    // Generate 2-4 waypoints between origin and destination
    const numWaypoints = 2 + Math.floor(Math.random() * 3);
    const waypoints = [
      // Origin waypoint
      {
        sequence: 0,
        type: 'origin',
        location: {
          address: `${4000 + i} Start Point`,
          city: origin.city,
          state: origin.state,
          zipCode: origin.zip,
          coordinates: {
            latitude: origin.coords.lat,
            longitude: origin.coords.lng
          }
        },
        estimatedArrival: new Date(Date.now()),
        status: 'departed'
      }
    ];
    
    // Add intermediate stops
    for (let j = 0; j < numWaypoints; j++) {
      const waypoint = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      waypoints.push({
        sequence: j + 1,
        type: j % 2 === 0 ? 'stop' : 'fuel',
        location: {
          address: `${3000 + j} Highway Stop`,
          city: waypoint.city,
          state: waypoint.state,
          zipCode: waypoint.zip,
          coordinates: {
            latitude: waypoint.coords.lat,
            longitude: waypoint.coords.lng
          }
        },
        estimatedArrival: new Date(Date.now() + (j + 1) * 8 * 60 * 60 * 1000),
        status: 'pending'
      });
    }
    
    // Destination waypoint
    waypoints.push({
      sequence: numWaypoints + 1,
      type: 'destination',
      location: {
        address: `${5000 + i} End Point`,
        city: destination.city,
        state: destination.state,
        zipCode: destination.zip,
        coordinates: {
          latitude: destination.coords.lat,
          longitude: destination.coords.lng
        }
      },
      estimatedArrival: new Date(Date.now() + (numWaypoints + 2) * 8 * 60 * 60 * 1000),
      status: 'pending'
    });
    
    const distance = Math.round(200 + Math.random() * 2000);
    const duration = Math.round(4 + Math.random() * 48);
    const fuelCost = Math.round(100 + Math.random() * 500);
    const tollsCost = Math.round(Math.random() * 100);
    
    const route = {
      routeId: `RT-2024-${(5001 + i).toString().padStart(4, '0')}`,
      name: `Route ${i + 1}: ${origin.city} to ${destination.city}`,
      waypoints: waypoints,
      carrier: carrier._id,
      totalDistance: {
        value: distance,
        unit: 'miles'
      },
      totalDuration: {
        value: duration,
        unit: 'hours'
      },
      scheduledStartTime: new Date(Date.now()),
      estimatedEndTime: new Date(Date.now() + duration * 60 * 60 * 1000),
      status: ['planned', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
      currentWaypointIndex: 0,
      progress: Math.round(Math.random() * 100),
      isOptimized: true,
      optimizationStrategy: ['shortest_distance', 'fastest_time', 'fuel_efficient'][Math.floor(Math.random() * 3)],
      cost: {
        fuelCost: fuelCost,
        tollsCost: tollsCost,
        laborCost: Math.round(duration * 25), // $25/hour
        totalCost: 0 // Will be calculated
      }
    };
    
    route.cost.totalCost = route.cost.fuelCost + route.cost.tollsCost + route.cost.laborCost;
    routes.push(route);
  }
  
  return routes;
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Shipment.deleteMany({});
    await Carrier.deleteMany({});
    await Route.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Create carriers
    console.log('📦 Creating carriers...');
    const carriers = await Carrier.insertMany(sampleCarriers);
    console.log(`✅ Created ${carriers.length} carriers\n`);
    
    // Create shipments
    console.log('🚛 Creating shipments...');
    const shipmentData = await createSampleShipments(carriers);
    const shipments = await Shipment.insertMany(shipmentData);
    console.log(`✅ Created ${shipments.length} shipments\n`);
    
    // Create routes
    console.log('🗺️  Creating routes...');
    const routeData = await createSampleRoutes(carriers);
    const routes = await Route.insertMany(routeData);
    console.log(`✅ Created ${routes.length} routes\n`);
    
    // Summary
    console.log('=' .repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Carriers:  ${carriers.length}`);
    console.log(`Shipments: ${shipments.length}`);
    console.log(`Routes:    ${routes.length}`);
    console.log('=' .repeat(50));
    console.log('\n✨ Database seeded successfully!\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
