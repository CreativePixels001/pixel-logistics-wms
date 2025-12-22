#!/bin/bash
# Automated Test Script for PIS Clients Flow
# Tests the complete end-to-end flow: Create Client → Verify → Success

echo "================================================"
echo "🧪 PIS CLIENTS FORM - AUTOMATION TEST"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5001"

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

echo "Step 1: Testing Clients API Availability"
echo "--------------------------------------"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "Backend server is running"
else
    print_test 1 "Backend server not available"
    exit 1
fi
echo ""

echo "Step 2: Getting Current Client Count"
echo "--------------------------------------"
BEFORE_COUNT=$(curl -s "$API_URL/api/v1/pis/clients" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "📊 Current clients in database: $BEFORE_COUNT"
echo ""

echo "Step 3: Creating Test Client (Individual) via API"
echo "--------------------------------------"
# Generate unique email with timestamp
TIMESTAMP=$(date +%s)
TEST_EMAIL="test.client.${TIMESTAMP}@pixelsafe.com"

TEST_CLIENT_DATA="{
    \"fullName\": \"Ramesh Kumar\",
    \"email\": \"${TEST_EMAIL}\",
    \"phone\": \"+91 98765 12345\",
    \"alternatePhone\": \"+91 98765 12346\",
    \"dateOfBirth\": \"1985-05-15\",
    \"gender\": \"male\",
    \"address\": {
        \"street\": \"123 MG Road\",
        \"city\": \"Mumbai\",
        \"state\": \"Maharashtra\",
        \"pincode\": \"400001\",
        \"country\": \"India\"
    },
    \"panNumber\": \"ABCDE1234F\",
    \"aadhaarNumber\": \"123456789012\",
    \"segment\": \"individual\",
    \"assignedAgent\": \"Agent John Doe\",
    \"notes\": \"Test client created via automation at $(date +%Y-%m-%d\ %H:%M:%S)\"
}"

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/pis/clients" \
    -H "Content-Type: application/json" \
    -d "$TEST_CLIENT_DATA")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Individual client created successfully"
    CLIENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   📝 Client ID: $CLIENT_ID"
else
    print_test 1 "Failed to create client"
    echo "   Response: $CREATE_RESPONSE"
    exit 1
fi
echo ""

echo "Step 4: Creating Corporate Client"
echo "--------------------------------------"
CORP_EMAIL="corp.client.${TIMESTAMP}@pixelsafe.com"
CORPORATE_CLIENT_DATA="{
    \"fullName\": \"Suresh Patel\",
    \"email\": \"${CORP_EMAIL}\",
    \"phone\": \"+91 99999 11111\",
    \"dateOfBirth\": \"1980-03-20\",
    \"gender\": \"male\",
    \"address\": {
        \"street\": \"456 Business Park\",
        \"city\": \"Bangalore\",
        \"state\": \"Karnataka\",
        \"pincode\": \"560001\",
        \"country\": \"India\"
    },
    \"panNumber\": \"XYZAB5678C\",
    \"segment\": \"corporate\",
    \"companyName\": \"Tech Solutions Pvt Ltd\",
    \"companyGSTIN\": \"29ABCDE1234F1Z5\"
}"

CORP_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/pis/clients" \
    -H "Content-Type: application/json" \
    -d "$CORPORATE_CLIENT_DATA")

if echo "$CORP_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Corporate client created successfully"
    CORP_CLIENT_ID=$(echo "$CORP_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
    print_test 1 "Failed to create corporate client"
fi
echo ""

echo "Step 5: Testing Duplicate Email Validation"
echo "--------------------------------------"
DUPLICATE_DATA="{
    \"fullName\": \"Duplicate Test\",
    \"email\": \"${TEST_EMAIL}\",
    \"phone\": \"+91 88888 88888\",
    \"dateOfBirth\": \"1990-01-01\",
    \"address\": {
        \"city\": \"Delhi\",
        \"state\": \"Delhi\",
        \"pincode\": \"110001\"
    },
    \"segment\": \"individual\"
}"

DUP_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/pis/clients" \
    -H "Content-Type: application/json" \
    -d "$DUPLICATE_DATA")

if echo "$DUP_RESPONSE" | grep -q "already exists"; then
    print_test 0 "Duplicate email validation working"
else
    print_test 1 "Duplicate email validation failed"
fi
echo ""

echo "Step 6: Verifying Client Count Increased"
echo "--------------------------------------"
sleep 1
AFTER_COUNT=$(curl -s "$API_URL/api/v1/pis/clients" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "📊 Clients after creation: $AFTER_COUNT"

if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
    print_test 0 "Client count increased from $BEFORE_COUNT to $AFTER_COUNT"
else
    print_test 1 "Client count did not increase"
fi
echo ""

echo "Step 7: Retrieving Client Details"
echo "--------------------------------------"
CLIENT_DETAILS=$(curl -s "$API_URL/api/v1/pis/clients/$CLIENT_ID")
if echo "$CLIENT_DETAILS" | grep -q "Ramesh Kumar"; then
    print_test 0 "Client details retrieved successfully"
    echo "   👤 Name: $(echo "$CLIENT_DETAILS" | grep -o '"fullName":"[^"]*"' | cut -d'"' -f4)"
    echo "   📧 Email: $(echo "$CLIENT_DETAILS" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    echo "   📍 City: $(echo "$CLIENT_DETAILS" | grep -o '"city":"[^"]*"' | head -1 | cut -d'"' -f4)"
    echo "   🏢 Segment: $(echo "$CLIENT_DETAILS" | grep -o '"segment":"[^"]*"' | cut -d'"' -f4)"
else
    print_test 1 "Failed to retrieve client details"
fi
echo ""

echo "Step 8: Testing Client Update"
echo "--------------------------------------"
UPDATE_DATA='{"kycStatus": "verified", "notes": "KYC verified by automation test"}'
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/v1/pis/clients/$CLIENT_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Client updated successfully"
else
    print_test 1 "Failed to update client"
fi
echo ""

echo "Step 9: Testing Filter by Segment"
echo "--------------------------------------"
SEGMENT_RESPONSE=$(curl -s "$API_URL/api/v1/pis/clients?segment=individual")
if echo "$SEGMENT_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Segment filter working correctly"
else
    print_test 1 "Segment filter failed"
fi
echo ""

echo "Step 10: Testing Client Statistics"
echo "--------------------------------------"
STATS_RESPONSE=$(curl -s "$API_URL/api/v1/pis/clients/stats")
if echo "$STATS_RESPONSE" | grep -q '"totalClients"'; then
    print_test 0 "Client statistics endpoint working"
    echo "   📊 $(echo "$STATS_RESPONSE" | grep -o '"totalClients":[0-9]*' | cut -d':' -f2) total clients"
else
    print_test 1 "Statistics endpoint failed"
fi
echo ""

echo "Step 11: Testing Search Functionality"
echo "--------------------------------------"
SEARCH_RESPONSE=$(curl -s "$API_URL/api/v1/pis/clients?search=Ramesh")
if echo "$SEARCH_RESPONSE" | grep -q "Ramesh Kumar"; then
    print_test 0 "Search functionality working"
else
    print_test 1 "Search functionality failed"
fi
echo ""

echo "Step 12: Cleaning Up Test Data"
echo "--------------------------------------"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/v1/pis/clients/$CLIENT_ID")
if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
    print_test 0 "Test client deactivated successfully"
else
    print_test 1 "Failed to deactivate client"
fi

if [ ! -z "$CORP_CLIENT_ID" ]; then
    curl -s -X DELETE "$API_URL/api/v1/pis/clients/$CORP_CLIENT_ID" > /dev/null
    echo "   🗑️  Corporate client also removed"
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
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Clients API ready for production.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED! Please review the errors above.${NC}"
    exit 1
fi
