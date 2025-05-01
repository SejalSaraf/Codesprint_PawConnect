const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const bodyParser = require("body-parser")

const app = express()
const port = 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Database connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Tanvimulik@1978",
  database: "shelter_inventory",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create inventory table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        low_stock_threshold INT NOT NULL DEFAULT 5,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create feedback table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        category VARCHAR(100),
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        message TEXT NOT NULL,
        submitted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    connection.release()
    console.log("Database tables initialized")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Initialize database on startup
initializeDatabase()

// API Routes

// Inventory Routes
app.get("/api/inventory", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inventory ORDER BY updated_at DESC")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    res.status(500).json({ error: "Failed to fetch inventory" })
  }
})

app.get("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query("SELECT * FROM inventory WHERE id = ?", [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    res.status(500).json({ error: "Failed to fetch inventory item" })
  }
})

app.post("/api/inventory", async (req, res) => {
  try {
    const { item_name, category, quantity, unit, low_stock_threshold, notes } = req.body

    const [result] = await pool.query(
      "INSERT INTO inventory (item_name, category, quantity, unit, low_stock_threshold, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [item_name, category, quantity, unit, low_stock_threshold, notes],
    )

    const [rows] = await pool.query("SELECT * FROM inventory WHERE id = ?", [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error creating inventory item:", error)
    res.status(500).json({ error: "Failed to create inventory item" })
  }
})

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { item_name, category, quantity, unit, low_stock_threshold, notes } = req.body

    const [result] = await pool.query(
      "UPDATE inventory SET item_name = ?, category = ?, quantity = ?, unit = ?, low_stock_threshold = ?, notes = ? WHERE id = ?",
      [item_name, category, quantity, unit, low_stock_threshold, notes, id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" })
    }

    const [rows] = await pool.query("SELECT * FROM inventory WHERE id = ?", [id])
    res.json(rows[0])
  } catch (error) {
    console.error("Error updating inventory item:", error)
    res.status(500).json({ error: "Failed to update inventory item" })
  }
})

app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query("DELETE FROM inventory WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" })
    }

    res.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    res.status(500).json({ error: "Failed to delete inventory item" })
  }
})

app.get("/api/inventory/low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM inventory WHERE quantity <= low_stock_threshold ORDER BY quantity ASC",
    )
    res.json(rows)
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    res.status(500).json({ error: "Failed to fetch low stock items" })
  }
})

app.get("/api/inventory/category", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity FROM inventory GROUP BY category ORDER BY category",
    )
    res.json(rows)
  } catch (error) {
    console.error("Error fetching inventory by category:", error)
    res.status(500).json({ error: "Failed to fetch inventory by category" })
  }
})

// Feedback Routes
app.get("/api/feedback", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM feedback ORDER BY submitted_on DESC")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    res.status(500).json({ error: "Failed to fetch feedback" })
  }
})

app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, category, rating, message } = req.body

    const [result] = await pool.query(
      "INSERT INTO feedback (name, email, category, rating, message) VALUES (?, ?, ?, ?, ?)",
      [name, email, category, rating, message],
    )

    const [rows] = await pool.query("SELECT * FROM feedback WHERE id = ?", [result.insertId])
    res.status(201).json(rows[0])
  } catch (error) {
    console.error("Error creating feedback:", error)
    res.status(500).json({ error: "Failed to create feedback" })
  }
})

app.get("/api/feedback/analytics", async (req, res) => {
  try {
    // Get total feedback count
    const [totalResult] = await pool.query("SELECT COUNT(*) as total_feedback FROM feedback")
    const totalFeedback = totalResult[0].total_feedback

    // Get average rating
    const [avgResult] = await pool.query("SELECT AVG(rating) as average_rating FROM feedback")
    const averageRating = Number.parseFloat(avgResult[0].average_rating) || 0

    // Get positive feedback count (rating >= 4)
    const [positiveResult] = await pool.query("SELECT COUNT(*) as positive_feedback FROM feedback WHERE rating >= 4")
    const positiveFeedback = positiveResult[0].positive_feedback

    res.json({
      total_feedback: totalFeedback,
      average_rating: averageRating,
      positive_feedback: positiveFeedback,
    })
  } catch (error) {
    console.error("Error fetching feedback analytics:", error)
    res.status(500).json({ error: "Failed to fetch feedback analytics" })
  }
})

// Fix for the low-stock route conflict (specific routes should come before parameterized routes)
app.get("/api/inventory-low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM inventory WHERE quantity <= low_stock_threshold ORDER BY quantity ASC",
    )
    res.json(rows)
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    res.status(500).json({ error: "Failed to fetch low stock items" })
  }
})

// Fix for the category route conflict
app.get("/api/inventory-category", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity FROM inventory GROUP BY category ORDER BY category",
    )
    res.json(rows)
  } catch (error) {
    console.error("Error fetching inventory by category:", error)
    res.status(500).json({ error: "Failed to fetch inventory by category" })
  }
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
