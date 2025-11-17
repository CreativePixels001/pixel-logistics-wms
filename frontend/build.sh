#!/bin/bash

# Pixel Logistics WMS - Build & Optimization Script
# Phase 12C: Code Optimization

echo "🚀 Starting build and optimization process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create dist directory for optimized files
mkdir -p dist/css
mkdir -p dist/js

echo "${BLUE}📦 Step 1: Minifying CSS files...${NC}"
# Check if we have any CSS minification tools
if command -v cleancss &> /dev/null; then
    for file in css/*.css; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            echo "  Minifying $filename..."
            cleancss -o "dist/css/$filename" "$file"
        fi
    done
    echo "${GREEN}  ✓ CSS minification complete${NC}"
else
    echo "${YELLOW}  ⚠ cleancss not found. Installing via npm...${NC}"
    echo "  Run: npm install -g clean-css-cli"
    echo "  For now, copying CSS files as-is..."
    cp css/*.css dist/css/
fi
echo ""

echo "${BLUE}📦 Step 2: Minifying JavaScript files...${NC}"
# Check if we have terser for JS minification
if command -v terser &> /dev/null; then
    for file in js/*.js; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            echo "  Minifying $filename..."
            terser "$file" -c -m -o "dist/js/$filename"
        fi
    done
    echo "${GREEN}  ✓ JavaScript minification complete${NC}"
else
    echo "${YELLOW}  ⚠ terser not found. Installing via npm...${NC}"
    echo "  Run: npm install -g terser"
    echo "  For now, copying JS files as-is..."
    cp js/*.js dist/js/
fi
echo ""

echo "${BLUE}📦 Step 3: Generating critical CSS...${NC}"
# Create a combined critical CSS file
cat > dist/css/critical.css << 'EOF'
/* Critical CSS for above-the-fold content */
/* This should be inlined in <head> for optimal performance */

:root {
  --color-primary: #000000;
  --color-white: #ffffff;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #f9fafb;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
}

.main-content {
  margin-left: 240px;
  padding: 24px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
EOF
echo "${GREEN}  ✓ Critical CSS generated${NC}"
echo ""

echo "${BLUE}📊 Step 4: Analyzing bundle sizes...${NC}"
echo ""
echo "CSS Files:"
du -h css/*.css | awk '{printf "  %s\t%s\n", $1, $2}'
echo ""
echo "JavaScript Files:"
du -h js/*.js | awk '{printf "  %s\t%s\n", $1, $2}'
echo ""

if [ -d "dist" ]; then
    echo "Optimized Files (dist/):"
    echo "CSS:"
    du -h dist/css/*.css 2>/dev/null | awk '{printf "  %s\t%s\n", $1, $2}' || echo "  No minified CSS files yet"
    echo "JavaScript:"
    du -h dist/js/*.js 2>/dev/null | awk '{printf "  %s\t%s\n", $1, $2}' || echo "  No minified JS files yet"
    echo ""
fi

echo "${BLUE}🔍 Step 5: Performance recommendations...${NC}"
echo ""
echo "  📌 Install build tools:"
echo "     npm install -g clean-css-cli terser"
echo ""
echo "  📌 Enable gzip compression on web server"
echo "  📌 Add cache headers for static assets (1 year)"
echo "  📌 Use CDN for Chart.js and other libraries"
echo "  📌 Implement service worker for offline support"
echo "  📌 Lazy load images and non-critical scripts"
echo ""

echo "${GREEN}✅ Build process complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test optimized files in dist/ directory"
echo "  2. Update HTML to reference minified files"
echo "  3. Run Lighthouse audit for performance metrics"
echo "  4. Deploy to staging environment"
