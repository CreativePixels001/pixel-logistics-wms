#!/bin/bash

# Renewals API Test Script
# Tests all renewal reminder and tracking endpoints

API="http://localhost:5001/api/v1/pis"
TS=$(date +%s)

echo "===== RENEWALS API TEST ====="

# Create client for testing
echo "Creating test client..."
C=$(curl -s -X POST "$API/clients" -H "Content-Type: application/json" -d '{
  "name":"Renewal Test Client",
  "email":"renewal'$TS'@test.com",
  "phone":"+919876543210",
  "dateOfBirth":"1980-01-01",
  "gender":"male",
  "address":{"street":"Test St","city":"Mumbai","state":"Maharashtra","pincode":"400001"}
}')
CID=$(echo "$C" | jq -r '.data._id // empty')
echo "Client: $CID"

# Create policy for testing (expiring in 20 days)
EXPIRY_DATE=$(date -v+20d -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -d "+20 days" -u +"%Y-%m-%dT%H:%M:%S.000Z")
P=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "clientId":"'$CID'",
  "insuranceType":"health",
  "policyType":"Individual Health",
  "insurerName":"Star Health Insurance",
  "policyHolderName":"Renewal Test Client",
  "sumInsured":500000,
  "premiumAmount":12000,
  "premiumFrequency":"annual",
  "startDate":"2024-01-01",
  "endDate":"'$EXPIRY_DATE'",
  "status":"active"
}')
PID=$(echo "$P" | jq -r '.data._id // empty')
PNUM=$(echo "$P" | jq -r '.data.policyNumber // empty')
echo "Policy: $PID ($PNUM)"
echo ""

# Test 1: Create Health Insurance Renewal
echo "Test 1: Health Renewal..."
R1=$(curl -s -X POST "$API/renewals" -H "Content-Type: application/json" -d '{
  "policyId":"'$PID'",
  "clientId":"'$CID'",
  "policyNumber":"'$PNUM'",
  "currentExpiryDate":"'$EXPIRY_DATE'",
  "insuranceType":"health",
  "policyType":"Individual Health",
  "currentPremium":12000,
  "proposedPremium":13200,
  "priority":"high"
}')
RID=$(echo "$R1" | jq -r '.data._id // empty')
RNUM=$(echo "$R1" | jq -r '.data.renewalNumber // empty')
if [ -n "$RID" ]; then
  echo "✓ Health renewal: $RNUM"
else
  echo "✗ Health renewal failed"
fi

# Test 2: Create Motor Insurance Renewal (expiring in 60 days)
MOTOR_EXPIRY=$(date -v+60d -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -d "+60 days" -u +"%Y-%m-%dT%H:%M:%S.000Z")
R2=$(curl -s -X POST "$API/renewals" -H "Content-Type: application/json" -d '{
  "policyId":"'$PID'",
  "clientId":"'$CID'",
  "policyNumber":"'$PNUM'",
  "currentExpiryDate":"'$MOTOR_EXPIRY'",
  "insuranceType":"motor",
  "policyType":"Comprehensive Motor",
  "currentPremium":8500,
  "proposedPremium":8000,
  "priority":"medium"
}')
RID2=$(echo "$R2" | jq -r '.data._id // empty')
if [ -n "$RID2" ]; then
  echo "✓ Motor renewal created"
else
  echo "✗ Motor renewal failed"
fi

# Test 3: Get All Renewals
echo "Test 3: Get All..."
R3=$(curl -s -X GET "$API/renewals")
COUNT=$(echo "$R3" | jq -r '.count // 0')
if [ "$COUNT" -ge 2 ]; then
  echo "✓ Found $COUNT renewals"
else
  echo "✗ Get all failed"
fi

# Test 4: Get by ID
echo "Test 4: Get by ID..."
R4=$(curl -s -X GET "$API/renewals/$RID")
FETCHED_NUM=$(echo "$R4" | jq -r '.data.renewalNumber // empty')
if [ "$FETCHED_NUM" = "$RNUM" ]; then
  echo "✓ Retrieved renewal"
else
  echo "✗ Get by ID failed"
fi

# Test 5: Filter by status
echo "Test 5: Filter by status..."
R5=$(curl -s -X GET "$API/renewals?status=pending")
PENDING_COUNT=$(echo "$R5" | jq -r '.count // 0')
if [ "$PENDING_COUNT" -ge 2 ]; then
  echo "✓ Pending: $PENDING_COUNT renewals"
else
  echo "✗ Filter failed"
fi

# Test 6: Filter by insurance type
echo "Test 6: Filter by type..."
R6=$(curl -s -X GET "$API/renewals?insuranceType=health")
HEALTH_COUNT=$(echo "$R6" | jq -r '.count // 0')
if [ "$HEALTH_COUNT" -ge 1 ]; then
  echo "✓ Health renewals: $HEALTH_COUNT"
else
  echo "✗ Type filter failed"
fi

# Test 7: Send notification
echo "Test 7: Send notification..."
R7=$(curl -s -X POST "$API/renewals/$RID/notify" -H "Content-Type: application/json" -d '{
  "type":"email",
  "recipientEmail":"renewal'$TS'@test.com",
  "subject":"Policy Renewal Reminder",
  "message":"Your policy is expiring soon. Please renew.",
  "templateUsed":"renewal-reminder"
}')
NOTIF_STATUS=$(echo "$R7" | jq -r '.data.status // empty')
if [ "$NOTIF_STATUS" = "notified" ]; then
  echo "✓ Notification sent"
else
  echo "✗ Notification failed"
fi

# Test 8: Record customer response
echo "Test 8: Record response..."
R8=$(curl -s -X POST "$API/renewals/$RID/response" -H "Content-Type: application/json" -d '{
  "interestedInRenewal":true,
  "responseMethod":"phone",
  "comments":"Customer wants to renew with increased coverage"
}')
RESPONSE_STATUS=$(echo "$R8" | jq -r '.data.status // empty')
if [ "$RESPONSE_STATUS" = "interested" ]; then
  echo "✓ Response recorded"
else
  echo "✗ Response failed"
fi

# Test 9: Add follow-up
echo "Test 9: Add follow-up..."
R9=$(curl -s -X POST "$API/renewals/$RID/follow-up" -H "Content-Type: application/json" -d '{
  "followUpType":"call",
  "notes":"Discussed coverage options and premium",
  "outcome":"Positive - customer interested in renewal",
  "nextFollowUpDate":"'$(date -v+3d -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -d "+3 days" -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
}')
FOLLOWUP_COUNT=$(echo "$R9" | jq -r '.data.followUps | length')
if [ "$FOLLOWUP_COUNT" -ge 1 ]; then
  echo "✓ Follow-up added"
else
  echo "✗ Follow-up failed"
fi

# Test 10: Update renewal
echo "Test 10: Update renewal..."
R10=$(curl -s -X PUT "$API/renewals/$RID" -H "Content-Type: application/json" -d '{
  "proposedPremium":12500,
  "priority":"urgent"
}')
UPDATED_PREMIUM=$(echo "$R10" | jq -r '.data.proposedPremium // 0')
if [ "$UPDATED_PREMIUM" = "12500" ]; then
  echo "✓ Renewal updated"
else
  echo "✗ Update failed"
fi

# Test 11: Get pending renewals
echo "Test 11: Pending renewals..."
R11=$(curl -s -X GET "$API/renewals/pending")
PENDING=$(echo "$R11" | jq -r '.count // 0')
if [ "$PENDING" -ge 1 ]; then
  echo "✓ Pending: $PENDING renewals"
else
  echo "✗ Pending failed"
fi

# Test 12: Mark as renewed
echo "Test 12: Mark renewed..."
R12=$(curl -s -X POST "$API/renewals/$RID2/renewed" -H "Content-Type: application/json" -d '{
  "newPolicyId":"'$PID'",
  "newPolicyNumber":"PS-MO-'$TS'-999",
  "finalPremium":8000,
  "paymentMethod":"credit-card",
  "paymentStatus":"completed"
}')
RENEWED_STATUS=$(echo "$R12" | jq -r '.data.status // empty')
if [ "$RENEWED_STATUS" = "renewed" ]; then
  echo "✓ Marked renewed"
else
  echo "✗ Mark renewed failed"
fi

# Test 13: Get renewal statistics
echo "Test 13: Renewal stats..."
R13=$(curl -s -X GET "$API/renewals/stats")
TOTAL=$(echo "$R13" | jq -r '.data.totalRenewals // 0')
if [ "$TOTAL" -ge 2 ]; then
  echo "✓ Stats retrieved"
else
  echo "✗ Stats failed"
fi

# Test 14: Get overdue renewals
echo "Test 14: Overdue renewals..."
R14=$(curl -s -X GET "$API/renewals/overdue")
SUCCESS=$(echo "$R14" | jq -r '.success // false')
if [ "$SUCCESS" = "true" ]; then
  OVERDUE=$(echo "$R14" | jq -r '.count // 0')
  echo "✓ Overdue: $OVERDUE renewals"
else
  echo "✗ Overdue failed"
fi

# Cleanup
echo ""
echo "Cleanup..."
curl -s -X DELETE "$API/renewals/$RID" > /dev/null
curl -s -X DELETE "$API/renewals/$RID2" > /dev/null
curl -s -X DELETE "$API/policies/$PID" > /dev/null
curl -s -X DELETE "$API/clients/$CID" > /dev/null

# Count tests
PASSED=$(grep -c "✓" <<< "$(cat)")
TOTAL_TESTS=14

echo ""
if [ "$PASSED" = "$TOTAL_TESTS" ]; then
  echo "===== Results: $PASSED/$TOTAL_TESTS passed ====="
  echo "✓ ALL PASSED (100%)"
  exit 0
else
  echo "===== Results: $PASSED/$TOTAL_TESTS passed ====="
  echo "✗ Some failed"
  exit 1
fi
