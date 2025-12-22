/**
 * Test Server Startup
 * Debug script to identify server startup issues
 */

require('dotenv').config();

console.log('🔍 Testing server startup...\n');

// Test 1: Environment variables
console.log('✓ Step 1: Loading environment variables');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - PORT:', process.env.PORT || 'not set');
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('');

// Test 2: Load modules
try {
  console.log('✓ Step 2: Loading core modules');
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  console.log('  - Express, CORS, Helmet loaded');
  console.log('');
} catch (error) {
  console.error('✗ Error loading core modules:', error.message);
  process.exit(1);
}

// Test 3: Load config
try {
  console.log('✓ Step 3: Loading configuration');
  const config = require('./src/config/config');
  console.log('  - Config loaded successfully');
  console.log('');
} catch (error) {
  console.error('✗ Error loading config:', error.message);
  process.exit(1);
}

// Test 4: MongoDB connection
async function testMongoDB() {
  try {
    console.log('✓ Step 4: Testing MongoDB connection');
    const { connectMongoDB } = require('./src/config/mongodb');
    await connectMongoDB();
    console.log('  - MongoDB connected successfully');
    console.log('');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Test 5: Load routes
async function testRoutes() {
  try {
    console.log('✓ Step 5: Loading routes');
    
    // TMS routes
    const tmsShipmentRoutes = require('./src/routes/tms/shipment.routes');
    console.log('  - Shipment routes loaded');
    
    const tmsCarrierRoutes = require('./src/routes/tms/carrier.routes');
    console.log('  - Carrier routes loaded');
    
    const tmsDocumentRoutes = require('./src/routes/tms/documents.routes');
    console.log('  - Document routes loaded');
    
    const tmsTrackingRoutes = require('./src/routes/tms/tracking.routes');
    console.log('  - Tracking routes loaded');
    
    console.log('');
  } catch (error) {
    console.error('✗ Error loading routes:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Test 6: Start server
async function testServerStart() {
  try {
    console.log('✓ Step 6: Starting server');
    const app = require('express')();
    const http = require('http');
    
    const server = http.createServer(app);
    const PORT = process.env.PORT || 3000;
    
    server.listen(PORT, () => {
      console.log(`  - Server listening on port ${PORT}`);
      console.log('');
      console.log('✅ All tests passed! Server is ready.');
      console.log('');
      
      // Keep server running
      console.log('Press Ctrl+C to stop');
    });
    
    server.on('error', (error) => {
      console.error('✗ Server error:', error.message);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('✗ Error starting server:', error.message);
    process.exit(1);
  }
}

// Run tests sequentially
async function runTests() {
  await testMongoDB();
  await testRoutes();
  await testServerStart();
}

runTests().catch((error) => {
  console.error('✗ Test failed:', error);
  process.exit(1);
});
