# EduGrowHub Local Testing Script for Windows PowerShell
# This script helps you test the application locally before deployment

param(
    [switch]$SkipDatabase,
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [SecureString]$MySQLPassword = $null
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

# Function to check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check Java
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        if ($javaVersion -match '"(\d+)\.') {
            $majorVersion = [int]$matches[1]
            if ($majorVersion -ge 11) {
                Write-Success "Java $majorVersion detected"
            } else {
                Write-Error "Java 11 or higher required. Current version: $majorVersion"
                return $false
            }
        }
    } catch {
        Write-Error "Java not found. Please install Java 11 or higher"
        return $false
    }
      # Check Maven
    try {
        # Try to find Maven executable
        $mavenPaths = @(
            "C:\apache-maven-3.9.10\bin\mvn.cmd",
            "C:\apache-maven-3.9.8\bin\mvn.cmd",
            "C:\Program Files\Apache\Maven\bin\mvn.cmd",
            "mvn"
        )
        
        $mavenFound = $false
        foreach ($path in $mavenPaths) {
            if (Test-Path $path -ErrorAction SilentlyContinue) {
                $script:mavenPath = $path
                $mavenFound = $true
                break
            }
            if ($path -eq "mvn") {
                try {
                    & $path --version 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        $script:mavenPath = $path
                        $mavenFound = $true
                        break
                    }
                } catch {}
            }
        }
        
        if ($mavenFound) {
            $mvnVersion = & $script:mavenPath --version 2>&1 | Select-String "Apache Maven"
            Write-Success "Maven detected: $($mvnVersion.Line)"
        } else {
            Write-Error "Maven not found. Please install Apache Maven"
            return $false
        }
    } catch {
        Write-Error "Maven not found. Please install Apache Maven"
        return $false
    }
      # Check MySQL
    if (-not $SkipDatabase) {
        try {
            # Try to find MySQL executable
            $mysqlPaths = @(
                "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
                "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
                "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe",
                "mysql"
            )
            
            $mysqlFound = $false
            foreach ($path in $mysqlPaths) {
                if (Test-Path $path -ErrorAction SilentlyContinue) {
                    $script:mysqlPath = $path
                    $mysqlFound = $true
                    break
                }
                if ($path -eq "mysql") {
                    try {
                        & $path --version 2>&1 | Out-Null
                        if ($LASTEXITCODE -eq 0) {
                            $script:mysqlPath = $path
                            $mysqlFound = $true
                            break
                        }
                    } catch {}
                }
            }
            
            if ($mysqlFound) {
                $mysqlVersion = & $script:mysqlPath --version 2>&1
                Write-Success "MySQL detected: $mysqlVersion"
            } else {
                Write-Error "MySQL not found. Please install MySQL or use -SkipDatabase flag"
                return $false
            }
        } catch {
            Write-Error "MySQL not found. Please install MySQL or use -SkipDatabase flag"
            return $false
        }
    }
    
    return $true
}

# Function to check MySQL connection
function Test-MySQLConnection {
    if ($SkipDatabase) {
        Write-Warning "Skipping database checks"
        return $true
    }
      Write-Log "Testing MySQL connection..."
    
    # Use the known password for local MySQL
    $dbPassword = "EdUgr0wHub!2025"
    
    try {
        $testQuery = "SELECT 1"
        $result = & $script:mysqlPath -u root -p$dbPassword -e $testQuery 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "MySQL connection successful"
            return $true
        } else {
            Write-Error "MySQL connection failed: $result"
            return $false
        }
    } catch {
        Write-Error "Failed to connect to MySQL: $_"
        return $false
    }
}

# Function to setup local database
function Initialize-LocalDatabase {
    if ($SkipDatabase) {
        Write-Warning "Skipping database setup"
        return $true
    }
      Write-Log "Setting up local database..."
    
    # Use the password for database setup
    $dbPassword = "EdUgr0wHub!2025"
    
    $dbCommands = @"
CREATE DATABASE IF NOT EXISTS edugrowhub_db;
FLUSH PRIVILEGES;
"@
    
    try {
        $dbCommands | & $script:mysqlPath -u root -p$dbPassword
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database setup completed"
            return $true
        } else {
            Write-Error "Database setup failed"
            return $false
        }
    } catch {
        Write-Error "Failed to setup database: $_"
        return $false
    }
}

# Function to verify environment configuration
function Test-EnvironmentConfig {
    Write-Log "Verifying environment configuration..."
    
    $envFile = ".env.local"
    if (-not (Test-Path $envFile)) {
        Write-Error "Environment file $envFile not found"
        return $false
    }
    
    $requiredVars = @(
        "DB_URL",
        "DB_USERNAME", 
        "DB_PASSWORD",
        "JWT_SECRET",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN"
    )
    
    $envContent = Get-Content $envFile
    $foundVars = @()
    
    foreach ($line in $envContent) {
        if ($line -match "^([^=]+)=(.*)$") {
            $foundVars += $matches[1]
        }
    }
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($var -notin $foundVars) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Error "Missing environment variables: $($missingVars -join ', ')"
        return $false
    }
    
    Write-Success "All required environment variables found"
    return $true
}

# Function to build the application
function Invoke-ApplicationBuild {
    if ($SkipBuild) {
        Write-Warning "Skipping build"
        return $true
    }
    
    Write-Log "Building application..."
    
    try {        # Clean and compile
        Write-Log "Cleaning project..."
        & $script:mavenPath clean
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Maven clean failed"
            return $false
        }
        
        # Run tests if not skipped
        if (-not $SkipTests) {
            Write-Log "Running tests..."
            & $script:mavenPath test
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Some tests failed, but continuing..."
            } else {
                Write-Success "All tests passed"
            }
        }
        
        # Package
        Write-Log "Packaging application..."
        & $script:mavenPath package -DskipTests
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Maven package failed"
            return $false
        }
        
        Write-Success "Application built successfully"
        return $true
    } catch {
        Write-Error "Build failed: $_"
        return $false
    }
}

# Function to start the application
function Start-Application {
    Write-Log "Starting application with local profile..."
      # Set environment variables from .env.local
    if (Test-Path ".env.local") {
        Get-Content ".env.local" | ForEach-Object {
            if ($_ -match "^([^=]+)=(.*)$") {
                Set-Item -Path "env:$($matches[1])" -Value $matches[2]
            }
        }
    }
    
    # Find the JAR file
    $jarFiles = Get-ChildItem -Path "target" -Filter "*.jar" | Where-Object { $_.Name -notmatch "original" }
    if ($jarFiles.Count -eq 0) {
        Write-Error "No JAR file found in target directory"
        return $false
    }
    
    $jarFile = $jarFiles[0].FullName
    Write-Log "Starting JAR: $jarFile"
    
    # Start the application
    try {
        Write-Log "Application starting on http://localhost:8080"
        Write-Log "Press Ctrl+C to stop the application"
        java -jar $jarFile --spring.profiles.active=local
    } catch {
        Write-Error "Failed to start application: $_"
        return $false
    }
}

# Function to test API endpoints
function Test-APIEndpoints {
    Write-Log "Testing API endpoints..."
    
    # Wait for application to start
    Write-Log "Waiting for application to start..."
    Start-Sleep -Seconds 10
    
    $baseUrl = "http://localhost:8080"
    $endpoints = @(
        @{ Method = "GET"; Url = "$baseUrl/health"; Description = "Health check" },
        @{ Method = "GET"; Url = "$baseUrl/api/courses"; Description = "Get courses" },
        @{ Method = "GET"; Url = "$baseUrl/api/users"; Description = "Get users" }
    )
      foreach ($endpoint in $endpoints) {
        try {
            Write-Log "Testing $($endpoint.Description): $($endpoint.Method) $($endpoint.Url)"
            $null = Invoke-RestMethod -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 30
            Write-Success "$($endpoint.Description) - OK"
        } catch {
            Write-Warning "$($endpoint.Description) - Failed: $_"
        }
    }
}

# Main execution
function Main {
    Write-Log "Starting EduGrowHub Local Testing"
    Write-Log "=================================="
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisites check failed"
        exit 1
    }
    
    # Test MySQL connection
    if (-not (Test-MySQLConnection)) {
        Write-Error "MySQL connection failed"
        exit 1
    }
      # Setup database
    if (-not (Initialize-LocalDatabase)) {
        Write-Error "Database setup failed"
        exit 1
    }
    
    # Verify environment configuration
    if (-not (Test-EnvironmentConfig)) {
        Write-Error "Environment configuration check failed"
        exit 1
    }
    
    # Build application
    if (-not (Invoke-ApplicationBuild)) {
        Write-Error "Build failed"
        exit 1
    }
    
    Write-Success "Local testing setup completed successfully!"
    Write-Log ""
    Write-Log "Next steps:"
    Write-Log "1. Run './test-local.ps1' to start the application"
    Write-Log "2. Open http://localhost:8080 in your browser"
    Write-Log "3. Test the API endpoints using Postman or curl"
    Write-Log "4. Check the logs for any errors"
    Write-Log ""
    
    # Offer to start the application
    $start = Read-Host "Do you want to start the application now? (y/N)"
    if ($start -eq "y" -or $start -eq "Y") {
        Start-Application
    }
}

# Run the main function
Main
