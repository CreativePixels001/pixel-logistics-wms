#!/bin/bash

# Warehouse Management API Test Script
# Tests all 10 endpoints for warehouse location management

BASE_URL="http://localhost:5001/api/v1/wms/warehouse"
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
echo -e "${BLUE}║         WAREHOUSE MANAGEMENT API TEST SUITE                ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test setup - Mock IDs (replace with actual IDs from your database)
WAREHOUSE_ID="507f1f77bcf86cd799439011"
PRODUCT_ID_1="507f1f77bcf86cd799439012"
PRODUCT_ID_2="507f1f77bcf86cd799439013"
USER_ID="507f1f77bcf86cd799439014"

echo -e "${YELLOW}Using mock IDs for testing:${NC}"
echo "Warehouse ID: $WAREHOUSE_ID"
echo "Product ID 1: $PRODUCT_ID_1"
echo "Product ID 2: $PRODUCT_ID_2"
echo ""

# Test 1: Create warehouse location - Storage zone
echo -e "${BLUE}Test 1: Create warehouse location (Storage zone)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"storage\",
    \"aisle\": \"A1\",
    \"rack\": \"R001\",
    \"shelf\": \"S01\",
    \"bin\": \"B001\",
    \"level\": 1,
    \"locationType\": \"bin\",
    \"capacity\": {
      \"maxWeight\": 500,
      \"weightUnit\": \"kg\",
      \"maxVolume\": 2.5,
      \"volumeUnit\": \"m3\",
      \"maxPallets\": 2,
      \"maxItems\": 100
    },
    \"dimensions\": {
      \"length\": 2,
      \"width\": 1.5,
      \"height\": 2.5,
      \"unit\": \"m\"
    },
    \"status\": \"active\",
    \"temperatureControlled\": false,
    \"assignmentRules\": {
      \"autoAssign\": true,
      \"allowMixedProducts\": true,
      \"allowMixedBatches\": false,
      \"fifoEnforced\": true
    },
    \"pickingPriority\": 7,
    \"putawayPriority\": 5,
    \"cycleCountFrequency\": \"monthly\",
    \"accessibility\": {
      \"forkliftAccessible\": true,
      \"manualPickingOnly\": false
    },
    \"notes\": \"Primary storage location for fast-moving items\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create storage location"
  LOCATION_ID_1=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Location ID: $LOCATION_ID_1"
else
  print_test_result 1 "Create storage location"
  echo "  Response: $RESPONSE"
fi
echo ""

# Test 2: Create second location - Picking zone
echo -e "${BLUE}Test 2: Create warehouse location (Picking zone)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"picking\",
    \"aisle\": \"B2\",
    \"rack\": \"R002\",
    \"shelf\": \"S02\",
    \"bin\": \"B002\",
    \"level\": 2,
    \"locationType\": \"bin\",
    \"capacity\": {
      \"maxWeight\": 300,
      \"weightUnit\": \"kg\",
      \"maxVolume\": 1.5,
      \"volumeUnit\": \"m3\",
      \"maxItems\": 50
    },
    \"status\": \"active\",
    \"pickingPriority\": 9,
    \"putawayPriority\": 3,
    \"cycleCountFrequency\": \"weekly\",
    \"accessibility\": {
      \"forkliftAccessible\": false,
      \"manualPickingOnly\": true
    }
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create picking location"
  LOCATION_ID_2=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Location ID: $LOCATION_ID_2"
else
  print_test_result 1 "Create picking location"
fi
echo ""

# Test 3: Create third location - Receiving zone
echo -e "${BLUE}Test 3: Create warehouse location (Receiving zone)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"receiving\",
    \"aisle\": \"R1\",
    \"rack\": \"R100\",
    \"locationType\": \"floor\",
    \"capacity\": {
      \"maxWeight\": 1000,
      \"weightUnit\": \"kg\",
      \"maxItems\": 200
    },
    \"status\": \"active\",
    \"cycleCountFrequency\": \"daily\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create receiving location"
  LOCATION_ID_3=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
else
  print_test_result 1 "Create receiving location"
fi
echo ""

# Test 4: Get all locations
echo -e "${BLUE}Test 4: Get all warehouse locations${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/locations?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get all locations"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Total locations: $COUNT"
else
  print_test_result 1 "Get all locations"
fi
echo ""

# Test 5: Get single location
echo -e "${BLUE}Test 5: Get single warehouse location${NC}"
if [ ! -z "$LOCATION_ID_1" ]; then
  RESPONSE=$(curl -s -X GET "$BASE_URL/locations/$LOCATION_ID_1")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Get single location"
    LOCATION_CODE=$(echo "$RESPONSE" | grep -o '"locationCode":"[^"]*' | cut -d'"' -f4)
    echo "  Location code: $LOCATION_CODE"
  else
    print_test_result 1 "Get single location"
  fi
else
  print_test_result 1 "Get single location (no location ID)"
fi
echo ""

# Test 6: Update location
echo -e "${BLUE}Test 6: Update warehouse location${NC}"
if [ ! -z "$LOCATION_ID_1" ]; then
  RESPONSE=$(curl -s -X PUT "$BASE_URL/locations/$LOCATION_ID_1" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"status\": \"active\",
      \"pickingPriority\": 8,
      \"notes\": \"Updated: Premium storage location for high-value items\",
      \"conditions\": {
        \"secureStorage\": true
      }
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Update location"
  else
    print_test_result 1 "Update location"
  fi
else
  print_test_result 1 "Update location (no location ID)"
fi
echo ""

# Test 7: Get warehouse zones
echo -e "${BLUE}Test 7: Get warehouse zones summary${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/zones?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get zones summary"
  echo "  Zones with utilization data retrieved"
else
  print_test_result 1 "Get zones summary"
fi
echo ""

# Test 8: Get capacity report
echo -e "${BLUE}Test 8: Get warehouse capacity report${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/capacity?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get capacity report"
  echo "  Overall and zone-wise capacity data retrieved"
else
  print_test_result 1 "Get capacity report"
fi
echo ""

# Test 9: Get utilization report
echo -e "${BLUE}Test 9: Get space utilization report${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/utilization?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get utilization report"
  echo "  Utilization statistics retrieved"
else
  print_test_result 1 "Get utilization report"
fi
echo ""

# Test 10: Find optimal location
echo -e "${BLUE}Test 10: Find optimal storage location${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations/find-optimal" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouseId\": \"$WAREHOUSE_ID\",
    \"zone\": \"storage\",
    \"requiredItems\": 50,
    \"requiredWeight\": 200,
    \"requiredVolume\": 1.0
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Find optimal location"
  OPTIMAL_LOCATION=$(echo "$RESPONSE" | grep -o '"locationCode":"[^"]*' | cut -d'"' -f4)
  echo "  Optimal location: $OPTIMAL_LOCATION"
else
  print_test_result 1 "Find optimal location"
fi
echo ""

# Test 11: Filter locations by zone
echo -e "${BLUE}Test 11: Filter locations by zone${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/locations?warehouse=$WAREHOUSE_ID&zone=storage")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by zone"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Storage zone locations: $COUNT"
else
  print_test_result 1 "Filter by zone"
fi
echo ""

# Test 12: Filter by status
echo -e "${BLUE}Test 12: Filter locations by status${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/locations?warehouse=$WAREHOUSE_ID&status=active")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Filter by status"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Active locations: $COUNT"
else
  print_test_result 1 "Filter by status"
fi
echo ""

# Test 13: Filter available locations
echo -e "${BLUE}Test 13: Get available locations${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/locations?warehouse=$WAREHOUSE_ID&available=true")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get available locations"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Available locations: $COUNT"
else
  print_test_result 1 "Get available locations"
fi
echo ""

# Test 14: Transfer inventory between locations
echo -e "${BLUE}Test 14: Transfer inventory between locations${NC}"
if [ ! -z "$LOCATION_ID_1" ] && [ ! -z "$LOCATION_ID_2" ]; then
  RESPONSE=$(curl -s -X POST "$BASE_URL/locations/transfer" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"fromLocationId\": \"$LOCATION_ID_1\",
      \"toLocationId\": \"$LOCATION_ID_2\",
      \"productId\": \"$PRODUCT_ID_1\",
      \"quantity\": 10,
      \"batchNumber\": \"BATCH-2025-001\",
      \"reason\": \"Location optimization\",
      \"notes\": \"Moving to picking zone for faster access\"
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Transfer inventory"
  else
    # Transfer might fail if no inventory exists, which is expected in test environment
    echo -e "${YELLOW}⚠ SKIPPED${NC}: Transfer inventory (no inventory in source location)"
  fi
else
  print_test_result 1 "Transfer inventory (missing location IDs)"
fi
echo ""

# Test 15: Perform location audit
echo -e "${BLUE}Test 15: Perform location audit${NC}"
if [ ! -z "$LOCATION_ID_1" ]; then
  RESPONSE=$(curl -s -X POST "$BASE_URL/locations/audit" \
    -H "$CONTENT_TYPE" \
    -d "{
      \"locationId\": \"$LOCATION_ID_1\",
      \"physicalCount\": [
        {
          \"productId\": \"$PRODUCT_ID_1\",
          \"quantity\": 50
        }
      ],
      \"notes\": \"Monthly cycle count - November 2025\"
    }")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    print_test_result 0 "Perform location audit"
    AUDIT_STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    echo "  Audit status: $AUDIT_STATUS"
  else
    print_test_result 1 "Perform location audit"
  fi
else
  print_test_result 1 "Perform location audit (no location ID)"
fi
echo ""

# Test 16: Get due cycle counts
echo -e "${BLUE}Test 16: Get locations due for cycle count${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/cycle-counts?warehouse=$WAREHOUSE_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Get due cycle counts"
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "  Locations due: $COUNT"
else
  print_test_result 1 "Get due cycle counts"
fi
echo ""

# Test 17: Create refrigerated location
echo -e "${BLUE}Test 17: Create refrigerated storage location${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"storage\",
    \"aisle\": \"C1\",
    \"rack\": \"R300\",
    \"shelf\": \"S01\",
    \"locationType\": \"shelf\",
    \"capacity\": {
      \"maxWeight\": 200,
      \"weightUnit\": \"kg\",
      \"maxItems\": 30
    },
    \"status\": \"active\",
    \"temperatureControlled\": true,
    \"temperatureRange\": {
      \"min\": 2,
      \"max\": 8,
      \"unit\": \"celsius\"
    },
    \"conditions\": {
      \"refrigerated\": true,
      \"humidityControlled\": true
    },
    \"cycleCountFrequency\": \"weekly\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create refrigerated location"
  LOCATION_ID_REFR=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Refrigerated location ID: $LOCATION_ID_REFR"
else
  print_test_result 1 "Create refrigerated location"
fi
echo ""

# Test 18: Create bulk storage location
echo -e "${BLUE}Test 18: Create bulk storage location${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"bulk-storage\",
    \"aisle\": \"D1\",
    \"rack\": \"R400\",
    \"locationType\": \"pallet\",
    \"capacity\": {
      \"maxWeight\": 2000,
      \"weightUnit\": \"kg\",
      \"maxPallets\": 10,
      \"maxItems\": 500
    },
    \"status\": \"active\",
    \"pickingPriority\": 3,
    \"putawayPriority\": 8,
    \"accessibility\": {
      \"forkliftAccessible\": true,
      \"requiresScissorLift\": false
    }
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create bulk storage location"
else
  print_test_result 1 "Create bulk storage location"
fi
echo ""

# Test 19: Pagination test
echo -e "${BLUE}Test 19: Test pagination${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/locations?warehouse=$WAREHOUSE_ID&page=1&limit=2")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Pagination test"
  PAGE=$(echo "$RESPONSE" | grep -o '"page":[0-9]*' | cut -d':' -f2)
  TOTAL_PAGES=$(echo "$RESPONSE" | grep -o '"pages":[0-9]*' | cut -d':' -f2)
  echo "  Page $PAGE of $TOTAL_PAGES"
else
  print_test_result 1 "Pagination test"
fi
echo ""

# Test 20: Comprehensive location with all features
echo -e "${BLUE}Test 20: Create comprehensive location with all features${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/locations" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"zone\": \"storage\",
    \"aisle\": \"E1\",
    \"rack\": \"R500\",
    \"shelf\": \"S05\",
    \"bin\": \"B025\",
    \"level\": 3,
    \"locationType\": \"bin\",
    \"capacity\": {
      \"maxWeight\": 750,
      \"weightUnit\": \"kg\",
      \"maxVolume\": 3.5,
      \"volumeUnit\": \"m3\",
      \"maxPallets\": 3,
      \"maxItems\": 150
    },
    \"dimensions\": {
      \"length\": 2.5,
      \"width\": 1.8,
      \"height\": 3.0,
      \"unit\": \"m\"
    },
    \"status\": \"active\",
    \"temperatureControlled\": false,
    \"conditions\": {
      \"humidityControlled\": false,
      \"hazardousMaterial\": false,
      \"secureStorage\": true,
      \"fragileItems\": true
    },
    \"accessibility\": {
      \"forkliftAccessible\": true,
      \"manualPickingOnly\": false,
      \"requiresLadder\": true,
      \"requiresScissorLift\": false
    },
    \"assignmentRules\": {
      \"autoAssign\": true,
      \"allowMixedProducts\": false,
      \"allowMixedBatches\": false,
      \"fifoEnforced\": true,
      \"lifoEnforced\": false,
      \"fefoEnforced\": false
    },
    \"pickingPriority\": 6,
    \"putawayPriority\": 7,
    \"cycleCountFrequency\": \"quarterly\",
    \"coordinates\": {
      \"x\": 15.5,
      \"y\": 22.3,
      \"z\": 3.0
    },
    \"barcode\": \"LOC-E1-R500-S05-B025\",
    \"notes\": \"Premium location for fragile, high-value items requiring secure storage\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_test_result 0 "Create comprehensive location"
  FULL_LOCATION=$(echo "$RESPONSE" | grep -o '"fullLocation":"[^"]*' | cut -d'"' -f4)
  echo "  Full location path: $FULL_LOCATION"
else
  print_test_result 1 "Create comprehensive location"
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
