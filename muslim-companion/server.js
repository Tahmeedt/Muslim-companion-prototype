const bcrypt = require("bcrypt");
const db = require("./database/db");
const express = require("express");
const app = express();

const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Muslim Companion server is running");
});

app.post("/api/signup", (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.json({ message: "All fields required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, email, hashedPassword], function (err) {
        if (err) {
            return res.json({ message: "Email already exists" });
        }

        res.json({ message: "Account created" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api", (req, res) => {
    res.json({
        app: "Muslim Companion",
        status: "running",
        time: new Date()
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;

    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.json({ message: "Server error" });
        }

        if (!user) {
            return res.json({ message: "User not found" });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            return res.json({ message: "Incorrect password" });
        }

        // DEBUG (VERY IMPORTANT)
        console.log("USER FROM DB:", user);

        res.json({
            message: "Login successful",
            userId: user.id,
            email: user.email,
            name: user.name
        });
    });
});

app.get("/api/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            console.log("DB READ ERROR:", err.message);
            return res.json({ error: err.message });
        }

        console.log("USERS:", rows);
        res.json(rows);
    });
});