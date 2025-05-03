-- Create database if not exists
CREATE DATABASE IF NOT EXISTS events_db;
USE events_db;

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
);

-- Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_name VARCHAR(100) NOT NULL,
    vaccine_type ENUM('rabies', 'dhpp', 'bordetella', 'feline') NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pet_name (pet_name),
    INDEX idx_vaccination_date (vaccination_date),
    INDEX idx_next_due_date (next_due_date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('event', 'vaccination', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Notification recipients table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS notification_recipients (
    notification_id INT NOT NULL,
    recipient_type ENUM('staff', 'volunteers', 'adopters') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, recipient_type),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    INDEX idx_recipient_type (recipient_type)
);

-- Add triggers for data validation
DELIMITER //

-- Trigger to ensure next_due_date is after vaccination_date
CREATE TRIGGER before_vaccination_insert
BEFORE INSERT ON vaccinations
FOR EACH ROW
BEGIN
    IF NEW.next_due_date <= NEW.vaccination_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Next due date must be after vaccination date';
    END IF;
END//

-- Trigger to ensure event date is not in the past
CREATE TRIGGER before_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Event date cannot be in the past';
    END IF;
END//

DELIMITER ;