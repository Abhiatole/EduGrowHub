#!/bin/bash

# EduGrowHub API Testing Script
# This script tests the main API endpoints of the EduGrowHub application

BASE_URL="http://localhost:8080"
TEMP_FILE="/tmp/edugrowhub_response.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Function to make API call and check response
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    print_color $BLUE "Testing: $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "$headers")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    # Extract status code
    status_code=$(echo $response | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo $response | sed 's/HTTPSTATUS:[0-9]*$//')
    
    # Pretty print JSON response
    echo "$body" | python3 -m json.tool > $TEMP_FILE 2>/dev/null || echo "$body" > $TEMP_FILE
    
    if [ $status_code -ge 200 ] && [ $status_code -lt 300 ]; then
        print_color $GREEN "  ✅ SUCCESS (Status: $status_code)"
    else
        print_color $RED "  ❌ FAILED (Status: $status_code)"
    fi
    
    echo "  Response:"
    cat $TEMP_FILE | head -20
    echo ""
    echo "----------------------------------------"
    
    # Return extracted token for authentication endpoints
    if [[ "$endpoint" == *"/login" ]]; then
        token=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null)
        echo "$token"
    fi
}

print_color $YELLOW "🚀 Starting EduGrowHub API Testing"
echo "Base URL: $BASE_URL"
echo "========================================"

# Test 1: Superadmin Login
print_color $YELLOW "📋 Testing Authentication"
superadmin_token=$(test_api "POST" "/api/superadmin/login" \
    '{"email": "admin@edugrowhub.com", "password": "password123"}' \
    "" \
    "Superadmin Login")

# Test 2: Teacher Login
teacher_token=$(test_api "POST" "/api/teacher/login" \
    '{"email": "teacher@example.com", "password": "password123"}' \
    "" \
    "Teacher Login")

# Test 3: Student Login
student_token=$(test_api "POST" "/api/student/login" \
    '{"email": "student@example.com", "password": "password123"}' \
    "" \
    "Student Login")

# Only continue if we have valid tokens
if [ -n "$teacher_token" ] && [ "$teacher_token" != "null" ]; then
    print_color $YELLOW "📚 Testing Teacher Operations"
    
    # Test 4: Teacher Dashboard
    test_api "GET" "/api/teacher/dashboard" \
        "" \
        "Authorization: Bearer $teacher_token" \
        "Get Teacher Dashboard"
    
    # Test 5: Get Teacher's Students
    test_api "GET" "/api/teacher/students" \
        "" \
        "Authorization: Bearer $teacher_token" \
        "Get Teacher's Students"
    
    # Test 6: Add Student Marks
    test_api "POST" "/api/teacher/students/1/marks" \
        '{"subject": "Mathematics", "score": 85, "maxScore": 100, "testDate": "2025-06-15"}' \
        "Authorization: Bearer $teacher_token" \
        "Add Student Marks - Mathematics"
    
    # Test 7: Add More Marks
    test_api "POST" "/api/teacher/students/1/marks" \
        '{"subject": "Science", "score": 92, "maxScore": 100, "testDate": "2025-06-14"}' \
        "Authorization: Bearer $teacher_token" \
        "Add Student Marks - Science"
    
    test_api "POST" "/api/teacher/students/1/marks" \
        '{"subject": "English", "score": 78, "maxScore": 100, "testDate": "2025-06-13"}' \
        "Authorization: Bearer $teacher_token" \
        "Add Student Marks - English"
    
    # Test 8: Get Student Marks
    test_api "GET" "/api/teacher/students/1/marks" \
        "" \
        "Authorization: Bearer $teacher_token" \
        "Get Student Marks"
    
    # Test 9: Get Student Report
    test_api "GET" "/api/teacher/students/1/report" \
        "" \
        "Authorization: Bearer $teacher_token" \
        "Get Student Report"
fi

if [ -n "$student_token" ] && [ "$student_token" != "null" ]; then
    print_color $YELLOW "👨‍🎓 Testing Student Operations"
    
    # Test 10: Student Profile
    test_api "GET" "/api/student/profile" \
        "" \
        "Authorization: Bearer $student_token" \
        "Get Student Profile"
    
    # Test 11: Student Test Results
    test_api "GET" "/api/student/test-results" \
        "" \
        "Authorization: Bearer $student_token" \
        "Get Student Test Results"
fi

print_color $YELLOW "🏁 API Testing Complete!"
echo "Check the output above for any failed tests."

# Cleanup
rm -f $TEMP_FILE
