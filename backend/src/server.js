/**
 * Main Server File
 * Entry point for the Pixel Logistics WMS API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize, testConnection } = require('./config/database');
const { connectMongoDB, closeMongoConnection } = require('./config/mongodb');

// Import WMS routes
const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
const inventoryRoutes = require('./routes/inventory.routes');
// const orderRoutes = require('./routes/order.routes');
// const receivingRoutes = require('./routes/receiving.routes');
// const shippingRoutes = require('./routes/shipping.routes');
// const yardRoutes = require('./routes/yard.routes');

// Import TMS routes
const tmsShipmentRoutes = require('./routes/tms/shipment.routes');
const tmsCarrierRoutes = require('./routes/tms/carrier.routes');
const tmsDashboardRoutes = require('./routes/tms/dashboard.routes');
const tmsFleetRoutes = require('./routes/tms/fleet.routes');
const tmsComplianceRoutes = require('./routes/tms/compliance.routes');
const tmsRouteRoutes = require('./routes/tms/route.routes');
const tmsTrackingRoutes = require('./routes/tms/tracking.routes');
const tmsDocumentRoutes = require('./routes/tms/documents.routes');

// Import Integration routes (WMS-TMS Bridge)
const integrationRoutes = require('./routes/integration.routes');

// Import Mobile routes
const mobileDriverRoutes = require('./routes/mobile/driver.routes');

// Import PIS (Insurance Portal) routes
const pisLeadsRoutes = require('./routes/pis/leads.routes');

// Import WebSocket service
const { initializeWebSocket } = require('./services/websocket.service');

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pixel Logistics WMS API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env
  });
});

// API Routes
const API_PREFIX = `/api/${config.server.apiVersion}`;

// WMS Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
// app.use(`${API_PREFIX}/orders`, orderRoutes);
// app.use(`${API_PREFIX}/receiving`, receivingRoutes);
// app.use(`${API_PREFIX}/shipping`, shippingRoutes);
// app.use(`${API_PREFIX}/yard`, yardRoutes);

// TMS Routes
app.use(`${API_PREFIX}/tms/shipments`, tmsShipmentRoutes);
app.use(`${API_PREFIX}/tms/carriers`, tmsCarrierRoutes);
app.use(`${API_PREFIX}/tms/dashboard`, tmsDashboardRoutes);
app.use(`${API_PREFIX}/tms/fleet`, tmsFleetRoutes);
app.use(`${API_PREFIX}/tms/compliance`, tmsComplianceRoutes);
app.use(`${API_PREFIX}/tms/routes`, tmsRouteRoutes);
app.use(`${API_PREFIX}/tms/tracking`, tmsTrackingRoutes);
app.use(`${API_PREFIX}/tms/documents`, tmsDocumentRoutes);

// Integration Routes (WMS-TMS Bridge)
app.use(`${API_PREFIX}/integration`, integrationRoutes);

// Mobile Routes
app.use(`${API_PREFIX}/mobile/driver`, mobileDriverRoutes);

// PIS (Insurance Portal) Routes
app.use(`${API_PREFIX}/pis/leads`, pisLeadsRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred while processing your request'
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Test PostgreSQL connection (for WMS)
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.warn('PostgreSQL not available. WMS features will be unavailable.');
      // Don't exit - continue with TMS only
    }

    // Connect to MongoDB (for TMS)
    const mongoConnected = await connectMongoDB();
    
    if (!mongoConnected) {
      logger.warn('Failed to connect to MongoDB. TMS features will be unavailable.');
    }

    // Sync PostgreSQL database (in development only)
    if (process.env.NODE_ENV === 'development' && dbConnected) {
      await sequelize.sync({ alter: false });
      logger.info('PostgreSQL database synchronized');
    }

    // Start Express server
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Pixel Logistics WMS/TMS API Server started`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${config.server.env}`);
      logger.info(`📦 WMS: PostgreSQL ${dbConnected ? '✅' : '❌ (disabled)'}`);
      logger.info(`🚚 TMS: MongoDB ${mongoConnected ? '✅' : '❌ (disabled)'}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
    });

    // Initialize WebSocket server
    initializeWebSocket(server);
    logger.info(`🔌 WebSocket server initialized on port ${PORT}`);
    logger.info(`📍 Real-time tracking: Active`);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  await closeMongoConnection();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
