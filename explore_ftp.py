#!/usr/bin/env python3
from ftplib import FTP
import os

FTP_HOST = "68.178.157.215"
FTP_USER = "akshay@creativepixels.in"
FTP_PASS = "_ad,B;7}FZhC"

print("🔍 Exploring server structure...")

ftp = FTP(FTP_HOST)
ftp.login(FTP_USER, FTP_PASS)

print(f"\n📂 ROOT: {ftp.pwd()}")
print("\n" + "="*50)

def list_dir(path="/"):
    try:
        ftp.cwd(path)
        print(f"\n📁 Directory: {ftp.pwd()}")
        files = []
        ftp.retrlines('LIST', files.append)
        for f in files:
            print(f"   {f}")
        return files
    except Exception as e:
        print(f"❌ Can't access {path}: {e}")
        return []

# List root
root_files = list_dir("/")

# Check each directory
for line in root_files:
    if line.startswith('d'):
        parts = line.split()
        dirname = parts[-1]
        if dirname not in ['.', '..']:
            print(f"\n{'='*50}")
            list_dir(f"/{dirname}")

ftp.quit()
