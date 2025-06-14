#!/bin/bash

# EduGrowHub Project Validation Script
# This script validates that all components are properly configured

echo "🔍 EduGrowHub Project Validation"
echo "================================="

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "❌ Error: pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

echo "✅ Project structure validated"

# Check critical files
files_to_check=(
    "src/main/java/com/edugrowhub/config/TwilioConfig.java"
    "src/main/java/com/edugrowhub/config/SecurityConfig.java"
    "src/main/java/com/edugrowhub/config/JwtUtil.java"
    "src/main/java/com/edugrowhub/entity/Student.java"
    "src/main/java/com/edugrowhub/entity/WhatsAppLog.java"
    "src/main/java/com/edugrowhub/service/WhatsAppService.java"
    "src/main/java/com/edugrowhub/controller/StudentAuthController.java"
    "src/main/java/com/edugrowhub/controller/TestResultController.java"
    "src/main/resources/application.properties"
    ".env"
)

echo ""
echo "📁 Checking critical files..."
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Missing!"
    fi
done

# Check pom.xml for required dependencies
echo ""
echo "📦 Checking Maven dependencies..."

dependencies_to_check=(
    "spring-boot-starter-web"
    "spring-boot-starter-data-jpa"
    "spring-boot-starter-security"
    "mysql-connector-j"
    "lombok"
    "jjwt-api"
    "twilio"
)

for dep in "${dependencies_to_check[@]}"; do
    if grep -q "$dep" pom.xml; then
        echo "✅ $dep"
    else
        echo "❌ $dep - Missing from pom.xml!"
    fi
done

# Check application.properties for required configurations
echo ""
echo "⚙️  Checking application.properties configuration..."

configs_to_check=(
    "spring.datasource.url"
    "spring.datasource.username"
    "spring.datasource.password"
    "jwt.secret"
    "jwt.expiration"
    "twilio.account.sid"
    "twilio.auth.token"
    "twilio.whatsapp.from"
)

for config in "${configs_to_check[@]}"; do
    if grep -q "$config" src/main/resources/application.properties; then
        echo "✅ $config"
    else
        echo "❌ $config - Missing from application.properties!"
    fi
done

# Check .env file for environment variables
echo ""
echo "🔐 Checking .env file..."

env_vars_to_check=(
    "DB_URL"
    "DB_USERNAME"
    "DB_PASSWORD"
    "JWT_SECRET"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_WHATSAPP_FROM"
)

for var in "${env_vars_to_check[@]}"; do
    if grep -q "$var" .env; then
        echo "✅ $var"
    else
        echo "❌ $var - Missing from .env!"
    fi
done

# Check for Java source files compilation
echo ""
echo "☕ Checking Java source files..."

java_classes=(
    "TwilioConfig"
    "SecurityConfig"
    "JwtUtil"
    "WhatsAppService"
    "StudentAuthController"
    "TestResultController"
    "Student"
    "WhatsAppLog"
)

for class in "${java_classes[@]}"; do
    if find src -name "*${class}.java" -type f | grep -q .; then
        echo "✅ $class.java"
    else
        echo "❌ $class.java - Not found!"
    fi
done

echo ""
echo "🎯 Validation Summary"
echo "===================="

# Quick check for placeholder values that need to be updated
echo ""
echo "⚠️  Configuration values that need to be updated:"

if grep -q "your_actual_password_here" .env; then
    echo "❌ Update DB_PASSWORD in .env file"
fi

if grep -q "your_actual_auth_token_here" .env; then
    echo "❌ Update TWILIO_AUTH_TOKEN in .env file"
fi

if grep -q "your_super_secret_jwt_key" .env; then
    echo "❌ Update JWT_SECRET in .env file"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Update placeholder values in .env file"
echo "2. Ensure MySQL database 'edugrowhub' exists"
echo "3. Run: mvn clean compile"
echo "4. Run: mvn spring-boot:run"
echo "5. Test API endpoints using API_TESTING.md guide"

echo ""
echo "🎉 Validation complete!"
