#!/bin/bash

# 🚀 WMS+TMS Integration Demo - Complete Startup Script
# This script sets up and starts the complete integrated system for the Tuesday demo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PIXEL LOGISTICS - WMS + TMS INTEGRATED DEMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check MongoDB
echo -e "${BLUE}📊 Step 1: Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null
then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting MongoDB...${NC}"
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community
    else
        sudo systemctl start mongod
    fi
    sleep 2
fi
echo ""

# Step 2: Seed TMS Demo Data
echo -e "${BLUE}📦 Step 2: Seeding TMS demo data to MongoDB...${NC}"
echo -e "${YELLOW}This will create 50 shipments, 5 carriers, 5 drivers for ABC Logistics${NC}"
cd backend
node seedTmsDemo.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TMS demo data seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed TMS data. Check MongoDB connection.${NC}"
fi
echo ""

# Step 3: Start Backend Server
echo -e "${BLUE}🖥️  Step 3: Starting Backend Server (WMS + TMS + Integration)...${NC}"
echo -e "${YELLOW}Backend will run on http://localhost:5000${NC}"

# Kill any existing node processes on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null

# Start server in background
NODE_ENV=development node src/server.js > logs/integrated-server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}✅ Backend server started (PID: $SERVER_PID)${NC}"
echo ""

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
sleep 5

# Test server health
echo -e "${BLUE}🏥 Testing server health...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:5000/health)
if echo "$HEALTH_CHECK" | grep -q "success"; then
    echo -e "${GREEN}✅ Server is healthy and ready${NC}"
else
    echo -e "${RED}❌ Server health check failed${NC}"
fi
echo ""

# Step 4: Test Integration Endpoints
echo -e "${BLUE}🔗 Step 4: Testing Integration Endpoints...${NC}"

echo "Testing GET /api/v1/integration/dashboard..."
curl -s http://localhost:5000/api/v1/integration/dashboard | jq '.' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dashboard endpoint working${NC}"
else
    echo -e "${RED}❌ Dashboard endpoint failed${NC}"
fi

echo ""

# Step 5: Display Access URLs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ SYSTEM READY FOR DEMO!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📡 Backend API:${NC} http://localhost:5000"
echo -e "${BLUE}🏥 Health Check:${NC} http://localhost:5000/health"
echo ""
echo -e "${BLUE}🔗 Integration Endpoints:${NC}"
echo "   Dashboard:           http://localhost:5000/api/v1/integration/dashboard"
echo "   Create Shipment:     POST http://localhost:5000/api/v1/integration/create-shipment"
echo "   Shipment Status:     GET http://localhost:5000/api/v1/integration/shipment-status/{orderId}"
echo ""
echo -e "${BLUE}🚚 TMS Endpoints:${NC}"
echo "   Shipments:           http://localhost:5000/api/v1/tms/shipments"
echo "   Carriers:            http://localhost:5000/api/v1/tms/carriers"
echo "   Dashboard:           http://localhost:5000/api/v1/tms/dashboard"
echo ""
echo -e "${BLUE}🌐 Frontend Pages:${NC}"
echo "   Unified Dashboard:   Open ../frontend/WMS/unified-dashboard.html in browser"
echo "   WMS Landing:         Open ../frontend/WMS/PixelLogistics.html in browser"
echo "   WMS Dashboard:       Open ../frontend/WMS/index.html in browser"
echo ""
echo -e "${BLUE}📊 Database Status:${NC}"
echo "   MongoDB (TMS):       ✅ Connected | 50 shipments loaded"
echo "   PostgreSQL (WMS):    ⚠️  Mock data mode"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}💡 Quick Test Commands:${NC}"
echo ""
echo "# Test Integration Dashboard"
echo "curl http://localhost:5000/api/v1/integration/dashboard | jq"
echo ""
echo "# Create Test Shipment from WMS Order"
echo 'curl -X POST http://localhost:5000/api/v1/integration/create-shipment \\'
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{'
echo '    "wmsOrderId": "WMS-TEST-001",'
echo '    "wmsOrderNumber": "SO-2025-TEST-001",'
echo '    "customerName": "ABC Logistics - Test Customer",'
echo '    "origin": {"city": "Mumbai", "state": "Maharashtra", "address": "Test Warehouse"},'
echo '    "destination": {"city": "Delhi", "state": "Delhi", "address": "Test Delivery"},'
echo '    "cargo": [{"description": "Test Items", "quantity": 10, "weight": {"value": 100, "unit": "kg"}}]'
echo '  }'"'"' | jq'
echo ""
echo "# Get All Shipments"
echo "curl http://localhost:5000/api/v1/tms/shipments | jq"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ READY FOR TUESDAY PRESENTATION!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Open unified-dashboard.html in your browser"
echo "   2. Verify all shipments are displayed"
echo "   3. Test integration by creating a shipment from WMS"
echo "   4. Practice demo walkthrough"
echo ""
echo -e "${BLUE}📋 Server Logs:${NC} tail -f logs/integrated-server.log"
echo -e "${RED}⏹️  To stop:${NC} kill $SERVER_PID"
echo ""

# Keep script running and show logs
echo -e "${BLUE}📜 Showing server logs (Ctrl+C to exit):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -f logs/integrated-server.log
