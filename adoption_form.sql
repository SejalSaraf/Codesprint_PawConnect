CREATE TABLE IF NOT EXISTS adoption_form (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT,
    adopter_name VARCHAR(100) NOT NULL,
    adopter_contact VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
);
