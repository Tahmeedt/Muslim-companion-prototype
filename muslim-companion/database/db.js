const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create / open database file
const db = new sqlite3.Database(
    path.join(__dirname, "app.db")
);

// Create users table if it doesn't exist
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    language TEXT DEFAULT 'English',
    text_size TEXT DEFAULT 'Medium',
    animations INTEGER DEFAULT 1,
    auto_save INTEGER DEFAULT 1,
    education_level TEXT DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
)
    `);

    db.run(`
    ALTER TABLE user_settings
    ADD COLUMN education_level TEXT DEFAULT NULL
`, (err) => {

        if (err && !err.message.includes("duplicate column name")) {
            console.log("EDUCATION LEVEL COLUMN ERROR:", err.message);
        }

    });

    db.run(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        lesson_number INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, course_id, lesson_number),

        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);

    db.run(`
    CREATE TABLE IF NOT EXISTS quiz_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        lesson_number INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        UNIQUE(user_id, course_id, lesson_number)
    )
`);

    db.run(`
    CREATE TABLE IF NOT EXISTS course_final_quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, course_id),

        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);

});

// Test connection
db.get("SELECT 1", (err) => {
    if (err) {
        console.log("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Database connected successfully");
    }
});

module.exports = db;