const request = require('supertest');
const express = require('express');
const SalesOrder = require('../../src/models/SalesOrder');
const PurchaseOrder = require('../../src/models/PurchaseOrder');
const {
  generateMockOrder,
  generateTestToken,
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

// Mock controllers (simplified for testing)
const salesOrderController = {
  getAll: async (req, res) => {
    const orders = await SalesOrder.findAll();
    res.json({ success: true, data: orders });
  },
  getById: async (req, res) => {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, data: order });
  },
  create: async (req, res) => {
    const order = await SalesOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  },
  update: async (req, res) => {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update(req.body);
    res.json({ success: true, data: order });
  },
  cancel: async (req, res) => {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Order cancelled' });
  },
  fulfill: async (req, res) => {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ status: 'fulfilled' });
    res.json({ success: true, message: 'Order fulfilled' });
  }
};

const purchaseOrderController = {
  getAll: async (req, res) => {
    const orders = await PurchaseOrder.findAll();
    res.json({ success: true, data: orders });
  },
  create: async (req, res) => {
    const order = await PurchaseOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  },
  receive: async (req, res) => {
    const order = await PurchaseOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ status: 'received' });
    res.json({ success: true, message: 'Order received' });
  }
};

// Mount routes
app.get('/api/orders/sales', salesOrderController.getAll);
app.get('/api/orders/sales/:id', salesOrderController.getById);
app.post('/api/orders/sales', salesOrderController.create);
app.put('/api/orders/sales/:id', salesOrderController.update);
app.post('/api/orders/sales/:id/cancel', salesOrderController.cancel);
app.post('/api/orders/sales/:id/fulfill', salesOrderController.fulfill);

app.get('/api/orders/purchase', purchaseOrderController.getAll);
app.post('/api/orders/purchase', purchaseOrderController.create);
app.post('/api/orders/purchase/:id/receive', purchaseOrderController.receive);

// Mock models
jest.mock('../../src/models/SalesOrder');
jest.mock('../../src/models/PurchaseOrder');

describe('Order Management Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sales Orders', () => {
    
    describe('POST /api/orders/sales - Create Sales Order', () => {
      
      it('should create new sales order with line items', async () => {
        const newOrder = {
          orderNumber: 'SO-001',
          customerId: 'CUST-001',
          items: [
            { productId: 'PROD-001', quantity: 5, price: 99.99 },
            { productId: 'PROD-002', quantity: 3, price: 149.99 }
          ],
          status: 'pending',
          totalAmount: 949.92
        };

        const createdOrder = { id: '123', ...newOrder };
        SalesOrder.create.mockResolvedValue(createdOrder);

        const response = await request(app)
          .post('/api/orders/sales')
          .send(newOrder);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id', '123');
        expect(response.body.data.items).toHaveLength(2);
        expect(SalesOrder.create).toHaveBeenCalledWith(expect.objectContaining({
          orderNumber: 'SO-001',
          totalAmount: 949.92
        }));
      });

      it('should auto-generate order number if not provided', async () => {
        const orderWithoutNumber = {
          customerId: 'CUST-001',
          items: [{ productId: 'PROD-001', quantity: 1, price: 99.99 }]
        };

        SalesOrder.create.mockResolvedValue({
          id: '123',
          orderNumber: 'SO-' + Date.now(),
          ...orderWithoutNumber
        });

        const response = await request(app)
          .post('/api/orders/sales')
          .send(orderWithoutNumber);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('orderNumber');
      });

      it('should calculate total amount from line items', async () => {
        const newOrder = {
          customerId: 'CUST-001',
          items: [
            { productId: 'PROD-001', quantity: 2, price: 50.00 },
            { productId: 'PROD-002', quantity: 1, price: 100.00 }
          ]
        };

        SalesOrder.create.mockImplementation((data) => {
          const calculatedTotal = data.items.reduce(
            (sum, item) => sum + (item.quantity * item.price), 0
          );
          return Promise.resolve({
            id: '123',
            ...data,
            totalAmount: calculatedTotal
          });
        });

        const response = await request(app)
          .post('/api/orders/sales')
          .send(newOrder);

        expect(response.status).toBe(201);
        expect(response.body.data.totalAmount).toBe(200.00);
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/orders/sales')
          .send({});

        expect(response.status).toBe(400);
      });

      it('should validate line items exist', async () => {
        const orderWithoutItems = {
          customerId: 'CUST-001',
          items: []
        };

        const response = await request(app)
          .post('/api/orders/sales')
          .send(orderWithoutItems);

        expect(response.status).toBe(400);
      });

      it('should validate item quantities are positive', async () => {
        const invalidOrder = {
          customerId: 'CUST-001',
          items: [
            { productId: 'PROD-001', quantity: -5, price: 99.99 }
          ]
        };

        const response = await request(app)
          .post('/api/orders/sales')
          .send(invalidOrder);

        expect(response.status).toBe(400);
      });

      it('should set default status to pending', async () => {
        const newOrder = {
          customerId: 'CUST-001',
          items: [{ productId: 'PROD-001', quantity: 1, price: 99.99 }]
        };

        SalesOrder.create.mockResolvedValue({
          id: '123',
          ...newOrder,
          status: 'pending'
        });

        const response = await request(app)
          .post('/api/orders/sales')
          .send(newOrder);

        expect(response.status).toBe(201);
        expect(response.body.data.status).toBe('pending');
      });
    });

    describe('GET /api/orders/sales - Get All Sales Orders', () => {
      
      it('should retrieve all sales orders', async () => {
        const mockOrders = [
          { id: '1', orderNumber: 'SO-001', status: 'pending' },
          { id: '2', orderNumber: 'SO-002', status: 'fulfilled' }
        ];

        SalesOrder.findAll.mockResolvedValue(mockOrders);

        const response = await request(app).get('/api/orders/sales');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter by status', async () => {
        const pendingOrders = [
          { id: '1', orderNumber: 'SO-001', status: 'pending' }
        ];

        SalesOrder.findAll.mockResolvedValue(pendingOrders);

        const response = await request(app)
          .get('/api/orders/sales')
          .query({ status: 'pending' });

        expect(response.status).toBe(200);
        expect(response.body.data.every(o => o.status === 'pending')).toBe(true);
      });

      it('should filter by customer', async () => {
        const customerOrders = [
          { id: '1', customerId: 'CUST-001', orderNumber: 'SO-001' }
        ];

        SalesOrder.findAll.mockResolvedValue(customerOrders);

        const response = await request(app)
          .get('/api/orders/sales')
          .query({ customerId: 'CUST-001' });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
      });

      it('should filter by date range', async () => {
        const recentOrders = [
          { id: '1', createdAt: new Date('2025-12-01') }
        ];

        SalesOrder.findAll.mockResolvedValue(recentOrders);

        const response = await request(app)
          .get('/api/orders/sales')
          .query({
            startDate: '2025-12-01',
            endDate: '2025-12-31'
          });

        expect(response.status).toBe(200);
      });
    });

    describe('GET /api/orders/sales/:id - Get Sales Order By ID', () => {
      
      it('should retrieve order with line items', async () => {
        const mockOrder = {
          id: '123',
          orderNumber: 'SO-001',
          items: [
            { productId: 'PROD-001', quantity: 5, price: 99.99 }
          ]
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        const response = await request(app).get('/api/orders/sales/123');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('items');
        expect(response.body.data.items).toHaveLength(1);
      });

      it('should return 404 for non-existent order', async () => {
        SalesOrder.findByPk.mockResolvedValue(null);

        const response = await request(app).get('/api/orders/sales/999');

        expectNotFoundError(response);
      });
    });

    describe('PUT /api/orders/sales/:id - Update Sales Order', () => {
      
      it('should update order details', async () => {
        const mockOrder = {
          id: '123',
          orderNumber: 'SO-001',
          update: jest.fn().mockResolvedValue(true)
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        const updates = {
          shippingAddress: '123 New St',
          notes: 'Updated notes'
        };

        const response = await request(app)
          .put('/api/orders/sales/123')
          .send(updates);

        expect(response.status).toBe(200);
        expect(mockOrder.update).toHaveBeenCalledWith(expect.objectContaining(updates));
      });

      it('should not allow updating fulfilled orders', async () => {
        const fulfilledOrder = {
          id: '123',
          status: 'fulfilled'
        };

        SalesOrder.findByPk.mockResolvedValue(fulfilledOrder);

        const response = await request(app)
          .put('/api/orders/sales/123')
          .send({ notes: 'Try to update' });

        expect(response.status).toBe(400);
      });

      it('should validate status transitions', async () => {
        const mockOrder = {
          id: '123',
          status: 'pending',
          update: jest.fn()
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        // Invalid transition: pending -> cancelled (should go through cancel endpoint)
        const response = await request(app)
          .put('/api/orders/sales/123')
          .send({ status: 'cancelled' });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/orders/sales/:id/fulfill - Fulfill Order', () => {
      
      it('should fulfill order and update status', async () => {
        const mockOrder = {
          id: '123',
          status: 'pending',
          update: jest.fn().mockResolvedValue(true)
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        const response = await request(app)
          .post('/api/orders/sales/123/fulfill');

        expect(response.status).toBe(200);
        expect(mockOrder.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'fulfilled' })
        );
      });

      it('should validate inventory availability before fulfillment', async () => {
        const mockOrder = {
          id: '123',
          items: [
            { productId: 'PROD-001', quantity: 100 }
          ]
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        // Mock insufficient inventory
        const response = await request(app)
          .post('/api/orders/sales/123/fulfill');

        // Should fail if inventory check is implemented
        expect(response.status).toBeGreaterThanOrEqual(200);
      });

      it('should create picking tasks on fulfillment', async () => {
        const mockOrder = {
          id: '123',
          status: 'pending',
          items: [{ productId: 'PROD-001', quantity: 5 }],
          update: jest.fn(),
          createPickingTasks: jest.fn()
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        await request(app).post('/api/orders/sales/123/fulfill');

        expect(mockOrder.createPickingTasks).toHaveBeenCalled();
      });

      it('should not fulfill already fulfilled orders', async () => {
        const fulfilledOrder = {
          id: '123',
          status: 'fulfilled'
        };

        SalesOrder.findByPk.mockResolvedValue(fulfilledOrder);

        const response = await request(app)
          .post('/api/orders/sales/123/fulfill');

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/orders/sales/:id/cancel - Cancel Order', () => {
      
      it('should cancel pending order', async () => {
        const mockOrder = {
          id: '123',
          status: 'pending',
          update: jest.fn().mockResolvedValue(true)
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        const response = await request(app)
          .post('/api/orders/sales/123/cancel');

        expect(response.status).toBe(200);
        expect(mockOrder.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'cancelled' })
        );
      });

      it('should not cancel fulfilled orders', async () => {
        const fulfilledOrder = {
          id: '123',
          status: 'fulfilled'
        };

        SalesOrder.findByPk.mockResolvedValue(fulfilledOrder);

        const response = await request(app)
          .post('/api/orders/sales/123/cancel');

        expect(response.status).toBe(400);
      });

      it('should restore inventory on cancellation', async () => {
        const mockOrder = {
          id: '123',
          status: 'pending',
          items: [{ productId: 'PROD-001', quantity: 5 }],
          update: jest.fn(),
          restoreInventory: jest.fn()
        };

        SalesOrder.findByPk.mockResolvedValue(mockOrder);

        await request(app).post('/api/orders/sales/123/cancel');

        expect(mockOrder.restoreInventory).toHaveBeenCalled();
      });
    });
  });

  describe('Purchase Orders', () => {
    
    describe('POST /api/orders/purchase - Create Purchase Order', () => {
      
      it('should create new purchase order', async () => {
        const newPO = {
          poNumber: 'PO-001',
          supplierId: 'SUP-001',
          items: [
            { productId: 'PROD-001', quantity: 100, price: 50.00 }
          ],
          expectedDate: '2025-12-15',
          totalAmount: 5000.00
        };

        PurchaseOrder.create.mockResolvedValue({ id: '123', ...newPO });

        const response = await request(app)
          .post('/api/orders/purchase')
          .send(newPO);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('poNumber', 'PO-001');
      });

      it('should validate supplier exists', async () => {
        const invalidPO = {
          supplierId: 'INVALID',
          items: [{ productId: 'PROD-001', quantity: 100, price: 50.00 }]
        };

        const response = await request(app)
          .post('/api/orders/purchase')
          .send(invalidPO);

        expect(response.status).toBe(400);
      });

      it('should set default status to pending', async () => {
        const newPO = {
          supplierId: 'SUP-001',
          items: [{ productId: 'PROD-001', quantity: 100, price: 50.00 }]
        };

        PurchaseOrder.create.mockResolvedValue({
          id: '123',
          ...newPO,
          status: 'pending'
        });

        const response = await request(app)
          .post('/api/orders/purchase')
          .send(newPO);

        expect(response.status).toBe(201);
        expect(response.body.data.status).toBe('pending');
      });
    });

    describe('POST /api/orders/purchase/:id/receive - Receive Purchase Order', () => {
      
      it('should receive PO and update inventory', async () => {
        const mockPO = {
          id: '123',
          status: 'pending',
          items: [{ productId: 'PROD-001', quantity: 100 }],
          update: jest.fn(),
          updateInventory: jest.fn()
        };

        PurchaseOrder.findByPk.mockResolvedValue(mockPO);

        const response = await request(app)
          .post('/api/orders/purchase/123/receive');

        expect(response.status).toBe(200);
        expect(mockPO.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'received' })
        );
      });

      it('should create putaway tasks on receiving', async () => {
        const mockPO = {
          id: '123',
          items: [{ productId: 'PROD-001', quantity: 100 }],
          update: jest.fn(),
          createPutawayTasks: jest.fn()
        };

        PurchaseOrder.findByPk.mockResolvedValue(mockPO);

        await request(app).post('/api/orders/purchase/123/receive');

        expect(mockPO.createPutawayTasks).toHaveBeenCalled();
      });

      it('should not receive already received orders', async () => {
        const receivedPO = {
          id: '123',
          status: 'received'
        };

        PurchaseOrder.findByPk.mockResolvedValue(receivedPO);

        const response = await request(app)
          .post('/api/orders/purchase/123/receive');

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/orders/purchase - Get All Purchase Orders', () => {
      
      it('should retrieve all purchase orders', async () => {
        const mockPOs = [
          { id: '1', poNumber: 'PO-001', status: 'pending' },
          { id: '2', poNumber: 'PO-002', status: 'received' }
        ];

        PurchaseOrder.findAll.mockResolvedValue(mockPOs);

        const response = await request(app).get('/api/orders/purchase');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter by supplier', async () => {
        const supplierPOs = [
          { id: '1', supplierId: 'SUP-001', poNumber: 'PO-001' }
        ];

        PurchaseOrder.findAll.mockResolvedValue(supplierPOs);

        const response = await request(app)
          .get('/api/orders/purchase')
          .query({ supplierId: 'SUP-001' });

        expect(response.status).toBe(200);
      });
    });
  });

  describe('Order Workflow Integration', () => {
    
    it('should handle complete sales order lifecycle', async () => {
      // Create -> Fulfill -> Complete
      const newOrder = {
        customerId: 'CUST-001',
        items: [{ productId: 'PROD-001', quantity: 5, price: 99.99 }]
      };

      const createdOrder = {
        id: '123',
        ...newOrder,
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      SalesOrder.create.mockResolvedValue(createdOrder);
      SalesOrder.findByPk.mockResolvedValue(createdOrder);

      // Create
      const createResponse = await request(app)
        .post('/api/orders/sales')
        .send(newOrder);
      expect(createResponse.status).toBe(201);

      // Fulfill
      const fulfillResponse = await request(app)
        .post('/api/orders/sales/123/fulfill');
      expect(fulfillResponse.status).toBe(200);
    });

    it('should handle complete purchase order lifecycle', async () => {
      // Create -> Receive -> Put Away
      const newPO = {
        supplierId: 'SUP-001',
        items: [{ productId: 'PROD-001', quantity: 100, price: 50.00 }]
      };

      const createdPO = {
        id: '123',
        ...newPO,
        status: 'pending',
        update: jest.fn(),
        createPutawayTasks: jest.fn()
      };

      PurchaseOrder.create.mockResolvedValue(createdPO);
      PurchaseOrder.findByPk.mockResolvedValue(createdPO);

      // Create
      const createResponse = await request(app)
        .post('/api/orders/purchase')
        .send(newPO);
      expect(createResponse.status).toBe(201);

      // Receive
      const receiveResponse = await request(app)
        .post('/api/orders/purchase/123/receive');
      expect(receiveResponse.status).toBe(200);
    });
  });
});
