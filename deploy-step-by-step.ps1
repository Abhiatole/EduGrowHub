#!/usr/bin/env pwsh
# EduGrowHub AWS EC2 Ubuntu Deployment Script - Step by Step
param(
    [string]$EC2Host = "ec2-43-204-98-186.ap-south-1.compute.amazonaws.com",
    [string]$EC2User = "ubuntu", 
    [string]$KeyFile = "edugrowhub-key.pem",
    [string]$GitRepo = "https://github.com/Abhishek-Atole/EduGrowHub.git",
    [string]$AppName = "edugrowhub"
)

Write-Host "=== EduGrowHub Deployment to EC2 ===" -ForegroundColor Green

# Test SSH
Write-Host "Testing SSH connection..." -ForegroundColor Blue
ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'SSH connection successful'"
if ($LASTEXITCODE -ne 0) { Write-Error "SSH failed"; exit 1 }

# Step 1: Update system and install Java, Git, Maven
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "sudo apt update -y"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "sudo apt install -y openjdk-17-jdk"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "sudo apt install -y git"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "sudo apt install -y maven"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "java -version"

# Step 2: Clone repository
Write-Host "Step 2: Cloning repository..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "rm -rf $AppName"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "git clone $GitRepo $AppName"

# Step 3: Build application  
Write-Host "Step 3: Building application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "cd $AppName && export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 && mvn clean package -DskipTests"

# Check if build succeeded
$buildCheck = ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "ls -la $AppName/target/edugrowhub-0.0.1-SNAPSHOT.jar"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed - JAR file not created"
    exit 1
}

Write-Host "Build successful! JAR file created." -ForegroundColor Green

# Step 4: Start application in background
Write-Host "Step 4: Starting application..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "cd $AppName && nohup java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"

# Wait and check if app started
Start-Sleep -Seconds 10
Write-Host "Checking application status..." -ForegroundColor Blue
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "netstat -tulpn | grep :8080"
ssh -i $KeyFile -o StrictHostKeyChecking=no $EC2User@$EC2Host "ps aux | grep java"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure AWS Security Group to allow port 8080 inbound traffic"
Write-Host "2. Test the application:"
Write-Host "   http://$EC2Host:8080/actuator/health"
Write-Host ""
Write-Host "3. Create environment file with your database credentials:"
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host"
Write-Host "   cd $AppName"
Write-Host "   nano .env"
Write-Host ""
Write-Host "4. After updating .env, restart the app:"
Write-Host "   pkill -f java"
Write-Host "   nohup java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar > app.log 2>&1 &"
Write-Host ""
Write-Host "5. View logs:"
Write-Host "   ssh -i $KeyFile $EC2User@$EC2Host 'tail -f $AppName/app.log'"
