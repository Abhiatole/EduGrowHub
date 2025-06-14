package com.edugrowhub.service;

import com.edugrowhub.config.TwilioConfig;
import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.User;
import com.edugrowhub.entity.WhatsAppLog;
import com.edugrowhub.repository.WhatsAppLogRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * WhatsApp Service for sending messages via Twilio
 * 
 * This service handles all WhatsApp messaging functionality including:
 * - Sending WhatsApp messages to students and parents
 * - Logging all message attempts for audit purposes
 * - Handling message delivery status updates
 * - Providing templates for different message types
 * - Implementing retry logic for failed messages
 * 
 * Security and Best Practices:
 * - All messages are logged for compliance and debugging
 * - Phone numbers are validated before sending
 * - Duplicate message prevention
 * - Error handling and retry mechanisms
 * 
 * @author EduGrowHub Development Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WhatsAppService {

    private final TwilioConfig twilioConfig;
    private final WhatsAppLogRepository whatsAppLogRepository;

    // Message type constants
    public static final String MESSAGE_TYPE_TEST_RESULT = "TEST_RESULT";
    public static final String MESSAGE_TYPE_ENROLLMENT = "ENROLLMENT_CONFIRMATION";
    public static final String MESSAGE_TYPE_REMINDER = "REMINDER";
    public static final String MESSAGE_TYPE_ANNOUNCEMENT = "ANNOUNCEMENT";

    // Message status constants
    public static final String STATUS_SENT = "SENT";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_DELIVERED = "DELIVERED";

    /**
     * Send a test result notification to a student
     * 
     * @param student The student receiving the notification
     * @param teacher The teacher who added the test result
     * @param subject The subject of the test
     * @param score The score obtained
     * @param maxScore The maximum possible score
     * @param percentage The percentage achieved
     * @param grade The grade achieved
     * @return WhatsAppLog entry for the sent message
     */
    public WhatsAppLog sendTestResultNotification(Student student, User teacher, 
                                                  String subject, double score, double maxScore, 
                                                  double percentage, String grade) {
        
        // Validate input parameters
        if (student == null || student.getPhoneNumber() == null || student.getPhoneNumber().trim().isEmpty()) {
            log.warn("Cannot send test result notification: Student or phone number is null/empty");
            return logFailedMessage(null, "Student or phone number is null/empty", 
                                  MESSAGE_TYPE_TEST_RESULT, student, teacher);
        }

        // Create message content
        String messageContent = createTestResultMessage(student.getName(), subject, score, maxScore, percentage, grade);
        
        // Check for recent duplicate messages (within last 5 minutes)
        if (wasRecentlySent(student.getPhoneNumber(), MESSAGE_TYPE_TEST_RESULT, 5)) {
            log.info("Test result notification was recently sent to {}, skipping duplicate", 
                    maskPhoneNumber(student.getPhoneNumber()));
            return logFailedMessage(student.getPhoneNumber(), "Duplicate message prevented", 
                                  MESSAGE_TYPE_TEST_RESULT, student, teacher);
        }

        // Send the message
        return sendWhatsAppMessage(student.getPhoneNumber(), messageContent, MESSAGE_TYPE_TEST_RESULT, student, teacher);
    }

    /**
     * Send an enrollment confirmation to a student
     * 
     * @param student The newly enrolled student
     * @param teacher The teacher who enrolled the student
     * @return WhatsAppLog entry for the sent message
     */
    public WhatsAppLog sendEnrollmentConfirmation(Student student, User teacher) {
        
        if (student == null || student.getPhoneNumber() == null || student.getPhoneNumber().trim().isEmpty()) {
            log.warn("Cannot send enrollment confirmation: Student or phone number is null/empty");
            return logFailedMessage(null, "Student or phone number is null/empty", 
                                  MESSAGE_TYPE_ENROLLMENT, student, teacher);
        }

        String messageContent = createEnrollmentMessage(student.getName(), teacher.getName());
        return sendWhatsAppMessage(student.getPhoneNumber(), messageContent, MESSAGE_TYPE_ENROLLMENT, student, teacher);
    }

    /**
     * Send a generic WhatsApp message
     * 
     * @param phoneNumber The recipient's phone number (in international format)
     * @param messageContent The message content to send
     * @param messageType The type of message being sent
     * @param student The student associated with the message (optional)
     * @param teacher The teacher sending the message (optional)
     * @return WhatsAppLog entry for the sent message
     */
    public WhatsAppLog sendWhatsAppMessage(String phoneNumber, String messageContent, 
                                          String messageType, Student student, User teacher) {
        
        WhatsAppLog logEntry = null;
        
        try {
            // Validate phone number format
            String formattedPhone = formatPhoneNumber(phoneNumber);
            if (formattedPhone == null) {
                throw new IllegalArgumentException("Invalid phone number format: " + maskPhoneNumber(phoneNumber));
            }

            log.info("Sending WhatsApp message to {} (type: {})", maskPhoneNumber(formattedPhone), messageType);

            // Send message via Twilio
            Message message = Message.creator(
                    new PhoneNumber("whatsapp:" + formattedPhone),
                    new PhoneNumber("whatsapp:" + twilioConfig.getFromWhatsAppNumber()),
                    messageContent
            ).create();

            // Log successful message
            logEntry = new WhatsAppLog(
                    formattedPhone,
                    messageContent,
                    STATUS_SENT,
                    message.getSid(),
                    messageType,
                    student,
                    teacher
            );

            log.info("WhatsApp message sent successfully. Twilio SID: {}", message.getSid());

        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to {}: {}", 
                     maskPhoneNumber(phoneNumber), e.getMessage());
            
            // Log failed message
            logEntry = new WhatsAppLog(
                    phoneNumber,
                    messageContent,
                    STATUS_FAILED,
                    messageType,
                    student,
                    teacher
            );
            logEntry.setErrorMessage(e.getMessage());
        }

        // Save log entry to database
        return whatsAppLogRepository.save(logEntry);
    }

    /**
     * Create a formatted test result message
     * 
     * @param studentName Name of the student
     * @param subject Subject of the test
     * @param score Score obtained
     * @param maxScore Maximum possible score
     * @param percentage Percentage achieved
     * @param grade Grade achieved
     * @return Formatted message content
     */
    private String createTestResultMessage(String studentName, String subject, 
                                         double score, double maxScore, double percentage, String grade) {
        return String.format(
            "🎓 *EduGrowHub - Test Result*\n\n" +
            "Dear %s,\n\n" +
            "Your test result for *%s* is now available:\n\n" +
            "📊 Score: %.1f/%.1f\n" +
            "📈 Percentage: %.1f%%\n" +
            "🏆 Grade: %s\n" +
            "✅ Status: %s\n\n" +
            "Keep up the great work! 💪\n\n" +
            "Best regards,\n" +
            "EduGrowHub Team",
            studentName, subject, score, maxScore, percentage, grade,
            percentage >= 60 ? "PASSED" : "NEEDS IMPROVEMENT"
        );
    }

    /**
     * Create a formatted enrollment confirmation message
     * 
     * @param studentName Name of the student
     * @param teacherName Name of the teacher
     * @return Formatted message content
     */
    private String createEnrollmentMessage(String studentName, String teacherName) {
        return String.format(
            "🎉 *Welcome to EduGrowHub!*\n\n" +
            "Dear %s,\n\n" +
            "Congratulations! You have been successfully enrolled in our educational program.\n\n" +
            "👨‍🏫 Your Teacher: %s\n" +
            "📚 Platform: EduGrowHub\n" +
            "🗓️ Enrollment Date: %s\n\n" +
            "We're excited to have you on this learning journey!\n\n" +
            "Best regards,\n" +
            "EduGrowHub Team",
            studentName, teacherName, java.time.LocalDate.now().toString()
        );
    }

    /**
     * Format phone number to international format
     * 
     * @param phoneNumber The phone number to format
     * @return Formatted phone number or null if invalid
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return null;
        }

        // Remove all non-digit characters except '+'
        String cleaned = phoneNumber.replaceAll("[^\\d+]", "");

        // If it doesn't start with '+', assume it's an Indian number and add +91
        if (!cleaned.startsWith("+")) {
            if (cleaned.startsWith("91") && cleaned.length() == 12) {
                cleaned = "+" + cleaned;
            } else if (cleaned.length() == 10) {
                cleaned = "+91" + cleaned;
            } else {
                return null; // Invalid format
            }
        }

        // Validate minimum length (country code + number)
        if (cleaned.length() < 10) {
            return null;
        }

        return cleaned;
    }

    /**
     * Check if a message was recently sent to avoid duplicates
     * 
     * @param phoneNumber Recipient phone number
     * @param messageType Type of message
     * @param withinMinutes Minutes to look back
     * @return true if a similar message was recently sent
     */
    private boolean wasRecentlySent(String phoneNumber, String messageType, int withinMinutes) {
        LocalDateTime sinceTime = LocalDateTime.now().minusMinutes(withinMinutes);
        return whatsAppLogRepository.wasRecentlySent(phoneNumber, messageType, sinceTime);
    }

    /**
     * Log a failed message attempt
     * 
     * @param phoneNumber Recipient phone number
     * @param errorMessage Error message
     * @param messageType Type of message
     * @param student Student associated with the message
     * @param teacher Teacher associated with the message
     * @return WhatsAppLog entry for the failed message
     */
    private WhatsAppLog logFailedMessage(String phoneNumber, String errorMessage, 
                                       String messageType, Student student, User teacher) {
        WhatsAppLog logEntry = new WhatsAppLog(
                phoneNumber != null ? phoneNumber : "UNKNOWN",
                "Message content not available",
                STATUS_FAILED,
                messageType,
                student,
                teacher
        );
        logEntry.setErrorMessage(errorMessage);
        
        return whatsAppLogRepository.save(logEntry);
    }

    /**
     * Mask phone number for secure logging
     * 
     * @param phoneNumber Phone number to mask
     * @return Masked phone number
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 6) {
            return "***";
        }
        
        String start = phoneNumber.substring(0, 3);
        String end = phoneNumber.substring(phoneNumber.length() - 4);
        
        return start + "***" + end;
    }

    /**
     * Get message logs for a specific student
     * 
     * @param studentId Student ID
     * @return List of WhatsApp logs for the student
     */
    @Transactional(readOnly = true)
    public List<WhatsAppLog> getStudentMessageLogs(Long studentId) {
        return whatsAppLogRepository.findByStudent_IdOrderBySentAtDesc(studentId);
    }

    /**
     * Get message logs for a specific teacher
     * 
     * @param teacherId Teacher ID
     * @return List of WhatsApp logs sent by the teacher
     */
    @Transactional(readOnly = true)
    public List<WhatsAppLog> getTeacherMessageLogs(Long teacherId) {
        return whatsAppLogRepository.findByTeacher_IdOrderBySentAtDesc(teacherId);
    }

    /**
     * Get failed messages that might need retry
     * 
     * @param hoursBack Number of hours to look back for failed messages
     * @return List of failed WhatsApp logs
     */
    @Transactional(readOnly = true)
    public List<WhatsAppLog> getFailedMessages(int hoursBack) {
        LocalDateTime sinceDate = LocalDateTime.now().minusHours(hoursBack);
        return whatsAppLogRepository.findFailedMessagesSince(sinceDate);
    }

    /**
     * Retry sending a failed message
     * 
     * @param logId ID of the failed message log
     * @return New WhatsAppLog entry for the retry attempt
     */
    public WhatsAppLog retryFailedMessage(Long logId) {
        Optional<WhatsAppLog> originalLog = whatsAppLogRepository.findById(logId);
        
        if (originalLog.isEmpty()) {
            throw new IllegalArgumentException("WhatsApp log not found with ID: " + logId);
        }

        WhatsAppLog log = originalLog.get();
        
        if (!STATUS_FAILED.equals(log.getMessageStatus())) {
            throw new IllegalArgumentException("Only failed messages can be retried");
        }

        // Retry sending the message
        return sendWhatsAppMessage(
                log.getRecipientPhone(),
                log.getMessageContent(),
                log.getMessageType() + "_RETRY",
                log.getStudent(),
                log.getTeacher()
        );
    }
}
