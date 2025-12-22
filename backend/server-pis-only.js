/**
 * PIS-Only Server (Insurance Portal)
 * Lightweight server for PIS development without PostgreSQL dependency
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
    message: 'PIS API Server is running',
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoConnected = await connectMongoDB();
    
    if (!mongoConnected) {
      logger.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 PIS API Server started on port ${PORT}`);
      logger.info(`📊 MongoDB: ✅ Connected`);
      logger.info(`💚 Health: http://localhost:${PORT}/health`);
      logger.info(`📝 Leads API: http://localhost:${PORT}/api/v1/pis/leads`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await closeMongoConnection();
  process.exit(0);
});

startServer();
