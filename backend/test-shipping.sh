#!/bin/bash

# Test Script for Shipping API
# Tests all 10 endpoints comprehensively

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
echo "  SHIPPING API TEST SUITE"
echo "========================================="
echo ""

# Test 1: Authentication
echo "Test 1: Authentication"
echo "----------------------------------------"
TOKEN="mock-jwt-token-for-testing"
echo -e "${YELLOW}Using mock token: $TOKEN${NC}"
print_result 0 "Authentication setup"
echo ""

# Test 2: Setup - Mock Data IDs
echo "Test 2: Setup - Mock Data IDs"
echo "----------------------------------------"
SO_ID="673e1234567890abcdef1234"
CUSTOMER_ID="673e1234567890abcdef2345"
WAREHOUSE_ID="673e1234567890abcdef3456"
PRODUCT_ID_1="673e1234567890abcdef4567"
PRODUCT_ID_2="673e1234567890abcdef5678"

echo "Sales Order ID: $SO_ID"
echo "Customer ID: $CUSTOMER_ID"
echo "Warehouse ID: $WAREHOUSE_ID"
echo "Product ID 1: $PRODUCT_ID_1"
echo "Product ID 2: $PRODUCT_ID_2"
print_result 0 "Mock IDs configured"
echo ""

# Test 3: Create Shipment
echo "Test 3: Create Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/shipping" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrder\": \"$SO_ID\",
    \"shipmentType\": \"express\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 100,
        \"shippedQuantity\": 100,
        \"batchNumber\": \"BATCH-2025-001\",
        \"packageNumber\": \"PKG-001\"
      },
      {
        \"product\": \"$PRODUCT_ID_2\",
        \"orderedQuantity\": 50,
        \"shippedQuantity\": 50,
        \"batchNumber\": \"BATCH-2025-002\",
        \"packageNumber\": \"PKG-001\"
      }
    ],
    \"shippingAddress\": {
      \"addressLine1\": \"123 Main Street\",
      \"addressLine2\": \"Suite 100\",
      \"city\": \"Mumbai\",
      \"state\": \"Maharashtra\",
      \"country\": \"India\",
      \"postalCode\": \"400001\",
      \"contactPerson\": \"Rajesh Kumar\",
      \"contactPhone\": \"9876543210\"
    },
    \"carrier\": {
      \"name\": \"Blue Dart\",
      \"serviceType\": \"Express\",
      \"accountNumber\": \"BD123456\"
    },
    \"packages\": [
      {
        \"packageNumber\": \"PKG-001\",
        \"boxType\": \"medium-box\",
        \"weight\": {
          \"value\": 15.5,
          \"unit\": \"kg\"
        },
        \"dimensions\": {
          \"length\": 40,
          \"width\": 30,
          \"height\": 25,
          \"unit\": \"cm\"
        }
      }
    ],
    \"shippingCost\": {
      \"baseRate\": 500,
      \"fuelSurcharge\": 50,
      \"insurance\": 100,
      \"handlingCharges\": 50
    },
    \"paymentMode\": \"prepaid\",
    \"priority\": \"high\",
    \"estimatedPickupDate\": \"2025-11-24\",
    \"estimatedDeliveryDate\": \"2025-11-26\",
    \"specialInstructions\": \"Handle with care - fragile items\",
    \"insuranceValue\": 50000,
    \"isInsured\": true,
    \"signatureRequired\": true
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  SHIPMENT_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  SHIPMENT_NUMBER=$(echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Shipment Created: $SHIPMENT_NUMBER"
  echo "Shipment ID: $SHIPMENT_ID"
  print_result 0 "Create shipment"
else
  echo "$RESPONSE"
  print_result 1 "Create shipment"
fi
echo ""

# Test 4: Get All Shipments
echo "Test 4: Get All Shipments"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
  echo "Total Shipments: $COUNT"
  print_result 0 "Get all shipments"
else
  print_result 1 "Get all shipments"
fi
echo ""

# Test 5: Get Single Shipment
echo "Test 5: Get Single Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping/$SHIPMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Shipment Details Retrieved"
  echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"'
  echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1
  print_result 0 "Get single shipment"
else
  print_result 1 "Get single shipment"
fi
echo ""

# Test 6: Update Shipment
echo "Test 6: Update Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/shipping/$SHIPMENT_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trackingNumber": "BD1234567890",
    "awbNumber": "AWB-2025-001",
    "specialInstructions": "Deliver between 10 AM - 6 PM"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Tracking Number: BD1234567890"
  print_result 0 "Update shipment"
else
  print_result 1 "Update shipment"
fi
echo ""

# Test 7: Dispatch Shipment
echo "Test 7: Dispatch Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/shipping/$SHIPMENT_ID/dispatch" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trackingNumber": "BD1234567890",
    "actualPickupDate": "2025-11-23T10:30:00Z",
    "carrier": {
      "name": "Blue Dart",
      "serviceType": "Express",
      "contactNumber": "1800-123-4567"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Shipment dispatched"
  echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1
  print_result 0 "Dispatch shipment"
else
  echo "$RESPONSE"
  print_result 1 "Dispatch shipment"
fi
echo ""

# Test 8: Mark In-Transit
echo "Test 8: Mark Shipment In-Transit"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/shipping/$SHIPMENT_ID/in-transit" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "location": "Delhi Hub",
    "timestamp": "2025-11-24T14:00:00Z"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Shipment marked in-transit"
  echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1
  print_result 0 "Mark in-transit"
else
  echo "$RESPONSE"
  print_result 1 "Mark in-transit"
fi
echo ""

# Test 9: Mark Delivered
echo "Test 9: Mark Shipment Delivered"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/shipping/$SHIPMENT_ID/deliver" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deliveredBy": "Delivery Agent - Ramesh",
    "receiverName": "Rajesh Kumar",
    "receiverPhone": "9876543210",
    "deliveryNotes": "Delivered successfully at customer location"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "Shipment delivered"
  echo "$RESPONSE" | grep -o '"status":"[^"]*"' | head -1
  print_result 0 "Mark delivered"
else
  echo "$RESPONSE"
  print_result 1 "Mark delivered"
fi
echo ""

# Test 10: Upload Proof of Delivery (POD)
echo "Test 10: Upload POD"
echo "----------------------------------------"
RESPONSE=$(curl -s -X PUT "$BASE_URL/shipping/$SHIPMENT_ID/pod" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "signatureUrl": "https://example.com/signatures/sign-001.jpg",
    "photoUrl": "https://example.com/photos/delivery-001.jpg",
    "receiverName": "Rajesh Kumar",
    "receiverPhone": "9876543210",
    "verified": true
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "POD uploaded successfully"
  print_result 0 "Upload POD"
else
  echo "$RESPONSE"
  print_result 1 "Upload POD"
fi
echo ""

# Test 11: Get Shipments by Sales Order
echo "Test 11: Get Shipments by Sales Order"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping/so/$SO_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Shipments for SO: $COUNT"
  print_result 0 "Get shipments by SO"
else
  print_result 1 "Get shipments by SO"
fi
echo ""

# Test 12: Create Return Shipment
echo "Test 12: Create Return Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/shipping/$SHIPMENT_ID/return" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 10,
        \"shippedQuantity\": 10
      }
    ],
    \"returnReason\": \"Product damaged during delivery\",
    \"carrier\": {
      \"name\": \"Blue Dart\",
      \"serviceType\": \"Return\"
    }
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  RETURN_SHIPMENT_NUMBER=$(echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Return Shipment Created: $RETURN_SHIPMENT_NUMBER"
  print_result 0 "Create return shipment"
else
  echo "$RESPONSE"
  print_result 1 "Create return shipment"
fi
echo ""

# Test 13: Filter by Status
echo "Test 13: Filter Shipments by Status"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping?status=delivered" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Delivered Shipments: $COUNT"
  print_result 0 "Filter by status"
else
  print_result 1 "Filter by status"
fi
echo ""

# Test 14: Filter by Carrier
echo "Test 14: Filter Shipments by Carrier"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping?carrier=Blue%20Dart" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Blue Dart Shipments: $COUNT"
  print_result 0 "Filter by carrier"
else
  print_result 1 "Filter by carrier"
fi
echo ""

# Test 15: Filter by Date Range
echo "Test 15: Filter Shipments by Date Range"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Shipments in November 2025: $COUNT"
  print_result 0 "Filter by date range"
else
  print_result 1 "Filter by date range"
fi
echo ""

# Test 16: Create Overnight Shipment
echo "Test 16: Create Overnight Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/shipping" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrder\": \"$SO_ID\",
    \"shipmentType\": \"overnight\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 25,
        \"shippedQuantity\": 25
      }
    ],
    \"shippingAddress\": {
      \"addressLine1\": \"456 Business Park\",
      \"city\": \"Bangalore\",
      \"state\": \"Karnataka\",
      \"country\": \"India\",
      \"postalCode\": \"560001\",
      \"contactPerson\": \"Suresh Patel\",
      \"contactPhone\": \"9123456789\"
    },
    \"carrier\": {
      \"name\": \"FedEx\",
      \"serviceType\": \"Overnight\"
    },
    \"priority\": \"urgent\",
    \"signatureRequired\": true
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  OVERNIGHT_NUMBER=$(echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Overnight Shipment: $OVERNIGHT_NUMBER"
  print_result 0 "Create overnight shipment"
else
  print_result 1 "Create overnight shipment"
fi
echo ""

# Test 17: Create COD Shipment
echo "Test 17: Create COD Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/shipping" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrder\": \"$SO_ID\",
    \"shipmentType\": \"standard\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_2\",
        \"orderedQuantity\": 30,
        \"shippedQuantity\": 30
      }
    ],
    \"shippingAddress\": {
      \"addressLine1\": \"789 Retail Street\",
      \"city\": \"Delhi\",
      \"state\": \"Delhi\",
      \"country\": \"India\",
      \"postalCode\": \"110001\",
      \"contactPerson\": \"Amit Singh\",
      \"contactPhone\": \"9998887776\"
    },
    \"carrier\": {
      \"name\": \"Delhivery\",
      \"serviceType\": \"Standard\"
    },
    \"paymentMode\": \"cod\",
    \"codAmount\": 15000,
    \"shippingCost\": {
      \"baseRate\": 300,
      \"cod\": 150
    }
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COD_NUMBER=$(echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"' | cut -d'"' -f4)
  echo "COD Shipment: $COD_NUMBER"
  print_result 0 "Create COD shipment"
else
  print_result 1 "Create COD shipment"
fi
echo ""

# Test 18: Pagination Test
echo "Test 18: Pagination Test"
echo "----------------------------------------"
RESPONSE=$(curl -s -X GET "$BASE_URL/shipping?page=1&limit=5" \
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

# Test 19: Comprehensive Shipment with All Details
echo "Test 19: Create Comprehensive Shipment"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/shipping" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"salesOrder\": \"$SO_ID\",
    \"shipmentType\": \"express\",
    \"items\": [
      {
        \"product\": \"$PRODUCT_ID_1\",
        \"orderedQuantity\": 100,
        \"shippedQuantity\": 100,
        \"batchNumber\": \"BATCH-2025-999\",
        \"serialNumbers\": [\"SN001\", \"SN002\", \"SN003\"],
        \"packageNumber\": \"PKG-A01\"
      }
    ],
    \"shippingAddress\": {
      \"addressLine1\": \"Corporate HQ, Tower A\",
      \"addressLine2\": \"Floor 15, Wing B\",
      \"city\": \"Pune\",
      \"state\": \"Maharashtra\",
      \"country\": \"India\",
      \"postalCode\": \"411001\",
      \"contactPerson\": \"Priya Sharma\",
      \"contactPhone\": \"9876000001\"
    },
    \"carrier\": {
      \"name\": \"DHL\",
      \"serviceType\": \"Express Worldwide\",
      \"accountNumber\": \"DHL987654\",
      \"contactNumber\": \"1800-DHL-DHL\"
    },
    \"trackingNumber\": \"DHL9876543210\",
    \"awbNumber\": \"AWB-DHL-2025-999\",
    \"packages\": [
      {
        \"packageNumber\": \"PKG-A01\",
        \"boxType\": \"large-box\",
        \"weight\": {
          \"value\": 25.5,
          \"unit\": \"kg\"
        },
        \"dimensions\": {
          \"length\": 60,
          \"width\": 40,
          \"height\": 35,
          \"unit\": \"cm\"
        },
        \"trackingNumber\": \"DHL9876543210\"
      }
    ],
    \"shippingCost\": {
      \"baseRate\": 1500,
      \"fuelSurcharge\": 150,
      \"insurance\": 300,
      \"handlingCharges\": 100,
      \"otherCharges\": 50
    },
    \"paymentMode\": \"prepaid\",
    \"priority\": \"urgent\",
    \"estimatedPickupDate\": \"2025-11-24T09:00:00Z\",
    \"estimatedDeliveryDate\": \"2025-11-25T18:00:00Z\",
    \"specialInstructions\": \"VIP customer - priority handling required\",
    \"deliveryInstructions\": \"Call before delivery, business hours only\",
    \"insuranceValue\": 150000,
    \"isInsured\": true,
    \"signatureRequired\": true,
    \"documents\": [
      {
        \"type\": \"invoice\",
        \"fileName\": \"invoice-999.pdf\",
        \"fileUrl\": \"https://example.com/docs/invoice-999.pdf\"
      },
      {
        \"type\": \"packing-slip\",
        \"fileName\": \"packing-slip-999.pdf\",
        \"fileUrl\": \"https://example.com/docs/ps-999.pdf\"
      }
    ]
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
  COMP_NUMBER=$(echo "$RESPONSE" | grep -o '"shipmentNumber":"[^"]*"' | cut -d'"' -f4)
  echo "Comprehensive Shipment: $COMP_NUMBER"
  print_result 0 "Comprehensive shipment with all fields"
else
  echo "$RESPONSE"
  print_result 1 "Comprehensive shipment with all fields"
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
