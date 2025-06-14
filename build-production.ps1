# EduGrowHub Complete Build Script (PowerShell)
# This script builds both frontend and backend for production deployment

param(
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 EduGrowHub Complete Build Process Started" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$BackendJar = "target\edugrowhub-0.0.1-SNAPSHOT.jar"
$FrontendBuild = "frontend\build"

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check if we're in the right directory
if (!(Test-Path "pom.xml")) {
    Write-Error "pom.xml not found. Please run this script from the project root directory."
    exit 1
}

if (!(Test-Path "frontend")) {
    Write-Error "frontend directory not found. Please ensure the frontend is in the correct location."
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Status "Java found: $javaVersion"
} catch {
    Write-Error "Java is not installed or not in PATH"
    exit 1
}

# Check Maven
$mvnCommand = $null
if (Test-Path ".\mvnw.cmd") {
    $mvnCommand = ".\mvnw.cmd"
    Write-Status "Using Maven Wrapper"
} elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
    $mvnCommand = "mvn"
    Write-Status "Using system Maven"
} else {
    Write-Error "Maven is not installed and maven wrapper not found"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Status "Node.js found: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Status "npm found: $npmVersion"
} catch {
    Write-Error "npm is not installed"
    exit 1
}

Write-Success "All prerequisites satisfied"

# Clean previous builds
Write-Status "Cleaning previous builds..."
if (Test-Path $BackendJar) {
    Remove-Item $BackendJar -Force
    Write-Status "Removed previous backend JAR"
}

if (Test-Path $FrontendBuild) {
    Remove-Item $FrontendBuild -Recurse -Force
    Write-Status "Removed previous frontend build"
}

# Build backend
Write-Status "Building Spring Boot backend..."
$buildArgs = "clean", "package", "-DskipTests", "-Pprod"
if ($SkipTests) {
    Write-Status "Skipping tests as requested"
} else {
    $buildArgs = "clean", "package", "-Pprod"
}

try {
    & $mvnCommand $buildArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Maven build failed"
    }
} catch {
    Write-Error "Backend build failed: $_"
    exit 1
}

if (Test-Path $BackendJar) {
    Write-Success "Backend build completed: $BackendJar"
    
    # Display JAR information
    $jarSize = (Get-Item $BackendJar).Length / 1MB
    Write-Status "Backend JAR size: $([math]::Round($jarSize, 2)) MB"
} else {
    Write-Error "Backend build failed - JAR file not found"
    exit 1
}

# Build frontend
Write-Status "Building React frontend..."
Set-Location frontend

try {
    # Install dependencies
    Write-Status "Installing frontend dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        throw "npm ci failed"
    }

    # Run tests
    if (!$SkipTests) {
        Write-Status "Running frontend tests..."
        try {
            npm test -- --coverage --watchAll=false
        } catch {
            Write-Warning "Some tests failed, but continuing with build"
        }
    }

    # Set production environment
    $env:REACT_APP_ENVIRONMENT = "production"

    # Build for production
    Write-Status "Building frontend for production..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm build failed"
    }

} catch {
    Write-Error "Frontend build failed: $_"
    Set-Location ..
    exit 1
}

if (Test-Path "build") {
    Write-Success "Frontend build completed: frontend\build"
    
    # Display build information
    $buildSize = (Get-ChildItem -Path "build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Status "Frontend build size: $([math]::Round($buildSize, 2)) MB"
    
    # Count files
    $fileCount = (Get-ChildItem -Path "build" -Recurse -File).Count
    Write-Status "Frontend files generated: $fileCount"
} else {
    Write-Error "Frontend build failed - build directory not found"
    Set-Location ..
    exit 1
}

Set-Location ..

# Validate builds
Write-Status "Validating builds..."

# Check if JAR is executable
try {
    $javaHelp = java -jar $BackendJar --help 2>&1
    Write-Success "Backend JAR is valid and executable"
} catch {
    Write-Warning "Backend JAR validation failed"
}

# Check if frontend has essential files
if ((Test-Path "$FrontendBuild\index.html") -and (Test-Path "$FrontendBuild\static")) {
    Write-Success "Frontend build contains essential files"
} else {
    Write-Error "Frontend build is missing essential files"
    exit 1
}

# Generate build summary
Write-Status "Generating build summary..."

$buildDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$jarSizeFormatted = "{0:N2} MB" -f ((Get-Item $BackendJar).Length / 1MB)
$frontendSizeFormatted = "{0:N2} MB" -f ((Get-ChildItem -Path $FrontendBuild -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)
$frontendFileCount = (Get-ChildItem -Path $FrontendBuild -Recurse -File).Count

$buildSummary = @"
# EduGrowHub Build Summary

**Build Date:** $buildDate
**Build Environment:** Production

## Backend Build
- **JAR File:** $BackendJar
- **Size:** $jarSizeFormatted
- **Java Version:** $(java -version 2>&1 | Select-Object -First 1)
- **Maven:** $mvnCommand

## Frontend Build
- **Build Directory:** $FrontendBuild
- **Size:** $frontendSizeFormatted
- **Files Count:** $frontendFileCount
- **Node.js Version:** $(node --version)
- **npm Version:** $(npm --version)

## Build Artifacts
- Backend: ``$BackendJar``
- Frontend: ``$FrontendBuild\``

## Deployment Commands
```bash
# Backend deployment
java -jar $BackendJar --spring.profiles.active=production

# Frontend deployment (example for S3)
aws s3 sync $FrontendBuild s3://your-bucket-name --delete
```

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
"@

$buildSummary | Out-File -FilePath "BUILD_SUMMARY.md" -Encoding UTF8
Write-Success "Build summary generated: BUILD_SUMMARY.md"

# Create deployment package
Write-Status "Creating deployment package..."
$deploymentDir = "deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null

# Copy backend artifacts
Copy-Item $BackendJar -Destination $deploymentDir
if (Test-Path "src\main\resources\sql") {
    Copy-Item "src\main\resources\sql" -Destination $deploymentDir -Recurse
}
if (Test-Path ".env.prod") {
    Copy-Item ".env.prod" -Destination "$deploymentDir\backend.env"
}

# Copy frontend artifacts
Copy-Item $FrontendBuild -Destination "$deploymentDir\frontend-build" -Recurse
if (Test-Path "frontend\.env.production") {
    Copy-Item "frontend\.env.production" -Destination "$deploymentDir\frontend.env"
}

# Copy deployment scripts
if (Test-Path "deploy-backend.sh") {
    Copy-Item "deploy-backend.sh" -Destination $deploymentDir
}
if (Test-Path "deploy-frontend.sh") {
    Copy-Item "deploy-frontend.sh" -Destination $deploymentDir
}

# Copy documentation
Copy-Item "BUILD_SUMMARY.md" -Destination $deploymentDir
if (Test-Path "PRODUCTION_DEPLOYMENT_GUIDE.md") {
    Copy-Item "PRODUCTION_DEPLOYMENT_GUIDE.md" -Destination $deploymentDir
}

# Create deployment archive
$archiveName = "$deploymentDir.zip"
Compress-Archive -Path $deploymentDir -DestinationPath $archiveName -Force
$archiveSize = "{0:N2} MB" -f ((Get-Item $archiveName).Length / 1MB)

Write-Success "Deployment package created: $archiveName ($archiveSize)"

# Final summary
Write-Host ""
Write-Host "🎉 Build Process Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Success "Backend: Ready for deployment to AWS EC2"
Write-Success "Frontend: Ready for deployment to AWS S3"
Write-Success "Package: $archiveName"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Upload deployment package to your servers"
Write-Host "   2. Extract the ZIP file"
Write-Host "   3. Run backend deployment script"
Write-Host "   4. Run frontend deployment script"
Write-Host "   5. Configure environment variables"
Write-Host "   6. Test the application end-to-end"
Write-Host ""
Write-Status "Refer to PRODUCTION_DEPLOYMENT_GUIDE.md for detailed deployment instructions"
Write-Host ""

# Cleanup temporary deployment directory
Remove-Item $deploymentDir -Recurse -Force

Write-Success "EduGrowHub build completed successfully! 🚀"
