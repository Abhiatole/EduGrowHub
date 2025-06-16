package com.edugrowhub.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin123";
        String encodedPassword = encoder.encode(password);
        System.out.println("Encoded password: " + encodedPassword);
        
        // Test if it matches
        boolean matches = encoder.matches(password, encodedPassword);
        System.out.println("Password matches: " + matches);
    }
}
