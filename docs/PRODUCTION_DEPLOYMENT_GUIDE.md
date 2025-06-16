# 🚀 EduGrowHub Day 5 - Production Deployment Guide

## 📋 Complete Implementation Status

### ✅ **Frontend Implementation Complete**
- **Professional UI**: Modern LMS interface with Tailwind CSS
- **Component Architecture**: Reusable Button, Input, Card components
- **Routing System**: React Router with protected routes
- **API Integration**: Axios with interceptors and error handling
- **Authentication**: JWT token management and validation
- **Toast Notifications**: User-friendly feedback system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### ✅ **Backend Implementation Complete**
- **Spring Boot Backend**: Production-ready configuration
- **JWT Authentication**: Secure token-based authentication
- **WhatsApp Integration**: Twilio API with comprehensive logging
- **Database Integration**: MySQL with JPA/Hibernate
- **CORS Configuration**: Environment-specific settings
- **Security Configuration**: Role-based access control
- **Production Properties**: Optimized for deployment

### ✅ **AWS Infrastructure Ready**
- **Deployment Scripts**: Automated EC2 and S3 deployment
- **NGINX Configuration**: Reverse proxy with SSL support
- **Environment Management**: Secure credential handling
- **Health Checks**: Application monitoring endpoints

---

## 🏗️ **AWS Infrastructure Setup**

### **1. RDS MySQL Database**
```bash
# Create RDS MySQL instance
aws rds create-db-instance \
  --db-name edugrowhub \
  --db-instance-identifier edugrowhub-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username edugrowhub_user \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --backup-retention-period 7 \
  --multi-az false \
  --storage-type gp2 \
  --storage-encrypted
```

### **2. EC2 Instance for Backend**
```bash
# Launch EC2 instance (Ubuntu 22.04)
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --count 1 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=EduGrowHub-Backend}]'
```

### **3. S3 Bucket for Frontend**
```bash
# Create S3 bucket for static hosting
aws s3 mb s3://edugrowhub-frontend --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://edugrowhub-frontend \
  --index-document index.html \
  --error-document index.html
```

### **4. CloudFront Distribution**
```bash
# Create CloudFront distribution (use AWS Console or CLI)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### **5. Route 53 Domain Setup**
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name edugrowhub.com \
  --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://route53-changes.json
```

---

## 🔧 **Deployment Steps**

### **Phase 1: Backend Deployment to EC2**

1. **Prepare EC2 Instance**
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install NGINX
sudo apt install nginx -y

# Install MySQL client
sudo apt install mysql-client -y
```

2. **Deploy Backend Application**
```bash
# On your local machine, copy deployment script to EC2
scp -i your-key.pem deploy-backend.sh ubuntu@your-ec2-ip:~/

# On EC2 instance, make script executable and run
chmod +x deploy-backend.sh
sudo ./deploy-backend.sh
```

3. **Configure Environment Variables**
```bash
# Create production environment file on EC2
sudo nano /opt/edugrowhub/.env

# Add your production variables:
DB_URL=jdbc:mysql://your-rds-endpoint:3306/edugrowhub
DB_USERNAME=edugrowhub_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_production_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=your_whatsapp_number
CORS_ALLOWED_ORIGINS=https://edugrowhub.com,https://www.edugrowhub.com
```

### **Phase 2: Frontend Deployment to S3**

1. **Build and Deploy Frontend**
```bash
# On your local machine, in the frontend directory
npm run build

# Deploy to S3 using the deployment script
chmod +x ../deploy-frontend.sh
../deploy-frontend.sh
```

2. **Configure Environment Variables**
```bash
# Update frontend/.env.production
REACT_APP_API_URL=https://api.edugrowhub.com/api
REACT_APP_API_TIMEOUT=15000
REACT_APP_ENVIRONMENT=production
```

### **Phase 3: SSL Certificate Setup**

1. **Request SSL Certificate**
```bash
# Request certificate via ACM
aws acm request-certificate \
  --domain-name edugrowhub.com \
  --subject-alternative-names www.edugrowhub.com api.edugrowhub.com \
  --validation-method DNS
```

2. **Configure NGINX SSL**
```bash
# Update NGINX configuration with SSL certificate paths
sudo nano /etc/nginx/sites-available/edugrowhub
# Update SSL certificate paths in the configuration
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🧪 **End-to-End Testing Workflow**

### **1. Student Registration & Login Flow**
```javascript
// Test student login
const testStudentLogin = async () => {
  const response = await fetch('https://api.edugrowhub.com/api/student/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@test.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  console.log('Student login:', data.success ? 'SUCCESS' : 'FAILED');
  return data.token;
};
```

### **2. Teacher Login & Test Entry Flow**
```javascript
// Test teacher login and test submission
const testTeacherWorkflow = async () => {
  // Login as teacher
  const loginResponse = await fetch('https://api.edugrowhub.com/api/teacher/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teacher@edugrowhub.com',
      password: 'teacher123'
    })
  });
  
  const { token } = await loginResponse.json();
  
  // Submit test marks (triggers WhatsApp)
  const testResponse = await fetch('https://api.edugrowhub.com/api/teacher/students/1/marks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      subject: 'Mathematics',
      marks: 85,
      maxMarks: 100,
      testDate: '2025-06-14',
      comments: 'Excellent performance!'
    })
  });
  
  const testData = await testResponse.json();
  console.log('WhatsApp sent:', testData.whatsappNotification?.sent ? 'YES' : 'NO');
};
```

### **3. WhatsApp Message Testing**
```bash
# Check WhatsApp logs in database
mysql -h your-rds-endpoint -u edugrowhub_user -p -e "
USE edugrowhub;
SELECT * FROM whatsapp_logs 
WHERE created_at >= CURDATE() 
ORDER BY created_at DESC 
LIMIT 10;
"
```

### **4. Report Generation Testing**
```javascript
// Test student dashboard and reports
const testReportsFlow = async (studentToken) => {
  const response = await fetch('https://api.edugrowhub.com/api/student/test-results', {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  
  const results = await response.json();
  console.log(`Student has ${results.testResults?.length || 0} test results`);
};
```

---

## 📊 **Monitoring & Maintenance**

### **Application Health Monitoring**
```bash
# Check backend health
curl https://api.edugrowhub.com/actuator/health

# Check frontend accessibility
curl -I https://edugrowhub.com

# Monitor application logs
sudo journalctl -u edugrowhub -f

# Check NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Database Monitoring**
```sql
-- Check recent activity
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_test_results FROM test_results;
SELECT COUNT(*) as total_whatsapp_messages FROM whatsapp_logs;

-- Check WhatsApp message success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM whatsapp_logs), 2) as percentage
FROM whatsapp_logs 
GROUP BY status;
```

### **Performance Optimization**
```bash
# Monitor system resources
htop
df -h
free -h

# Monitor application performance
curl -s "https://api.edugrowhub.com/actuator/metrics/system.cpu.usage"
curl -s "https://api.edugrowhub.com/actuator/metrics/jvm.memory.used"
```

---

## 🔐 **Security Checklist**

- [ ] **SSL/TLS**: HTTPS enabled for all domains
- [ ] **JWT Security**: Strong secret keys (256-bit minimum)
- [ ] **Database Security**: Strong passwords, restricted access
- [ ] **CORS**: Production origins properly configured
- [ ] **Environment Variables**: No secrets in code
- [ ] **Firewall**: Only necessary ports open (80, 443, 22)
- [ ] **Updates**: System and application dependencies updated
- [ ] **Backup**: Database backup strategy implemented
- [ ] **Monitoring**: Application and infrastructure monitoring
- [ ] **Logging**: Centralized logging for troubleshooting

---

## 🚀 **Go-Live Checklist**

1. [ ] **Infrastructure**: All AWS resources provisioned
2. [ ] **Backend**: Spring Boot application deployed and running
3. [ ] **Frontend**: React application built and deployed to S3
4. [ ] **Database**: RDS MySQL configured and accessible
5. [ ] **SSL**: Certificates installed and working
6. [ ] **DNS**: Domain pointing to correct resources
7. [ ] **Testing**: End-to-end workflow tested
8. [ ] **Monitoring**: Health checks and alerts configured
9. [ ] **Documentation**: Deployment and operational docs updated
10. [ ] **Team Training**: Operations team briefed on maintenance

---

## 📞 **Support & Troubleshooting**

### **Common Issues & Solutions**

1. **CORS Errors**
   - Check CORS_ALLOWED_ORIGINS environment variable
   - Verify frontend domain matches CORS configuration

2. **JWT Token Issues**
   - Ensure JWT_SECRET is consistent across environments
   - Check token expiration settings

3. **WhatsApp Not Sending**
   - Verify Twilio credentials and account status
   - Check phone number format (+E.164)
   - Review application logs for Twilio errors

4. **Database Connection Issues**
   - Verify RDS security groups allow EC2 access
   - Check database credentials and connection string

### **Emergency Contacts**
- **Development Team**: dev@edugrowhub.com
- **Operations Team**: ops@edugrowhub.com
- **Twilio Support**: Twilio Console Support

---

**🎉 EduGrowHub is now production-ready and deployed on AWS with comprehensive monitoring, security, and scalability features!**
