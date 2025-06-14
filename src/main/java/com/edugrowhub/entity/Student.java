package com.edugrowhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
      @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "password")
    private String password;
    
    @Column(nullable = false)
    private LocalDateTime enrolledDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;
    
    // One student can have many test results
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestResult> testResults = new ArrayList<>();
      // Constructor without id (for creating new students)
    public Student(String name, String email, String phoneNumber, LocalDateTime enrolledDate, User teacher) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.enrolledDate = enrolledDate;
        this.teacher = teacher;
    }
}
