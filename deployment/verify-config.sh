#!/bin/bash

# EduGrowHub Configuration Verification Script
# This script helps verify that all environment variables are properly configured

echo "🔍 EduGrowHub Configuration Verification"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=$(eval echo \$$var_name)
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name: NOT SET${NC}"
        return 1
    elif [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"REPLACE_"* ]]; then
        echo -e "${YELLOW}⚠️  $var_name: PLACEHOLDER (needs actual value)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name: CONFIGURED${NC}"
        return 0
    fi
}

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "📂 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo
fi

echo "🗄️  Database Configuration"
echo "------------------------"
check_var "DB_URL"
check_var "DB_USERNAME"
check_var "DB_PASSWORD"
echo

echo "🔐 Security Configuration"
echo "------------------------"
check_var "JWT_SECRET"
check_var "JWT_EXPIRATION"
echo

echo "📱 Twilio Configuration"
echo "----------------------"
check_var "TWILIO_ACCOUNT_SID"
check_var "TWILIO_AUTH_TOKEN"
check_var "TWILIO_WHATSAPP_FROM"
echo

echo "🌐 CORS Configuration"
echo "--------------------"
check_var "CORS_ALLOWED_ORIGINS"
check_var "CORS_ALLOWED_METHODS"
echo

echo "📧 Email Configuration (Optional)"
echo "--------------------------------"
check_var "SMTP_HOST"
check_var "SMTP_USERNAME"
check_var "SMTP_PASSWORD"
echo

echo "☁️  AWS Configuration (Optional)"
echo "------------------------------"
check_var "AWS_REGION"
check_var "AWS_ACCESS_KEY_ID"
check_var "AWS_SECRET_ACCESS_KEY"
echo

echo "🔄 Cache Configuration (Optional)"
echo "--------------------------------"
check_var "REDIS_HOST"
check_var "REDIS_PORT"
echo

# Check frontend configuration if frontend directory exists
if [ -d "frontend" ]; then
    echo "⚛️  Frontend Configuration"
    echo "-------------------------"
    
    # Check if frontend .env exists
    if [ -f "frontend/.env" ]; then
        echo "📂 Loading frontend environment variables..."
        export $(cat frontend/.env | grep -v '^#' | xargs)
        
        check_var "REACT_APP_API_URL"
        check_var "REACT_APP_NAME"
        check_var "REACT_APP_ENVIRONMENT"
        check_var "REACT_APP_JWT_STORAGE_KEY"
    else
        echo -e "${RED}❌ frontend/.env file not found${NC}"
    fi
    echo
fi

echo "🧪 Security Checks"
echo "=================="

# Check for weak JWT secret
if [[ "$JWT_SECRET" == *"mySecretKey"* ]] || [[ "$JWT_SECRET" == *"REPLACE_"* ]]; then
    echo -e "${RED}❌ JWT_SECRET appears to be weak or default${NC}"
    echo "   Generate a strong secret with: openssl rand -hex 32"
else
    echo -e "${GREEN}✅ JWT_SECRET appears to be configured${NC}"
fi

# Check for localhost in production URLs
if [[ "$CORS_ALLOWED_ORIGINS" == *"localhost"* ]] && [[ "$SPRING_PROFILES_ACTIVE" == "production" ]]; then
    echo -e "${YELLOW}⚠️  CORS_ALLOWED_ORIGINS contains localhost in production${NC}"
fi

# Check database URL
if [[ "$DB_URL" == *"localhost"* ]] && [[ "$SPRING_PROFILES_ACTIVE" == "production" ]]; then
    echo -e "${YELLOW}⚠️  DB_URL points to localhost in production${NC}"
fi

echo
echo "📋 Recommendations"
echo "=================="
echo "1. Replace all placeholder values with actual credentials"
echo "2. Generate a secure JWT secret: openssl rand -hex 32"
echo "3. Use environment-specific database URLs"
echo "4. Consider using a secrets management service for production"
echo "5. Never commit .env files with real credentials"
echo
echo "✅ Configuration verification complete!"
echo "   Review any warnings above before deploying to production."
