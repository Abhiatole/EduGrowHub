#!/bin/bash

# EduGrowHub Local Testing Script
# This script helps you test the application locally before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if MySQL is running
check_mysql() {
    log "Checking MySQL connection..."
    if mysql -h localhost -u root -p -e "SELECT 1;" > /dev/null 2>&1; then
        success "MySQL is running and accessible"
    else
        error "MySQL is not running or not accessible"
        echo "Please start MySQL and ensure you can connect with root user"
        exit 1
    fi
}

# Function to create local database
setup_database() {
    log "Setting up local database..."
    
    mysql -h localhost -u root -p << EOF
CREATE DATABASE IF NOT EXISTS edugrowhub_local;
CREATE USER IF NOT EXISTS 'edugrowhub'@'localhost' IDENTIFIED BY 'local_password_123';
GRANT ALL PRIVILEGES ON edugrowhub_local.* TO 'edugrowhub'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    success "Database setup completed"
}

# Function to load environment variables
load_env() {
    log "Loading environment variables..."
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        success "Environment variables loaded"
    else
        error ".env.local file not found"
        exit 1
    fi
}

# Function to build application
build_app() {
    log "Building application..."
    mvn clean compile
    success "Application built successfully"
}

# Function to run tests
run_tests() {
    log "Running tests..."
    mvn test
    success "Tests completed"
}

# Function to start application
start_app() {
    log "Starting application with local profile..."
    mvn spring-boot:run -Dspring-boot.run.profiles=local &
    APP_PID=$!
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 30
    
    # Check if application is running
    if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
        success "Application started successfully!"
        echo "Application is running at: http://localhost:8080"
        echo "Health check: http://localhost:8080/actuator/health"
        echo "Process ID: $APP_PID"
    else
        error "Application failed to start"
        exit 1
    fi
}

# Function to test endpoints
test_endpoints() {
    log "Testing application endpoints..."
    
    # Test health endpoint
    if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
        success "Health endpoint working"
    else
        error "Health endpoint not working"
    fi
    
    # Test info endpoint
    if curl -f -s http://localhost:8080/actuator/info > /dev/null; then
        success "Info endpoint working"
    else
        warning "Info endpoint not working (this is normal)"
    fi
    
    success "Endpoint testing completed"
}

# Function to show useful commands
show_commands() {
    echo
    echo "🔧 Useful testing commands:"
    echo "=========================="
    echo "Health Check:"
    echo "  curl http://localhost:8080/actuator/health"
    echo
    echo "Teacher Login (create a teacher first):"
    echo "  curl -X POST http://localhost:8080/api/teacher/login \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"email\": \"teacher@test.com\", \"password\": \"password123\"}'"
    echo
    echo "View application logs:"
    echo "  tail -f logs/spring.log"
    echo
    echo "Stop application:"
    echo "  kill $APP_PID"
    echo
    echo "Build JAR for deployment:"
    echo "  mvn clean package -DskipTests"
    echo
}

# Main execution
main() {
    log "Starting EduGrowHub local testing setup..."
    
    check_mysql
    setup_database
    load_env
    build_app
    run_tests
    start_app
    test_endpoints
    show_commands
    
    success "🎉 Local testing setup completed!"
    echo "Application is running. Press Ctrl+C to stop."
    
    # Keep script running
    wait $APP_PID
}

# Run main function
main "$@"
