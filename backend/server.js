const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petAdpt'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(cors());
app.use(express.json());

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



app.get('/pets', (req, res) => {
    db.query('SELECT * FROM pets', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

const PORT = 5000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});
