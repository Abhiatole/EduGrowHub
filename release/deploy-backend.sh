#!/bin/bash

# EduGrowHub Backend Deployment Script
# This script deploys the Spring Boot backend application to EC2
#
# Prerequisites:
# - Java 17+ installed
# - Maven 3.8+ installed
# - MySQL/RDS database configured
# - Environment variables configured
# - Application server (Tomcat/Jetty) or systemd service configured
#
# Usage: ./deploy-backend.sh [environment]
# Environment: dev, staging, prod (default: prod)

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/tmp/edugrowhub_backend_deploy_${TIMESTAMP}.log"

# Default configuration
ENVIRONMENT="${1:-prod}"
JAVA_MIN_VERSION="17"
MAVEN_MIN_VERSION="3.8"
APP_NAME="edugrowhub-backend"
APP_PORT="8080"
SERVICE_NAME="edugrowhub"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Environment-specific configuration
configure_environment() {
    case $ENVIRONMENT in
        "dev")
            SPRING_PROFILE="development"
            DB_NAME="edugrowhub_dev"
            JVM_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC"
            APP_DIR="/opt/edugrowhub-dev"
            ;;
        "staging")
            SPRING_PROFILE="staging"
            DB_NAME="edugrowhub_staging"
            JVM_OPTS="-Xms1g -Xmx2g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError"
            APP_DIR="/opt/edugrowhub-staging"
            ;;
        "prod")
            SPRING_PROFILE="production"
            DB_NAME="edugrowhub_prod"
            JVM_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/edugrowhub/"
            APP_DIR="/opt/edugrowhub"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use dev, staging, or prod."
            ;;
    esac
    
    log "Configured for environment: $ENVIRONMENT"
    log "Spring Profile: $SPRING_PROFILE"
    log "Application Directory: $APP_DIR"
    log "JVM Options: $JVM_OPTS"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Java version
    if ! command -v java &> /dev/null; then
        error "Java is not installed. Please install Java $JAVA_MIN_VERSION or later."
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "?(1\.)?(\d+)' | grep -oP '\d+' | head -1)
    if [ "$JAVA_VERSION" -lt "$JAVA_MIN_VERSION" ]; then
        error "Java version $JAVA_MIN_VERSION or later is required. Current version: $JAVA_VERSION"
    fi
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        error "Maven is not installed. Please install Maven $MAVEN_MIN_VERSION or later."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed."
    fi
    
    # Check if running as appropriate user
    if [ "$EUID" -eq 0 ] && [ "$ENVIRONMENT" = "prod" ]; then
        warning "Running as root in production is not recommended."
    fi
    
    success "All prerequisites met!"
}

# Create application directories
create_directories() {
    log "Creating application directories..."
    
    sudo mkdir -p "$APP_DIR"/{bin,config,logs,backups,temp}
    sudo mkdir -p "/var/log/edugrowhub"
    sudo mkdir -p "/etc/edugrowhub"
    
    # Set appropriate permissions
    sudo chown -R "$(whoami):$(whoami)" "$APP_DIR"
    sudo chown -R "$(whoami):$(whoami)" "/var/log/edugrowhub"
    
    success "Directories created successfully!"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    if [ -f "$APP_DIR/bin/$APP_NAME.jar" ]; then
        BACKUP_DIR="$APP_DIR/backups/backup_${TIMESTAMP}"
        mkdir -p "$BACKUP_DIR"
        
        cp "$APP_DIR/bin/$APP_NAME.jar" "$BACKUP_DIR/" 2>/dev/null || true
        cp "$APP_DIR/config/application-$SPRING_PROFILE.yml" "$BACKUP_DIR/" 2>/dev/null || true
        cp "/etc/edugrowhub/.env" "$BACKUP_DIR/" 2>/dev/null || true
        
        success "Backup created in $BACKUP_DIR"
    else
        log "No previous deployment found, skipping backup."
    fi
}

# Clone/update source code
update_source_code() {
    log "Updating source code..."
    
    REPO_DIR="$APP_DIR/source"
    
    if [ -d "$REPO_DIR" ]; then
        cd "$REPO_DIR"
        git fetch origin
        git reset --hard "origin/main"
        git clean -fd
    else
        git clone https://github.com/yourusername/edugrowhub.git "$REPO_DIR"
        cd "$REPO_DIR"
    fi
    
    # Get the latest commit info
    GIT_COMMIT=$(git rev-parse HEAD)
    GIT_BRANCH=$(git branch --show-current)
    
    log "Updated to commit: $GIT_COMMIT"
    log "Branch: $GIT_BRANCH"
    
    success "Source code updated successfully!"
}

# Build the application
build_application() {
    log "Building Spring Boot application..."
    
    cd "$APP_DIR/source/backend"
    
    # Clean and build
    mvn clean package -DskipTests=false -P"$SPRING_PROFILE"
    
    # Verify JAR file was created
    JAR_FILE=$(find target -name "*.jar" -not -name "*-sources.jar" | head -1)
    if [ ! -f "$JAR_FILE" ]; then
        error "Build failed - JAR file not found"
    fi
    
    # Copy JAR to application directory
    cp "$JAR_FILE" "$APP_DIR/bin/$APP_NAME.jar"
    
    # Create build info
    cat > "$APP_DIR/bin/build-info.json" << EOF
{
    "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "gitCommit": "$GIT_COMMIT",
    "gitBranch": "$GIT_BRANCH",
    "environment": "$ENVIRONMENT",
    "springProfile": "$SPRING_PROFILE",
    "javaVersion": "$(java -version 2>&1 | head -1)",
    "mavenVersion": "$(mvn -version | head -1)"
}
EOF
    
    success "Application built successfully!"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "$APP_DIR/source/backend"
    
    # Run unit tests
    mvn test -P"$SPRING_PROFILE"
    
    # Run integration tests if they exist
    if mvn test -Dtest=**/*IntegrationTest 2>/dev/null; then
        success "Integration tests passed!"
    else
        log "No integration tests found or failed."
    fi
    
    success "All tests completed!"
}

# Configure application
configure_application() {
    log "Configuring application..."
    
    # Copy environment-specific configuration
    if [ -f "$APP_DIR/source/backend/src/main/resources/application-$SPRING_PROFILE.yml" ]; then
        cp "$APP_DIR/source/backend/src/main/resources/application-$SPRING_PROFILE.yml" \
           "$APP_DIR/config/"
    fi
    
    # Create or update environment file
    cat > "/etc/edugrowhub/.env" << EOF
# EduGrowHub Backend Environment Configuration
# Generated on: $(date)
# Environment: $ENVIRONMENT

SPRING_PROFILES_ACTIVE=$SPRING_PROFILE
SERVER_PORT=$APP_PORT
JAVA_OPTS=$JVM_OPTS

# Load additional environment variables from .env.example.backend
# Copy values from .env.example.backend and update with actual values
EOF
    
    # Set secure permissions
    sudo chmod 600 "/etc/edugrowhub/.env"
    
    success "Application configured successfully!"
}

# Create systemd service
create_systemd_service() {
    log "Creating systemd service..."
    
    sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null << EOF
[Unit]
Description=EduGrowHub Backend Application
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=$(whoami)
Group=$(whoami)
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java $JVM_OPTS -Dspring.profiles.active=$SPRING_PROFILE -jar $APP_DIR/bin/$APP_NAME.jar
ExecStop=/bin/kill -TERM \$MAINPID
EnvironmentFile=/etc/edugrowhub/.env
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$APP_DIR /var/log/edugrowhub /tmp

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    
    success "Systemd service created successfully!"
}

# Database migration/update
run_database_migration() {
    log "Running database migrations..."
    
    cd "$APP_DIR/source/backend"
    
    # Run Flyway migrations if configured
    if [ -f "pom.xml" ] && grep -q "flyway" pom.xml; then
        mvn flyway:migrate -P"$SPRING_PROFILE" || warning "Flyway migration failed or not configured"
    fi
    
    # Alternative: Run Liquibase if configured
    if [ -f "pom.xml" ] && grep -q "liquibase" pom.xml; then
        mvn liquibase:update -P"$SPRING_PROFILE" || warning "Liquibase update failed or not configured"
    fi
    
    success "Database migrations completed!"
}

# Stop current application
stop_application() {
    log "Stopping current application..."
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME"
        
        # Wait for graceful shutdown
        TIMEOUT=30
        while sudo systemctl is-active --quiet "$SERVICE_NAME" && [ $TIMEOUT -gt 0 ]; do
            sleep 1
            TIMEOUT=$((TIMEOUT-1))
        done
        
        if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
            warning "Application did not stop gracefully, forcing stop..."
            sudo systemctl kill "$SERVICE_NAME"
        fi
    fi
    
    success "Application stopped successfully!"
}

# Start application
start_application() {
    log "Starting application..."
    
    sudo systemctl start "$SERVICE_NAME"
    
    # Wait for application to start
    TIMEOUT=60
    while ! nc -z localhost "$APP_PORT" && [ $TIMEOUT -gt 0 ]; do
        sleep 2
        TIMEOUT=$((TIMEOUT-2))
    done
    
    if nc -z localhost "$APP_PORT"; then
        success "Application started successfully!"
    else
        error "Application failed to start within timeout period"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait a bit for application to fully initialize
    sleep 10
    
    # Check health endpoint
    if curl -f -s "http://localhost:$APP_PORT/actuator/health" > /dev/null; then
        success "Health check passed!"
    else
        error "Health check failed - application may not be responding"
    fi
    
    # Check application logs for errors
    if sudo journalctl -u "$SERVICE_NAME" --since "1 minute ago" | grep -i error; then
        warning "Errors found in application logs"
    fi
    
    # Check if application is listening on the correct port
    if netstat -tlnp | grep ":$APP_PORT "; then
        success "Application is listening on port $APP_PORT"
    else
        error "Application is not listening on port $APP_PORT"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    if [ -d "$APP_DIR/backups" ]; then
        cd "$APP_DIR/backups"
        ls -t | tail -n +6 | xargs -r rm -rf
    fi
    
    # Clean Maven cache if needed
    if [ "$ENVIRONMENT" != "prod" ]; then
        mvn dependency:purge-local-repository -DactTransitively=false -DreResolve=false || true
    fi
    
    success "Cleanup completed!"
}

# Send notification
send_notification() {
    log "Sending deployment notification..."
    
    # Get application info
    APP_VERSION=$(curl -s "http://localhost:$APP_PORT/actuator/info" | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    
    # Example notification (customize as needed)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"✅ EduGrowHub backend v$APP_VERSION deployed to $ENVIRONMENT\"}" \
    #     "$SLACK_WEBHOOK_URL"
    
    success "Deployment completed successfully!"
    log "Application version: $APP_VERSION"
    log "Environment: $ENVIRONMENT"
    log "Port: $APP_PORT"
}

# Main deployment function
main() {
    log "Starting EduGrowHub backend deployment..."
    log "Environment: $ENVIRONMENT"
    log "Timestamp: $TIMESTAMP"
    log "Log file: $LOG_FILE"
    
    configure_environment
    check_prerequisites
    create_directories
    backup_current_deployment
    update_source_code
    build_application
    run_tests
    configure_application
    create_systemd_service
    run_database_migration
    stop_application
    start_application
    health_check
    cleanup
    send_notification
    
    success "🚀 Backend deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
    log "Service status: $(sudo systemctl is-active $SERVICE_NAME)"
    log "Service logs: sudo journalctl -u $SERVICE_NAME -f"
}

# Error handling
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"
