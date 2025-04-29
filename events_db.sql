-- Create Database
CREATE DATABASE shelter_management;
USE shelter_management;

-- Events Table
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vaccinations Table
CREATE TABLE vaccinations (
    vaccination_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    vaccine_type ENUM('rabies', 'dhpp', 'bordetella', 'feline') NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    status ENUM('upcoming', 'completed', 'overdue') DEFAULT 'upcoming',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('event', 'vaccination', 'general') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('unread', 'read') DEFAULT 'unread'
);

-- Notification Recipients Table (Many-to-Many relationship)
CREATE TABLE notification_recipients (
    notification_id INT,
    recipient_type ENUM('staff', 'volunteers', 'adopters') NOT NULL,
    recipient_id INT NOT NULL,
    read_at TIMESTAMP NULL,
    PRIMARY KEY (notification_id, recipient_type, recipient_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id)
);

-- Pets Table (Referenced by Vaccinations)
CREATE TABLE pets (
    pet_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    species ENUM('dog', 'cat', 'other') NOT NULL,
    breed VARCHAR(50),
    age INT,
    gender ENUM('male', 'female', 'unknown') NOT NULL,
    status ENUM('available', 'adopted', 'medical') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Event Participants Table (Many-to-Many relationship)
CREATE TABLE event_participants (
    event_id INT,
    participant_type ENUM('staff', 'volunteer', 'adopter') NOT NULL,
    participant_id INT NOT NULL,
    status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
    PRIMARY KEY (event_id, participant_type, participant_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Insert Sample Data

-- Sample Events
INSERT INTO events (title, event_date, event_time, location, description, status) VALUES
('Adoption Drive', '2024-03-15', '10:00:00', 'Central Park', 'Join us for our monthly adoption drive! Meet our lovely pets and find your perfect companion.', 'upcoming'),
('Vaccination Clinic', '2024-03-20', '14:00:00', 'Shelter Medical Center', 'Free vaccination clinic for all adopted pets. Bring your pet''s medical records.', 'upcoming'),
('Volunteer Training', '2024-03-10', '09:00:00', 'Shelter Training Room', 'New volunteer orientation and training session. Learn about pet care and shelter operations.', 'completed');

-- Sample Pets
INSERT INTO pets (name, species, breed, age, gender, status) VALUES
('Max', 'dog', 'Golden Retriever', 2, 'male', 'available'),
('Luna', 'cat', 'Siamese', 1, 'female', 'available'),
('Rocky', 'dog', 'German Shepherd', 3, 'male', 'medical');

-- Sample Vaccinations
INSERT INTO vaccinations (pet_id, vaccine_type, vaccination_date, next_due_date, status) VALUES
(1, 'rabies', '2024-02-15', '2025-02-15', 'upcoming'),
(2, 'dhpp', '2024-01-20', '2024-07-20', 'upcoming'),
(3, 'bordetella', '2024-02-01', '2024-08-01', 'completed');

-- Sample Notifications
INSERT INTO notifications (type, title, message, status) VALUES
('event', 'Upcoming Adoption Drive', 'Don''t forget about our adoption drive this weekend! We have many pets looking for their forever homes.', 'unread'),
('vaccination', 'Vaccination Reminder', 'Max''s rabies vaccination is due next week. Please schedule an appointment.', 'read'),
('general', 'New Volunteer Orientation', 'Welcome to our new volunteers! Please attend the training session this Saturday.', 'unread');

-- Sample Notification Recipients
INSERT INTO notification_recipients (notification_id, recipient_type, recipient_id) VALUES
(1, 'staff', 1),
(1, 'volunteers', 1),
(2, 'staff', 1),
(3, 'volunteers', 1);

-- Sample Event Participants
INSERT INTO event_participants (event_id, participant_type, participant_id, status) VALUES
(1, 'staff', 1, 'registered'),
(1, 'volunteer', 1, 'registered'),
(2, 'staff', 1, 'registered'),
(3, 'volunteer', 1, 'attended');

-- Create Indexes for Better Performance
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_vaccinations_date ON vaccinations(vaccination_date);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_pets_status ON pets(status);

-- Create Views for Common Queries

-- Upcoming Events View
CREATE VIEW upcoming_events AS
SELECT * FROM events 
WHERE event_date >= CURDATE() 
AND status = 'upcoming'
ORDER BY event_date, event_time;

-- Due Vaccinations View
CREATE VIEW due_vaccinations AS
SELECT v.*, p.name as pet_name, p.species
FROM vaccinations v
JOIN pets p ON v.pet_id = p.pet_id
WHERE v.next_due_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
AND v.status = 'upcoming'
ORDER BY v.next_due_date;

-- Unread Notifications View
CREATE VIEW unread_notifications AS
SELECT n.*, GROUP_CONCAT(nr.recipient_type) as recipients
FROM notifications n
JOIN notification_recipients nr ON n.notification_id = nr.notification_id
WHERE n.status = 'unread'
GROUP BY n.notification_id
ORDER BY n.sent_at DESC; 