// Required modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taskdb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['token'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, 'secretkey');
        return res.json({ token });
    }
    res.sendStatus(403);
});



// Routes
app.get('/tasks', authenticateToken, (req, res) => {
    db.query('SELECT * FROM tasks where is_active = 1 and is_delete = 0', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/tasks', authenticateToken, (req, res) => {
    const { title, description } = req.body;
    db.query('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, title, description });
    });
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
    const { title, description } = req.body;
    db.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(204);
    });
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
    // soft delete approach
    db.query('UPDATE tasks SET is_active = 0, is_delete = 1 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(204);
    });
});



if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export app for testing
module.exports = app;
