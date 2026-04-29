const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json()); 
app.use(express.static('todoapp')); 

const db = new sqlite3.Database('./todo.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aufgabe TEXT,
        beschreibung TEXT,
        datum TEXT,
        status TEXT,
        erledigt INTEGER
    )`);
});

app.get('/api/todos', (req, res) => {
    const sql = "SELECT * FROM todos";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/todos', (req, res) => {
    const { aufgabe, beschreibung, datum, status, erledigt } = req.body;
    const sql = `INSERT INTO todos (aufgabe, beschreibung, datum, status, erledigt) VALUES (?, ?, ?, ?, ?)`;
    const params = [aufgabe, beschreibung, datum, status, erledigt ? 1 : 0];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, status: "ok" });
    });
}); 
app.delete('/api/todos/:id', (req, res) => {
    const id = req.params.id; 
    const sql = "DELETE FROM todos WHERE id = ?";

    db.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Gelöscht", changes: this.changes });
    });
}); 
app.put('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    const { aufgabe, beschreibung, datum, status, erledigt } = req.body;
    const erledigtValue = (erledigt === true || erledigt === 1) ? 1 : 0;

    const sql = `UPDATE todos SET aufgabe = ?, beschreibung = ?, datum = ?, status = ?, erledigt = ? WHERE id = ?`;
    const params = [aufgabe, beschreibung, datum, status, erledigtValue, id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json({ message: "Updated", id: id });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});