/**
 * WMS Database Seed Script
 * Populates MongoDB with comprehensive sample data for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixel-logistics';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Define simplified schemas for seeding
const ProductSchema = new mongoose.Schema({
  sku: String,
  name: String,
  description: String,
  category: String,
  barcode: String,
  price: Number,
  cost: Number,
  weight: Number,
  dimensions: Object,
  reorderPoint: Number,
  reorderQuantity: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const InventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  warehouse: String,
  location: String,
  quantityOnHand: Number,
  quantityAllocated: Number,
  quantityAvailable: Number,
  lastUpdated: { type: Date, default: Date.now }
});

const WarehouseSchema = new mongoose.Schema({
  code: String,
  name: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  type: String,
  capacity: Number,
  status: String
});

const LocationSchema = new mongoose.Schema({
  locationCode: String,
  warehouse: String,
  zone: String,
  aisle: String,
  rack: String,
  level: String,
  bin: String,
  type: String,
  capacity: Number,
  status: String
});

// Create models
const Product = mongoose.model('Product', ProductSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);
const Warehouse = mongoose.model('Warehouse', WarehouseSchema);
const Location = mongoose.model('Location', LocationSchema);

// Mahindra Logistics-inspired Sample Data
// Based on their actual pan-India network structure
const warehouses = [
  // Tier-1 Mega Hubs (West Zone)
  {
    code: 'MH-MUM-01',
    name: 'Mumbai Mega Hub - Bhiwandi',
    address: 'Gat No. 234, Bhiwandi MIDC',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    zipCode: '421302',
    type: 'mega-hub',
    capacity: 150000,
    status: 'active'
  },
  {
    code: 'MH-PUN-01',
    name: 'Pune Distribution Hub - Chakan',
    address: 'Plot No. 45, Phase II, Chakan Industrial Area',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '410501',
    type: 'distribution-hub',
    capacity: 85000,
    status: 'active'
  },
  {
    code: 'MH-AHM-01',
    name: 'Ahmedabad Logistics Park',
    address: 'Survey No. 178, Sanand GIDC',
    city: 'Ahmedabad',
    state: 'Gujarat',
    zipCode: '382110',
    type: 'logistics-park',
    capacity: 120000,
    status: 'active'
  },
  
  // Tier-1 Mega Hubs (North Zone)
  {
    code: 'MH-DEL-01',
    name: 'Delhi NCR Mega Hub - Manesar',
    address: 'Sector 8, IMT Manesar',
    city: 'Gurgaon',
    state: 'Haryana',
    zipCode: '122050',
    type: 'mega-hub',
    capacity: 180000,
    status: 'active'
  },
  {
    code: 'MH-DEL-02',
    name: 'Greater Noida Fulfillment Center',
    address: 'Plot 12A, Surajpur Industrial Area',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    zipCode: '201306',
    type: 'fulfillment-center',
    capacity: 95000,
    status: 'active'
  },
  {
    code: 'MH-JA P-01',
    name: 'Jaipur Distribution Center',
    address: 'Khushkhera Industrial Area',
    city: 'Jaipur',
    state: 'Rajasthan',
    zipCode: '303603',
    type: 'distribution-center',
    capacity: 45000,
    status: 'active'
  },
  
  // Tier-1 Mega Hubs (South Zone)
  {
    code: 'MH-BLR-01',
    name: 'Bangalore Tech Hub - Whitefield',
    address: 'Survey No. 67, Whitefield Industrial Area',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560066',
    type: 'mega-hub',
    capacity: 140000,
    status: 'active'
  },
  {
    code: 'MH-CHE-01',
    name: 'Chennai Port Logistics Hub',
    address: 'Plot 45-48, Oragadam Industrial Corridor',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zipCode: '602105',
    type: 'port-logistics',
    capacity: 110000,
    status: 'active'
  },
  {
    code: 'MH-HYD-01',
    name: 'Hyderabad Pharma Hub',
    address: 'IDA Pashamylaram, Phase III',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '502307',
    type: 'specialized-hub',
    capacity: 75000,
    status: 'active'
  },
  
  // Tier-1 Mega Hubs (East Zone)
  {
    code: 'MH-KOL-01',
    name: 'Kolkata East Hub - Dankuni',
    address: 'Plot 234, Dankuni Industrial Park',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '712311',
    type: 'mega-hub',
    capacity: 90000,
    status: 'active'
  },
  
  // Tier-2 Regional Centers
  {
    code: 'MH-LKO-01',
    name: 'Lucknow Regional Center',
    address: 'Transport Nagar, Amausi',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    zipCode: '226009',
    type: 'regional-center',
    capacity: 35000,
    status: 'active'
  },
  {
    code: 'MH-IND-01',
    name: 'Indore Auto Hub',
    address: 'Sector C, Pithampur Industrial Area',
    city: 'Indore',
    state: 'Madhya Pradesh',
    zipCode: '454775',
    type: 'auto-hub',
    capacity: 55000,
    status: 'active'
  },
  {
    code: 'MH-COI-01',
    name: 'Coimbatore Textile Hub',
    address: 'SIDCO Industrial Estate, Kurichi',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    zipCode: '641021',
    type: 'specialized-hub',
    capacity: 40000,
    status: 'active'
  },
  {
    code: 'MH-VIS-01',
    name: 'Visakhapatnam Port Center',
    address: 'Duvvada Industrial Area',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    zipCode: '530046',
    type: 'port-logistics',
    capacity: 48000,
    status: 'active'
  },
  {
    code: 'MH-NAG-01',
    name: 'Nagpur Central Hub',
    address: 'MIHAN SEZ, Phase I',
    city: 'Nagpur',
    state: 'Maharashtra',
    zipCode: '441108',
    type: 'distribution-hub',
    capacity: 65000,
    status: 'active'
  }
];

const locations = [
  // Mumbai Bhiwandi - Zone A (High-velocity automotive parts)
  { locationCode: 'A-01-01-01', warehouse: 'MH-MUM-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2000, status: 'available' },
  { locationCode: 'A-01-02-01', warehouse: 'MH-MUM-01', zone: 'A', aisle: '01', rack: '02', level: '01', bin: '01', type: 'pallet-rack', capacity: 2000, status: 'available' },
  { locationCode: 'A-02-01-01', warehouse: 'MH-MUM-01', zone: 'A', aisle: '02', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2000, status: 'available' },
  { locationCode: 'B-01-01-01', warehouse: 'MH-MUM-01', zone: 'B', aisle: '01', rack: '01', level: '01', bin: '01', type: 'heavy-duty', capacity: 3000, status: 'available' },
  { locationCode: 'C-01-01-01', warehouse: 'MH-MUM-01', zone: 'C', aisle: '01', rack: '01', level: '01', bin: '01', type: 'bulk-storage', capacity: 5000, status: 'available' },
  
  // Delhi NCR Manesar - Automotive Focus
  { locationCode: 'A-01-01-01', warehouse: 'MH-DEL-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2500, status: 'available' },
  { locationCode: 'A-02-01-01', warehouse: 'MH-DEL-01', zone: 'A', aisle: '02', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2500, status: 'available' },
  { locationCode: 'B-01-01-01', warehouse: 'MH-DEL-01', zone: 'B', aisle: '01', rack: '01', level: '01', bin: '01', type: 'drive-in-rack', capacity: 4000, status: 'available' },
  { locationCode: 'C-01-01-01', warehouse: 'MH-DEL-01', zone: 'C', aisle: '01', rack: '01', level: '01', bin: '01', type: 'cantilever', capacity: 3500, status: 'available' },
  
  // Bangalore Tech Hub
  { locationCode: 'A-01-01-01', warehouse: 'MH-BLR-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 1800, status: 'available' },
  { locationCode: 'A-02-01-01', warehouse: 'MH-BLR-01', zone: 'A', aisle: '02', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 1800, status: 'available' },
  { locationCode: 'E-01-01-01', warehouse: 'MH-BLR-01', zone: 'E', aisle: '01', rack: '01', level: '01', bin: '01', type: 'electronics-rack', capacity: 1000, status: 'available' },
  
  // Chennai Port Hub
  { locationCode: 'A-01-01-01', warehouse: 'MH-CHE-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2200, status: 'available' },
  { locationCode: 'D-01-01-01', warehouse: 'MH-CHE-01', zone: 'D', aisle: '01', rack: '01', level: '01', bin: '01', type: 'export-staging', capacity: 5000, status: 'available' },
  
  // Pune Chakan
  { locationCode: 'A-01-01-01', warehouse: 'MH-PUN-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 1500, status: 'available' },
  { locationCode: 'B-01-01-01', warehouse: 'MH-PUN-01', zone: 'B', aisle: '01', rack: '01', level: '01', bin: '01', type: 'heavy-duty', capacity: 2500, status: 'available' },
  
  // Ahmedabad
  { locationCode: 'A-01-01-01', warehouse: 'MH-AHM-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 2000, status: 'available' },
  { locationCode: 'F-01-01-01', warehouse: 'MH-AHM-01', zone: 'F', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pharma-cold', capacity: 800, status: 'available' },
  
  // Kolkata
  { locationCode: 'A-01-01-01', warehouse: 'MH-KOL-01', zone: 'A', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pallet-rack', capacity: 1600, status: 'available' },
  
  // Hyderabad Pharma
  { locationCode: 'F-01-01-01', warehouse: 'MH-HYD-01', zone: 'F', aisle: '01', rack: '01', level: '01', bin: '01', type: 'pharma-cold', capacity: 1200, status: 'available' },
  { locationCode: 'F-02-01-01', warehouse: 'MH-HYD-01', zone: 'F', aisle: '02', rack: '01', level: '01', bin: '01', type: 'pharma-ambient', capacity: 1000, status: 'available' }
];

const products = [
  // Automotive Parts - Engine Components
  {
    sku: 'AUTO-ENG-PISTON-M2K',
    name: 'Mahindra 2.2L Diesel Engine Piston Set',
    description: 'M2K Engine Piston Assembly with Rings (Set of 4)',
    category: 'Automotive-Engine',
    barcode: 'MAH-ENG-2024-001',
    price: 8500,
    cost: 6200,
    weight: 4.5,
    dimensions: { length: 25, width: 20, height: 15, unit: 'cm' },
    reorderPoint: 50,
    reorderQuantity: 200,
    status: 'active'
  },
  {
    sku: 'AUTO-ENG-FILTER-OIL',
    name: 'Oil Filter - Scorpio/XUV Series',
    description: 'High Performance Oil Filter for Mahindra SUVs',
    category: 'Automotive-Filters',
    barcode: 'MAH-FIL-2024-008',
    price: 450,
    cost: 280,
    weight: 0.6,
    dimensions: { length: 12, width: 12, height: 18, unit: 'cm' },
    reorderPoint: 500,
    reorderQuantity: 2000,
    status: 'active'
  },
  {
    sku: 'AUTO-BRAKE-PAD-XUV700',
    name: 'Brake Pad Set - XUV700',
    description: 'Front Disc Brake Pads (Set of 4)',
    category: 'Automotive-Brakes',
    barcode: 'MAH-BRK-2024-015',
    price: 3200,
    cost: 2100,
    weight: 2.8,
    dimensions: { length: 20, width: 15, height: 8, unit: 'cm' },
    reorderPoint: 100,
    reorderQuantity: 500,
    status: 'active'
  },
  
  // Automotive Parts - Electrical
  {
    sku: 'AUTO-ELEC-BATTERY-12V',
    name: 'Exide 12V 65Ah Battery',
    description: 'Maintenance Free Car Battery',
    category: 'Automotive-Electrical',
    barcode: 'EXI-BAT-2024-032',
    price: 5800,
    cost: 4200,
    weight: 15.0,
    dimensions: { length: 24, width: 17, height: 19, unit: 'cm' },
    reorderPoint: 150,
    reorderQuantity: 600,
    status: 'active'
  },
  {
    sku: 'AUTO-ELEC-ALTERNATOR-120A',
    name: 'Alternator 120A - Thar/Scorpio',
    description: '12V 120A Alternator Assembly',
    category: 'Automotive-Electrical',
    barcode: 'MAH-ALT-2024-042',
    price: 12500,
    cost: 8900,
    weight: 8.5,
    dimensions: { length: 28, width: 25, height: 22, unit: 'cm' },
    reorderPoint: 30,
    reorderQuantity: 150,
    status: 'active'
  },
  
  // Automotive Parts - Suspension
  {
    sku: 'AUTO-SUSP-SHOCK-ABS',
    name: 'Shock Absorber - Front (Pair)',
    description: 'Heavy Duty Shock Absorbers for SUVs',
    category: 'Automotive-Suspension',
    barcode: 'MAH-SUS-2024-055',
    price: 6800,
    cost: 4500,
    weight: 7.2,
    dimensions: { length: 65, width: 15, height: 15, unit: 'cm' },
    reorderPoint: 80,
    reorderQuantity: 300,
    status: 'active'
  },
  
  // Automotive Parts - Tyres & Wheels
  {
    sku: 'AUTO-TYRE-CEAT-215-65',
    name: 'CEAT Tyre 215/65 R16',
    description: 'All Terrain Tyre for SUVs',
    category: 'Automotive-Tyres',
    barcode: 'CEAT-TYR-2024-088',
    price: 8900,
    cost: 6500,
    weight: 12.0,
    dimensions: { length: 70, width: 70, height: 25, unit: 'cm' },
    reorderPoint: 200,
    reorderQuantity: 800,
    status: 'active'
  },
  {
    sku: 'AUTO-WHEEL-ALLOY-17',
    name: '17" Alloy Wheel - XUV Series',
    description: 'Diamond Cut Alloy Wheel',
    category: 'Automotive-Wheels',
    barcode: 'MAH-WHL-2024-095',
    price: 15000,
    cost: 11000,
    weight: 9.5,
    dimensions: { length: 45, width: 45, height: 22, unit: 'cm' },
    reorderPoint: 40,
    reorderQuantity: 160,
    status: 'active'
  },
  
  // Farm Equipment Parts
  {
    sku: 'FARM-TRACT-FILTER-AIR',
    name: 'Tractor Air Filter - Yuvraj/Arjun',
    description: 'Heavy Duty Air Filter for Tractors',
    category: 'Farm Equipment',
    barcode: 'MAH-FRM-2024-112',
    price: 1200,
    cost: 750,
    weight: 1.2,
    dimensions: { length: 30, width: 18, height: 18, unit: 'cm' },
    reorderPoint: 300,
    reorderQuantity: 1200,
    status: 'active'
  },
  {
    sku: 'FARM-TRACT-TYRE-14.9-28',
    name: 'Tractor Rear Tyre 14.9-28',
    description: 'Heavy Duty Agricultural Tyre',
    category: 'Farm Equipment',
    barcode: 'APOLLO-TYR-2024-125',
    price: 22000,
    cost: 16500,
    weight: 85.0,
    dimensions: { length: 110, width: 110, height: 40, unit: 'cm' },
    reorderPoint: 25,
    reorderQuantity: 100,
    status: 'active'
  },
  
  // Electronics & IT (for e-commerce fulfillment)
  {
    sku: 'ELEC-LAP-DELL-5420',
    name: 'Dell Latitude 5420 Laptop',
    description: '14" Business Laptop, Intel i5, 8GB RAM, 256GB SSD',
    category: 'Electronics',
    barcode: 'DELL-LAP-2024-201',
    price: 65000,
    cost: 52000,
    weight: 1.5,
    dimensions: { length: 32, width: 21, height: 2, unit: 'cm' },
    reorderPoint: 10,
    reorderQuantity: 50,
    status: 'active'
  },
  {
    sku: 'ELEC-TAB-IPAD-10',
    name: 'Apple iPad 10th Gen',
    description: '10.9" Tablet, 64GB WiFi',
    category: 'Electronics',
    barcode: 'APPLE-TAB-2024-215',
    price: 45000,
    cost: 38000,
    weight: 0.48,
    dimensions: { length: 24, width: 17, height: 1, unit: 'cm' },
    reorderPoint: 15,
    reorderQuantity: 60,
    status: 'active'
  },
  
  // Pharma Products (Temperature Controlled)
  {
    sku: 'PHAR-TAB-PARACET-500MG',
    name: 'Paracetamol 500mg Tablets',
    description: 'Pain Relief Tablets (Strip of 15)',
    category: 'Pharma-OTC',
    barcode: 'CIPLA-TAB-2024-301',
    price: 25,
    cost: 15,
    weight: 0.02,
    dimensions: { length: 10, width: 5, height: 1, unit: 'cm' },
    reorderPoint: 5000,
    reorderQuantity: 20000,
    status: 'active'
  },
  {
    sku: 'PHAR-INJ-INSULIN-CART',
    name: 'Insulin Injection Cartridge 100IU/ml',
    description: 'Refrigerated Insulin (Cold Chain)',
    category: 'Pharma-Cold-Chain',
    barcode: 'NOVOR-INJ-2024-320',
    price: 850,
    cost: 620,
    weight: 0.05,
    dimensions: { length: 8, width: 3, height: 3, unit: 'cm' },
    reorderPoint: 500,
    reorderQuantity: 2000,
    status: 'active'
  },
  {
    sku: 'PHAR-SYR-CETIRIZ-5ML',
    name: 'Cetirizine Syrup 5mg/5ml',
    description: 'Allergy Relief Syrup 100ml',
    category: 'Pharma-OTC',
    barcode: 'DRREDDY-SYR-2024-335',
    price: 95,
    cost: 65,
    weight: 0.12,
    dimensions: { length: 6, width: 6, height: 12, unit: 'cm' },
    reorderPoint: 1000,
    reorderQuantity: 5000,
    status: 'active'
  },
  
  // Industrial Goods
  {
    sku: 'IND-BEAR-SKF-6204',
    name: 'SKF Ball Bearing 6204-2RS',
    description: 'Deep Groove Ball Bearing',
    category: 'Industrial-Bearings',
    barcode: 'SKF-BEAR-2024-402',
    price: 320,
    cost: 210,
    weight: 0.18,
    dimensions: { length: 5, width: 5, height: 2, unit: 'cm' },
    reorderPoint: 500,
    reorderQuantity: 2000,
    status: 'active'
  },
  {
    sku: 'IND-LUBR-SERVO-20W40',
    name: 'Servo Premium 20W40 Engine Oil',
    description: 'Mineral Engine Oil 5L Can',
    category: 'Industrial-Lubricants',
    barcode: 'IOC-OIL-2024-425',
    price: 1850,
    cost: 1350,
    weight: 4.5,
    dimensions: { length: 25, width: 18, height: 28, unit: 'cm' },
    reorderPoint: 200,
    reorderQuantity: 800,
    status: 'active'
  },
  {
    sku: 'IND-PUMP-CROMPT-1HP',
    name: 'Crompton 1HP Water Pump',
    description: 'Monoblock Centrifugal Pump',
    category: 'Industrial-Pumps',
    barcode: 'CROMP-PMP-2024-445',
    price: 7200,
    cost: 5400,
    weight: 12.0,
    dimensions: { length: 45, width: 30, height: 35, unit: 'cm' },
    reorderPoint: 30,
    reorderQuantity: 120,
    status: 'active'
  },
  
  // Consumer Goods (FMCG)
  {
    sku: 'FMCG-SOAP-LUX-125G',
    name: 'Lux Beauty Soap 125g',
    description: 'Premium Bath Soap (Pack of 3)',
    category: 'FMCG-Personal-Care',
    barcode: 'HUL-SOAP-2024-501',
    price: 110,
    cost: 75,
    weight: 0.38,
    dimensions: { length: 15, width: 10, height: 5, unit: 'cm' },
    reorderPoint: 2000,
    reorderQuantity: 10000,
    status: 'active'
  },
  {
    sku: 'FMCG-OIL-FORTUNE-1L',
    name: 'Fortune Refined Sunflower Oil 1L',
    description: 'Edible Cooking Oil',
    category: 'FMCG-Food',
    barcode: 'ADM-OIL-2024-518',
    price: 185,
    cost: 155,
    weight: 0.92,
    dimensions: { length: 10, width: 10, height: 24, unit: 'cm' },
    reorderPoint: 1500,
    reorderQuantity: 6000,
    status: 'active'
  },
  {
    sku: 'FMCG-BIS-BRITANIA-200G',
    name: 'Britannia Marie Gold Biscuits 200g',
    description: 'Tea Time Biscuits',
    category: 'FMCG-Food',
    barcode: 'BRIT-BIS-2024-532',
    price: 35,
    cost: 25,
    weight: 0.21,
    dimensions: { length: 20, width: 12, height: 4, unit: 'cm' },
    reorderPoint: 3000,
    reorderQuantity: 15000,
    status: 'active'
  },
  
  // Textile & Apparel (for retail logistics)
  {
    sku: 'TEXT-SHIRT-PETERMALE-M',
    name: 'Peter England Formal Shirt - Medium',
    description: 'Cotton Blend Formal Shirt',
    category: 'Textile-Apparel',
    barcode: 'PE-SHIRT-2024-605',
    price: 1299,
    cost: 850,
    weight: 0.25,
    dimensions: { length: 35, width: 25, height: 3, unit: 'cm' },
    reorderPoint: 100,
    reorderQuantity: 500,
    status: 'active'
  },
  {
    sku: 'TEXT-JEANS-LEVIS-32',
    name: "Levi's 511 Slim Fit Jeans - 32",
    description: 'Denim Jeans Waist 32',
    category: 'Textile-Apparel',
    barcode: 'LEVI-JEANS-2024-622',
    price: 3499,
    cost: 2400,
    weight: 0.65,
    dimensions: { length: 40, width: 30, height: 5, unit: 'cm' },
    reorderPoint: 80,
    reorderQuantity: 400,
    status: 'active'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('\n🚀 Starting WMS database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await Warehouse.deleteMany({});
    await Location.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert Warehouses
    console.log('🏢 Creating warehouses...');
    const createdWarehouses = await Warehouse.insertMany(warehouses);
    console.log(`✅ Created ${createdWarehouses.length} warehouses\n`);

    // Insert Locations
    console.log('📍 Creating storage locations...');
    const createdLocations = await Location.insertMany(locations);
    console.log(`✅ Created ${createdLocations.length} storage locations\n`);

    // Insert Products
    console.log('📦 Creating products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Create Inventory Records with realistic stock levels across all Mahindra warehouses
    console.log('📊 Creating inventory records...');
    const inventoryRecords = [];
    
    // Warehouse codes for inventory distribution
    const warehouseCodes = [
      'MH-MUM-01', // Mumbai Mega Hub
      'MH-DEL-01', // Delhi Manesar
      'MH-BLR-01', // Bangalore
      'MH-CHE-01', // Chennai
      'MH-PUN-01', // Pune
      'MH-AHM-01', // Ahmedabad
      'MH-KOL-01', // Kolkata
      'MH-HYD-01', // Hyderabad
      'MH-JAI-01', // Jaipur
      'MH-LKO-01', // Lucknow
      'MH-IND-01', // Indore
      'MH-COI-01', // Coimbatore
      'MH-VIS-01', // Visakhapatnam
      'MH-NAG-01', // Nagpur
      'MH-NOI-01'  // Greater Noida
    ];
    
    createdProducts.forEach((product, productIndex) => {
      // Distribute products strategically across warehouses
      
      // Automotive parts - focus on Mumbai, Delhi, Pune, Indore (automotive hubs)
      if (product.category.includes('Automotive')) {
        ['MH-MUM-01', 'MH-DEL-01', 'MH-PUN-01', 'MH-IND-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 300) + 100; // 100-400 units
          const allocated = Math.floor(qty * 0.12);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode)?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // Farm equipment - focus on Indore, Nagpur, Lucknow (agricultural regions)
      else if (product.category.includes('Farm')) {
        ['MH-IND-01', 'MH-NAG-01', 'MH-LKO-01', 'MH-JAI-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 200) + 50; // 50-250 units
          const allocated = Math.floor(qty * 0.08);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode)?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // Electronics - focus on Bangalore, Mumbai, Delhi, Hyderabad (tech hubs)
      else if (product.category.includes('Electronics')) {
        ['MH-BLR-01', 'MH-MUM-01', 'MH-DEL-01', 'MH-HYD-01', 'MH-NOI-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 150) + 50; // 50-200 units
          const allocated = Math.floor(qty * 0.18);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode)?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // Pharma - focus on Hyderabad, Ahmedabad (pharma hubs)
      else if (product.category.includes('Pharma')) {
        ['MH-HYD-01', 'MH-AHM-01', 'MH-MUM-01', 'MH-BLR-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 500) + 200; // 200-700 units (high volume)
          const allocated = Math.floor(qty * 0.10);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode && loc.type.includes('pharma'))?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // FMCG - distribute across all major metros (consumer distribution)
      else if (product.category.includes('FMCG')) {
        ['MH-MUM-01', 'MH-DEL-01', 'MH-BLR-01', 'MH-CHE-01', 'MH-KOL-01', 'MH-PUN-01', 'MH-AHM-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 800) + 300; // 300-1100 units (very high volume)
          const allocated = Math.floor(qty * 0.15);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode)?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // Textiles - focus on Coimbatore, Mumbai (textile hubs)
      else if (product.category.includes('Textile')) {
        ['MH-COI-01', 'MH-MUM-01', 'MH-BLR-01', 'MH-CHE-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 250) + 80; // 80-330 units
          const allocated = Math.floor(qty * 0.20);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode)?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
      
      // Industrial - focus on Mumbai, Pune, Delhi (industrial hubs)
      else if (product.category.includes('Industrial')) {
        ['MH-MUM-01', 'MH-PUN-01', 'MH-DEL-01', 'MH-AHM-01', 'MH-CHE-01'].forEach(whCode => {
          const qty = Math.floor(Math.random() * 200) + 60; // 60-260 units
          const allocated = Math.floor(qty * 0.10);
          inventoryRecords.push({
            product: product._id,
            warehouse: whCode,
            location: locations.find(loc => loc.warehouse === whCode && loc.type.includes('heavy'))?.locationCode || 'A-01-01-01',
            quantityOnHand: qty,
            quantityAllocated: allocated,
            quantityAvailable: qty - allocated,
            lastUpdated: new Date()
          });
        });
      }
    });

    const createdInventory = await Inventory.insertMany(inventoryRecords);
    console.log(`✅ Created ${createdInventory.length} inventory records across ${warehouseCodes.length} warehouses\n`);

    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   • Warehouses: ${createdWarehouses.length}`);
    console.log(`   • Locations: ${createdLocations.length}`);
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(`   • Inventory Records: ${createdInventory.length}`);
    console.log('\n📍 Test the data:');
    console.log(`   • Products API: http://localhost:5001/api/v1/wms/products`);
    console.log(`   • Inventory API: http://localhost:5001/api/v1/wms/inventory/stock-levels`);
    console.log(`   • Warehouses API: http://localhost:5001/api/v1/wms/warehouse`);
    console.log('\n🌐 Frontend:');
    console.log(`   • WMS Dashboard: http://localhost:8888/WMS/index.html`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder
const run = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
