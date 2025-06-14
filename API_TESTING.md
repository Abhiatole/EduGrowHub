# API Testing Guide for EduGrowHub

This guide provides sample API requests for testing the EduGrowHub application endpoints.

## Prerequisites
- Application running on `http://localhost:8080`
- Database set up with sample data
- Valid Twilio credentials configured

## 1. Student Login & Authentication

### Student Login
```bash
curl -X POST http://localhost:8080/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "student123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "student": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+1234567891"
  }
}
```

### Get Student Profile (with JWT)
```bash
curl -X GET http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Get Student Test Results
```bash
curl -X GET http://localhost:8080/api/student/test-results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 2. Teacher Login & Operations

### Teacher Login
```bash
curl -X POST http://localhost:8080/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@edugrowhub.com",
    "password": "teacher123"
  }'
```

### Submit Test Marks (Triggers WhatsApp)
```bash
curl -X POST http://localhost:8080/api/teacher/students/1/marks \
  -H "Authorization: Bearer YOUR_TEACHER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "marks": 85.5,
    "maxMarks": 100,
    "testDate": "2025-06-14",
    "comments": "Good performance in algebra section"
  }'
```

**Expected Response (with WhatsApp notification):**
```json
{
  "success": true,
  "message": "Test result saved successfully",
  "testResult": {
    "id": 1,
    "subject": "Mathematics",
    "marks": 85.5,
    "maxMarks": 100,
    "testDate": "2025-06-14"
  },
  "whatsappNotification": {
    "sent": true,
    "messageSid": "SM1234567890abcdef",
    "status": "queued"
  }
}
```

## 3. SuperAdmin Operations

### SuperAdmin Login
```bash
curl -X POST http://localhost:8080/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edugrowhub.com",
    "password": "admin123"
  }'
```

## 4. Testing WhatsApp Integration

### Prerequisites for WhatsApp Testing
1. Valid Twilio account with WhatsApp API access
2. Verified phone numbers in Twilio sandbox (for development)
3. Student record with valid phone number

### Test Scenario: Submit Test Marks
1. Login as teacher to get JWT token
2. Submit test marks for a student with valid phone number
3. Check response for WhatsApp notification status
4. Verify message in Twilio console
5. Check `whatsapp_logs` table for message record

### Sample WhatsApp Message Format
```
🎓 EduGrowHub Test Result

Hi Jane Smith!

Your test result for Mathematics:
📊 Score: 85.5/100 (85.5%)
📅 Date: June 14, 2025
💬 Comments: Good performance in algebra section

Keep up the great work! 🌟

- EduGrowHub Team
```

## 5. Error Testing

### Invalid Login Credentials
```bash
curl -X POST http://localhost:8080/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }'
```

### Unauthorized Access (without JWT)
```bash
curl -X GET http://localhost:8080/api/student/profile
```

### Expired/Invalid JWT Token
```bash
curl -X GET http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer invalid_token_here"
```

## 6. Database Verification Queries

### Check WhatsApp Logs
```sql
SELECT * FROM whatsapp_logs 
WHERE created_at >= CURDATE() 
ORDER BY created_at DESC;
```

### Check Test Results
```sql
SELECT tr.*, s.name as student_name, t.name as teacher_name
FROM test_results tr
JOIN students s ON tr.student_id = s.id
JOIN teachers t ON tr.teacher_id = t.id
ORDER BY tr.created_at DESC;
```

### Check Recent Student Logins (by checking JWT activity)
```sql
SELECT * FROM students 
WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 DAY);
```

## 7. Environment Validation

### Check Application Health
```bash
curl -X GET http://localhost:8080/actuator/health
```

### Validate Environment Variables
Create a simple endpoint or check application logs on startup to ensure:
- Database connection successful
- JWT secret properly loaded
- Twilio configuration valid

## 8. Integration Testing Checklist

- [ ] Student can login and receive JWT token
- [ ] Student can access protected endpoints with valid JWT
- [ ] Teacher can login and access teacher-specific endpoints
- [ ] Test mark submission triggers WhatsApp message
- [ ] WhatsApp message is logged in database
- [ ] Invalid credentials are rejected
- [ ] Expired JWT tokens are rejected
- [ ] Database relationships are maintained
- [ ] Password encryption is working
- [ ] Twilio integration is functional

## 9. Performance Testing

### Load Testing with Multiple Students
```bash
# Test concurrent student logins
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/student/login \
    -H "Content-Type: application/json" \
    -d '{"email":"student'$i'@test.com","password":"password"}' &
done
wait
```

### WhatsApp Rate Limiting
Test WhatsApp message sending with multiple concurrent requests to ensure proper rate limiting and error handling.

---

## Troubleshooting Common Issues

1. **404 Not Found**: Check if Spring Boot application is running on correct port
2. **403 Forbidden**: Verify JWT token and user permissions
3. **500 Internal Server Error**: Check application logs and database connectivity
4. **WhatsApp Not Sending**: Verify Twilio credentials and phone number format
5. **Database Connection Failed**: Check MySQL service and connection parameters

---

## Notes
- Replace `YOUR_JWT_TOKEN_HERE` with actual JWT tokens from login responses
- Ensure phone numbers are in E.164 format (+1234567890)
- Test in Twilio sandbox before production deployment
- Monitor rate limits for both API calls and WhatsApp messages
