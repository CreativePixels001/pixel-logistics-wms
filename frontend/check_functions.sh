#!/bin/bash

echo "Checking for missing onclick handlers..."
echo "========================================"
echo ""

# Files to check
files="create-receipt.html yard-management.html dock-scheduling.html"

for file in $files; do
  if [ -f "$file" ]; then
    echo "Checking $file..."
    
    # Extract onclick handlers
    onclicks=$(grep -o "onclick=\"[^\"]*\"" "$file" | sed 's/onclick="\(.*\)"/\1/' | grep -o "^[a-zA-Z_][a-zA-Z0-9_]*" | sort -u)
    
    for func in $onclicks; do
      # Check if function exists in the file or its JS files
      if ! grep -q "function $func\s*(" "$file" 2>/dev/null && \
         ! grep -q "function $func\s*(" "js/${file%.html}.js" 2>/dev/null && \
         ! grep -q "const $func\s*=" "$file" 2>/dev/null && \
         ! grep -q "const $func\s*=" "js/${file%.html}.js" 2>/dev/null; then
        echo "  ❌ Missing: $func()"
      fi
    done
    echo ""
  fi
done
