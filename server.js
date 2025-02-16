const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS for frontend-backend communication
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./school.db", (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Create tasks table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        setDate TEXT NOT NULL,
        score TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0
    )
`);

// API to get all tasks
app.get("/tasks", (req, res) => {
    const sql = "SELECT * FROM tasks";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tasks: rows });
    });
});

// API to add a new task
app.post("/tasks", (req, res) => {
    const { task, dueDate, setDate, score } = req.body;
    const sql = "INSERT INTO tasks (task, dueDate, setDate, score) VALUES (?, ?, ?, ?)";
    db.run(sql, [task, dueDate, setDate, score], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// API to mark a task as completed
app.put("/tasks/:id/complete", (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE tasks SET completed = 1 WHERE id = ?";
    db.run(sql, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Task marked as completed" });
    });
});

// API to get all completed tasks (scores)
app.get("/scores", (req, res) => {
    const sql = "SELECT task, score FROM tasks WHERE completed = 1";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ scores: rows });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});