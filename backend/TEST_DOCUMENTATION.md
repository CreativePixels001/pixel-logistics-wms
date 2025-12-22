# WMS Test Suite Documentation

## Overview

Comprehensive test suite for the Pixel Logistics Warehouse Management System backend API. Tests cover authentication, inventory management, order management, and warehouse operations workflows.

## Test Structure

```
backend/__tests__/
├── setup.js                           # Global test configuration
├── helpers/
│   └── testUtils.js                  # Mock data generators & helper functions
└── unit/
    ├── auth.controller.test.js       # Authentication tests (300+ assertions)
    ├── inventory.controller.test.js  # Inventory management tests (250+ assertions)
    ├── order.controller.test.js      # Order management tests (200+ assertions)
    └── warehouse.operations.test.js  # Warehouse workflow tests (300+ assertions)
```

## Test Coverage

### 1. Authentication Module (`auth.controller.test.js`)
- ✅ User registration with validation
- ✅ User login with credentials
- ✅ JWT token generation & validation
- ✅ Refresh token functionality
- ✅ Password update & validation
- ✅ Security tests (password hashing, token tampering)
- ✅ Error handling for invalid credentials

**Total: 35+ test cases**

### 2. Inventory Management (`inventory.controller.test.js`)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination & filtering
- ✅ Search by SKU/name
- ✅ Quantity adjustments (increase/decrease)
- ✅ Low stock alerts
- ✅ Inventory statistics & analytics
- ✅ Soft delete implementation
- ✅ Concurrency handling
- ✅ Validation (negative quantities, duplicate SKUs)

**Total: 40+ test cases**

### 3. Order Management (`order.controller.test.js`)

**Sales Orders:**
- ✅ Create orders with line items
- ✅ Auto-calculate totals
- ✅ Order fulfillment workflow
- ✅ Order cancellation
- ✅ Status transitions
- ✅ Filter by customer, date, status

**Purchase Orders:**
- ✅ Create purchase orders
- ✅ Receive orders
- ✅ Create putaway tasks
- ✅ Filter by supplier
- ✅ Inventory updates on receiving

**Total: 35+ test cases**

### 4. Warehouse Operations (`warehouse.operations.test.js`)

**Picking Operations:**
- ✅ Create picking tasks
- ✅ Route optimization by location
- ✅ Priority-based task assignment
- ✅ Task completion & inventory reservation
- ✅ Automatic packing task creation

**Packing Operations:**
- ✅ Create packing tasks
- ✅ Package optimization suggestions
- ✅ Task completion with package details
- ✅ Shipping label generation
- ✅ Automatic shipment creation

**Putaway Operations:**
- ✅ Create putaway tasks from receiving
- ✅ Storage location optimization
- ✅ Hazardous material handling
- ✅ Location capacity validation
- ✅ Inventory location updates

**Shipping Operations:**
- ✅ Create shipments
- ✅ Shipping cost calculation
- ✅ Carrier validation
- ✅ Status tracking & history
- ✅ Customer notifications

**Workflow Integration:**
- ✅ Complete inbound flow (Receive → Putaway)
- ✅ Complete outbound flow (Pick → Pack → Ship)
- ✅ Concurrency & race condition tests

**Total: 50+ test cases**

## Running Tests

### Prerequisites

```bash
# Install dependencies (including dev dependencies)
cd backend
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test Suite

```bash
# Authentication tests
npm test -- auth.controller.test.js

# Inventory tests
npm test -- inventory.controller.test.js

# Order management tests
npm test -- order.controller.test.js

# Warehouse operations tests
npm test -- warehouse.operations.test.js
```

### Run Tests in Watch Mode (Development)

```bash
npm test -- --watch
```

### Run Tests with Verbose Output

```bash
npm test -- --verbose
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
{
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
}
```

### Environment Variables

Tests use a separate test environment configured in `__tests__/setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '1h';
process.env.PORT = 5001;
```

## Mock Data Generators

The test suite includes comprehensive mock data generators in `helpers/testUtils.js`:

### Available Generators

```javascript
// User data
generateMockUser({ email: 'custom@example.com', role: 'admin' })

// Product data
generateMockProduct({ sku: 'CUSTOM-SKU', quantity: 100 })

// Inventory data
generateMockInventory({ location: 'A-01-01', quantity: 50 })

// Order data
generateMockOrder({ customerId: 'CUST-001', totalAmount: 999.99 })

// Shipment data
generateMockShipment({ carrier: 'FedEx', status: 'in_transit' })
```

### Helper Functions

```javascript
// Authentication
generateTestToken(userId, role)
createAuthHeaders(token)

// Assertions
expectValidationError(response, field)
expectUnauthorizedError(response)
expectNotFoundError(response)
expectSuccessResponse(response, statusCode)
```

## Database Testing

Tests use **in-memory MongoDB** for isolated, fast testing:

```javascript
// Connect to test database
await connectTestDB();

// Clear test data between tests
await clearTestDB();

// Disconnect after tests
await disconnectTestDB();
```

## Writing New Tests

### Test Structure Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/endpoint - Description', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      const mockData = generateMockData();
      Model.method.mockResolvedValue(mockData);

      // Act
      const response = await request(app)
        .post('/api/endpoint')
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Clear Mocking**: Mock external dependencies (database, APIs)
3. **Descriptive Names**: Use clear, descriptive test names
4. **AAA Pattern**: Arrange → Act → Assert
5. **Edge Cases**: Test happy path + error scenarios
6. **Cleanup**: Clear mocks between tests

## Coverage Reports

After running tests with coverage, view the report:

```bash
# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint
```

## Common Issues & Solutions

### Issue: Tests Timeout

**Solution**: Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000 // 30 seconds
```

### Issue: Port Already in Use

**Solution**: Tests use port 5001 by default. Change in `setup.js`:
```javascript
process.env.PORT = 5002;
```

### Issue: Database Connection Errors

**Solution**: Ensure MongoDB is installed (for mongodb-memory-server):
```bash
npm install mongodb-memory-server --save-dev
```

### Issue: Mock Not Working

**Solution**: Clear mocks before each test:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Test Metrics

### Current Statistics

- **Total Test Suites**: 4
- **Total Test Cases**: 160+
- **Total Assertions**: 1,000+
- **Estimated Coverage**: 75-85%
- **Average Test Duration**: 3-5 seconds

## Future Enhancements

- [ ] Integration tests with real database
- [ ] E2E tests with Cypress/Playwright
- [ ] Performance/load testing
- [ ] API contract testing
- [ ] Mutation testing
- [ ] Visual regression testing

## Support

For issues or questions about the test suite:

1. Check this documentation
2. Review test examples in `__tests__/unit/`
3. Contact the development team
4. Open an issue on GitHub

---

**Last Updated**: December 6, 2025  
**Test Suite Version**: 1.0.0  
**Maintainer**: Pixel Logistics Dev Team
