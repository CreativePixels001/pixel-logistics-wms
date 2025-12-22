#!/bin/bash

###############################################################################
# Deploy All Applications - PIS, TMS, PTMS
###############################################################################

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Deploying All Applications to Creative Pixels Subdomains  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Make scripts executable
chmod +x deploy-pis.sh deploy-tms.sh deploy-trip.sh

echo "📦 Deploying 3 applications..."
echo ""

# Deploy PIS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Deploying PIS (Insurance Solution)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./deploy-pis.sh

echo ""
sleep 2

# Deploy TMS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Deploying TMS (Transport Management)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./deploy-tms.sh

echo ""
sleep 2

# Deploy PTMS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Deploying PTMS (Public Transport - Trip)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./deploy-trip.sh

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  🎉 ALL DEPLOYMENTS COMPLETE! 🎉             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Live Applications:"
echo "   1. WMS:  http://wms.creativepixels.in"
echo "   2. PIS:  http://pis.creativepixels.in"
echo "   3. TMS:  http://tms.creativepixels.in"
echo "   4. PTMS: http://trip.creativepixels.in"
echo ""
echo "📱 Test all on your iPad now!"
echo ""
echo "Next Steps:"
echo "  → Update pixelverse.html with demo links"
echo "  → Update home.html with solutions showcase"
echo ""
