#!/bin/bash

# Pi Command Center - Quick Start Script
# Starts the backend API and opens the dashboard

echo "🚀 Starting Pi Command Center..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to script directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

# Check if API is already running
if lsof -ti:4000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  API server already running on port 4000${NC}"
    echo "Restarting..."
    kill -9 $(lsof -ti:4000)
    sleep 1
fi

# Start the backend API
echo -e "${BLUE}🔧 Starting backend API on port 4000...${NC}"
cd backend
node server.js &
API_PID=$!
cd ..

# Wait for API to start
sleep 2

# Check if API started successfully
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API running (PID: $API_PID)${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Pi Command Center is ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "📊 API Server: http://localhost:4000"
    echo "🎛️  Dashboard: Open Pi-map-grid.html in browser"
    echo ""
    echo "Available API endpoints:"
    echo "  • GET  /api/health"
    echo "  • GET  /api/servers-status"
    echo "  • GET  /api/server-status/:system"
    echo "  • POST /api/start-server"
    echo "  • POST /api/stop-server"
    echo ""
    echo "To stop the API server:"
    echo "  kill $API_PID"
    echo ""
    
    # Open dashboard in default browser
    echo -e "${BLUE}🌐 Opening dashboard in browser...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "Pi-map-grid.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "Pi-map-grid.html"
    else
        echo "Please open Pi-map-grid.html manually in your browser"
    fi
    
else
    echo -e "${YELLOW}⚠️  Failed to start API server${NC}"
    echo "Check backend/server.js for errors"
    kill $API_PID 2>/dev/null
    exit 1
fi
