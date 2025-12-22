const express = require('express');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const path = require('path');
const net = require('net');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Store running server processes
const runningServers = new Map();

// System configurations
const SYSTEMS = {
  WMS: {
    name: 'Warehouse Management System',
    path: path.join(__dirname, '../../frontend/WMS'),
    port: 3001,
    startCommand: 'npm',
    startArgs: ['start']
  },
  TMS: {
    name: 'Transportation Management System',
    path: path.join(__dirname, '../../frontend/TMS'),
    port: 3002,
    startCommand: 'npm',
    startArgs: ['start']
  },
  EMS: {
    name: 'E-commerce Management System',
    path: path.join(__dirname, '../../frontend/EMS'),
    port: 3003,
    startCommand: 'npm',
    startArgs: ['start']
  },
  CPX: {
    name: 'Creative Pixels Platform',
    path: path.join(__dirname, '../../CPX website'),
    port: 3004,
    startCommand: 'npm',
    startArgs: ['start']
  },
  Pi: {
    name: 'PixelOne AI Assistant',
    path: path.join(__dirname, '../../PixelOne/pi-app'),
    port: 3005,
    startCommand: 'npm',
    startArgs: ['start']
  }
};

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Port is in use
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false); // Port is not in use
    });
    
    socket.on('error', () => {
      resolve(false); // Port is not in use
    });
    
    socket.connect(port, 'localhost');
  });
}

// Start a server
app.post('/api/start-server', async (req, res) => {
  const { system } = req.body;
  
  if (!SYSTEMS[system]) {
    return res.status(400).json({ error: 'Invalid system name' });
  }
  
  // Check if already running
  if (runningServers.has(system)) {
    return res.status(400).json({ error: 'Server already running' });
  }
  
  const config = SYSTEMS[system];
  
  try {
    // Check if port is already in use
    const portInUse = await checkPort(config.port);
    if (portInUse) {
      return res.status(400).json({ 
        error: `Port ${config.port} is already in use. Another process may be running.` 
      });
    }
    
    // Spawn the server process
    const serverProcess = spawn(config.startCommand, config.startArgs, {
      cwd: config.path,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Store the process
    runningServers.set(system, {
      process: serverProcess,
      pid: serverProcess.pid,
      startTime: new Date(),
      logs: []
    });
    
    // Capture stdout
    serverProcess.stdout.on('data', (data) => {
      const log = data.toString();
      const serverData = runningServers.get(system);
      if (serverData) {
        serverData.logs.push({
          type: 'stdout',
          message: log,
          timestamp: new Date()
        });
        // Keep only last 100 logs
        if (serverData.logs.length > 100) {
          serverData.logs.shift();
        }
      }
    });
    
    // Capture stderr
    serverProcess.stderr.on('data', (data) => {
      const log = data.toString();
      const serverData = runningServers.get(system);
      if (serverData) {
        serverData.logs.push({
          type: 'stderr',
          message: log,
          timestamp: new Date()
        });
        if (serverData.logs.length > 100) {
          serverData.logs.shift();
        }
      }
    });
    
    // Handle process exit
    serverProcess.on('exit', (code) => {
      console.log(`${system} server exited with code ${code}`);
      runningServers.delete(system);
    });
    
    // Wait a moment to see if server starts successfully
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify server is actually running on the port
    const isRunning = await checkPort(config.port);
    
    if (!isRunning) {
      // Server failed to start
      serverProcess.kill();
      runningServers.delete(system);
      return res.status(500).json({ 
        error: 'Server failed to start. Check logs for details.' 
      });
    }
    
    res.json({
      success: true,
      message: `${config.name} started successfully`,
      pid: serverProcess.pid,
      port: config.port,
      uptime: 0
    });
    
  } catch (error) {
    console.error(`Error starting ${system}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Stop a server
app.post('/api/stop-server', async (req, res) => {
  const { system } = req.body;
  
  if (!SYSTEMS[system]) {
    return res.status(400).json({ error: 'Invalid system name' });
  }
  
  const serverData = runningServers.get(system);
  
  if (!serverData) {
    return res.status(400).json({ error: 'Server is not running' });
  }
  
  try {
    // Gracefully kill the process
    serverData.process.kill('SIGTERM');
    
    // Wait for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force kill if still running
    if (!serverData.process.killed) {
      serverData.process.kill('SIGKILL');
    }
    
    runningServers.delete(system);
    
    res.json({
      success: true,
      message: `${SYSTEMS[system].name} stopped successfully`
    });
    
  } catch (error) {
    console.error(`Error stopping ${system}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get server status
app.get('/api/server-status/:system', async (req, res) => {
  const { system } = req.params;
  
  if (!SYSTEMS[system]) {
    return res.status(400).json({ error: 'Invalid system name' });
  }
  
  const config = SYSTEMS[system];
  const serverData = runningServers.get(system);
  const isPortActive = await checkPort(config.port);
  
  if (serverData && isPortActive) {
    const uptime = Math.floor((new Date() - serverData.startTime) / 1000);
    
    res.json({
      running: true,
      pid: serverData.pid,
      port: config.port,
      uptime: uptime,
      startTime: serverData.startTime,
      logs: serverData.logs.slice(-20) // Last 20 logs
    });
  } else {
    res.json({
      running: false,
      port: config.port
    });
  }
});

// Get all servers status
app.get('/api/servers-status', async (req, res) => {
  const statuses = {};
  
  for (const [systemKey, config] of Object.entries(SYSTEMS)) {
    const serverData = runningServers.get(systemKey);
    const isPortActive = await checkPort(config.port);
    
    if (serverData && isPortActive) {
      const uptime = Math.floor((new Date() - serverData.startTime) / 1000);
      statuses[systemKey] = {
        running: true,
        pid: serverData.pid,
        port: config.port,
        uptime: uptime,
        name: config.name
      };
    } else {
      statuses[systemKey] = {
        running: false,
        port: config.port,
        name: config.name
      };
    }
  }
  
  res.json(statuses);
});

// Get database metrics for a system
app.get('/api/db-metrics/:system', async (req, res) => {
  const { system } = req.params;
  
  try {
    // For now, return simulated data
    // TODO: Connect to actual MongoDB and fetch real counts
    
    const metrics = {
      WMS: {
        orders: 0,
        products: 0,
        warehouses: 0,
        lastUpdated: new Date()
      },
      TMS: {
        shipments: 0,
        vehicles: 0,
        drivers: 0,
        lastUpdated: new Date()
      },
      EMS: {
        products: 0,
        platforms: 3,
        orders: 0,
        lastUpdated: new Date()
      },
      CPX: {
        visitors: 0,
        conversionRate: 0,
        avgSession: 0,
        lastUpdated: new Date()
      },
      Pi: {
        users: 0,
        chatSessions: 0,
        avgResponseTime: 0,
        lastUpdated: new Date()
      }
    };
    
    if (!metrics[system]) {
      return res.status(400).json({ error: 'Invalid system name' });
    }
    
    res.json(metrics[system]);
    
  } catch (error) {
    console.error(`Error fetching metrics for ${system}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    runningServers: Array.from(runningServers.keys())
  });
});

// Start the API server
app.listen(PORT, () => {
  console.log(`🚀 Pi Command Center API running on http://localhost:${PORT}`);
  console.log(`📊 Available systems: ${Object.keys(SYSTEMS).join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Stop all running servers
  for (const [system, data] of runningServers.entries()) {
    console.log(`Stopping ${system}...`);
    data.process.kill('SIGTERM');
  }
  
  process.exit(0);
});
