const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

const app = express();

// ------------------ DATABASE CONNECTION ------------------

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petAdpt'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

app.use(cors());
app.use(express.json());

// ------------------ PETS APIs ------------------

app.get('/pets', (req, res) => {
    db.query('SELECT * FROM pets', (err, results) => {
        if (err) {
            console.error('Error fetching pets:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/pets', (req, res) => {
    const { name, breed, age, description, availability_status } = req.body;

    if (!name || !breed || !age) {
        return res.status(400).json({ message: 'Name, breed, and age are required' });
    }

    const sql = 'INSERT INTO pets (name, breed, age, description, availability_status) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, breed, age, description, availability_status || 'Available'], (err, result) => {
        if (err) {
            console.error('Error inserting pet:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'Pet added successfully', petId: result.insertId });
    });
});

app.put('/pets/:id', (req, res) => {
    const { id } = req.params;
    const { name, breed, age, description, availability_status } = req.body;

    const sql = `
        UPDATE pets
        SET name = ?, breed = ?, age = ?, description = ?, availability_status = ?
        WHERE id = ?
    `;
    db.query(sql, [name, breed, age, description, availability_status, id], (err, result) => {
        if (err) {
            console.error('Error updating pet:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Pet updated successfully' });
    });
});

app.delete('/pets/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM pets WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting pet:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Pet deleted successfully' });
    });
});

// ------------------ ADOPTIONS API ------------------

app.post('/adoptions', (req, res) => {
    const { pet_id, adopter_name, adopter_contact } = req.body;

    console.log('📥 Incoming adoption request body:', req.body);

    // Check required fields
    if (!pet_id || !adopter_name || !adopter_contact) {
        console.warn('⚠️ Missing fields:', { pet_id, adopter_name, adopter_contact });
        return res.status(400).json({ message: 'Pet ID, adopter name, and contact are required' });
    }

    // INSERT into adoption table
    const insertAdoption = `
        INSERT INTO adoption (pet_id, adopter_name, adopter_contact, status)
        VALUES (?, ?, ?, 'Pending')
    `;

    db.query(insertAdoption, [pet_id, adopter_name, adopter_contact], (err, result) => {
        if (err) {
            console.error('❌ MySQL INSERT error:', err);
            return res.status(500).json({ message: 'Database error', sqlError: err.message });
        }

        console.log('✅ Adoption inserted. ID:', result.insertId);
        res.status(201).json({ message: 'Adoption stored', adoptionId: result.insertId });
    });
});

// ------------------ MEDICAL RECORDS APIs ------------------

app.post('/medical-records', (req, res) => {
    const { pet_id, treatment_date, description, vet_name } = req.body;

    if (!pet_id || !treatment_date || !description || !vet_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
        INSERT INTO medical_records (pet_id, treatment_date, description, vet_name)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [pet_id, treatment_date, description, vet_name], (err, result) => {
        if (err) {
            console.error('Error inserting medical record:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'Medical record added successfully', recordId: result.insertId });
    });
});

app.put('/medical-records/:id', (req, res) => {
    const { id } = req.params;
    const { treatment_date, description, vet_name } = req.body;

    if (!treatment_date || !description || !vet_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = `
        UPDATE medical_records
        SET treatment_date = ?, description = ?, vet_name = ?
        WHERE id = ?
    `;

    db.query(sql, [treatment_date, description, vet_name, id], (err, result) => {
        if (err) {
            console.error('Error updating medical record:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Medical record updated successfully' });
    });
});

// ------------------ SERVER START ------------------

const PORT = 5000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});
