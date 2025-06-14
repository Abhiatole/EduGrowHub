package com.edugrowhub.controller;

import com.edugrowhub.entity.Role;
import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.TestResult;
import com.edugrowhub.entity.User;
import com.edugrowhub.entity.WhatsAppLog;
import com.edugrowhub.repository.StudentRepository;
import com.edugrowhub.repository.TestResultRepository;
import com.edugrowhub.repository.UserRepository;
import com.edugrowhub.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@Slf4j
public class TestResultController {

    private final TestResultRepository testResultRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final WhatsAppService whatsAppService;

    @PostMapping("/students/{studentId}/marks")
    public ResponseEntity<?> addTestResult(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> testResultRequest) {
        
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
            
            // Find student by ID
            Optional<Student> studentOptional = studentRepository.findById(studentId);
            
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
            }
            
            Student student = studentOptional.get();
            
            // Check if student belongs to this teacher
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only add marks for your own students.");
            }
            
            // Extract and validate test result data
            String subject = (String) testResultRequest.get("subject");
            Object scoreObj = testResultRequest.get("score");
            Object maxScoreObj = testResultRequest.get("maxScore");
            String testDateStr = (String) testResultRequest.get("testDate");
            
            // Validate required fields
            if (subject == null || subject.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Subject is required");
            }
            
            if (scoreObj == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Score is required");
            }
            
            if (maxScoreObj == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Max score is required");
            }
            
            if (testDateStr == null || testDateStr.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Test date is required");
            }
            
            // Parse and validate numeric values
            Double score;
            Double maxScore;
            LocalDate testDate;
            
            try {
                // Handle different number types (Integer, Double, String)
                if (scoreObj instanceof Number) {
                    score = ((Number) scoreObj).doubleValue();
                } else {
                    score = Double.parseDouble(scoreObj.toString());
                }
                
                if (maxScoreObj instanceof Number) {
                    maxScore = ((Number) maxScoreObj).doubleValue();
                } else {
                    maxScore = Double.parseDouble(maxScoreObj.toString());
                }
                
                testDate = LocalDate.parse(testDateStr);
                
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid number format for score or maxScore");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Use YYYY-MM-DD format");
            }
            
            // Validate score values
            if (score < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Score cannot be negative");
            }
            
            if (maxScore <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Max score must be greater than 0");
            }
            
            if (score > maxScore) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Score cannot be greater than max score");
            }
            
            // Validate test date (not in the future)
            if (testDate.isAfter(LocalDate.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Test date cannot be in the future");
            }
            
            // Create new test result
            TestResult testResult = new TestResult(
                subject.trim(),
                score,
                maxScore,
                testDate,
                student
            );
              // Save test result
            TestResult savedTestResult = testResultRepository.save(testResult);
            
            // Send WhatsApp notification to student (if phone number is available)
            WhatsAppLog whatsAppLog = null;
            try {
                if (student.getPhoneNumber() != null && !student.getPhoneNumber().trim().isEmpty()) {
                    log.info("Sending WhatsApp notification for test result to student ID: {}", student.getId());
                    whatsAppLog = whatsAppService.sendTestResultNotification(
                        student, 
                        teacher, 
                        savedTestResult.getSubject(),
                        savedTestResult.getScore(),
                        savedTestResult.getMaxScore(),
                        savedTestResult.getPercentage(),
                        savedTestResult.getGrade()
                    );
                    log.info("WhatsApp notification sent successfully. Log ID: {}", whatsAppLog.getId());
                } else {
                    log.warn("Cannot send WhatsApp notification: Student ID {} has no phone number", student.getId());
                }
            } catch (Exception whatsAppException) {
                // Log WhatsApp error but don't fail the test result creation
                log.error("Failed to send WhatsApp notification for test result: {}", whatsAppException.getMessage());
            }
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedTestResult.getId());
            response.put("subject", savedTestResult.getSubject());
            response.put("score", savedTestResult.getScore());
            response.put("maxScore", savedTestResult.getMaxScore());
            response.put("testDate", savedTestResult.getTestDate());
            response.put("percentage", savedTestResult.getPercentage());
            response.put("grade", savedTestResult.getGrade());
            response.put("passed", savedTestResult.isPassed());
            response.put("studentName", student.getName());
            response.put("studentEmail", student.getEmail());
            response.put("teacherName", teacher.getName());
            response.put("message", "Test result added successfully");
            
            // Add WhatsApp notification status to response
            if (whatsAppLog != null) {
                Map<String, Object> whatsAppStatus = new HashMap<>();
                whatsAppStatus.put("sent", whatsAppLog.isSuccessful());
                whatsAppStatus.put("status", whatsAppLog.getMessageStatus());
                whatsAppStatus.put("recipientPhone", whatsAppLog.getMaskedRecipientPhone());
                if (whatsAppLog.isFailed()) {
                    whatsAppStatus.put("error", whatsAppLog.getErrorMessage());
                }
                response.put("whatsAppNotification", whatsAppStatus);
            } else {
                response.put("whatsAppNotification", Map.of(
                    "sent", false, 
                    "reason", "No phone number available"
                ));
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to add test result: " + e.getMessage());
        }
    }
    
    @GetMapping("/students/{studentId}/marks")
    public ResponseEntity<?> getStudentMarks(@PathVariable Long studentId) {
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
            
            // Find student by ID
            Optional<Student> studentOptional = studentRepository.findById(studentId);
            
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
            }
            
            Student student = studentOptional.get();
            
            // Check if student belongs to this teacher
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only view marks for your own students.");
            }
            
            // Get all test results for the student
            List<TestResult> testResults = testResultRepository.findByStudentIdOrderByTestDateDesc(studentId);
            
            // Transform test results to response format
            List<Map<String, Object>> marksData = testResults.stream()
                .map(testResult -> {
                    Map<String, Object> markData = new HashMap<>();
                    markData.put("id", testResult.getId());
                    markData.put("subject", testResult.getSubject());
                    markData.put("score", testResult.getScore());
                    markData.put("maxScore", testResult.getMaxScore());
                    markData.put("testDate", testResult.getTestDate());
                    markData.put("percentage", testResult.getPercentage());
                    markData.put("grade", testResult.getGrade());
                    markData.put("passed", testResult.isPassed());
                    return markData;
                })
                .toList();
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("studentId", student.getId());
            response.put("studentName", student.getName());
            response.put("studentEmail", student.getEmail());
            response.put("teacherName", teacher.getName());
            response.put("totalMarks", marksData.size());
            response.put("marks", marksData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve student marks: " + e.getMessage());
        }
    }
    
    @GetMapping("/students/{studentId}/report")
    public ResponseEntity<?> getStudentReport(@PathVariable Long studentId) {
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
            
            // Find student by ID
            Optional<Student> studentOptional = studentRepository.findById(studentId);
            
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
            }
            
            Student student = studentOptional.get();
            
            // Check if student belongs to this teacher
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only view reports for your own students.");
            }
            
            // Get all test results for the student
            List<TestResult> testResults = testResultRepository.findByStudentId(studentId);
            
            if (testResults.isEmpty()) {
                // Return empty report if no test results
                Map<String, Object> emptyReport = new HashMap<>();
                emptyReport.put("studentId", student.getId());
                emptyReport.put("studentName", student.getName());
                emptyReport.put("studentEmail", student.getEmail());
                emptyReport.put("teacherName", teacher.getName());
                emptyReport.put("totalTests", 0);
                emptyReport.put("averageScore", 0.0);
                emptyReport.put("averagePercentage", 0.0);
                emptyReport.put("failedSubjects", 0);
                emptyReport.put("highestScore", 0.0);
                emptyReport.put("lowestScore", 0.0);
                emptyReport.put("passedTests", 0);
                emptyReport.put("failedTests", 0);
                emptyReport.put("message", "No test results found for this student");
                
                return ResponseEntity.ok(emptyReport);
            }
            
            // Calculate report statistics
            int totalTests = testResults.size();
            
            // Calculate average score
            double totalScore = testResults.stream()
                .mapToDouble(TestResult::getScore)
                .sum();
            double averageScore = totalScore / totalTests;
            
            // Calculate average percentage
            double totalPercentage = testResults.stream()
                .mapToDouble(TestResult::getPercentage)
                .sum();
            double averagePercentage = totalPercentage / totalTests;
            
            // Count failed subjects (percentage < 35%)
            long failedSubjects = testResults.stream()
                .filter(testResult -> testResult.getPercentage() < 35.0)
                .count();
            
            // Find highest and lowest scores
            double highestScore = testResults.stream()
                .mapToDouble(TestResult::getScore)
                .max()
                .orElse(0.0);
            
            double lowestScore = testResults.stream()
                .mapToDouble(TestResult::getScore)
                .min()
                .orElse(0.0);
            
            // Count passed and failed tests (using 60% threshold)
            long passedTests = testResults.stream()
                .filter(TestResult::isPassed)
                .count();
            
            long failedTests = totalTests - passedTests;
            
            // Get best and worst performing subjects
            TestResult bestTest = testResults.stream()
                .max((t1, t2) -> Double.compare(t1.getPercentage(), t2.getPercentage()))
                .orElse(null);
            
            TestResult worstTest = testResults.stream()
                .min((t1, t2) -> Double.compare(t1.getPercentage(), t2.getPercentage()))
                .orElse(null);
            
            // Build subject-wise performance
            Map<String, List<TestResult>> subjectWiseResults = testResults.stream()
                .collect(java.util.stream.Collectors.groupingBy(TestResult::getSubject));
            
            List<Map<String, Object>> subjectPerformance = subjectWiseResults.entrySet().stream()
                .map(entry -> {
                    String subject = entry.getKey();
                    List<TestResult> subjectTests = entry.getValue();
                    
                    double subjectAvgScore = subjectTests.stream()
                        .mapToDouble(TestResult::getScore)
                        .average()
                        .orElse(0.0);
                    
                    double subjectAvgPercentage = subjectTests.stream()
                        .mapToDouble(TestResult::getPercentage)
                        .average()
                        .orElse(0.0);
                    
                    Map<String, Object> subjectData = new HashMap<>();
                    subjectData.put("subject", subject);
                    subjectData.put("testsCount", subjectTests.size());
                    subjectData.put("averageScore", Math.round(subjectAvgScore * 100.0) / 100.0);
                    subjectData.put("averagePercentage", Math.round(subjectAvgPercentage * 100.0) / 100.0);
                    subjectData.put("grade", getGradeFromPercentage(subjectAvgPercentage));
                    
                    return subjectData;
                })
                .toList();
            
            // Build comprehensive report response
            Map<String, Object> report = new HashMap<>();
            report.put("studentId", student.getId());
            report.put("studentName", student.getName());
            report.put("studentEmail", student.getEmail());
            report.put("enrolledDate", student.getEnrolledDate());
            report.put("teacherName", teacher.getName());
            
            // Overall Statistics
            report.put("totalTests", totalTests);
            report.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
            report.put("averagePercentage", Math.round(averagePercentage * 100.0) / 100.0);
            report.put("overallGrade", getGradeFromPercentage(averagePercentage));
            report.put("failedSubjects", failedSubjects);
            report.put("highestScore", highestScore);
            report.put("lowestScore", lowestScore);
            report.put("passedTests", passedTests);
            report.put("failedTests", failedTests);
            report.put("passRate", Math.round(((double) passedTests / totalTests) * 100.0));
            
            // Best and Worst Performance
            if (bestTest != null) {
                Map<String, Object> bestPerformance = new HashMap<>();
                bestPerformance.put("subject", bestTest.getSubject());
                bestPerformance.put("score", bestTest.getScore());
                bestPerformance.put("maxScore", bestTest.getMaxScore());
                bestPerformance.put("percentage", bestTest.getPercentage());
                bestPerformance.put("grade", bestTest.getGrade());
                bestPerformance.put("testDate", bestTest.getTestDate());
                report.put("bestPerformance", bestPerformance);
            }
            
            if (worstTest != null) {
                Map<String, Object> worstPerformance = new HashMap<>();
                worstPerformance.put("subject", worstTest.getSubject());
                worstPerformance.put("score", worstTest.getScore());
                worstPerformance.put("maxScore", worstTest.getMaxScore());
                worstPerformance.put("percentage", worstTest.getPercentage());
                worstPerformance.put("grade", worstTest.getGrade());
                worstPerformance.put("testDate", worstTest.getTestDate());
                report.put("worstPerformance", worstPerformance);
            }
            
            // Subject-wise Performance
            report.put("subjectWisePerformance", subjectPerformance);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to generate student report: " + e.getMessage());
        }
    }
    
    // Helper method to get grade from percentage
    private String getGradeFromPercentage(double percentage) {
        if (percentage >= 90) return "A";
        else if (percentage >= 80) return "B";
        else if (percentage >= 70) return "C";
        else if (percentage >= 60) return "D";
        else return "F";
    }

    @PutMapping("/students/{studentId}/marks/{markId}")
    public ResponseEntity<?> editTestResult(
            @PathVariable Long studentId,
            @PathVariable Long markId,
            @RequestBody Map<String, Object> testResultRequest) {
        
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
            
            // Find student by ID
            Optional<Student> studentOptional = studentRepository.findById(studentId);
            
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
            }
            
            Student student = studentOptional.get();
            
            // Check if student belongs to this teacher
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only edit marks for your own students.");
            }
            
            // Find the test result by ID
            Optional<TestResult> testResultOptional = testResultRepository.findById(markId);
            
            if (testResultOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Test result not found");
            }
            
            TestResult testResult = testResultOptional.get();
            
            // Verify the test result belongs to the specified student
            if (!testResult.getStudent().getId().equals(studentId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Test result does not belong to the specified student");
            }
            
            // Extract and validate test result data
            String subject = (String) testResultRequest.get("subject");
            Object scoreObj = testResultRequest.get("score");
            Object maxScoreObj = testResultRequest.get("maxScore");
            String testDateStr = (String) testResultRequest.get("testDate");
            
            // Use existing values if not provided
            if (subject == null) {
                subject = testResult.getSubject();
            }
            if (scoreObj == null) {
                scoreObj = testResult.getScore();
            }
            if (maxScoreObj == null) {
                maxScoreObj = testResult.getMaxScore();
            }
            if (testDateStr == null) {
                testDateStr = testResult.getTestDate().toString();
            }
            
            // Validate required fields
            if (subject.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Subject cannot be empty");
            }
            
            // Parse and validate numeric values
            Double score;
            Double maxScore;
            LocalDate testDate;
            
            try {
                // Handle different number types (Integer, Double, String)
                if (scoreObj instanceof Number) {
                    score = ((Number) scoreObj).doubleValue();
                } else {
                    score = Double.parseDouble(scoreObj.toString());
                }
                
                if (maxScoreObj instanceof Number) {
                    maxScore = ((Number) maxScoreObj).doubleValue();
                } else {
                    maxScore = Double.parseDouble(maxScoreObj.toString());
                }
                
                testDate = LocalDate.parse(testDateStr);
                
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid number format for score or maxScore");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Use YYYY-MM-DD format");
            }
            
            // Validate score values
            if (score < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Score cannot be negative");
            }
            
            if (maxScore <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Max score must be greater than 0");
            }
            
            if (score > maxScore) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Score cannot be greater than max score");
            }
            
            // Validate test date (not in the future)
            if (testDate.isAfter(LocalDate.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Test date cannot be in the future");
            }
            
            // Update test result
            testResult.setSubject(subject.trim());
            testResult.setScore(score);
            testResult.setMaxScore(maxScore);
            testResult.setTestDate(testDate);
            
            // Save updated test result
            TestResult updatedTestResult = testResultRepository.save(testResult);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedTestResult.getId());
            response.put("subject", updatedTestResult.getSubject());
            response.put("score", updatedTestResult.getScore());
            response.put("maxScore", updatedTestResult.getMaxScore());
            response.put("testDate", updatedTestResult.getTestDate());
            response.put("percentage", updatedTestResult.getPercentage());
            response.put("grade", updatedTestResult.getGrade());
            response.put("passed", updatedTestResult.isPassed());
            response.put("studentName", student.getName());
            response.put("studentEmail", student.getEmail());
            response.put("teacherName", teacher.getName());
            response.put("message", "Test result updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update test result: " + e.getMessage());
        }
    }

    @DeleteMapping("/students/{studentId}/marks/{markId}")
    public ResponseEntity<?> deleteTestResult(
            @PathVariable Long studentId,
            @PathVariable Long markId) {
        
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
            
            // Find student by ID
            Optional<Student> studentOptional = studentRepository.findById(studentId);
            
            if (studentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
            }
            
            Student student = studentOptional.get();
            
            // Check if student belongs to this teacher
            if (!student.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. You can only delete marks for your own students.");
            }
            
            // Find the test result by ID
            Optional<TestResult> testResultOptional = testResultRepository.findById(markId);
            
            if (testResultOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Test result not found");
            }
            
            TestResult testResult = testResultOptional.get();
            
            // Verify the test result belongs to the specified student
            if (!testResult.getStudent().getId().equals(studentId)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Test result does not belong to the specified student");
            }
            
            // Store details for response before deletion
            String deletedSubject = testResult.getSubject();
            Double deletedScore = testResult.getScore();
            Double deletedMaxScore = testResult.getMaxScore();
            LocalDate deletedTestDate = testResult.getTestDate();
            
            // Delete test result
            testResultRepository.delete(testResult);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test result deleted successfully");
            response.put("deletedTestResult", Map.of(
                "id", markId,
                "subject", deletedSubject,
                "score", deletedScore,
                "maxScore", deletedMaxScore,
                "testDate", deletedTestDate,
                "studentName", student.getName(),
                "teacherName", teacher.getName()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to delete test result: " + e.getMessage());
        }
    }
}
