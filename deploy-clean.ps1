param(
    [string]$EC2Host = "ec2-43-204-98-186.ap-south-1.compute.amazonaws.com",
    [string]$EC2User = "ubuntu",
    [string]$KeyFile = "edugrowhub-key.pem",
    [string]$AppName = "edugrowhub"
)

Write-Host "=== EduGrowHub Deployment to EC2 ===" -ForegroundColor Green

# Test SSH
ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'SSH connection successful'"
if ($LASTEXITCODE -ne 0) { 
    Write-Error "SSH connection failed"
    exit 1 
}

# Create app directory
Write-Host "Preparing EC2 environment..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "rm -rf $AppName && mkdir -p $AppName"

# Upload source files
Write-Host "Uploading source files..." -ForegroundColor Yellow
scp -i $KeyFile -o StrictHostKeyChecking=no -r "src" "$EC2User@${EC2Host}:~/$AppName/"
scp -i $KeyFile -o StrictHostKeyChecking=no "pom.xml" "$EC2User@${EC2Host}:~/$AppName/"

# Create environment file
Write-Host "Creating environment configuration..." -ForegroundColor Yellow
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
"@

$envContent | Out-File -FilePath "temp_env.txt" -Encoding UTF8
scp -i $KeyFile -o StrictHostKeyChecking=no "temp_env.txt" "$EC2User@${EC2Host}:~/$AppName/.env"
Remove-Item "temp_env.txt" -Force

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "cd $AppName && export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 && mvn clean package -DskipTests"

# Check build result
$jarCheck = ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "ls -la $AppName/target/edugrowhub-0.0.1-SNAPSHOT.jar 2>/dev/null"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed - JAR file not created"
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Create startup script
$startScript = @"
#!/bin/bash
cd ~/edugrowhub
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
source .env
nohup java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
echo "Application started"
"@

$startScript | Out-File -FilePath "start_app.sh" -Encoding UTF8
scp -i $KeyFile -o StrictHostKeyChecking=no "start_app.sh" "$EC2User@${EC2Host}:~/"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "chmod +x start_app.sh"
Remove-Item "start_app.sh" -Force

# Start application
Write-Host "Starting application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "./start_app.sh"

# Check status
Start-Sleep -Seconds 10
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "netstat -tulpn | grep :8080 || echo 'Port 8080 not listening'"

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with RDS credentials"
Write-Host "2. Configure Security Group for port 8080"
Write-Host "3. Test: http://$EC2Host:8080/actuator/health"
