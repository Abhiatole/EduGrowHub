package com.edugrowhub.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * WhatsApp Log Entity
 * 
 * This entity represents a log entry for WhatsApp messages sent through the application.
 * It tracks all outgoing WhatsApp messages for auditing, debugging, and analytics purposes.
 * 
 * Key features:
 * - Logs all WhatsApp message attempts (both successful and failed)
 * - Tracks message metadata including recipient, content, and delivery status
 * - Provides audit trail for compliance and troubleshooting
 * - Links messages to specific students for better tracking
 * 
 * @author EduGrowHub Development Team
 * @version 1.0
 */
@Entity
@Table(name = "whatsapp_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppLog {

    /**
     * Primary key for the WhatsApp log entry
     * Auto-generated using database identity strategy
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Phone number of the message recipient
     * Stored in international format (e.g., +1234567890)
     * 
     * Required field with maximum length of 20 characters
     */
    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    /**
     * Content of the WhatsApp message that was sent
     * Stored as TEXT to accommodate longer messages
     * 
     * Required field for tracking message content
     */
    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    /**
     * Status of the message delivery
     * Possible values: SENT, FAILED, PENDING, DELIVERED, READ
     * 
     * Required field with maximum length of 20 characters
     */
    @Column(name = "message_status", nullable = false, length = 20)
    private String messageStatus;

    /**
     * Twilio Message SID (unique identifier from Twilio)
     * Used for tracking message status and troubleshooting
     * 
     * Optional field as it may not be available for failed messages
     */
    @Column(name = "twilio_message_sid", length = 50)
    private String twilioMessageSid;

    /**
     * Type of message being sent
     * e.g., "TEST_RESULT", "ENROLLMENT_CONFIRMATION", "REMINDER", etc.
     * 
     * Required field with maximum length of 50 characters
     */
    @Column(name = "message_type", nullable = false, length = 50)
    private String messageType;

    /**
     * Reference to the student associated with this message
     * 
     * Many-to-One relationship with Student entity
     * Optional as some messages might not be student-specific
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", foreignKey = @ForeignKey(name = "fk_whatsapp_log_student"))
    private Student student;

    /**
     * Reference to the teacher who triggered this message
     * 
     * Many-to-One relationship with User entity (teacher)
     * Optional as some messages might be system-generated
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", foreignKey = @ForeignKey(name = "fk_whatsapp_log_teacher"))
    private User teacher;

    /**
     * Timestamp when the message was sent
     * Automatically set to current time when the log is created
     * 
     * Used for auditing and analytics
     */
    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    /**
     * Error message if the WhatsApp message failed to send
     * Stores the error details for troubleshooting
     * 
     * Optional field, only populated when messageStatus is FAILED
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * Additional metadata about the message
     * Stored as JSON string for flexibility
     * e.g., {"test_id": 123, "subject": "Mathematics"}
     * 
     * Optional field for storing contextual information
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    /**
     * Constructor for creating a WhatsApp log entry
     * 
     * @param recipientPhone Phone number of the recipient
     * @param messageContent Content of the message
     * @param messageStatus Status of the message
     * @param messageType Type of message
     * @param student Student associated with the message (optional)
     * @param teacher Teacher who triggered the message (optional)
     */
    public WhatsAppLog(String recipientPhone, String messageContent, String messageStatus, 
                       String messageType, Student student, User teacher) {
        this.recipientPhone = recipientPhone;
        this.messageContent = messageContent;
        this.messageStatus = messageStatus;
        this.messageType = messageType;
        this.student = student;
        this.teacher = teacher;
        this.sentAt = LocalDateTime.now();
    }

    /**
     * Constructor for creating a WhatsApp log entry with Twilio SID
     * 
     * @param recipientPhone Phone number of the recipient
     * @param messageContent Content of the message
     * @param messageStatus Status of the message
     * @param twilioMessageSid Twilio message SID
     * @param messageType Type of message
     * @param student Student associated with the message (optional)
     * @param teacher Teacher who triggered the message (optional)
     */
    public WhatsAppLog(String recipientPhone, String messageContent, String messageStatus, 
                       String twilioMessageSid, String messageType, Student student, User teacher) {
        this(recipientPhone, messageContent, messageStatus, messageType, student, teacher);
        this.twilioMessageSid = twilioMessageSid;
    }

    /**
     * Pre-persist callback to set the sent timestamp
     * Ensures sentAt is always set when the entity is saved
     */
    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    /**
     * Check if the message was successfully sent
     * 
     * @return true if message status is SENT or DELIVERED, false otherwise
     */
    public boolean isSuccessful() {
        return "SENT".equals(messageStatus) || "DELIVERED".equals(messageStatus);
    }

    /**
     * Check if the message failed to send
     * 
     * @return true if message status is FAILED, false otherwise
     */
    public boolean isFailed() {
        return "FAILED".equals(messageStatus);
    }

    /**
     * Get a masked version of the recipient phone number for logging
     * 
     * @return Masked phone number (e.g., +91***1234)
     */
    public String getMaskedRecipientPhone() {
        if (recipientPhone == null || recipientPhone.length() < 6) {
            return "***";
        }
        
        String countryCode = recipientPhone.substring(0, 3);
        String lastDigits = recipientPhone.substring(recipientPhone.length() - 4);
        
        return countryCode + "***" + lastDigits;
    }
}
