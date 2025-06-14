-- EduGrowHub Database Schema
-- This script creates the necessary tables for the application
-- Note: With JPA hibernate.ddl-auto=update, tables will be auto-created
-- This script is provided for manual database setup if needed

-- Create database (run separately if needed)
-- CREATE DATABASE IF NOT EXISTS edugrowhub;
-- USE edugrowhub;

-- Students table (enhanced with password for authentication)
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_student_email (email),
    INDEX idx_student_phone (phone_number)
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_teacher_email (email)
);

-- SuperAdmins table
CREATE TABLE IF NOT EXISTS super_admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_superadmin_email (email)
);

-- Test Results table
CREATE TABLE IF NOT EXISTS test_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    test_date DATE NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    
    INDEX idx_test_student (student_id),
    INDEX idx_test_teacher (teacher_id),
    INDEX idx_test_date (test_date),
    INDEX idx_test_subject (subject)
);

-- WhatsApp Logs table (for tracking all WhatsApp communications)
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    message_sid VARCHAR(100),
    message_type VARCHAR(50) NOT NULL DEFAULT 'notification',
    student_id BIGINT,
    teacher_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    metadata JSON,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    
    INDEX idx_whatsapp_phone (phone_number),
    INDEX idx_whatsapp_status (status),
    INDEX idx_whatsapp_student (student_id),
    INDEX idx_whatsapp_teacher (teacher_id),
    INDEX idx_whatsapp_created (created_at),
    INDEX idx_whatsapp_type (message_type)
);

-- Sample data for testing (optional)
-- Note: Uncomment below for development setup with sample data

/*
-- Sample SuperAdmin (password: admin123)
INSERT IGNORE INTO super_admins (name, email, password) VALUES 
('System Admin', 'admin@edugrowhub.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lbESZa3/5DcJdx7/y');

-- Sample Teacher (password: teacher123)
INSERT IGNORE INTO teachers (name, email, password, phone_number) VALUES 
('John Doe', 'john.doe@edugrowhub.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lbESZa3/5DcJdx7/y', '+1234567890');

-- Sample Student (password: student123)
INSERT IGNORE INTO students (name, email, password, phone_number) VALUES 
('Jane Smith', 'jane.smith@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lbESZa3/5DcJdx7/y', '+1234567891');
*/
