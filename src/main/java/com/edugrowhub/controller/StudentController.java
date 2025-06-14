package com.edugrowhub.controller;

import com.edugrowhub.entity.Role;
import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.User;
import com.edugrowhub.repository.StudentRepository;
import com.edugrowhub.repository.UserRepository;
import com.edugrowhub.service.WhatsAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final WhatsAppNotificationService whatsAppNotificationService;

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, String> studentRequest) {
        try {
            // Get authenticated teacher
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
            }
            
            String teacherEmail = authentication.getName();
            
            // Find teacher in database
            Optional<User> teacherOptional = userRepository.findByEmail(teacherEmail);
            
            if (teacherOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Teacher not found");
            }
            
            User teacher = teacherOptional.get();
            
            // Verify user is a teacher
            if (teacher.getRole() != Role.TEACHER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Teacher access required.");
            }
            
            // Extract and validate student data
            String name = studentRequest.get("name");
            String email = studentRequest.get("email");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Student name is required");
            }
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Student email is required");
            }
            
            // Validate email format (basic validation)
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid email format");
            }
            
            // Check if student email already exists
            if (studentRepository.existsByEmail(email.trim())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student with this email already exists");
            }
              // Create new student
            Student student = new Student(
                name.trim(),
                email.trim().toLowerCase(),
                null, // phoneNumber - will be updated later if provided
                LocalDateTime.now(),
                teacher
            );
            
            // Save student
            Student savedStudent = studentRepository.save(student);            // Send WhatsApp notification to teacher (optional)
            try {
                whatsAppNotificationService.notifyTeacherEnrollment(
                    teacher.getPhoneNumber(), 
                    teacher.getName(), 
                    savedStudent.getName(), 
                    savedStudent.getEmail()
                );
            } catch (Exception e) {
                // Log notification failure but don't fail the student creation
                System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
            }
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedStudent.getId());
            response.put("name", savedStudent.getName());
            response.put("email", savedStudent.getEmail());
            response.put("enrolledDate", savedStudent.getEnrolledDate());
            response.put("teacherName", teacher.getName());
            response.put("message", "Student enrolled successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to create student: " + e.getMessage());
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getTeacherStudents() {
        try {
            // Get authenticated teacher
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required");
            }
            
            String teacherEmail = authentication.getName();
            
            // Find teacher in database
            Optional<User> teacherOptional = userRepository.findByEmail(teacherEmail);
            
            if (teacherOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Teacher not found");
            }
            
            User teacher = teacherOptional.get();
            
            // Verify user is a teacher
            if (teacher.getRole() != Role.TEACHER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Teacher access required.");
            }
            
            // Get all students for this teacher
            List<Student> students = studentRepository.findByTeacher(teacher);
            
            // Build response with student details
            Map<String, Object> response = new HashMap<>();
            response.put("teacherName", teacher.getName());
            response.put("teacherEmail", teacher.getEmail());
            response.put("totalStudents", students.size());
            
            // Transform students to response format (avoid circular reference)
            List<Map<String, Object>> studentList = students.stream()
                .map(student -> {
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("id", student.getId());
                    studentData.put("name", student.getName());
                    studentData.put("email", student.getEmail());
                    studentData.put("enrolledDate", student.getEnrolledDate());
                    return studentData;
                })
                .toList();
            
            response.put("students", studentList);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve students: " + e.getMessage());
        }
    }
}
