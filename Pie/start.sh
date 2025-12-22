#!/bin/bash

# Indian Gov Q&A - Startup Script
# This script starts both backend and frontend services

set -e

echo "🚀 Starting Indian Government Q&A System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing processes
echo -e "${BLUE}📋 Cleaning up existing processes...${NC}"
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found! Copying from example...${NC}"
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ frontend/.env not found! Copying from example...${NC}"
    cp frontend/.env.example frontend/.env
fi

# Start backend
echo -e "${BLUE}🔧 Starting Backend on port 8000...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Check if backend is running
if ! lsof -ti:8000 > /dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"

# Start frontend
echo -e "${BLUE}🎨 Starting Frontend on port 3000...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! lsof -ti:3000 > /dev/null; then
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo "📍 Access points:"
echo -e "   ${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "   ${BLUE}Backend:${NC}  http://localhost:8000/health"
echo ""
echo "📊 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop services: ./stop.sh"
echo ""

# Save PIDs to file for easy stopping
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "✨ Ready to use! Open http://localhost:3000 in your browser"
