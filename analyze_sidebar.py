#!/usr/bin/env python3
"""
WMS Sidebar Structure Analysis Script
Analyzes all HTML files in the frontend/WMS directory for sidebar menu consistency
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Path to WMS directory
WMS_DIR = Path("frontend/WMS")

def extract_sidebar_sections(file_path):
    """Extract sidebar section titles from an HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if sidebar exists
        if '<aside class="sidebar">' not in content:
            return None
        
        # Extract section titles
        section_pattern = r'<div class="sidebar-title"[^>]*>.*?<span>([^<]+)</span>'
        sections = re.findall(section_pattern, content, re.DOTALL)
        
        return sections
    except Exception as e:
        return f"ERROR: {str(e)}"

def main():
    """Main analysis function"""
    
    # Check if directory exists
    if not WMS_DIR.exists():
        print(f"Error: Directory {WMS_DIR} not found")
        return
    
    # Get all HTML files
    html_files = sorted(WMS_DIR.glob("*.html"))
    
    # Analysis data structures
    files_with_sidebar = []
    files_without_sidebar = []
    sidebar_variations = defaultdict(list)
    
    print("=" * 80)
    print("WMS SIDEBAR MENU STRUCTURE ANALYSIS REPORT")
    print("=" * 80)
    print(f"\nTotal HTML files analyzed: {len(html_files)}\n")
    
    # Analyze each file
    for file_path in html_files:
        file_name = file_path.name
        sections = extract_sidebar_sections(file_path)
        
        if sections is None:
            files_without_sidebar.append(file_name)
        elif isinstance(sections, str) and sections.startswith("ERROR"):
            print(f"Error processing {file_name}: {sections}")
        else:
            files_with_sidebar.append((file_name, sections))
            # Create a signature for grouping
            sections_signature = "|".join(sections)
            sidebar_variations[sections_signature].append(file_name)
    
    # Print summary statistics
    print("=" * 80)
    print("1. SUMMARY STATISTICS")
    print("=" * 80)
    print(f"Files WITH sidebar:     {len(files_with_sidebar)}")
    print(f"Files WITHOUT sidebar:  {len(files_without_sidebar)}")
    print(f"Sidebar variations:     {len(sidebar_variations)}")
    print()
    
    # Print pages WITH sidebar grouped by completeness
    print("=" * 80)
    print("2. PAGES WITH SIDEBAR (Grouped by Section Count)")
    print("=" * 80)
    print()
    
    # Group by section count
    by_section_count = defaultdict(list)
    for file_name, sections in files_with_sidebar:
        by_section_count[len(sections)].append((file_name, sections))
    
    # Print in descending order
    for count in sorted(by_section_count.keys(), reverse=True):
        files = by_section_count[count]
        print(f"\n--- {count} Sections ({len(files)} files) ---")
        for file_name, sections in sorted(files):
            print(f"  • {file_name}")
            print(f"    Sections: {', '.join(sections)}")
    
    # Print pages WITHOUT sidebar
    print("\n" + "=" * 80)
    print("3. PAGES WITHOUT SIDEBAR")
    print("=" * 80)
    print()
    for file_name in sorted(files_without_sidebar):
        print(f"  • {file_name}")
    
    # Print sidebar variations
    print("\n" + "=" * 80)
    print("4. SIDEBAR STRUCTURE VARIATIONS")
    print("=" * 80)
    print()
    
    variation_num = 1
    for sections_signature, file_list in sorted(sidebar_variations.items(), 
                                                  key=lambda x: -len(x[1])):
        sections = sections_signature.split("|")
        print(f"\nVariation #{variation_num} ({len(file_list)} files with {len(sections)} sections):")
        print(f"Sections: {', '.join(sections)}")
        print(f"Files:")
        for file_name in sorted(file_list):
            print(f"  • {file_name}")
        variation_num += 1
    
    # Identify the reference (most complete) sidebar
    print("\n" + "=" * 80)
    print("5. REFERENCE SIDEBAR STRUCTURE")
    print("=" * 80)
    print()
    
    max_sections = max(by_section_count.keys()) if by_section_count else 0
    if max_sections > 0:
        reference_files = by_section_count[max_sections]
        ref_file, ref_sections = reference_files[0]
        print(f"Most complete sidebar found in: {ref_file}")
        print(f"Total sections: {len(ref_sections)}")
        print(f"\nComplete section list:")
        for i, section in enumerate(ref_sections, 1):
            print(f"  {i}. {section}")
    
    # Recommendations
    print("\n" + "=" * 80)
    print("6. INCONSISTENCIES FOUND")
    print("=" * 80)
    print()
    
    if len(sidebar_variations) > 1:
        print(f"⚠️  Found {len(sidebar_variations)} different sidebar configurations")
        print(f"⚠️  {len(files_without_sidebar)} files have NO sidebar at all")
        print(f"⚠️  Only {len(by_section_count.get(max_sections, []))} files have the complete sidebar")
    else:
        print("✓ All files with sidebar have consistent structure")
    
    # Missing menu items analysis
    if max_sections > 0:
        print("\n" + "=" * 80)
        print("7. MISSING SECTIONS BY FILE")
        print("=" * 80)
        print()
        
        ref_file, ref_sections = reference_files[0]
        ref_set = set(ref_sections)
        
        for file_name, sections in sorted(files_with_sidebar):
            file_set = set(sections)
            missing = ref_set - file_set
            if missing:
                print(f"\n{file_name} - Missing {len(missing)} section(s):")
                for section in sorted(missing):
                    print(f"  ✗ {section}")
    
    # Recommendations
    print("\n" + "=" * 80)
    print("8. RECOMMENDATIONS FOR CREATING A COMMON SIDEBAR COMPONENT")
    print("=" * 80)
    print()
    print("""
APPROACH 1: JavaScript Include Pattern
--------------------------------------
1. Create a separate file: 'js/sidebar-component.js'
2. Store the complete sidebar HTML as a template string
3. Include this file in each page
4. Use JavaScript to inject the sidebar: document.getElementById('sidebar-container').innerHTML = sidebarHTML
5. Dynamically set the 'active' class based on current page

APPROACH 2: Server-Side Include (if using a backend)
-----------------------------------------------------
1. Create 'includes/sidebar.html' with the complete sidebar structure
2. Use server-side includes to inject it into each page
3. Pass the current page name as a variable to set active states

APPROACH 3: JavaScript Template Component
------------------------------------------
1. Create a Web Component or Custom Element for the sidebar
2. Define it once in 'components/wms-sidebar.js'
3. Use <wms-sidebar active-page="dashboard"></wms-sidebar> in each HTML file
4. Automatically handles active state and consistent structure

APPROACH 4: Build-Time Template (Recommended for static sites)
---------------------------------------------------------------
1. Use a static site generator or template engine (e.g., Handlebars, EJS)
2. Create a sidebar partial/template
3. Build process compiles templates into final HTML files
4. Ensures consistency while maintaining static HTML deployment

RECOMMENDED: Approach 1 (JavaScript Include)
--------------------------------------------
Most practical for current setup without requiring build tools or backend:

1. Extract index.html sidebar to 'js/sidebar-menu.js'
2. Create a function that returns the sidebar HTML
3. Add logic to detect current page and set active class
4. Include the script in all pages
5. Replace static sidebar with <div id="sidebar-mount"></div>
6. On page load, mount the sidebar component

This maintains the static HTML structure while ensuring consistency.
""")
    
    print("\n" + "=" * 80)
    print("END OF REPORT")
    print("=" * 80)

if __name__ == "__main__":
    main()
