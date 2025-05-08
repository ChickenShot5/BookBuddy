const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    .run(username, hashedPassword);

  res
    .status(201)
    .json({ message: "User created", userId: result.lastInsertRowid });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (!user)
    return res.status(400).json({ error: "Invalid username or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ error: "Invalid username or password" });

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    "secret_key",
    { expiresIn: "1h" }
  );
  res.json({ token });
});

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ error: "Access denied, token missing" });

  try {
    const decoded = jwt.verify(token, "secret_key");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

app.get("/api/books", (req, res) => {
  const books = db
    .prepare("SELECT id, title, author, description, content FROM books")
    .all();
  res.json(books);
});

app.get("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

app.post("/api/books", authenticate, (req, res) => {
  const { title, author, description, content } = req.body;
  const userId = req.user.userId;

  if (!title || !author || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(`
    INSERT INTO books (user_id, title, author, description, content)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, title, author, description, content);
  const newBook = db
    .prepare("SELECT * FROM books WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(newBook);
});

app.put("/api/books/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { title, author, description, content } = req.body;

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.user_id !== req.user.userId)
    return res.status(403).json({ error: "Forbidden" });

  db.prepare(
    `
    UPDATE books SET title = ?, author = ?, description = ?, content = ?
    WHERE id = ?
  `
  ).run(title, author, description, content, id);

  const updatedBook = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  res.json(updatedBook);
});

app.delete("/api/books/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);

  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.user_id !== req.user.userId)
    return res.status(403).json({ error: "Forbidden" });

  db.prepare("DELETE FROM books WHERE id = ?").run(id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
