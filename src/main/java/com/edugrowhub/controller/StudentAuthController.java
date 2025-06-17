package com.edugrowhub.controller;

import com.edugrowhub.config.JwtUtil;
import com.edugrowhub.entity.Student;
import com.edugrowhub.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Student Authentication Controller
 * 
 * This controller handles student authentication operations including:
 * - Student login with email and password
 * - JWT token generation for authenticated students
 * - Student profile access and basic information retrieval
 * 
 * Security Features:
 * - Password encryption using BCrypt
 * - JWT token generation with expiration
 * - Input validation and sanitization
 * - Secure error handling without information leakage
 * 
 * Endpoints:
 * - POST /api/student/login - Student login
 * - GET /api/student/profile - Get student profile (requires JWT)
 * 
 * @author EduGrowHub Development Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StudentAuthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Student Login Endpoint
     * 
     * Authenticates a student using email and password, then returns a JWT token
     * upon successful authentication. The token can be used for subsequent 
     * authenticated requests.
     * 
     * @param loginRequest Map containing email and password
     * @return ResponseEntity with JWT token and student information or error message
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginStudent(@RequestBody Map<String, String> loginRequest) {
        
        try {
            // Extract and validate input parameters
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // Input validation
            if (email == null || email.trim().isEmpty()) {
                log.warn("Student login attempt with empty email");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Email is required"));
            }

            if (password == null || password.trim().isEmpty()) {
                log.warn("Student login attempt with empty password for email: {}", 
                        maskEmail(email));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Password is required"));
            }

            // Sanitize email input
            email = email.trim().toLowerCase();

            log.info("Student login attempt for email: {}", maskEmail(email));

            // Find student by email
            Optional<Student> studentOptional = studentRepository.findByEmail(email);

            if (studentOptional.isEmpty()) {
                log.warn("Student login failed: Student not found for email: {}", maskEmail(email));
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid email or password"));
            }

            Student student = studentOptional.get();

            // Check if student has a password set
            if (student.getPassword() == null || student.getPassword().trim().isEmpty()) {
                log.warn("Student login failed: No password set for student ID: {}", student.getId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Account not activated. Please contact your teacher."));
            }

            // Verify password
            if (!passwordEncoder.matches(password, student.getPassword())) {
                log.warn("Student login failed: Invalid password for email: {}", maskEmail(email));
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid email or password"));
            }            // Generate JWT token
            String token = jwtUtil.generateToken(student.getEmail());

            log.info("Student login successful for email: {}, ID: {}", 
                    maskEmail(email), student.getId());

            // Build success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", jwtUtil.getExpirationTime());
            
            // Student information (excluding sensitive data)
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", student.getId());
            studentInfo.put("name", student.getName());
            studentInfo.put("email", student.getEmail());
            studentInfo.put("enrolledDate", student.getEnrolledDate());
            studentInfo.put("teacherName", student.getTeacher().getName());
            
            response.put("student", studentInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error during student login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Login failed. Please try again later."));
        }
    }

    /**
     * Get Student Profile Endpoint
     * 
     * Returns the profile information of the authenticated student.
     * This endpoint requires a valid JWT token in the Authorization header.
     * 
     * @return ResponseEntity with student profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getStudentProfile() {
        
        try {
            // Get authenticated student email from JWT token
            // This will be handled by the JWT filter and SecurityContext
            String studentEmail = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            if (studentEmail == null || studentEmail.equals("anonymousUser")) {
                log.warn("Unauthorized access attempt to student profile");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }

            // Find student by email
            Optional<Student> studentOptional = studentRepository.findByEmail(studentEmail);

            if (studentOptional.isEmpty()) {
                log.warn("Student profile access failed: Student not found for email: {}", 
                        maskEmail(studentEmail));
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Student profile not found"));
            }

            Student student = studentOptional.get();

            log.info("Student profile accessed by: {}, ID: {}", 
                    maskEmail(studentEmail), student.getId());

            // Build profile response
            Map<String, Object> response = new HashMap<>();
            response.put("id", student.getId());
            response.put("name", student.getName());
            response.put("email", student.getEmail());
            response.put("phoneNumber", student.getPhoneNumber());
            response.put("enrolledDate", student.getEnrolledDate());
            
            // Teacher information
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", student.getTeacher().getId());
            teacherInfo.put("name", student.getTeacher().getName());
            teacherInfo.put("email", student.getTeacher().getEmail());
            
            response.put("teacher", teacherInfo);

            // Test results count
            response.put("totalTestResults", student.getTestResults().size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving student profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve profile. Please try again later."));
        }
    }

    /**
     * Change Student Password Endpoint
     * 
     * Allows authenticated students to change their password.
     * 
     * @param passwordRequest Map containing current password and new password
     * @return ResponseEntity with success message or error
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordRequest) {
        
        try {
            // Get authenticated student email
            String studentEmail = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            if (studentEmail == null || studentEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }

            // Extract and validate input
            String currentPassword = passwordRequest.get("currentPassword");
            String newPassword = passwordRequest.get("newPassword");

            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Current password is required"));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("New password is required"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("New password must be at least 6 characters long"));
            }

            // Find student
            Optional<Student> studentOptional = studentRepository.findByEmail(studentEmail);
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Student not found"));
            }

            Student student = studentOptional.get();

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
                log.warn("Password change failed: Invalid current password for student ID: {}", 
                        student.getId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Current password is incorrect"));
            }

            // Update password
            student.setPassword(passwordEncoder.encode(newPassword));
            studentRepository.save(student);

            log.info("Password changed successfully for student ID: {}", student.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error changing student password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to change password. Please try again later."));
        }
    }

    /**
     * Get Student Test Results
     * 
     * Returns all test results for the authenticated student.
     * 
     * @return ResponseEntity with test results list
     */
    @GetMapping("/test-results")
    public ResponseEntity<?> getTestResults() {
        
        try {
            // Get authenticated student email
            String studentEmail = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            if (studentEmail == null || studentEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }

            // Find student
            Optional<Student> studentOptional = studentRepository.findByEmail(studentEmail);
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Student not found"));
            }

            Student student = studentOptional.get();

            // Build test results response
            Map<String, Object> response = new HashMap<>();
            response.put("studentId", student.getId());
            response.put("studentName", student.getName());
            response.put("totalResults", student.getTestResults().size());
            response.put("testResults", student.getTestResults().stream()
                .map(testResult -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", testResult.getId());
                    result.put("subject", testResult.getSubject());
                    result.put("score", testResult.getScore());
                    result.put("maxScore", testResult.getMaxScore());
                    result.put("percentage", testResult.getPercentage());
                    result.put("grade", testResult.getGrade());
                    result.put("passed", testResult.isPassed());
                    result.put("testDate", testResult.getTestDate());
                    return result;
                })
                .toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving student test results: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve test results. Please try again later."));
        }
    }

    /**
     * Student Registration Endpoint
     * 
     * Allows students to register for an account by providing their basic information.
     * The student will be created without a password initially and will need to be
     * activated by a teacher.
     * 
     * @param registrationRequest Map containing student registration data
     * @return ResponseEntity with success message or error
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, String> registrationRequest) {
        try {
            // Extract and validate input parameters
            String name = registrationRequest.get("name");
            String email = registrationRequest.get("email");
            String teacherCode = registrationRequest.get("teacherCode");

            // Input validation
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Name is required"));
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Email is required"));
            }

            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid email format"));
            }

            // Sanitize inputs
            name = name.trim();
            email = email.trim().toLowerCase();
            teacherCode = teacherCode != null ? teacherCode.trim() : null;

            log.info("Student registration attempt for email: {}", maskEmail(email));

            // Check if student already exists
            Optional<Student> existingStudent = studentRepository.findByEmail(email);
            if (existingStudent.isPresent()) {
                log.warn("Student registration failed: Email already exists: {}", maskEmail(email));
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("Email already registered"));
            }

            // Create new student
            Student student = new Student();
            student.setName(name);
            student.setEmail(email);
            student.setEnrolledDate(java.time.LocalDateTime.now());
            // Password will be set by teacher during activation
            student.setPassword(null);

            // Save student
            Student savedStudent = studentRepository.save(student);

            log.info("Student registration successful for email: {}, ID: {}", 
                    maskEmail(email), savedStudent.getId());

            // Build success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful. Please contact your teacher for account activation.");
            response.put("studentId", savedStudent.getId());
            response.put("email", savedStudent.getEmail());
            response.put("name", savedStudent.getName());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error during student registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Registration failed. Please try again later."));
        }
    }

    /**
     * Create a standardized error response
     * 
     * @param message Error message
     * @return Map containing error details
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", true);
        error.put("message", message);
        error.put("timestamp", java.time.LocalDateTime.now());
        return error;
    }

    /**
     * Mask email for secure logging
     * 
     * @param email Email address to mask
     * @return Masked email address
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        
        String[] parts = email.split("@");
        String localPart = parts[0];
        String domain = parts[1];
        
        if (localPart.length() <= 3) {
            return "***@" + domain;
        }
        
        return localPart.substring(0, 2) + "***" + localPart.substring(localPart.length() - 1) + "@" + domain;
    }
}
