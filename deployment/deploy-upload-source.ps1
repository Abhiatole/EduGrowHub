#!/usr/bin/env pwsh
# EduGrowHub Deployment - Upload Local Source to EC2
param(
    [string]$EC2Host = "ec2-43-204-98-186.ap-south-1.compute.amazonaws.com",
    [string]$EC2User = "ubuntu",
    [string]$KeyFile = "edugrowhub-key.pem",
    [string]$AppName = "edugrowhub"
)

Write-Host "=== Uploading EduGrowHub Source to EC2 ===" -ForegroundColor Green

# Test SSH connection
ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'SSH OK'"
if ($LASTEXITCODE -ne 0) { Write-Error "SSH failed"; exit 1 }

# Step 1: Create application directory on EC2
Write-Host "Step 1: Preparing EC2 environment..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "rm -rf $AppName && mkdir -p $AppName"

# Step 2: Upload source files
Write-Host "Step 2: Uploading source files..." -ForegroundColor Yellow
scp -i $KeyFile -o StrictHostKeyChecking=no -r "src" "$EC2User@${EC2Host}:~/$AppName/"
scp -i $KeyFile -o StrictHostKeyChecking=no "pom.xml" "$EC2User@${EC2Host}:~/$AppName/"

# Step 3: Create environment file
Write-Host "Step 3: Creating environment file..." -ForegroundColor Yellow
$envContent = @"
# Database Configuration - UPDATE WITH YOUR RDS DETAILS
DB_URL=jdbc:mysql://your-rds-endpoint:3306/edugrowhub_db
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=61772be6d3b74f126fe124dd7723269c456366fcc40d9aaa97cf4d302676ae51
JWT_EXPIRATION=3600000

# Server Configuration
SERVER_PORT=8080
LOG_LEVEL=INFO
SHOW_SQL=false
DDL_AUTO=update

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
"@

$envContent | Out-File -FilePath "temp_env.txt" -Encoding UTF8
scp -i $KeyFile -o StrictHostKeyChecking=no "temp_env.txt" "$EC2User@${EC2Host}:~/$AppName/.env"
Remove-Item "temp_env.txt" -Force

# Step 4: Build the application
Write-Host "Step 4: Building application on EC2..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "cd $AppName && export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 && mvn clean package -DskipTests"

# Check if build was successful
$jarCheck = ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "ls -la $AppName/target/edugrowhub-0.0.1-SNAPSHOT.jar 2>/dev/null"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Checking logs..." -ForegroundColor Red
    ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "cd $AppName && mvn clean package -DskipTests"
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 5: Create a simple startup script
Write-Host "Step 5: Creating startup script..." -ForegroundColor Yellow
$startScript = @"
#!/bin/bash
cd ~/edugrowhub
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
source .env
nohup java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
echo "Application started. PID: \$!"
echo "Logs: ~/edugrowhub/app.log"
"@

$startScript | Out-File -FilePath "start_app.sh" -Encoding UTF8
scp -i $KeyFile -o StrictHostKeyChecking=no "start_app.sh" "$EC2User@${EC2Host}:~/"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "chmod +x start_app.sh"
Remove-Item "start_app.sh" -Force

# Step 6: Start the application
Write-Host "Step 6: Starting application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "./start_app.sh"

# Step 7: Check status
Write-Host "Step 7: Checking application status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "netstat -tulpn | grep :8080 || echo 'Port 8080 not listening'"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "ps aux | grep java | grep -v grep || echo 'No Java processes'"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 IMPORTANT: Configure your environment variables" -ForegroundColor Red
Write-Host "1. SSH to your server:" -ForegroundColor Yellow
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Edit the .env file with your RDS credentials:" -ForegroundColor Yellow
Write-Host "   nano edugrowhub/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart the application:" -ForegroundColor Yellow
Write-Host "   pkill -f java" -ForegroundColor Gray
Write-Host "   ./start_app.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure Security Group for port 8080 access" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Test the application:" -ForegroundColor Yellow
Write-Host "   http://$EC2Host:8080/actuator/health" -ForegroundColor Gray
Write-Host ""
Write-Host "6. View logs:" -ForegroundColor Yellow
