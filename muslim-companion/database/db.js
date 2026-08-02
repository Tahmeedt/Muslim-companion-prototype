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

            FOREIGN KEY (user_id) REFERENCES users(id)
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