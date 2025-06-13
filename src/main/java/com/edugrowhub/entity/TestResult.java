package com.edugrowhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "test_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false)
    private Double score;
    
    @Column(nullable = false)
    private Double maxScore;
    
    @Column(nullable = false)
    private LocalDate testDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    // Constructor without id (for creating new test results)
    public TestResult(String subject, Double score, Double maxScore, LocalDate testDate, Student student) {
        this.subject = subject;
        this.score = score;
        this.maxScore = maxScore;
        this.testDate = testDate;
        this.student = student;
    }
    
    // Calculated property for percentage
    @Transient
    public Double getPercentage() {
        if (maxScore != null && maxScore > 0) {
            return (score / maxScore) * 100;
        }
        return 0.0;
    }
    
    // Calculated property for grade
    @Transient
    public String getGrade() {
        Double percentage = getPercentage();
        if (percentage >= 90) return "A";
        else if (percentage >= 80) return "B";
        else if (percentage >= 70) return "C";
        else if (percentage >= 60) return "D";
        else return "F";
    }
    
    // Calculated property for pass status
    @Transient
    public Boolean isPassed() {
        return getPercentage() >= 60; // Assuming 60% is passing grade
    }
}
