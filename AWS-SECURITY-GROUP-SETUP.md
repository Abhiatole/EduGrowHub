# AWS Security Group Configuration Guide for EduGrowHub

## Required Inbound Rules for EC2 Instance

### 1. SSH Access (Port 22)
- **Type:** SSH
- **Protocol:** TCP  
- **Port:** 22
- **Source:** Your IP / 0.0.0.0/0 (for global access)
- **Description:** SSH access for deployment and management

### 2. Application Access (Port 8080)
- **Type:** Custom TCP
- **Protocol:** TCP
- **Port:** 8080  
- **Source:** 0.0.0.0/0 (for public access)
- **Description:** EduGrowHub Spring Boot Application

### 3. HTTPS (Port 443) - Optional for future SSL setup
- **Type:** HTTPS
- **Protocol:** TCP
- **Port:** 443
- **Source:** 0.0.0.0/0
- **Description:** HTTPS access (when SSL is configured)

### 4. HTTP (Port 80) - Optional for redirect to HTTPS
- **Type:** HTTP  
- **Protocol:** TCP
- **Port:** 80
- **Source:** 0.0.0.0/0
- **Description:** HTTP redirect to HTTPS

## AWS CLI Commands to Configure Security Group

```bash
# Get your security group ID
aws ec2 describe-instances --instance-ids i-your-instance-id --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId'

# Add rule for port 8080 (replace sg-xxxxxxxxx with your security group ID)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0 \
    --tag-specifications 'ResourceType=security-group-rule,Tags=[{Key=Name,Value=EduGrowHub-App-Port}]'
```

## AWS Console Steps

1. **Go to EC2 Console** → Instances
2. **Select your instance** → Security tab
3. **Click on Security Group** link
4. **Edit inbound rules** → Add rule
5. **Add Custom TCP rule:**
   - Port: 8080
   - Source: 0.0.0.0/0
   - Description: EduGrowHub Application
6. **Save rules**

## Testing Connectivity

After configuring security groups, test:

```bash
# Test if port is open (from your local machine)
telnet ec2-43-204-98-186.ap-south-1.compute.amazonaws.com 8080

# Test HTTP endpoint
curl http://ec2-43-204-98-186.ap-south-1.compute.amazonaws.com:8080/actuator/health

# Check from inside EC2
ssh -i edugrowhub-key.pem ubuntu@ec2-43-204-98-186.ap-south-1.compute.amazonaws.com
curl http://localhost:8080/actuator/health
```

## Troubleshooting

1. **Connection timeout:** Check security group rules
2. **Connection refused:** Check if application is running on EC2
3. **502/503 errors:** Check application logs for startup issues
4. **Database errors:** Verify RDS security group allows connections from EC2
