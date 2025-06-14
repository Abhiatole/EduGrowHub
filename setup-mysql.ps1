# MySQL Local Setup Script for EduGrowHub
# This script tests MySQL connection and creates the database

Write-Host "Testing MySQL Connection..." -ForegroundColor Blue

# Test MySQL connection
try {
    # Try to find MySQL executable
    $mysqlPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe",
        "mysql"
    )
    
    $mysqlPath = $null
    foreach ($path in $mysqlPaths) {
        if (Test-Path $path -ErrorAction SilentlyContinue) {
            $mysqlPath = $path
            break
        }
        if ($path -eq "mysql") {
            try {
                & $path --version 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    $mysqlPath = $path
                    break
                }
            } catch {}
        }
    }
    
    if (-not $mysqlPath) {
        Write-Host "MySQL executable not found. Please add MySQL to your PATH or verify installation." -ForegroundColor Red
        Write-Host "Expected locations:" -ForegroundColor Yellow
        $mysqlPaths | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        exit 1
    }
    
    Write-Host "Found MySQL at: $mysqlPath" -ForegroundColor Green
    
    # Test connection
    Write-Host "Testing MySQL connection..." -ForegroundColor Blue
    $testResult = & $mysqlPath -u root -p"EdUgr0wHub!2025" -e "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL connection successful!" -ForegroundColor Green
    } else {
        Write-Host "MySQL connection failed:" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        exit 1
    }
    
    # Create database
    Write-Host "Creating database 'edugrowhub_db'..." -ForegroundColor Blue
    $createDb = & $mysqlPath -u root -p"EdUgr0wHub!2025" -e "CREATE DATABASE IF NOT EXISTS edugrowhub_db;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Database creation failed:" -ForegroundColor Red
        Write-Host $createDb -ForegroundColor Red
        exit 1
    }
    
    # Show databases
    Write-Host "Available databases:" -ForegroundColor Blue
    & $mysqlPath -u root -p"EdUgr0wHub!2025" -e "SHOW DATABASES;"
    
    Write-Host ""
    Write-Host "✅ MySQL setup completed successfully!" -ForegroundColor Green
    Write-Host "Database: edugrowhub_db" -ForegroundColor Green
    Write-Host "Username: root" -ForegroundColor Green
    Write-Host "Password: EdUgr0wHub!2025" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: .\test-local.ps1" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error during MySQL setup: $_" -ForegroundColor Red
    exit 1
}
