# EduGrowHub Project Validation Script (PowerShell)
# This script validates that all components are properly configured

Write-Host "🔍 EduGrowHub Project Validation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "pom.xml")) {
    Write-Host "❌ Error: pom.xml not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure validated" -ForegroundColor Green

# Check critical files
$filesToCheck = @(
    "src/main/java/com/edugrowhub/config/TwilioConfig.java",
    "src/main/java/com/edugrowhub/config/SecurityConfig.java",
    "src/main/java/com/edugrowhub/config/JwtUtil.java",
    "src/main/java/com/edugrowhub/entity/Student.java",
    "src/main/java/com/edugrowhub/entity/WhatsAppLog.java",
    "src/main/java/com/edugrowhub/service/WhatsAppService.java",
    "src/main/java/com/edugrowhub/controller/StudentAuthController.java",
    "src/main/java/com/edugrowhub/controller/TestResultController.java",
    "src/main/resources/application.properties",
    ".env"
)

Write-Host ""
Write-Host "📁 Checking critical files..." -ForegroundColor Yellow
foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Missing!" -ForegroundColor Red
    }
}

# Check pom.xml for required dependencies
Write-Host ""
Write-Host "📦 Checking Maven dependencies..." -ForegroundColor Yellow

$dependenciesToCheck = @(
    "spring-boot-starter-web",
    "spring-boot-starter-data-jpa",
    "spring-boot-starter-security",
    "mysql-connector-j",
    "lombok",
    "jjwt-api",
    "twilio"
)

$pomContent = Get-Content "pom.xml" -Raw
foreach ($dep in $dependenciesToCheck) {
    if ($pomContent -match $dep) {
        Write-Host "✅ $dep" -ForegroundColor Green
    } else {
        Write-Host "❌ $dep - Missing from pom.xml!" -ForegroundColor Red
    }
}

# Check application.properties for required configurations
Write-Host ""
Write-Host "⚙️  Checking application.properties configuration..." -ForegroundColor Yellow

$configsToCheck = @(
    "spring.datasource.url",
    "spring.datasource.username",
    "spring.datasource.password",
    "jwt.secret",
    "jwt.expiration",
    "twilio.account.sid",
    "twilio.auth.token",
    "twilio.whatsapp.from"
)

$appPropsContent = Get-Content "src/main/resources/application.properties" -Raw
foreach ($config in $configsToCheck) {
    if ($appPropsContent -match [regex]::Escape($config)) {
        Write-Host "✅ $config" -ForegroundColor Green
    } else {
        Write-Host "❌ $config - Missing from application.properties!" -ForegroundColor Red
    }
}

# Check .env file for environment variables
Write-Host ""
Write-Host "🔐 Checking .env file..." -ForegroundColor Yellow

$envVarsToCheck = @(
    "DB_URL",
    "DB_USERNAME",
    "DB_PASSWORD",
    "JWT_SECRET",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM"
)

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    foreach ($var in $envVarsToCheck) {
        if ($envContent -match $var) {
            Write-Host "✅ $var" -ForegroundColor Green
        } else {
            Write-Host "❌ $var - Missing from .env!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

# Check for Java source files
Write-Host ""
Write-Host "☕ Checking Java source files..." -ForegroundColor Yellow

$javaClasses = @(
    "TwilioConfig",
    "SecurityConfig",
    "JwtUtil",
    "WhatsAppService",
    "StudentAuthController",
    "TestResultController",
    "Student",
    "WhatsAppLog"
)

foreach ($class in $javaClasses) {
    $javaFile = Get-ChildItem -Path "src" -Recurse -Filter "*$class.java" -ErrorAction SilentlyContinue
    if ($javaFile) {
        Write-Host "✅ $class.java" -ForegroundColor Green
    } else {
        Write-Host "❌ $class.java - Not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Validation Summary" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

# Quick check for placeholder values that need to be updated
Write-Host ""
Write-Host "⚠️  Configuration values that need to be updated:" -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "your_actual_password_here") {
        Write-Host "❌ Update DB_PASSWORD in .env file" -ForegroundColor Red
    }
    
    if ($envContent -match "your_actual_auth_token_here") {
        Write-Host "❌ Update TWILIO_AUTH_TOKEN in .env file" -ForegroundColor Red
    }
    
    if ($envContent -match "your_super_secret_jwt_key") {
        Write-Host "❌ Update JWT_SECRET in .env file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update placeholder values in .env file"
Write-Host "2. Ensure MySQL database 'edugrowhub' exists"
Write-Host "3. Run: mvn clean compile"
Write-Host "4. Run: mvn spring-boot:run"
Write-Host "5. Test API endpoints using API_TESTING.md guide"

Write-Host ""
Write-Host "🎉 Validation complete!" -ForegroundColor Green
