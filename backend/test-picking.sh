#!/bin/bash

# Picking Tasks API Test Script
# Tests all 8 endpoints for picking/order fulfillment operations

BASE_URL="http://localhost:5001/api/v1/wms/picking"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}: $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}: $2"
    ((TESTS_FAILED++))
  fi
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║            PICKING TASKS API TEST SUITE                    ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test setup - Mock IDs (replace with actual IDs from your database)
WAREHOUSE_ID="507f1f77bcf86cd799439011"
SALES_ORDER_ID_1="507f1f77bcf86cd799439012"
SALES_ORDER_ID_2="507f1f77bcf86cd799439013"
PRODUCT_ID_1="507f1f77bcf86cd799439014"
PRODUCT_ID_2="507f1f77bcf86cd799439015"
LOCATION_ID_1="507f1f77bcf86cd799439016"
LOCATION_ID_2="507f1f77bcf86cd799439017"
USER_ID="507f1f77bcf86cd799439018"

echo -e "${YELLOW}Using mock IDs for testing:${NC}"
echo "Warehouse ID: $WAREHOUSE_ID"
echo "Sales Order ID 1: $SALES_ORDER_ID_1"
echo "Sales Order ID 2: $SALES_ORDER_ID_2"
echo "User ID: $USER_ID"
echo ""

# Test 1: Create single-order picking task
echo -e "${BLUE}Test 1: Create single-order picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_1\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"pickingType\": \"single-order\",
    \"priority\": \"high\",
    \"strategy\": \"fifo\",
    \"pickingInstructions\": \"Handle with care - fragile items\",
    \"scheduledStartDate\": \"2025-11-23T09:00:00Z\",
    \"scheduledEndDate\": \"2025-11-23T12:00:00Z\",
    \"estimatedDuration\": 180
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create single-order picking task"
  TASK_ID_1=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Task ID: $TASK_ID_1"
else
  print_test_result 1 "Create single-order picking task"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 2: Create batch picking task
echo -e "${BLUE}Test 2: Create batch picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/batch" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_1\", \"$SALES_ORDER_ID_2\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"batchName\": \"Morning Batch - Nov 23\",
    \"priority\": \"normal\",
    \"pickingInstructions\": \"Batch pick for multiple orders\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create batch picking task"
  TASK_ID_BATCH=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Batch Task ID: $TASK_ID_BATCH"
else
  print_test_result 1 "Create batch picking task"
fi
echo ""

# Test 3: Get all picking tasks
echo -e "${BLUE}Test 3: Get all picking tasks${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get all picking tasks"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Total tasks: $COUNT"
else
  print_test_result 1 "Get all picking tasks"
fi
echo ""

# Test 4: Get single picking task
echo -e "${BLUE}Test 4: Get single picking task${NC}"
if [ ! -z "$TASK_ID_1" ]; then
  RESPONSE=$(curl -s -X GET "$BASE_URL/$TASK_ID_1")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Get single picking task"
    TASK_NUMBER=$(echo "$RESPONSE" | grep -o '"taskNumber":"[^"]*' | cut -d'"' -f4)
    echo "  Task number: $TASK_NUMBER"
  else
    print_test_result 1 "Get single picking task"
  fi
else
  print_test_result 1 "Get single picking task (no task ID)"
fi
echo ""

# Test 5: Update picking task
echo -e "${BLUE}Test 5: Update picking task${NC}"
if [ ! -z "$TASK_ID_1" ]; then
  RESPONSE=$(curl -s -X PUT "$BASE_URL/$TASK_ID_1" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"priority\": \"urgent\",
      \"priorityScore\": 10,
      \"specialInstructions\": \"Rush order - customer VIP\"
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Update picking task"
  else
    print_test_result 1 "Update picking task"
  fi
else
  print_test_result 1 "Update picking task (no task ID)"
fi
echo ""

# Test 6: Assign picker to task
echo -e "${BLUE}Test 6: Assign picker to task${NC}"
if [ ! -z "$TASK_ID_1" ]; then
  RESPONSE=$(curl -s -X PUT "$BASE_URL/$TASK_ID_1/assign" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"userId\": \"$USER_ID\"
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Assign picker"
    echo "  Picker assigned successfully"
  else
    print_test_result 1 "Assign picker"
  fi
else
  print_test_result 1 "Assign picker (no task ID)"
fi
echo ""

# Test 7: Start picking
echo -e "${BLUE}Test 7: Start picking${NC}"
if [ ! -z "$TASK_ID_1" ]; then
  RESPONSE=$(curl -s -X PUT "$BASE_URL/$TASK_ID_1/start" \
    -H "$CONTENT_TYPE" \
    -d "{}")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Start picking"
    echo "  Picking started"
  else
    print_test_result 1 "Start picking"
  fi
else
  print_test_result 1 "Start picking (no task ID)"
fi
echo ""

# Test 8: Complete picking
echo -e "${BLUE}Test 8: Complete picking${NC}"
if [ ! -z "$TASK_ID_1" ]; then
  RESPONSE=$(curl -s -X PUT "$BASE_URL/$TASK_ID_1/complete" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"items\": [
        {
          \"itemId\": \"item123\",
          \"quantityPicked\": 10,
          \"verified\": true,
          \"scanned\": true,
          \"notes\": \"All items picked successfully\"
        }
      ],
      \"notes\": \"Picking completed without issues\"
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Complete picking"
  else
    print_test_result 1 "Complete picking"
  fi
else
  print_test_result 1 "Complete picking (no task ID)"
fi
echo ""

# Test 9: Filter by status
echo -e "${BLUE}Test 9: Filter picking tasks by status${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&status=pending")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by status"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Pending tasks: $COUNT"
else
  print_test_result 1 "Filter by status"
fi
echo ""

# Test 10: Filter by priority
echo -e "${BLUE}Test 10: Filter by priority${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&priority=high")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by priority"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  High priority tasks: $COUNT"
else
  print_test_result 1 "Filter by priority"
fi
echo ""

# Test 11: Filter by picking type
echo -e "${BLUE}Test 11: Filter by picking type${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&pickingType=batch")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by picking type"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Batch picking tasks: $COUNT"
else
  print_test_result 1 "Filter by picking type"
fi
echo ""

# Test 12: Get tasks by sales order
echo -e "${BLUE}Test 12: Get picking tasks by sales order${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/order/$SALES_ORDER_ID_1")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get tasks by sales order"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Tasks for order: $COUNT"
else
  print_test_result 1 "Get tasks by sales order"
fi
echo ""

# Test 13: Filter by assigned user
echo -e "${BLUE}Test 13: Filter by assigned picker${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&assignedTo=$USER_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by assigned picker"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Assigned tasks: $COUNT"
else
  print_test_result 1 "Filter by assigned picker"
fi
echo ""

# Test 14: Get overdue tasks
echo -e "${BLUE}Test 14: Get overdue picking tasks${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&overdue=true")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get overdue tasks"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Overdue tasks: $COUNT"
else
  print_test_result 1 "Get overdue tasks"
fi
echo ""

# Test 15: Get picking metrics
echo -e "${BLUE}Test 15: Get picking metrics${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/metrics?warehouse=$WAREHOUSE_ID&startDate=2025-11-01&endDate=2025-11-30")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get picking metrics"
  echo "  Metrics retrieved successfully"
else
  print_test_result 1 "Get picking metrics"
fi
echo ""

# Test 16: Create urgent priority task
echo -e "${BLUE}Test 16: Create urgent priority picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_2\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"pickingType\": \"single-order\",
    \"priority\": \"urgent\",
    \"strategy\": \"nearest\",
    \"pickingInstructions\": \"URGENT: Same-day delivery required\",
    \"scheduledStartDate\": \"2025-11-23T08:00:00Z\",
    \"scheduledEndDate\": \"2025-11-23T10:00:00Z\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create urgent priority task"
  TASK_ID_URGENT=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Urgent task ID: $TASK_ID_URGENT"
else
  print_test_result 1 "Create urgent priority task"
fi
echo ""

# Test 17: Create wave picking task
echo -e "${BLUE}Test 17: Create wave picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_1\", \"$SALES_ORDER_ID_2\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"pickingType\": \"wave\",
    \"waveId\": \"WAVE-001\",
    \"waveName\": \"Morning Wave - Zone A\",
    \"zones\": [\"picking\", \"storage\"],
    \"priority\": \"high\",
    \"strategy\": \"fifo\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create wave picking task"
  TASK_ID_WAVE=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Wave task ID: $TASK_ID_WAVE"
else
  print_test_result 1 "Create wave picking task"
fi
echo ""

# Test 18: Create zone picking task
echo -e "${BLUE}Test 18: Create zone picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_1\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"pickingType\": \"zone\",
    \"zones\": [\"fast-moving\"],
    \"priority\": \"normal\",
    \"strategy\": \"fastest\",
    \"pickingInstructions\": \"Pick only from fast-moving zone\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create zone picking task"
else
  print_test_result 1 "Create zone picking task"
fi
echo ""

# Test 19: Filter by date range
echo -e "${BLUE}Test 19: Filter by date range${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&startDate=2025-11-01&endDate=2025-11-30")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by date range"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Tasks in date range: $COUNT"
else
  print_test_result 1 "Filter by date range"
fi
echo ""

# Test 20: Pagination test
echo -e "${BLUE}Test 20: Test pagination${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?warehouse=$WAREHOUSE_ID&page=1&limit=5")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Pagination test"
  PAGE=$(echo "$RESPONSE" | grep -o '"page":[0-9]*' | cut -d':' -f2)
  TOTAL_PAGES=$(echo "$RESPONSE" | grep -o '"pages":[0-9]*' | cut -d':' -f2)
  echo "  Page $PAGE of $TOTAL_PAGES"
else
  print_test_result 1 "Pagination test"
fi
echo ""

# Test 21: Comprehensive picking task with all features
echo -e "${BLUE}Test 21: Create comprehensive picking task${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"salesOrderIds\": [\"$SALES_ORDER_ID_1\"],
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"pickingType\": \"single-order\",
    \"priority\": \"high\",
    \"priorityScore\": 8,
    \"strategy\": \"fefo\",
    \"zones\": [\"storage\", \"picking\"],
    \"pickingInstructions\": \"Check expiry dates - FEFO strategy\",
    \"specialInstructions\": \"Temperature-sensitive items - handle quickly\",
    \"packingInstructions\": \"Pack in insulated boxes\",
    \"scheduledStartDate\": \"2025-11-23T10:00:00Z\",
    \"scheduledEndDate\": \"2025-11-23T14:00:00Z\",
    \"estimatedDuration\": 240,
    \"equipment\": [
      {
        \"type\": \"cart\",
        \"equipmentId\": \"CART-001\",
        \"name\": \"Standard Picking Cart\"
      },
      {
        \"type\": \"scanner\",
        \"equipmentId\": \"SCAN-025\",
        \"name\": \"Barcode Scanner\"
      }
    ],
    \"qualityCheck\": {
      \"required\": true
    }
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create comprehensive task"
  TASK_NUMBER=$(echo "$RESPONSE" | grep -o '"taskNumber":"[^"]*' | cut -d'"' -f4)
  echo "  Task number: $TASK_NUMBER"
else
  print_test_result 1 "Create comprehensive task"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TOTAL_TESTS)*100}")

echo -e "Total Tests:    $TOTAL_TESTS"
echo -e "${GREEN}Passed:         $TESTS_PASSED${NC}"
echo -e "${RED}Failed:         $TESTS_FAILED${NC}"
echo -e "Pass Rate:      ${PASS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                                            ║${NC}"
  echo -e "${GREEN}║                  ALL TESTS PASSED! ✓                       ║${NC}"
  echo -e "${GREEN}║                                                            ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
  echo -e "${YELLOW}Some tests failed. Please review the output above.${NC}"
fi

echo ""
