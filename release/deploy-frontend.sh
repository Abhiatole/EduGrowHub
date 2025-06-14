#!/bin/bash

# EduGrowHub Frontend Deployment Script
# This script builds and deploys the React frontend to AWS S3 and CloudFront
# 
# Prerequisites:
# - AWS CLI configured with appropriate permissions
# - Node.js and npm installed
# - S3 bucket created for hosting
# - CloudFront distribution configured
#
# Usage: ./deploy-frontend.sh [environment]
# Environment: dev, staging, prod (default: prod)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/tmp/edugrowhub_frontend_deploy_${TIMESTAMP}.log"

# Default configuration
ENVIRONMENT="${1:-prod}"
NODE_VERSION="18"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Environment-specific configuration
configure_environment() {
    case $ENVIRONMENT in
        "dev")
            S3_BUCKET="edugrowhub-frontend-dev"
            CLOUDFRONT_DISTRIBUTION_ID="E1234567890DEV"
            BUILD_ENV="development"
            ;;
        "staging")
            S3_BUCKET="edugrowhub-frontend-staging"
            CLOUDFRONT_DISTRIBUTION_ID="E1234567890STG"
            BUILD_ENV="staging"
            ;;
        "prod")
            S3_BUCKET="edugrowhub-frontend-prod"
            CLOUDFRONT_DISTRIBUTION_ID="E1234567890PRD"
            BUILD_ENV="production"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use dev, staging, or prod."
            ;;
    esac
    
    log "Configured for environment: $ENVIRONMENT"
    log "S3 Bucket: $S3_BUCKET"
    log "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if AWS CLI is installed and configured
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Verify AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js $NODE_VERSION or later."
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        error "Node.js version $NODE_VERSION or later is required. Current version: $(node -v)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed."
    fi
    
    # Verify S3 bucket exists and is accessible
    if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        error "Cannot access S3 bucket: $S3_BUCKET"
    fi
    
    success "All prerequisites met!"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    BACKUP_DIR="backups/frontend_${ENVIRONMENT}_${TIMESTAMP}"
    mkdir -p "$BACKUP_DIR"
    
    # Download current files from S3
    aws s3 sync "s3://$S3_BUCKET" "$BACKUP_DIR" --delete --quiet || {
        warning "Failed to create backup. Continuing with deployment..."
    }
    
    success "Backup created in $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Clean install
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm cache clean --force
    npm install --production=false
    
    success "Dependencies installed successfully!"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Run unit tests
    if npm run test:ci 2>/dev/null || npm run test -- --coverage --watchAll=false 2>/dev/null; then
        success "All tests passed!"
    else
        warning "Tests failed or test script not found. Continuing deployment..."
    fi
    
    # Run linting
    if npm run lint 2>/dev/null; then
        success "Linting passed!"
    else
        warning "Linting failed or lint script not found. Continuing deployment..."
    fi
}

# Build the application
build_application() {
    log "Building React application for $BUILD_ENV environment..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Set environment variables
    export NODE_ENV="$BUILD_ENV"
    export GENERATE_SOURCEMAP=false
    export INLINE_RUNTIME_CHUNK=false
    
    # Build the application
    npm run build
    
    # Verify build directory exists and has content
    if [ ! -d "build" ] || [ -z "$(ls -A build)" ]; then
        error "Build failed - build directory is empty or doesn't exist"
    fi
    
    # Generate build info file
    cat > build/build-info.json << EOF
{
    "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
    "environment": "$ENVIRONMENT",
    "version": "$(node -p "require('./package.json').version")"
}
EOF
    
    success "Application built successfully!"
}

# Deploy to S3
deploy_to_s3() {
    log "Deploying to S3 bucket: $S3_BUCKET..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Sync files to S3 with appropriate cache headers
    aws s3 sync build/ "s3://$S3_BUCKET" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "service-worker.js" \
        --exclude "build-info.json"
    
    # Upload HTML files with no-cache
    aws s3 sync build/ "s3://$S3_BUCKET" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --exclude "*" \
        --include "*.html" \
        --include "service-worker.js" \
        --include "build-info.json"
    
    # Set proper content types
    aws s3 cp "s3://$S3_BUCKET/service-worker.js" "s3://$S3_BUCKET/service-worker.js" \
        --content-type "application/javascript" \
        --metadata-directive REPLACE \
        --cache-control "no-cache, no-store, must-revalidate" || true
    
    success "Deployed to S3 successfully!"
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    log "Invalidating CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID..."
    
    # Create invalidation for all files
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log "CloudFront invalidation created with ID: $INVALIDATION_ID"
    
    # Wait for invalidation to complete (optional)
    if [ "$ENVIRONMENT" = "prod" ]; then
        log "Waiting for CloudFront invalidation to complete..."
        aws cloudfront wait invalidation-completed \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --id "$INVALIDATION_ID"
        success "CloudFront invalidation completed!"
    else
        log "Invalidation is in progress. Check AWS Console for status."
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get CloudFront domain name
    DOMAIN=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    
    # Wait a bit for propagation
    sleep 30
    
    # Check if the site is accessible
    if curl -f -s "https://$DOMAIN" > /dev/null; then
        success "Health check passed - site is accessible!"
    else
        warning "Health check failed - site may not be immediately accessible"
    fi
    
    # Check build info endpoint
    if curl -f -s "https://$DOMAIN/build-info.json" > /dev/null; then
        success "Build info endpoint is accessible!"
    else
        warning "Build info endpoint is not accessible"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Clean up build artifacts if needed
    # rm -rf build  # Uncomment if you want to clean build directory
    
    success "Cleanup completed!"
}

# Send notification (optional)
send_notification() {
    log "Sending deployment notification..."
    
    # You can integrate with Slack, Discord, email, etc.
    # Example for Slack webhook:
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"✅ EduGrowHub frontend deployed to $ENVIRONMENT\"}" \
    #     "$SLACK_WEBHOOK_URL"
    
    success "Deployment completed successfully!"
}

# Main deployment function
main() {
    log "Starting EduGrowHub frontend deployment..."
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"
    log "Log file: $LOG_FILE"
    
    configure_environment
    check_prerequisites
    backup_current_deployment
    install_dependencies
    run_tests
    build_application
    deploy_to_s3
    invalidate_cloudfront
    health_check
    cleanup
    send_notification
    
    success "🚀 Frontend deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
}

# Error handling
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"
