#!/bin/bash

# Test script for WMS pages
echo "=== Pixel Logistics WMS - Page Testing Report ==="
echo "Test Date: $(date)"
echo "=================================================="
echo ""

# Array of critical pages to test
pages=(
    "login.html:Login Page"
    "index.html:Dashboard"
    "track-shipment.html:Track Shipment"
    "orders.html:Orders"
    "picking.html:Picking"
    "packing.html:Packing"
    "shipping.html:Shipping"
    "receiving.html:Receiving"
    "putaway.html:Put-away"
    "inventory.html:Inventory"
    "dock-scheduling.html:Dock Scheduling"
    "yard-management.html:Yard Management"
    "slotting.html:Slotting"
    "labor-management.html:Labor Management"
)

for page in "${pages[@]}"; do
    IFS=':' read -r file name <<< "$page"
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "✅ $name ($file) - Size: $size"
    else
        echo "❌ $name ($file) - NOT FOUND"
    fi
done

echo ""
echo "=== File Structure Check ==="
# Check CSS files
echo "CSS Files:"
ls -lh css/*.css 2>/dev/null | awk '{print "  " $9 " - " $5}' | head -10

echo ""
echo "JS Files:"
ls -lh js/*.js 2>/dev/null | awk '{print "  " $9 " - " $5}' | head -10

echo ""
echo "=== Image Assets ==="
ls -lh assets/Images/*.png 2>/dev/null | wc -l | awk '{print "  PNG files: " $1}'
ls -lh assets/Images/*.svg 2>/dev/null | wc -l | awk '{print "  SVG files: " $1}'

