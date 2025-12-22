#!/bin/bash

# Document Storage System Test Script
# Tests all document upload, management, and retrieval endpoints

API_BASE="http://localhost:3000/api/v1/tms/documents"
UPLOAD_DIR="test-documents"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Document Storage System Test"
echo "========================================"
echo ""

# Create test directory and sample files
mkdir -p "$UPLOAD_DIR"

echo "Creating test files..."
echo "Sample insurance certificate" > "$UPLOAD_DIR/insurance.txt"
echo "Sample driver license" > "$UPLOAD_DIR/license.txt"
echo "Sample POD document" > "$UPLOAD_DIR/pod.txt"
echo "Sample BOL document" > "$UPLOAD_DIR/bol.txt"
echo -e "${GREEN}✓${NC} Test files created\n"

# Test 1: Health Check
echo "Test 1: Server Health Check"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "success"; then
    echo -e "${GREEN}✓ Server is running${NC}\n"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi

# Test 2: Upload Single Document
echo "Test 2: Upload Single Document"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/upload" \
  -F "file=@$UPLOAD_DIR/insurance.txt" \
  -F "documentType=insurance" \
  -F "category=carrier" \
  -F "entityType=carrier" \
  -F "entityId=CARR-2024-00001" \
  -F "entityName=ABC Trucking LLC" \
  -F "expiryDate=2025-12-31" \
  -F "issueDate=2024-01-15" \
  -F "issuingAuthority=Progressive Insurance" \
  -F "documentId=POL-123456789" \
  -F "tags=auto-liability,verified")

if echo "$UPLOAD_RESPONSE" | grep -q "success"; then
    DOCUMENT_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Document uploaded successfully${NC}"
    echo "  Document ID: $DOCUMENT_ID"
    echo ""
else
    echo -e "${RED}✗ Upload failed${NC}"
    echo "$UPLOAD_RESPONSE"
    echo ""
fi

# Test 3: Upload Multiple Documents
echo "Test 3: Upload Multiple Documents"
MULTI_UPLOAD=$(curl -s -X POST "$API_BASE/upload-multiple" \
  -F "files=@$UPLOAD_DIR/pod.txt" \
  -F "files=@$UPLOAD_DIR/bol.txt" \
  -F "category=shipment" \
  -F "entityType=shipment" \
  -F "entityId=SHIP-2024-00001")

if echo "$MULTI_UPLOAD" | grep -q "success"; then
    COUNT=$(echo "$MULTI_UPLOAD" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Multiple documents uploaded${NC}"
    echo "  Documents uploaded: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Multiple upload failed${NC}"
    echo "$MULTI_UPLOAD"
    echo ""
fi

# Test 4: Get All Documents
echo "Test 4: Get All Documents"
ALL_DOCS=$(curl -s "$API_BASE")
if echo "$ALL_DOCS" | grep -q "success"; then
    TOTAL=$(echo "$ALL_DOCS" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Retrieved all documents${NC}"
    echo "  Total documents: $TOTAL"
    echo ""
else
    echo -e "${RED}✗ Failed to retrieve documents${NC}"
    echo ""
fi

# Test 5: Filter by Category
echo "Test 5: Filter Documents by Category"
CARRIER_DOCS=$(curl -s "$API_BASE?category=carrier")
if echo "$CARRIER_DOCS" | grep -q "success"; then
    COUNT=$(echo "$CARRIER_DOCS" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Filtered by category${NC}"
    echo "  Carrier documents: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Filter failed${NC}"
    echo ""
fi

# Test 6: Filter by Document Type
echo "Test 6: Filter by Document Type"
INSURANCE_DOCS=$(curl -s "$API_BASE?documentType=insurance")
if echo "$INSURANCE_DOCS" | grep -q "success"; then
    COUNT=$(echo "$INSURANCE_DOCS" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Filtered by type${NC}"
    echo "  Insurance documents: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Filter failed${NC}"
    echo ""
fi

# Test 7: Get Expiring Documents
echo "Test 7: Get Expiring Documents"
EXPIRING=$(curl -s "$API_BASE/expiring?days=365")
if echo "$EXPIRING" | grep -q "success"; then
    COUNT=$(echo "$EXPIRING" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Retrieved expiring documents${NC}"
    echo "  Documents expiring in 365 days: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Failed to get expiring documents${NC}"
    echo ""
fi

# Test 8: Get Document by ID
if [ ! -z "$DOCUMENT_ID" ]; then
    echo "Test 8: Get Document by ID"
    DOC_DETAIL=$(curl -s "$API_BASE/$DOCUMENT_ID")
    if echo "$DOC_DETAIL" | grep -q "success"; then
        echo -e "${GREEN}✓ Retrieved document details${NC}"
        echo ""
    else
        echo -e "${RED}✗ Failed to get document${NC}"
        echo ""
    fi
fi

# Test 9: Update Document Metadata
if [ ! -z "$DOCUMENT_ID" ]; then
    echo "Test 9: Update Document Metadata"
    UPDATE=$(curl -s -X PUT "$API_BASE/$DOCUMENT_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "expiryDate": "2026-12-31",
        "isVerified": true,
        "verificationNotes": "Document reviewed and approved",
        "tags": ["verified", "active", "auto-liability"]
      }')
    
    if echo "$UPDATE" | grep -q "success"; then
        echo -e "${GREEN}✓ Document metadata updated${NC}"
        echo ""
    else
        echo -e "${RED}✗ Update failed${NC}"
        echo ""
    fi
fi

# Test 10: Download Document
if [ ! -z "$DOCUMENT_ID" ]; then
    echo "Test 10: Download Document"
    DOWNLOAD_FILE="$UPLOAD_DIR/downloaded-doc.txt"
    HTTP_CODE=$(curl -s -o "$DOWNLOAD_FILE" -w "%{http_code}" "$API_BASE/$DOCUMENT_ID/download")
    
    if [ "$HTTP_CODE" = "200" ] && [ -f "$DOWNLOAD_FILE" ]; then
        echo -e "${GREEN}✓ Document downloaded successfully${NC}"
        echo "  Saved to: $DOWNLOAD_FILE"
        echo ""
    else
        echo -e "${RED}✗ Download failed (HTTP $HTTP_CODE)${NC}"
        echo ""
    fi
fi

# Test 11: Search Documents
echo "Test 11: Search by Entity"
ENTITY_DOCS=$(curl -s "$API_BASE?entityType=carrier&entityId=CARR-2024-00001")
if echo "$ENTITY_DOCS" | grep -q "success"; then
    COUNT=$(echo "$ENTITY_DOCS" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Found documents by entity${NC}"
    echo "  Documents for CARR-2024-00001: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Search failed${NC}"
    echo ""
fi

# Test 12: Get Expired Documents
echo "Test 12: Get Expired Documents"
EXPIRED=$(curl -s "$API_BASE/expired")
if echo "$EXPIRED" | grep -q "success"; then
    COUNT=$(echo "$EXPIRED" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✓ Retrieved expired documents${NC}"
    echo "  Expired documents: $COUNT"
    echo ""
else
    echo -e "${RED}✗ Failed to get expired documents${NC}"
    echo ""
fi

# Test 13: Delete Document (Optional - commented out to preserve test data)
# if [ ! -z "$DOCUMENT_ID" ]; then
#     echo "Test 13: Delete Document"
#     DELETE=$(curl -s -X DELETE "$API_BASE/$DOCUMENT_ID")
#     if echo "$DELETE" | grep -q "success"; then
#         echo -e "${GREEN}✓ Document deleted${NC}"
#         echo ""
#     else
#         echo -e "${RED}✗ Delete failed${NC}"
#         echo ""
#     fi
# fi

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "${GREEN}✓ All basic tests completed${NC}"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:8080/tms-documents.html"
echo "2. Test the upload UI"
echo "3. Verify document list displays correctly"
echo "4. Test download and delete from UI"
echo ""
echo "Test files created in: $UPLOAD_DIR/"
echo "You can clean up with: rm -rf $UPLOAD_DIR/"
echo ""
