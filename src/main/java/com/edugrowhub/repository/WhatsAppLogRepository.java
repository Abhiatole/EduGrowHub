package com.edugrowhub.repository;

import com.edugrowhub.entity.WhatsAppLog;
import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for WhatsApp Log operations
 * 
 * This repository provides data access methods for WhatsApp message logs,
 * including CRUD operations and custom query methods for analytics and reporting.
 * 
 * Key features:
 * - Basic CRUD operations via JpaRepository
 * - Custom queries for filtering and analytics
 * - Methods for tracking message delivery status
 * - Support for audit and compliance reporting
 * 
 * @author EduGrowHub Development Team
 * @version 1.0
 */
@Repository
public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {

    /**
     * Find all WhatsApp logs for a specific student
     * 
     * @param student The student entity
     * @return List of WhatsApp logs for the student, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByStudentOrderBySentAtDesc(Student student);

    /**
     * Find all WhatsApp logs for a specific student by student ID
     * 
     * @param studentId The student ID
     * @return List of WhatsApp logs for the student, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByStudent_IdOrderBySentAtDesc(Long studentId);

    /**
     * Find all WhatsApp logs sent by a specific teacher
     * 
     * @param teacher The teacher entity
     * @return List of WhatsApp logs sent by the teacher, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByTeacherOrderBySentAtDesc(User teacher);

    /**
     * Find all WhatsApp logs sent by a specific teacher by teacher ID
     * 
     * @param teacherId The teacher ID
     * @return List of WhatsApp logs sent by the teacher, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByTeacher_IdOrderBySentAtDesc(Long teacherId);

    /**
     * Find all WhatsApp logs by message status
     * 
     * @param messageStatus The message status (e.g., SENT, FAILED, PENDING)
     * @return List of WhatsApp logs with the specified status, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByMessageStatusOrderBySentAtDesc(String messageStatus);

    /**
     * Find all WhatsApp logs by message type
     * 
     * @param messageType The message type (e.g., TEST_RESULT, ENROLLMENT_CONFIRMATION)
     * @return List of WhatsApp logs with the specified type, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByMessageTypeOrderBySentAtDesc(String messageType);

    /**
     * Find all WhatsApp logs to a specific phone number
     * 
     * @param recipientPhone The recipient phone number
     * @return List of WhatsApp logs sent to the phone number, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findByRecipientPhoneOrderBySentAtDesc(String recipientPhone);

    /**
     * Find WhatsApp log by Twilio Message SID
     * 
     * @param twilioMessageSid The Twilio message SID
     * @return Optional WhatsApp log with the specified Twilio SID
     */
    Optional<WhatsAppLog> findByTwilioMessageSid(String twilioMessageSid);

    /**
     * Find all WhatsApp logs within a date range
     * 
     * @param startDate Start date and time
     * @param endDate End date and time
     * @return List of WhatsApp logs within the date range, ordered by sent timestamp descending
     */
    List<WhatsAppLog> findBySentAtBetweenOrderBySentAtDesc(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find recent WhatsApp logs for a student (last 30 days)
     * 
     * @param studentId The student ID
     * @param sinceDate Date from which to fetch logs
     * @return List of recent WhatsApp logs for the student
     */
    @Query("SELECT w FROM WhatsAppLog w WHERE w.student.id = :studentId AND w.sentAt >= :sinceDate ORDER BY w.sentAt DESC")
    List<WhatsAppLog> findRecentLogsByStudent(@Param("studentId") Long studentId, @Param("sinceDate") LocalDateTime sinceDate);

    /**
     * Count total messages sent by a teacher
     * 
     * @param teacherId The teacher ID
     * @return Total count of messages sent by the teacher
     */
    @Query("SELECT COUNT(w) FROM WhatsAppLog w WHERE w.teacher.id = :teacherId")
    Long countMessagesByTeacher(@Param("teacherId") Long teacherId);

    /**
     * Count messages by status for a specific teacher
     * 
     * @param teacherId The teacher ID
     * @param messageStatus The message status
     * @return Count of messages with the specified status sent by the teacher
     */
    @Query("SELECT COUNT(w) FROM WhatsAppLog w WHERE w.teacher.id = :teacherId AND w.messageStatus = :messageStatus")
    Long countMessagesByTeacherAndStatus(@Param("teacherId") Long teacherId, @Param("messageStatus") String messageStatus);

    /**
     * Find failed messages that need retry
     * 
     * @param sinceDate Date from which to check for failed messages
     * @return List of failed WhatsApp logs since the specified date
     */
    @Query("SELECT w FROM WhatsAppLog w WHERE w.messageStatus = 'FAILED' AND w.sentAt >= :sinceDate ORDER BY w.sentAt DESC")
    List<WhatsAppLog> findFailedMessagesSince(@Param("sinceDate") LocalDateTime sinceDate);

    /**
     * Get message statistics for a teacher
     * 
     * @param teacherId The teacher ID
     * @return List of objects containing message status and count
     */
    @Query("SELECT w.messageStatus, COUNT(w) FROM WhatsAppLog w WHERE w.teacher.id = :teacherId GROUP BY w.messageStatus")
    List<Object[]> getMessageStatisticsByTeacher(@Param("teacherId") Long teacherId);

    /**
     * Get message statistics by message type for a teacher
     * 
     * @param teacherId The teacher ID
     * @param startDate Start date for statistics
     * @param endDate End date for statistics
     * @return List of objects containing message type and count
     */
    @Query("SELECT w.messageType, COUNT(w) FROM WhatsAppLog w WHERE w.teacher.id = :teacherId AND w.sentAt BETWEEN :startDate AND :endDate GROUP BY w.messageType")
    List<Object[]> getMessageTypeStatisticsByTeacher(@Param("teacherId") Long teacherId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * Check if a message was recently sent to avoid duplicates
     * 
     * @param recipientPhone The recipient phone number
     * @param messageType The message type
     * @param sinceMinutes Minutes to look back for duplicate messages
     * @return true if a similar message was recently sent, false otherwise
     */
    @Query("SELECT COUNT(w) > 0 FROM WhatsAppLog w WHERE w.recipientPhone = :recipientPhone AND w.messageType = :messageType AND w.sentAt >= :sinceTime")
    boolean wasRecentlySent(@Param("recipientPhone") String recipientPhone, 
                           @Param("messageType") String messageType, 
                           @Param("sinceTime") LocalDateTime sinceTime);

    /**
     * Find the most recent successful message to a phone number
     * 
     * @param recipientPhone The recipient phone number
     * @return Optional of the most recent successful WhatsApp log to the phone number
     */
    @Query("SELECT w FROM WhatsAppLog w WHERE w.recipientPhone = :recipientPhone AND w.messageStatus IN ('SENT', 'DELIVERED') ORDER BY w.sentAt DESC")
    Optional<WhatsAppLog> findMostRecentSuccessfulMessage(@Param("recipientPhone") String recipientPhone);
}
