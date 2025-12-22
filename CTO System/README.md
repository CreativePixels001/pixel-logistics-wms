# Pi Command Center - Setup & Usage Guide

Welcome to the **Pi Command Center** - your unified control panel for managing all Pixel Ecosystem systems.

## 🎯 What's New

We've implemented **real backend integration**! The dashboard now actually controls your servers instead of just simulating them.

### ✅ Completed Features

1. **Backend API Server** (`backend/server.js`)
   - Node.js + Express server on port 4000
   - Real server process management using `child_process.spawn()`
   - Port health checking to verify servers are running
   - Live log capture from stdout/stderr
   - PID tracking and process monitoring

2. **Frontend Integration** (`Pi-map-grid.html`)
   - Real API calls instead of setTimeout simulations
   - Error handling for when API is unavailable
   - Live server status updates
   - Console shows actual server logs

3. **Smart Status Management**
   - All servers start as "Offline" (red status)
   - Stats show 0/NA when servers are stopped
   - When you click "Start Server", it ACTUALLY starts the server
   - Stats populate with real data when running
   - Port verification ensures servers are truly online

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)

```bash
cd "CTO System"
./start.sh
```

This will:
- Install backend dependencies if needed
- Start the API server on port 4000
- Open the dashboard in your browser
- Show you the API PID for later shutdown

### Option 2: Manual Setup

**Step 1: Start the Backend API**
```bash
cd "CTO System/backend"
npm install  # First time only
npm start
```

You should see:
```
🚀 Pi Command Center API running on http://localhost:4000
📊 Available systems: WMS, TMS, EMS, CPX, Pi
```

**Step 2: Open the Dashboard**
- Open `CTO System/Pi-map-grid.html` in your browser
- Click any system card (WMS, TMS, EMS, CPX, or Pi)
- Click "Start Server" to launch the system
- Watch the live console output!

## 📋 How It Works

### System Architecture

```
Dashboard (Pi-map-grid.html)
    ↓ HTTP API Calls
Backend API (port 4000)
    ↓ spawn() processes
Actual Servers (ports 3001-3005)
```

### Workflow: Starting WMS

1. Click WMS card → overlay opens
2. Click "Start Server" button
3. Frontend: `POST /api/start-server { system: "WMS" }`
4. Backend checks port 3001 availability
5. Backend: `spawn('npm', ['start'])`
6. Backend verifies port 3001 is listening
7. Frontend updates to "Online"
8. Stats populate with real data

## 🎛️ Using the Dashboard

### Card Status
- **● Offline** (red) - Not running
- **● Online** (green) - Running & verified
- **● Unknown** (yellow) - Connection issues

### Detail Overlay
- **Server Status** - Running/Stopped indicator
- **Live Console** - Real logs from process
- **Dynamic Stats** - 0/NA offline, real data online
- **Server Info** - Version, uptime, connections
- **Controls** - Start/Stop/Open System

## 📊 System Ports

| System | Port | Location |
|--------|------|----------|
| API Server | 4000 | `CTO System/backend` |
| WMS | 3001 | `frontend/WMS` |
| TMS | 3002 | `frontend/TMS` |
| EMS | 3003 | `frontend/EMS` |
| CPX | 3004 | `CPX website` |
| Pi AI | 3005 | `PixelOne/pi-app` |

## ⚠️ Troubleshooting

### "Backend API not available"
```bash
cd "CTO System/backend"
npm start
```

### "Port already in use"
```bash
lsof -ti:4000 | xargs kill -9
```

### "Server failed to start"
- Check system has `package.json` with start script
- Verify dependencies installed: `npm install`
- Check port not in use: `lsof -ti:3001`

## 🔍 Testing

```bash
# Test API health
curl http://localhost:4000/api/health

# Check all servers
curl http://localhost:4000/api/servers-status

# Start WMS
curl -X POST http://localhost:4000/api/start-server \
  -H "Content-Type: application/json" \
  -d '{"system":"WMS"}'

# Stop WMS
curl -X POST http://localhost:4000/api/stop-server \
  -H "Content-Type: application/json" \
  -d '{"system":"WMS"}'
```

## 📈 What's Next

### Phase 1: Real Database Metrics
- [ ] Connect to MongoDB
- [ ] Fetch actual order/product counts
- [ ] Show live revenue numbers

### Phase 2: Enhanced Monitoring
- [ ] WebSocket live log streaming
- [ ] CPU/memory usage tracking
- [ ] Alert system for errors

### Phase 3: Advanced Features
- [ ] Server restart functionality
- [ ] Database backup/restore
- [ ] Cache clearing
- [ ] Log file viewer

## 🎉 Success Indicators

✅ API responds to health check  
✅ Cards show "Offline" by default  
✅ "Start Server" shows live output  
✅ Status changes to "Online"  
✅ Stats populate with numbers  
✅ Can verify: `lsof -ti:3001`  
✅ "Stop Server" resets to "Offline"  

## 📚 Documentation

- **Backend API**: `backend/README.md`
- **Frontend**: `Pi-map-grid.html`
- **Startup**: `start.sh`

---

**Ready? Run:** `./start.sh` 🚀

*Last Updated: December 1, 2025*
