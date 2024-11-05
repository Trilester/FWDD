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

// Login route
app.post('/login', (req, res) => {
    const { emailOrUsername, password } = req.body;
    const sql = "SELECT * FROM User WHERE (email = ? OR username = ?) AND password = ?";
    
    db.query(sql, [emailOrUsername, emailOrUsername, password], (err, result) => {
        if (err) {
            console.error("Error querying database: ", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (result.length > 0) {
            const user = result[0];
            // Login successful, respond with the username
            res.status(200).json({ message: "Login successful", username: user.username });
        } else {
            // No user found with these credentials
            res.status(401).json({ error: "Invalid email/username or password" });
        }
    });
});

// Password reset route
app.post('/reset-password', (req, res) => {
    const { emailOrUsername, currentPassword, newPassword } = req.body;

    // Check if the user exists and the current password is correct
    const checkUserSql = "SELECT * FROM User WHERE (email = ? OR username = ?) AND password = ?";
    db.query(checkUserSql, [emailOrUsername, emailOrUsername, currentPassword], (err, result) => {
        if (err) {
            console.error("Error querying database: ", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (result.length === 0) {
            // No user found or incorrect current password
            return res.status(401).json({ error: "Invalid email/username or current password" });
        }

        // If user is found and current password is correct, proceed to update the password
        const updatePasswordSql = "UPDATE User SET password = ? WHERE (email = ? OR username = ?)";
        db.query(updatePasswordSql, [newPassword, emailOrUsername, emailOrUsername], (err, updateResult) => {
            if (err) {
                console.error("Error updating password: ", err);
                return res.status(500).json({ error: "Failed to update password" });
            }

            res.status(200).json({ message: "Password reset successful" });
        });
    });
});

// Fetch questions route
app.get('/Questions', (req, res) => {
    const sql = "SELECT * FROM Questions"; // Adjust this to match your table structure

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching questions: ", err);
            return res.status(500).json({ error: "Failed to fetch questions" });
        }
        res.status(200).json(results);
    });
});


app.listen(8081, () => {
    console.log("Server is running on http://localhost:8081");
});
