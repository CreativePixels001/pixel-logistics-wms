const request = require('supertest');
const express = require('express');
const Inventory = require('../../src/models/Inventory');
const inventoryController = require('../../src/controllers/inventory.controller');
const {
  generateMockInventory,
  generateTestToken,
  createAuthHeaders,
  expectSuccessResponse,
  expectNotFoundError,
} = require('../helpers/testUtils');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', role: 'admin' };
  next();
});

// Mount inventory routes
app.get('/api/inventory', inventoryController.getAllInventory);
app.get('/api/inventory/:id', inventoryController.getInventoryById);
app.post('/api/inventory', inventoryController.createInventory);
app.put('/api/inventory/:id', inventoryController.updateInventory);
app.delete('/api/inventory/:id', inventoryController.deleteInventory);
app.post('/api/inventory/:id/adjust', inventoryController.adjustQuantity);
app.get('/api/inventory/low-stock', inventoryController.getLowStockItems);
app.get('/api/inventory/stats', inventoryController.getInventoryStats);

// Mock Inventory model
jest.mock('../../src/models/Inventory');

describe('Inventory Management Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory - Get All Inventory', () => {
    
    it('should retrieve all inventory items', async () => {
      const mockInventory = [
        generateMockInventory({ id: '1', sku: 'SKU-001' }),
        generateMockInventory({ id: '2', sku: 'SKU-002' }),
        generateMockInventory({ id: '3', sku: 'SKU-003' })
      ];

      Inventory.findAll.mockResolvedValue(mockInventory);

      const response = await request(app).get('/api/inventory');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(3);
      expect(Inventory.findAll).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      const mockInventory = Array(10).fill(null).map((_, i) => 
        generateMockInventory({ id: `${i + 1}` })
      );

      Inventory.findAndCountAll.mockResolvedValue({
        rows: mockInventory.slice(0, 5),
        count: 10
      });

      const response = await request(app)
        .get('/api/inventory')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should filter by warehouse', async () => {
      const warehouseId = 'WH-001';
      const mockInventory = [
        generateMockInventory({ warehouseId })
      ];

      Inventory.findAll.mockResolvedValue(mockInventory);

      const response = await request(app)
        .get('/api/inventory')
        .query({ warehouseId });

      expect(response.status).toBe(200);
      expect(Inventory.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ warehouseId })
        })
      );
    });

    it('should search by SKU or name', async () => {
      const searchTerm = 'laptop';
      const mockInventory = [
        generateMockInventory({ name: 'Dell Laptop', sku: 'LAP-001' })
      ];

      Inventory.findAll.mockResolvedValue(mockInventory);

      const response = await request(app)
        .get('/api/inventory')
        .query({ search: searchTerm });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return empty array when no items found', async () => {
      Inventory.findAll.mockResolvedValue([]);

      const response = await request(app).get('/api/inventory');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/inventory/:id - Get Inventory By ID', () => {
    
    it('should retrieve inventory item by ID', async () => {
      const mockItem = generateMockInventory({ id: '123' });
      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app).get('/api/inventory/123');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', '123');
      expect(Inventory.findByPk).toHaveBeenCalledWith('123');
    });

    it('should return 404 for non-existent item', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/api/inventory/999');

      expectNotFoundError(response);
    });

    it('should include related data', async () => {
      const mockItem = {
        ...generateMockInventory({ id: '123' }),
        warehouse: { id: 'WH-001', name: 'Main Warehouse' }
      };
      
      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app).get('/api/inventory/123');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('warehouse');
    });
  });

  describe('POST /api/inventory - Create Inventory', () => {
    
    it('should create new inventory item', async () => {
      const newItem = generateMockInventory();
      const createdItem = { id: '123', ...newItem };

      Inventory.create.mockResolvedValue(createdItem);

      const response = await request(app)
        .post('/api/inventory')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', '123');
      expect(Inventory.create).toHaveBeenCalledWith(expect.objectContaining({
        sku: newItem.sku,
        name: newItem.name
      }));
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should enforce unique SKU', async () => {
      const duplicateItem = generateMockInventory({ sku: 'SKU-001' });
      
      Inventory.create.mockRejectedValue({
        name: 'SequelizeUniqueConstraintError',
        message: 'SKU must be unique'
      });

      const response = await request(app)
        .post('/api/inventory')
        .send(duplicateItem);

      expect(response.status).toBe(400);
    });

    it('should validate quantity is non-negative', async () => {
      const invalidItem = generateMockInventory({ quantity: -10 });

      const response = await request(app)
        .post('/api/inventory')
        .send(invalidItem);

      expect(response.status).toBe(400);
    });

    it('should set default values', async () => {
      const minimalItem = {
        sku: 'SKU-NEW',
        name: 'New Product',
        quantity: 0
      };

      Inventory.create.mockResolvedValue({
        id: '123',
        ...minimalItem,
        reorderPoint: 0,
        status: 'active'
      });

      const response = await request(app)
        .post('/api/inventory')
        .send(minimalItem);

      expect(response.status).toBe(201);
      expect(Inventory.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/inventory/:id - Update Inventory', () => {
    
    it('should update inventory item', async () => {
      const mockItem = {
        id: '123',
        ...generateMockInventory(),
        update: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const updates = { quantity: 150, location: 'B-02-03' };

      const response = await request(app)
        .put('/api/inventory/123')
        .send(updates);

      expect(response.status).toBe(200);
      expect(mockItem.update).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it('should return 404 for non-existent item', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/inventory/999')
        .send({ quantity: 100 });

      expectNotFoundError(response);
    });

    it('should not allow updating SKU to duplicate', async () => {
      const mockItem = {
        id: '123',
        update: jest.fn().mockRejectedValue({
          name: 'SequelizeUniqueConstraintError'
        })
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app)
        .put('/api/inventory/123')
        .send({ sku: 'DUPLICATE-SKU' });

      expect(response.status).toBe(400);
    });

    it('should validate quantity updates', async () => {
      const mockItem = {
        id: '123',
        update: jest.fn()
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app)
        .put('/api/inventory/123')
        .send({ quantity: -50 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/inventory/:id - Delete Inventory', () => {
    
    it('should delete inventory item', async () => {
      const mockItem = {
        id: '123',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app).delete('/api/inventory/123');

      expect(response.status).toBe(200);
      expect(mockItem.destroy).toHaveBeenCalled();
      expect(response.body).toHaveProperty('message', 'Inventory item deleted successfully');
    });

    it('should return 404 for non-existent item', async () => {
      Inventory.findByPk.mockResolvedValue(null);

      const response = await request(app).delete('/api/inventory/999');

      expectNotFoundError(response);
    });

    it('should soft delete instead of hard delete', async () => {
      const mockItem = {
        id: '123',
        update: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app).delete('/api/inventory/123');

      expect(response.status).toBe(200);
      // Verify soft delete by checking status update
      expect(mockItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'deleted' })
      );
    });
  });

  describe('POST /api/inventory/:id/adjust - Adjust Quantity', () => {
    
    it('should increase inventory quantity', async () => {
      const mockItem = {
        id: '123',
        quantity: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/inventory/123/adjust')
        .send({
          adjustment: 50,
          reason: 'Restock',
          type: 'increase'
        });

      expect(response.status).toBe(200);
      expect(mockItem.quantity).toBe(150);
      expect(mockItem.save).toHaveBeenCalled();
    });

    it('should decrease inventory quantity', async () => {
      const mockItem = {
        id: '123',
        quantity: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/inventory/123/adjust')
        .send({
          adjustment: 30,
          reason: 'Damaged goods',
          type: 'decrease'
        });

      expect(response.status).toBe(200);
      expect(mockItem.quantity).toBe(70);
    });

    it('should prevent negative inventory', async () => {
      const mockItem = {
        id: '123',
        quantity: 50
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/inventory/123/adjust')
        .send({
          adjustment: 100,
          reason: 'Test',
          type: 'decrease'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('insufficient');
    });

    it('should require adjustment reason', async () => {
      const response = await request(app)
        .post('/api/inventory/123/adjust')
        .send({
          adjustment: 10,
          type: 'increase'
        });

      expect(response.status).toBe(400);
    });

    it('should log adjustment history', async () => {
      const mockItem = {
        id: '123',
        quantity: 100,
        save: jest.fn(),
        addAdjustment: jest.fn()
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      await request(app)
        .post('/api/inventory/123/adjust')
        .send({
          adjustment: 20,
          reason: 'Restock',
          type: 'increase'
        });

      expect(mockItem.addAdjustment).toHaveBeenCalled();
    });
  });

  describe('GET /api/inventory/low-stock - Get Low Stock Items', () => {
    
    it('should retrieve items below reorder point', async () => {
      const lowStockItems = [
        generateMockInventory({ quantity: 5, reorderPoint: 20 }),
        generateMockInventory({ quantity: 10, reorderPoint: 30 })
      ];

      Inventory.findAll.mockResolvedValue(lowStockItems);

      const response = await request(app).get('/api/inventory/low-stock');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(Inventory.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object)
        })
      );
    });

    it('should sort by urgency (lowest stock first)', async () => {
      const lowStockItems = [
        generateMockInventory({ quantity: 2, reorderPoint: 20 }),
        generateMockInventory({ quantity: 15, reorderPoint: 30 })
      ];

      Inventory.findAll.mockResolvedValue(lowStockItems);

      const response = await request(app).get('/api/inventory/low-stock');

      expect(response.status).toBe(200);
      expect(Inventory.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.arrayContaining([['quantity', 'ASC']])
        })
      );
    });

    it('should return empty array when all stock is sufficient', async () => {
      Inventory.findAll.mockResolvedValue([]);

      const response = await request(app).get('/api/inventory/low-stock');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/inventory/stats - Get Inventory Statistics', () => {
    
    it('should return comprehensive inventory statistics', async () => {
      const mockStats = {
        totalItems: 1500,
        totalValue: 250000,
        lowStockCount: 45,
        outOfStockCount: 12,
        categories: [
          { category: 'Electronics', count: 500 },
          { category: 'Furniture', count: 300 }
        ]
      };

      Inventory.findAll.mockResolvedValue([
        generateMockInventory({ quantity: 100, price: 50 }),
        generateMockInventory({ quantity: 0, price: 100 })
      ]);

      const response = await request(app).get('/api/inventory/stats');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalItems');
      expect(response.body.data).toHaveProperty('totalValue');
      expect(response.body.data).toHaveProperty('lowStockCount');
    });

    it('should calculate inventory turnover', async () => {
      const response = await request(app).get('/api/inventory/stats');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('turnoverRate');
    });

    it('should group by warehouse', async () => {
      const response = await request(app)
        .get('/api/inventory/stats')
        .query({ groupBy: 'warehouse' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('byWarehouse');
    });
  });

  describe('Error Handling', () => {
    
    it('should handle database connection errors', async () => {
      Inventory.findAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/inventory');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed request data', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should validate numeric fields', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .send({
          sku: 'SKU-001',
          name: 'Test',
          quantity: 'not-a-number'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Concurrency Tests', () => {
    
    it('should handle concurrent quantity adjustments', async () => {
      const mockItem = {
        id: '123',
        quantity: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      Inventory.findByPk.mockResolvedValue(mockItem);

      const adjustments = [
        request(app).post('/api/inventory/123/adjust').send({
          adjustment: 10, type: 'increase', reason: 'Test 1'
        }),
        request(app).post('/api/inventory/123/adjust').send({
          adjustment: 5, type: 'decrease', reason: 'Test 2'
        })
      ];

      const results = await Promise.all(adjustments);

      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });
});
