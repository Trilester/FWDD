const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password:'',
    database: 'minefinder'
});

// Test connection
db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Registration route
app.post('/register', (req, res) => {
    const { email, username, password } = req.body;
    const sql = "INSERT INTO User (email, username, password, total_points) VALUES (?, ?, ?, 0)"; // default total_points to 0

    db.query(sql, [email, username, password], (err, result) => {
        if (err) {
            console.error("Error inserting data: ", err);
            return res.status(500).json({ error: "Database insertion failed" });
        }
        res.status(200).json({ message: "User registered successfully" });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM User WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error("Error querying database: ", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        console.log("Query Result:", result); // Log the query result for debugging

        if (result.length > 0) {
            // User found, login successful
            res.status(200).json({ message: "Login successful" });
        } else {
            // No user found with these credentials
            res.status(401).json({ error: "Invalid email or password" });
        }
    });
});

app.listen(8081, () => {
    console.log("Server is running on http://localhost:8081");
});
