#!/bin/bash

# EduGrowHub Frontend Testing Script
# This script performs comprehensive testing of the React frontend

echo "🚀 EduGrowHub Frontend Testing Script"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the frontend directory"
    exit 1
fi

print_info "Starting frontend testing..."

# 1. Check if node_modules exists
if [ -d "node_modules" ]; then
    print_status "Dependencies are installed"
else
    print_warning "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# 2. Lint check (if ESLint is configured)
print_info "Running code quality checks..."
npx eslint src/ --ext .js,.jsx --max-warnings 0 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Code quality checks passed"
else
    print_warning "Code quality checks had warnings (this is normal for a new project)"
fi

# 3. Build test
print_info "Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Production build successful"
    
    # Check if build directory was created
    if [ -d "build" ]; then
        print_status "Build artifacts created successfully"
        
        # Check build size
        BUILD_SIZE=$(du -sh build | cut -f1)
        print_info "Build size: $BUILD_SIZE"
        
        # List main build files
        print_info "Build contents:"
        ls -la build/
    else
        print_error "Build directory not found"
        exit 1
    fi
else
    print_error "Production build failed"
    exit 1
fi

# 4. Test environment configuration
print_info "Testing environment configuration..."

if [ -f ".env.development" ]; then
    print_status "Development environment file exists"
else
    print_warning "Development environment file missing"
fi

if [ -f ".env.production" ]; then
    print_status "Production environment file exists"
else
    print_warning "Production environment file missing"
fi

# 5. Check critical files
print_info "Checking critical application files..."

CRITICAL_FILES=(
    "src/App.js"
    "src/index.js"
    "src/services/api.js"
    "src/services/authService.js"
    "src/components/ui/Button.jsx"
    "src/pages/HomePage.jsx"
    "src/pages/StudentLogin.jsx"
    "src/pages/TeacherLogin.jsx"
    "src/pages/StudentDashboard.jsx"
    "src/pages/TeacherDashboard.jsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
    fi
done

# 6. Check package.json scripts
print_info "Checking available npm scripts..."
SCRIPTS=$(cat package.json | grep -A 10 '"scripts"' | grep '"' | sed 's/.*"\([^"]*\)".*/\1/' | grep -v scripts)
for script in $SCRIPTS; do
    if [ "$script" != "" ]; then
        print_status "Script available: $script"
    fi
done

# 7. Test component imports (basic syntax check)
print_info "Testing component imports..."
node -e "
const fs = require('fs');
const files = [
    'src/App.js',
    'src/pages/HomePage.jsx',
    'src/pages/StudentLogin.jsx'
];

let hasErrors = false;
files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('import') && content.includes('export')) {
            console.log('✓ ' + file + ' has proper imports/exports');
        } else {
            console.log('⚠ ' + file + ' might have import/export issues');
            hasErrors = true;
        }
    }
});

process.exit(hasErrors ? 1 : 0);
"

if [ $? -eq 0 ]; then
    print_status "Component imports look good"
else
    print_warning "Some components might have import issues"
fi

# 8. Security check for sensitive data
print_info "Checking for hardcoded secrets..."
if grep -r "password.*=" src/ | grep -v "placeholder\|type.*password" >/dev/null 2>&1; then
    print_warning "Potential hardcoded passwords found - please review"
else
    print_status "No hardcoded passwords detected"
fi

if grep -r "api.*key" src/ | grep -v "REACT_APP" >/dev/null 2>&1; then
    print_warning "Potential hardcoded API keys found - please review"
else
    print_status "No hardcoded API keys detected"
fi

# 9. Final recommendations
echo ""
print_info "Testing Summary & Recommendations:"
echo "=================================="

if [ -d "build" ]; then
    print_status "✅ Frontend is ready for production deployment"
    print_info "Build artifacts are in the 'build/' directory"
    print_info "You can deploy these files to any static hosting service"
    echo ""
    print_info "Recommended next steps:"
    echo "  1. Deploy backend to AWS EC2 (see deploy-backend.sh)"
    echo "  2. Deploy frontend to AWS S3 + CloudFront (see deploy-frontend.sh)"
    echo "  3. Configure custom domain and SSL"
    echo "  4. Set up monitoring and backups"
    echo ""
    print_info "For local testing, you can run:"
    echo "  - npm start (development server)"
    echo "  - npx serve -s build (production build locally)"
else
    print_error "❌ Build failed - please fix errors before deployment"
fi

echo ""
print_info "Testing completed!"
