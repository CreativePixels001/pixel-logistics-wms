#!/usr/bin/env python3
"""
FTP Structure Checker for CreativePixels Hosting
Connects to FTP server and displays directory structure
"""

from ftplib import FTP
import sys

# FTP Configuration
FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"

def check_ftp_structure():
    """Connect to FTP and explore directory structure"""
    try:
        print("🔌 Connecting to FTP server...")
        print(f"Host: {FTP_HOST}")
        print(f"User: {FTP_USER}")
        print("-" * 60)
        
        # Connect to FTP
        ftp = FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        
        print("✅ Connected successfully!\n")
        
        # Get current directory
        current_dir = ftp.pwd()
        print(f"📁 Current Directory: {current_dir}\n")
        
        # List files and directories
        print("📂 Directory Contents:")
        print("-" * 60)
        
        files_list = []
        ftp.dir(files_list.append)
        
        for item in files_list:
            print(item)
        
        print("\n" + "-" * 60)
        print(f"Total items: {len(files_list)}\n")
        
        # Try to detect web root directories
        print("🔍 Checking for common web directories...")
        common_dirs = ['public_html', 'www', 'htdocs', 'html', 'web', 'wwwroot']
        found_dirs = []
        
        try:
            all_items = ftp.nlst()
            for dir_name in common_dirs:
                if dir_name in all_items:
                    found_dirs.append(dir_name)
                    print(f"  ✅ Found: {dir_name}")
        except Exception as e:
            print(f"  ⚠️  Could not check: {e}")
        
        if found_dirs:
            print(f"\n🎯 Likely web root: {found_dirs[0]}")
            print(f"\n📋 Exploring {found_dirs[0]}...")
            try:
                ftp.cwd(found_dirs[0])
                print(f"Current directory: {ftp.pwd()}\n")
                
                web_files = []
                ftp.dir(web_files.append)
                
                print("Contents:")
                print("-" * 60)
                for item in web_files:
                    print(item)
                
                print("\n" + "-" * 60)
                print(f"Total items: {len(web_files)}")
                
            except Exception as e:
                print(f"Could not access {found_dirs[0]}: {e}")
        
        # Close connection
        ftp.quit()
        print("\n✅ FTP connection closed")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("FTP STRUCTURE CHECKER")
    print("=" * 60)
    print()
    
    success = check_ftp_structure()
    
    if success:
        print("\n" + "=" * 60)
        print("✨ Analysis Complete!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ Analysis Failed")
        print("=" * 60)
        sys.exit(1)
