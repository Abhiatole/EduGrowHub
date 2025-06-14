#!/usr/bin/env pwsh
# EduGrowHub AWS EC2 Ubuntu Deployment Script
# This script deploys your Spring Boot app to EC2 Ubuntu instance

param(
    [string]$EC2Host = "ec2-43-204-98-186.ap-south-1.compute.amazonaws.com",
    [string]$EC2User = "ubuntu",
    [string]$KeyFile = "edugrowhub-key.pem",
    [string]$GitRepo = "https://github.com/Abhishek-Atole/EduGrowHub.git",
    [string]$AppPort = "8080",
    [string]$AppName = "edugrowhub",
    [switch]$SetupSystemd = $true,
    [switch]$Verbose = $false
)

Write-Host "=== EduGrowHub AWS EC2 Deployment Script ===" -ForegroundColor Green
Write-Host "Target: $EC2User@$EC2Host" -ForegroundColor Blue
Write-Host "Port: $AppPort" -ForegroundColor Blue
Write-Host "Repository: $GitRepo" -ForegroundColor Blue

# Check if key file exists
if (-not (Test-Path $KeyFile)) {
    Write-Error "SSH key file not found: $KeyFile"
    Write-Host "Please ensure the key file is in the current directory or provide the full path."
    exit 1
}

# Fix key permissions (Windows)
Write-Host "Setting SSH key permissions..." -ForegroundColor Blue
icacls $KeyFile /inheritance:r
icacls $KeyFile /grant:r "$($env:USERNAME):(R)"

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Blue
$sshTest = ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'SSH connection successful'"
if ($LASTEXITCODE -ne 0) {
    Write-Error "SSH connection failed. Please check your EC2 instance, security groups, and key file."
    exit 1
}
Write-Host "✅ SSH connection successful" -ForegroundColor Green

# Step 1: Update system and install dependencies
Write-Host "`n🔧 Step 1: Installing system dependencies..." -ForegroundColor Yellow
$installScript = @"
#!/bin/bash
set -e

echo "=== Installing System Dependencies ==="

# Update system
sudo apt update -y

# Install Java 17
echo "Installing Java 17..."
sudo apt install -y openjdk-17-jdk

# Install Git
echo "Installing Git..."
sudo apt install -y git

# Install Maven
echo "Installing Maven..."
sudo apt install -y maven

# Install unzip (for future use)
sudo apt install -y unzip curl wget

# Verify installations
echo "=== Verifying Installations ==="
java -version
git --version
mvn -version

echo "✅ System dependencies installed successfully"
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$installScript' > install_deps.sh; chmod +x install_deps.sh; ./install_deps.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install system dependencies"
    exit 1
}

# Step 2: Clone repository
Write-Host "`n📥 Step 2: Cloning repository..." -ForegroundColor Yellow
$cloneScript = @"
#!/bin/bash
set -e

echo "=== Cloning Repository ==="

# Remove existing directory if it exists
if [ -d "$AppName" ]; then
    echo "Removing existing directory..."
    rm -rf $AppName
fi

# Clone repository
echo "Cloning from $GitRepo..."
git clone $GitRepo $AppName

# Navigate to project directory
cd $AppName

echo "✅ Repository cloned successfully"
echo "Project contents:"
ls -la
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$cloneScript' > clone_repo.sh; chmod +x clone_repo.sh; ./clone_repo.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to clone repository"
    exit 1
}

# Step 3: Setup environment variables
Write-Host "`n🔐 Step 3: Setting up environment variables..." -ForegroundColor Yellow

# Read local .env.prod file for reference
$envContent = ""
if (Test-Path ".env.prod") {
    $envContent = Get-Content ".env.prod" -Raw
    Write-Host "Found .env.prod file locally. Using as template." -ForegroundColor Blue
} else {
    Write-Host "No .env.prod found. Creating template..." -ForegroundColor Yellow
    $envContent = @"
# Database Configuration (AWS RDS)
DB_URL=jdbc:mysql://your-rds-endpoint:3306/edugrowhub_db
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=3600000

# Server Configuration
SERVER_PORT=8080
LOG_LEVEL=INFO
SHOW_SQL=false
DDL_AUTO=update

# Twilio Configuration (if needed)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=your_twilio_whatsapp_number

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://your-frontend-domain.com
"@
}

$setupEnvScript = @"
#!/bin/bash
set -e

echo "=== Setting up Environment Variables ==="

cd $AppName

# Create .env file
cat > .env << 'EOFMARKER'
$envContent
EOFMARKER

echo "✅ Environment file created at ~/./$AppName/.env"
echo "⚠️  IMPORTANT: Please update the .env file with your actual values:"
echo "   - AWS RDS endpoint and credentials"
echo "   - JWT secret key"
echo "   - Twilio credentials (if using WhatsApp features)"
echo ""
echo "You can edit it with: nano ~/./$AppName/.env"
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$setupEnvScript' > setup_env.sh; chmod +x setup_env.sh; ./setup_env.sh"

# Step 4: Build the application
Write-Host "`n🔨 Step 4: Building Spring Boot application..." -ForegroundColor Yellow
$buildScript = @"
#!/bin/bash
set -e

echo "=== Building Spring Boot Application ==="

cd $AppName

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Clean and build
echo "Running Maven build..."
mvn clean package -DskipTests

# Check if JAR was created
JAR_FILE="target/edugrowhub-0.0.1-SNAPSHOT.jar"
if [ -f "\$JAR_FILE" ]; then
    echo "✅ Build successful! JAR file created: \$JAR_FILE"
    ls -la target/
else
    echo "❌ Build failed! JAR file not found."
    exit 1
fi
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$buildScript' > build_app.sh; chmod +x build_app.sh; ./build_app.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build application"
    exit 1
}

# Step 5: Create systemd service (if requested)
if ($SetupSystemd) {
    Write-Host "`n⚙️ Step 5: Setting up systemd service..." -ForegroundColor Yellow
    $systemdScript = @"
#!/bin/bash
set -e

echo "=== Setting up systemd service ==="

# Create systemd service file
sudo tee /etc/systemd/system/$AppName.service > /dev/null << EOL
[Unit]
Description=EduGrowHub Spring Boot Application
After=network.target

[Service]
Type=simple
User=$EC2User
WorkingDirectory=/home/$EC2User/$AppName
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
EnvironmentFile=/home/$EC2User/$AppName/.env
ExecStart=/usr/lib/jvm/java-17-openjdk-amd64/bin/java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable $AppName

echo "✅ Systemd service created and enabled"
echo "Service will start automatically on boot"
"@

    ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$systemdScript' > setup_systemd.sh; chmod +x setup_systemd.sh; ./setup_systemd.sh"
}

# Step 6: Start the application
Write-Host "`n🚀 Step 6: Starting the application..." -ForegroundColor Yellow
if ($SetupSystemd) {
    # Start via systemd
    ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "sudo systemctl start $AppName && sudo systemctl status $AppName --no-pager"
} else {
    # Start manually in background
    $startScript = @"
#!/bin/bash
set -e

echo "=== Starting Application in Background ==="

cd $AppName

# Kill any existing Java processes (optional)
pkill -f "edugrowhub" || true

# Source environment variables and start application
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
source .env

nohup java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

echo "✅ Application started in background"
echo "Process ID: \$!"
echo "Logs: ~//$AppName/app.log"
"@

    ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$startScript' > start_app.sh; chmod +x start_app.sh; ./start_app.sh"
}

# Step 7: Check application status
Write-Host "`n✅ Step 7: Checking application status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$statusScript = @"
#!/bin/bash

echo "=== Application Status Check ==="

# Check if port is listening
if netstat -tulpn | grep :$AppPort; then
    echo "✅ Application is listening on port $AppPort"
else
    echo "❌ Application is not listening on port $AppPort"
fi

# Check Java processes
echo ""
echo "Java processes:"
ps aux | grep java | grep -v grep || echo "No Java processes found"

# Check recent logs
if [ -f "$AppName/app.log" ]; then
    echo ""
    echo "Recent application logs:"
    tail -20 $AppName/app.log
fi

# Test HTTP endpoint
echo ""
echo "Testing HTTP endpoint..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:$AppPort/actuator/health || echo "Health check endpoint not responding"
"@

ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo '$statusScript' > check_status.sh; chmod +x check_status.sh; ./check_status.sh"

# Final instructions
Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update environment variables:" -ForegroundColor White
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'nano $AppName/.env'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart application after updating .env:" -ForegroundColor White
if ($SetupSystemd) {
    Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'sudo systemctl restart $AppName'" -ForegroundColor Gray
} else {
    Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'cd $AppName && ./start_app.sh'" -ForegroundColor Gray
}
Write-Host ""
Write-Host "3. Configure AWS Security Group to allow inbound traffic on port $AppPort" -ForegroundColor White
Write-Host ""
Write-Host "4. Test your application:" -ForegroundColor White
Write-Host "   http://${EC2Host}:${AppPort}" -ForegroundColor Gray
Write-Host "   http://${EC2Host}:${AppPort}/actuator/health" -ForegroundColor Gray
Write-Host ""
Write-Host "5. View logs:" -ForegroundColor White
if ($SetupSystemd) {
    Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'sudo journalctl -u $AppName -f'" -ForegroundColor Gray
} else {
    Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'tail -f $AppName/app.log'" -ForegroundColor Gray
}

Write-Host "`n⚠️  Remember to:" -ForegroundColor Red
Write-Host "   - Update .env with your actual AWS RDS credentials" -ForegroundColor Yellow
Write-Host "   - Configure Security Group for port $AppPort access" -ForegroundColor Yellow
Write-Host "   - Test database connectivity" -ForegroundColor Yellow
