#!/usr/bin/env python3
"""
FTP Server Directory Tree Viewer
Creates a visual tree structure of the FTP server
"""

from ftplib import FTP
import sys

# FTP Configuration
FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"

def get_ftp_tree(ftp, path="", prefix="", max_depth=3, current_depth=0):
    """Recursively build directory tree"""
    if current_depth >= max_depth:
        return []
    
    tree_lines = []
    
    try:
        # Change to directory
        ftp.cwd(path if path else "/")
        
        # Get directory listing
        items = []
        ftp.retrlines('LIST', items.append)
        
        # Parse items into files and directories
        dirs = []
        files = []
        
        for item in items:
            parts = item.split()
            if len(parts) < 9:
                continue
                
            permissions = parts[0]
            name = ' '.join(parts[8:])
            
            # Skip . and ..
            if name in ['.', '..']:
                continue
            
            # Skip hidden files except important ones
            if name.startswith('.') and name not in ['.htaccess']:
                continue
            
            if permissions.startswith('d'):
                dirs.append(name)
            else:
                files.append((name, parts[4]))  # name and size
        
        # Sort
        dirs.sort()
        files.sort()
        
        # Process directories
        for i, dirname in enumerate(dirs):
            is_last_dir = (i == len(dirs) - 1) and len(files) == 0
            connector = "└── " if is_last_dir else "├── "
            tree_lines.append(f"{prefix}{connector}📁 {dirname}/")
            
            # Recurse into subdirectory
            new_prefix = prefix + ("    " if is_last_dir else "│   ")
            subpath = f"{path}/{dirname}" if path else dirname
            
            try:
                subtree = get_ftp_tree(ftp, subpath, new_prefix, max_depth, current_depth + 1)
                tree_lines.extend(subtree)
                
                # Return to parent directory
                ftp.cwd(path if path else "/")
            except Exception as e:
                tree_lines.append(f"{new_prefix}└── ⚠️  (access denied)")
        
        # Process files
        for i, (filename, filesize) in enumerate(files):
            is_last = i == len(files) - 1
            connector = "└── " if is_last else "├── "
            
            # Format file size
            try:
                size_kb = int(filesize) / 1024
                if size_kb < 1024:
                    size_str = f"{size_kb:.1f}KB"
                else:
                    size_str = f"{size_kb/1024:.1f}MB"
            except:
                size_str = filesize
            
            # File icon based on extension
            if filename.endswith('.html'):
                icon = "📄"
            elif filename.endswith('.css'):
                icon = "🎨"
            elif filename.endswith('.js'):
                icon = "⚙️"
            elif filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                icon = "🖼️"
            elif filename.endswith('.md'):
                icon = "📝"
            elif filename.endswith('.sh'):
                icon = "🔧"
            else:
                icon = "📄"
            
            tree_lines.append(f"{prefix}{connector}{icon} {filename} ({size_str})")
    
    except Exception as e:
        tree_lines.append(f"{prefix}└── ❌ Error: {e}")
    
    return tree_lines


def show_ftp_structure():
    """Main function to display FTP tree structure"""
    print("=" * 80)
    print("🌳 FTP SERVER DIRECTORY TREE")
    print("=" * 80)
    print(f"Host: {FTP_HOST}")
    print(f"User: {FTP_USER}")
    print("=" * 80)
    print()
    
    try:
        # Connect to FTP
        print("🔌 Connecting...")
        ftp = FTP(FTP_HOST, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Connected!\n")
        
        # Start from root
        print("📂 Root Directory (/)")
        tree = get_ftp_tree(ftp, "", "", max_depth=4, current_depth=0)
        
        for line in tree:
            print(line)
        
        print("\n" + "=" * 80)
        print("📊 SUMMARY")
        print("=" * 80)
        
        # Count items
        dir_count = sum(1 for line in tree if '📁' in line)
        file_count = len(tree) - dir_count
        
        print(f"Total Directories: {dir_count}")
        print(f"Total Files Shown: {file_count}")
        print(f"Tree Depth: 4 levels")
        
        # Show key directories
        print("\n🎯 KEY DIRECTORIES:")
        print("  • /public_html/          → Main website root (DEPLOY HERE)")
        
        important_dirs = [
            'wms.creativepixels.in',
            'tms.creativepixels.in', 
            'pis.creativepixels.in',
            'trip.creativepixels.in',
            'pi',
            'frontend',
            'domains'
        ]
        
        for line in tree:
            for imp_dir in important_dirs:
                if f'📁 {imp_dir}/' in line:
                    desc = {
                        'wms.creativepixels.in': 'WMS Application',
                        'tms.creativepixels.in': 'TMS Application',
                        'pis.creativepixels.in': 'PIS Application',
                        'trip.creativepixels.in': 'Trip Management',
                        'pi': 'Pi Assistant',
                        'frontend': 'Frontend Apps',
                        'domains': 'Domain Configs'
                    }
                    print(f"  • /{imp_dir}/ → {desc.get(imp_dir, '')}")
        
        print("\n" + "=" * 80)
        
        # Close connection
        ftp.quit()
        print("✅ Connection closed")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = show_ftp_structure()
    sys.exit(0 if success else 1)
