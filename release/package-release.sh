#!/bin/bash

# EduGrowHub Release Packaging Script
# This script packages all release files into a distributable archive
#
# Usage: ./package-release.sh [version]
# Version: Optional version number (default: 1.0.0)

set -e  # Exit on any error

# Configuration
VERSION="${1:-1.0.0}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RELEASE_NAME="edugrowhub-v${VERSION}-${TIMESTAMP}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create release package
create_release_package() {
    log "Creating release package: $RELEASE_NAME"
    
    # Create temporary directory for packaging
    TEMP_DIR="/tmp/$RELEASE_NAME"
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    
    # Copy all release files
    cp -r "$SCRIPT_DIR"/* "$TEMP_DIR/"
    
    # Create additional directories
    mkdir -p "$TEMP_DIR/scripts"
    mkdir -p "$TEMP_DIR/config"
    mkdir -p "$TEMP_DIR/docs"
    
    # Organize files
    mv "$TEMP_DIR"/*.sh "$TEMP_DIR/scripts/" 2>/dev/null || true
    mv "$TEMP_DIR"/*.conf "$TEMP_DIR/config/" 2>/dev/null || true
    mv "$TEMP_DIR"/.env.example.* "$TEMP_DIR/config/" 2>/dev/null || true
    mv "$TEMP_DIR"/*.md "$TEMP_DIR/docs/" 2>/dev/null || true
    
    # Keep main files in root
    cp "$TEMP_DIR/docs/README.md" "$TEMP_DIR/"
    cp "$TEMP_DIR/docs/DEPLOYMENT_GUIDE.md" "$TEMP_DIR/"
    
    success "Release files organized successfully!"
}

# Create checksums
create_checksums() {
    log "Creating checksums..."
    
    cd "$TEMP_DIR"
    find . -type f -exec sha256sum {} \; > checksums.sha256
    
    success "Checksums created!"
}

# Create archive
create_archive() {
    log "Creating release archive..."
    
    cd "/tmp"
    
    # Create tar.gz archive
    tar -czf "${RELEASE_NAME}.tar.gz" "$RELEASE_NAME"
    
    # Create zip archive for Windows compatibility
    zip -r "${RELEASE_NAME}.zip" "$RELEASE_NAME" > /dev/null
    
    # Move archives to release directory
    mv "${RELEASE_NAME}.tar.gz" "$SCRIPT_DIR/"
    mv "${RELEASE_NAME}.zip" "$SCRIPT_DIR/"
    
    success "Archives created successfully!"
}

# Generate release manifest
generate_manifest() {
    log "Generating release manifest..."
    
    cat > "$SCRIPT_DIR/RELEASE_MANIFEST.txt" << EOF
EduGrowHub Release Package
==========================

Release Version: $VERSION
Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Build Timestamp: $TIMESTAMP
Package Name: $RELEASE_NAME

Files Included:
===============

Documentation:
- README.md                 - Complete project overview and setup guide
- DEPLOYMENT_GUIDE.md       - Step-by-step deployment instructions  
- RELEASE_NOTES.md          - Version history and release information
- RELEASE_MANIFEST.txt      - This file

Configuration:
- .env.example.frontend     - Frontend environment variables template
- .env.example.backend      - Backend environment variables template
- nginx.conf                - Production-ready Nginx configuration

Scripts:
- deploy-frontend.sh        - Automated frontend deployment script
- deploy-backend.sh         - Automated backend deployment script
- package-release.sh        - Release packaging script

Archives:
- ${RELEASE_NAME}.tar.gz    - Unix/Linux release archive
- ${RELEASE_NAME}.zip       - Windows release archive

Checksums:
- checksums.sha256          - SHA256 checksums for all files

Installation:
=============

1. Extract the archive:
   tar -xzf ${RELEASE_NAME}.tar.gz
   # or
   unzip ${RELEASE_NAME}.zip

2. Navigate to the extracted directory:
   cd $RELEASE_NAME

3. Follow the deployment guide:
   cat DEPLOYMENT_GUIDE.md

4. Configure environment variables:
   cp config/.env.example.frontend .env.local
   cp config/.env.example.backend .env

5. Run deployment scripts:
   chmod +x scripts/*.sh
   ./scripts/deploy-frontend.sh prod
   ./scripts/deploy-backend.sh prod

System Requirements:
==================

Frontend:
- Node.js 18+
- npm 9+
- AWS CLI configured

Backend:
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+

Infrastructure:
- AWS Account (EC2, RDS, S3, CloudFront)
- Domain with SSL certificate
- Minimum EC2: t3.medium (2 vCPU, 4GB RAM)

Support:
========

- Documentation: See README.md and DEPLOYMENT_GUIDE.md
- Issues: https://github.com/yourusername/edugrowhub/issues
- Email: support@edugrowhub.com

EOF
    
    success "Release manifest generated!"
}

# Verify package
verify_package() {
    log "Verifying package integrity..."
    
    # Check if all expected files exist
    EXPECTED_FILES=(
        "README.md"
        "DEPLOYMENT_GUIDE.md"
        "RELEASE_NOTES.md"
        "RELEASE_MANIFEST.txt"
        "scripts/deploy-frontend.sh"
        "scripts/deploy-backend.sh"
        "config/.env.example.frontend"
        "config/.env.example.backend"
        "config/nginx.conf"
        "checksums.sha256"
    )
    
    cd "$TEMP_DIR"
    for file in "${EXPECTED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            warning "Missing file: $file"
        fi
    done
    
    # Verify checksums
    if sha256sum -c checksums.sha256 > /dev/null 2>&1; then
        success "All checksums verified!"
    else
        warning "Some checksums failed verification"
    fi
    
    success "Package verification completed!"
}

# Main function
main() {
    log "Starting EduGrowHub release packaging..."
    log "Version: $VERSION"
    log "Timestamp: $TIMESTAMP"
    log "Release Name: $RELEASE_NAME"
    
    create_release_package
    create_checksums
    generate_manifest
    verify_package
    create_archive
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    # Display results
    echo
    success "🎉 Release package created successfully!"
    echo
    echo "Release Information:"
    echo "==================="
    echo "Version: $VERSION"
    echo "Package: $RELEASE_NAME"
    echo "Archives:"
    echo "  - ${RELEASE_NAME}.tar.gz ($(du -h "$SCRIPT_DIR/${RELEASE_NAME}.tar.gz" | cut -f1))"
    echo "  - ${RELEASE_NAME}.zip ($(du -h "$SCRIPT_DIR/${RELEASE_NAME}.zip" | cut -f1))"
    echo
    echo "Files in package:"
    echo "=================="
    tar -tzf "$SCRIPT_DIR/${RELEASE_NAME}.tar.gz" | head -20
    echo "... (and more)"
    echo
    echo "Next steps:"
    echo "==========="
    echo "1. Test the package in a clean environment"
    echo "2. Upload to release distribution server"
    echo "3. Update download links in documentation"
    echo "4. Announce the release"
}

# Run main function
main "$@"
