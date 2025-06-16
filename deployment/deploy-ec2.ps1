# EduGrowHub AWS EC2 Deployment Script for Windows PowerShell
# This script helps deploy the application to AWS EC2

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2Host,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyFile,
    
    [string]$EC2User = "ec2-user",
    [string]$AppName = "edugrowhub",
    [string]$JavaVersion = "11",
    [switch]$SetupOnly,
    [switch]$DeployOnly,
    [switch]$EnableVerbose
)

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"

function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $GREEN
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $RED
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $YELLOW
}

function Test-Prerequisites {
    Write-Log "Checking local prerequisites..."
    
    # Check if SSH is available
    try {
        ssh -V 2>&1 | Out-Null
        Write-Success "SSH client available"
    } catch {
        Write-Error "SSH client not found. Please install OpenSSH client"
        return $false
    }
    
    # Check if SCP is available
    try {
        scp -h 2>&1 | Out-Null
        Write-Success "SCP client available"
    } catch {
        Write-Error "SCP client not found. Please install OpenSSH client"
        return $false
    }
    
    # Check key file
    if (-not (Test-Path $KeyFile)) {
        Write-Error "Key file not found: $KeyFile"
        return $false
    }
    
    Write-Success "Key file found: $KeyFile"
      # Check if JAR file exists (optional - we can build on server)
    $jarFiles = Get-ChildItem -Path "target" -Filter "*.jar" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch "original" }
    if ($jarFiles.Count -eq 0) {
        Write-Warning "No JAR file found in target directory. Will build on server."
        $global:BuildOnServer = $true
    } else {
        Write-Success "JAR file found: $($jarFiles[0].Name)"
        $global:BuildOnServer = $false
    }
    return $true
}

function Test-EC2Connection {
    Write-Log "Testing EC2 connection..."
    
    try {
        $result = ssh -i $KeyFile -o ConnectTimeout=10 -o StrictHostKeyChecking=no $EC2User@$EC2Host "echo 'Connection successful'"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "EC2 connection successful"
            return $true
        } else {
            Write-Error "EC2 connection failed"
            return $false
        }
    } catch {
        Write-Error "Failed to connect to EC2: $_"
        return $false
    }
}

function Install-JavaOnEC2 {
    Write-Log "Installing Java $JavaVersion on EC2..."
    
    # First detect the OS
    try {
        $osCheck = ssh -i $KeyFile "${EC2User}@${EC2Host}" "cat /etc/os-release | grep '^ID=' | cut -d'=' -f2 | tr -d '\"'"
        Write-Log "Detected OS: $osCheck"
    } catch {
        Write-Warning "Could not detect OS, assuming Amazon Linux"
        $osCheck = "amzn"
    }
    
    if ($osCheck -match "ubuntu") {
        $commands = @"
# Update system packages
sudo apt update -y

# Install Java
sudo apt install -y default-jdk maven

# Verify Java installation
java -version
mvn -version

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/default-java' >> ~/.bashrc
export JAVA_HOME=/usr/lib/jvm/default-java

# Create application directory
sudo mkdir -p /opt/$AppName
sudo chown ${EC2User}:${EC2User} /opt/$AppName

# Create logs directory
sudo mkdir -p /var/log/$AppName
sudo chown ${EC2User}:${EC2User} /var/log/$AppName

# Create systemd service directory
sudo mkdir -p /etc/systemd/system
"@
    } else {
        $commands = @"
# Update system packages
sudo yum update -y

# Install Java
sudo yum install -y java-$JavaVersion-amazon-corretto maven

# Verify Java installation
java -version
mvn -version

# Create application directory
sudo mkdir -p /opt/$AppName
sudo chown ${EC2User}:${EC2User} /opt/$AppName

# Create logs directory
sudo mkdir -p /var/log/$AppName
sudo chown ${EC2User}:${EC2User} /var/log/$AppName

# Create systemd service directory
sudo mkdir -p /etc/systemd/system
"@
    }
    
    try {
        $commands | ssh -i $KeyFile $EC2User@$EC2Host "bash -s"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Java installation completed"
            return $true
        } else {
            Write-Error "Java installation failed"
            return $false
        }
    } catch {
        Write-Error "Failed to install Java: $_"
        return $false
    }
}

function Build-ApplicationOnServer {
    Write-Log "Building application on EC2 server..."
    
    try {
        # Copy source code to server
        Write-Log "Copying source code to server"
        # Ensure directory exists and has proper permissions
        ssh -i $KeyFile "${EC2User}@${EC2Host}" "sudo mkdir -p /opt/$AppName/src && sudo chown -R ${EC2User}:${EC2User} /opt/$AppName"
        
        # Copy essential files
        scp -i $KeyFile -r src pom.xml "${EC2User}@${EC2Host}:/opt/$AppName/"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to copy source code"
            return $false
        }
        
        # Build the application on server
        Write-Log "Building application with Maven on server"
        $buildCommands = @"
cd /opt/$AppName
export JAVA_HOME=/usr/lib/jvm/default-java
export PATH=`$JAVA_HOME/bin:`$PATH
java -version
mvn -version
mvn clean package -DskipTests
"@
        
        $buildCommands | ssh -i $KeyFile "${EC2User}@${EC2Host}" "bash -s"
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build application on server"
            return $false
        }
        
        # Move the built JAR to the expected location
        ssh -i $KeyFile "${EC2User}@${EC2Host}" @"
cd /opt/$AppName
ls -la target/
# Find the JAR file (exclude original)
JAR_FILE=`$(find target -name "*.jar" | grep -v original | head -1)
if [ -n "`$JAR_FILE" ]; then
    cp "`$JAR_FILE" app.jar
    echo "JAR file created: app.jar"
    ls -la app.jar
else
    echo "No JAR file found in target directory"
    exit 1
fi
"@
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to locate built JAR file"
            return $false
        }
        
        Write-Success "Application built successfully on server"
        return $true
    } catch {
        Write-Error "Failed to build application on server: $_"
        return $false
    }
}

function Copy-ApplicationFiles {
    Write-Log "Copying application files to EC2..."
    
    if ($global:BuildOnServer) {
        # If we built on server, just copy config files
        Write-Log "Application was built on server, copying configuration files only"
    } else {
        # Find and copy JAR file
        $jarFiles = Get-ChildItem -Path "target" -Filter "*.jar" | Where-Object { $_.Name -notmatch "original" }
        $jarFile = $jarFiles[0]
        
        # Copy JAR file
        Write-Log "Copying JAR file: $($jarFile.Name)"
        scp -i $KeyFile $jarFile.FullName "${EC2User}@${EC2Host}:/opt/$AppName/app.jar"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to copy JAR file"
            return $false
        }
    }
    
    try {
        # Copy environment file
        if (Test-Path ".env.prod") {
            Write-Log "Copying production environment file"
            scp -i $KeyFile .env.prod "${EC2User}@${EC2Host}:/opt/$AppName/.env"
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to copy environment file"
                return $false
            }
        }
          # Copy application properties
        if (Test-Path "src/main/resources/application-prod.properties") {
            Write-Log "Copying production application properties"
            scp -i $KeyFile src/main/resources/application-prod.properties "${EC2User}@${EC2Host}:/opt/$AppName/application.properties"
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to copy application properties"
                return $false
            }
        }
        
        Write-Success "Application files copied successfully"
        return $true
    } catch {
        Write-Error "Failed to copy application files: $_"
        return $false
    }
}

function New-SystemdService {
    Write-Log "Creating systemd service..."
    
    $serviceContent = @"
[Unit]
Description=EduGrowHub Application
After=network.target

[Service]
Type=simple
User=$EC2User
Group=$EC2User
WorkingDirectory=/opt/$AppName
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/$AppName/app.jar
EnvironmentFile=/opt/$AppName/.env
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$AppName

# Resource limits
LimitNOFILE=65536
LimitNPROC=32768

[Install]
WantedBy=multi-user.target
"@
    
    try {        # Create service file
        $serviceContent | ssh -i $KeyFile "${EC2User}@${EC2Host}" "sudo tee /etc/systemd/system/$AppName.service > /dev/null"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to create systemd service file"
            return $false
        }
        
        # Enable and start service
        $commands = @"
sudo systemctl daemon-reload
sudo systemctl enable $AppName
sudo systemctl start $AppName
sudo systemctl status $AppName
"@
        
        $commands | ssh -i $KeyFile $EC2User@$EC2Host "bash -s"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Systemd service created and started"
            return $true
        } else {
            Write-Error "Failed to start systemd service"
            return $false
        }
    } catch {
        Write-Error "Failed to create systemd service: $_"
        return $false
    }
}

function Test-ApplicationHealth {
    Write-Log "Testing application health..."
    
    # Wait for application to start
    Write-Log "Waiting for application to start..."
    Start-Sleep -Seconds 30
    
    try {
        $healthCheck = ssh -i $KeyFile $EC2User@$EC2Host "curl -f http://localhost:8080/health || curl -f http://localhost:8080/actuator/health"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Application health check passed"
            return $true
        } else {
            Write-Warning "Health check failed, checking application logs..."
            $logs = ssh -i $KeyFile $EC2User@$EC2Host "sudo journalctl -u $AppName --no-pager -n 20"
            Write-Host $logs
            return $false
        }
    } catch {
        Write-Error "Failed to check application health: $_"
        return $false
    }
}

function Show-ApplicationLogs {
    Write-Log "Showing application logs..."
    
    try {
        ssh -i $KeyFile $EC2User@$EC2Host "sudo journalctl -u $AppName --no-pager -n 50"
    } catch {
        Write-Error "Failed to retrieve logs: $_"
    }
}

function Show-DeploymentSummary {
    Write-Success "Deployment Summary"
    Write-Host "==================" -ForegroundColor $BLUE
    Write-Host "Application: $AppName" -ForegroundColor $BLUE
    Write-Host "EC2 Host: $EC2Host" -ForegroundColor $BLUE
    Write-Host "Application URL: http://$EC2Host:8080" -ForegroundColor $BLUE
    Write-Host ""    Write-Host "Useful Commands:" -ForegroundColor $YELLOW
    Write-Host "- Check status: ssh -i $KeyFile ${EC2User}@${EC2Host} `'sudo systemctl status $AppName`'" -ForegroundColor $YELLOW
    Write-Host "- View logs: ssh -i $KeyFile ${EC2User}@${EC2Host} `'sudo journalctl -u $AppName -f`'" -ForegroundColor $YELLOW
    Write-Host "- Restart app: ssh -i $KeyFile ${EC2User}@${EC2Host} `'sudo systemctl restart $AppName`'" -ForegroundColor $YELLOW
    Write-Host "- Stop app: ssh -i $KeyFile ${EC2User}@${EC2Host} `'sudo systemctl stop $AppName`'" -ForegroundColor $YELLOW
    Write-Host ""
}

# Main execution
function Main {
    Write-Log "Starting EduGrowHub AWS EC2 Deployment"
    Write-Log "======================================"
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisites check failed"
        exit 1
    }
    
    # Test EC2 connection
    if (-not (Test-EC2Connection)) {
        Write-Error "EC2 connection failed"
        exit 1
    }
    
    if (-not $DeployOnly) {
        # Install Java on EC2
        if (-not (Install-JavaOnEC2)) {
            Write-Error "Java installation failed"
            exit 1
        }
    }
      if (-not $SetupOnly) {
        # Build application on server if needed
        if ($global:BuildOnServer) {
            if (-not (Build-ApplicationOnServer)) {
                Write-Error "Server build failed"
                exit 1
            }
        }
        
        # Copy application files
        if (-not (Copy-ApplicationFiles)) {
            Write-Error "File copy failed"
            exit 1
        }
        
        # Create systemd service
        if (-not (New-SystemdService)) {
            Write-Error "Service creation failed"
            exit 1
        }
        
        # Test application health
        if (-not (Test-ApplicationHealth)) {
            Write-Warning "Health check failed, but deployment may still be successful"
            Show-ApplicationLogs
        }
    }
    
    Show-DeploymentSummary
    Write-Success "Deployment completed successfully!"
}

# Run the main function
Main
