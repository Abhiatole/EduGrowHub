package com.edugrowhub.repository;

import com.edugrowhub.entity.Student;
import com.edugrowhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Find student by email
    Optional<Student> findByEmail(String email);
    
    // Find all students enrolled by a specific teacher
    List<Student> findByTeacher(User teacher);
    
    // Find all students enrolled by a specific teacher ID
    List<Student> findByTeacherId(Long teacherId);
    
    // Find students by name containing (case insensitive)
    List<Student> findByNameContainingIgnoreCase(String name);
    
    // Find students enrolled after a specific date
    List<Student> findByEnrolledDateAfter(LocalDateTime date);
    
    // Find students enrolled between two dates
    List<Student> findByEnrolledDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Check if student email already exists
    boolean existsByEmail(String email);
    
    // Count students by teacher
    long countByTeacher(User teacher);
    
    // Count students by teacher ID
    long countByTeacherId(Long teacherId);
    
    // Custom query to find students with teacher details
    @Query("SELECT s FROM Student s JOIN FETCH s.teacher WHERE s.teacher.id = :teacherId")
    List<Student> findStudentsWithTeacherByTeacherId(@Param("teacherId") Long teacherId);
    
    // Find students by teacher email
    @Query("SELECT s FROM Student s WHERE s.teacher.email = :teacherEmail")
    List<Student> findByTeacherEmail(@Param("teacherEmail") String teacherEmail);
}
