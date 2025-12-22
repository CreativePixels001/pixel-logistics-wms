const request = require('supertest');
const express = require('express');
const PickingTask = require('../../src/models/PickingTask');
const PackingTask = require('../../src/models/PackingTask');
const PutawayTask = require('../../src/models/PutawayTask');
const Shipment = require('../../src/models/Shipment');
const {
  generateTestToken,
  expectSuccessResponse,
  expectNotFoundError,
} = require('../helpers/testUtils');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id', role: 'operator' };
  next();
});

// Mock controllers
const pickingController = {
  getTasks: async (req, res) => {
    const tasks = await PickingTask.findAll({ where: req.query });
    res.json({ success: true, data: tasks });
  },
  createTask: async (req, res) => {
    const task = await PickingTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  },
  completeTask: async (req, res) => {
    const task = await PickingTask.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update({ status: 'completed', completedAt: new Date() });
    res.json({ success: true, data: task });
  }
};

const packingController = {
  getTasks: async (req, res) => {
    const tasks = await PackingTask.findAll({ where: req.query });
    res.json({ success: true, data: tasks });
  },
  createTask: async (req, res) => {
    const task = await PackingTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  },
  completeTask: async (req, res) => {
    const task = await PackingTask.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update({ status: 'completed', completedAt: new Date() });
    res.json({ success: true, data: task });
  }
};

const putawayController = {
  getTasks: async (req, res) => {
    const tasks = await PutawayTask.findAll({ where: req.query });
    res.json({ success: true, data: tasks });
  },
  createTask: async (req, res) => {
    const task = await PutawayTask.create(req.body);
    res.status(201).json({ success: true, data: task });
  },
  completeTask: async (req, res) => {
    const task = await PutawayTask.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.update({ status: 'completed', completedAt: new Date() });
    res.json({ success: true, data: task });
  }
};

const shippingController = {
  getShipments: async (req, res) => {
    const shipments = await Shipment.findAll();
    res.json({ success: true, data: shipments });
  },
  createShipment: async (req, res) => {
    const shipment = await Shipment.create(req.body);
    res.status(201).json({ success: true, data: shipment });
  },
  updateStatus: async (req, res) => {
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    await shipment.update({ status: req.body.status });
    res.json({ success: true, data: shipment });
  }
};

// Mount routes
app.get('/api/picking/tasks', pickingController.getTasks);
app.post('/api/picking/tasks', pickingController.createTask);
app.post('/api/picking/tasks/:id/complete', pickingController.completeTask);

app.get('/api/packing/tasks', packingController.getTasks);
app.post('/api/packing/tasks', packingController.createTask);
app.post('/api/packing/tasks/:id/complete', packingController.completeTask);

app.get('/api/putaway/tasks', putawayController.getTasks);
app.post('/api/putaway/tasks', putawayController.createTask);
app.post('/api/putaway/tasks/:id/complete', putawayController.completeTask);

app.get('/api/shipping/shipments', shippingController.getShipments);
app.post('/api/shipping/shipments', shippingController.createShipment);
app.put('/api/shipping/shipments/:id/status', shippingController.updateStatus);

// Mock models
jest.mock('../../src/models/PickingTask');
jest.mock('../../src/models/PackingTask');
jest.mock('../../src/models/PutawayTask');
jest.mock('../../src/models/Shipment');

describe('Warehouse Operations Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Picking Operations', () => {
    
    describe('POST /api/picking/tasks - Create Picking Task', () => {
      
      it('should create new picking task from sales order', async () => {
        const newTask = {
          orderId: 'SO-001',
          items: [
            {
              productId: 'PROD-001',
              sku: 'SKU-001',
              quantity: 5,
              location: 'A-01-01'
            }
          ],
          priority: 'high',
          assignedTo: 'USER-001'
        };

        const createdTask = {
          id: 'PICK-001',
          ...newTask,
          status: 'pending',
          createdAt: new Date()
        };

        PickingTask.create.mockResolvedValue(createdTask);

        const response = await request(app)
          .post('/api/picking/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id', 'PICK-001');
        expect(response.body.data.status).toBe('pending');
      });

      it('should optimize pick route by location', async () => {
        const newTask = {
          orderId: 'SO-001',
          items: [
            { productId: 'P1', location: 'A-05-03', quantity: 1 },
            { productId: 'P2', location: 'A-01-01', quantity: 1 },
            { productId: 'P3', location: 'A-03-02', quantity: 1 }
          ]
        };

        PickingTask.create.mockImplementation((data) => {
          // Simulate route optimization (sort by location)
          const optimizedItems = [...data.items].sort((a, b) => 
            a.location.localeCompare(b.location)
          );
          return Promise.resolve({
            id: 'PICK-001',
            ...data,
            items: optimizedItems
          });
        });

        const response = await request(app)
          .post('/api/picking/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        // Verify items are sorted: A-01-01, A-03-02, A-05-03
        expect(response.body.data.items[0].location).toBe('A-01-01');
        expect(response.body.data.items[2].location).toBe('A-05-03');
      });

      it('should validate inventory availability', async () => {
        const taskWithUnavailableItem = {
          orderId: 'SO-001',
          items: [
            { productId: 'OUT-OF-STOCK', quantity: 100 }
          ]
        };

        const response = await request(app)
          .post('/api/picking/tasks')
          .send(taskWithUnavailableItem);

        expect(response.status).toBe(400);
      });

      it('should set priority based on order urgency', async () => {
        const urgentTask = {
          orderId: 'SO-URGENT',
          orderType: 'express',
          items: [{ productId: 'PROD-001', quantity: 1 }]
        };

        PickingTask.create.mockResolvedValue({
          id: 'PICK-001',
          ...urgentTask,
          priority: 'high'
        });

        const response = await request(app)
          .post('/api/picking/tasks')
          .send(urgentTask);

        expect(response.status).toBe(201);
        expect(response.body.data.priority).toBe('high');
      });
    });

    describe('GET /api/picking/tasks - Get Picking Tasks', () => {
      
      it('should retrieve all pending picking tasks', async () => {
        const mockTasks = [
          { id: 'PICK-001', status: 'pending', priority: 'high' },
          { id: 'PICK-002', status: 'pending', priority: 'medium' }
        ];

        PickingTask.findAll.mockResolvedValue(mockTasks);

        const response = await request(app)
          .get('/api/picking/tasks')
          .query({ status: 'pending' });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter by assigned user', async () => {
        const userTasks = [
          { id: 'PICK-001', assignedTo: 'USER-001' }
        ];

        PickingTask.findAll.mockResolvedValue(userTasks);

        const response = await request(app)
          .get('/api/picking/tasks')
          .query({ assignedTo: 'USER-001' });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
      });

      it('should sort by priority', async () => {
        const sortedTasks = [
          { id: 'PICK-001', priority: 'high' },
          { id: 'PICK-002', priority: 'medium' },
          { id: 'PICK-003', priority: 'low' }
        ];

        PickingTask.findAll.mockResolvedValue(sortedTasks);

        const response = await request(app)
          .get('/api/picking/tasks')
          .query({ sortBy: 'priority' });

        expect(response.status).toBe(200);
        expect(response.body.data[0].priority).toBe('high');
      });
    });

    describe('POST /api/picking/tasks/:id/complete - Complete Picking Task', () => {
      
      it('should mark task as completed', async () => {
        const mockTask = {
          id: 'PICK-001',
          status: 'in-progress',
          update: jest.fn().mockResolvedValue(true)
        };

        PickingTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/picking/tasks/PICK-001/complete');

        expect(response.status).toBe(200);
        expect(mockTask.update).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'completed',
            completedAt: expect.any(Date)
          })
        );
      });

      it('should create packing task after picking completion', async () => {
        const mockTask = {
          id: 'PICK-001',
          orderId: 'SO-001',
          items: [{ productId: 'PROD-001', quantity: 5 }],
          update: jest.fn(),
          createPackingTask: jest.fn()
        };

        PickingTask.findByPk.mockResolvedValue(mockTask);

        await request(app).post('/api/picking/tasks/PICK-001/complete');

        expect(mockTask.createPackingTask).toHaveBeenCalled();
      });

      it('should update inventory after picking', async () => {
        const mockTask = {
          id: 'PICK-001',
          items: [{ productId: 'PROD-001', quantity: 5, location: 'A-01-01' }],
          update: jest.fn(),
          reserveInventory: jest.fn()
        };

        PickingTask.findByPk.mockResolvedValue(mockTask);

        await request(app).post('/api/picking/tasks/PICK-001/complete');

        expect(mockTask.reserveInventory).toHaveBeenCalled();
      });

      it('should not complete already completed task', async () => {
        const completedTask = {
          id: 'PICK-001',
          status: 'completed'
        };

        PickingTask.findByPk.mockResolvedValue(completedTask);

        const response = await request(app)
          .post('/api/picking/tasks/PICK-001/complete');

        expect(response.status).toBe(400);
      });
    });
  });

  describe('Packing Operations', () => {
    
    describe('POST /api/packing/tasks - Create Packing Task', () => {
      
      it('should create packing task from picking task', async () => {
        const newTask = {
          pickingTaskId: 'PICK-001',
          orderId: 'SO-001',
          items: [
            { productId: 'PROD-001', quantity: 5 }
          ]
        };

        PackingTask.create.mockResolvedValue({
          id: 'PACK-001',
          ...newTask,
          status: 'pending'
        });

        const response = await request(app)
          .post('/api/packing/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id', 'PACK-001');
      });

      it('should suggest optimal packaging', async () => {
        const newTask = {
          orderId: 'SO-001',
          items: [
            { productId: 'PROD-001', dimensions: { l: 10, w: 10, h: 10 }, quantity: 2 }
          ]
        };

        PackingTask.create.mockImplementation((data) => {
          return Promise.resolve({
            id: 'PACK-001',
            ...data,
            suggestedPackaging: {
              type: 'box',
              size: 'medium',
              quantity: 1
            }
          });
        });

        const response = await request(app)
          .post('/api/packing/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('suggestedPackaging');
      });
    });

    describe('POST /api/packing/tasks/:id/complete - Complete Packing Task', () => {
      
      it('should complete packing and create shipment', async () => {
        const mockTask = {
          id: 'PACK-001',
          orderId: 'SO-001',
          status: 'in-progress',
          update: jest.fn(),
          createShipment: jest.fn()
        };

        PackingTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/packing/tasks/PACK-001/complete')
          .send({
            packageDetails: {
              weight: 5.5,
              dimensions: { l: 12, w: 10, h: 8 },
              packageType: 'box'
            }
          });

        expect(response.status).toBe(200);
        expect(mockTask.createShipment).toHaveBeenCalled();
      });

      it('should require package details for completion', async () => {
        const mockTask = {
          id: 'PACK-001',
          status: 'in-progress'
        };

        PackingTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/packing/tasks/PACK-001/complete')
          .send({});

        expect(response.status).toBe(400);
      });

      it('should print shipping label on completion', async () => {
        const mockTask = {
          id: 'PACK-001',
          update: jest.fn(),
          generateShippingLabel: jest.fn().mockResolvedValue({
            trackingNumber: 'TRK-123',
            labelUrl: 'https://example.com/label.pdf'
          })
        };

        PackingTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/packing/tasks/PACK-001/complete')
          .send({
            packageDetails: { weight: 5.5 }
          });

        expect(mockTask.generateShippingLabel).toHaveBeenCalled();
      });
    });
  });

  describe('Putaway Operations', () => {
    
    describe('POST /api/putaway/tasks - Create Putaway Task', () => {
      
      it('should create putaway task from receiving', async () => {
        const newTask = {
          receivingId: 'RCV-001',
          purchaseOrderId: 'PO-001',
          items: [
            {
              productId: 'PROD-001',
              quantity: 100,
              suggestedLocation: 'A-01-01'
            }
          ]
        };

        PutawayTask.create.mockResolvedValue({
          id: 'PUT-001',
          ...newTask,
          status: 'pending'
        });

        const response = await request(app)
          .post('/api/putaway/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id', 'PUT-001');
      });

      it('should suggest optimal storage location', async () => {
        const newTask = {
          items: [
            { productId: 'PROD-001', quantity: 100 }
          ]
        };

        PutawayTask.create.mockImplementation((data) => {
          return Promise.resolve({
            id: 'PUT-001',
            ...data,
            items: data.items.map(item => ({
              ...item,
              suggestedLocation: 'A-01-01', // Zone A, closest to receiving
              reason: 'High turnover item'
            }))
          });
        });

        const response = await request(app)
          .post('/api/putaway/tasks')
          .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.data.items[0]).toHaveProperty('suggestedLocation');
      });

      it('should handle hazardous materials separately', async () => {
        const hazmatTask = {
          items: [
            {
              productId: 'HAZMAT-001',
              quantity: 10,
              isHazardous: true
            }
          ]
        };

        PutawayTask.create.mockResolvedValue({
          id: 'PUT-001',
          ...hazmatTask,
          items: [{
            ...hazmatTask.items[0],
            suggestedLocation: 'H-01-01', // Hazmat zone
            requiresSpecialHandling: true
          }]
        });

        const response = await request(app)
          .post('/api/putaway/tasks')
          .send(hazmatTask);

        expect(response.status).toBe(201);
        expect(response.body.data.items[0].suggestedLocation).toMatch(/^H-/);
      });
    });

    describe('POST /api/putaway/tasks/:id/complete - Complete Putaway Task', () => {
      
      it('should complete putaway and update inventory location', async () => {
        const mockTask = {
          id: 'PUT-001',
          items: [
            {
              productId: 'PROD-001',
              quantity: 100,
              suggestedLocation: 'A-01-01',
              actualLocation: 'A-01-01'
            }
          ],
          update: jest.fn(),
          updateInventoryLocations: jest.fn()
        };

        PutawayTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/putaway/tasks/PUT-001/complete')
          .send({
            actualLocations: [
              { productId: 'PROD-001', location: 'A-01-01' }
            ]
          });

        expect(response.status).toBe(200);
        expect(mockTask.updateInventoryLocations).toHaveBeenCalled();
      });

      it('should allow different location than suggested', async () => {
        const mockTask = {
          id: 'PUT-001',
          items: [
            { productId: 'PROD-001', suggestedLocation: 'A-01-01' }
          ],
          update: jest.fn(),
          updateInventoryLocations: jest.fn()
        };

        PutawayTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/putaway/tasks/PUT-001/complete')
          .send({
            actualLocations: [
              { productId: 'PROD-001', location: 'B-02-03' }
            ]
          });

        expect(response.status).toBe(200);
      });

      it('should validate location capacity', async () => {
        const mockTask = {
          id: 'PUT-001',
          items: [
            { productId: 'PROD-001', quantity: 1000 }
          ]
        };

        PutawayTask.findByPk.mockResolvedValue(mockTask);

        const response = await request(app)
          .post('/api/putaway/tasks/PUT-001/complete')
          .send({
            actualLocations: [
              { productId: 'PROD-001', location: 'SMALL-BIN' }
            ]
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('capacity');
      });
    });
  });

  describe('Shipping Operations', () => {
    
    describe('POST /api/shipping/shipments - Create Shipment', () => {
      
      it('should create shipment from completed packing task', async () => {
        const newShipment = {
          orderId: 'SO-001',
          packingTaskId: 'PACK-001',
          carrier: 'FedEx',
          service: 'Ground',
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
          packageDetails: {
            weight: 5.5,
            dimensions: { l: 12, w: 10, h: 8 }
          }
        };

        Shipment.create.mockResolvedValue({
          id: 'SHIP-001',
          ...newShipment,
          trackingNumber: 'TRK-' + Date.now(),
          status: 'pending'
        });

        const response = await request(app)
          .post('/api/shipping/shipments')
          .send(newShipment);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('trackingNumber');
      });

      it('should calculate shipping cost', async () => {
        const shipment = {
          carrier: 'FedEx',
          service: 'Ground',
          packageDetails: { weight: 5.5 }
        };

        Shipment.create.mockImplementation((data) => {
          return Promise.resolve({
            id: 'SHIP-001',
            ...data,
            estimatedCost: 15.99
          });
        });

        const response = await request(app)
          .post('/api/shipping/shipments')
          .send(shipment);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('estimatedCost');
      });

      it('should validate carrier service availability', async () => {
        const invalidShipment = {
          carrier: 'InvalidCarrier',
          service: 'NonExistentService'
        };

        const response = await request(app)
          .post('/api/shipping/shipments')
          .send(invalidShipment);

        expect(response.status).toBe(400);
      });
    });

    describe('PUT /api/shipping/shipments/:id/status - Update Shipment Status', () => {
      
      it('should update shipment status', async () => {
        const mockShipment = {
          id: 'SHIP-001',
          status: 'pending',
          update: jest.fn().mockResolvedValue(true)
        };

        Shipment.findByPk.mockResolvedValue(mockShipment);

        const response = await request(app)
          .put('/api/shipping/shipments/SHIP-001/status')
          .send({ status: 'in_transit' });

        expect(response.status).toBe(200);
        expect(mockShipment.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'in_transit' })
        );
      });

      it('should track status history', async () => {
        const mockShipment = {
          id: 'SHIP-001',
          statusHistory: [],
          update: jest.fn(),
          addStatusUpdate: jest.fn()
        };

        Shipment.findByPk.mockResolvedValue(mockShipment);

        await request(app)
          .put('/api/shipping/shipments/SHIP-001/status')
          .send({ status: 'delivered' });

        expect(mockShipment.addStatusUpdate).toHaveBeenCalled();
      });

      it('should notify customer on status change', async () => {
        const mockShipment = {
          id: 'SHIP-001',
          customerId: 'CUST-001',
          update: jest.fn(),
          sendNotification: jest.fn()
        };

        Shipment.findByPk.mockResolvedValue(mockShipment);

        await request(app)
          .put('/api/shipping/shipments/SHIP-001/status')
          .send({ status: 'delivered' });

        expect(mockShipment.sendNotification).toHaveBeenCalled();
      });
    });

    describe('GET /api/shipping/shipments - Get All Shipments', () => {
      
      it('should retrieve all shipments', async () => {
        const mockShipments = [
          { id: 'SHIP-001', status: 'pending' },
          { id: 'SHIP-002', status: 'in_transit' }
        ];

        Shipment.findAll.mockResolvedValue(mockShipments);

        const response = await request(app).get('/api/shipping/shipments');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter by status', async () => {
        const inTransitShipments = [
          { id: 'SHIP-001', status: 'in_transit' }
        ];

        Shipment.findAll.mockResolvedValue(inTransitShipments);

        const response = await request(app)
          .get('/api/shipping/shipments')
          .query({ status: 'in_transit' });

        expect(response.status).toBe(200);
        expect(response.body.data.every(s => s.status === 'in_transit')).toBe(true);
      });
    });
  });

  describe('Warehouse Workflow Integration Tests', () => {
    
    it('should handle complete inbound workflow: Receive -> Putaway', async () => {
      // Create putaway task
      const putawayTask = {
        receivingId: 'RCV-001',
        items: [{ productId: 'PROD-001', quantity: 100 }]
      };

      PutawayTask.create.mockResolvedValue({
        id: 'PUT-001',
        ...putawayTask,
        status: 'pending',
        update: jest.fn(),
        updateInventoryLocations: jest.fn()
      });

      const createResponse = await request(app)
        .post('/api/putaway/tasks')
        .send(putawayTask);
      expect(createResponse.status).toBe(201);

      // Complete putaway
      PutawayTask.findByPk.mockResolvedValue(createResponse.body.data);

      const completeResponse = await request(app)
        .post('/api/putaway/tasks/PUT-001/complete')
        .send({
          actualLocations: [{ productId: 'PROD-001', location: 'A-01-01' }]
        });
      expect(completeResponse.status).toBe(200);
    });

    it('should handle complete outbound workflow: Pick -> Pack -> Ship', async () => {
      // Create picking task
      const pickingTask = {
        orderId: 'SO-001',
        items: [{ productId: 'PROD-001', quantity: 5, location: 'A-01-01' }]
      };

      PickingTask.create.mockResolvedValue({
        id: 'PICK-001',
        ...pickingTask,
        status: 'pending',
        update: jest.fn(),
        createPackingTask: jest.fn()
      });

      const pickResponse = await request(app)
        .post('/api/picking/tasks')
        .send(pickingTask);
      expect(pickResponse.status).toBe(201);

      // Complete picking
      PickingTask.findByPk.mockResolvedValue(pickResponse.body.data);

      const completePickResponse = await request(app)
        .post('/api/picking/tasks/PICK-001/complete');
      expect(completePickResponse.status).toBe(200);

      // Create packing task
      const packingTask = {
        pickingTaskId: 'PICK-001',
        orderId: 'SO-001',
        items: [{ productId: 'PROD-001', quantity: 5 }]
      };

      PackingTask.create.mockResolvedValue({
        id: 'PACK-001',
        ...packingTask,
        status: 'pending',
        update: jest.fn(),
        createShipment: jest.fn()
      });

      const packResponse = await request(app)
        .post('/api/packing/tasks')
        .send(packingTask);
      expect(packResponse.status).toBe(201);

      // Complete packing
      PackingTask.findByPk.mockResolvedValue(packResponse.body.data);

      const completePackResponse = await request(app)
        .post('/api/packing/tasks/PACK-001/complete')
        .send({
          packageDetails: { weight: 5.5, dimensions: { l: 12, w: 10, h: 8 } }
        });
      expect(completePackResponse.status).toBe(200);

      // Create shipment
      const shipment = {
        orderId: 'SO-001',
        packingTaskId: 'PACK-001',
        carrier: 'FedEx'
      };

      Shipment.create.mockResolvedValue({
        id: 'SHIP-001',
        ...shipment,
        trackingNumber: 'TRK-123',
        status: 'pending'
      });

      const shipResponse = await request(app)
        .post('/api/shipping/shipments')
        .send(shipment);
      expect(shipResponse.status).toBe(201);
    });
  });

  describe('Performance and Concurrency Tests', () => {
    
    it('should handle multiple concurrent picking tasks', async () => {
      PickingTask.create.mockImplementation((data) => 
        Promise.resolve({ id: 'PICK-' + Date.now(), ...data })
      );

      const tasks = Array(10).fill(null).map((_, i) => 
        request(app).post('/api/picking/tasks').send({
          orderId: `SO-${i}`,
          items: [{ productId: 'PROD-001', quantity: 1 }]
        })
      );

      const results = await Promise.all(tasks);

      results.forEach(result => {
        expect(result.status).toBe(201);
      });
    });

    it('should prevent race conditions in inventory updates', async () => {
      const mockTask = {
        id: 'PICK-001',
        items: [{ productId: 'PROD-001', quantity: 5 }],
        update: jest.fn(),
        reserveInventory: jest.fn()
      };

      PickingTask.findByPk.mockResolvedValue(mockTask);

      const completions = [
        request(app).post('/api/picking/tasks/PICK-001/complete'),
        request(app).post('/api/picking/tasks/PICK-001/complete')
      ];

      const results = await Promise.all(completions);

      // Only one should succeed
      const successCount = results.filter(r => r.status === 200).length;
      const errorCount = results.filter(r => r.status === 400).length;

      expect(successCount).toBe(1);
      expect(errorCount).toBe(1);
    });
  });
});
