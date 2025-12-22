#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5001/api/v1/wms/packing"
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║              WMS PACKING MODULE TEST SUITE                     ║${NC}"
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
SALES_ORDER_ID="507f1f77bcf86cd799439022"
PICKING_TASK_ID="507f1f77bcf86cd799439033"
PRODUCT_ID="507f1f77bcf86cd799439044"
USER_ID="507f1f77bcf86cd799439055"
echo -e "${GREEN}✓ Test data configured${NC}"
echo "  Warehouse ID: $WAREHOUSE_ID"
echo "  Sales Order ID: $SALES_ORDER_ID"
echo "  Picking Task ID: $PICKING_TASK_ID"
PASSED_TESTS=$((PASSED_TESTS + 1))
echo ""

# Test 3: Create Packing Task
echo -e "${YELLOW}Test 3: Create Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrderId\": \"$SALES_ORDER_ID\",
    \"pickingTaskId\": \"$PICKING_TASK_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"high\",
    \"priorityScore\": 8,
    \"packingInstructions\": \"Handle with care - fragile items\",
    \"specialInstructions\": \"Pack electronics separately\"
  }")

if echo "$CREATE_RESPONSE" | grep -q "success"; then
    PACKING_TASK_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Packing task created successfully${NC}"
    echo "  Task ID: $PACKING_TASK_ID"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create packing task${NC}"
    echo "$CREATE_RESPONSE"
fi
echo ""

# Test 4: Get All Packing Tasks
echo -e "${YELLOW}Test 4: Get All Packing Tasks${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_ALL_RESPONSE" | grep -q "success"; then
    COUNT=$(echo "$GET_ALL_RESPONSE" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${GREEN}✓ Retrieved packing tasks${NC}"
    echo "  Total tasks: $COUNT"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to retrieve packing tasks${NC}"
fi
echo ""

# Test 5: Get Single Packing Task
echo -e "${YELLOW}Test 5: Get Single Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    GET_ONE_RESPONSE=$(curl -s -X GET "$BASE_URL/$PACKING_TASK_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$GET_ONE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Retrieved packing task details${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to retrieve packing task${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 6: Update Packing Task
echo -e "${YELLOW}Test 6: Update Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PACKING_TASK_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"priority\": \"urgent\",
        \"priorityScore\": 10,
        \"specialInstructions\": \"Rush order - expedite packing\"
      }")
    
    if echo "$UPDATE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Packing task updated${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to update packing task${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 7: Assign Packer
echo -e "${YELLOW}Test 7: Assign Packer to Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    ASSIGN_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PACKING_TASK_ID/assign" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"userId\": \"$USER_ID\"
      }")
    
    if echo "$ASSIGN_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Packer assigned successfully${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to assign packer${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 8: Start Packing
echo -e "${YELLOW}Test 8: Start Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    START_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PACKING_TASK_ID/start" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$START_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Packing started${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to start packing${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 9: Pack Items into Packages
echo -e "${YELLOW}Test 9: Pack Items into Packages${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    PACK_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PACKING_TASK_ID/pack" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"items\": [
          {
            \"itemId\": \"507f1f77bcf86cd799439066\",
            \"quantityPacked\": 5,
            \"status\": \"packed\",
            \"verified\": true,
            \"scanned\": true,
            \"packagedIn\": [{\"packageNumber\": \"PKG-001\", \"quantity\": 5}]
          }
        ],
        \"packages\": [
          {
            \"packageNumber\": \"PKG-001\",
            \"packageType\": \"box\",
            \"containerCode\": \"BOX-MEDIUM-001\",
            \"length\": 40,
            \"width\": 30,
            \"height\": 25,
            \"dimensionUnit\": \"cm\",
            \"weight\": 5.5,
            \"weightUnit\": \"kg\",
            \"items\": [{
              \"product\": \"$PRODUCT_ID\",
              \"productName\": \"Test Product\",
              \"quantity\": 5
            }],
            \"status\": \"sealed\",
            \"fragile\": true,
            \"trackingNumber\": \"TRACK123456789\"
          }
        ]
      }")
    
    if echo "$PACK_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Items packed into packages${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to pack items${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 10: Complete Packing
echo -e "${YELLOW}Test 10: Complete Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ ! -z "$PACKING_TASK_ID" ]; then
    COMPLETE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$PACKING_TASK_ID/complete" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"notes\": \"All items packed successfully, 1 package ready for shipping\"
      }")
    
    if echo "$COMPLETE_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✓ Packing completed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ Failed to complete packing${NC}"
    fi
else
    echo -e "${RED}✗ No packing task ID available${NC}"
fi
echo ""

# Test 11: Filter by Status
echo -e "${YELLOW}Test 11: Filter Packing Tasks by Status${NC}"
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

# Test 12: Filter by Priority
echo -e "${YELLOW}Test 12: Filter by Priority${NC}"
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

# Test 13: Get Tasks by Sales Order
echo -e "${YELLOW}Test 13: Get Packing Tasks by Sales Order${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
ORDER_TASKS_RESPONSE=$(curl -s -X GET "$BASE_URL/order/$SALES_ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ORDER_TASKS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Retrieved tasks by sales order${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to get tasks by sales order${NC}"
fi
echo ""

# Test 14: Filter by Assigned Packer
echo -e "${YELLOW}Test 14: Filter by Assigned Packer${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
FILTER_USER_RESPONSE=$(curl -s -X GET "$BASE_URL?assignedTo=$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_USER_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Filtered by assigned packer${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to filter by packer${NC}"
fi
echo ""

# Test 15: Get Overdue Tasks
echo -e "${YELLOW}Test 15: Get Overdue Packing Tasks${NC}"
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

# Test 16: Get Packing Metrics
echo -e "${YELLOW}Test 16: Get Packing Metrics${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
METRICS_RESPONSE=$(curl -s -X GET "$BASE_URL/metrics?warehouse=$WAREHOUSE_ID&startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN")

if echo "$METRICS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Retrieved packing metrics${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to get metrics${NC}"
fi
echo ""

# Test 17: Create Multi-Package Task
echo -e "${YELLOW}Test 17: Create Multi-Package Packing Task${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
MULTI_PACKAGE_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrderId\": \"$SALES_ORDER_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"normal\",
    \"packingInstructions\": \"Large order - requires multiple packages\",
    \"specialInstructions\": \"Group items by category\"
  }")

if echo "$MULTI_PACKAGE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Multi-package task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create multi-package task${NC}"
fi
echo ""

# Test 18: Filter by Date Range
echo -e "${YELLOW}Test 18: Filter by Date Range${NC}"
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

# Test 19: Pagination Test
echo -e "${YELLOW}Test 19: Test Pagination${NC}"
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

# Test 20: Create Task with Quality Check
echo -e "${YELLOW}Test 20: Create Task with Quality Check${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
QC_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrderId\": \"$SALES_ORDER_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"high\",
    \"packingInstructions\": \"Premium customer - quality check required\",
    \"qualityCheck\": {
      \"required\": true
    }
  }")

if echo "$QC_TASK_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Task with quality check created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create QC task${NC}"
fi
echo ""

# Test 21: Create Task with Special Packaging
echo -e "${YELLOW}Test 21: Create Task with Special Packaging Requirements${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
SPECIAL_PKG_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrderId\": \"$SALES_ORDER_ID\",
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"priority\": \"urgent\",
    \"packingInstructions\": \"Temperature-sensitive items - use insulated packaging\",
    \"specialInstructions\": \"Add ice packs, seal with tamper-evident tape\",
    \"materials\": [
      {\"materialType\": \"box\", \"materialName\": \"Insulated Box Large\", \"quantity\": 1},
      {\"materialType\": \"foam\", \"materialName\": \"Ice Pack 500g\", \"quantity\": 3},
      {\"materialType\": \"tape\", \"materialName\": \"Tamper-Evident Tape\", \"quantity\": 1}
    ]
  }")

if echo "$SPECIAL_PKG_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Special packaging task created${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Failed to create special packaging task${NC}"
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
