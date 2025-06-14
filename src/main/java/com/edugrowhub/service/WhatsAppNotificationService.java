package com.edugrowhub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import lombok.RequiredArgsConstructor;

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhatsAppNotificationService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.from}")
    private String fromNumber;

    private final RestTemplate restTemplate;

    /**
     * Send a WhatsApp message using Twilio API
     */
    public boolean sendWhatsAppMessage(String toNumber, String message) {
        try {
            String url = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes()));

            // Prepare form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("To", "whatsapp:" + toNumber);
            formData.add("From", "whatsapp:" + fromNumber);
            formData.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formData, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            return response.getStatusCode() == HttpStatus.CREATED;
        } catch (Exception e) {
            System.err.println("Error sending WhatsApp message: " + e.getMessage());
            return false;
        }
    }

    /**
     * Send a WhatsApp message using Content Template
     */
    public boolean sendWhatsAppTemplate(String toNumber, String contentSid, Map<String, String> variables) {
        try {
            String url = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes()));

            // Prepare form data
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("To", "whatsapp:" + toNumber);
            formData.add("From", "whatsapp:" + fromNumber);
            formData.add("ContentSid", contentSid);
            
            // Convert variables map to JSON string
            if (variables != null && !variables.isEmpty()) {
                StringBuilder jsonBuilder = new StringBuilder("{");
                variables.forEach((key, value) -> {
                    if (jsonBuilder.length() > 1) jsonBuilder.append(",");
                    jsonBuilder.append("\"").append(key).append("\":\"").append(value).append("\"");
                });
                jsonBuilder.append("}");
                formData.add("ContentVariables", jsonBuilder.toString());
            }

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formData, headers);

            // Send request
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            return response.getStatusCode() == HttpStatus.CREATED;
        } catch (Exception e) {
            System.err.println("Error sending WhatsApp template: " + e.getMessage());
            return false;
        }
    }

    /**
     * Send student enrollment notification
     */
    public boolean notifyStudentEnrollment(String studentPhone, String studentName, String teacherName) {
        String message = String.format(
            "🎓 Welcome to EduGrowHub! \n\n" +
            "Hi %s,\n" +
            "You have been successfully enrolled under teacher %s.\n\n" +
            "You will receive notifications about your test results and academic progress.\n\n" +
            "Best regards,\n" +
            "EduGrowHub Team",
            studentName, teacherName
        );
        
        return sendWhatsAppMessage(studentPhone, message);
    }

    /**
     * Send test result notification
     */
    public boolean notifyTestResult(String studentPhone, String studentName, String subject, 
                                  double score, double maxScore, double percentage, String grade, boolean passed) {
        String status = passed ? "PASSED ✅" : "FAILED ❌";
        String message = String.format(
            "📊 Test Result Notification\n\n" +
            "Hi %s,\n\n" +
            "Your test result for %s:\n" +
            "📝 Score: %.1f/%.1f\n" +
            "📈 Percentage: %.1f%%\n" +
            "🏆 Grade: %s\n" +
            "📋 Status: %s\n\n" +
            "%s\n\n" +
            "Keep up the good work!\n" +
            "EduGrowHub Team",
            studentName, subject, score, maxScore, percentage, grade, status,
            passed ? "Congratulations on passing!" : "Don't worry, keep studying and you'll improve!"
        );
        
        return sendWhatsAppMessage(studentPhone, message);
    }

    /**
     * Send performance report notification
     */
    public boolean notifyPerformanceReport(String studentPhone, String studentName, int totalTests, 
                                         double averagePercentage, String overallGrade, int passedTests, int failedTests) {
        String message = String.format(
            "📈 Academic Performance Report\n\n" +
            "Hi %s,\n\n" +
            "Your academic performance summary:\n" +
            "📚 Total Tests: %d\n" +
            "📊 Average Score: %.1f%%\n" +
            "🏆 Overall Grade: %s\n" +
            "✅ Passed Tests: %d\n" +
            "❌ Failed Tests: %d\n\n" +
            "%s\n\n" +
            "Keep working hard!\n" +
            "EduGrowHub Team",
            studentName, totalTests, averagePercentage, overallGrade, passedTests, failedTests,
            averagePercentage >= 75 ? "Excellent performance! 🌟" : 
            averagePercentage >= 60 ? "Good work! Keep it up! 👍" : 
            "Focus on improvement. You can do it! 💪"
        );
        
        return sendWhatsAppMessage(studentPhone, message);
    }

    /**
     * Send teacher notification about student enrollment
     */
    public boolean notifyTeacherEnrollment(String teacherPhone, String teacherName, String studentName, String studentEmail) {
        String message = String.format(
            "👨‍🏫 New Student Enrollment\n\n" +
            "Hi %s,\n\n" +
            "A new student has been enrolled under your guidance:\n" +
            "👤 Student: %s\n" +
            "📧 Email: %s\n\n" +
            "You can now add test results and track their progress through the EduGrowHub dashboard.\n\n" +
            "Best regards,\n" +
            "EduGrowHub Team",
            teacherName, studentName, studentEmail
        );
        
        return sendWhatsAppMessage(teacherPhone, message);
    }

    /**
     * Send appointment reminder using template (matching your curl example)
     */
    public boolean sendAppointmentReminder(String toNumber, String date, String time) {
        String contentSid = "HXb5b62575e6e4ff6129ad7c8efe1f983e"; // Your template SID
        
        Map<String, String> variables = Map.of(
            "1", date,  // Date variable
            "2", time   // Time variable
        );
        
        return sendWhatsAppTemplate(toNumber, contentSid, variables);
    }
}
