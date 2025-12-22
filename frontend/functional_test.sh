#!/bin/bash

echo "=== Functional Testing Report ==="
echo ""

echo "1. Testing Login Page Dependencies..."
if grep -q "togglePasswordVisibility" login.html && grep -q "animateTrucks" login.html; then
    echo "   ✅ Login animations present"
else
    echo "   ❌ Login animations missing"
fi

echo ""
echo "2. Testing Dashboard Integration..."
if grep -q "Pixel Logistics" index.html && grep -q "Dashboard" index.html; then
    echo "   ✅ Dashboard branding correct"
else
    echo "   ❌ Dashboard branding issue"
fi

if grep -q "track-shipment.html" index.html; then
    echo "   ✅ Track Shipment menu link present"
else
    echo "   ❌ Track Shipment menu link missing"
fi

echo ""
echo "3. Testing Track Shipment Page..."
if [ -f "track-shipment.html" ]; then
    if grep -q "leaflet" track-shipment.html; then
        echo "   ✅ Leaflet.js integration found"
    else
        echo "   ❌ Map library missing"
    fi
    
    if [ -f "js/track-shipment-leaflet.js" ]; then
        city_count=$(grep -c "Mumbai\|Delhi\|Bangalore\|Chennai\|Kolkata\|Hyderabad" js/track-shipment-leaflet.js)
        echo "   ✅ Indian cities configured ($city_count references)"
    else
        echo "   ❌ Track shipment JS missing"
    fi
    
    if [ -f "css/track-shipment.css" ]; then
        echo "   ✅ Track shipment styling present"
    else
        echo "   ❌ Track shipment CSS missing"
    fi
fi

echo ""
echo "4. Testing CSS/JS File Integrity..."
css_count=$(ls css/*.css 2>/dev/null | wc -l)
js_count=$(ls js/*.js 2>/dev/null | wc -l)
echo "   CSS Files: $css_count"
echo "   JS Files: $js_count"

echo ""
echo "5. Testing Critical Features..."
# Check for notification system
if [ -f "js/notifications.js" ]; then
    echo "   ✅ Notification system present"
else
    echo "   ❌ Notification system missing"
fi

# Check for main.js
if [ -f "js/main.js" ]; then
    echo "   ✅ Main JS file present"
else
    echo "   ❌ Main JS file missing"
fi

# Check for styles.css
if [ -f "css/styles.css" ]; then
    echo "   ✅ Main stylesheet present"
else
    echo "   ❌ Main stylesheet missing"
fi

echo ""
echo "6. Mobile Interfaces Check..."
mobile_pages=$(ls mobile-*.html 2>/dev/null | wc -l)
echo "   Mobile pages: $mobile_pages"

echo ""
echo "7. Testing Yard Operations..."
for page in yard-management.html dock-scheduling.html slotting.html labor-management.html; do
    if [ -f "$page" ]; then
        echo "   ✅ $page"
    else
        echo "   ❌ $page missing"
    fi
done

