# 🚀 EduGrowHub Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### 🔧 Infrastructure Preparation

#### AWS RDS Setup
- [ ] **RDS Instance Created**
  - Instance Type: `db.t3.micro` or higher
  - Engine: MySQL 8.0
  - Storage: 20GB minimum, with auto-scaling enabled
  - Multi-AZ: Enabled for production
  - Backup retention: 7 days minimum

- [ ] **RDS Security Group**
  - Inbound rule: MySQL/Aurora (3306) from EC2 security group
  - Outbound rules: Properly configured

- [ ] **Database Configuration**
  - Database name: `edugrowhub`
  - Master username: `edugrowhub-db`
  - Strong password: `EdUgr0wHub!2025`
  - Parameter group: Optimized for application needs

- [ ] **RDS Connection Testing**
  ```bash
  mysql -h edugrowhub-db.c7c42s680p4z.ap-south-1.rds.amazonaws.com -u edugrowhub-db -p edugrowhub
  ```

#### AWS EC2 Setup
- [ ] **EC2 Instance Launched**
  - AMI: Amazon Linux 2
  - Instance Type: `t3.micro` or higher
  - Key Pair: Created and downloaded
  - Storage: 8GB minimum

- [ ] **EC2 Security Group**
  - SSH (22): Your IP address
  - HTTP (80): 0.0.0.0/0 (if using load balancer)
  - Custom TCP (8080): 0.0.0.0/0 or specific IPs
  - HTTPS (443): 0.0.0.0/0 (if SSL configured)

- [ ] **Elastic IP (Optional)**
  - Allocated and associated with EC2 instance
  - DNS records updated if applicable

#### Domain and SSL (Optional)
- [ ] **Domain Configuration**
  - Domain registered and DNS configured
  - A record pointing to EC2 Elastic IP

- [ ] **SSL Certificate**
  - SSL certificate obtained (Let's Encrypt or ACM)
  - Nginx/Apache configured for HTTPS redirect

### 🔐 Security Configuration

#### Environment Variables
- [ ] **Production Environment File**
  - `.env.prod` created with all required variables
  - No hardcoded credentials in code
  - Strong JWT secret (256-bit)
  - Secure database credentials

- [ ] **Secrets Management**
  - Consider AWS Secrets Manager for production
  - Environment variables properly secured
  - No sensitive data in version control

#### Application Security
- [ ] **Security Headers**
  - CORS properly configured
  - Security headers enabled
  - Rate limiting configured

- [ ] **Authentication & Authorization**
  - JWT implementation tested
  - Role-based access control verified
  - Password policies enforced

### 📦 Application Configuration

#### Build and Package
- [ ] **Production Build**
  ```bash
  mvn clean package -Pprod -DskipTests
  ```
  - JAR file created successfully
  - Production profile activated
  - Dependencies included

- [ ] **Configuration Files**
  - `application-prod.properties` configured
  - Database connection parameters correct
  - Logging levels appropriate (INFO/WARN)

#### External Services
- [ ] **Twilio Configuration**
  - Account SID and Auth Token configured
  - WhatsApp Business number verified
  - Webhook endpoints configured

- [ ] **Email Service (if used)**
  - SMTP settings configured
  - Email templates tested
  - Bounce handling configured

### 🗄️ Database Preparation

#### Schema and Data
- [ ] **Database Schema**
  - DDL scripts tested
  - Hibernate schema validation mode set
  - Indexes created for performance

- [ ] **Initial Data**
  - Admin user created
  - Sample courses loaded (optional)
  - Reference data populated

- [ ] **Backup Strategy**
  - Automated backups enabled
  - Backup retention policy set
  - Restore procedure tested

## 🚀 Deployment Process

### Step 1: Local Testing
- [ ] **Local Environment**
  ```bash
  .\test-local.ps1
  ```
  - All tests pass locally
  - API endpoints working
  - Database operations successful

### Step 2: Pre-deployment Validation
- [ ] **Configuration Verification**
  ```bash
  .\verify-config.sh
  ```
  - All environment variables present
  - Configuration syntax valid
  - External service connections tested

### Step 3: EC2 Deployment
- [ ] **Deploy to EC2**
  ```bash
  .\deploy-ec2.ps1 -EC2Host "your-ec2-ip" -KeyFile "path\to\your-key.pem"
  ```
  - Java installed on EC2
  - Application files copied
  - Systemd service created and started

### Step 4: Post-Deployment Testing
- [ ] **Health Checks**
  ```bash
  curl http://your-ec2-ip:8080/health
  ```
  - Application starts successfully
  - Health endpoint responds
  - Database connection established

- [ ] **API Testing**
  - Authentication endpoints work
  - CRUD operations functional
  - Error handling proper
  - Performance acceptable

## 🔍 Monitoring and Logging

### Application Monitoring
- [ ] **Log Configuration**
  - Log levels appropriate for production
  - Log rotation configured
  - Centralized logging (optional)

- [ ] **Health Monitoring**
  - Health check endpoint active
  - System metrics available
  - Alerting configured (optional)

### System Monitoring
- [ ] **EC2 Monitoring**
  - CloudWatch metrics enabled
  - Disk space monitoring
  - Memory usage tracking

- [ ] **RDS Monitoring**
  - Database performance metrics
  - Connection pool monitoring
  - Slow query logging enabled

## 🔧 Production Operations

### Service Management
- [ ] **Systemd Service**
  ```bash
  # Service management commands
  sudo systemctl status edugrowhub
  sudo systemctl restart edugrowhub
  sudo systemctl stop edugrowhub
  sudo systemctl start edugrowhub
  ```

- [ ] **Log Management**
  ```bash
  # View logs
  sudo journalctl -u edugrowhub -f
  sudo journalctl -u edugrowhub --since "1 hour ago"
  ```

### Backup and Recovery
- [ ] **Database Backups**
  - Automated RDS backups enabled
  - Manual backup procedure documented
  - Recovery testing performed

- [ ] **Application Backups**
  - JAR file versioning
  - Configuration backup
  - Rollback procedure documented

## 🚨 Troubleshooting Guide

### Common Issues

#### Application Won't Start
1. Check Java installation: `java -version`
2. Verify JAR file permissions: `ls -la /opt/edugrowhub/`
3. Check environment variables: `cat /opt/edugrowhub/.env`
4. Review logs: `sudo journalctl -u edugrowhub -n 50`

#### Database Connection Issues
1. Test RDS connectivity: `telnet rds-endpoint 3306`
2. Verify security group rules
3. Check database credentials
4. Review RDS logs in AWS Console

#### Performance Issues
1. Monitor CPU/Memory: `top`, `htop`
2. Check database performance: RDS Performance Insights
3. Review application logs for errors
4. Monitor response times

#### Memory Issues
1. Check available memory: `free -h`
2. Adjust JVM heap size: `-Xmx512m -Xms256m`
3. Enable swap if needed
4. Monitor garbage collection

## 📊 Performance Optimization

### JVM Tuning
- [ ] **Memory Settings**
  ```bash
  java -Xms256m -Xmx512m -jar app.jar
  ```

- [ ] **Garbage Collection**
  ```bash
  java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar
  ```

### Database Optimization
- [ ] **Connection Pool**
  - Minimum pool size: 5
  - Maximum pool size: 20
  - Connection timeout: 30s

- [ ] **Query Optimization**
  - Indexes on frequently queried columns
  - Query performance analysis
  - N+1 query prevention

## 🔒 Security Hardening

### Server Security
- [ ] **OS Updates**
  ```bash
  sudo yum update -y
  ```

- [ ] **Firewall Configuration**
  ```bash
  sudo firewall-cmd --permanent --add-port=8080/tcp
  sudo firewall-cmd --reload
  ```

- [ ] **SSH Security**
  - Disable password authentication
  - Use key-based authentication only
  - Change default SSH port (optional)

### Application Security
- [ ] **Security Headers**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block

- [ ] **Input Validation**
  - All user inputs validated
  - SQL injection prevention
  - XSS prevention

## 📈 Scaling Considerations

### Horizontal Scaling
- [ ] **Load Balancer Setup**
  - Application Load Balancer (ALB)
  - Multiple EC2 instances
  - Session management strategy

### Vertical Scaling
- [ ] **Instance Sizing**
  - Monitor resource usage
  - Scale up instance type as needed
  - Adjust JVM heap size accordingly

### Database Scaling
- [ ] **Read Replicas**
  - Read replica for read-heavy workloads
  - Connection string management

## ✅ Final Verification

### Production Readiness
- [ ] All infrastructure components deployed
- [ ] Application successfully deployed and running
- [ ] All API endpoints tested and working
- [ ] Database operations successful
- [ ] External service integrations working
- [ ] Monitoring and logging operational
- [ ] Backup and recovery procedures tested
- [ ] Performance benchmarks met
- [ ] Security measures implemented
- [ ] Documentation updated

### Go-Live Checklist
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Rollback plan ready
- [ ] Monitoring alerts active
- [ ] Performance baseline established

## 📞 Support Contacts

### Technical Support
- Application Issues: Review logs and restart service
- Database Issues: Check RDS console and connectivity
- Infrastructure Issues: Review AWS console and metrics

### Emergency Procedures
1. **Application Down**: Restart service, check logs
2. **Database Issues**: Check RDS status, verify connections
3. **High Load**: Monitor metrics, consider scaling
4. **Security Incident**: Isolate, investigate, document

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Version**: v1.0.0
**Status**: ✅ Production Ready
