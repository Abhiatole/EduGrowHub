package com.edugrowhub.repository;

import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    // Find all test results for a specific student
    List<TestResult> findByStudent(Student student);
    
    // Find all test results for a specific student ID
    List<TestResult> findByStudentId(Long studentId);
    
    // Find test results by subject
    List<TestResult> findBySubject(String subject);
    
    // Find test results by subject and student
    List<TestResult> findBySubjectAndStudent(String subject, Student student);
    
    // Find test results by subject and student ID
    List<TestResult> findBySubjectAndStudentId(String subject, Long studentId);
    
    // Find test results by test date
    List<TestResult> findByTestDate(LocalDate testDate);
    
    // Find test results after a specific date
    List<TestResult> findByTestDateAfter(LocalDate date);
    
    // Find test results before a specific date
    List<TestResult> findByTestDateBefore(LocalDate date);
    
    // Find test results between two dates
    List<TestResult> findByTestDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find test results by student and date range
    List<TestResult> findByStudentAndTestDateBetween(Student student, LocalDate startDate, LocalDate endDate);
    
    // Find test results by score range
    List<TestResult> findByScoreBetween(Double minScore, Double maxScore);
    
    // Find test results by student ordered by test date descending (latest first)
    List<TestResult> findByStudentOrderByTestDateDesc(Student student);
    
    // Find test results by student ID ordered by test date descending
    List<TestResult> findByStudentIdOrderByTestDateDesc(Long studentId);
    
    // Find latest test result for a student in a specific subject
    Optional<TestResult> findFirstByStudentAndSubjectOrderByTestDateDesc(Student student, String subject);
    
    // Count test results by student
    long countByStudent(Student student);
    
    // Count test results by student ID
    long countByStudentId(Long studentId);
    
    // Count test results by subject
    long countBySubject(String subject);
    
    // Custom query to find students with passing grades (>= 60%)
    @Query("SELECT tr FROM TestResult tr WHERE (tr.score / tr.maxScore) * 100 >= :passingPercentage")
    List<TestResult> findPassingResults(@Param("passingPercentage") Double passingPercentage);
    
    // Custom query to find failing results
    @Query("SELECT tr FROM TestResult tr WHERE (tr.score / tr.maxScore) * 100 < :passingPercentage")
    List<TestResult> findFailingResults(@Param("passingPercentage") Double passingPercentage);
    
    // Custom query to calculate average score for a student
    @Query("SELECT AVG(tr.score) FROM TestResult tr WHERE tr.student = :student")
    Double findAverageScoreByStudent(@Param("student") Student student);
    
    // Custom query to calculate average score for a student by subject
    @Query("SELECT AVG(tr.score) FROM TestResult tr WHERE tr.student = :student AND tr.subject = :subject")
    Double findAverageScoreByStudentAndSubject(@Param("student") Student student, @Param("subject") String subject);
    
    // Custom query to find highest score for a student
    @Query("SELECT MAX(tr.score) FROM TestResult tr WHERE tr.student = :student")
    Double findHighestScoreByStudent(@Param("student") Student student);
    
    // Custom query to find lowest score for a student
    @Query("SELECT MIN(tr.score) FROM TestResult tr WHERE tr.student = :student")
    Double findLowestScoreByStudent(@Param("student") Student student);
    
    // Custom query to find test results with student and teacher details
    @Query("SELECT tr FROM TestResult tr JOIN FETCH tr.student s JOIN FETCH s.teacher WHERE s.teacher.id = :teacherId")
    List<TestResult> findTestResultsByTeacherId(@Param("teacherId") Long teacherId);
    
    // Custom query to find test results by teacher email
    @Query("SELECT tr FROM TestResult tr JOIN tr.student s WHERE s.teacher.email = :teacherEmail")
    List<TestResult> findTestResultsByTeacherEmail(@Param("teacherEmail") String teacherEmail);
    
    // Custom query to find recent test results (last 30 days)
    @Query("SELECT tr FROM TestResult tr WHERE tr.testDate >= :date ORDER BY tr.testDate DESC")
    List<TestResult> findRecentTestResults(@Param("date") LocalDate date);
    
    // Custom query to get subject-wise performance for a student
    @Query("SELECT tr.subject, AVG(tr.score), AVG((tr.score / tr.maxScore) * 100) FROM TestResult tr WHERE tr.student = :student GROUP BY tr.subject")
    List<Object[]> findSubjectWisePerformanceByStudent(@Param("student") Student student);
}
