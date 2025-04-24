const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shelter_inventory'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Create tables if they don't exist
const createTables = `
    CREATE TABLE IF NOT EXISTS donors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donor_id INT,
        amount DECIMAL(10,2) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        message TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES donors(id)
    );

    CREATE TABLE IF NOT EXISTS fund_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT,
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES donations(id)
    );
`;

db.query(createTables, (err) => {
    if (err) {
        console.error('Error creating tables:', err);
    }
});

// Routes
// Create a new donor and donation
app.post('/api/donations', (req, res) => {
    const { name, email, phone, amount, purpose, message } = req.body;

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error starting transaction' });
        }

        // Insert donor
        const donorQuery = 'INSERT INTO donors (name, email, phone) VALUES (?, ?, ?)';
        db.query(donorQuery, [name, email, phone], (err, result) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: 'Error creating donor' });
            }

            const donorId = result.insertId;

            // Insert donation
            const donationQuery = 'INSERT INTO donations (donor_id, amount, purpose, message) VALUES (?, ?, ?, ?)';
            db.query(donationQuery, [donorId, amount, purpose, message], (err, result) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: 'Error creating donation' });
                }

                const donationId = result.insertId;

                // Allocate funds based on purpose
                const allocationQuery = 'INSERT INTO fund_allocations (donation_id, category, amount) VALUES (?, ?, ?)';
                db.query(allocationQuery, [donationId, purpose, amount], (err) => {
                    if (err) {
                        db.rollback();
                        return res.status(500).json({ error: 'Error allocating funds' });
                    }

                    // Commit transaction
                    db.commit((err) => {
                        if (err) {
                            db.rollback();
                            return res.status(500).json({ error: 'Error committing transaction' });
                        }

                        res.json({ 
                            message: 'Donation processed successfully',
                            donorId,
                            donationId
                        });
                    });
                });
            });
        });
    });
});

// Get all donors
app.get('/api/donors', (req, res) => {
    const query = `
        SELECT d.*, 
               COUNT(dn.id) as total_donations,
               SUM(dn.amount) as total_amount
        FROM donors d
        LEFT JOIN donations dn ON d.id = dn.donor_id
        GROUP BY d.id
        ORDER BY d.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching donors' });
        }
        res.json(results);
    });
});

// Get all donations
app.get('/api/donations', (req, res) => {
    const query = `
        SELECT dn.*, d.name, d.email, d.phone
        FROM donations dn
        JOIN donors d ON dn.donor_id = d.id
        ORDER BY dn.date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching donations' });
        }
        res.json(results);
    });
});

// Get fund allocations
app.get('/api/allocations', (req, res) => {
    const query = `
        SELECT fa.*, dn.amount as total_amount, d.name as donor_name
        FROM fund_allocations fa
        JOIN donations dn ON fa.donation_id = dn.id
        JOIN donors d ON dn.donor_id = d.id
        ORDER BY fa.date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching allocations' });
        }
        res.json(results);
    });
});

// Get donation statistics
app.get('/api/statistics', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_donations,
            SUM(amount) as total_amount,
            purpose,
            COUNT(*) as purpose_count
        FROM donations
        GROUP BY purpose
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching statistics' });
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 