CREATE DATABASE IF NOT EXISTS pets;
USE pets;

CREATE TABLE IF NOT EXISTS adoption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    adopter_name VARCHAR(100) NOT NULL,
    adopter_contact VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    adoption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
INSERT INTO pets (name, breed, age, description, availability_status)
VALUES 
  ('Buddy', 'Golden Retriever', 2, 'Friendly and energetic dog', 'Available'),
  ('Luna', 'Siamese Cat', 1, 'Graceful and affectionate', 'Pending'),
  ('Max', 'German Shepherd', 3, 'Loyal and protective', 'Available');