package com.edugrowhub.controller;

import com.edugrowhub.entity.User;
import com.edugrowhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherDashboardController {

    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getTeacherDashboard() {
        try {
            // Get authenticated user from SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
            }
            
            String email = authentication.getName();
            
            // Find user in database
            Optional<User> userOptional = userRepository.findByEmail(email);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
            }
            
            User teacher = userOptional.get();
            
            // Double-check user is a teacher (additional security layer)
            if (!teacher.getRole().name().equals("TEACHER")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Teacher access required.");
            }
            
            // Build dashboard response
            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("teacherName", teacher.getName());
            dashboardData.put("email", teacher.getEmail());
            dashboardData.put("role", teacher.getRole().name());
            dashboardData.put("userId", teacher.getId());
            
            // TODO: Add enrolled students list when Student entity is created
            // For now, return empty list as placeholder
            dashboardData.put("enrolledStudents", new java.util.ArrayList<>());
            dashboardData.put("totalStudents", 0);
            
            // Additional dashboard info
            dashboardData.put("loginTime", java.time.LocalDateTime.now());
            dashboardData.put("dashboardVersion", "1.0");
            
            return ResponseEntity.ok(dashboardData);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to load dashboard: " + e.getMessage());
        }
    }
}
