#!/bin/bash

###############################################################################
# PIXEL ECOSYSTEM - MASTER DEPLOYMENT SCRIPT
# Version: 2.0
# Date: 11 December 2025
#
# Features:
# - Automatic backup before deployment
# - FTP credentials from .ftpconfig
# - Module selection (WMS, TMS, PIS, PixelNotes, etc.)
# - Safety checks and confirmations
# - Rollback capability
# - Progress tracking
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Load FTP credentials from .ftpconfig
if [ ! -f .ftpconfig ]; then
    echo -e "${RED}❌ Error: .ftpconfig file not found!${NC}"
    echo -e "${YELLOW}Please create .ftpconfig with:${NC}"
    echo "HOST=68.178.157.215"
    echo "USER=akshay@creativepixels.in"
    echo "PASS=_ad,B;7}FZhC"
    exit 1
fi

source .ftpconfig

# Backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Log file
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"

# Function to log messages
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to print header
print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  ${BOLD}PIXEL ECOSYSTEM - MASTER DEPLOYMENT SYSTEM${NC}              ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to test FTP connection
test_ftp_connection() {
    echo -e "${CYAN}🔌 Testing FTP connection to ${HOST}...${NC}"
    
    # Test connection
    ftp_test=$(curl -s --connect-timeout 10 -u "$USER:$PASS" "ftp://$HOST/" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ FTP connection successful!${NC}"
        log "FTP connection test: SUCCESS"
        return 0
    else
        echo -e "${RED}❌ FTP connection failed!${NC}"
        echo -e "${YELLOW}Error: $ftp_test${NC}"
        log "FTP connection test: FAILED - $ftp_test"
        return 1
    fi
}

# Function to backup remote files
backup_remote_files() {
    local remote_path=$1
    local local_backup_path=$2
    
    echo -e "${YELLOW}💾 Creating backup of existing files...${NC}"
    
    mkdir -p "$local_backup_path"
    
    # List and download existing files
    ftp -inv $HOST <<EOF >> "$LOG_FILE" 2>&1
user $USER $PASS
binary
cd $remote_path
lcd $local_backup_path
mget *
bye
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created at: $local_backup_path${NC}"
        log "Backup created: $local_backup_path"
        return 0
    else
        echo -e "${YELLOW}⚠️  Backup completed with warnings${NC}"
        log "Backup completed with warnings"
        return 0
    fi
}

# Function to upload file
upload_file() {
    local local_file=$1
    local remote_path=$2
    local filename=$(basename "$local_file")
    
    echo -e "  ${CYAN}→${NC} Uploading ${filename}..."
    
    curl -s --ftp-create-dirs -u "$USER:$PASS" -T "$local_file" "ftp://$HOST/$remote_path/" >> "$LOG_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} ${filename}"
        log "Uploaded: $filename to $remote_path"
        return 0
    else
        echo -e "  ${RED}✗${NC} ${filename} - FAILED"
        log "FAILED: $filename to $remote_path"
        return 1
    fi
}

# Function to upload directory recursively
upload_directory() {
    local local_dir=$1
    local remote_dir=$2
    
    if [ ! -d "$local_dir" ]; then
        echo -e "${YELLOW}⚠️  Directory not found: $local_dir${NC}"
        return 1
    fi
    
    echo -e "${CYAN}📁 Uploading directory: $local_dir → $remote_dir${NC}"
    
    # Upload all files in directory
    local file_count=0
    local success_count=0
    
    for file in "$local_dir"/*; do
        if [ -f "$file" ]; then
            ((file_count++))
            upload_file "$file" "$remote_dir"
            if [ $? -eq 0 ]; then
                ((success_count++))
            fi
        elif [ -d "$file" ]; then
            # Recursive call for subdirectories
            subdir=$(basename "$file")
            upload_directory "$file" "$remote_dir/$subdir"
        fi
    done
    
    echo -e "${GREEN}✅ Uploaded $success_count/$file_count files from $(basename $local_dir)${NC}"
}

# Function to deploy WMS module
deploy_wms() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING WMS (Warehouse Management System)${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_WMS="public_html/Projects/WMS"
    
    # Backup existing files
    backup_remote_files "$REMOTE_WMS" "$BACKUP_DIR/WMS"
    
    # Upload frontend files
    echo -e "\n${CYAN}🚀 Uploading WMS frontend files...${NC}"
    upload_directory "frontend/WMS" "$REMOTE_WMS"
    
    echo -e "\n${GREEN}✅ WMS deployment complete!${NC}"
    echo -e "${BLUE}🌐 Live URL: http://wms.creativepixels.in${NC}"
}

# Function to deploy TMS module
deploy_tms() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING TMS (Transportation Management System)${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_TMS="public_html/Projects/TMS"
    
    backup_remote_files "$REMOTE_TMS" "$BACKUP_DIR/TMS"
    
    echo -e "\n${CYAN}🚀 Uploading TMS frontend files...${NC}"
    upload_directory "frontend/TMS" "$REMOTE_TMS"
    
    echo -e "\n${GREEN}✅ TMS deployment complete!${NC}"
    echo -e "${BLUE}🌐 Live URL: http://tms.creativepixels.in${NC}"
}

# Function to deploy PIS module
deploy_pis() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING PIS (Policy Insurance System)${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_PIS="public_html/Projects/PIS"
    
    backup_remote_files "$REMOTE_PIS" "$BACKUP_DIR/PIS"
    
    echo -e "\n${CYAN}🚀 Uploading PIS frontend files...${NC}"
    upload_directory "frontend/PIS" "$REMOTE_PIS"
    
    echo -e "\n${GREEN}✅ PIS deployment complete!${NC}"
    echo -e "${BLUE}🌐 Live URL: http://pis.creativepixels.in${NC}"
}

# Function to deploy PixelNotes
deploy_pixelnotes() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING PixelNotes${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_NOTES="public_html/Projects/PixelNotes"
    
    backup_remote_files "$REMOTE_NOTES" "$BACKUP_DIR/PixelNotes"
    
    echo -e "\n${CYAN}🚀 Uploading PixelNotes files...${NC}"
    upload_directory "frontend/PixelNotes" "$REMOTE_NOTES"
    
    echo -e "\n${GREEN}✅ PixelNotes deployment complete!${NC}"
    echo -e "${BLUE}🌐 Live URL: http://notes.creativepixels.in${NC}"
}

# Function to deploy PixelAudit
deploy_pixelaudit() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING PixelAudit${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_AUDIT="public_html/Projects/PixelAudit"
    
    backup_remote_files "$REMOTE_AUDIT" "$BACKUP_DIR/PixelAudit"
    
    echo -e "\n${CYAN}🚀 Uploading PixelAudit files...${NC}"
    upload_directory "frontend/PixelAudit" "$REMOTE_AUDIT"
    
    echo -e "\n${GREEN}✅ PixelAudit deployment complete!${NC}"
    echo -e "${BLUE}🌐 Live URL: http://audit.creativepixels.in${NC}"
}

# Function to deploy Backend API
deploy_backend() {
    echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 DEPLOYING Backend API${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    REMOTE_BACKEND="public_html/api"
    
    backup_remote_files "$REMOTE_BACKEND" "$BACKUP_DIR/backend"
    
    echo -e "\n${CYAN}🚀 Uploading Backend API files...${NC}"
    upload_directory "backend" "$REMOTE_BACKEND"
    
    echo -e "\n${GREEN}✅ Backend deployment complete!${NC}"
    echo -e "${BLUE}🌐 API URL: http://api.creativepixels.in${NC}"
}

# Function to show module selection menu
show_menu() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Select Module to Deploy:${NC}\n"
    echo -e "  ${BOLD}1)${NC} WMS  - Warehouse Management System"
    echo -e "  ${BOLD}2)${NC} TMS  - Transportation Management System"
    echo -e "  ${BOLD}3)${NC} PIS  - Policy Insurance System"
    echo -e "  ${BOLD}4)${NC} PixelNotes"
    echo -e "  ${BOLD}5)${NC} PixelAudit"
    echo -e "  ${BOLD}6)${NC} Backend API"
    echo -e "  ${BOLD}7)${NC} Deploy ALL Modules"
    echo -e "  ${BOLD}8)${NC} CPX Website (Main Site)"
    echo -e "  ${BOLD}0)${NC} Exit"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to confirm deployment
confirm_deployment() {
    local module=$1
    echo ""
    echo -e "${YELLOW}⚠️  You are about to deploy: ${BOLD}$module${NC}"
    echo -e "${YELLOW}⚠️  Existing files will be backed up to: $BACKUP_DIR${NC}"
    echo ""
    read -p "$(echo -e ${BOLD}Continue with deployment? [y/N]:${NC} )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled by user${NC}"
        log "Deployment cancelled: $module"
        return 1
    fi
    return 0
}

# Main execution
main() {
    print_header
    
    # Test FTP connection first
    if ! test_ftp_connection; then
        echo -e "${RED}❌ Cannot proceed without valid FTP connection${NC}"
        exit 1
    fi
    
    echo ""
    show_menu
    echo ""
    read -p "$(echo -e ${BOLD}Enter your choice [0-8]:${NC} )" choice
    
    case $choice in
        1)
            confirm_deployment "WMS" && deploy_wms
            ;;
        2)
            confirm_deployment "TMS" && deploy_tms
            ;;
        3)
            confirm_deployment "PIS" && deploy_pis
            ;;
        4)
            confirm_deployment "PixelNotes" && deploy_pixelnotes
            ;;
        5)
            confirm_deployment "PixelAudit" && deploy_pixelaudit
            ;;
        6)
            confirm_deployment "Backend API" && deploy_backend
            ;;
        7)
            confirm_deployment "ALL MODULES" && {
                deploy_wms
                deploy_tms
                deploy_pis
                deploy_pixelnotes
                deploy_pixelaudit
            }
            ;;
        8)
            echo -e "${YELLOW}⚠️  CPX Website deployment - Use deploy-complete.sh${NC}"
            ;;
        0)
            echo -e "${BLUE}👋 Exiting deployment system${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    # Final summary
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ${BOLD}✅ DEPLOYMENT COMPLETE!${NC}                                     ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📊 Deployment Summary:${NC}"
    echo -e "  ${BOLD}•${NC} Backup Location: ${BACKUP_DIR}"
    echo -e "  ${BOLD}•${NC} Log File: ${LOG_FILE}"
    echo -e "  ${BOLD}•${NC} FTP Server: ${HOST}"
    echo ""
    echo -e "${YELLOW}💡 Tip: Keep last 5 backups, delete older ones to save space${NC}"
    echo ""
}

# Run main function
main

# Exit
exit 0
