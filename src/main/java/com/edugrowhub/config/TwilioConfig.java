package com.edugrowhub.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * Twilio Configuration Class
 * 
 * This configuration class initializes the Twilio SDK with account credentials
 * loaded from application properties. It sets up the Twilio client for 
 * WhatsApp messaging functionality across the application.
 * 
 * Security Note: All sensitive credentials are loaded from environment variables
 * to ensure they are not hardcoded in the application.
 * 
 * @author EduGrowHub Development Team
 * @version 1.0
 */
@Configuration
@Slf4j
public class TwilioConfig {

    /**
     * Twilio Account SID - loaded from environment variable TWILIO_ACCOUNT_SID
     * This identifies your Twilio account
     */
    @Value("${twilio.account.sid}")
    private String accountSid;

    /**
     * Twilio Auth Token - loaded from environment variable TWILIO_AUTH_TOKEN
     * This is your secret authentication token for API calls
     */
    @Value("${twilio.auth.token}")
    private String authToken;

    /**
     * WhatsApp sender number - loaded from environment variable TWILIO_WHATSAPP_FROM
     * This is the Twilio WhatsApp sandbox number or your approved WhatsApp Business number
     */
    @Value("${twilio.whatsapp.from}")
    private String fromWhatsAppNumber;

    /**
     * Initialize Twilio SDK after bean construction
     * 
     * This method is called automatically by Spring after the bean is constructed
     * and all dependencies are injected. It initializes the Twilio SDK with the
     * provided credentials.
     * 
     * @throws RuntimeException if Twilio initialization fails
     */
    @PostConstruct
    public void initTwilio() {
        try {
            // Validate that required configuration values are present
            if (accountSid == null || accountSid.trim().isEmpty()) {
                throw new IllegalArgumentException("Twilio Account SID is not configured");
            }
            
            if (authToken == null || authToken.trim().isEmpty()) {
                throw new IllegalArgumentException("Twilio Auth Token is not configured");
            }
            
            if (fromWhatsAppNumber == null || fromWhatsAppNumber.trim().isEmpty()) {
                throw new IllegalArgumentException("Twilio WhatsApp From number is not configured");
            }

            // Initialize Twilio SDK with credentials
            Twilio.init(accountSid, authToken);
            
            log.info("Twilio SDK initialized successfully");
            log.info("WhatsApp From Number configured: {}", maskPhoneNumber(fromWhatsAppNumber));
            
        } catch (Exception e) {
            log.error("Failed to initialize Twilio SDK: {}", e.getMessage());
            throw new RuntimeException("Twilio initialization failed", e);
        }
    }

    /**
     * Getter for WhatsApp from number
     * 
     * @return The configured WhatsApp sender number
     */
    public String getFromWhatsAppNumber() {
        return fromWhatsAppNumber;
    }

    /**
     * Getter for Twilio Account SID
     * 
     * @return The configured Twilio Account SID
     */
    public String getAccountSid() {
        return accountSid;
    }

    /**
     * Mask phone number for logging purposes
     * Shows only the first 3 and last 2 characters of the phone number
     * 
     * @param phoneNumber The phone number to mask
     * @return Masked phone number for secure logging
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 6) {
            return "***";
        }
        
        String start = phoneNumber.substring(0, 3);
        String end = phoneNumber.substring(phoneNumber.length() - 2);
        String middle = "*".repeat(phoneNumber.length() - 5);
        
        return start + middle + end;
    }
}
