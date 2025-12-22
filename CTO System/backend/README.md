# Pi Command Center - Backend API

Real-time server control and monitoring API for the Pi Command Center dashboard.

## Features

✅ **Server Process Management**
- Start/stop WMS, TMS, EMS, CPX, and Pi servers via API
- Track running processes with PID monitoring
- Capture real-time stdout/stderr logs

✅ **Port Health Checking**
- Verify servers are actually running on configured ports
- Prevent port conflicts before startup
- Real-time port availability detection

✅ **Status Monitoring**
- Individual server status endpoints
- All servers status overview
- Uptime tracking and performance metrics

✅ **Graceful Shutdown**
- SIGTERM for clean server stops
- Automatic cleanup of zombie processes
- Forced SIGKILL fallback if needed

## Quick Start

### 1. Install Dependencies

```bash
cd "CTO System/backend"
npm install
```

### 2. Start the API Server

```bash
npm start
```

The API will run on **http://localhost:4000**

### 3. Open the Dashboard

Open `../Pi-map-grid.html` in your browser and click any system card to control servers.

## API Endpoints

### Start a Server
```http
POST /api/start-server
Content-Type: application/json

{
  "system": "WMS"  // Options: WMS, TMS, EMS, CPX, Pi
}
```

**Response:**
```json
{
  "success": true,
  "message": "Warehouse Management System started successfully",
  "pid": 12345,
  "port": 3001,
  "uptime": 0
}
```

### Stop a Server
```http
POST /api/stop-server
Content-Type: application/json

{
  "system": "WMS"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Warehouse Management System stopped successfully"
}
```

### Get Server Status
```http
GET /api/server-status/:system
```

**Example:** `GET /api/server-status/WMS`

**Response:**
```json
{
  "running": true,
  "pid": 12345,
  "port": 3001,
  "uptime": 3600,
  "startTime": "2025-12-01T10:00:00.000Z",
  "logs": [
    {
      "type": "stdout",
      "message": "Server started on port 3001\n",
      "timestamp": "2025-12-01T10:00:05.000Z"
    }
  ]
}
```

### Get All Servers Status
```http
GET /api/servers-status
```

**Response:**
```json
{
  "WMS": {
    "running": true,
    "pid": 12345,
    "port": 3001,
    "uptime": 3600,
    "name": "Warehouse Management System"
  },
  "TMS": {
    "running": false,
    "port": 3002,
    "name": "Transportation Management System"
  }
  // ... other systems
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T10:00:00.000Z",
  "runningServers": ["WMS", "TMS"]
}
```

## System Configuration

The API manages these systems on the following ports:

| System | Port | Path |
|--------|------|------|
| WMS | 3001 | `../../frontend/WMS` |
| TMS | 3002 | `../../frontend/TMS` |
| EMS | 3003 | `../../frontend/EMS` |
| CPX | 3004 | `../../CPX website` |
| Pi | 3005 | `../../PixelOne/pi-app` |

## How It Works

1. **Process Spawning**: Uses Node.js `child_process.spawn()` to start servers
2. **Port Verification**: Checks if ports are available before starting
3. **Log Capture**: Streams stdout/stderr to API for real-time console output
4. **Process Tracking**: Maintains a Map of running processes with PIDs
5. **Health Checks**: TCP socket connections verify servers are actually listening
6. **Graceful Cleanup**: Handles SIGTERM signals for clean shutdowns

## Frontend Integration

The dashboard at `Pi-map-grid.html` automatically connects to this API:

```javascript
// Start a server
const response = await fetch('http://localhost:4000/api/start-server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: 'WMS' })
});
```

## Development Mode

For auto-restart on code changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes.

## Troubleshooting

### Port 4000 already in use
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9
```

### Cannot start servers
- Ensure each system has `npm start` script in its package.json
- Check that server paths are correct in `server.js`
- Verify ports 3001-3005 are not already in use

### Backend API not available
If the dashboard shows "Backend API not available":
1. Check the API is running: `curl http://localhost:4000/api/health`
2. Restart the API: `npm start`
3. Check CORS is enabled (already configured)

## Next Steps

- [ ] Connect to MongoDB for real database metrics
- [ ] Add authentication for API endpoints
- [ ] Implement WebSocket for live log streaming
- [ ] Add server restart functionality
- [ ] Create deployment scripts for production

## License

MIT - Creative Pixels
