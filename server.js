const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Add your MySQL password here
    database: 'pet_shelter_system'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Module 1: Pet Management & Adoptions
// Pet CRUD operations
app.get('/api/pets', (req, res) => {
    const query = 'SELECT * FROM pets ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching pets' });
        res.json(results);
    });
});

app.post('/api/pets', authenticateToken, (req, res) => {
    const { name, species, breed, age, gender, status, description, image_url } = req.body;
    const query = 'INSERT INTO pets (name, species, breed, age, gender, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, species, breed, age, gender, status, description, image_url], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating pet' });
        res.status(201).json({ id: result.insertId, message: 'Pet created successfully' });
    });
});

// Adoption process
app.post('/api/adoptions', (req, res) => {
    const { pet_id, adopter_name, adopter_email, adopter_phone, address } = req.body;
    const query = 'INSERT INTO adoptions (pet_id, adopter_name, adopter_email, adopter_phone, address) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [pet_id, adopter_name, adopter_email, adopter_phone, address], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error processing adoption' });
        res.status(201).json({ id: result.insertId, message: 'Adoption request submitted' });
    });
});

// Module 2: Donations & Funding Allocation
app.post('/api/donors', (req, res) => {
    const { name, email, phone, address } = req.body;
    const query = 'INSERT INTO donors (name, email, phone, address) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, phone, address], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error registering donor' });
        res.status(201).json({ id: result.insertId, message: 'Donor registered successfully' });
    });
});

app.post('/api/donations', (req, res) => {
    const { donor_id, amount, purpose, message } = req.body;
    const query = 'INSERT INTO donations (donor_id, amount, purpose, message) VALUES (?, ?, ?, ?)';
    db.query(query, [donor_id, amount, purpose, message], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error processing donation' });
        res.status(201).json({ id: result.insertId, message: 'Donation processed successfully' });
    });
});

// Module 3: Events & Vaccination Scheduling
app.get('/api/events', (req, res) => {
    const query = 'SELECT * FROM events ORDER BY event_date ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching events' });
        res.json(results);
    });
});

app.post('/api/events', authenticateToken, (req, res) => {
    const { title, description, event_date, event_time, location, max_participants } = req.body;
    const query = 'INSERT INTO events (title, description, event_date, event_time, location, max_participants) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, event_date, event_time, location, max_participants], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating event' });
        res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
    });
});

// Module 4: Inventory & Feedback System
app.get('/api/inventory', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM inventory ORDER BY item_name ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching inventory' });
        res.json(results);
    });
});

app.post('/api/inventory', authenticateToken, (req, res) => {
    const { item_name, category, quantity, unit, min_quantity } = req.body;
    const query = 'INSERT INTO inventory (item_name, category, quantity, unit, min_quantity) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [item_name, category, quantity, unit, min_quantity], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error adding inventory item' });
        res.status(201).json({ id: result.insertId, message: 'Inventory item added successfully' });
    });
});

app.post('/api/feedback', (req, res) => {
    const { name, email, subject, message, rating } = req.body;
    const query = 'INSERT INTO feedback (name, email, subject, message, rating) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, subject, message, rating], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error submitting feedback' });
        res.status(201).json({ id: result.insertId, message: 'Feedback submitted successfully' });
    });
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM admins WHERE username = ?';
    
    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error during login' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const admin = results[0];
        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
        res.json({ token, role: admin.role });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
}); 