#!/usr/bin/env pwsh
# EduGrowHub Build and Package Script for Deployment
# This script creates a deployable package

param(
    [string]$JavaHome = $env:JAVA_HOME,
    [switch]$SkipTests = $true,
    [switch]$Clean = $true,
    [switch]$Verbose = $false
)

Write-Host "=== EduGrowHub Build and Package Script ===" -ForegroundColor Green

# Check if running in correct directory
if (-not (Test-Path "pom.xml")) {
    Write-Error "Error: pom.xml not found. Please run this script from the project root directory."
    exit 1
}

# Try to find Java
$javaExe = $null
if ($JavaHome -and (Test-Path "$JavaHome\bin\java.exe")) {
    $javaExe = "$JavaHome\bin\java.exe"
    Write-Host "Using Java from JAVA_HOME: $javaExe" -ForegroundColor Blue
} elseif (Get-Command java -ErrorAction SilentlyContinue) {
    $javaExe = (Get-Command java).Source
    Write-Host "Using Java from PATH: $javaExe" -ForegroundColor Blue
} else {
    Write-Error "Java not found. Please install Java or set JAVA_HOME environment variable."
    exit 1
}

# Check Java version
try {
    $javaVersion = & $javaExe -version 2>&1
    Write-Host "Java version: $($javaVersion[0])" -ForegroundColor Blue
} catch {
    Write-Error "Error checking Java version: $_"
    exit 1
}

# Try to find Maven
$mvnExe = $null
$mavenFound = $false

# Check common Maven installation locations
$mavenPaths = @(
    "C:\Program Files\Apache\maven\apache-maven-3.9.10\bin\mvn.cmd",
    "C:\Program Files\Maven\apache-maven-3.9.10\bin\mvn.cmd",
    "C:\maven\apache-maven-3.9.10\bin\mvn.cmd",
    "C:\apache-maven-3.9.10\bin\mvn.cmd"
)

foreach ($path in $mavenPaths) {
    if (Test-Path $path) {
        $mvnExe = $path
        $mavenFound = $true
        Write-Host "Found Maven at: $mvnExe" -ForegroundColor Blue
        break
    }
}

# If not found in common locations, try PATH
if (-not $mavenFound) {
    try {
        $pathMvn = Get-Command mvn -ErrorAction SilentlyContinue
        if ($pathMvn -and $pathMvn.Source -notlike "*Python*") {
            $mvnExe = $pathMvn.Source
            $mavenFound = $true
            Write-Host "Found Maven in PATH: $mvnExe" -ForegroundColor Blue
        }
    } catch {
        # Maven not in PATH or is the Python version
    }
}

if (-not $mavenFound) {
    Write-Host "Maven not found locally. Creating deployment package for remote build..." -ForegroundColor Yellow
    
    # Create deployment package directory
    $packageDir = "deployment-package"
    if (Test-Path $packageDir) {
        Remove-Item $packageDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $packageDir | Out-Null
    
    # Copy source files
    Write-Host "Copying source files..." -ForegroundColor Blue
    Copy-Item "src" "$packageDir\src" -Recurse
    Copy-Item "pom.xml" "$packageDir\"
    
    # Copy environment files
    if (Test-Path ".env") { Copy-Item ".env" "$packageDir\" }
    if (Test-Path ".env.prod") { Copy-Item ".env.prod" "$packageDir\" }
    if (Test-Path ".env.local") { Copy-Item ".env.local" "$packageDir\" }
    
    # Copy configuration files
    if (Test-Path "application.properties") { Copy-Item "application.properties" "$packageDir\" }
    if (Test-Path "application.yml") { Copy-Item "application.yml" "$packageDir\" }
    if (Test-Path "src\main\resources") { 
        if (-not (Test-Path "$packageDir\src\main\resources")) {
            New-Item -ItemType Directory -Path "$packageDir\src\main\resources" -Force | Out-Null
        }
        Get-ChildItem "src\main\resources" | Copy-Item -Destination "$packageDir\src\main\resources" -Recurse -Force
    }
    
    # Create build script for remote execution
    $remoteBuildScript = @"
#!/bin/bash
# Remote build script for EduGrowHub
set -e

echo "=== Building EduGrowHub on Remote Server ==="

# Check Java
java -version

# Check Maven
mvn -version

# Clean and build
echo "Building application..."
mvn clean package -DskipTests

echo "Build completed successfully!"
echo "JAR file location: target/edugrowhub-0.0.1-SNAPSHOT.jar"
"@
    
    Set-Content -Path "$packageDir\build.sh" -Value $remoteBuildScript
    
    # Create PowerShell build script for Windows servers
    $remoteBuildScriptPS = @"
# Remote build script for EduGrowHub (PowerShell)
Write-Host "=== Building EduGrowHub on Remote Server ===" -ForegroundColor Green

# Check Java
java -version

# Check Maven  
mvn.cmd -version

# Clean and build
Write-Host "Building application..." -ForegroundColor Blue
& mvn.cmd clean package -DskipTests

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "JAR file location: target/edugrowhub-0.0.1-SNAPSHOT.jar" -ForegroundColor Blue
"@
    
    Set-Content -Path "$packageDir\build.ps1" -Value $remoteBuildScriptPS
    
    # Create archive
    Write-Host "Creating deployment archive..." -ForegroundColor Blue
    $archiveName = "edugrowhub-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
    
    if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
        Compress-Archive -Path "$packageDir\*" -DestinationPath $archiveName -Force
    } else {
        Write-Host "Compress-Archive not available. Package created in directory: $packageDir" -ForegroundColor Yellow
    }
    
    Write-Host "Deployment package created: $archiveName" -ForegroundColor Green
    Write-Host "Upload this package to your server and run build.sh (Linux) or build.ps1 (Windows)" -ForegroundColor Yellow
    
    return
}

# Maven found - proceed with local build
Write-Host "Building with Maven..." -ForegroundColor Blue

try {
    # Set environment
    $env:JAVA_HOME = (Split-Path (Split-Path $javaExe))
    
    $buildArgs = @()
    if ($Clean) { $buildArgs += "clean" }
    $buildArgs += "package"
    if ($SkipTests) { $buildArgs += "-DskipTests" }
    if (-not $Verbose) { $buildArgs += "-q" }
    
    Write-Host "Running: $mvnExe $($buildArgs -join ' ')" -ForegroundColor Blue
    
    & $mvnExe @buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
        
        # Check if JAR was created
        $jarFile = "target\edugrowhub-0.0.1-SNAPSHOT.jar"
        if (Test-Path $jarFile) {
            $jarSize = (Get-Item $jarFile).Length / 1MB
            Write-Host "JAR file created: $jarFile ($([math]::Round($jarSize, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Warning "JAR file not found at expected location: $jarFile"
        }
    } else {
        Write-Error "Build failed with exit code: $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    
} catch {
    Write-Error "Build error: $_"
    exit 1
}

Write-Host "=== Build completed successfully! ===" -ForegroundColor Green
