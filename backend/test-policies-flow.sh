#!/bin/bash

# Pixel Safe - Policies API Flow Test
# Tests all endpoints in the policies module

set -e

API_BASE="http://localhost:5001/api/v1/pis"
TIMESTAMP=$(date +%s)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to print test results
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "========================================="
echo "   PIXEL SAFE - POLICIES API TEST"
echo "========================================="
echo ""

# First, create a test client to link policies to
echo "Creating test client for policy linkage..."
CLIENT_RESPONSE=$(curl -s -X POST "$API_BASE/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Policy Client",
    "email": "policy.test.'$TIMESTAMP'@pixelsafe.com",
    "phone": "+919999888877",
    "dateOfBirth": "1980-05-15",
    "gender": "male",
    "address": {
      "street": "123 Test Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "kycStatus": "verified",
    "panNumber": "ABCDE1234F",
    "aadhaarNumber": "123456789012",
    "segment": "individual"
  }')

CLIENT_ID=$(echo $CLIENT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}Failed to create test client${NC}"
    exit 1
fi

echo -e "${GREEN}Test client created: $CLIENT_ID${NC}"
echo ""

# Test 1: Create Health Insurance Policy
echo "Test 1: Creating Health Insurance Policy..."
HEALTH_POLICY=$(curl -s -X POST "$API_BASE/policies" \
  -H "Content-Type: application/json" \
  -d '{
    "policyType": "new",
    "insuranceType": "health",
    "clientId": "'$CLIENT_ID'",
    "clientName": "Test Policy Client",
    "clientEmail": "policy.test.'$TIMESTAMP'@pixelsafe.com",
    "clientPhone": "+919999888877",
    "insurerName": "Star Health Insurance",
    "planName": "Super Health Plus",
    "coverageAmount": 500000,
    "premium": {
      "basePremium": 15000,
      "gst": 2700,
      "totalPremium": 17700
    },
    "startDate": "2024-01-15",
    "endDate": "2025-01-14",
    "status": "active",
    "healthDetails": {
      "familyMembers": [
        {
          "name": "Test Policy Client",
          "relationship": "self",
          "age": 44,
          "preExistingConditions": ["None"]
        }
      ],
      "roomType": "single-private",
      "hasCashlessNetwork": true
    },
    "nomineeDetails": {
      "name": "Nominee Name",
      "relationship": "spouse",
      "age": 40,
      "share": 100
    }
  }')

HEALTH_POLICY_ID=$(echo $HEALTH_POLICY | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
POLICY_NUMBER=$(echo $HEALTH_POLICY | grep -o '"policyNumber":"[^"]*' | cut -d'"' -f4)

if [ -n "$HEALTH_POLICY_ID" ]; then
    test_result 0 "Health policy created with number: $POLICY_NUMBER"
else
    test_result 1 "Health policy creation failed"
fi

# Test 2: Create Motor Insurance Policy
echo ""
echo "Test 2: Creating Motor Insurance Policy..."
MOTOR_POLICY=$(curl -s -X POST "$API_BASE/policies" \
  -H "Content-Type: application/json" \
  -d '{
    "policyType": "new",
    "insuranceType": "motor",
    "clientId": "'$CLIENT_ID'",
    "clientName": "Test Policy Client",
    "clientEmail": "policy.test.'$TIMESTAMP'@pixelsafe.com",
    "clientPhone": "+919999888877",
    "insurerName": "ICICI Lombard",
    "planName": "Comprehensive Car Insurance",
    "coverageAmount": 800000,
    "premium": {
      "basePremium": 12500,
      "gst": 2250,
      "totalPremium": 14750
    },
    "startDate": "2024-02-01",
    "endDate": "2025-01-31",
    "status": "active",
    "vehicleDetails": {
      "vehicleType": "car",
      "make": "Maruti Suzuki",
      "model": "Swift VXI",
      "year": 2022,
      "registrationNumber": "MH-01-AB-1234",
      "engineNumber": "ABC123456",
      "chassisNumber": "XYZ987654",
      "fuelType": "petrol",
      "hasPreviousClaim": false
    },
    "nomineeDetails": {
      "name": "Nominee Name",
      "relationship": "spouse",
      "age": 40,
      "share": 100
    }
  }')

MOTOR_POLICY_ID=$(echo $MOTOR_POLICY | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$MOTOR_POLICY_ID" ]; then
    test_result 0 "Motor policy created successfully"
else
    test_result 1 "Motor policy creation failed"
fi

# Test 3: Create Life Insurance Policy
echo ""
echo "Test 3: Creating Life Insurance Policy..."
LIFE_POLICY=$(curl -s -X POST "$API_BASE/policies" \
  -H "Content-Type: application/json" \
  -d '{
    "policyType": "new",
    "insuranceType": "life",
    "clientId": "'$CLIENT_ID'",
    "clientName": "Test Policy Client",
    "clientEmail": "policy.test.'$TIMESTAMP'@pixelsafe.com",
    "clientPhone": "+919999888877",
    "insurerName": "LIC India",
    "planName": "Life Protector Plus",
    "coverageAmount": 2000000,
    "premium": {
      "basePremium": 20000,
      "gst": 3600,
      "totalPremium": 23600
    },
    "startDate": "2024-01-01",
    "endDate": "2044-12-31",
    "status": "active",
    "nomineeDetails": {
      "name": "Spouse Nominee",
      "relationship": "spouse",
      "age": 40,
      "share": 100
    }
  }')

LIFE_POLICY_ID=$(echo $LIFE_POLICY | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$LIFE_POLICY_ID" ]; then
    test_result 0 "Life policy created successfully"
else
    test_result 1 "Life policy creation failed"
fi

# Test 4: Get All Policies
echo ""
echo "Test 4: Retrieving all policies..."
ALL_POLICIES=$(curl -s "$API_BASE/policies")
POLICY_COUNT=$(echo $ALL_POLICIES | grep -o '"_id":"' | wc -l | tr -d ' ')

if [ "$POLICY_COUNT" -ge 3 ]; then
    test_result 0 "Retrieved $POLICY_COUNT policies"
else
    test_result 1 "Failed to retrieve policies (expected >= 3, got $POLICY_COUNT)"
fi

# Test 5: Get Policy by ID
echo ""
echo "Test 5: Retrieving health policy details..."
POLICY_DETAILS=$(curl -s "$API_BASE/policies/$HEALTH_POLICY_ID")
HAS_CLIENT=$(echo $POLICY_DETAILS | grep -c "fullName" || true)

if [ "$HAS_CLIENT" -ge 1 ]; then
    test_result 0 "Policy details retrieved with client population"
else
    test_result 1 "Failed to retrieve policy details"
fi

# Test 6: Filter Policies by Insurance Type
echo ""
echo "Test 6: Filtering policies by insurance type (motor)..."
MOTOR_POLICIES=$(curl -s "$API_BASE/policies?insuranceType=motor")
MOTOR_COUNT=$(echo $MOTOR_POLICIES | grep -o '"insuranceType":"motor"' | wc -l | tr -d ' ')

if [ "$MOTOR_COUNT" -ge 1 ]; then
    test_result 0 "Filtered motor policies: $MOTOR_COUNT"
else
    test_result 1 "Motor policy filtering failed"
fi

# Test 7: Filter Active Policies
echo ""
echo "Test 7: Filtering active policies..."
ACTIVE_POLICIES=$(curl -s "$API_BASE/policies?status=active")
ACTIVE_COUNT=$(echo $ACTIVE_POLICIES | grep -o '"status":"active"' | wc -l | tr -d ' ')

if [ "$ACTIVE_COUNT" -ge 3 ]; then
    test_result 0 "Active policies found: $ACTIVE_COUNT"
else
    test_result 1 "Active policy filtering failed"
fi

# Test 8: Get Policies Statistics
echo ""
echo "Test 8: Retrieving policy statistics..."
STATS=$(curl -s "$API_BASE/policies/stats")
HAS_STATS=$(echo $STATS | grep -c "totalPolicies" || true)

if [ "$HAS_STATS" -ge 1 ]; then
    test_result 0 "Policy statistics retrieved successfully"
else
    test_result 1 "Failed to retrieve policy statistics"
fi

# Test 9: Update Policy
echo ""
echo "Test 9: Updating health policy..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/policies/$HEALTH_POLICY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "premium": {
      "basePremium": 16000,
      "gst": 2880,
      "totalPremium": 18880
    }
  }')

NEW_PREMIUM=$(echo $UPDATE_RESPONSE | grep -o '"totalPremium":18880' || true)

if [ -n "$NEW_PREMIUM" ]; then
    test_result 0 "Policy premium updated to ₹18,880"
else
    test_result 1 "Policy update failed"
fi

# Test 10: Get Expiring Policies
echo ""
echo "Test 10: Checking expiring policies (within 365 days)..."
EXPIRING=$(curl -s "$API_BASE/policies/expiring?days=365")
EXPIRING_COUNT=$(echo $EXPIRING | grep -o '"_id":"' | wc -l | tr -d ' ')

if [ "$EXPIRING_COUNT" -ge 1 ]; then
    test_result 0 "Found $EXPIRING_COUNT expiring policies"
else
    test_result 1 "No expiring policies found"
fi

# Test 11: Renew Policy
echo ""
echo "Test 11: Renewing health policy..."
RENEWAL=$(curl -s -X POST "$API_BASE/policies/$HEALTH_POLICY_ID/renew" \
  -H "Content-Type: application/json" \
  -d '{
    "newBasePremium": 17000,
    "newCoverageAmount": 600000,
    "startDate": "2025-01-15",
    "endDate": "2026-01-14"
  }')

NEW_POLICY_ID=$(echo $RENEWAL | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
NEW_POLICY_NUMBER=$(echo $RENEWAL | grep -o '"policyNumber":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_POLICY_ID" ] && [ "$NEW_POLICY_ID" != "$HEALTH_POLICY_ID" ]; then
    test_result 0 "Policy renewed with new number: $NEW_POLICY_NUMBER"
else
    test_result 1 "Policy renewal failed"
fi

# Test 12: Cancel Policy
echo ""
echo "Test 12: Cancelling motor policy..."
CANCEL_RESPONSE=$(curl -s -X POST "$API_BASE/policies/$MOTOR_POLICY_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Vehicle sold"
  }')

IS_CANCELLED=$(echo $CANCEL_RESPONSE | grep -c '"status":"cancelled"' || true)

if [ "$IS_CANCELLED" -ge 1 ]; then
    test_result 0 "Motor policy cancelled successfully"
else
    test_result 1 "Policy cancellation failed"
fi

# Test 13: Verify Client Stats Updated
echo ""
echo "Test 13: Verifying client policy stats updated..."
CLIENT_DETAILS=$(curl -s "$API_BASE/clients/$CLIENT_ID")
TOTAL_POLICIES=$(echo $CLIENT_DETAILS | grep -o '"totalPolicies":[0-9]*' | grep -o '[0-9]*')
ACTIVE_POLICIES=$(echo $CLIENT_DETAILS | grep -o '"activePolicies":[0-9]*' | grep -o '[0-9]*')

if [ "$TOTAL_POLICIES" -ge 3 ] && [ "$ACTIVE_POLICIES" -ge 2 ]; then
    test_result 0 "Client stats: $TOTAL_POLICIES total, $ACTIVE_POLICIES active"
else
    test_result 1 "Client stats not updated correctly"
fi

# Cleanup
echo ""
echo "Cleaning up test data..."
curl -s -X DELETE "$API_BASE/policies/$HEALTH_POLICY_ID" > /dev/null
curl -s -X DELETE "$API_BASE/policies/$MOTOR_POLICY_ID" > /dev/null
curl -s -X DELETE "$API_BASE/policies/$LIFE_POLICY_ID" > /dev/null
if [ -n "$NEW_POLICY_ID" ]; then
    curl -s -X DELETE "$API_BASE/policies/$NEW_POLICY_ID" > /dev/null
fi
curl -s -X DELETE "$API_BASE/clients/$CLIENT_ID" > /dev/null

# Summary
echo ""
echo "========================================="
echo "           TEST SUMMARY"
echo "========================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ ALL TESTS PASSED! (100%)${NC}"
    echo "========================================="
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    echo "========================================="
    exit 1
fi
