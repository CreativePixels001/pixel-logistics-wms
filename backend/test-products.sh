#!/bin/bash

# WMS Product API Testing Script
# Testing all product management endpoints

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🧪 WMS PRODUCT API - COMPREHENSIVE TESTING             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:5001/api/v1/wms"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 STEP 1: Authentication${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Login to get token
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dlt.com",
    "password": "admin123"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    print_result 0 "Authentication successful"
    echo "   Token: ${TOKEN:0:20}..."
else
    print_result 1 "Authentication failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📦 STEP 2: Create Products${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Create Product - Electronics
echo -e "\n${YELLOW}Test 1:${NC} Create Electronics Product"
RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Samsung Galaxy S23",
    "description": "Latest flagship smartphone with advanced features",
    "category": "Electronics",
    "subCategory": "Mobile Phones",
    "brand": "Samsung",
    "manufacturer": "Samsung Electronics",
    "sku": "SAM-S23-BLK-128",
    "barcode": "8801234567890",
    "price": {
      "cost": 45000,
      "selling": 59999
    },
    "weight": {
      "value": 0.168,
      "unit": "kg"
    },
    "dimensions": {
      "length": 14.6,
      "width": 7.1,
      "height": 0.76,
      "unit": "cm"
    },
    "inventory": {
      "reorderPoint": 20,
      "reorderQuantity": 50,
      "minStock": 10,
      "maxStock": 200
    },
    "classification": {
      "abc": "A",
      "velocity": "fast"
    },
    "status": "active"
  }')

PRODUCT_ID_1=$(echo $RESPONSE | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PRODUCT_ID_1" ]; then
    print_result 0 "Product created - Electronics"
    echo "   Product ID: $PRODUCT_ID_1"
else
    print_result 1 "Product creation failed - Electronics"
fi

# Test 2: Create Product - Clothing
echo -e "\n${YELLOW}Test 2:${NC} Create Clothing Product"
RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Levis 501 Original Jeans",
    "description": "Classic straight fit denim jeans",
    "category": "Clothing",
    "subCategory": "Jeans",
    "brand": "Levis",
    "manufacturer": "Levi Strauss & Co",
    "price": {
      "cost": 1800,
      "selling": 3999
    },
    "hasVariants": true,
    "variants": [
      {
        "sku": "LEV-501-BLU-30",
        "name": "Blue - 30",
        "attributes": {
          "color": "Blue",
          "size": "30"
        },
        "barcode": "5050123456789",
        "price": {
          "cost": 1800,
          "selling": 3999
        },
        "stock": 25
      },
      {
        "sku": "LEV-501-BLU-32",
        "name": "Blue - 32",
        "attributes": {
          "color": "Blue",
          "size": "32"
        },
        "barcode": "5050123456790",
        "price": {
          "cost": 1800,
          "selling": 3999
        },
        "stock": 30
      }
    ],
    "inventory": {
      "reorderPoint": 15,
      "reorderQuantity": 40,
      "minStock": 10,
      "maxStock": 150
    },
    "classification": {
      "abc": "B",
      "velocity": "medium"
    },
    "status": "active"
  }')

PRODUCT_ID_2=$(echo $RESPONSE | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PRODUCT_ID_2" ]; then
    print_result 0 "Product created - Clothing with variants"
    echo "   Product ID: $PRODUCT_ID_2"
else
    print_result 1 "Product creation failed - Clothing"
fi

# Test 3: Create Product - Food & Beverage
echo -e "\n${YELLOW}Test 3:${NC} Create Food & Beverage Product"
RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Organic Green Tea",
    "description": "Premium organic green tea leaves",
    "category": "Food & Beverage",
    "subCategory": "Beverages",
    "brand": "Organic India",
    "manufacturer": "Organic India Pvt Ltd",
    "sku": "ORG-GT-100",
    "barcode": "9876543210123",
    "price": {
      "cost": 120,
      "selling": 199
    },
    "weight": {
      "value": 0.1,
      "unit": "kg"
    },
    "storage": {
      "temperature": {
        "min": 15,
        "max": 25,
        "unit": "C"
      },
      "humidity": {
        "min": 40,
        "max": 60
      },
      "specialHandling": "None"
    },
    "lotTracking": {
      "enabled": true,
      "expiryTracking": true,
      "shelfLife": {
        "value": 18,
        "unit": "months"
      }
    },
    "inventory": {
      "reorderPoint": 50,
      "reorderQuantity": 200,
      "minStock": 30,
      "maxStock": 500,
      "trackLotNumbers": true
    },
    "classification": {
      "abc": "C",
      "velocity": "slow"
    },
    "status": "active"
  }')

PRODUCT_ID_3=$(echo $RESPONSE | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PRODUCT_ID_3" ]; then
    print_result 0 "Product created - Food & Beverage with lot tracking"
    echo "   Product ID: $PRODUCT_ID_3"
else
    print_result 1 "Product creation failed - Food & Beverage"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 STEP 3: Retrieve Products${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 4: Get all products
echo -e "\n${YELLOW}Test 4:${NC} Get all products"
RESPONSE=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$COUNT" -ge 3 ]; then
    print_result 0 "Retrieved all products (Count: $COUNT)"
else
    print_result 1 "Failed to retrieve all products"
fi

# Test 5: Get single product
echo -e "\n${YELLOW}Test 5:${NC} Get single product by ID"
RESPONSE=$(curl -s -X GET "$BASE_URL/products/$PRODUCT_ID_1" \
  -H "Authorization: Bearer $TOKEN")

NAME=$(echo $RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
if [ -n "$NAME" ]; then
    print_result 0 "Retrieved product: $NAME"
else
    print_result 1 "Failed to retrieve product"
fi

# Test 6: Search by category
echo -e "\n${YELLOW}Test 6:${NC} Get products by category"
RESPONSE=$(curl -s -X GET "$BASE_URL/products?category=Electronics" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$COUNT" -ge 1 ]; then
    print_result 0 "Retrieved Electronics products (Count: $COUNT)"
else
    print_result 1 "Failed to retrieve products by category"
fi

# Test 7: Search by barcode
echo -e "\n${YELLOW}Test 7:${NC} Search product by barcode"
RESPONSE=$(curl -s -X GET "$BASE_URL/products/barcode/8801234567890" \
  -H "Authorization: Bearer $TOKEN")

NAME=$(echo $RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
if [ -n "$NAME" ]; then
    print_result 0 "Found product by barcode: $NAME"
else
    print_result 1 "Failed to find product by barcode"
fi

# Test 8: Search by SKU
echo -e "\n${YELLOW}Test 8:${NC} Search product by SKU"
RESPONSE=$(curl -s -X GET "$BASE_URL/products/sku/SAM-S23-BLK-128" \
  -H "Authorization: Bearer $TOKEN")

NAME=$(echo $RESPONSE | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
if [ -n "$NAME" ]; then
    print_result 0 "Found product by SKU: $NAME"
else
    print_result 1 "Failed to find product by SKU"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}✏️  STEP 4: Update Products${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 9: Update product
echo -e "\n${YELLOW}Test 9:${NC} Update product details"
RESPONSE=$(curl -s -X PUT "$BASE_URL/products/$PRODUCT_ID_1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": {
      "cost": 45000,
      "selling": 57999
    },
    "totalStock": 45
  }')

SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    print_result 0 "Product updated successfully"
else
    print_result 1 "Product update failed"
fi

# Test 10: Update classification
echo -e "\n${YELLOW}Test 10:${NC} Update product classification"
RESPONSE=$(curl -s -X PUT "$BASE_URL/products/$PRODUCT_ID_3/classification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "abc": "B",
    "velocity": "medium"
  }')

SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    print_result 0 "Classification updated successfully"
else
    print_result 1 "Classification update failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 STEP 5: Analytics & Reports${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 11: Get ABC Analysis
echo -e "\n${YELLOW}Test 11:${NC} Get ABC Analysis"
RESPONSE=$(curl -s -X GET "$BASE_URL/products/analysis/abc" \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    print_result 0 "ABC Analysis retrieved"
    echo "$RESPONSE" | grep -o '"_id":"[A-C]"' | head -3
else
    print_result 1 "ABC Analysis failed"
fi

# Test 12: Get stock information
echo -e "\n${YELLOW}Test 12:${NC} Get product stock information"
RESPONSE=$(curl -s -X GET "$BASE_URL/products/$PRODUCT_ID_1/stock" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_STOCK=$(echo $RESPONSE | grep -o '"totalStock":[0-9]*' | cut -d':' -f2)
if [ -n "$TOTAL_STOCK" ]; then
    print_result 0 "Stock information retrieved (Total: $TOTAL_STOCK)"
else
    print_result 1 "Failed to retrieve stock information"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📈 STEP 6: Bulk Operations${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 13: Bulk import products
echo -e "\n${YELLOW}Test 13:${NC} Bulk import products"
RESPONSE=$(curl -s -X POST "$BASE_URL/products/bulk-import" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "products": [
      {
        "name": "HP Laptop 15s",
        "category": "Electronics",
        "brand": "HP",
        "price": {"cost": 35000, "selling": 45999},
        "classification": {"abc": "A", "velocity": "fast"}
      },
      {
        "name": "Nike Running Shoes",
        "category": "Sports",
        "brand": "Nike",
        "price": {"cost": 3500, "selling": 5999},
        "classification": {"abc": "B", "velocity": "medium"}
      },
      {
        "name": "Wooden Chair",
        "category": "Furniture",
        "brand": "Godrej",
        "price": {"cost": 1200, "selling": 2499},
        "classification": {"abc": "C", "velocity": "slow"}
      }
    ]
  }')

COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
if [ "$COUNT" -eq 3 ]; then
    print_result 0 "Bulk import successful (Imported: $COUNT products)"
else
    print_result 1 "Bulk import failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🎯 STEP 7: Advanced Features${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 14: Add product variant
echo -e "\n${YELLOW}Test 14:${NC} Add variant to product"
RESPONSE=$(curl -s -X POST "$BASE_URL/products/$PRODUCT_ID_2/variants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "LEV-501-BLU-34",
    "name": "Blue - 34",
    "attributes": {
      "color": "Blue",
      "size": "34"
    },
    "barcode": "5050123456791",
    "price": {
      "cost": 1800,
      "selling": 3999
    },
    "stock": 20
  }')

SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    print_result 0 "Variant added successfully"
else
    print_result 1 "Failed to add variant"
fi

# Test 15: Pagination test
echo -e "\n${YELLOW}Test 15:${NC} Test pagination"
RESPONSE=$(curl -s -X GET "$BASE_URL/products?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

PAGE=$(echo $RESPONSE | grep -o '"page":[0-9]*' | cut -d':' -f2)
if [ "$PAGE" -eq 1 ]; then
    print_result 0 "Pagination working (Page: $PAGE)"
else
    print_result 1 "Pagination failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))
echo "Total Tests: $TOTAL"
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║         ✅ ALL TESTS PASSED - PRODUCT API WORKING! ✅          ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the errors above.${NC}"
fi

echo ""
