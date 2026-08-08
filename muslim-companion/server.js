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
            console.log("SIGNUP ERROR:", err.message);

            if (err.message.includes("UNIQUE constraint failed")) {
                return res.json({ message: "Email already exists" });
            }

            return res.json({ message: "Account creation failed" });
        }

        const userId = this.lastID;

        // Create default settings for the new user
        db.run(
            `
            INSERT INTO user_settings (user_id)
            VALUES (?)
            `,
            [userId],
            (settingsErr) => {

                if (settingsErr) {
                    console.log("SETTINGS ERROR:", settingsErr.message);
                }
            }
        );

        res.json({
            message: "Account created",
            userId: userId
        });
    });
});

app.get("/api", (req, res) => {
    res.json({
        app: "Muslim Companion",
        status: "running",
        time: new Date()
    });
});

app.get("/api/user/:id", (req, res) => {

    console.log("USER ROUTE HIT");

    const userId = req.params.id;

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE id = ?
    `;

    db.get(sql, [userId], (err, user) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.json(user);

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

app.get("/api/settings/:id", (req, res) => {

    console.log("SETTINGS ROUTE HIT");
    console.log("User ID:", req.params.id);

    db.get(
        "SELECT * FROM user_settings WHERE user_id = ?",
        [req.params.id],
        (err, settings) => {

            if (err) {
                console.log("DB ERROR:", err);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            console.log("SETTINGS:", settings);

            if (!settings) {
                return res.status(404).json({
                    message: "Settings not found"
                });
            }

            return res.json(settings);

        }
    );

});

app.post("/api/change-password", (req, res) => {

    const { id, currentPassword, newPassword } = req.body;


    const sql = `
        SELECT password
        FROM users
        WHERE id = ?
    `;


    db.get(sql, [id], (err, user) => {

        if (err) {
            return res.json({
                message: "Database error"
            });
        }


        if (!user) {
            return res.json({
                message: "User not found"
            });
        }


        const passwordMatch = bcrypt.compareSync(
            currentPassword,
            user.password
        );


        if (!passwordMatch) {
            return res.json({
                message: "Current password incorrect"
            });
        }


        const hashedPassword = bcrypt.hashSync(newPassword, 10);


        db.run(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id],
            function (err) {

                if (err) {
                    return res.json({
                        message: "Password update failed"
                    });
                }


                res.json({
                    message: "Password updated"
                });

            }
        );

    });

});


app.post("/api/change-name", (req, res) => {

    const { id, name } = req.body;

    if (!name || name.trim() === "") {
        return res.json({
            message: "Name cannot be empty"
        });
    }

    db.run(
        "UPDATE users SET name = ? WHERE id = ?",
        [name.trim(), id],
        function (err) {

            if (err) {
                return res.json({
                    message: "Failed to update name"
                });
            }

            res.json({
                message: "Name updated"
            });

        }
    );

});

app.post("/api/change-email", (req, res) => {

    const { id, email } = req.body;

    if (!email || email.trim() === "") {
        return res.json({
            message: "Email cannot be empty"
        });
    }

    db.run(
        "UPDATE users SET email = ? WHERE id = ?",
        [email.trim(), id],
        function (err) {

            if (err) {
                return res.json({
                    message: "Email already exists"
                });
            }

            res.json({
                message: "Email updated"
            });

        }
    );

});

app.post("/api/change-language", (req, res) => {

    const { id, language } = req.body;

    if (!id || !language) {
        return res.json({
            message: "User ID and language are required"
        });
    }

    // Check if settings already exist
    db.get(
        "SELECT * FROM user_settings WHERE user_id = ?",
        [id],
        (err, settings) => {

            if (err) {
                console.log("SETTINGS CHECK ERROR:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            // If settings don't exist, create them
            if (!settings) {

                db.run(
                    `
                    INSERT INTO user_settings (user_id, language)
                    VALUES (?, ?)
                    `,
                    [id, language],
                    function (insertErr) {

                        if (insertErr) {

                            console.log(
                                "SETTINGS CREATE ERROR:",
                                insertErr
                            );

                            return res.status(500).json({
                                message: "Could not create settings"
                            });
                        }

                        console.log(
                            "Settings created for user:",
                            id
                        );

                        return res.json({
                            message: "Language updated"
                        });
                    }
                );

                return;
            }

            // Settings already exist, so update them
            db.run(
                `
                UPDATE user_settings
                SET language = ?
                WHERE user_id = ?
                `,
                [language, id],
                function (updateErr) {

                    if (updateErr) {

                        console.log(
                            "LANGUAGE UPDATE ERROR:",
                            updateErr
                        );

                        return res.status(500).json({
                            message: "Database error"
                        });
                    }

                    return res.json({
                        message: "Language updated"
                    });
                }
            );

        }
    );

});

console.log("USER ROUTE LOADED");
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});