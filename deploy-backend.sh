#!/bin/bash

# EduGrowHub Backend Deployment Script for AWS EC2
# This script automates the deployment of the Spring Boot backend to an AWS EC2 instance
# 
# Prerequisites:
# - Ubuntu 22.04 EC2 instance
# - Java 17 installed
# - MySQL client installed
# - NGINX installed and configured
# - Git installed

set -e  # Exit on any error

# Configuration variables
APP_NAME="edugrowhub"
APP_USER="edugrowhub"
APP_DIR="/opt/edugrowhub"
JAR_NAME="edugrowhub-0.0.1-SNAPSHOT.jar"
SERVICE_NAME="edugrowhub"
NGINX_CONFIG="/etc/nginx/sites-available/edugrowhub"
LOG_DIR="/var/log/edugrowhub"

echo "🚀 Starting EduGrowHub Backend Deployment..."

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    echo "📝 Creating application user: $APP_USER"
    sudo useradd -r -s /bin/false $APP_USER
fi

# Create application directory
echo "📁 Setting up application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo mkdir -p $LOG_DIR
sudo chown $APP_USER:$APP_USER $APP_DIR
sudo chown $APP_USER:$APP_USER $LOG_DIR

# Stop existing service if running
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "⏹️  Stopping existing service..."
    sudo systemctl stop $SERVICE_NAME
fi

# Build the application (assuming we're in the project directory)
if [ -f "pom.xml" ]; then
    echo "🔨 Building Spring Boot application..."
    ./mvnw clean package -DskipTests -Pprod
    
    # Copy JAR file to application directory
    sudo cp target/$JAR_NAME $APP_DIR/
    sudo chown $APP_USER:$APP_USER $APP_DIR/$JAR_NAME
else
    echo "❌ Error: pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

# Copy environment file
if [ -f ".env.prod" ]; then
    echo "📋 Copying production environment file..."
    sudo cp .env.prod $APP_DIR/.env
    sudo chown $APP_USER:$APP_USER $APP_DIR/.env
    sudo chmod 600 $APP_DIR/.env
else
    echo "⚠️  Warning: .env.prod not found. Please ensure environment variables are configured."
fi

# Create systemd service file
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=EduGrowHub Spring Boot Application
After=network.target mysql.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java -jar $APP_DIR/$JAR_NAME --spring.profiles.active=production
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Environment variables (can also be loaded from .env file)
Environment=SPRING_PROFILES_ACTIVE=production
EnvironmentFile=-$APP_DIR/.env

# JVM options for production
Environment=JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🔄 Reloading systemd and enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

# Create NGINX configuration
echo "🌐 Configuring NGINX reverse proxy..."
sudo tee $NGINX_CONFIG > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.edugrowhub.com;  # Replace with your actual domain
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.edugrowhub.com;  # Replace with your actual domain
    
    # SSL Configuration (replace with your actual certificate paths)
    ssl_certificate /etc/ssl/certs/edugrowhub.crt;
    ssl_certificate_key /etc/ssl/private/edugrowhub.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy configuration
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /actuator/health {
        proxy_pass http://localhost:8080/actuator/health;
        access_log off;
    }
    
    # Static files (if served by backend)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable NGINX site
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
echo "🧪 Testing NGINX configuration..."
if sudo nginx -t; then
    echo "✅ NGINX configuration is valid"
else
    echo "❌ NGINX configuration error"
    exit 1
fi

# Setup log rotation
echo "📜 Setting up log rotation..."
sudo tee /etc/logrotate.d/edugrowhub > /dev/null <<EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $APP_USER $APP_USER
    postrotate
        systemctl reload $SERVICE_NAME > /dev/null 2>&1 || true
    endscript
}
EOF

# Start services
echo "🚀 Starting services..."
sudo systemctl start $SERVICE_NAME
sudo systemctl reload nginx

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 30

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ EduGrowHub backend service is running"
    
    # Test health endpoint
    if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Health check failed - check logs"
    fi
else
    echo "❌ Service failed to start - check logs"
    sudo journalctl -u $SERVICE_NAME --no-pager -l
    exit 1
fi

echo ""
echo "🎉 EduGrowHub Backend Deployment Complete!"
echo ""
echo "📊 Service Status:"
echo "   Application: $(systemctl is-active $SERVICE_NAME)"
echo "   NGINX: $(systemctl is-active nginx)"
echo ""
echo "📋 Useful Commands:"
echo "   Check logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   Restart service: sudo systemctl restart $SERVICE_NAME"
echo "   Check health: curl http://localhost:8080/actuator/health"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Configure SSL certificates for NGINX"
echo "   2. Update DNS records to point to this server"
echo "   3. Configure firewall rules (ports 80, 443)"
echo "   4. Set up monitoring and backup procedures"
echo ""
