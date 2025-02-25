const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE students (studentID TEXT, name TEXT, sex TEXT, birthDate TEXT)");
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/add-student', (req, res) => {
    const { studentID, name, sex, birthDate } = req.body;
    db.run("INSERT INTO students (studentID, name, sex, birthDate) VALUES (?, ?, ?, ?)", [studentID, name, sex, birthDate], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Student added successfully');
    });
});

app.get('/students', (req, res) => {
    db.all("SELECT * FROM students ORDER BY studentID", [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

app.post('/delete-student', (req, res) => {
    const { studentID } = req.body;
    db.run("DELETE FROM students WHERE studentID = ?", [studentID], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Student deleted successfully');
    });
});

app.post('/edit-student', (req, res) => {
    const { studentID, name, sex, birthDate } = req.body;
    db.run("UPDATE students SET name = ?, sex = ?, birthDate = ? WHERE studentID = ?", [name, sex, birthDate, studentID], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Student updated successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});