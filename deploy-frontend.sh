#!/bin/bash

# EduGrowHub Frontend Deployment Script for AWS S3 + CloudFront
# This script builds and deploys the React frontend to AWS S3 with CloudFront distribution
# 
# Prerequisites:
# - AWS CLI installed and configured
# - Node.js 18+ installed
# - S3 bucket created for hosting
# - CloudFront distribution configured
# - Route 53 domain configured (optional)

set -e  # Exit on any error

# Configuration variables
S3_BUCKET="edugrowhub-frontend"  # Replace with your S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID="E123456789ABCD"  # Replace with your CloudFront distribution ID
DOMAIN_NAME="edugrowhub.com"  # Replace with your domain
BUILD_DIR="build"
FRONTEND_DIR="frontend"

echo "🚀 Starting EduGrowHub Frontend Deployment..."

# Check if we're in the correct directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Error: Frontend directory not found. Please run this script from the project root."
    exit 1
fi

# Navigate to frontend directory
cd $FRONTEND_DIR

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (optional)
echo "🧪 Running tests..."
npm test -- --coverage --watchAll=false

# Build the application for production
echo "🔨 Building React application for production..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build failed - build directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    exit 1
fi

# Test AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Error: AWS credentials not configured properly"
    exit 1
fi

echo "✅ AWS credentials verified"

# Sync files to S3
echo "📤 Uploading files to S3 bucket: $S3_BUCKET..."

# Upload non-HTML files with long cache headers
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
    --exclude "*.html" \
    --exclude "*.txt" \
    --exclude "*.json" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload HTML files with no cache
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
    --include "*.html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --delete

# Upload other files with short cache
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
    --include "*.txt" \
    --include "*.json" \
    --exclude "*.html" \
    --exclude "static/*" \
    --cache-control "public, max-age=300" \
    --delete

echo "✅ Files uploaded to S3 successfully"

# Create CloudFront invalidation
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$CLOUDFRONT_DISTRIBUTION_ID" != "E123456789ABCD" ]; then
    echo "🌐 Creating CloudFront invalidation..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo "✅ CloudFront invalidation created: $INVALIDATION_ID"
    echo "⏳ Waiting for invalidation to complete (this may take a few minutes)..."
    
    aws cloudfront wait invalidation-completed \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --id $INVALIDATION_ID
    
    echo "✅ CloudFront invalidation completed"
else
    echo "⚠️  Skipping CloudFront invalidation (distribution ID not configured)"
fi

# Generate deployment summary
echo ""
echo "🎉 EduGrowHub Frontend Deployment Complete!"
echo ""
echo "📊 Deployment Summary:"
echo "   S3 Bucket: s3://$S3_BUCKET"
echo "   CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "   Domain: https://$DOMAIN_NAME"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
if curl -f https://$DOMAIN_NAME > /dev/null 2>&1; then
    echo "✅ Frontend is accessible at https://$DOMAIN_NAME"
else
    echo "⚠️  Frontend test failed - check DNS and CloudFront configuration"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Test the application thoroughly"
echo "   2. Update API endpoints if needed"
echo "   3. Monitor CloudWatch for any errors"
echo "   4. Set up monitoring and alerts"
echo ""

# Go back to original directory
cd ..

echo "✅ Deployment script completed successfully!"
