# 🔧 EduGrowHub - Environment Setup & Alternative Build Guide

## 🚨 Current Environment Analysis

### ✅ **Working Components**
- **Java**: Version 24 (installed and working)
- **Project Structure**: Spring Boot application with proper pom.xml
- **Configuration**: Environment files properly configured

### ⚠️ **Issues Detected**
- **Maven**: Conflicting Python wrapper (needs resolution)
- **MySQL**: Not installed locally
- **Java Version**: Project expects Java 17, you have Java 24

## 🛠️ **Quick Solutions**

### **Option A: Install Proper Tools (Recommended)**

#### 1. Install Maven
```powershell
# Download and install Maven from official site
# Visit: https://maven.apache.org/download.cgi
# Or use Chocolatey (if installed):
choco install maven

# Or use Scoop (if installed):
scoop install maven
```

#### 2. Install MySQL (for local testing)
```powershell
# Download MySQL from: https://dev.mysql.com/downloads/installer/
# Or use Chocolatey:
choco install mysql

# Or use Docker (if Docker is installed):
docker run --name mysql-local -e MYSQL_ROOT_PASSWORD=root123 -p 3306:3306 -d mysql:8.0
```

### **Option B: Alternative Build Methods**

#### Method 1: Use Gradle Wrapper (if available)
```powershell
# Check if Gradle wrapper exists
Get-ChildItem "gradlew*"

# If exists, build with Gradle
.\gradlew build
```

#### Method 2: Manual Java Compilation (Advanced)
```powershell
# Create a temporary build script
# This would require manually resolving dependencies
```

#### Method 3: Use IDE Build
- Open project in IntelliJ IDEA or Eclipse
- Let the IDE download dependencies and build
- Export JAR from IDE

### **Option C: Skip Local Testing, Go Directly to AWS**

Since AWS EC2 will have proper Maven and MySQL via RDS, you can:

1. **Package existing code** (if JAR exists in target/)
2. **Deploy directly to EC2** where Maven will work properly
3. **Test on AWS environment**

## 🎯 **Recommended Next Steps**

### **Immediate Action Plan:**

#### **Step 1: Check for Existing JAR**
```powershell
Get-ChildItem "e:\EduGrowHub\target" -Filter "*.jar" -Recurse
```

#### **Step 2A: If JAR exists - Deploy to AWS**
```powershell
# Use the deployment script directly
.\deploy-ec2.ps1 -EC2Host "your-ec2-ip" -KeyFile "your-key.pem"
```

#### **Step 2B: If no JAR - Fix Maven First**
```powershell
# Remove Python Maven wrapper
pip uninstall maven

# Install proper Maven from:
# https://maven.apache.org/download.cgi
# Extract to C:\apache-maven-3.9.8
# Add C:\apache-maven-3.9.8\bin to PATH

# Verify installation
mvn --version
```

### **Step 3: Java Version Compatibility**
The project expects Java 17, but you have Java 24. This might work, but for compatibility:

```powershell
# Option 1: Install Java 17 alongside Java 24
# Download from: https://adoptopenjdk.net/
# Set JAVA_HOME for the project

# Option 2: Update pom.xml to use Java 24
# Change <java.version>17</java.version> to <java.version>24</java.version>
```

## 🚀 **Fast Track to AWS Deployment**

If you want to proceed quickly to AWS (recommended):

### **Prerequisites for AWS Deployment:**
1. **AWS Account** with EC2 and RDS access
2. **EC2 Key Pair** (.pem file)
3. **RDS MySQL Instance** (already configured in your .env.prod)

### **AWS Infrastructure Setup:**

#### **1. Create EC2 Instance**
```bash
# Via AWS Console:
# - AMI: Amazon Linux 2
# - Instance Type: t3.micro or t3.small
# - Security Group: Allow SSH (22), HTTP (8080)
# - Key Pair: Download .pem file
```

#### **2. Configure Security Groups**
```bash
# EC2 Security Group:
# - SSH (22): Your IP
# - Custom TCP (8080): 0.0.0.0/0

# RDS Security Group:  
# - MySQL (3306): EC2 Security Group
```

#### **3. Deploy Application**
```powershell
# Run deployment script
.\deploy-ec2.ps1 -EC2Host "your-ec2-public-ip" -KeyFile "path\to\your-key.pem"
```

This script will:
- Install Java 17 on EC2
- Install Maven on EC2  
- Copy your source code
- Build the application on EC2
- Create systemd service
- Start the application

## 🔍 **Troubleshooting Current Issues**

### **Fix Maven Conflict**
```powershell
# 1. Check what's installed
pip list | findstr maven

# 2. Remove Python Maven
pip uninstall maven

# 3. Clear Python scripts path from PATH if needed
# Edit Environment Variables → PATH → Remove Python Scripts path temporarily

# 4. Install real Maven
# Download from Apache Maven website
# Extract to C:\apache-maven-3.9.8\
# Add C:\apache-maven-3.9.8\bin to PATH

# 5. Verify
mvn --version
```

### **Alternative: Use Maven via Docker**
```powershell
# If you have Docker installed
docker run -it --rm -v "${PWD}:/app" -w /app maven:3.9.8-eclipse-temurin-17 mvn clean package
```

## 📋 **Decision Matrix**

| Option | Time | Complexity | Risk |
|--------|------|------------|------|
| Fix Maven locally | 30 mins | Medium | Low |
| Install MySQL locally | 20 mins | Low | Low |
| Deploy directly to AWS | 45 mins | Low | Medium |
| Use Docker for build | 15 mins | Medium | Low |

## 🎯 **My Recommendation**

**Go with AWS deployment directly** because:

1. ✅ Your environment files are already configured for AWS
2. ✅ EC2 will have proper Java/Maven/MySQL setup
3. ✅ You can test the full production environment
4. ✅ Faster path to working application
5. ✅ All deployment scripts are ready

**Next command to run:**
```powershell
# Set up AWS infrastructure first, then:
.\deploy-ec2.ps1 -EC2Host "YOUR_EC2_IP" -KeyFile "path\to\your-key.pem"
```

Would you like me to guide you through the AWS setup, or would you prefer to fix the local Maven issue first?
