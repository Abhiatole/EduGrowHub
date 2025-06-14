package com.edugrowhub.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration for EduGrowHub Application
 * 
 * This configuration handles Cross-Origin Resource Sharing (CORS) settings
 * for the EduGrowHub application, allowing controlled access from the frontend
 * applications while maintaining security in production.
 * 
 * Features:
 * - Environment-specific allowed origins
 * - Configurable allowed methods and headers
 * - Credentials support for JWT tokens
 * - Preflight request handling
 * 
 * Security Considerations:
 * - Production origins should be explicitly configured
 * - Avoid using wildcard (*) in production
 * - Credentials are only allowed for specific origins
 * 
 * @author EduGrowHub Development Team
 * @version 1.0.0
 */
@Configuration
@Slf4j
public class CorsConfig {

    @Value("${cors.allowed.origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${cors.allowed.methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${cors.allowed.headers:Authorization,Content-Type,Accept,Origin,X-Requested-With}")
    private String allowedHeaders;

    @Value("${cors.allow.credentials:true}")
    private boolean allowCredentials;

    @Value("${cors.max.age:3600}")
    private long maxAge;

    /**
     * Configure CORS for the application
     * 
     * @return CorsConfigurationSource with appropriate settings
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS with allowed origins: {}", allowedOrigins);
        
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOriginPatterns(origins);
        
        // Set allowed methods
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // Set allowed headers
        List<String> headers = Arrays.asList(allowedHeaders.split(","));
        configuration.setAllowedHeaders(headers);
        
        // Configure credentials
        configuration.setAllowCredentials(allowCredentials);
        
        // Set max age for preflight requests
        configuration.setMaxAge(maxAge);
        
        // Expose common headers that might be needed by the frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition",
            "X-Total-Count"
        ));

        // Apply configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        log.info("CORS configuration applied successfully");
        return source;
    }
}
