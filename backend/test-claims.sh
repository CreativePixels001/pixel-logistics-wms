#!/bin/bash
# Pixel Safe - Claims API Test

API="http://localhost:5001/api/v1/pis"
TS=$(date +%s)
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
P=0
T=0

test_result() {
    T=$((T + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        P=$((P + 1))
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo "===== CLAIMS API TEST ====="

# Create client
C=$(curl -s -X POST "$API/clients" -H "Content-Type: application/json" -d '{
  "fullName":"Claims Test Client","email":"claim.'$TS'@test.com","phone":"+919876543210",
  "dateOfBirth":"1990-01-15","gender":"male",
  "address":{"street":"Test St","city":"Mumbai","state":"Maharashtra","pincode":"400001"},
  "kycStatus":"verified","panNumber":"ABCDE5678G","segment":"individual"
}')
CID=$(echo "$C" | jq -r '.data._id // empty')
echo "Client: $CID"

# Create policy
POL=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"health","clientId":"'$CID'",
  "clientName":"Claims Test","clientEmail":"claim.'$TS'@test.com","clientPhone":"9876543210",
  "insurerName":"HDFC ERGO","planName":"Health Suraksha","coverageAmount":1000000,
  "premium":{"basePremium":25000,"gst":4500,"totalPremium":29500},
  "startDate":"2025-11-01","endDate":"2026-10-31","status":"active"
}')
PID=$(echo "$POL" | jq -r '.data._id // empty')
PNUM=$(echo "$POL" | jq -r '.data.policyNumber // empty')
echo "Policy: $PNUM"
echo ""

# Test 1: Create Health Claim (Cashless)
echo "Test 1: Health Claim (Cashless)..."
H=$(curl -s -X POST "$API/claims" -H "Content-Type: application/json" -d '{
  "policyId":"'$PID'","claimType":"cashless","incidentDate":"2025-11-20",
  "claimAmount":85000,
  "healthClaimDetails":{
    "hospitalName":"Apollo Hospital","hospitalCity":"Mumbai",
    "admissionDate":"2025-11-20","diseaseCategory":"surgery",
    "treatmentType":"inpatient","isCashless":true,
    "preAuthNumber":"PA123456"
  }
}')
HID=$(echo "$H" | jq -r '.data._id // empty')
HNUM=$(echo "$H" | jq -r '.data.claimNumber // empty')
[ -n "$HID" ] && test_result 0 "Health claim: $HNUM" || test_result 1 "Health claim failed"

# Test 2: Create Motor Claim
echo "Test 2: Motor Claim..."
# Create motor policy first
MPOL=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"motor","clientId":"'$CID'",
  "clientName":"Claims Test","clientEmail":"claim.'$TS'@test.com","clientPhone":"9876543210",
  "insurerName":"ICICI Lombard","planName":"Car Insurance","coverageAmount":800000,
  "premium":{"basePremium":14000,"gst":2520,"totalPremium":16520},
  "startDate":"2025-11-01","endDate":"2026-10-31","status":"active",
  "vehicleDetails":{"vehicleType":"car","make":"Honda","model":"City","year":2023,
  "registrationNumber":"MH02AB5678","fuelType":"petrol"}
}')
MPID=$(echo "$MPOL" | jq -r '.data._id // empty')

M=$(curl -s -X POST "$API/claims" -H "Content-Type: application/json" -d '{
  "policyId":"'$MPID'","claimType":"accidental","incidentDate":"2025-11-21",
  "claimAmount":65000,
  "motorClaimDetails":{
    "accidentLocation":"Western Express Highway","accidentCity":"Mumbai",
    "policeReportNumber":"FIR/2025/12345","workshopName":"Authorized Service Center",
    "estimatedRepairCost":65000,"thirdPartyInvolved":false
  }
}')
MID=$(echo "$M" | jq -r '.data._id // empty')
[ -n "$MID" ] && test_result 0 "Motor claim created" || test_result 1 "Motor claim failed"

# Test 3: Create Life Claim
echo "Test 3: Life Claim..."
LPOL=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"life","clientId":"'$CID'",
  "clientName":"Claims Test","clientEmail":"claim.'$TS'@test.com","clientPhone":"9876543210",
  "insurerName":"LIC India","planName":"Jeevan Anand","coverageAmount":5000000,
  "premium":{"basePremium":50000,"gst":9000,"totalPremium":59000},
  "startDate":"2020-11-01","endDate":"2040-10-31","status":"active"
}')
LPID=$(echo "$LPOL" | jq -r '.data._id // empty')

L=$(curl -s -X POST "$API/claims" -H "Content-Type: application/json" -d '{
  "policyId":"'$LPID'","claimType":"death","incidentDate":"2025-11-15",
  "claimAmount":5000000,
  "lifeClaimDetails":{
    "causeOfDeath":"Natural causes","deathCertificateNumber":"DC/2025/789",
    "deathDate":"2025-11-15","nomineeRelationship":"spouse",
    "nomineeName":"Nominee Test","nomineeAge":38
  }
}')
LID=$(echo "$L" | jq -r '.data._id // empty')
[ -n "$LID" ] && test_result 0 "Life claim created" || test_result 1 "Life claim failed"

# Test 4: Get All Claims
echo "Test 4: Get All..."
ALL=$(curl -s "$API/claims")
CNT=$(echo "$ALL" | jq '.data | length')
[ "$CNT" -ge 3 ] && test_result 0 "Found $CNT claims" || test_result 1 "Get all failed"

# Test 5: Get by ID
echo "Test 5: Get by ID..."
DET=$(curl -s "$API/claims/$HID")
SUC=$(echo "$DET" | jq -r '.success')
[ "$SUC" = "true" ] && test_result 0 "Retrieved claim" || test_result 1 "Get by ID failed"

# Test 6: Filter by status
echo "Test 6: Filter by status..."
FILT=$(curl -s "$API/claims?status=initiated")
ICNT=$(echo "$FILT" | jq '[.data[] | select(.status == "initiated")] | length')
[ "$ICNT" -ge 1 ] && test_result 0 "Filtered: $ICNT initiated" || test_result 1 "Filter failed"

# Test 7: Filter by insurance type
echo "Test 7: Filter by type..."
HFILT=$(curl -s "$API/claims?insuranceType=health")
HCNT=$(echo "$HFILT" | jq '[.data[] | select(.insuranceType == "health")] | length')
[ "$HCNT" -ge 1 ] && test_result 0 "Health claims: $HCNT" || test_result 1 "Type filter failed"

# Test 8: Get Stats
echo "Test 8: Statistics..."
ST=$(curl -s "$API/claims/stats")
TSUC=$(echo "$ST" | jq -r '.success')
[ "$TSUC" = "true" ] && test_result 0 "Stats retrieved" || test_result 1 "Stats failed"

# Test 9: Update Claim
echo "Test 9: Update claim..."
UPD=$(curl -s -X PUT "$API/claims/$HID" -H "Content-Type: application/json" -d '{
  "status":"under-review","priority":"high","updateRemarks":"Medical documents verified"
}')
USUC=$(echo "$UPD" | jq -r '.success')
[ "$USUC" = "true" ] && test_result 0 "Claim updated" || test_result 1 "Update failed"

# Test 10: Approve Claim
echo "Test 10: Approve claim..."
APP=$(curl -s -X POST "$API/claims/$HID/approve" -H "Content-Type: application/json" -d '{
  "approvedAmount":80000,"approvedBy":"Claims Manager","remarks":"Approved after verification"
}')
ASTAT=$(echo "$APP" | jq -r '.data.status // empty')
[ "$ASTAT" = "approved" ] && test_result 0 "Claim approved: ₹80,000" || test_result 1 "Approval failed"

# Test 11: Settle Claim
echo "Test 11: Settle claim..."
SET=$(curl -s -X POST "$API/claims/$HID/settle" -H "Content-Type: application/json" -d '{
  "settledAmount":80000,"settledBy":"Finance Team",
  "paymentDetails":{
    "paymentMode":"neft","accountHolderName":"Claims Test",
    "accountNumber":"1234567890","ifscCode":"HDFC0001234",
    "bankName":"HDFC Bank","utrNumber":"UTR123456789",
    "paymentDate":"2025-11-22","paymentStatus":"completed"
  }
}')
SSTAT=$(echo "$SET" | jq -r '.data.status // empty')
[ "$SSTAT" = "settled" ] && test_result 0 "Claim settled" || test_result 1 "Settlement failed"

# Test 12: Reject Claim
echo "Test 12: Reject claim..."
REJ=$(curl -s -X POST "$API/claims/$MID/reject" -H "Content-Type: application/json" -d '{
  "rejectionReason":"Pre-existing damage found","rejectedBy":"Surveyor"
}')
RSTAT=$(echo "$REJ" | jq -r '.data.status // empty')
[ "$RSTAT" = "rejected" ] && test_result 0 "Claim rejected" || test_result 1 "Rejection failed"

# Test 13: Get Pending Claims
echo "Test 13: Pending claims..."
PEND=$(curl -s "$API/claims/pending")
PCNT=$(echo "$PEND" | jq '.data | length')
test_result 0 "Pending claims: $PCNT"

# Test 14: Client Stats Updated
echo "Test 14: Client stats..."
CD=$(curl -s "$API/clients/$CID")
TCLAIM=$(echo "$CD" | jq -r '.data.totalClaims // 0')
TAMT=$(echo "$CD" | jq -r '.data.totalClaimAmount // 0')
[ "$TCLAIM" -ge 3 ] && test_result 0 "Client: $TCLAIM claims, ₹$TAMT" || test_result 1 "Stats wrong"

# Cleanup
echo ""
echo "Cleanup..."
curl -s -X DELETE "$API/claims/$HID" > /dev/null
curl -s -X DELETE "$API/claims/$MID" > /dev/null
curl -s -X DELETE "$API/claims/$LID" > /dev/null
curl -s -X DELETE "$API/policies/$PID" > /dev/null
curl -s -X DELETE "$API/policies/$MPID" > /dev/null
curl -s -X DELETE "$API/policies/$LPID" > /dev/null
curl -s -X DELETE "$API/clients/$CID" > /dev/null

echo ""
echo "===== Results: $P/$T passed ====="
[ $P -eq $T ] && echo -e "${GREEN}✓ ALL PASSED (100%)${NC}" && exit 0
echo -e "${RED}✗ Some failed${NC}" && exit 1
