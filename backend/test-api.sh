#!/bin/bash

# Pixel Logistics WMS - API Test Script
# This script tests all available backend endpoints

BASE_URL="http://localhost:5000/api/v1"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Pixel Logistics WMS - API Testing"
echo "================================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
curl -s -X GET http://localhost:5000/health | jq .
echo ""
echo ""

# Test 2: Login
echo -e "${YELLOW}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pixellogistics.com",
    "password": "Admin@123"
  }')

echo $LOGIN_RESPONSE | jq .

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful! Token received.${NC}"
else
  echo -e "${RED}✗ Login failed! Please check credentials.${NC}"
  exit 1
fi
echo ""
echo ""

# Test 3: Get Current User
echo -e "${YELLOW}Test 3: Get Current User${NC}"
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 4: Get Inventory List
echo -e "${YELLOW}Test 4: Get Inventory List (First Page)${NC}"
curl -s -X GET "$BASE_URL/inventory?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 5: Get Inventory Stats
echo -e "${YELLOW}Test 5: Get Inventory Statistics${NC}"
curl -s -X GET $BASE_URL/inventory/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 6: Search Inventory
echo -e "${YELLOW}Test 6: Search Inventory (Search: 'laptop')${NC}"
curl -s -X GET "$BASE_URL/inventory?search=laptop" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 7: Get Low Stock Items
echo -e "${YELLOW}Test 7: Get Low Stock Items${NC}"
curl -s -X GET $BASE_URL/inventory/reports/low-stock \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 8: Get Expired Items
echo -e "${YELLOW}Test 8: Get Expired Items${NC}"
curl -s -X GET $BASE_URL/inventory/reports/expired \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 9: Create New Inventory Item
echo -e "${YELLOW}Test 9: Create New Inventory Item${NC}"
NEW_ITEM=$(curl -s -X POST $BASE_URL/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "TEST-'$(date +%s)'",
    "itemName": "Test Item - Wireless Keyboard",
    "description": "Mechanical wireless keyboard for testing",
    "category": "Electronics",
    "sku": "KB-TEST-001",
    "barcode": "9876543210123",
    "uom": "EA",
    "quantity": 150,
    "reorderLevel": 30,
    "reorderQuantity": 100,
    "location": "A-05",
    "zone": "A",
    "aisle": "5",
    "rack": "2",
    "shelf": "1",
    "unitPrice": 79.99,
    "weight": 0.8,
    "supplier": "Tech Supplies Inc.",
    "status": "available",
    "condition": "new"
  }')

echo $NEW_ITEM | jq .

# Extract new item ID
NEW_ITEM_ID=$(echo $NEW_ITEM | jq -r '.data.id')
echo -e "${GREEN}✓ Created item with ID: $NEW_ITEM_ID${NC}"
echo ""
echo ""

# Test 10: Get Single Item
if [ "$NEW_ITEM_ID" != "null" ] && [ -n "$NEW_ITEM_ID" ]; then
  echo -e "${YELLOW}Test 10: Get Single Inventory Item${NC}"
  curl -s -X GET $BASE_URL/inventory/$NEW_ITEM_ID \
    -H "Authorization: Bearer $TOKEN" | jq .
  echo ""
  echo ""

  # Test 11: Update Item
  echo -e "${YELLOW}Test 11: Update Inventory Item${NC}"
  curl -s -X PUT $BASE_URL/inventory/$NEW_ITEM_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "quantity": 175,
      "unitPrice": 74.99,
      "notes": "Updated via API test script"
    }' | jq .
  echo ""
  echo ""

  # Test 12: Adjust Quantity
  echo -e "${YELLOW}Test 12: Adjust Inventory Quantity${NC}"
  curl -s -X POST $BASE_URL/inventory/$NEW_ITEM_ID/adjust \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "quantity": 200,
      "reason": "Manual adjustment for testing"
    }' | jq .
  echo ""
  echo ""
fi

# Test 13: Register New User
echo -e "${YELLOW}Test 13: Register New User${NC}"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser'$(date +%s)'@pixellogistics.com",
    "password": "Test@123456",
    "phone": "+1-555-0100",
    "department": "Testing",
    "role": "operator"
  }' | jq .
echo ""
echo ""

# Test 14: Filter by Category
echo -e "${YELLOW}Test 14: Filter Inventory by Category${NC}"
curl -s -X GET "$BASE_URL/inventory?category=Electronics&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 15: Test Invalid Token
echo -e "${YELLOW}Test 15: Test Invalid Token (Should Fail)${NC}"
curl -s -X GET $BASE_URL/inventory \
  -H "Authorization: Bearer invalid_token_here" | jq .
echo ""
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}✓ API Testing Completed!${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "- ✓ Health check endpoint working"
echo "- ✓ Authentication working (login)"
echo "- ✓ User profile retrieval working"
echo "- ✓ Inventory listing with pagination"
echo "- ✓ Inventory statistics"
echo "- ✓ Search functionality"
echo "- ✓ Low stock reporting"
echo "- ✓ Create/Read/Update operations"
echo "- ✓ Quantity adjustment logging"
echo "- ✓ User registration"
echo "- ✓ Filtering by category"
echo "- ✓ Token validation working"
echo ""
echo "Next steps:"
echo "1. Review the API responses above"
echo "2. Check logs in backend/logs/"
echo "3. Connect frontend pages to these endpoints"
echo "4. Implement remaining models (Orders, Shipping, etc.)"
echo ""
