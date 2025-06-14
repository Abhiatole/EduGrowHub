#!/usr/bin/env pwsh
# EduGrowHub AWS EC2 Ubuntu Deployment Script - Simplified Version
param(
    [string]$EC2Host = "ec2-43-204-98-186.ap-south-1.compute.amazonaws.com",
    [string]$EC2User = "ubuntu",
    [string]$KeyFile = "edugrowhub-key.pem",
    [string]$GitRepo = "https://github.com/Abhishek-Atole/EduGrowHub.git",
    [string]$AppPort = "8080",
    [string]$AppName = "edugrowhub"
)

Write-Host "=== EduGrowHub AWS EC2 Deployment Script ===" -ForegroundColor Green
Write-Host "Target: $EC2User@$EC2Host" -ForegroundColor Blue

# Check SSH key
if (-not (Test-Path $KeyFile)) {
    Write-Error "SSH key file not found: $KeyFile"
    exit 1
}

# Fix key permissions
icacls $KeyFile /inheritance:r | Out-Null
icacls $KeyFile /grant:r "$($env:USERNAME):(R)" | Out-Null

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Blue
$result = ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'SSH OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Error "SSH connection failed"
    exit 1
}
Write-Host "✅ SSH connection successful" -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "`n🔧 Step 1: Installing dependencies..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
sudo apt update -y
sudo apt install -y openjdk-17-jdk git maven curl
java -version
git --version  
mvn -version
echo '✅ Dependencies installed'
"@

# Step 2: Clone repository
Write-Host "`n📥 Step 2: Cloning repository..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
rm -rf $AppName
git clone $GitRepo $AppName
cd $AppName
ls -la
echo '✅ Repository cloned'
"@

# Step 3: Create environment file
Write-Host "`n🔐 Step 3: Creating environment file..." -ForegroundColor Yellow
$envTemplate = @"
# Database Configuration (Update with your RDS details)
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
"@

# Save env template to local file first
$envTemplate | Out-File -FilePath "temp_env.txt" -Encoding UTF8

# Copy to EC2
scp -i $KeyFile -o StrictHostKeyChecking=no "temp_env.txt" "$EC2User@${EC2Host}:~/"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "mv temp_env.txt $AppName/.env; echo '✅ Environment file created'"

# Cleanup
Remove-Item "temp_env.txt" -Force

# Step 4: Build application
Write-Host "`n🔨 Step 4: Building application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
cd $AppName
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn clean package -DskipTests
ls -la target/
echo '✅ Build completed'
"@

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Step 5: Create systemd service
Write-Host "`n⚙️ Step 5: Setting up systemd service..." -ForegroundColor Yellow
$serviceContent = @"
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

[Install]
WantedBy=multi-user.target
"@

$serviceContent | Out-File -FilePath "temp_service.txt" -Encoding UTF8
scp -i $KeyFile -o StrictHostKeyChecking=no "temp_service.txt" "$EC2User@${EC2Host}:~/"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
sudo mv temp_service.txt /etc/systemd/system/$AppName.service
sudo systemctl daemon-reload
sudo systemctl enable $AppName
echo '✅ Systemd service created'
"@
Remove-Item "temp_service.txt" -Force

# Step 6: Start application
Write-Host "`n🚀 Step 6: Starting application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
sudo systemctl start $AppName
sudo systemctl status $AppName --no-pager
"@

# Step 7: Check status
Write-Host "`n✅ Step 7: Checking status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host @"
netstat -tulpn | grep :$AppPort || echo 'Port not listening yet'
ps aux | grep java | grep -v grep || echo 'No Java processes'
curl -s http://localhost:$AppPort/actuator/health || echo 'Health check failed'
"@

Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT NEXT STEPS:" -ForegroundColor Red
Write-Host "1. Update environment variables with your RDS credentials:" -ForegroundColor Yellow
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'nano $AppName/.env'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart the service after updating .env:" -ForegroundColor Yellow
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'sudo systemctl restart $AppName'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure Security Group to allow port $AppPort" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Test your application:" -ForegroundColor Yellow
Write-Host "   http://${EC2Host}:${AppPort}/actuator/health" -ForegroundColor Gray
Write-Host ""
Write-Host "5. View logs:" -ForegroundColor Yellow
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'sudo journalctl -u $AppName -f'" -ForegroundColor Gray
