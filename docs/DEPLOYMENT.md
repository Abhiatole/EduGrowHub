# EduGrowHub Configuration & Deployment Guide

## 🔧 Environment Configuration

### Required Environment Variables

Before deploying EduGrowHub, you must configure the following environment variables:

#### Database Configuration
```properties
DB_URL=jdbc:mysql://localhost:3306/edugrowhub
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

#### JWT Security Configuration
```properties
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_security
JWT_EXPIRATION=3600000  # Token expiration in milliseconds (1 hour)
```

#### Twilio WhatsApp Configuration
```properties
TWILIO_ACCOUNT_SID=ACa3028dbecc531e6fcc97403dc22ac58b  # Your Twilio Account SID
TWILIO_AUTH_TOKEN=your_actual_auth_token_here         # Your Twilio Auth Token
TWILIO_WHATSAPP_FROM=+14155238886                     # Your Twilio WhatsApp number
```

#### Server Configuration
```properties
SERVER_PORT=8080        # Application port
LOG_LEVEL=INFO         # Logging level (DEBUG, INFO, WARN, ERROR)
SHOW_SQL=false         # Show SQL queries in logs (true for development)
```

---

## 🗃️ Database Setup

### Automated Setup (Recommended)
The application uses JPA with `hibernate.ddl-auto=update`, which automatically creates and updates database tables on startup.

### Manual Setup (Optional)
If you prefer manual database setup, execute the SQL script located at:
```
src/main/resources/sql/schema.sql
```

### Database Tables Created
- `students` - Student information with authentication
- `teachers` - Teacher information with authentication  
- `super_admins` - System administrator accounts
- `test_results` - Student test marks and results
- `whatsapp_logs` - WhatsApp message audit trail

---

## 🔐 Security Configuration

### JWT Token Configuration
- **Secret Key**: Must be at least 32 characters long for HS256 algorithm
- **Expiration**: Default 1 hour (3600000 milliseconds)
- **Algorithm**: HMAC SHA256

### Password Encryption
- Uses BCrypt with default strength (10 rounds)
- All user passwords are automatically encrypted

### API Endpoints Security
- Public endpoints: `/api/student/login`, `/api/teacher/login`, `/api/superadmin/login`
- Student protected: `/api/student/profile`, `/api/student/test-results`
- Teacher protected: `/api/teacher/dashboard`, `/api/teacher/students/**`
- Admin protected: `/api/superadmin/**`

---

## 📱 Twilio WhatsApp Setup

### Prerequisites
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Set up WhatsApp Business API sandbox or production account
3. Get your Account SID and Auth Token from Twilio Console

### WhatsApp Number Format
- Use E.164 format: `+[country code][phone number]`
- Example: `+14155238886` (US number)

### Message Templates
The application includes pre-built message templates for:
- Test result notifications
- Welcome messages
- General notifications

---

## 🚀 Deployment Options

### Local Development
```bash
# Set environment variables in .env file
cp .env .env.local
# Edit .env.local with your actual values

# Run the application
mvn spring-boot:run
```

### Production Deployment

#### Using Environment Variables (Recommended)
```bash
export DB_URL="jdbc:mysql://your-rds-endpoint:3306/edugrowhub"
export DB_USERNAME="your_username"
export DB_PASSWORD="your_password"
export JWT_SECRET="your_production_jwt_secret_key"
export TWILIO_ACCOUNT_SID="your_account_sid"
export TWILIO_AUTH_TOKEN="your_auth_token"

java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar
```

#### Using Docker (Optional)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/edugrowhub-0.0.1-SNAPSHOT.jar app.jar
ENV DB_URL=jdbc:mysql://your-rds:3306/edugrowhub
ENV JWT_SECRET=your_jwt_secret
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## 📋 API Endpoints

### Student Authentication
- `POST /api/student/login` - Student login
- `GET /api/student/profile` - Get student profile (JWT required)
- `POST /api/student/change-password` - Change password (JWT required)
- `GET /api/student/test-results` - Get test results (JWT required)

### Teacher Authentication  
- `POST /api/teacher/login` - Teacher login
- `GET /api/teacher/dashboard` - Teacher dashboard (JWT required)
- `GET /api/teacher/students` - Get enrolled students (JWT required)
- `POST /api/teacher/students/{id}/marks` - Submit test marks (JWT required)

### Test Results (Triggers WhatsApp)
- `POST /api/teacher/students/{studentId}/marks` - Submit marks (sends WhatsApp notification)

---

## 🔍 Monitoring & Logging

### WhatsApp Message Tracking
All WhatsApp messages are logged in the `whatsapp_logs` table with:
- Message content and recipient
- Delivery status and timestamps
- Error messages if delivery fails
- Metadata for analytics

### Application Logs
- Configure log levels via `LOG_LEVEL` environment variable
- SQL queries logging via `SHOW_SQL` (development only)
- Security events are automatically logged

---

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DB_URL, DB_USERNAME, and DB_PASSWORD
   - Ensure MySQL server is running
   - Check firewall settings

2. **JWT Token Invalid**
   - Verify JWT_SECRET is at least 32 characters
   - Check token expiration time
   - Ensure consistent secret across all instances

3. **WhatsApp Messages Not Sending**
   - Verify Twilio credentials (SID and Auth Token)
   - Check WhatsApp number format (+E.164)
   - Verify Twilio WhatsApp sandbox setup
   - Check application logs for Twilio API errors

4. **Access Denied Errors**
   - Verify JWT token in Authorization header
   - Check user roles and permissions
   - Ensure endpoints are properly configured in SecurityConfig

---

## 📞 Support

For technical support or questions:
- Check application logs for detailed error messages
- Verify all environment variables are properly set
- Ensure database connectivity and Twilio account status
- Review security configurations for endpoint access

---

## 🔄 Version Information

- **Application Version**: 0.0.1-SNAPSHOT
- **Java Version**: 17+
- **Spring Boot Version**: 3.1.0
- **Database**: MySQL 8.0+
- **JWT Algorithm**: HS256
- **Password Encryption**: BCrypt
