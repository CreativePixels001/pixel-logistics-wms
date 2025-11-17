#!/bin/bash

# WMS Portal - Production Build Script
# Optimizes all frontend assets for production deployment

echo "🚀 Starting WMS Portal Production Build..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo "📋 Checking dependencies..."

# Check for terser (JavaScript minifier)
if ! command -v terser &> /dev/null; then
    echo "${YELLOW}⚠️  terser not found. Installing...${NC}"
    npm install -g terser
fi

# Check for cssnano (CSS minifier)
if ! command -v cssnano &> /dev/null; then
    echo "${YELLOW}⚠️  cssnano not found. Installing...${NC}"
    npm install -g cssnano-cli
fi

echo "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Create dist directory
echo "📁 Creating dist directory..."
mkdir -p frontend/dist/js
mkdir -p frontend/dist/css
echo "${GREEN}✅ Directories created${NC}"
echo ""

# Minify JavaScript files
echo "🔧 Minifying JavaScript files..."

# Main JS files
terser frontend/js/analytics-dashboard.js \
  --compress \
  --mangle \
  --output frontend/dist/js/analytics-dashboard.min.js \
  --source-map "filename='frontend/dist/js/analytics-dashboard.min.js.map',url='analytics-dashboard.min.js.map'"

terser frontend/js/product-deck.js \
  --compress \
  --mangle \
  --output frontend/dist/js/product-deck.min.js

terser frontend/js/optimization.js \
  --compress \
  --mangle \
  --output frontend/dist/js/optimization.min.js

terser frontend/enhanced-table.js \
  --compress \
  --mangle \
  --output frontend/dist/js/enhanced-table.min.js

terser frontend/js/logger.js \
  --compress \
  --mangle \
  --output frontend/dist/js/logger.min.js

echo "${GREEN}✅ JavaScript minified${NC}"
echo ""

# Minify CSS files
echo "🎨 Minifying CSS files..."

cssnano frontend/css/mobile-app.css frontend/dist/css/mobile-app.min.css

# Check if other CSS files exist and minify them
if [ -f "frontend/css/styles.css" ]; then
    cssnano frontend/css/styles.css frontend/dist/css/styles.min.css
fi

if [ -f "frontend/css/dashboard.css" ]; then
    cssnano frontend/css/dashboard.css frontend/dist/css/dashboard.min.css
fi

echo "${GREEN}✅ CSS minified${NC}"
echo ""

# Calculate file sizes
echo "📊 File Size Report:"
echo "-------------------"

# JavaScript
echo ""
echo "JavaScript Files:"
for file in frontend/dist/js/*.min.js; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        filename=$(basename "$file")
        echo "  $filename: $size"
    fi
done

# CSS
echo ""
echo "CSS Files:"
for file in frontend/dist/css/*.min.css; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        filename=$(basename "$file")
        echo "  $filename: $size"
    fi
done

echo ""
echo "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📦 Minified files are in frontend/dist/"
echo ""
echo "Next steps:"
echo "1. Update HTML files to use .min.js and .min.css files"
echo "2. Test thoroughly before deployment"
echo "3. Deploy dist/ folder to production server"
echo ""
echo "🎉 Happy deploying!"
