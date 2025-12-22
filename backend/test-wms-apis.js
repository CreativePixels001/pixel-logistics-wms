/**
 * WMS API Test Server - No Database Required
 * For testing the new backend APIs with mock data
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import new WMS routes
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
    message: 'WMS API Test Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/v1/wms/users',
      quality: '/api/v1/wms/quality',
      yard: '/api/v1/wms/yard',
      vas: '/api/v1/wms/vas',
      reports: '/api/v1/wms/reports'
    }
  });
});

// WMS API Routes (New Modules)
app.use('/api/v1/wms/users', userRoutes);
app.use('/api/v1/wms/quality', qualityRoutes);
app.use('/api/v1/wms/yard', yardRoutes);
app.use('/api/v1/wms/vas', vasRoutes);
app.use('/api/v1/wms/reports', reportsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WMS API Test Server',
    version: '1.0.0',
    documentation: 'See PHASE_13A_BACKEND_API_COMPLETE.md',
    modules: [
      {
        name: 'User Management & Authentication',
        baseUrl: '/api/v1/wms/users',
        endpoints: 9
      },
      {
        name: 'Quality Management',
        baseUrl: '/api/v1/wms/quality',
        endpoints: 9
      },
      {
        name: 'Yard Operations',
        baseUrl: '/api/v1/wms/yard',
        endpoints: 18
      },
      {
        name: 'Value-Added Services',
        baseUrl: '/api/v1/wms/vas',
        endpoints: 17
      },
      {
        name: 'Reports & Analytics',
        baseUrl: '/api/v1/wms/reports',
        endpoints: 15
      }
    ],
    totalEndpoints: 68
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
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

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🧪 WMS API TEST SERVER RUNNING                          ║
║                                                                ║
║        Port: ${PORT}                                              ║
║        Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                                ║
║        📦 Modules Active (Mock Data):                          ║
║           • User Management & Auth - 9 endpoints               ║
║           • Quality Management - 9 endpoints                   ║
║           • Yard Operations - 18 endpoints                     ║
║           • Value-Added Services - 17 endpoints                ║
║           • Reports & Analytics - 15 endpoints                 ║
║                                                                ║
║        Total: 68 endpoints ready for testing                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
  console.log(`\n📍 API Base URL: http://localhost:${PORT}/api/v1/wms/`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Overview: http://localhost:${PORT}/`);
  console.log(`\n✅ Ready for testing!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nSIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
