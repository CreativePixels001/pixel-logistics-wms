#!/bin/bash

# Fix CSS and JS paths in WMS and TMS subdirectories
# This script corrects relative paths from subfolder references to parent folder references

echo "🔧 Fixing CSS and JS paths in WMS and TMS folders..."
echo "=================================================="

# Navigate to frontend directory
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/frontend"

# Fix WMS folder
echo ""
echo "📂 Fixing WMS folder..."
cd WMS

# Fix CSS paths
find . -name "*.html" -type f -exec sed -i '' 's|href="css/|href="../css/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|href="shared/css/|href="../shared/css/|g' {} \;

# Fix JS paths
find . -name "*.html" -type f -exec sed -i '' 's|src="js/|src="../js/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="shared/js/|src="../shared/js/|g' {} \;

# Fix image paths
find . -name "*.html" -type f -exec sed -i '' 's|src="images/|src="../images/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="assets/|src="../assets/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="icons/|src="../icons/|g' {} \;

# Fix manifest and icon paths
find . -name "*.html" -type f -exec sed -i '' 's|href="manifest.json"|href="../manifest.json"|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|href="icons/|href="../icons/|g' {} \;

echo "✅ WMS paths fixed"

# Fix TMS folder
echo ""
echo "📂 Fixing TMS folder..."
cd ../TMS

# Fix CSS paths
find . -name "*.html" -type f -exec sed -i '' 's|href="css/|href="../css/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|href="shared/css/|href="../shared/css/|g' {} \;

# Fix JS paths
find . -name "*.html" -type f -exec sed -i '' 's|src="js/|src="../js/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="shared/js/|src="../shared/js/|g' {} \;

# Fix image paths
find . -name "*.html" -type f -exec sed -i '' 's|src="images/|src="../images/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="assets/|src="../assets/|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="icons/|src="../icons/|g' {} \;

# Fix manifest and icon paths
find . -name "*.html" -type f -exec sed -i '' 's|href="manifest.json"|href="../manifest.json"|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|href="icons/|href="../icons/|g' {} \;

echo "✅ TMS paths fixed"

# Fix AMS folder if exists
if [ -d "../AMS" ]; then
  echo ""
  echo "📂 Fixing AMS folder..."
  cd ../AMS
  
  find . -name "*.html" -type f -exec sed -i '' 's|href="css/|href="../css/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="js/|src="../js/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="images/|src="../images/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|href="manifest.json"|href="../manifest.json"|g' {} \;
  
  echo "✅ AMS paths fixed"
fi

# Fix PTMS folder if exists
if [ -d "../PTMS" ]; then
  echo ""
  echo "📂 Fixing PTMS folder..."
  cd ../PTMS
  
  find . -name "*.html" -type f -exec sed -i '' 's|href="css/|href="../css/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="js/|src="../js/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="images/|src="../images/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|href="manifest.json"|href="../manifest.json"|g' {} \;
  
  echo "✅ PTMS paths fixed"
fi

# Fix PTS folder if exists
if [ -d "../PTS" ]; then
  echo ""
  echo "📂 Fixing PTS folder..."
  cd ../PTS
  
  find . -name "*.html" -type f -exec sed -i '' 's|href="css/|href="../css/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="js/|src="../js/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|src="images/|src="../images/|g' {} \;
  find . -name "*.html" -type f -exec sed -i '' 's|href="manifest.json"|href="../manifest.json"|g' {} \;
  
  echo "✅ PTS paths fixed"
fi

echo ""
echo "=================================================="
echo "✅ All paths fixed successfully!"
echo ""
echo "🧪 Testing a sample file..."
cd "/Users/ashishkumar2/Documents/Deloitte/DEV Project./Pixel ecosystem/frontend/WMS"
echo "Sample from landing.html:"
head -15 landing.html | grep -E "(href=|src=)" | grep -v "https://" | head -3

echo ""
echo "✅ Done! Your files are now properly linked."
