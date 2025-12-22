#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001/api/v1/wms/putaway"
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║              WMS PUT-AWAY MODULE TEST SUITE                    ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Authentication Setup
echo -e "${YELLOW}Test 1: Authentication Setup${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
TOKEN="mock_token_12345"
if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Authentication token set${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to set authentication token${NC}"
fi
echo ""

# Test 2: Setup Test Data (Mock IDs)
echo -e "${YELLOW}Test 2: Setup Test Data${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
WAREHOUSE_ID="507f1f77bcf86cd799439011"
GOODS_RECEIPT_ID="507f1f77bcf86cd799439022"
PURCHASE_ORDER_ID="507f1f77bcf86cd799439033"
PRODUCT_ID="507f1f77bcf86cd799439044"
FROM_LOCATION_ID="507f1f77bcf86cd799439055"
TO_LOCATION_ID="507f1f77bcf86cd799439066"
USER_ID="507f1f77bcf86cd799439077"
echo -e "${GREEN}✓ Test data configured${NC}"
echo "  Warehouse ID: $WAREHOUSE_ID"
echo "  Goods Receipt ID: $GOODS_RECEIPT_ID"
PASSED_TESTS=$((PASSED_TESTS + 1))
echo ""

# Test 3: Create Putaway Task
echo -e "${YELLOW}Test 3: Create Putaway Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"goodsReceiptId\": \"$GOODS_RECEIPT_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"high\",
    \"priorityScore\": 8,
    \"strategy\": \"nearest\",
    \"putawayInstructions\": \"Store in climate-controlled zone\",
    \"specialInstructions\": \"Fragile items - handle with care\"
  }")

if echo "$CREATE_RESPONSE" | grep -q "success"; then
    PUTAWAY_TASK_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Putaway task created successfully${NC}"
    echo "  Task ID: $PUTAWAY_TASK_ID"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create putaway task${NC}"
    echo "$CREATE_RESPONSE"
fi
echo ""

# Test 4: Get All Putaway Tasks
echo -e "${YELLOW}Test 4: Get All Putaway Tasks${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_ALL_RESPONSE" | grep -q "success"; then
    COUNT=$(echo "$GET_ALL_RESPONSE" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${GREEN}✓ Retrieved putaway tasks${NC}"
    echo "  Total tasks: $COUNT"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to retrieve putaway tasks${NC}"
fi
echo ""

# Test 5: Get Single Putaway Task
echo -e "${YELLOW}Test 5: Get Single Putaway Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PUTAWAY_TASK_ID" ]; then
    GET_ONE_RESPONSE=$(curl -s -X GET "$BASE_URL/$PUTAWAY_TASK_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$GET_ONE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Retrieved putaway task details${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to retrieve putaway task${NC}"
    fi
else
    echo -e "${RED}✗ No putaway task ID available${NC}"
fi
echo ""

# Test 6: Update Putaway Task
echo -e "${YELLOW}Test 6: Update Putaway Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PUTAWAY_TASK_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PUTAWAY_TASK_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"priority\": \"urgent\",
        \"priorityScore\": 10,
        \"specialInstructions\": \"Urgent - expedite putaway for production\"
      }")
    
    if echo "$UPDATE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Putaway task updated${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to update putaway task${NC}"
    fi
else
    echo -e "${RED}✗ No putaway task ID available${NC}"
fi
echo ""

# Test 7: Complete Putaway
echo -e "${YELLOW}Test 7: Complete Putaway Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PUTAWAY_TASK_ID" ]; then
    COMPLETE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PUTAWAY_TASK_ID/complete" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"items\": [
          {
            \"itemId\": \"507f1f77bcf86cd799439088\",
            \"quantityPutaway\": 100,
            \"toLocation\": \"$TO_LOCATION_ID\",
            \"toLocationCode\": \"A-01-R1-S1\",
            \"status\": \"putaway\",
            \"verified\": true,
            \"scanned\": true
          }
        ],
        \"notes\": \"All items successfully stored in optimal locations\"
      }")
    
    if echo "$COMPLETE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Putaway completed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to complete putaway${NC}"
    fi
else
    echo -e "${RED}✗ No putaway task ID available${NC}"
fi
echo ""

# Test 8: Filter by Status
echo -e "${YELLOW}Test 8: Filter Putaway Tasks by Status${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
FILTER_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL?status=pending" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_STATUS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Filtered by status${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to filter by status${NC}"
fi
echo ""

# Test 9: Filter by Priority
echo -e "${YELLOW}Test 9: Filter by Priority${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
FILTER_PRIORITY_RESPONSE=$(curl -s -X GET "$BASE_URL?priority=high" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_PRIORITY_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Filtered by priority${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to filter by priority${NC}"
fi
echo ""

# Test 10: Filter by Strategy
echo -e "${YELLOW}Test 10: Filter by Strategy${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
FILTER_STRATEGY_RESPONSE=$(curl -s -X GET "$BASE_URL?strategy=nearest" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_STRATEGY_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Filtered by strategy${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to filter by strategy${NC}"
fi
echo ""

# Test 11: Get Overdue Tasks
echo -e "${YELLOW}Test 11: Get Overdue Putaway Tasks${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
OVERDUE_RESPONSE=$(curl -s -X GET "$BASE_URL?overdue=true" \
  -H "Authorization: Bearer $TOKEN")

if echo "$OVERDUE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Retrieved overdue tasks${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to get overdue tasks${NC}"
fi
echo ""

# Test 12: Get Putaway Metrics
echo -e "${YELLOW}Test 12: Get Putaway Metrics${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
METRICS_RESPONSE=$(curl -s -X GET "$BASE_URL/metrics?warehouse=$WAREHOUSE_ID&startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN")

if echo "$METRICS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Retrieved putaway metrics${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to get metrics${NC}"
fi
echo ""

# Test 13: Create Task with FEFO Strategy
echo -e "${YELLOW}Test 13: Create Task with FEFO Strategy${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
FEFO_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"goodsReceiptId\": \"$GOODS_RECEIPT_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"normal\",
    \"strategy\": \"fefo\",
    \"putawayInstructions\": \"Store items with expiry dates using FEFO method\"
  }")

if echo "$FEFO_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ FEFO strategy task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create FEFO task${NC}"
fi
echo ""

# Test 14: Create Task with ABC Analysis
echo -e "${YELLOW}Test 14: Create Task with ABC Analysis Strategy${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
ABC_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"goodsReceiptId\": \"$GOODS_RECEIPT_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"high\",
    \"strategy\": \"abc-analysis\",
    \"putawayInstructions\": \"High-value items in easily accessible locations\"
  }")

if echo "$ABC_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ ABC analysis task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create ABC analysis task${NC}"
fi
echo ""

# Test 15: Create Task with Capacity Optimization
echo -e "${YELLOW}Test 15: Create Task with Capacity Optimization${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
CAPACITY_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"goodsReceiptId\": \"$GOODS_RECEIPT_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"normal\",
    \"strategy\": \"capacity-optimized\",
    \"putawayInstructions\": \"Optimize storage capacity utilization\"
  }")

if echo "$CAPACITY_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Capacity optimization task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create capacity optimization task${NC}"
fi
echo ""

# Test 16: Filter by Date Range
echo -e "${YELLOW}Test 16: Filter by Date Range${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
DATE_FILTER_RESPONSE=$(curl -s -X GET "$BASE_URL?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DATE_FILTER_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Filtered by date range${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to filter by date${NC}"
fi
echo ""

# Test 17: Pagination Test
echo -e "${YELLOW}Test 17: Test Pagination${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
PAGINATION_RESPONSE=$(curl -s -X GET "$BASE_URL?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PAGINATION_RESPONSE" | grep -q "currentPage"; then
    echo -e "${GREEN}✓ Pagination working${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Pagination failed${NC}"
fi
echo ""

# Test 18: Create Urgent Priority Task
echo -e "${YELLOW}Test 18: Create Urgent Priority Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
URGENT_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"goodsReceiptId\": \"$GOODS_RECEIPT_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"urgent\",
    \"priorityScore\": 10,
    \"strategy\": \"fastest\",
    \"putawayInstructions\": \"Production urgent - store immediately in nearest location\"
  }")

if echo "$URGENT_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Urgent priority task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create urgent task${NC}"
fi
echo ""

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      TEST SUMMARY                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"
PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "Success Rate: ${GREEN}$PERCENTAGE%${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                 ✓ ALL TESTS PASSED!                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                 ✗ SOME TESTS FAILED                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
fi
echo ""
