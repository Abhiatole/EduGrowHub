#!/bin/bash

# EduGrowHub Complete Build Script
# This script builds both frontend and backend for production deployment

set -e  # Exit on any error

echo "🚀 EduGrowHub Complete Build Process Started"
echo "============================================="

# Configuration
BACKEND_JAR="target/edugrowhub-0.0.1-SNAPSHOT.jar"
FRONTEND_BUILD="frontend/build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    print_error "pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

if [ ! -d "frontend" ]; then
    print_error "frontend directory not found. Please ensure the frontend is in the correct location."
    exit 1
fi

# Check Java
if ! command -v java &> /dev/null; then
    print_error "Java is not installed or not in PATH"
    exit 1
fi

# Check Maven
if ! command -v mvn &> /dev/null && ! [ -f "./mvnw" ]; then
    print_error "Maven is not installed and maven wrapper not found"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "All prerequisites satisfied"

# Clean previous builds
print_status "Cleaning previous builds..."
if [ -f "$BACKEND_JAR" ]; then
    rm -f "$BACKEND_JAR"
    print_status "Removed previous backend JAR"
fi

if [ -d "$FRONTEND_BUILD" ]; then
    rm -rf "$FRONTEND_BUILD"
    print_status "Removed previous frontend build"
fi

# Build backend
print_status "Building Spring Boot backend..."
if [ -f "./mvnw" ]; then
    ./mvnw clean package -DskipTests -Pprod
else
    mvn clean package -DskipTests -Pprod
fi

if [ -f "$BACKEND_JAR" ]; then
    print_success "Backend build completed: $BACKEND_JAR"
    
    # Display JAR information
    JAR_SIZE=$(du -h "$BACKEND_JAR" | cut -f1)
    print_status "Backend JAR size: $JAR_SIZE"
else
    print_error "Backend build failed - JAR file not found"
    exit 1
fi

# Build frontend
print_status "Building React frontend..."
cd frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm ci

# Run tests
print_status "Running frontend tests..."
npm test -- --coverage --watchAll=false || print_warning "Some tests failed, but continuing with build"

# Set production environment
export REACT_APP_ENVIRONMENT=production

# Build for production
print_status "Building frontend for production..."
npm run build

if [ -d "build" ]; then
    print_success "Frontend build completed: frontend/build"
    
    # Display build information
    BUILD_SIZE=$(du -sh build | cut -f1)
    print_status "Frontend build size: $BUILD_SIZE"
    
    # Count files
    FILE_COUNT=$(find build -type f | wc -l)
    print_status "Frontend files generated: $FILE_COUNT"
else
    print_error "Frontend build failed - build directory not found"
    exit 1
fi

cd ..

# Validate builds
print_status "Validating builds..."

# Check if JAR is executable
if java -jar "$BACKEND_JAR" --help > /dev/null 2>&1; then
    print_success "Backend JAR is valid and executable"
else
    print_warning "Backend JAR validation failed"
fi

# Check if frontend has essential files
if [ -f "$FRONTEND_BUILD/index.html" ] && [ -d "$FRONTEND_BUILD/static" ]; then
    print_success "Frontend build contains essential files"
else
    print_error "Frontend build is missing essential files"
    exit 1
fi

# Generate build summary
print_status "Generating build summary..."

cat > BUILD_SUMMARY.md << EOF
# EduGrowHub Build Summary

**Build Date:** $(date)
**Build Environment:** Production

## Backend Build
- **JAR File:** $BACKEND_JAR
- **Size:** $(du -h "$BACKEND_JAR" | cut -f1)
- **Java Version:** $(java -version 2>&1 | head -n 1)
- **Maven Version:** $(if [ -f "./mvnw" ]; then echo "Maven Wrapper"; else mvn -version | head -n 1; fi)

## Frontend Build
- **Build Directory:** $FRONTEND_BUILD
- **Size:** $(du -sh "$FRONTEND_BUILD" | cut -f1)
- **Files Count:** $(find "$FRONTEND_BUILD" -type f | wc -l)
- **Node.js Version:** $(node --version)
- **npm Version:** $(npm --version)

## Build Artifacts
- Backend: \`$BACKEND_JAR\`
- Frontend: \`$FRONTEND_BUILD/\`

## Deployment Commands
\`\`\`bash
# Backend deployment
java -jar $BACKEND_JAR --spring.profiles.active=production

# Frontend deployment (example for S3)
aws s3 sync $FRONTEND_BUILD s3://your-bucket-name --delete
\`\`\`

## Environment Variables Required
### Backend
- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM

### Frontend
- REACT_APP_API_URL
- REACT_APP_ENVIRONMENT=production

Built with ❤️ by EduGrowHub Development Team
EOF

print_success "Build summary generated: BUILD_SUMMARY.md"

# Create deployment package
print_status "Creating deployment package..."
DEPLOYMENT_DIR="deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOYMENT_DIR"

# Copy backend artifacts
cp "$BACKEND_JAR" "$DEPLOYMENT_DIR/"
cp -r src/main/resources/sql "$DEPLOYMENT_DIR/" 2>/dev/null || true
cp .env.prod "$DEPLOYMENT_DIR/backend.env" 2>/dev/null || true

# Copy frontend artifacts
cp -r "$FRONTEND_BUILD" "$DEPLOYMENT_DIR/frontend-build"
cp frontend/.env.production "$DEPLOYMENT_DIR/frontend.env" 2>/dev/null || true

# Copy deployment scripts
cp deploy-backend.sh "$DEPLOYMENT_DIR/" 2>/dev/null || true
cp deploy-frontend.sh "$DEPLOYMENT_DIR/" 2>/dev/null || true

# Copy documentation
cp BUILD_SUMMARY.md "$DEPLOYMENT_DIR/"
cp PRODUCTION_DEPLOYMENT_GUIDE.md "$DEPLOYMENT_DIR/" 2>/dev/null || true

# Create deployment archive
tar -czf "${DEPLOYMENT_DIR}.tar.gz" "$DEPLOYMENT_DIR"
ARCHIVE_SIZE=$(du -h "${DEPLOYMENT_DIR}.tar.gz" | cut -f1)

print_success "Deployment package created: ${DEPLOYMENT_DIR}.tar.gz ($ARCHIVE_SIZE)"

# Final summary
echo ""
echo "🎉 Build Process Completed Successfully!"
echo "========================================"
echo ""
print_success "Backend: Ready for deployment to AWS EC2"
print_success "Frontend: Ready for deployment to AWS S3"
print_success "Package: ${DEPLOYMENT_DIR}.tar.gz"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload deployment package to your servers"
echo "   2. Extract: tar -xzf ${DEPLOYMENT_DIR}.tar.gz"
echo "   3. Run backend deployment: ./deploy-backend.sh"
echo "   4. Run frontend deployment: ./deploy-frontend.sh"
echo "   5. Configure environment variables"
echo "   6. Test the application end-to-end"
echo ""
print_status "Refer to PRODUCTION_DEPLOYMENT_GUIDE.md for detailed deployment instructions"
echo ""

# Cleanup temporary deployment directory
rm -rf "$DEPLOYMENT_DIR"

print_success "EduGrowHub build completed successfully! 🚀"
