# EduGrowHub Frontend Testing Script (PowerShell)
# This script performs comprehensive testing of the React frontend

Write-Host "🚀 EduGrowHub Frontend Testing Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Error "Please run this script from the frontend directory"
    exit 1
}

Write-Info "Starting frontend testing..."

# 1. Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Success "Dependencies are installed"
} else {
    Write-Warning "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    } else {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# 2. Build test
Write-Info "Testing production build..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Production build successful"
    
    # Check if build directory was created
    if (Test-Path "build") {
        Write-Success "Build artifacts created successfully"
        
        # Check build size
        $BuildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Build size: $([math]::Round($BuildSize, 2)) MB"
        
        # List main build files
        Write-Info "Build contents:"
        Get-ChildItem -Path "build" | Format-Table Name, Length, LastWriteTime
    } else {
        Write-Error "Build directory not found"
        exit 1
    }
} else {
    Write-Error "Production build failed"
    exit 1
}

# 3. Test environment configuration
Write-Info "Testing environment configuration..."

if (Test-Path ".env.development") {
    Write-Success "Development environment file exists"
} else {
    Write-Warning "Development environment file missing"
}

if (Test-Path ".env.production") {
    Write-Success "Production environment file exists"
} else {
    Write-Warning "Production environment file missing"
}

# 4. Check critical files
Write-Info "Checking critical application files..."

$CriticalFiles = @(
    "src/App.js",
    "src/index.js",
    "src/services/api.js",
    "src/services/authService.js",
    "src/components/ui/Button.jsx",
    "src/pages/HomePage.jsx",
    "src/pages/StudentLogin.jsx",
    "src/pages/TeacherLogin.jsx",
    "src/pages/StudentDashboard.jsx",
    "src/pages/TeacherDashboard.jsx"
)

foreach ($file in $CriticalFiles) {
    if (Test-Path $file) {
        Write-Success "$file exists"
    } else {
        Write-Error "$file is missing"
    }
}

# 5. Check package.json scripts
Write-Info "Checking available npm scripts..."
$PackageJson = Get-Content "package.json" | ConvertFrom-Json
$Scripts = $PackageJson.scripts.PSObject.Properties.Name
foreach ($script in $Scripts) {
    Write-Success "Script available: $script"
}

# 6. Security check for sensitive data
Write-Info "Checking for hardcoded secrets..."
$PasswordFiles = Get-ChildItem -Path "src" -Recurse -Include "*.js", "*.jsx" | Select-String "password.*=" | Where-Object { $_.Line -notmatch "placeholder|type.*password" }
if ($PasswordFiles) {
    Write-Warning "Potential hardcoded passwords found - please review"
} else {
    Write-Success "No hardcoded passwords detected"
}

$ApiKeyFiles = Get-ChildItem -Path "src" -Recurse -Include "*.js", "*.jsx" | Select-String "api.*key" | Where-Object { $_.Line -notmatch "REACT_APP" }
if ($ApiKeyFiles) {
    Write-Warning "Potential hardcoded API keys found - please review"
} else {
    Write-Success "No hardcoded API keys detected"
}

# 7. Final recommendations
Write-Host ""
Write-Info "Testing Summary & Recommendations:"
Write-Host "=================================="

if (Test-Path "build") {
    Write-Success "✅ Frontend is ready for production deployment"
    Write-Info "Build artifacts are in the 'build/' directory"
    Write-Info "You can deploy these files to any static hosting service"
    Write-Host ""
    Write-Info "Recommended next steps:"
    Write-Host "  1. Deploy backend to AWS EC2 (see deploy-backend.sh)"
    Write-Host "  2. Deploy frontend to AWS S3 + CloudFront (see deploy-frontend.sh)"
    Write-Host "  3. Configure custom domain and SSL"
    Write-Host "  4. Set up monitoring and backups"
    Write-Host ""
    Write-Info "For local testing, you can run:"
    Write-Host "  - npm start (development server)"
    Write-Host "  - npx serve -s build (production build locally)"
} else {
    Write-Error "❌ Build failed - please fix errors before deployment"
}

Write-Host ""
Write-Info "Testing completed!"

# Check if serve is installed for local testing
if (-not (Get-Command "serve" -ErrorAction SilentlyContinue)) {
    Write-Info "💡 Tip: Install 'serve' globally to test production build locally:"
    Write-Host "   npm install -g serve"
    Write-Host "   serve -s build"
}
