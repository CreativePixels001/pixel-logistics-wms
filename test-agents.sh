#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:5001/api/v1/pis/agents"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PIS AGENTS MODULE TEST SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Create Admin Agent
echo -e "${YELLOW}Test 1: Create Admin Agent${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "email": "rajesh.kumar@pixelsafe.com",
    "phone": "9876543210",
    "password": "admin123",
    "role": "admin",
    "department": "admin",
    "licenseNumber": "LIC-ADMIN-2024-001",
    "dateOfBirth": "1985-05-15",
    "address": {
      "street": "MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "monthlyTargets": {
      "leads": 100,
      "policies": 20,
      "premium": 500000,
      "clients": 15
    }
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    ADMIN_ID=$(echo "$RESPONSE" | jq -r '.data._id')
    echo -e "${GREEN}✓ Admin Agent Created: $ADMIN_ID${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 2: Create Manager Agent
echo -e "${YELLOW}Test 2: Create Manager Agent${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": "priya.sharma@pixelsafe.com",
    "phone": "9876543211",
    "password": "manager123",
    "role": "manager",
    "department": "sales",
    "licenseNumber": "LIC-MGR-2024-001",
    "dateOfBirth": "1988-08-20",
    "address": {
      "street": "Indiranagar",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560038"
    },
    "monthlyTargets": {
      "leads": 80,
      "policies": 15,
      "premium": 400000,
      "clients": 12
    }
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    MANAGER_ID=$(echo "$RESPONSE" | jq -r '.data._id')
    echo -e "${GREEN}✓ Manager Agent Created: $MANAGER_ID${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 3: Create Senior Agent
echo -e "${YELLOW}Test 3: Create Senior Agent${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Amit",
    "lastName": "Patel",
    "email": "amit.patel@pixelsafe.com",
    "phone": "9876543212",
    "password": "senior123",
    "role": "senior-agent",
    "department": "sales",
    "reportingManager": "'"$MANAGER_ID"'",
    "licenseNumber": "LIC-SR-2024-001",
    "dateOfBirth": "1990-03-10",
    "address": {
      "street": "Koramangala",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560034"
    },
    "monthlyTargets": {
      "leads": 60,
      "policies": 12,
      "premium": 300000,
      "clients": 10
    },
    "performance": {
      "totalLeads": 45,
      "convertedLeads": 10,
      "totalClients": 8,
      "totalPoliciesIssued": 10,
      "totalPremiumCollected": 250000,
      "totalCommissionEarned": 25000
    }
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    SENIOR_ID=$(echo "$RESPONSE" | jq -r '.data._id')
    echo -e "${GREEN}✓ Senior Agent Created: $SENIOR_ID${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 4: Create Regular Agent 1
echo -e "${YELLOW}Test 4: Create Regular Agent 1${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sneha",
    "lastName": "Reddy",
    "email": "sneha.reddy@pixelsafe.com",
    "phone": "9876543213",
    "password": "agent123",
    "role": "agent",
    "department": "sales",
    "reportingManager": "'"$SENIOR_ID"'",
    "licenseNumber": "LIC-AGT-2024-001",
    "dateOfBirth": "1995-07-22",
    "address": {
      "street": "Whitefield",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560066"
    },
    "monthlyTargets": {
      "leads": 40,
      "policies": 8,
      "premium": 200000,
      "clients": 6
    },
    "performance": {
      "totalLeads": 32,
      "convertedLeads": 6,
      "totalClients": 5,
      "totalPoliciesIssued": 6,
      "totalPremiumCollected": 150000,
      "totalCommissionEarned": 15000
    }
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Agent 1 Created${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 5: Create Regular Agent 2
echo -e "${YELLOW}Test 5: Create Regular Agent 2${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Vikram",
    "lastName": "Singh",
    "email": "vikram.singh@pixelsafe.com",
    "phone": "9876543214",
    "password": "agent123",
    "role": "agent",
    "department": "renewals",
    "reportingManager": "'"$MANAGER_ID"'",
    "licenseNumber": "LIC-AGT-2024-002",
    "dateOfBirth": "1993-11-08",
    "address": {
      "street": "HSR Layout",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560102"
    },
    "monthlyTargets": {
      "leads": 50,
      "policies": 10,
      "premium": 250000,
      "clients": 8
    },
    "performance": {
      "totalLeads": 38,
      "convertedLeads": 8,
      "totalClients": 7,
      "totalPoliciesIssued": 8,
      "totalPremiumCollected": 200000,
      "totalCommissionEarned": 20000
    }
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Agent 2 Created${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 6: Get All Agents
echo -e "${YELLOW}Test 6: Get All Agents${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE}")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    TOTAL=$(echo "$RESPONSE" | jq -r '.pagination.total')
    echo -e "${GREEN}✓ Total Agents: $TOTAL${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}\n"
fi

# Test 7: Get Agent Stats
echo -e "${YELLOW}Test 7: Get Agent Statistics${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE}/stats")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "$RESPONSE" | jq '.data.performance[0]'
    echo -e "${GREEN}✓ Statistics Retrieved${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}\n"
fi

# Test 8: Test Agent Login
echo -e "${YELLOW}Test 8: Agent Login${NC}"
RESPONSE=$(curl -s -X POST "${API_BASE}/login" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "AGENT0001",
    "password": "admin123"
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    AGENT_NAME=$(echo "$RESPONSE" | jq -r '.data.firstName + " " + .data.lastName')
    echo -e "${GREEN}✓ Login Successful: $AGENT_NAME${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "$RESPONSE" | jq '.'
    echo ""
fi

# Test 9: Search Agents
echo -e "${YELLOW}Test 9: Search Agents (keyword: 'agent')${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE}?search=agent")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    FOUND=$(echo "$RESPONSE" | jq -r '.pagination.total')
    echo -e "${GREEN}✓ Found $FOUND agents${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}\n"
fi

# Test 10: Filter by Role
echo -e "${YELLOW}Test 10: Filter Agents by Role (agent)${NC}"
RESPONSE=$(curl -s -X GET "${API_BASE}?role=agent")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.pagination.total')
    echo -e "${GREEN}✓ Found $COUNT regular agents${NC}\n"
else
    echo -e "${RED}✗ Failed${NC}\n"
fi

# Test 11: Get Agent Performance
if [ ! -z "$SENIOR_ID" ]; then
    echo -e "${YELLOW}Test 11: Get Agent Performance${NC}"
    RESPONSE=$(curl -s -X GET "${API_BASE}/${SENIOR_ID}/performance")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo "$RESPONSE" | jq '{
            agent: .data.agent.firstName + " " + .data.agent.lastName,
            leadsProgress: .data.targetProgress.leads,
            policiesProgress: .data.targetProgress.policies,
            conversionRate: .data.performance.conversionRate
        }'
        echo -e "${GREEN}✓ Performance Data Retrieved${NC}\n"
    else
        echo -e "${RED}✗ Failed${NC}\n"
    fi
fi

# Test 12: Update Performance
if [ ! -z "$SENIOR_ID" ]; then
    echo -e "${YELLOW}Test 12: Update Agent Performance${NC}"
    RESPONSE=$(curl -s -X PUT "${API_BASE}/${SENIOR_ID}/performance" \
      -H "Content-Type: application/json" \
      -d '{
        "totalLeads": 50,
        "convertedLeads": 12,
        "totalClients": 10,
        "totalPoliciesIssued": 12,
        "totalPremiumCollected": 300000,
        "totalCommissionEarned": 30000
      }')
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        CONV_RATE=$(echo "$RESPONSE" | jq -r '.data.performance.conversionRate')
        echo -e "${GREEN}✓ Performance Updated - Conversion Rate: ${CONV_RATE}%${NC}\n"
    else
        echo -e "${RED}✗ Failed${NC}\n"
    fi
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST SUITE COMPLETED${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}All agent management tests executed!${NC}"
echo -e "\n${YELLOW}Frontend URL:${NC} http://localhost:8000/PIS/agents.html"
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  Admin: AGENT0001 / admin123"
echo -e "  Manager: AGENT0002 / manager123"
echo -e "  Senior Agent: AGENT0003 / senior123"
echo ""
