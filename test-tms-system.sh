#!/bin/bash

# TMS System Test Script
# Tests all API endpoints and frontend integration

echo "🧪 Testing Pixel Logistics TMS System"
echo "======================================"
echo ""

API_BASE="http://localhost:3000/api/v1"
FRONTEND_BASE="http://localhost:8080"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $response)"
        ((TESTS_FAILED++))
    fi
}

# Function to test JSON endpoint
test_json_endpoint() {
    local name=$1
    local url=$2
    
    echo "Testing $name..."
    response=$(curl -s "$url")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC} - Valid JSON response"
        echo "$response" | jq -C . | head -20
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} - Invalid JSON response"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo "📡 Backend API Tests"
echo "--------------------"

# Health check
test_endpoint "Health Check" "$API_BASE/../health"

# TMS Dashboard
test_json_endpoint "Dashboard Stats" "$API_BASE/tms/dashboard/stats"

# TMS Shipments
echo "Testing Shipments API..."
response=$(curl -s "$API_BASE/tms/shipments")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    echo -e "${GREEN}✓ PASSED${NC} - Retrieved $count shipments"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# TMS Carriers
echo "Testing Carriers API..."
response=$(curl -s "$API_BASE/tms/carriers")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    echo -e "${GREEN}✓ PASSED${NC} - Retrieved $count carriers"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# TMS Fleet
echo "Testing Fleet API..."
response=$(curl -s "$API_BASE/tms/fleet")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    echo -e "${GREEN}✓ PASSED${NC} - Retrieved $count vehicles"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# TMS Compliance
echo "Testing Compliance API..."
response=$(curl -s "$API_BASE/tms/compliance")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    echo -e "${GREEN}✓ PASSED${NC} - Retrieved $count compliance records"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo ""
echo "🌐 Frontend Pages Tests"
echo "----------------------"

# Test all TMS pages
test_endpoint "Dashboard Page" "$FRONTEND_BASE/tms-dashboard.html"
test_endpoint "Shipments Page" "$FRONTEND_BASE/tms-shipments.html"
test_endpoint "Carriers Page" "$FRONTEND_BASE/tms-carriers.html"
test_endpoint "Routes Page" "$FRONTEND_BASE/tms-routes.html"
test_endpoint "Fleet Page" "$FRONTEND_BASE/tms-fleet.html"
test_endpoint "Compliance Page" "$FRONTEND_BASE/tms-compliance.html"
test_endpoint "Reports Page" "$FRONTEND_BASE/tms-reports.html"
test_endpoint "Cost Analysis Page" "$FRONTEND_BASE/tms-cost-analysis.html"

echo ""
echo "📦 Static Assets Tests"
echo "---------------------"

# Test critical assets
test_endpoint "Side Panel CSS" "$FRONTEND_BASE/css/side-panel.css"
test_endpoint "Side Panel JS" "$FRONTEND_BASE/js/tms-side-panel.js"
test_endpoint "TMS Common JS" "$FRONTEND_BASE/js/tms-common.js"
test_endpoint "Main Styles" "$FRONTEND_BASE/css/styles.css"

echo ""
echo "======================================"
echo "Test Results Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
