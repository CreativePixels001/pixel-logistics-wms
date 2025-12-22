# Pi Assistant - Stable Development Environment

## 🎯 Problem Solved

This setup eliminates common development issues:
- ✅ **Port conflicts** - Smart port detection and allocation
- ✅ **Process hanging** - Proper cleanup and shutdown
- ✅ **VS Code instability** - Dedicated workspace configuration  
- ✅ **Manual process management** - Automated orchestration
- ✅ **Resource leaks** - Intelligent process monitoring

## 🚀 Quick Start

### Method 1: Smart Development (Recommended)
```bash
npm run start
```
This automatically:
- Cleans up any existing processes
- Finds available ports intelligently
- Starts backend and frontend with proper orchestration
- Monitors processes with automatic restart

### Method 2: PM2 Production Mode
```bash
npm run server:pm2    # Start with PM2 process manager
npm run status        # Check status
npm run logs          # View logs
npm run stop          # Stop all
npm run restart       # Restart all
```

### Method 3: Manual Control
```bash
npm run cleanup       # Clean processes first
npm run server        # Backend only
npm run dev:old       # Frontend only (in another terminal)
```

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm run start` | **Main command** - Clean + smart dev server |
| `npm run dev` | Smart development with process management |
| `npm run cleanup` | Kill all related processes and free ports |
| `npm run server` | Start backend server only |
| `npm run server:pm2` | Start with PM2 (production-grade) |
| `npm run status` | Show PM2 process status |
| `npm run logs` | View PM2 logs in real-time |
| `npm run stop` | Stop PM2 processes |
| `npm run restart` | Restart PM2 processes |

## 🛠️ VS Code Integration

### Tasks Available (Ctrl+Shift+P → "Tasks: Run Task")
- **Start Development Environment** - Default build task
- **Stop All Processes** - Emergency cleanup
- **Start Backend Only** - Server debugging
- **Start Frontend Only** - UI development
- **Start with PM2** - Production testing
- **View PM2 Status** - Process monitoring
- **View PM2 Logs** - Real-time logging

### Debug Configurations (F5)
- **Debug Backend Server** - Full backend debugging
- **Debug Development Scripts** - Script troubleshooting
- **Debug Full Stack** - Complete application debugging

## 📁 Project Structure

```
Pi/
├── scripts/
│   ├── dev.js          # Smart development orchestrator
│   └── cleanup.js      # Process cleanup utility
├── .vscode/
│   ├── settings.json   # Workspace settings
│   ├── tasks.json      # Build tasks
│   └── launch.json     # Debug configurations
├── logs/               # PM2 log files
├── ecosystem.config.js # PM2 configuration
└── package.json        # Updated scripts
```

## 🔧 Features

### Smart Port Management
- Automatically detects port conflicts
- Finds available ports (5174-5184 range)
- Updates Vite configuration dynamically
- Prevents multiple instances on same port

### Process Orchestration
- Graceful startup sequence (cleanup → backend → frontend)
- Proper shutdown handling (SIGINT, SIGTERM)
- Process monitoring and auto-restart
- Memory and resource management

### Development Workflow
- One command starts everything
- No manual process killing needed
- VS Code tasks integration
- Real-time logging and monitoring

### Production Ready
- PM2 process manager integration
- Log rotation and management
- Health check endpoints
- Environment configuration

## 🚨 Troubleshooting

### If ports are still conflicted:
```bash
npm run cleanup
# Wait 5 seconds
npm run start
```

### If PM2 has issues:
```bash
pm2 kill            # Nuclear option
npm run cleanup     # Clean our processes
npm run start       # Restart fresh
```

### Emergency reset:
```bash
pkill -f "node"     # Kill all Node.js processes (careful!)
npm run start       # Start fresh
```

### Check what's running:
```bash
npm run status      # PM2 status
lsof -i :3001       # Check backend port
lsof -i :5174       # Check frontend port
```

## 🌟 Development Experience

### What You Get:
- 🔄 **Automatic restart** on crashes
- 📊 **Real-time monitoring** via PM2
- 🎯 **Intelligent port allocation** 
- 🧹 **Automatic cleanup** on exit
- 📝 **Structured logging** with timestamps
- 🛡️ **Error handling** and recovery
- ⚡ **Fast startup** with parallel processing

### Never Again:
- ❌ "Port already in use" errors
- ❌ Hanging processes after closing VS Code
- ❌ Manual process management
- ❌ "Works on my machine" issues
- ❌ Development environment conflicts

## 🎉 Success Indicators

When everything works:
```
[12:34:56] [DEV] Pi Assistant - Smart Development Server
[12:34:57] [CLEANUP] Cleanup completed
[12:34:58] [DEV] Server will use port: 3001
[12:34:59] [DEV] Frontend will use port: 5174
[12:35:00] [SERVER] Backend server is ready
[12:35:03] [FRONTEND] Local: http://localhost:5174
[12:35:04] [DEV] 🎉 Development servers are running!
[12:35:05] [DEV] 📱 Frontend: http://localhost:5174
[12:35:06] [DEV] 🔧 Backend: http://localhost:3001
```

Press **Ctrl+C** to stop all servers gracefully.

---

**This is a permanent solution. No more development environment issues!** 🎯