# 🧪 EduGrowHub API Testing Guide

## 📋 Overview
This guide provides comprehensive API testing instructions for the EduGrowHub educational management system. The system includes superadmin, teacher, and student roles with JWT-based authentication.

## 🌐 Base Configuration
- **Base URL**: `http://localhost:8080`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

## 🔐 Authentication Flow

### 1. Superadmin Login
```bash
curl -X POST http://localhost:8080/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edugrowhub.com",
    "password": "admin123"
  }'
```

### 2. Teacher Login
```bash
curl -X POST http://localhost:8080/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "teacher123"
  }'
```

### 3. Student Login
```bash
curl -X POST http://localhost:8080/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "student123"
  }'
```

## 👥 User Management (Teacher Role)

### 1. Create Student (Teacher Only)
```bash
curl -X POST http://localhost:8080/api/teacher/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@student.com"
  }'
```

### 2. Get Teacher's Students
```bash
curl -X GET http://localhost:8080/api/teacher/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Teacher Dashboard
```bash
curl -X GET http://localhost:8080/api/teacher/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Test Results Management (Teacher Role)

### 1. Add Student Marks
```bash
curl -X POST http://localhost:8080/api/teacher/students/1/marks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "score": 85,
    "maxScore": 100,
    "testDate": "2025-06-15"
  }'
```

### 2. Get Student Marks
```bash
curl -X GET http://localhost:8080/api/teacher/students/1/marks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Edit Student Mark
```bash
curl -X PUT http://localhost:8080/api/teacher/students/1/marks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "score": 90,
    "maxScore": 100,
    "testDate": "2025-06-15"
  }'
```

### 4. Delete Student Mark
```bash
curl -X DELETE http://localhost:8080/api/teacher/students/1/marks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Student Report
```bash
curl -X GET http://localhost:8080/api/teacher/students/1/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👨‍🎓 Student Operations

### 1. Get Student Profile
```bash
curl -X GET http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Student Test Results
```bash
curl -X GET http://localhost:8080/api/student/test-results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Change Student Password
```bash
curl -X PUT http://localhost:8080/api/student/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }'
```

## 📱 WhatsApp Integration Features

- **Test Result Notifications**: Automatic WhatsApp notifications when marks are added
- **Student Enrollment Notifications**: Teacher notifications for new student enrollments
- **Phone Number Configuration**: Students and teachers can set phone numbers for notifications

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for superadmin, teacher, and student
- **Password Encryption**: Bcrypt password hashing
- **Input Validation**: Comprehensive input validation and sanitization

## 📋 Sample Test Data

### Initial Users to Create:
1. **Superadmin**: admin@edugrowhub.com / admin123
2. **Teacher**: teacher@example.com / teacher123
3. **Student**: student@example.com / student123

### Sample Test Subjects:
- Mathematics
- Science
- English
- History
- Geography

## 🚨 Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## 📊 Response Formats

### Success Response Example:
```json
{
  "id": 1,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response Example:
```json
{
  "error": true,
  "message": "Validation failed",
  "timestamp": "2025-06-15T18:15:00"
}
```

## 🔄 Testing Workflow

1. **Start Application**: Run `mvn spring-boot:run` with `SPRING_PROFILES_ACTIVE=local`
2. **Create Initial Data**: Use superadmin login to create teachers
3. **Teacher Operations**: Login as teacher to create students and add marks
4. **Student Operations**: Login as student to view profile and test results
5. **Test WhatsApp**: Configure phone numbers to test notifications

## 📝 Notes

- All timestamps are in ISO 8601 format
- Passwords must meet minimum security requirements
- Phone numbers should be in international format for WhatsApp
- JWT tokens expire after the configured time (default: 1 hour)
- Test results automatically calculate percentages and grades
