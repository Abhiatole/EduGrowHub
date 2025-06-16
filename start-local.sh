#!/bin/bash

# Load environment variables
export DB_URL=jdbc:mysql://127.0.0.1:3306/edugrowhub
export DB_USERNAME=edugrowhub
export DB_PASSWORD=password123
export SERVER_PORT=8080
export SHOW_SQL=true
export LOG_LEVEL=DEBUG
export JWT_SECRET=mySecretKey12345678901234567890123456789012345678901234567890123456
export JWT_EXPIRATION=3600000
export TWILIO_ACCOUNT_SID=your_sandbox_account_sid
export TWILIO_AUTH_TOKEN=your_sandbox_auth_token
export TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Start the application
SPRING_PROFILES_ACTIVE=local java -jar target/edugrowhub-0.0.1-SNAPSHOT.jar
