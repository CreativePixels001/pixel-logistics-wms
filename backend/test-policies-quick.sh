#!/bin/bash
# Pixel Safe - Policies API Test

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

echo "===== POLICIES API TEST ====="

# Create client
C=$(curl -s -X POST "$API/clients" -H "Content-Type: application/json" -d '{
  "fullName":"Policy Test","email":"pol.'$TS'@test.com","phone":"+919999888877",
  "dateOfBirth":"1985-05-15","gender":"male",
  "address":{"street":"Test","city":"Mumbai","state":"Maharashtra","pincode":"400001"},
  "kycStatus":"verified","panNumber":"ABCDE1234F","segment":"individual"
}')
CID=$(echo "$C" | jq -r '.data._id // empty')
echo "Client: $CID"

# Test 1: Health
H=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"health","clientId":"'$CID'",
  "clientName":"Test","clientEmail":"test@test.com","clientPhone":"99999",
  "insurerName":"Star","planName":"Health","coverageAmount":500000,
  "premium":{"basePremium":15000,"gst":2700,"totalPremium":17700},
  "startDate":"2025-12-01","endDate":"2026-11-30","status":"active"
}')
HID=$(echo "$H" | jq -r '.data._id // empty')
HNUM=$(echo "$H" | jq -r '.data.policyNumber // empty')
[ -n "$HID" ] && test_result 0 "Health: $HNUM" || test_result 1 "Health failed"

# Test 2: Motor
M=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"motor","clientId":"'$CID'",
  "clientName":"Test","clientEmail":"test@test.com","clientPhone":"99999",
  "insurerName":"ICICI","planName":"Car","coverageAmount":800000,
  "premium":{"basePremium":12500,"gst":2250,"totalPremium":14750},
  "startDate":"2025-12-01","endDate":"2026-11-30","status":"active",
  "vehicleDetails":{"vehicleType":"car","make":"Maruti","model":"Swift","year":2022,
  "registrationNumber":"MH01AB1234","fuelType":"petrol"}
}')
MID=$(echo "$M" | jq -r '.data._id // empty')
[ -n "$MID" ] && test_result 0 "Motor created" || test_result 1 "Motor failed"

# Test 3: Life
L=$(curl -s -X POST "$API/policies" -H "Content-Type: application/json" -d '{
  "policyType":"new","insuranceType":"life","clientId":"'$CID'",
  "clientName":"Test","clientEmail":"test@test.com","clientPhone":"99999",
  "insurerName":"LIC","planName":"Life","coverageAmount":2000000,
  "premium":{"basePremium":20000,"gst":3600,"totalPremium":23600},
  "startDate":"2025-12-01","endDate":"2045-11-30","status":"active"
}')
LID=$(echo "$L" | jq -r '.data._id // empty')
[ -n "$LID" ] && test_result 0 "Life created" || test_result 1 "Life failed"

# Test 4: Get All
ALL=$(curl -s "$API/policies")
CNT=$(echo "$ALL" | jq '.data | length')
[ "$CNT" -ge 3 ] && test_result 0 "Found $CNT policies" || test_result 1 "Get all failed"

# Test 5: Get by ID
DET=$(curl -s "$API/policies/$HID")
SUC=$(echo "$DET" | jq -r '.success')
[ "$SUC" = "true" ] && test_result 0 "Retrieved policy" || test_result 1 "Get by ID failed"

# Test 6: Filter
FILT=$(curl -s "$API/policies?insuranceType=motor")
MCNT=$(echo "$FILT" | jq '[.data[] | select(.insuranceType == "motor")] | length')
[ "$MCNT" -ge 1 ] && test_result 0 "Filtered: $MCNT motor" || test_result 1 "Filter failed"

# Test 7: Stats
ST=$(curl -s "$API/policies/stats")
TSUC=$(echo "$ST" | jq -r '.success')
[ "$TSUC" = "true" ] && test_result 0 "Stats retrieved" || test_result 1 "Stats failed"

# Test 8: Update
UPD=$(curl -s -X PUT "$API/policies/$HID" -H "Content-Type: application/json" -d '{
  "premium":{"basePremium":16000,"gst":2880,"totalPremium":18880}
}')
USUC=$(echo "$UPD" | jq -r '.success')
[ "$USUC" = "true" ] && test_result 0 "Updated premium" || test_result 1 "Update failed"

# Test 9: Expiring
EXP=$(curl -s "$API/policies/expiring?days=365")
ECNT=$(echo "$EXP" | jq '.data | length')
test_result 0 "Expiring: $ECNT policies"

# Test 10: Renew
REN=$(curl -s -X POST "$API/policies/$HID/renew" -H "Content-Type: application/json" -d '{
  "startDate":"2026-12-01","endDate":"2027-11-30",
  "premium":{"basePremium":17000,"gst":3060,"totalPremium":20060}
}')
NRID=$(echo "$REN" | jq -r '.data._id // empty')
NRNUM=$(echo "$REN" | jq -r '.data.policyNumber // empty')
[ -n "$NRID" ] && [ "$NRID" != "$HID" ] && test_result 0 "Renewed: $NRNUM" || test_result 1 "Renew failed"

# Test 11: Cancel
CAN=$(curl -s -X DELETE "$API/policies/$MID" -H "Content-Type: application/json" -d '{"reason":"Test"}')
CSTAT=$(echo "$CAN" | jq -r '.data.status // empty')
[ "$CSTAT" = "cancelled" ] && test_result 0 "Cancelled motor" || test_result 1 "Cancel failed"

# Test 12: Client Stats
CD=$(curl -s "$API/clients/$CID")
TPOL=$(echo "$CD" | jq -r '.data.totalPolicies // 0')
APOL=$(echo "$CD" | jq -r '.data.activePolicies // 0')
[ "$TPOL" -ge 3 ] && [ "$APOL" -ge 2 ] && test_result 0 "Stats: $TPOL total, $APOL active" || test_result 1 "Stats wrong"

# Cleanup
curl -s -X DELETE "$API/policies/$HID" > /dev/null
curl -s -X DELETE "$API/policies/$MID" > /dev/null
curl -s -X DELETE "$API/policies/$LID" > /dev/null
[ -n "$NRID" ] && curl -s -X DELETE "$API/policies/$NRID" > /dev/null
curl -s -X DELETE "$API/clients/$CID" > /dev/null

echo ""
echo "===== Results: $P/$T passed ====="
[ $P -eq $T ] && echo -e "${GREEN}✓ ALL PASSED (100%)${NC}" && exit 0
echo -e "${RED}✗ Some failed${NC}" && exit 1
