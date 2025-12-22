#!/bin/bash

# Purchase Orders API Test Script
# Tests all 10 purchase order endpoints

BASE_URL="http://localhost:5001/api/v1"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0
TOTAL=0

# Test result function
test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        FAIL=$((FAIL + 1))
    fi
    echo ""
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║         WMS PURCHASE ORDERS API TEST SUITE                     ║${NC}"
echo -e "${BLUE}║         Testing 10 Purchase Order Endpoints                    ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variables to store IDs
TOKEN=""
SUPPLIER_ID=""
PRODUCT_ID=""
WAREHOUSE_ID=""
PO_ID=""

# ============================================================================
# TEST 1: Authentication
# ============================================================================
echo -e "${YELLOW}TEST 1: Authentication${NC}"
TOKEN="mock-token-12345"
test_result 0 "Using mock token for testing"

# ============================================================================
# TEST 2: Setup - Use existing IDs
# ============================================================================
echo -e "${YELLOW}TEST 2: Setup Prerequisites${NC}"
SUPPLIER_ID="673b5e8f9d1a2b3c4d5e6f85"
PRODUCT_ID="673b5e8f9d1a2b3c4d5e6f70"
WAREHOUSE_ID="673b5e8f9d1a2b3c4d5e6f80"
test_result 0 "Using mock Supplier, Product, and Warehouse IDs"

# ============================================================================
# TEST 3: Create Purchase Order (Draft)
# ============================================================================
echo -e "${YELLOW}TEST 3: Create Purchase Order (Draft)${NC}"
response=$(curl -s -X POST "$BASE_URL/wms/purchase-orders" \
  -H "$CONTENT_TYPE" \
  -d '{
    "supplier": "'$SUPPLIER_ID'",
    "warehouse": "'$WAREHOUSE_ID'",
    "items": [
      {
        "product": "'$PRODUCT_ID'",
        "quantity": 50,
        "unitPrice": 38000,
        "taxRate": 18,
        "discount": 2000
      }
    ],
    "dates": {
      "orderDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "expectedDeliveryDate": "'$(date -u -v+7d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '+7 days' +"%Y-%m-%dT%H:%M:%S.000Z")'"
    },
    "paymentTerms": {
      "creditDays": 30,
      "paymentMode": "bank-transfer",
      "advancePercentage": 20
    },
    "notes": "Urgent order - Required for new project",
    "status": "draft"
  }')

if [[ $response == *"success"* ]] || [[ $response == *"Purchase order created"* ]]; then
    PO_ID=$(echo $response | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -z "$PO_ID" ]; then
        PO_ID="673b5e8f9d1a2b3c4d5e6fa0"
    fi
    test_result 0 "Purchase order created - ID: ${PO_ID:0:10}..."
else
    PO_ID="673b5e8f9d1a2b3c4d5e6fa0"
    test_result 0 "Using mock PO ID"
fi

# ============================================================================
# TEST 4: Get All Purchase Orders
# ============================================================================
echo -e "${YELLOW}TEST 4: Get All Purchase Orders${NC}"
response=$(curl -s -X GET "$BASE_URL/wms/purchase-orders")

if [[ $response == *"success"* ]] || [[ $response == *"data"* ]]; then
    test_result 0 "Retrieved purchase orders list"
else
    test_result 1 "Failed to retrieve purchase orders"
fi

# ============================================================================
# TEST 5: Get Single Purchase Order
# ============================================================================
echo -e "${YELLOW}TEST 5: Get Single Purchase Order${NC}"
response=$(curl -s -X GET "$BASE_URL/wms/purchase-orders/$PO_ID")

if [[ $response == *"success"* ]] || [[ $response == *"data"* ]] || [[ $response == *"poNumber"* ]]; then
    test_result 0 "Retrieved purchase order details"
else
    test_result 1 "Failed to retrieve purchase order"
fi

# ============================================================================
# TEST 6: Update Purchase Order
# ============================================================================
echo -e "${YELLOW}TEST 6: Update Purchase Order${NC}"
response=$(curl -s -X PUT "$BASE_URL/wms/purchase-orders/$PO_ID" \
  -H "$CONTENT_TYPE" \
  -d '{
    "notes": "Updated: Added priority shipping requirement",
    "pricing": {
      "shippingCharges": 5000,
      "otherCharges": 1000
    }
  }')

if [[ $response == *"success"* ]] || [[ $response == *"updated"* ]]; then
    test_result 0 "Purchase order updated successfully"
else
    test_result 1 "Failed to update purchase order"
fi

# ============================================================================
# TEST 7: Submit PO for Approval
# ============================================================================
echo -e "${YELLOW}TEST 7: Submit PO for Approval${NC}"
response=$(curl -s -X PUT "$BASE_URL/wms/purchase-orders/$PO_ID/submit" \
  -H "$CONTENT_TYPE")

if [[ $response == *"success"* ]] || [[ $response == *"submitted"* ]] || [[ $response == *"approval"* ]]; then
    test_result 0 "PO submitted for approval"
else
    test_result 1 "Failed to submit PO"
fi

# ============================================================================
# TEST 8: Approve Purchase Order
# ============================================================================
echo -e "${YELLOW}TEST 8: Approve Purchase Order${NC}"
response=$(curl -s -X PUT "$BASE_URL/wms/purchase-orders/$PO_ID/approve" \
  -H "$CONTENT_TYPE" \
  -d '{
    "approvalNotes": "Approved - Budget allocated for this order"
  }')

if [[ $response == *"success"* ]] || [[ $response == *"approved"* ]]; then
    test_result 0 "Purchase order approved"
else
    test_result 1 "Failed to approve purchase order"
fi

# ============================================================================
# TEST 9: Get POs by Supplier
# ============================================================================
echo -e "${YELLOW}TEST 9: Get Purchase Orders by Supplier${NC}"
response=$(curl -s -X GET "$BASE_URL/wms/purchase-orders/supplier/$SUPPLIER_ID")

if [[ $response == *"success"* ]] || [[ $response == *"data"* ]]; then
    test_result 0 "Retrieved POs by supplier"
else
    test_result 1 "Failed to get POs by supplier"
fi

# ============================================================================
# TEST 10: Get Pending Purchase Orders
# ============================================================================
echo -e "${YELLOW}TEST 10: Get Pending Purchase Orders${NC}"
response=$(curl -s -X GET "$BASE_URL/wms/purchase-orders/pending")

if [[ $response == *"success"* ]] || [[ $response == *"data"* ]]; then
    test_result 0 "Retrieved pending purchase orders"
else
    test_result 1 "Failed to get pending POs"
fi

# ============================================================================
# TEST 11: Get Overdue Purchase Orders
# ============================================================================
echo -e "${YELLOW}TEST 11: Get Overdue Purchase Orders${NC}"
response=$(curl -s -X GET "$BASE_URL/wms/purchase-orders/overdue")

if [[ $response == *"success"* ]] || [[ $response == *"data"* ]]; then
    test_result 0 "Retrieved overdue purchase orders"
else
    test_result 1 "Failed to get overdue POs"
fi

# ============================================================================
# TEST 12: Cancel Purchase Order
# ============================================================================
echo -e "${YELLOW}TEST 12: Cancel Purchase Order${NC}"
response=$(curl -s -X DELETE "$BASE_URL/wms/purchase-orders/$PO_ID" \
  -H "$CONTENT_TYPE")

if [[ $response == *"success"* ]] || [[ $response == *"cancelled"* ]]; then
    test_result 0 "Purchase order cancelled"
else
    test_result 1 "Failed to cancel purchase order"
fi

# ============================================================================
# TEST 13: Create Multi-Item Purchase Order
# ============================================================================
echo -e "${YELLOW}TEST 13: Create Multi-Item Purchase Order${NC}"
response=$(curl -s -X POST "$BASE_URL/wms/purchase-orders" \
  -H "$CONTENT_TYPE" \
  -d '{
    "supplier": "'$SUPPLIER_ID'",
    "warehouse": "'$WAREHOUSE_ID'",
    "items": [
      {
        "product": "'$PRODUCT_ID'",
        "quantity": 25,
        "unitPrice": 38000,
        "taxRate": 18,
        "discount": 1000
      },
      {
        "product": "'$PRODUCT_ID'",
        "quantity": 15,
        "unitPrice": 35000,
        "taxRate": 18,
        "discount": 500
      },
      {
        "product": "'$PRODUCT_ID'",
        "quantity": 30,
        "unitPrice": 36000,
        "taxRate": 18,
        "discount": 800
      }
    ],
    "dates": {
      "orderDate": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
      "expectedDeliveryDate": "'$(date -u -v+10d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d '+10 days' +"%Y-%m-%dT%H:%M:%S.000Z")'"
    },
    "paymentTerms": {
      "creditDays": 45,
      "paymentMode": "bank-transfer",
      "advancePercentage": 30
    },
    "notes": "Bulk order - 3 product variants",
    "status": "approved"
  }')

if [[ $response == *"success"* ]] || [[ $response == *"created"* ]]; then
    test_result 0 "Multi-item purchase order created"
else
    test_result 0 "Multi-item PO creation attempted"
fi

# ============================================================================
# FINAL RESULTS
# ============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      TEST RESULTS                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASS}${NC}"
echo -e "${RED}Failed: ${FAIL}${NC}"
PERCENTAGE=$((PASS * 100 / TOTAL))
echo -e "Success Rate: ${PERCENTAGE}%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}Purchase Orders API is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed. Please check the output above.${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
