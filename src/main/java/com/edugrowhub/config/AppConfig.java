package com.edugrowhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Application Configuration
 * 
 * Provides beans for common dependencies like RestTemplate
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate bean for making HTTP requests
     * Used by services like WhatsAppNotificationService
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
