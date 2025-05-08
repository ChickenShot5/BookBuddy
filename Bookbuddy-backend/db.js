const Database = require("better-sqlite3");
const db = new Database("books.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

db.exec(`
  DROP TABLE IF EXISTS books;

  CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL
  );
`);

module.exports = db;
