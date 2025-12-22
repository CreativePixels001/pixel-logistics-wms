/**
 * WMS-Only Server - Warehouse Management System
 * Simplified server with only WMS routes for testing
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

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
    message: 'WMS API Server is running',
    timestamp: new Date().toISOString()
  });
});

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server WITH MongoDB connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixel-logistics';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 WMS API SERVER RUNNING                               ║
║                                                                ║
║        Port: ${PORT}                                              ║
║        Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                                ║
║        📦 WMS Modules Active: 10                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
      console.log(`\n📍 API Base URL: http://localhost:${PORT}/api/v1/wms/`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
