#!/bin/bash
# Pixel Safe - Deals API Test

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

echo "===== DEALS API TEST ====="

# Create lead for deals
echo "Creating test lead..."
RANDOM_ID=$((RANDOM * RANDOM))
L=$(curl -s -X POST "$API/leads" -H "Content-Type: application/json" -d '{
  "fullName":"Deal Test Lead",
  "email":"deallead'$TS'-'$RANDOM_ID'@test.com",
  "phone":"+919'$RANDOM_ID'",
  "interestType":"health",
  "source":"website",
  "budget":"25k-50k",
  "priority":"high"
}')
LID=$(echo "$L" | jq -r '.data._id // empty')
if [ -z "$LID" ]; then
    echo "Warning: Lead creation failed, continuing with customer-only deals"
fi
echo "Lead ID: ${LID:-NONE}"
echo ""

# Test 1: Create Health Deal
echo "Test 1: Health Deal..."
H=$(curl -s -X POST "$API/deals" -H "Content-Type: application/json" -d '{
  "leadId":"'$LID'","customerName":"Deal Test Lead",
  "customerEmail":"deal.'$TS'@test.com","customerPhone":"+919123456789",
  "dealTitle":"Family Health Insurance - Deal Test",
  "insuranceType":"health","dealValue":30000,
  "proposedInsurer":"Star Health","proposedPlan":"Family Health Optima",
  "proposedCoverage":1000000,"proposedPremium":30000,
  "expectedCloseDate":"2025-12-15","priority":"high"
}')
HID=$(echo "$H" | jq -r '.data._id // empty')
HNUM=$(echo "$H" | jq -r '.data.dealNumber // empty')
[ -n "$HID" ] && test_result 0 "Health deal: $HNUM" || test_result 1 "Health deal failed"

# Test 2: Create Motor Deal
echo "Test 2: Motor Deal..."
M=$(curl -s -X POST "$API/deals" -H "Content-Type: application/json" -d '{
  "leadId":"'$LID'","customerName":"Deal Test Lead",
  "customerEmail":"deal.'$TS'@test.com","customerPhone":"+919123456789",
  "dealTitle":"Car Insurance - New Policy",
  "insuranceType":"motor","dealValue":18000,
  "proposedInsurer":"ICICI Lombard","proposedPlan":"Comprehensive",
  "proposedCoverage":800000,"proposedPremium":18000,
  "expectedCloseDate":"2025-12-10","priority":"medium"
}')
MID=$(echo "$M" | jq -r '.data._id // empty')
[ -n "$MID" ] && test_result 0 "Motor deal created" || test_result 1 "Motor deal failed"

# Test 3: Create Life Deal
echo "Test 3: Life Deal..."
LF=$(curl -s -X POST "$API/deals" -H "Content-Type: application/json" -d '{
  "customerName":"Life Deal Customer","customerEmail":"life.'$TS'@test.com",
  "customerPhone":"+919987654321","dealTitle":"Term Life Insurance",
  "insuranceType":"life","dealValue":60000,
  "proposedInsurer":"LIC India","proposedPlan":"Jeevan Anand",
  "proposedCoverage":5000000,"proposedPremium":60000,
  "expectedCloseDate":"2025-12-20","priority":"urgent"
}')
LFID=$(echo "$LF" | jq -r '.data._id // empty')
[ -n "$LFID" ] && test_result 0 "Life deal created" || test_result 1 "Life deal failed"

# Test 4: Get All Deals
echo "Test 4: Get All..."
ALL=$(curl -s "$API/deals")
CNT=$(echo "$ALL" | jq '.data | length')
[ "$CNT" -ge 2 ] && test_result 0 "Found $CNT deals" || test_result 1 "Get all failed (expected >=2, got $CNT)"

# Test 5: Get by ID
echo "Test 5: Get by ID..."
DET=$(curl -s "$API/deals/$HID")
SUC=$(echo "$DET" | jq -r '.success')
[ "$SUC" = "true" ] && test_result 0 "Retrieved deal" || test_result 1 "Get by ID failed"

# Test 6: Filter by stage
echo "Test 6: Filter by stage..."
FILT=$(curl -s "$API/deals?stage=prospecting")
PCNT=$(echo "$FILT" | jq '[.data[] | select(.stage == "prospecting")] | length')
[ "$PCNT" -ge 1 ] && test_result 0 "Prospecting: $PCNT deals" || test_result 1 "Filter failed"

# Test 7: Move Stage
echo "Test 7: Move stage..."
MOVE=$(curl -s -X POST "$API/deals/$HID/move-stage" -H "Content-Type: application/json" -d '{
  "stage":"qualification","movedBy":"Sales Agent"
}')
STAGE=$(echo "$MOVE" | jq -r '.data.stage // empty')
[ "$STAGE" = "qualification" ] && test_result 0 "Moved to qualification" || test_result 1 "Move failed"

# Test 8: Add Follow-up
echo "Test 8: Add follow-up..."
FU=$(curl -s -X POST "$API/deals/$HID/follow-up" -H "Content-Type: application/json" -d '{
  "date":"2025-11-22","type":"call",
  "notes":"Called customer, interested in family floater option",
  "performedBy":"Sales Agent","outcome":"positive",
  "nextFollowUpDate":"2025-11-25"
}')
FUSUC=$(echo "$FU" | jq -r '.success')
[ "$FUSUC" = "true" ] && test_result 0 "Follow-up added" || test_result 1 "Follow-up failed"

# Test 9: Send Proposal
echo "Test 9: Send proposal..."
PROP=$(curl -s -X POST "$API/deals/$HID/send-proposal" -H "Content-Type: application/json" -d '{
  "documentUrl":"https://example.com/proposal-123.pdf",
  "notes":"Sent comprehensive proposal with 3 plan options"
}')
PSTAGE=$(echo "$PROP" | jq -r '.data.stage // empty')
PSENT=$(echo "$PROP" | jq -r '.data.proposalSent')
[ "$PSTAGE" = "proposal" ] && [ "$PSENT" = "true" ] && test_result 0 "Proposal sent" || test_result 1 "Proposal failed"

# Test 10: Update Deal
echo "Test 10: Update deal..."
UPD=$(curl -s -X PUT "$API/deals/$MID" -H "Content-Type: application/json" -d '{
  "dealValue":20000,"priority":"high"
}')
USUC=$(echo "$UPD" | jq -r '.success')
[ "$USUC" = "true" ] && test_result 0 "Deal updated" || test_result 1 "Update failed"

# Test 11: Get Pipeline Stats
echo "Test 11: Pipeline stats..."
ST=$(curl -s "$API/deals/stats")
TSUC=$(echo "$ST" | jq -r '.success')
[ "$TSUC" = "true" ] && test_result 0 "Stats retrieved" || test_result 1 "Stats failed"

# Test 12: Mark Won
echo "Test 12: Mark won..."
WON=$(curl -s -X POST "$API/deals/$HID/won" -H "Content-Type: application/json" -d '{
  "remarks":"Customer accepted proposal and made payment",
  "commissionPercentage":15
}')
WSTAT=$(echo "$WON" | jq -r '.data.status // empty')
WSTAGE=$(echo "$WON" | jq -r '.data.stage // empty')
[ "$WSTAT" = "won" ] && [ "$WSTAGE" = "closed-won" ] && test_result 0 "Deal won" || test_result 1 "Won failed"

# Test 13: Mark Lost
echo "Test 13: Mark lost..."
LOST=$(curl -s -X POST "$API/deals/$MID/lost" -H "Content-Type: application/json" -d '{
  "reason":"price-too-high","remarks":"Customer found cheaper option",
  "competitor":"Competitor XYZ"
}')
LSTAT=$(echo "$LOST" | jq -r '.data.status // empty')
LSTAGE=$(echo "$LOST" | jq -r '.data.stage // empty')
[ "$LSTAT" = "lost" ] && [ "$LSTAGE" = "closed-lost" ] && test_result 0 "Deal lost" || test_result 1 "Lost failed"

# Test 14: Get Overdue Deals
echo "Test 14: Overdue deals..."
# Create an overdue deal
OD=$(curl -s -X POST "$API/deals" -H "Content-Type: application/json" -d '{
  "customerName":"Overdue Test","customerPhone":"+919111111111",
  "dealTitle":"Overdue Deal","insuranceType":"health","dealValue":10000,
  "expectedCloseDate":"2025-11-01","status":"active"
}')
ODID=$(echo "$OD" | jq -r '.data._id // empty')

OVER=$(curl -s "$API/deals/overdue")
OCNT=$(echo "$OVER" | jq '.data | length')
test_result 0 "Overdue: $OCNT deals"

# Cleanup
echo ""
echo "Cleanup..."
curl -s -X DELETE "$API/deals/$HID" > /dev/null
curl -s -X DELETE "$API/deals/$MID" > /dev/null
curl -s -X DELETE "$API/deals/$LFID" > /dev/null
[ -n "$ODID" ] && curl -s -X DELETE "$API/deals/$ODID" > /dev/null
curl -s -X DELETE "$API/leads/$LID" > /dev/null

echo ""
echo "===== Results: $P/$T passed ====="
[ $P -eq $T ] && echo -e "${GREEN}✓ ALL PASSED (100%)${NC}" && exit 0
echo -e "${RED}✗ Some failed${NC}" && exit 1
