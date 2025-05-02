const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'donation_system'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// JWT authentication middleware
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

// -------- Adoption Form Submission Route --------
app.post('/api/adoption_form', (req, res) => {
    const { adopter_name, adopter_contact, pet_id } = req.body;

    if (!adopter_name || !adopter_contact) {
        return res.status(400).json({ message: 'Name and contact required' });
    }

    const sql = `
        INSERT INTO adoption_form
        (pet_id, adopter_name, adopter_contact, status)
        VALUES (?, ?, ?, 'Pending')
    `;

    db.query(sql, [pet_id || null, adopter_name, adopter_contact], (err, result) => {
        if (err) {
            console.error('❌ Error inserting adoption form:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({ message: 'Application submitted', id: result.insertId });
    });
});

// -------- Pet Management APIs --------
app.get('/api/pets', (req, res) => {
    db.query('SELECT * FROM pets ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching pets' });
        res.json(results);
    });
});

app.post('/api/pets', authenticateToken, (req, res) => {
    const { name, species, breed, age, gender, status, description, image_url } = req.body;
    db.query(
        'INSERT INTO pets (name, species, breed, age, gender, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, species, breed, age, gender, status, description, image_url],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error creating pet' });
            res.status(201).json({ id: result.insertId, message: 'Pet created successfully' });
        }
    );
});

// -------- Adoptions --------
app.post('/adoptions', (req, res) => {
    const { adopter_name, adopter_email, adopter_phone, adopter_address, preferred_pet_name } = req.body;

    if (!adopter_name || !adopter_email || !adopter_phone || !adopter_address) {
        return res.status(400).json({ message: 'All adopter details are required' });
    }

    const sql = `
        INSERT INTO adoption_applications 
        (adopter_name, adopter_email, adopter_phone, adopter_address, preferred_pet_name) 
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [adopter_name, adopter_email, adopter_phone, adopter_address, preferred_pet_name || null], (err, result) => {
        if (err) {
            console.error('Error inserting application:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({ message: 'Adoption application submitted', applicationId: result.insertId });
    });
});


// -------- Donations --------

app.post('/donate', (req, res) => {
    const { name, email, phone, amount, purpose, message } = req.body;
  
    if (!name || !email || !phone || !amount || !purpose) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
  
    const sql = `
      INSERT INTO donations (name, email, phone, amount, purpose, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(sql, [name, email, phone, amount, purpose, message || null], (err, result) => {
      if (err) {
        console.error('❌ Error inserting donation:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      res.status(201).json({ message: 'Donation recorded successfully', donationId: result.insertId });
    });
  });
  
  

// -------- Events --------
app.get('/api/events', (req, res) => {
    db.query('SELECT * FROM events ORDER BY event_date ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching events' });
        res.json(results);
    });
});

app.post('/api/events', authenticateToken, (req, res) => {
    const { title, description, event_date, event_time, location, max_participants } = req.body;
    db.query(
        'INSERT INTO events (title, description, event_date, event_time, location, max_participants) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, event_date, event_time, location, max_participants],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error creating event' });
            res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
        }
    );
});

// -------- Inventory --------
app.get('/api/inventory', authenticateToken, (req, res) => {
    db.query('SELECT * FROM inventory ORDER BY item_name ASC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching inventory' });
        res.json(results);
    });
});

app.post('/api/inventory', authenticateToken, (req, res) => {
    const { item_name, category, quantity, unit, min_quantity } = req.body;
    db.query(
        'INSERT INTO inventory (item_name, category, quantity, unit, min_quantity) VALUES (?, ?, ?, ?, ?)',
        [item_name, category, quantity, unit, min_quantity],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error adding inventory item' });
            res.status(201).json({ id: result.insertId, message: 'Inventory item added successfully' });
        }
    );
});

// -------- Feedback --------
app.post('/api/feedback', (req, res) => {
    const { name, email, subject, message, rating } = req.body;
    db.query(
        'INSERT INTO feedback (name, email, subject, message, rating) VALUES (?, ?, ?, ?, ?)',
        [name, email, subject, message, rating],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error submitting feedback' });
            res.status(201).json({ id: result.insertId, message: 'Feedback submitted successfully' });
        }
    );
});

// -------- Admin Login --------
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error during login' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const admin = results[0];
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
        res.json({ token, role: admin.role });
    });
});

// -------- Serve Frontend --------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------- Start Server --------
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
