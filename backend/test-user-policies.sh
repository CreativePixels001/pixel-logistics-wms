#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         USER POLICIES INTEGRATION TEST                         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get a client ID
echo "1️⃣  Getting test client ID..."
CLIENT_ID=$(curl -s http://localhost:5001/api/v1/pis/clients | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Client ID: $CLIENT_ID"
echo ""

# Create multiple policies for this client
echo "2️⃣  Creating test policies..."

# Policy 1 - Active (expires in 6 months)
echo "   → Creating active policy (expires in 6 months)..."
POLICY1=$(curl -s -X POST "http://localhost:5001/api/v1/pis/policies" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"insuranceType\": \"health\",
    \"policyType\": \"new\",
    \"insurerName\": \"Star Health Insurance\",
    \"planName\": \"Family Health Optima\",
    \"coverageAmount\": 500000,
    \"premium\": {
      \"basePremium\": 15000,
      \"gst\": 2700,
      \"totalPremium\": 17700
    },
    \"startDate\": \"2024-11-22\",
    \"endDate\": \"2025-05-22\",
    \"paymentMode\": \"annual\",
    \"paymentStatus\": \"paid\",
    \"claimsMade\": 0,
    \"agentName\": \"Test Agent\"
  }" | grep -o '"policyNumber":"[^"]*"' | cut -d'"' -f4)
echo "   ✓ Policy 1: $POLICY1"

# Policy 2 - Expiring soon (expires in 45 days)
echo "   → Creating expiring policy (45 days)..."
POLICY2=$(curl -s -X POST "http://localhost:5001/api/v1/pis/policies" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"insuranceType\": \"health\",
    \"policyType\": \"new\",
    \"insurerName\": \"HDFC Ergo\",
    \"planName\": \"Individual Health Plus\",
    \"coverageAmount\": 300000,
    \"premium\": {
      \"basePremium\": 12000,
      \"gst\": 2160,
      \"totalPremium\": 14160
    },
    \"startDate\": \"2024-12-15\",
    \"endDate\": \"2026-01-05\",
    \"paymentMode\": \"annual\",
    \"paymentStatus\": \"paid\",
    \"claimsMade\": 0,
    \"agentName\": \"Test Agent\"
  }" | grep -o '"policyNumber":"[^"]*"' | cut -d'"' -f4)
echo "   ✓ Policy 2: $POLICY2"

# Policy 3 - Expired (no NCB due to claim)
echo "   → Creating expired policy (with claim)..."
POLICY3=$(curl -s -X POST "http://localhost:5001/api/v1/pis/policies" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"insuranceType\": \"health\",
    \"policyType\": \"new\",
    \"insurerName\": \"Care Health Insurance\",
    \"planName\": \"Senior Citizen Health\",
    \"coverageAmount\": 200000,
    \"premium\": {
      \"basePremium\": 18000,
      \"gst\": 3240,
      \"totalPremium\": 21240
    },
    \"startDate\": \"2023-06-01\",
    \"endDate\": \"2024-06-01\",
    \"paymentMode\": \"annual\",
    \"paymentStatus\": \"paid\",
    \"claimsMade\": 2,
    \"agentName\": \"Test Agent\"
  }" | grep -o '"policyNumber":"[^"]*"' | cut -d'"' -f4)
echo "   ✓ Policy 3: $POLICY3"
echo ""

# Wait for DB to process
sleep 2

# Test the user policies endpoint
echo "3️⃣  Testing User Policies API..."
echo "   → GET /api/v1/pis/policies/user/$CLIENT_ID"
echo ""

curl -s -X GET "http://localhost:5001/api/v1/pis/policies/user/$CLIENT_ID" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        print('   ✅ API Call Successful')
        print('')
        print('   📊 STATISTICS:')
        stats = data.get('stats', {})
        print(f'   → Active Policies:    {stats.get(\"active\", 0)}')
        print(f'   → Expiring Soon:      {stats.get(\"expiring\", 0)}')
        print(f'   → Pending Renewal:    {stats.get(\"pendingRenewal\", 0)}')
        print(f'   → Total Coverage:     ₹{stats.get(\"totalCoverage\", 0):,}')
        print('')
        print('   �� POLICIES:')
        for i, policy in enumerate(data.get('policies', [])[:3], 1):
            print(f'   {i}. {policy.get(\"planName\", \"Unknown\")}')
            print(f'      Status: {policy.get(\"computedStatus\", \"unknown\")}')
            print(f'      Days until expiry: {policy.get(\"daysUntilExpiry\", \"N/A\")}')
            print(f'      NCB Eligible: {\"Yes\" if policy.get(\"eligibleForNCB\") else \"No\"}')
            print('')
    else:
        print('   ❌ API Call Failed')
        print(f'   Error: {data.get(\"message\", \"Unknown error\")}')
except Exception as e:
    print(f'   ❌ Error parsing response: {e}')
"

echo ""
echo "4️⃣  Saving userId for frontend testing..."
echo "$CLIENT_ID" > /tmp/test_user_id.txt
echo "   → UserId saved: $CLIENT_ID"
echo "   → Can be loaded in browser console:"
echo "     localStorage.setItem('userId', '$CLIENT_ID')"
echo ""

echo "✅ TEST COMPLETE!"
echo ""
echo "To test frontend:"
echo "1. Open http://localhost:8000/PIS/my-policies.html"
echo "2. Open browser console and run:"
echo "   localStorage.setItem('userId', '$CLIENT_ID'); location.reload();"
echo ""

