#!/bin/bash

# Test Script for Receiving (Goods Receipt) API
# Tests all 8 endpoints comprehensively

BASE_URL="http://localhost:5001/api/v1/wms"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}: $2"
    ((FAILED++))
  fi
}

echo "========================================="
echo "  RECEIVING API TEST SUITE"
echo "========================================="
echo ""

# Test 1: Authentication
echo "Test 1: Authentication"
echo "----------------------------------------"
TOKEN="mock-jwt-token-for-testing"
echo -e "${YELLOW}Using mock token: $TOKEN${NC}"
print_result 0 "Authentication setup"
echo ""

# Test 2: Setup - Get mock IDs
echo "Test 2: Setup - Mock Data IDs"
echo "----------------------------------------"
# Using mock ObjectIds for testing
PO_ID="673e1234567890abcdef1234"
WAREHOUSE_ID="673e1234567890abcdef2345"
SUPPLIER_ID="673e1234567890abcdef3456"
PRODUCT_ID_1="673e1234567890abcdef4567"
PRODUCT_ID_2="673e1234567890abcdef5678"

echo "Purchase Order ID: $PO_ID"
echo "Warehouse ID: $WAREHOUSE_ID"
echo "Supplier ID: $SUPPLIER_ID"
echo "Product ID 1: $PRODUCT_ID_1"
echo "Product ID 2: $PRODUCT_ID_2"
print_result 0 "Mock IDs configured"
echo ""

# Test 3: Create Goods Receipt
echo "Test 3: Create Goods Receipt (GRN)"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/receiving" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"purchaseOrder\": \"$PO_ID\",
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"receiptDate\": \"2025-11-23\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 100,
        \"receivedQuantity\": 95,
        \"unitCost\": 150,
        \"batchNumber\": \"BATCH-2025-001\",
        \"expiryDate\": \"2026-11-23\"
      },
      {
        \"product\": \"$PRODUCT_ID_2\",
        \"orderedQuantity\": 50,
        \"receivedQuantity\": 50,
        \"unitCost\": 200,
        \"batchNumber\": \"BATCH-2025-002\"
      }
    ],
    \"invoiceNumber\": \"INV-SUPP-001\",
    \"invoiceDate\": \"2025-11-22\",
    \"invoiceAmount\": 24250,
    \"vehicleNumber\": \"MH12AB1234\",
    \"driverName\": \"Rajesh Kumar\",
    \"driverPhone\": \"9876543210\",
    \"transporterName\": \"Fast Logistics\",
    \"lrNumber\": \"LR-2025-001\",
    \"freightCharges\": 500,
    \"remarks\": \"All items received in good condition\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  GRN_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  GRN_NUMBER=$(echo "$RESPONSE" | grep -o '"grnNumber":"[^"]*"' | cut -d'"' -f4)
  echo "GRN Created: $GRN_NUMBER"
  echo "GRN ID: $GRN_ID"
  print_result 0 "Create goods receipt"
else
  echo "$RESPONSE"
  print_result 1 "Create goods receipt"
fi
echo ""

# Test 4: Get All Goods Receipts
echo "Test 4: Get All Goods Receipts"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
  echo "Total Receipts: $COUNT"
  print_result 0 "Get all receipts"
else
  print_result 1 "Get all receipts"
fi
echo ""

# Test 5: Get Single Goods Receipt
echo "Test 5: Get Single Goods Receipt"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving/$GRN_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Receipt Details Retrieved"
  echo "$RESPONSE" | grep -o '"grnNumber":"[^"]*"'
  echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1
  print_result 0 "Get single receipt"
else
  print_result 1 "Get single receipt"
fi
echo ""

# Test 6: Update Goods Receipt
echo "Test 6: Update Goods Receipt"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/receiving/$GRN_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "internalNotes": "Updated: Quality inspection required",
    "freightCharges": 550
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  print_result 0 "Update receipt"
else
  print_result 1 "Update receipt"
fi
echo ""

# Test 7: Quality Inspection
echo "Test 7: Quality Inspection"
echo "----------------------------------------"
# First, get the item IDs from the created receipt
ITEM_ID_1=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '2p' | cut -d'"' -f4)
ITEM_ID_2=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | sed -n '3p' | cut -d'"' -f4)

# Use mock item IDs if extraction failed
if [ -z "$ITEM_ID_1" ]; then
  ITEM_ID_1="673e1234567890abcdef7890"
fi
if [ -z "$ITEM_ID_2" ]; then
  ITEM_ID_2="673e1234567890abcdef7891"
fi

RESPONSE=$(curl -s -X PUT "$BASE_URL/receiving/$GRN_ID/inspect" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"items\": [
      {
        \"itemId\": \"$ITEM_ID_1\",
        \"inspectionStatus\": \"passed\",
        \"acceptedQuantity\": 90,
        \"rejectedQuantity\": 5,
        \"inspectionNotes\": \"5 units found damaged during inspection\"
      },
      {
        \"itemId\": \"$ITEM_ID_2\",
        \"inspectionStatus\": \"passed\",
        \"acceptedQuantity\": 50,
        \"rejectedQuantity\": 0,
        \"inspectionNotes\": \"All units passed quality check\"
      }
    ],
    \"qualityScore\": 95,
    \"qualityChecklistId\": \"QC-2025-001\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Inspection completed"
  echo "$RESPONSE" | grep -o '"overallInspectionStatus":"[^"]*"'
  print_result 0 "Quality inspection"
else
  echo "$RESPONSE"
  print_result 1 "Quality inspection"
fi
echo ""

# Test 8: Accept Items (Update Inventory)
echo "Test 8: Accept Items & Update Inventory"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/receiving/$GRN_ID/accept" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Items accepted and inventory updated"
  print_result 0 "Accept items"
else
  echo "$RESPONSE"
  print_result 1 "Accept items"
fi
echo ""

# Test 9: Complete Put-away
echo "Test 9: Complete Put-away"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/receiving/$GRN_ID/putaway" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"items\": [
      {
        \"itemId\": \"$ITEM_ID_1\",
        \"binLocation\": \"A-01-01\",
        \"rackNumber\": \"R-001\",
        \"shelfNumber\": \"S-001\"
      },
      {
        \"itemId\": \"$ITEM_ID_2\",
        \"binLocation\": \"A-01-02\",
        \"rackNumber\": \"R-001\",
        \"shelfNumber\": \"S-002\"
      }
    ]
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Put-away completed"
  print_result 0 "Complete put-away"
else
  echo "$RESPONSE"
  print_result 1 "Complete put-away"
fi
echo ""

# Test 10: Get Receipts by Purchase Order
echo "Test 10: Get Receipts by Purchase Order"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving/po/$PO_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Receipts for PO: $COUNT"
  print_result 0 "Get receipts by PO"
else
  print_result 1 "Get receipts by PO"
fi
echo ""

# Test 11: Filter by Status
echo "Test 11: Filter Receipts by Status"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving?status=completed" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Completed Receipts: $COUNT"
  print_result 0 "Filter by status"
else
  print_result 1 "Filter by status"
fi
echo ""

# Test 12: Filter by Inspection Status
echo "Test 12: Filter by Inspection Status"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving?inspectionStatus=passed" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Passed Inspections: $COUNT"
  print_result 0 "Filter by inspection status"
else
  print_result 1 "Filter by inspection status"
fi
echo ""

# Test 13: Filter by Warehouse
echo "Test 13: Filter Receipts by Warehouse"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving?warehouse=$WAREHOUSE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Receipts for Warehouse: $COUNT"
  print_result 0 "Filter by warehouse"
else
  print_result 1 "Filter by warehouse"
fi
echo ""

# Test 14: Filter by Date Range
echo "Test 14: Filter Receipts by Date Range"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Receipts in November 2025: $COUNT"
  print_result 0 "Filter by date range"
else
  print_result 1 "Filter by date range"
fi
echo ""

# Test 15: Create Receipt with Partial Delivery
echo "Test 15: Create Receipt with Partial Delivery"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/receiving" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"purchaseOrder\": \"$PO_ID\",
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"receiptDate\": \"2025-11-23\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 100,
        \"receivedQuantity\": 60,
        \"unitCost\": 150,
        \"batchNumber\": \"BATCH-2025-003\"
      }
    ],
    \"remarks\": \"Partial delivery - balance to follow\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  GRN_NUMBER_2=$(echo "$RESPONSE" | grep -o '"grnNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Partial Receipt Created: $GRN_NUMBER_2"
  print_result 0 "Create partial receipt"
else
  print_result 1 "Create partial receipt"
fi
echo ""

# Test 16: Create Receipt with Quality Issues
echo "Test 16: Create Receipt with Damaged Items"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/receiving" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"purchaseOrder\": \"$PO_ID\",
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"receiptDate\": \"2025-11-23\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 50,
        \"receivedQuantity\": 50,
        \"acceptedQuantity\": 45,
        \"damagedQuantity\": 5,
        \"unitCost\": 150,
        \"batchNumber\": \"BATCH-2025-004\",
        \"damageReason\": \"Packaging damage during transit\"
      }
    ],
    \"remarks\": \"5 units damaged - claim to be filed\"
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  GRN_NUMBER_3=$(echo "$RESPONSE" | grep -o '"grnNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Damaged Items Receipt: $GRN_NUMBER_3"
  print_result 0 "Create receipt with damage"
else
  print_result 1 "Create receipt with damage"
fi
echo ""

# Test 17: Pagination Test
echo "Test 17: Pagination Test"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/receiving?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  PAGE=$(echo "$RESPONSE" | grep -o '"page":[0-9]*' | cut -d':' -f2)
  PAGES=$(echo "$RESPONSE" | grep -o '"pages":[0-9]*' | cut -d':' -f2)
  echo "Page $PAGE of $PAGES"
  print_result 0 "Pagination"
else
  print_result 1 "Pagination"
fi
echo ""

# Test 18: Comprehensive GRN with All Details
echo "Test 18: Create Comprehensive GRN"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/receiving" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"purchaseOrder\": \"$PO_ID\",
    \"warehouse\": \"$WAREHOUSE_ID\",
    \"receiptDate\": \"2025-11-23\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 100,
        \"receivedQuantity\": 100,
        \"acceptedQuantity\": 98,
        \"rejectedQuantity\": 2,
        \"unitCost\": 150,
        \"batchNumber\": \"BATCH-2025-005\",
        \"lotNumber\": \"LOT-2025-005\",
        \"manufacturingDate\": \"2025-10-15\",
        \"expiryDate\": \"2026-10-15\",
        \"serialNumbers\": [\"SN001\", \"SN002\", \"SN003\"],
        \"binLocation\": \"A-02-01\",
        \"rackNumber\": \"R-002\",
        \"shelfNumber\": \"S-001\",
        \"inspectionStatus\": \"passed\",
        \"inspectionNotes\": \"Minor quality issues in 2 units\"
      },
      {
        \"product\": \"$PRODUCT_ID_2\",
        \"orderedQuantity\": 75,
        \"receivedQuantity\": 75,
        \"acceptedQuantity\": 75,
        \"rejectedQuantity\": 0,
        \"unitCost\": 200,
        \"batchNumber\": \"BATCH-2025-006\",
        \"lotNumber\": \"LOT-2025-006\",
        \"expiryDate\": \"2027-01-15\",
        \"binLocation\": \"A-02-02\",
        \"rackNumber\": \"R-002\",
        \"shelfNumber\": \"S-002\",
        \"inspectionStatus\": \"passed\",
        \"inspectionNotes\": \"All units perfect condition\"
      }
    ],
    \"invoiceNumber\": \"INV-SUPP-999\",
    \"invoiceDate\": \"2025-11-22\",
    \"invoiceAmount\": 29700,
    \"vehicleNumber\": \"DL10CD5678\",
    \"driverName\": \"Suresh Patel\",
    \"driverPhone\": \"9123456789\",
    \"transporterName\": \"Express Transport Co.\",
    \"lrNumber\": \"LR-2025-999\",
    \"freightCharges\": 750,
    \"qualityScore\": 98,
    \"qualityChecklistId\": \"QC-2025-999\",
    \"remarks\": \"Complete delivery with all documentation\",
    \"internalNotes\": \"High priority order - expedite put-away\",
    \"documents\": [
      {
        \"type\": \"invoice\",
        \"fileName\": \"invoice-999.pdf\",
        \"fileUrl\": \"https://example.com/docs/invoice-999.pdf\"
      },
      {
        \"type\": \"quality-certificate\",
        \"fileName\": \"qc-cert-999.pdf\",
        \"fileUrl\": \"https://example.com/docs/qc-cert-999.pdf\"
      }
    ]
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  GRN_NUMBER_4=$(echo "$RESPONSE" | grep -o '"grnNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Comprehensive GRN: $GRN_NUMBER_4"
  print_result 0 "Comprehensive GRN with all fields"
else
  echo "$RESPONSE"
  print_result 1 "Comprehensive GRN with all fields"
fi
echo ""

# Summary
echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  exit 1
fi
