# 🧪 EduGrowHub API Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the EduGrowHub application, including local testing, API endpoint verification, and deployment validation.

## 🔧 Local Testing Setup

### Prerequisites
- Java 11 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- PowerShell (Windows) or Bash (Linux/Mac)

### Quick Start

#### Windows PowerShell
```powershell
# Make script executable and run
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\test-local.ps1
```

#### With specific options
```powershell
# Skip database setup (if already configured)
.\test-local.ps1 -SkipDatabase

# Skip tests during build
.\test-local.ps1 -SkipTests

# Skip build (if already built)
.\test-local.ps1 -SkipBuild
```

### Manual Testing Steps

1. **Database Setup**
   ```sql
   CREATE DATABASE edugrowhub_local;
   CREATE USER 'edugrowhub'@'localhost' IDENTIFIED BY 'local_password_123';
   GRANT ALL PRIVILEGES ON edugrowhub_local.* TO 'edugrowhub'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Environment Configuration**
   - Ensure `.env.local` exists with all required variables
   - Run: `.\verify-config.sh` (Linux/Mac) or check manually

3. **Build and Run**
   ```bash
   mvn clean package -DskipTests
   java -jar target/edugrowhub-*.jar --spring.profiles.active=local
   ```

## 🌐 API Endpoints Testing

### Base URL
- **Local**: `http://localhost:8080`
- **Production**: `http://your-ec2-ip:8080`

### Health Check Endpoints

#### 1. Application Health
```bash
curl -X GET http://localhost:8080/health
```
**Expected Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. Actuator Health (if enabled)
```bash
curl -X GET http://localhost:8080/actuator/health
```

### Authentication Endpoints

#### 1. User Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }'
```

#### 2. User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "testuser",
  "email": "test@example.com",
  "roles": ["STUDENT"]
}
```

### User Management Endpoints

#### 1. Get All Users (Admin only)
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Get User Profile
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Update User Profile
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "email": "updated@example.com"
  }'
```

### Course Management Endpoints

#### 1. Get All Courses
```bash
curl -X GET http://localhost:8080/api/courses
```

#### 2. Get Course by ID
```bash
curl -X GET http://localhost:8080/api/courses/1
```

#### 3. Create Course (Teacher/Admin only)
```bash
curl -X POST http://localhost:8080/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Java",
    "description": "Learn Java programming from basics",
    "duration": 40,
    "level": "BEGINNER",
    "price": 99.99,
    "category": "PROGRAMMING"
  }'
```

#### 4. Update Course
```bash
curl -X PUT http://localhost:8080/api/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Java Programming",
    "description": "Master advanced Java concepts",
    "duration": 60,
    "level": "ADVANCED",
    "price": 149.99
  }'
```

#### 5. Delete Course
```bash
curl -X DELETE http://localhost:8080/api/courses/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Enrollment Endpoints

#### 1. Enroll in Course
```bash
curl -X POST http://localhost:8080/api/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1
  }'
```

#### 2. Get User Enrollments
```bash
curl -X GET http://localhost:8080/api/enrollments/my-courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Get Course Enrollments (Teacher/Admin only)
```bash
curl -X GET http://localhost:8080/api/enrollments/course/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Progress Tracking Endpoints

#### 1. Update Progress
```bash
curl -X POST http://localhost:8080/api/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "lessonId": 1,
    "progressPercentage": 75,
    "timeSpent": 120
  }'
```

#### 2. Get Course Progress
```bash
curl -X GET http://localhost:8080/api/progress/course/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Notification Endpoints

#### 1. Get User Notifications
```bash
curl -X GET http://localhost:8080/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Mark Notification as Read
```bash
curl -X PUT http://localhost:8080/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Send WhatsApp Notification (Admin only)
```bash
curl -X POST http://localhost:8080/api/notifications/whatsapp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Welcome to EduGrowHub!"
  }'
```

## 🧪 Postman Collection

### Import Instructions
1. Open Postman
2. Click "Import" button
3. Paste the following JSON:

```json
{
  "info": {
    "name": "EduGrowHub API",
    "description": "Complete API collection for EduGrowHub application",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
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
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPassword123!\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\",\n  \"role\": \"STUDENT\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const responseJson = pm.response.json();",
                  "    pm.environment.set('jwt_token', responseJson.token);",
                  "    console.log('JWT token saved to environment');",
                  "}"
                ]
              }
            }
          ],
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
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"TestPassword123!\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Health Check",
      "item": [
        {
          "name": "Application Health",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/health",
              "host": ["{{base_url}}"],
              "path": ["health"]
            }
          }
        }
      ]
    },
    {
      "name": "Courses",
      "item": [
        {
          "name": "Get All Courses",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/courses",
              "host": ["{{base_url}}"],
              "path": ["api", "courses"]
            }
          }
        },
        {
          "name": "Create Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Introduction to Java\",\n  \"description\": \"Learn Java programming from basics\",\n  \"duration\": 40,\n  \"level\": \"BEGINNER\",\n  \"price\": 99.99,\n  \"category\": \"PROGRAMMING\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/courses",
              "host": ["{{base_url}}"],
              "path": ["api", "courses"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get User Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/users/profile",
              "host": ["{{base_url}}"],
              "path": ["api", "users", "profile"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080"
    }
  ]
}
```

### Environment Setup
Create a new environment in Postman with:
- `base_url`: `http://localhost:8080` (local) or `http://your-ec2-ip:8080` (production)
- `jwt_token`: (will be auto-populated after login)

## 🚀 Production Testing

### EC2 Deployment Testing
After deploying to EC2, test the following:

1. **SSH Connection**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Application Status**
   ```bash
   sudo systemctl status edugrowhub
   ```

3. **Application Logs**
   ```bash
   sudo journalctl -u edugrowhub -f
   ```

4. **Health Check**
   ```bash
   curl http://your-ec2-ip:8080/health
   ```

### Load Testing (Optional)

#### Using Apache Bench
```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:8080/health

# Test courses endpoint
ab -n 50 -c 5 http://localhost:8080/api/courses
```

#### Using curl for concurrent testing
```bash
# Create a simple load test script
for i in {1..10}; do
  curl -s http://localhost:8080/health &
done
wait
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service status
   - Verify credentials in `.env` file
   - Test manual database connection

2. **JWT Token Invalid**
   - Check JWT secret configuration
   - Verify token expiration time
   - Re-login to get new token

3. **Port Already in Use**
   ```bash
   # Find process using port 8080
   netstat -tlnp | grep 8080
   # Kill the process
   kill -9 <process_id>
   ```

4. **Memory Issues on EC2**
   ```bash
   # Check memory usage
   free -h
   # Increase swap space if needed
   sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Log Analysis

#### Application Logs
```bash
# View recent logs
sudo journalctl -u edugrowhub -n 100

# Follow logs in real-time
sudo journalctl -u edugrowhub -f

# Filter by error level
sudo journalctl -u edugrowhub --no-pager | grep ERROR
```

#### Database Logs
```bash
# MySQL error log
tail -f /var/log/mysql/error.log

# MySQL slow query log
tail -f /var/log/mysql/slow.log
```

## 📊 Performance Monitoring

### Application Metrics
If Spring Boot Actuator is enabled:

```bash
# Application metrics
curl http://localhost:8080/actuator/metrics

# Memory usage
curl http://localhost:8080/actuator/metrics/jvm.memory.used

# HTTP request metrics
curl http://localhost:8080/actuator/metrics/http.server.requests
```

### System Monitoring
```bash
# CPU and memory usage
top

# Disk usage
df -h

# Network connections
netstat -tuln
```

## ✅ Testing Checklist

### Pre-Deployment Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Database migrations work
- [ ] Environment variables configured
- [ ] Security configurations verified
- [ ] API endpoints respond correctly
- [ ] Authentication/authorization works
- [ ] Error handling tested

### Post-Deployment Testing
- [ ] Application starts successfully
- [ ] Health check passes
- [ ] Database connection established
- [ ] All API endpoints accessible
- [ ] Authentication flow works
- [ ] File uploads/downloads work
- [ ] Email/SMS notifications work
- [ ] Logging properly configured
- [ ] Performance acceptable
- [ ] Security headers present

### Load Testing
- [ ] Concurrent user handling
- [ ] Database connection pooling
- [ ] Memory usage under load
- [ ] Response times acceptable
- [ ] Error rates minimal
- [ ] System recovery after failures

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify configuration settings
4. Test with minimal data set
5. Contact support with detailed error logs
