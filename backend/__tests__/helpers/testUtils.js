const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Mock data generators
const generateMockUser = (overrides = {}) => ({
  email: `test${Date.now()}@example.com`,
  password: 'Test@1234',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  ...overrides
});

const generateMockProduct = (overrides = {}) => ({
  sku: `SKU-${Date.now()}`,
  name: `Test Product ${Date.now()}`,
  description: 'Test product description',
  category: 'Electronics',
  price: 99.99,
  quantity: 100,
  reorderPoint: 20,
  location: 'A-01-01',
  ...overrides
});

const generateMockInventory = (overrides = {}) => ({
  productId: `PROD-${Date.now()}`,
  sku: `SKU-${Date.now()}`,
  name: `Test Item ${Date.now()}`,
  quantity: 100,
  location: 'A-01-01',
  warehouseId: 'WH-001',
  ...overrides
});

const generateMockOrder = (overrides = {}) => ({
  orderNumber: `ORD-${Date.now()}`,
  customerId: 'CUST-001',
  items: [
    {
      productId: 'PROD-001',
      quantity: 5,
      price: 99.99
    }
  ],
  status: 'pending',
  totalAmount: 499.95,
  ...overrides
});

const generateMockShipment = (overrides = {}) => ({
  shipmentNumber: `SHIP-${Date.now()}`,
  orderId: `ORD-${Date.now()}`,
  carrier: 'FedEx',
  trackingNumber: `TRK-${Date.now()}`,
  status: 'pending',
  origin: {
    address: '123 Warehouse St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  },
  destination: {
    address: '456 Customer Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001'
  },
  ...overrides
});

// Database helpers
const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
};

const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database disconnection error:', error);
    throw error;
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

// JWT token generator for tests
const generateTestToken = (userId = 'test-user-id', role = 'user') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// API test helpers
const createAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

const expectValidationError = (response, field) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('errors');
  if (field) {
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field })
      ])
    );
  }
};

const expectUnauthorizedError = (response) => {
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('message');
};

const expectNotFoundError = (response) => {
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('message');
};

const expectSuccessResponse = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('success', true);
};

module.exports = {
  // Mock data generators
  generateMockUser,
  generateMockProduct,
  generateMockInventory,
  generateMockOrder,
  generateMockShipment,
  
  // Database helpers
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  
  // Auth helpers
  generateTestToken,
  createAuthHeaders,
  
  // Assertion helpers
  expectValidationError,
  expectUnauthorizedError,
  expectNotFoundError,
  expectSuccessResponse,
};
