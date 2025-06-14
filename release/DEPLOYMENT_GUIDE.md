# EduGrowHub Deployment Guide

## Quick Start Deployment

This guide provides step-by-step instructions for deploying EduGrowHub to production.

### Prerequisites Checklist

Before deploying, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] Domain name configured with SSL certificate
- [ ] EC2 instance running (t3.medium or larger recommended)
- [ ] RDS MySQL database configured
- [ ] S3 bucket for frontend hosting
- [ ] CloudFront distribution configured
- [ ] Route 53 or DNS configured

### Step 1: Environment Setup

1. **Copy environment files:**
   ```bash
   cp .env.example.frontend .env.local  # For frontend
   cp .env.example.backend .env         # For backend
   ```

2. **Update environment variables:**
   - Update database credentials in `.env`
   - Configure AWS credentials and resource names
   - Set JWT secrets and API keys
   - Configure email and payment settings

### Step 2: Frontend Deployment

1. **Make script executable:**
   ```bash
   chmod +x deploy-frontend.sh
   ```

2. **Deploy to staging (optional):**
   ```bash
   ./deploy-frontend.sh staging
   ```

3. **Deploy to production:**
   ```bash
   ./deploy-frontend.sh prod
   ```

### Step 3: Backend Deployment

1. **Make script executable:**
   ```bash
   chmod +x deploy-backend.sh
   ```

2. **Deploy to staging (optional):**
   ```bash
   ./deploy-backend.sh staging
   ```

3. **Deploy to production:**
   ```bash
   ./deploy-backend.sh prod
   ```

### Step 4: Nginx Configuration

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copy configuration:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/edugrowhub
   sudo ln -s /etc/nginx/sites-available/edugrowhub /etc/nginx/sites-enabled/
   ```

3. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Step 5: SSL Certificate Setup

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate SSL certificate:**
   ```bash
   sudo certbot --nginx -d edugrowhub.com -d www.edugrowhub.com
   ```

### Step 6: Monitoring and Maintenance

1. **Check application status:**
   ```bash
   sudo systemctl status edugrowhub
   ```

2. **View logs:**
   ```bash
   sudo journalctl -u edugrowhub -f
   ```

3. **Monitor nginx:**
   ```bash
   sudo tail -f /var/log/nginx/edugrowhub_access.log
   ```

## Troubleshooting

### Common Issues

1. **Application won't start:**
   - Check database connectivity
   - Verify environment variables
   - Check Java version compatibility

2. **Frontend not loading:**
   - Verify S3 bucket permissions
   - Check CloudFront distribution status
   - Validate DNS configuration

3. **502 Bad Gateway:**
   - Check if backend is running on correct port
   - Verify nginx configuration
   - Check firewall settings

### Rollback Procedure

1. **Frontend rollback:**
   ```bash
   # Restore from S3 backup
   aws s3 sync s3://edugrowhub-frontend-prod-backup/latest/ s3://edugrowhub-frontend-prod/
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

2. **Backend rollback:**
   ```bash
   # Stop current service
   sudo systemctl stop edugrowhub
   
   # Restore previous JAR
   cp /opt/edugrowhub/backups/backup_TIMESTAMP/edugrowhub-backend.jar /opt/edugrowhub/bin/
   
   # Start service
   sudo systemctl start edugrowhub
   ```

## Security Considerations

1. **Regular Updates:**
   - Keep system packages updated
   - Update dependencies regularly
   - Monitor security advisories

2. **Backup Strategy:**
   - Database backups every 6 hours
   - Application backups before each deployment
   - Test restore procedures monthly

3. **Monitoring:**
   - Set up application monitoring (New Relic, DataDog)
   - Configure log aggregation (ELK Stack)
   - Set up alerts for critical issues

## Performance Optimization

1. **Database Optimization:**
   - Configure proper indexes
   - Set up read replicas if needed
   - Monitor query performance

2. **Application Optimization:**
   - Configure JVM heap size appropriately
   - Enable connection pooling
   - Set up caching (Redis)

3. **CDN Configuration:**
   - Configure proper cache headers
   - Set up compression
   - Optimize images and assets

## Maintenance Schedule

- **Daily:** Check application logs and metrics
- **Weekly:** Review performance metrics and optimize
- **Monthly:** Security updates and dependency updates
- **Quarterly:** Full system backup and disaster recovery test

## Support Contacts

- **Technical Lead:** [Your Name] - [email@domain.com]
- **DevOps Team:** [DevOps Team] - [devops@domain.com]
- **Emergency:** [Emergency Contact] - [emergency@domain.com]

---

For more detailed information, refer to the main README.md file.
