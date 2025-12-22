#!/bin/bash

# Indian Gov Q&A - Stop Script
# This script stops both backend and frontend services

set -e

echo "🛑 Stopping Indian Government Q&A System..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Kill processes by PID if files exist
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo -e "${GREEN}✅ Backend stopped (PID: $BACKEND_PID)${NC}" || echo -e "${RED}⚠️  Backend was not running${NC}"
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped (PID: $FRONTEND_PID)${NC}" || echo -e "${RED}⚠️  Frontend was not running${NC}"
    rm .frontend.pid
fi

# Fallback: kill by process name
pkill -f "tsx watch" 2>/dev/null && echo -e "${GREEN}✅ Killed tsx processes${NC}" || true
pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✅ Killed next processes${NC}" || true

# Fallback: kill by port
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Freed port 8000${NC}" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Freed port 3000${NC}" || true

echo ""
echo -e "${GREEN}🎉 All services stopped!${NC}"
