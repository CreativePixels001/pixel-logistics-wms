#!/bin/bash

# WMS Frontend Preview Server
# Simple HTTP server to preview the WMS dashboard

echo "🚀 Starting WMS Frontend Preview Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Serving from: frontend/WMS/"
echo "🌐 URL: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$(dirname "$0")/frontend/WMS" || exit 1

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m http.server 8080
else
    echo "❌ Python not found. Please install Python to run the preview server."
    exit 1
fi
