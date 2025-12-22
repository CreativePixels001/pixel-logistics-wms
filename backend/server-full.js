/**
 * Full-Stack Server - PIS + WMS
 * Complete server with Insurance and Warehouse Management modules
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectMongoDB, closeMongoConnection } = require('./src/config/mongodb');
const logger = require('./src/config/logger');

// Import PIS routes
const pisLeadsRoutes = require('./src/routes/pis/leads.routes');
const pisClientsRoutes = require('./src/routes/pis/clients.routes');
const pisPoliciesRoutes = require('./src/routes/pis/policies.routes');
const pisClaimsRoutes = require('./src/routes/pis/claims.routes');
const pisDealsRoutes = require('./src/routes/pis/deals.routes');
const pisRenewalsRoutes = require('./src/routes/pis/renewals.routes');
const pisReportsRoutes = require('./src/routes/pis/reports.routes');
const pisAgentsRoutes = require('./src/routes/pis/agents.routes');
const pisQuotesRoutes = require('./src/routes/pis/quotes.routes');
const pisPaymentsRoutes = require('./src/routes/pis/payments.routes');

// Import WMS routes
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const receivingRoutes = require('./routes/receivingRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const pickingRoutes = require('./routes/pickingRoutes');
const packingRoutes = require('./routes/packingRoutes');
const putawayRoutes = require('./routes/putawayRoutes');
const userRoutes = require('./routes/userRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const yardRoutes = require('./routes/yardRoutes');
const vasRoutes = require('./routes/vasRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Full-Stack API Server (PIS + WMS) is running',
    modules: {
      pis: 'Insurance Management System',
      wms: 'Warehouse Management System'
    },
    timestamp: new Date().toISOString()
  });
});

// PIS Routes
app.use('/api/v1/pis/leads', pisLeadsRoutes);
app.use('/api/v1/pis/clients', pisClientsRoutes);
app.use('/api/v1/pis/policies', pisPoliciesRoutes);
app.use('/api/v1/pis/claims', pisClaimsRoutes);
app.use('/api/v1/pis/deals', pisDealsRoutes);
app.use('/api/v1/pis/renewals', pisRenewalsRoutes);
app.use('/api/v1/pis/reports', pisReportsRoutes);
app.use('/api/v1/pis/agents', pisAgentsRoutes);
app.use('/api/v1/pis/quotes', pisQuotesRoutes);
app.use('/api/v1/pis/payments', pisPaymentsRoutes);

// WMS API Routes
app.use('/api/v1/wms/products', productRoutes);
app.use('/api/v1/wms/inventory', inventoryRoutes);
app.use('/api/v1/wms/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/wms/sales-orders', salesOrderRoutes);
app.use('/api/v1/wms/receiving', receivingRoutes);
app.use('/api/v1/wms/shipping', shippingRoutes);
app.use('/api/v1/wms/warehouse', warehouseRoutes);
app.use('/api/v1/wms/picking', pickingRoutes);
app.use('/api/v1/wms/packing', packingRoutes);
app.use('/api/v1/wms/putaway', putawayRoutes);
app.use('/api/v1/wms/users', userRoutes);
app.use('/api/v1/wms/quality', qualityRoutes);
app.use('/api/v1/wms/yard', yardRoutes);
app.use('/api/v1/wms/vas', vasRoutes);
app.use('/api/v1/wms/reports', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    logger.info('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 FULL-STACK API SERVER RUNNING                        ║
║                                                                ║
║        Port: ${PORT}                                              ║
║        Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                                ║
║        📦 Modules Active:                                      ║
║           • PIS (Insurance) - 10 endpoints                     ║
║           • WMS (Warehouse) - Products API                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
      
      console.log(`\n📍 API Base URLs:`);
      console.log(`   PIS: http://localhost:${PORT}/api/v1/pis/`);
      console.log(`   WMS: http://localhost:${PORT}/api/v1/wms/`);
      console.log(`\n🔍 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await closeMongoConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await closeMongoConnection();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = app;
