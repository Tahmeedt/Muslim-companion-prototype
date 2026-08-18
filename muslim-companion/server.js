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

app.post("/api/education-level", (req, res) => {

    const { id, level } = req.body;

    if (!id || !level) {
        return res.json({
            message: "User ID and level are required"
        });
    }

    const allowedLevels = [
        "Beginner",
        "Intermediate",
        "Advanced"
    ];

    if (!allowedLevels.includes(level)) {
        return res.json({
            message: "Invalid education level"
        });
    }

    db.get(
        "SELECT * FROM user_settings WHERE user_id = ?",
        [id],
        (err, settings) => {

            if (err) {
                console.log("EDUCATION LEVEL CHECK ERROR:", err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            // Create settings if they don't exist
            if (!settings) {

                db.run(
                    `
                    INSERT INTO user_settings
                    (user_id, education_level)
                    VALUES (?, ?)
                    `,
                    [id, level],
                    function (insertErr) {

                        if (insertErr) {
                            console.log(
                                "EDUCATION LEVEL CREATE ERROR:",
                                insertErr
                            );

                            return res.status(500).json({
                                message: "Could not save education level"
                            });
                        }

                        return res.json({
                            message: "Education level saved",
                            level: level
                        });
                    }
                );

                return;
            }

            // Settings already exist
            db.run(
                `
                UPDATE user_settings
                SET education_level = ?
                WHERE user_id = ?
                `,
                [level, id],
                function (updateErr) {

                    if (updateErr) {
                        console.log(
                            "EDUCATION LEVEL UPDATE ERROR:",
                            updateErr
                        );

                        return res.status(500).json({
                            message: "Could not save education level"
                        });
                    }

                    return res.json({
                        message: "Education level saved",
                        level: level
                    });

                }
            );

        }
    );

});

app.get("/api/education-level/:id", (req, res) => {

    const userId = req.params.id;

    db.get(
        `
        SELECT education_level
        FROM user_settings
        WHERE user_id = ?
        `,
        [userId],
        (err, settings) => {

            if (err) {
                console.log(
                    "EDUCATION LEVEL READ ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (!settings) {
                return res.json({
                    level: null
                });
            }

            return res.json({
                level: settings.education_level
            });

        }
    );

});

// ==========================================
// COMPLETE LESSON
// ==========================================

app.post("/api/lesson-complete", (req, res) => {

    const {
        userId,
        courseId,
        lessonNumber
    } = req.body;

    if (!userId || !courseId || !lessonNumber) {
        return res.status(400).json({
            error: "Missing lesson information"
        });
    }

    const sql = `
        INSERT INTO lesson_progress
        (user_id, course_id, lesson_number, completed)
        VALUES (?, ?, ?, 1)

        ON CONFLICT(user_id, course_id, lesson_number)
        DO UPDATE SET
            completed = 1,
            completed_at = CURRENT_TIMESTAMP
    `;

    db.run(
        sql,
        [
            userId,
            courseId,
            lessonNumber
        ],
        function (err) {

            if (err) {

                console.error(
                    "Error saving lesson progress:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to save lesson progress"
                });

            }

            res.json({
                success: true,
                message: "Lesson completed"
            });

        }
    );

});

// ==========================================
// GET COURSE PROGRESS
// ==========================================

app.get("/api/course-progress/:userId/:courseId", (req, res) => {

    const { userId, courseId } = req.params;

    const sql = `
        SELECT lesson_number, completed
        FROM lesson_progress
        WHERE user_id = ?
        AND course_id = ?
        AND completed = 1
        ORDER BY lesson_number
    `;

    db.all(
        sql,
        [userId, courseId],
        (err, rows) => {

            if (err) {

                console.error(
                    "Error loading course progress:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to load course progress"
                });

            }

            res.json({
                completedLessons: rows.map(
                    row => row.lesson_number
                )
            });

        }
    );

});

// ==========================================
// GET SINGLE LESSON PROGRESS
// ==========================================

app.get("/api/lesson-progress/:userId/:courseId/:lessonNumber", (req, res) => {

    const {
        userId,
        courseId,
        lessonNumber
    } = req.params;

    const sql = `
        SELECT completed
        FROM lesson_progress
        WHERE user_id = ?
        AND course_id = ?
        AND lesson_number = ?
        AND completed = 1
    `;

    db.get(
        sql,
        [userId, courseId, lessonNumber],
        (err, row) => {

            if (err) {

                console.error(
                    "Error loading lesson progress:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to load lesson progress"
                });

            }

            res.json({
                completed: !!row
            });

        }
    );

});

// ==========================================
// GET OVERALL EDUCATION PROGRESS
// ==========================================

app.get("/api/education-progress/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT COUNT(*) AS completedLessons
        FROM lesson_progress
        WHERE user_id = ?
        AND completed = 1
    `;

    db.get(sql, [userId], (err, row) => {

        if (err) {

            console.error(
                "Error loading education progress:",
                err
            );

            return res.status(500).json({
                error: "Failed to load education progress"
            });

        }

        res.json({
            completedLessons: row.completedLessons || 0
        });

    });

});

app.post("/api/quiz-complete", (req, res) => {

    const {
        userId,
        courseId,
        lessonNumber
    } = req.body;


    if (!userId || !courseId || !lessonNumber) {

        return res.status(400).json({
            message: "Missing required information"
        });

    }


    const sql = `
        INSERT INTO quiz_progress
        (user_id, course_id, lesson_number, completed)

        VALUES (?, ?, ?, 1)

        ON CONFLICT(user_id, course_id, lesson_number)

        DO UPDATE SET completed = 1
    `;


    db.run(
        sql,
        [
            userId,
            courseId,
            lessonNumber
        ],
        function (error) {

            if (error) {

                console.error(
                    "Error saving quiz progress:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to save quiz progress"
                });

            }


            res.json({
                message: "Quiz completed",
                completed: true
            });

        }
    );

});

app.post("/api/final-quiz-complete", (req, res) => {

    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({
            message: "Missing userId or courseId"
        });
    }

    db.run(
        `
        INSERT OR REPLACE INTO course_final_quizzes
        (user_id, course_id, completed)
        VALUES (?, ?, 1)
        `,
        [userId, courseId],
        function (err) {

            if (err) {

                console.error(
                    "Error saving final quiz:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to save final quiz"
                });

            }

            res.json({
                message: "Final quiz completed",
                completed: true
            });

        }
    );

});

// ==========================================
// GET FINAL QUIZ PROGRESS
// ==========================================

app.get("/api/final-quiz-progress/:userId/:courseId", (req, res) => {

    const {
        userId,
        courseId
    } = req.params;

    db.get(
        `
        SELECT completed, completed_at
        FROM course_final_quizzes
        WHERE user_id = ?
        AND course_id = ?
        AND completed = 1
        `,
        [
            userId,
            courseId
        ],
        (error, row) => {

            if (error) {

                console.error(
                    "Error loading final quiz progress:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to load final quiz progress"
                });

            }

            res.json({
                completed: !!row,
                completedAt: row ? row.completed_at : null
            });

        }
    );

});

// ==========================================
// GET FINAL COURSE QUIZ PROGRESS
// ==========================================

app.get("/api/final-quiz-progress/:userId/:courseId", (req, res) => {

    const { userId, courseId } = req.params;

    db.get(
        `
        SELECT completed
        FROM course_final_quizzes
        WHERE user_id = ?
        AND course_id = ?
        AND completed = 1
        `,
        [userId, courseId],
        (err, row) => {

            if (err) {

                console.error(
                    "Error loading final quiz progress:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to load final quiz progress"
                });

            }

            res.json({
                completed: !!row
            });

        }
    );

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

app.get("/api/quiz-progress/:userId/:courseId", (req, res) => {

    const {
        userId,
        courseId
    } = req.params;


    db.all(
        `
        SELECT lesson_number
        FROM quiz_progress
        WHERE user_id = ?
        AND course_id = ?
        AND completed = 1
        `,
        [
            userId,
            courseId
        ],
        (error, rows) => {

            if (error) {

                console.error(
                    "Error loading quiz progress:",
                    error
                );

                return res.status(500).json({
                    message: "Failed to load quiz progress"
                });

            }


            res.json({
                completedQuizzes:
                    rows.map(row => row.lesson_number)
            });

        }
    );

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