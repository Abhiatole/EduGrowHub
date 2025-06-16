# 🚀 EduGrowHub Deployment Guide - Local Testing to AWS EC2

## 📋 Complete Deployment Checklist

### Phase 1: Local Testing ✅

#### **Step 1.1: Local Database Setup**
- [ ] Install MySQL locally
- [ ] Create database and user
- [ ] Test connection
- [ ] Load sample data

#### **Step 1.2: Application Configuration**
- [ ] Configure `application-local.properties`
- [ ] Set up local `.env` file
- [ ] Verify all environment variables

#### **Step 1.3: Local Testing**
- [ ] Build and run Spring Boot app
- [ ] Test all endpoints with Postman
- [ ] Verify database operations
- [ ] Check logs for errors

### Phase 2: AWS Preparation 🔧

#### **Step 2.1: AWS RDS Setup**
- [ ] Create RDS MySQL instance
- [ ] Configure security groups
- [ ] Create database and user
- [ ] Test connection from local machine

#### **Step 2.2: EC2 Instance Setup**
- [ ] Launch EC2 instance (Amazon Linux 2)
- [ ] Configure security groups
- [ ] Create and download key pair
- [ ] Allocate Elastic IP (optional)

#### **Step 2.3: Production Configuration**
- [ ] Configure `application-prod.properties`
- [ ] Set up production `.env` file
- [ ] Package application as JAR

### Phase 3: Deployment 🚀

#### **Step 3.1: Deploy to EC2**
- [ ] Install Java on EC2
- [ ] Copy JAR file to EC2
- [ ] Copy configuration files
- [ ] Test manual startup

#### **Step 3.2: Production Setup**
- [ ] Create systemd service
- [ ] Configure auto-startup
- [ ] Set up logging
- [ ] Configure reverse proxy (optional)

#### **Step 3.3: Verification**
- [ ] Test endpoints from internet
- [ ] Verify database connectivity
- [ ] Check application logs
- [ ] Performance testing

---

## 🛠️ Implementation Guide

### **Phase 1: Local Testing**

#### **1.1 Local MySQL Setup**

```bash
# Install MySQL (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server

# Install MySQL (macOS)
brew install mysql
brew services start mysql

# Install MySQL (Windows)
# Download MySQL Installer from https://dev.mysql.com/downloads/installer/

# Connect to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE edugrowhub_local;
CREATE USER 'edugrowhub'@'localhost' IDENTIFIED BY 'local_password_123';
GRANT ALL PRIVILEGES ON edugrowhub_local.* TO 'edugrowhub'@'localhost';
FLUSH PRIVILEGES;
```

#### **1.2 Local Application Properties**

Create `src/main/resources/application-local.properties`:
```properties
# Local Development Configuration
spring.profiles.active=local

# Database Configuration (Local MySQL)
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/edugrowhub_local}
spring.datasource.username=${DB_USERNAME:edugrowhub}
spring.datasource.password=${DB_PASSWORD:local_password_123}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=${DDL_AUTO:update}
spring.jpa.show-sql=${SHOW_SQL:true}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=${SERVER_PORT:8080}

# Logging Configuration
logging.level.com.edugrowhub=${LOG_LEVEL:DEBUG}
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG

# JWT Configuration
jwt.secret=${JWT_SECRET:61772be6d3b74f126fe124dd7723269c456366fcc40d9aaa97cf4d302676ae51}
jwt.expiration=${JWT_EXPIRATION:3600000}

# Twilio Configuration (Local Testing)
twilio.account.sid=${TWILIO_ACCOUNT_SID:ACa3028dbecc531e6fcc97403dc22ac58b}
twilio.auth.token=${TWILIO_AUTH_TOKEN:7744be517b09482dddeed886d97e5bfd}
twilio.whatsapp.from=${TWILIO_WHATSAPP_FROM:+14155238886}

# CORS Configuration
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001}

# Development Features
spring.devtools.restart.enabled=true
spring.devtools.livereload.enabled=true
```

#### **1.3 Local Environment File**

Create `.env.local`:
```bash
# Local Development Environment
DB_URL=jdbc:mysql://localhost:3306/edugrowhub_local
DB_USERNAME=edugrowhub
DB_PASSWORD=local_password_123

JWT_SECRET=61772be6d3b74f126fe124dd7723269c456366fcc40d9aaa97cf4d302676ae51
JWT_EXPIRATION=3600000

SERVER_PORT=8080
LOG_LEVEL=DEBUG
SHOW_SQL=true
DDL_AUTO=update

TWILIO_ACCOUNT_SID=ACa3028dbecc531e6fcc97403dc22ac58b
TWILIO_AUTH_TOKEN=7744be517b09482dddeed886d97e5bfd
TWILIO_WHATSAPP_FROM=+14155238886

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### **1.4 Local Testing Commands**

```bash
# Load environment variables
export $(cat .env.local | xargs)

# Build the application
mvn clean compile

# Run tests
mvn test

# Start the application with local profile
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Alternative: Run with explicit environment file
mvn spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.args="--spring.config.additional-location=file:.env.local"

# Package for deployment
mvn clean package -DskipTests
```

#### **1.5 Postman Testing Collection**

Create `postman-tests.json`:
```json
{
  "info": {
    "name": "EduGrowHub API Tests",
    "description": "Local and Production API Testing"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080/api"
    },
    {
      "key": "auth_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/actuator/health",
          "host": ["{{base_url}}"],
          "path": ["actuator", "health"]
        }
      }
    },
    {
      "name": "Teacher Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"teacher@edugrowhub.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/teacher/login",
          "host": ["{{base_url}}"],
          "path": ["teacher", "login"]
        }
      }
    },
    {
      "name": "Student Registration",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{auth_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test Student\",\n  \"email\": \"student@test.com\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/teacher/students",
          "host": ["{{base_url}}"],
          "path": ["teacher", "students"]
        }
      }
    }
  ]
}
```

---

### **Phase 2: AWS Preparation**

#### **2.1 AWS RDS Setup**

```bash
# Create RDS instance using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier edugrowhub-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username edugrowhub-db \
  --master-user-password 'EdUgr0wHub!2025' \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-your-security-group-id \
  --db-subnet-group-name your-db-subnet-group \
  --backup-retention-period 7 \
  --port 3306 \
  --no-multi-az \
  --storage-encrypted \
  --publicly-accessible

# Wait for RDS instance to be available
aws rds wait db-instance-available --db-instance-identifier edugrowhub-db

# Get RDS endpoint
aws rds describe-db-instances --db-instance-identifier edugrowhub-db \
  --query 'DBInstances[0].Endpoint.Address' --output text
```

#### **2.2 RDS Security Group Configuration**

```bash
# Create security group for RDS
aws ec2 create-security-group \
  --group-name edugrowhub-rds-sg \
  --description "Security group for EduGrowHub RDS instance"

# Allow MySQL access from EC2 security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-security-group-id \
  --protocol tcp \
  --port 3306 \
  --source-group sg-ec2-security-group-id

# Allow MySQL access from your local IP (for testing)
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-security-group-id \
  --protocol tcp \
  --port 3306 \
  --cidr YOUR_IP_ADDRESS/32
```

#### **2.3 EC2 Instance Setup**

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-your-ec2-security-group \
  --subnet-id subnet-12345678 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=EduGrowHub-Production}]'

# Create security group for EC2
aws ec2 create-security-group \
  --group-name edugrowhub-ec2-sg \
  --description "Security group for EduGrowHub EC2 instance"

# Allow SSH access
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-security-group-id \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Allow HTTP access to Spring Boot
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-security-group-id \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0

# Allow HTTPS access (optional)
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-security-group-id \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

#### **2.4 Production Application Properties**

Create `src/main/resources/application-prod.properties`:
```properties
# Production Configuration
spring.profiles.active=production

# Database Configuration (AWS RDS)
spring.datasource.url=${DB_URL:jdbc:mysql://edugrowhub-db.c7c42s680p4z.ap-south-1.rds.amazonaws.com:3306/edugrowhub}
spring.datasource.username=${DB_USERNAME:edugrowhub-db}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool Configuration
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-timeout=30000

# JPA Configuration (Production)
spring.jpa.hibernate.ddl-auto=${DDL_AUTO:validate}
spring.jpa.show-sql=${SHOW_SQL:false}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.jdbc.batch_size=20

# Server Configuration
server.port=${SERVER_PORT:8080}
server.compression.enabled=true
server.compression.mime-types=text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json

# Logging Configuration (Production)
logging.level.com.edugrowhub=${LOG_LEVEL:INFO}
logging.level.org.springframework.security=WARN
logging.level.root=WARN
logging.file.name=${LOG_FILE_PATH:/var/log/edugrowhub/application.log}
logging.file.max-size=10MB
logging.file.max-history=30

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Twilio Configuration (Production)
twilio.account.sid=${TWILIO_ACCOUNT_SID}
twilio.auth.token=${TWILIO_AUTH_TOKEN}
twilio.whatsapp.from=${TWILIO_WHATSAPP_FROM}

# CORS Configuration (Production)
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:https://yourdomain.com,https://www.yourdomain.com}

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
management.info.git.mode=full

# Security Configuration
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
```

---

### **Phase 3: Deployment**

#### **3.1 Package Application**

```bash
# Create production JAR
mvn clean package -Pprod -DskipTests

# Verify JAR was created
ls -la target/*.jar

# Optional: Test JAR locally first
java -jar target/edugrowhub-backend-1.0.0.jar --spring.profiles.active=local
```

#### **3.2 Deploy to EC2**

```bash
# Copy JAR to EC2
scp -i your-key-pair.pem target/edugrowhub-backend-1.0.0.jar ec2-user@your-ec2-ip:/home/ec2-user/

# Copy environment file
scp -i your-key-pair.pem .env.prod ec2-user@your-ec2-ip:/home/ec2-user/.env

# Copy configuration
scp -i your-key-pair.pem src/main/resources/application-prod.properties ec2-user@your-ec2-ip:/home/ec2-user/

# SSH into EC2
ssh -i your-key-pair.pem ec2-user@your-ec2-ip
```

#### **3.3 EC2 Setup Commands**

```bash
# Update system
sudo yum update -y

# Install Java 17
sudo yum install -y java-17-amazon-corretto-devel

# Verify Java installation
java -version

# Create application directory
sudo mkdir -p /opt/edugrowhub
sudo mkdir -p /var/log/edugrowhub
sudo mkdir -p /etc/edugrowhub

# Move files to proper locations
sudo mv /home/ec2-user/edugrowhub-backend-1.0.0.jar /opt/edugrowhub/
sudo mv /home/ec2-user/.env /etc/edugrowhub/
sudo mv /home/ec2-user/application-prod.properties /etc/edugrowhub/

# Set permissions
sudo chown -R ec2-user:ec2-user /opt/edugrowhub
sudo chown -R ec2-user:ec2-user /var/log/edugrowhub
sudo chmod 600 /etc/edugrowhub/.env

# Test manual startup
cd /opt/edugrowhub
export $(cat /etc/edugrowhub/.env | xargs)
java -jar edugrowhub-backend-1.0.0.jar --spring.profiles.active=production --spring.config.additional-location=file:/etc/edugrowhub/
```

#### **3.4 Create Systemd Service**

```bash
# Create systemd service file
sudo tee /etc/systemd/system/edugrowhub.service > /dev/null <<EOF
[Unit]
Description=EduGrowHub Backend Application
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/edugrowhub
ExecStart=/usr/bin/java -jar /opt/edugrowhub/edugrowhub-backend-1.0.0.jar --spring.profiles.active=production --spring.config.additional-location=file:/etc/edugrowhub/
EnvironmentFile=/etc/edugrowhub/.env
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=edugrowhub

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/edugrowhub /var/log/edugrowhub /tmp

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable edugrowhub

# Start service
sudo systemctl start edugrowhub

# Check status
sudo systemctl status edugrowhub

# View logs
sudo journalctl -u edugrowhub -f
```

---

## 🔍 Verification & Testing

### **Local Verification**

```bash
# Check if application is running
curl http://localhost:8080/actuator/health

# Test teacher login
curl -X POST http://localhost:8080/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@edugrowhub.com", "password": "password123"}'

# Test with Postman
# Import the postman-tests.json collection
# Update base_url to http://localhost:8080/api
# Run the collection
```

### **Production Verification**

```bash
# Check if application is running on EC2
curl http://your-ec2-ip:8080/actuator/health

# Test from your local machine
curl -X POST http://your-ec2-ip:8080/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@edugrowhub.com", "password": "password123"}'

# Test with Postman (Production)
# Update base_url to http://your-ec2-ip:8080/api
# Run the same test collection
```

### **Database Verification**

```bash
# Connect to RDS from local machine
mysql -h edugrowhub-db.c7c42s680p4z.ap-south-1.rds.amazonaws.com -u edugrowhub-db -p

# Check tables were created
USE edugrowhub;
SHOW TABLES;
DESCRIBE users;
DESCRIBE students;

# Check application logs for database connections
sudo journalctl -u edugrowhub | grep -i "database\|connection\|hibernate"
```

---

## 🔒 Security Checklist

### **AWS Security Groups**
- [ ] RDS security group allows access only from EC2 security group
- [ ] EC2 security group allows SSH (port 22) from your IP only
- [ ] EC2 security group allows HTTP (port 8080) from 0.0.0.0/0
- [ ] Consider using Application Load Balancer for HTTPS

### **Application Security**
- [ ] All secrets in environment variables
- [ ] JWT secret is cryptographically secure
- [ ] Database passwords are strong
- [ ] CORS configured for production domains only
- [ ] Actuator endpoints secured

### **Infrastructure Security**
- [ ] EC2 instance has latest security updates
- [ ] RDS encryption enabled
- [ ] Regular backups configured
- [ ] Monitor CloudWatch logs

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Application Won't Start**
```bash
# Check Java version
java -version

# Check if port 8080 is available
sudo netstat -tlnp | grep 8080

# Check environment variables
cat /etc/edugrowhub/.env

# Check application logs
sudo journalctl -u edugrowhub -n 50
```

#### **Database Connection Issues**
```bash
# Test RDS connectivity
telnet edugrowhub-db.c7c42s680p4z.ap-south-1.rds.amazonaws.com 3306

# Check security groups
aws ec2 describe-security-groups --group-ids sg-your-rds-security-group

# Verify credentials
mysql -h edugrowhub-db.c7c42s680p4z.ap-south-1.rds.amazonaws.com -u edugrowhub-db -p
```

#### **API Not Accessible**
```bash
# Check if application is listening
sudo netstat -tlnp | grep 8080

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-your-ec2-security-group

# Test from EC2 instance itself
curl http://localhost:8080/actuator/health
```

---

## 📈 Performance Optimization

### **JVM Tuning**
```bash
# Update systemd service with JVM options
sudo systemctl edit edugrowhub

# Add JVM options
[Service]
Environment="JAVA_OPTS=-Xms512m -Xmx2g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/edugrowhub/"
ExecStart=
ExecStart=/usr/bin/java $JAVA_OPTS -jar /opt/edugrowhub/edugrowhub-backend-1.0.0.jar --spring.profiles.active=production --spring.config.additional-location=file:/etc/edugrowhub/
```

### **Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_teacher_id ON students(teacher_id);
CREATE INDEX idx_test_results_student_id ON test_results(student_id);
```

---

## ✅ Final Deployment Checklist

### **Before Going Live**
- [ ] All tests pass locally
- [ ] All endpoints tested with Postman
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Security groups properly configured
- [ ] SSL certificate configured (if using HTTPS)
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented

### **Post-Deployment**
- [ ] Application accessible from internet
- [ ] All API endpoints working
- [ ] Database operations successful
- [ ] Logs being generated properly
- [ ] Performance monitoring active
- [ ] Error tracking configured

**Your EduGrowHub application is now ready for production! 🎉**
