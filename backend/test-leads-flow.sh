#!/bin/bash
# Automated Test Script for PIS Leads Flow
# Tests the complete end-to-end flow: Create Lead → Verify → Success

echo "================================================"
echo "🧪 PIS LEADS FORM - AUTOMATION TEST"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:8000"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((TESTS_FAILED++))
    fi
}

echo "Step 1: Testing Backend Server Health"
echo "--------------------------------------"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "Backend server is running on port 5001"
else
    print_test 1 "Backend server health check failed"
    exit 1
fi
echo ""

echo "Step 2: Testing Frontend Server"
echo "--------------------------------------"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/leads.html")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    print_test 0 "Frontend server is running on port 8000"
else
    print_test 1 "Frontend server not accessible"
    exit 1
fi
echo ""

echo "Step 3: Getting Current Lead Count"
echo "--------------------------------------"
BEFORE_COUNT=$(curl -s "$API_URL/api/v1/pis/leads" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "📊 Current leads in database: $BEFORE_COUNT"
echo ""

echo "Step 4: Creating Test Lead via API"
echo "--------------------------------------"
TEST_LEAD_DATA='{
    "fullName": "Automation Test User",
    "email": "automation.test@pixelsafe.com",
    "phone": "+91 99999 88888",
    "company": "Test Corp Ltd",
    "interestType": "health",
    "source": "website",
    "budget": "25k-50k",
    "priority": "high",
    "notes": "This is an automated test lead created at '$(date +%Y-%m-%d\ %H:%M:%S)'"
}'

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/pis/leads" \
    -H "Content-Type: application/json" \
    -d "$TEST_LEAD_DATA")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Lead created successfully via API"
    LEAD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   📝 Lead ID: $LEAD_ID"
else
    print_test 1 "Failed to create lead"
    echo "   Response: $CREATE_RESPONSE"
    exit 1
fi
echo ""

echo "Step 5: Verifying Lead Count Increased"
echo "--------------------------------------"
sleep 1
AFTER_COUNT=$(curl -s "$API_URL/api/v1/pis/leads" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "📊 Leads after creation: $AFTER_COUNT"

if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
    print_test 0 "Lead count increased from $BEFORE_COUNT to $AFTER_COUNT"
else
    print_test 1 "Lead count did not increase (Before: $BEFORE_COUNT, After: $AFTER_COUNT)"
fi
echo ""

echo "Step 6: Retrieving Created Lead Details"
echo "--------------------------------------"
LEAD_DETAILS=$(curl -s "$API_URL/api/v1/pis/leads/$LEAD_ID")
if echo "$LEAD_DETAILS" | grep -q "Automation Test User"; then
    print_test 0 "Lead details retrieved successfully"
    echo "   👤 Name: $(echo "$LEAD_DETAILS" | grep -o '"fullName":"[^"]*"' | cut -d'"' -f4)"
    echo "   📧 Email: $(echo "$LEAD_DETAILS" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    echo "   📞 Phone: $(echo "$LEAD_DETAILS" | grep -o '"phone":"[^"]*"' | cut -d'"' -f4)"
    echo "   🏢 Company: $(echo "$LEAD_DETAILS" | grep -o '"company":"[^"]*"' | cut -d'"' -f4)"
    echo "   ⚕️  Interest: $(echo "$LEAD_DETAILS" | grep -o '"interestType":"[^"]*"' | cut -d'"' -f4)"
else
    print_test 1 "Failed to retrieve lead details"
fi
echo ""

echo "Step 7: Testing API Validation (Invalid Data)"
echo "--------------------------------------"
INVALID_DATA='{"fullName": "Test", "email": "invalid-email"}'
VALIDATION_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/pis/leads" \
    -H "Content-Type: application/json" \
    -d "$INVALID_DATA")

if echo "$VALIDATION_RESPONSE" | grep -q '"success":false'; then
    print_test 0 "API validation working (rejected invalid data)"
else
    print_test 1 "API validation not working properly"
fi
echo ""

echo "Step 8: Testing GET All Leads Endpoint"
echo "--------------------------------------"
ALL_LEADS=$(curl -s "$API_URL/api/v1/pis/leads?limit=5")
if echo "$ALL_LEADS" | grep -q '"success":true' && echo "$ALL_LEADS" | grep -q '"data":\['; then
    print_test 0 "GET all leads endpoint working"
    LEAD_COUNT=$(echo "$ALL_LEADS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   📊 Total leads: $LEAD_COUNT"
else
    print_test 1 "GET all leads endpoint failed"
fi
echo ""

echo "Step 9: Testing Lead Update"
echo "--------------------------------------"
UPDATE_DATA='{"priority": "medium", "notes": "Updated by automation test"}'
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/v1/pis/leads/$LEAD_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Lead updated successfully"
else
    print_test 1 "Failed to update lead"
fi
echo ""

echo "Step 10: Testing Pagination"
echo "--------------------------------------"
PAGE_RESPONSE=$(curl -s "$API_URL/api/v1/pis/leads?page=1&limit=10")
if echo "$PAGE_RESPONSE" | grep -q '"currentPage":1' && echo "$PAGE_RESPONSE" | grep -q '"totalPages"'; then
    print_test 0 "Pagination working correctly"
else
    print_test 1 "Pagination not working"
fi
echo ""

echo "Step 11: Cleaning Up Test Data"
echo "--------------------------------------"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/v1/pis/leads/$LEAD_ID")
if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Test lead deleted successfully"
else
    print_test 1 "Failed to delete test lead"
fi
echo ""

echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}❌ Tests Failed: 0${NC}"
fi
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
echo "Success Rate: $SUCCESS_RATE% ($TESTS_PASSED/$TOTAL_TESTS)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Ready for next development phase.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED! Please review the errors above.${NC}"
    exit 1
fi
